import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant.js';

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

  const restaurant = await Restaurant.findById(id).populate('ownerId', 'email name');
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

    const updatedRestaurant = await Restaurant.findById(restaurant._id).populate('ownerId', 'email name');
    res.json({ message: 'Restoran durumu güncellendi', restaurant: updatedRestaurant });
  } catch (error) {
    next(error);
  }
};

export const listRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find()
      .populate('ownerId', 'email name')
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
    const [total, pending, active, suspended] = await Promise.all([
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ status: 'PENDING' }),
      Restaurant.countDocuments({ status: 'ACTIVE' }),
      Restaurant.countDocuments({ status: 'SUSPENDED' }),
    ]);

    res.json({ stats: { total, pending, active, suspended } });
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
    const updatedRestaurant = await Restaurant.findById(restaurant._id).populate('ownerId', 'email name');
    res.json({ message: 'Restoran aktifleştirildi', restaurant: updatedRestaurant });
  } catch (error) {
    next(error);
  }
};