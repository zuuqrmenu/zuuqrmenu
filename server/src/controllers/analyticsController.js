import mongoose from 'mongoose';
import Category from '../models/Category.js';
import MenuEvent from '../models/MenuEvent.js';
import MenuView from '../models/MenuView.js';
import Product from '../models/Product.js';
import Restaurant from '../models/Restaurant.js';
import { findPublicRestaurant } from '../utils/publicRestaurant.js';

const getRestaurantId = (req) => req.restaurant._id;
const validObjectId = (value) => value && mongoose.Types.ObjectId.isValid(value);

const parseRange = (req) => {
  const end = req.query.endDate ? new Date(`${req.query.endDate}T23:59:59.999Z`) : new Date();
  const start = req.query.startDate ? new Date(`${req.query.startDate}T00:00:00.000Z`) : new Date(end);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) return { error: 'Geçerli bir tarih aralığı seçin.' };
  const days = Math.floor((end - start) / 86400000) + 1;
  if (days > 90) return { error: 'En fazla 90 günlük veri görüntülenebilir.' };
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - days * 86400000 + 1);
  return { start, end, days, previousStart, previousEnd };
};

const dailySeries = (rows, start, days) => {
  const counts = new Map(rows.map((row) => [row._id, row.count]));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: counts.get(key) || 0 };
  });
};

const matchEvents = (restaurantId, start, end, extra = {}) => ({ restaurantId, eventAt: { $gte: start, $lte: end }, ...extra });
const matchViews = (restaurantId, start, end) => ({ restaurantId, viewedAt: { $gte: start, $lte: end } });

export const trackMenuEvent = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { eventType, productId, categoryId } = req.body;
    if (!['PRODUCT_VIEW', 'CATEGORY_VIEW', 'PRODUCT_CLICK'].includes(eventType)) return res.status(400).json({ error: 'Geçersiz etkileşim türü.' });
    const restaurant = await findPublicRestaurant(username, '_id');
    if (!restaurant) return res.status(404).json({ error: 'Menü bulunamadı.' });
    if (productId && !validObjectId(productId)) return res.status(400).json({ error: 'Geçersiz ürün.' });
    if (categoryId && !validObjectId(categoryId)) return res.status(400).json({ error: 'Geçersiz kategori.' });
    if (productId && !(await Product.exists({ _id: productId, restaurantId: restaurant._id }))) return res.status(404).json({ error: 'Ürün bulunamadı.' });
    if (categoryId && !(await Category.exists({ _id: categoryId, restaurantId: restaurant._id }))) return res.status(404).json({ error: 'Kategori bulunamadı.' });
    await MenuEvent.create({ restaurantId: restaurant._id, eventType, productId, categoryId });
    res.status(201).json({ tracked: true });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const range = parseRange(req);
    if (range.error) return res.status(400).json({ error: range.error });
    const { start, end, days, previousStart, previousEnd } = range;
    const restaurantId = getRestaurantId(req);
    const eventMatch = matchEvents(restaurantId, start, end);
    const viewMatch = matchViews(restaurantId, start, end);
    const previousViewMatch = matchViews(restaurantId, previousStart, previousEnd);
    const [views, previousViews, uniqueIps, dailyViews, dailyEvents, dailyCategoryEvents, productRows, categoryRows, busiestHours, eventHours, previousEvents] = await Promise.all([
      MenuView.countDocuments(viewMatch),
      MenuView.countDocuments(previousViewMatch),
      MenuView.distinct('ip', viewMatch),
      MenuView.aggregate([{ $match: viewMatch }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      MenuEvent.aggregate([{ $match: eventMatch }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$eventAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      MenuEvent.aggregate([{ $match: { ...eventMatch, eventType: 'CATEGORY_VIEW' } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$eventAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      MenuEvent.aggregate([{ $match: { ...eventMatch, eventType: 'PRODUCT_VIEW', productId: { $exists: true } } }, { $group: { _id: '$productId', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 50 }, { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } }, { $unwind: '$product' }, { $lookup: { from: 'categories', localField: 'product.categoryId', foreignField: '_id', as: 'category' } }, { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }, { $project: { _id: 0, count: 1, productId: '$_id', name: '$product.name', image: '$product.image', categoryName: '$category.name' } }]),
      MenuEvent.aggregate([{ $match: { ...eventMatch, eventType: 'CATEGORY_VIEW', categoryId: { $exists: true } } }, { $group: { _id: '$categoryId', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 50 }, { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } }, { $unwind: '$category' }, { $project: { _id: 0, categoryId: '$_id', count: 1, name: '$category.name' } }]),
      MenuView.aggregate([{ $match: viewMatch }, { $group: { _id: { $hour: '$viewedAt' }, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
      MenuEvent.aggregate([{ $match: eventMatch }, { $group: { _id: { $hour: '$eventAt' }, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
      MenuEvent.countDocuments({ ...matchEvents(restaurantId, previousStart, previousEnd), eventType: 'PRODUCT_VIEW' }),
    ]);
    const productInteractions = await MenuEvent.countDocuments({ ...eventMatch, eventType: 'PRODUCT_VIEW' });
    const categoryInteractions = await MenuEvent.countDocuments({ ...eventMatch, eventType: 'CATEGORY_VIEW' });
    const uniqueVisitors = Math.min(views, Math.max(uniqueIps.filter(Boolean).length, views > 0 ? 1 : 0));
    const previousTotal = previousViews + previousEvents;
    const currentTotal = views + productInteractions;
    const comparison = previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : null;
    const dayCounts = new Map();
    dailyViews.forEach((row) => { dayCounts.set(row._id, (dayCounts.get(row._id) || 0) + row.count); });
    dailyEvents.forEach((row) => { dayCounts.set(row._id, (dayCounts.get(row._id) || 0) + row.count); });
    const busiestDays = [...dayCounts.entries()].sort((a, b) => b[1] - a[1]).map(([date, count]) => ({ date, day: new Date(`${date}T12:00:00Z`).toLocaleDateString('tr-TR', { weekday: 'long' }), count }));
    const combinedHours = new Map([...busiestHours, ...eventHours].map((row) => [row._id, 0]));
    [...busiestHours, ...eventHours].forEach((row) => combinedHours.set(row._id, (combinedHours.get(row._id) || 0) + row.count));
    const busiestHour = [...combinedHours.entries()].sort((a, b) => b[1] - a[1])[0];
    res.json({ range: { start, end, days }, summary: { views, uniqueVisitors, productInteractions, categoryInteractions, comparison, topProduct: productRows[0] || null, topCategory: categoryRows[0] || null, busiestDay: busiestDays[0] || null, busiestHour: busiestHour ? { hour: busiestHour[0], count: busiestHour[1] } : null }, dailyViews: dailySeries(dailyViews, start, days), dailyInteractions: dailySeries(dailyEvents, start, days), dailyCategoryInteractions: dailySeries(dailyCategoryEvents, start, days), topProducts: productRows, topCategories: categoryRows, busiestDays, busiestHours: [...combinedHours.entries()].sort((a, b) => b[1] - a[1]).map(([hour, count]) => ({ hour, count })).slice(0, 24), heatmap: dailySeries(dailyViews, start, days).map((row, index) => ({ ...row, interactions: dailyEvents[index]?.count || 0, categoryInteractions: dailyCategoryEvents[index]?.count || 0 })), });
  } catch (error) {
    next(error);
  }
};
