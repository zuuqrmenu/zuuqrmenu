import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Menu from '../models/Menu.js';
import Product from '../models/Product.js';
import Restaurant from '../models/Restaurant.js';
import MenuView from '../models/MenuView.js';

const getRestaurantId = (req) => req.restaurant._id;

const ensureMenu = async (restaurantId) => {
  let menu = await Menu.findOne({ restaurantId }).lean();
  if (!menu) {
    menu = await Menu.create({ restaurantId, name: 'Ana Menü' });
  }
  return menu;
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const parseCategoryFields = (body, { partial = false } = {}) => {
  const fields = {};

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return { error: 'Kategori adı zorunludur' };
    }
    fields.name = body.name.trim();
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') return { error: 'Açıklama metin olmalıdır' };
    fields.description = body.description.trim();
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') return { error: 'Aktiflik değeri geçersiz' };
    fields.isActive = body.isActive;
  }

  if (body.displayOrder !== undefined) {
    const displayOrder = Number(body.displayOrder);
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      return { error: 'Görüntüleme sırası sıfır veya daha büyük bir tam sayı olmalıdır' };
    }
    fields.displayOrder = displayOrder;
  }

  return { fields };
};

export const getOverview = async (req, res, next) => {
  try {
    const restaurantId = getRestaurantId(req);
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setUTCDate(now.getUTCDate() - 6);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setUTCDate(now.getUTCDate() - 29);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    const [restaurant, menu, categoryCount, productCount, activeProductCount, totalViews, sevenDayViews, thirtyDayViews, recentCategories, recentProducts] = await Promise.all([
      Restaurant.findById(restaurantId).select('name slug menuStatus status publishedAt'),
      ensureMenu(restaurantId),
      Category.countDocuments({ restaurantId }),
      Product.countDocuments({ restaurantId }),
      Product.countDocuments({ restaurantId, isAvailable: true }),
      MenuView.countDocuments({ restaurantId }),
      MenuView.aggregate([
        { $match: { restaurantId, viewedAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      MenuView.aggregate([
        { $match: { restaurantId, viewedAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Category.find({ restaurantId }).select('name createdAt updatedAt').sort({ updatedAt: -1 }).limit(5).lean(),
      Product.find({ restaurantId }).select('name createdAt updatedAt').sort({ updatedAt: -1 }).limit(5).lean(),
    ]);

    const toDailySeries = (rows, days) => {
      const counts = new Map(rows.map((row) => [row._id, row.count]));
      return Array.from({ length: days }, (_, index) => {
        const date = new Date(now);
        date.setUTCDate(now.getUTCDate() - (days - 1 - index));
        date.setUTCHours(0, 0, 0, 0);
        const key = date.toISOString().slice(0, 10);
        return { date: key, count: counts.get(key) || 0 };
      });
    };

    const activity = [
      ...recentProducts.map((item) => ({ type: 'product', label: `${item.name} ürünü güncellendi`, date: item.updatedAt || item.createdAt })),
      ...recentCategories.map((item) => ({ type: 'category', label: `${item.name} kategorisi güncellendi`, date: item.updatedAt || item.createdAt })),
    ].filter((item) => item.date).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

    res.json({
      restaurant: restaurant ? { name: restaurant.name, slug: restaurant.slug, menuStatus: restaurant.menuStatus, status: restaurant.status, publishedAt: restaurant.publishedAt } : null,
      menu: { id: menu._id, name: menu.name },
      stats: {
        categoryCount,
        productCount,
        activeProductCount,
        totalViews,
        menuStatus: restaurant.menuStatus,
        publicMenuStatus: restaurant.menuStatus === 'PUBLISHED' ? 'Yayında' : 'Yayında değil',
      },
      views: { sevenDays: toDailySeries(sevenDayViews, 7), thirtyDays: toDailySeries(thirtyDayViews, 30) },
      activity,
    });
  } catch (error) {
    next(error);
  }
};

export const listCategories = async (req, res, next) => {
  try {
    const restaurantId = getRestaurantId(req);
    const menu = await ensureMenu(restaurantId);
    const categories = await Category.aggregate([
      { $match: { restaurantId, menuId: menu._id } },
      {
        $lookup: {
          from: 'products',
          let: { categoryId: '$_id', restaurantId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$categoryId', '$$categoryId'] },
                    { $eq: ['$restaurantId', '$$restaurantId'] },
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'productSummary',
        },
      },
      { $addFields: { productCount: { $ifNull: [{ $arrayElemAt: ['$productSummary.count', 0] }, 0] } } },
      { $project: { productSummary: 0 } },
      { $sort: { displayOrder: 1, name: 1 } },
    ]);

    res.json({
      menu: { id: menu._id, name: menu.name },
      categories,
      restaurant: {
        menuStatus: req.restaurant.menuStatus || 'DRAFT',
        publishedAt: req.restaurant.publishedAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const restaurantId = getRestaurantId(req);
    const menu = await ensureMenu(restaurantId);
    const { fields, error } = parseCategoryFields(req.body);
    if (error) return res.status(400).json({ error });

    if (fields.displayOrder === undefined) {
      const lastCategory = await Category.findOne({ restaurantId, menuId: menu._id }).sort({ displayOrder: -1 });
      fields.displayOrder = lastCategory ? lastCategory.displayOrder + 1 : 0;
    }

    const category = await Category.create({ ...fields, restaurantId, menuId: menu._id });
    res.status(201).json({ message: 'Kategori oluşturuldu', category: { ...category.toObject(), productCount: 0 } });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Geçersiz kategori ID' });
    const { fields, error } = parseCategoryFields(req.body, { partial: true });
    if (error) return res.status(400).json({ error });
    if (!Object.keys(fields).length) return res.status(400).json({ error: 'Güncellenecek alan bulunamadı' });

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, restaurantId: getRestaurantId(req) },
      { $set: fields },
      { new: true, runValidators: true },
    );
    if (!category) return res.status(404).json({ error: 'Kategori bulunamadı' });

    const productCount = await Product.countDocuments({ categoryId: category._id, restaurantId: getRestaurantId(req) });
    res.json({ message: 'Kategori güncellendi', category: { ...category.toObject(), productCount } });
  } catch (error) {
    next(error);
  }
};

export const toggleCategory = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Geçersiz kategori ID' });
    const category = await Category.findOne({ _id: req.params.id, restaurantId: getRestaurantId(req) });
    if (!category) return res.status(404).json({ error: 'Kategori bulunamadı' });

    category.isActive = !category.isActive;
    await category.save();
    const productCount = await Product.countDocuments({ categoryId: category._id, restaurantId: getRestaurantId(req) });
    res.json({ message: category.isActive ? 'Kategori aktifleştirildi' : 'Kategori pasifleştirildi', category: { ...category.toObject(), productCount } });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Geçersiz kategori ID' });
    const restaurantId = getRestaurantId(req);
    const category = await Category.findOne({ _id: req.params.id, restaurantId });
    if (!category) return res.status(404).json({ error: 'Kategori bulunamadı' });

    const productCount = await Product.countDocuments({ categoryId: category._id, restaurantId });
    if (productCount > 0) {
      return res.status(409).json({ error: 'Bu kategoride ürünler bulunduğu için kategori silinemiyor.' });
    }

    await category.deleteOne();
    res.json({ message: 'Kategori silindi' });
  } catch (error) {
    next(error);
  }
};

export const updateMenuStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['DRAFT', 'PUBLISHED', 'HIDDEN'].includes(status)) return res.status(400).json({ error: 'Geçersiz menü durumu.' });
    const update = { menuStatus: status, lastActivity: new Date() };
    if (status === 'PUBLISHED') update.publishedAt = new Date();
    const restaurant = await Restaurant.findOneAndUpdate({ _id: getRestaurantId(req) }, { $set: update }, { new: true }).select('name slug menuStatus status publishedAt');
    if (!restaurant) return res.status(404).json({ error: 'Restoran bulunamadı.' });
    res.json({ message: status === 'PUBLISHED' ? 'Menünüz yayınlandı.' : status === 'HIDDEN' ? 'Menünüz yayından kaldırıldı.' : 'Menünüz taslağa alındı.', restaurant });
  } catch (error) {
    next(error);
  }
};