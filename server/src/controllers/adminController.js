import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import RestaurantSettings from '../models/RestaurantSettings.js';
import MenuView from '../models/MenuView.js';
import MenuEvent from '../models/MenuEvent.js';

const statusLabels = {
  PENDING: 'Onay Bekliyor',
  ACTIVE: 'Aktif',
  SUSPENDED: 'Askıya Alındı',
  REJECTED: 'Reddedildi',
};

const isValidRestaurantId = (id) => mongoose.Types.ObjectId.isValid(id);

const getRestaurantOrError = async (id, res) => {
  if (!isValidRestaurantId(id)) {
    res.status(400).json({ error: 'Geçersiz restoran ID' });
    return null;
  }

  const restaurant = await Restaurant.findById(id).populate('ownerId', 'email name username');
  if (!restaurant) {
    res.status(404).json({ error: 'Restoran bulunamadı' });
    return null;
  }

  return restaurant;
};

const updateRestaurantStatus = async (req, res, next, expectedStatus, nextStatus) => {
  try {
    const restaurant = await getRestaurantOrError(req.params.id, res);
    if (!restaurant) return;

    if (restaurant.status !== expectedStatus) {
      return res.status(409).json({
        error: `Bu işlem yalnızca ${statusLabels[expectedStatus]} durumundaki restoranlar için yapılabilir`,
      });
    }

    restaurant.status = nextStatus;
    await restaurant.save();

    const updatedRestaurant = await Restaurant.findById(restaurant._id).populate('ownerId', 'email name username');
    res.json({ message: 'Restoran durumu güncellendi', restaurant: updatedRestaurant });
  } catch (error) {
    next(error);
  }
};

export const listRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find()
      .populate('ownerId', 'email name username')
      .sort({ createdAt: -1 });

    res.json({ restaurants });
  } catch (error) {
    next(error);
  }
};

export const getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await getRestaurantOrError(req.params.id, res);
    if (!restaurant) return;
    res.json({ restaurant });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const [
      total,
      pending,
      active,
      suspended,
      rejected,
      publishedMenus,
      draftMenus,
      hiddenMenus,
      totalUsers,
      totalProducts,
      totalCategories,
      recentRestaurants,
      businessTypesAgg,
      viewsAgg,
    ] = await Promise.all([
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ status: 'PENDING' }),
      Restaurant.countDocuments({ status: 'ACTIVE' }),
      Restaurant.countDocuments({ status: 'SUSPENDED' }),
      Restaurant.countDocuments({ status: 'REJECTED' }),
      Restaurant.countDocuments({ menuStatus: 'PUBLISHED' }),
      Restaurant.countDocuments({ menuStatus: 'DRAFT' }),
      Restaurant.countDocuments({ menuStatus: 'HIDDEN' }),
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Restaurant.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('ownerId', 'email name username')
        .lean(),
      Restaurant.aggregate([
        { $group: { _id: '$businessType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Restaurant.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$menuViewCount' } } },
      ]),
    ]);

    const businessTypes = (businessTypesAgg || []).reduce((acc, curr) => {
      if (curr._id) acc[curr._id] = curr.count;
      return acc;
    }, {});

    const totalViews = viewsAgg?.[0]?.totalViews || 0;

    res.json({
      stats: {
        total,
        pending,
        active,
        suspended,
        rejected,
        publishedMenus,
        draftMenus,
        hiddenMenus,
        totalUsers,
        totalProducts,
        totalCategories,
        totalViews,
        businessTypes,
        recentRestaurants,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const approveRestaurant = (req, res, next) =>
  updateRestaurantStatus(req, res, next, 'PENDING', 'ACTIVE');

export const rejectRestaurant = (req, res, next) =>
  updateRestaurantStatus(req, res, next, 'PENDING', 'REJECTED');

export const suspendRestaurant = (req, res, next) =>
  updateRestaurantStatus(req, res, next, 'ACTIVE', 'SUSPENDED');

export const activateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await getRestaurantOrError(req.params.id, res);
    if (!restaurant) return;

    if (!['SUSPENDED', 'REJECTED'].includes(restaurant.status)) {
      return res.status(409).json({
        error: 'Bu işlem yalnızca askıya alınmış veya reddedilmiş restoranlar için yapılabilir',
      });
    }

    restaurant.status = 'ACTIVE';
    await restaurant.save();
    const updatedRestaurant = await Restaurant.findById(restaurant._id).populate('ownerId', 'email name username');
    res.json({ message: 'Restoran aktifleştirildi', restaurant: updatedRestaurant });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await getRestaurantOrError(req.params.id, res);
    if (!restaurant) return;

    const {
      name,
      businessType,
      city,
      phone,
      email,
      ownerName,
      ownerEmail,
      password,
      status,
      menuStatus,
    } = req.body;

    if (name && name.trim()) restaurant.name = name.trim();
    if (businessType) restaurant.businessType = businessType;
    if (city !== undefined) restaurant.city = city.trim();
    if (phone !== undefined) restaurant.phone = phone.trim();
    if (email !== undefined) restaurant.email = email.trim().toLowerCase();
    if (status) restaurant.status = status;
    if (menuStatus) restaurant.menuStatus = menuStatus;

    await restaurant.save();

    // Update owner user if provided
    const ownerId = restaurant.ownerId?._id || restaurant.ownerId;
    if (ownerId) {
      const user = await User.findById(ownerId).select('+password');
      if (user) {
        if (ownerEmail && ownerEmail.trim().toLowerCase() !== user.email) {
          const emailExists = await User.findOne({
            email: ownerEmail.trim().toLowerCase(),
            _id: { $ne: user._id },
          });
          if (emailExists) {
            return res.status(409).json({ error: 'Bu kullanıcı e-posta adresi başka bir hesap tarafından kullanılıyor' });
          }
          user.email = ownerEmail.trim().toLowerCase();
        }
        if (ownerName && ownerName.trim()) {
          user.name = ownerName.trim();
        }
        if (password && password.trim().length >= 6) {
          user.password = password.trim();
        }
        await user.save();
      }
    }

    const updatedRestaurant = await Restaurant.findById(restaurant._id).populate('ownerId', 'email name username');
    res.json({ message: 'Restoran ve kullanıcı bilgileri güncellendi', restaurant: updatedRestaurant });
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await getRestaurantOrError(req.params.id, res);
    if (!restaurant) return;

    const restaurantId = restaurant._id;
    const ownerId = restaurant.ownerId?._id || restaurant.ownerId;

    await Promise.all([
      Restaurant.findByIdAndDelete(restaurantId),
      Category.deleteMany({ restaurantId }),
      Product.deleteMany({ restaurantId }),
      RestaurantSettings.deleteMany({ restaurantId }),
      MenuView.deleteMany({ restaurantId }),
      MenuEvent.deleteMany({ restaurantId }),
      ownerId ? User.findByIdAndDelete(ownerId) : Promise.resolve(),
    ]);

    res.json({ message: 'Restoran ve ilgili tüm veriler sistemden tamamen silindi' });
  } catch (error) {
    next(error);
  }
};