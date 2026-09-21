import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';

export const findPublicRestaurant = async (identifier, projection = '_id ownerId name slug menuStatus address menuViewCount') => {
  const user = await User.findOne({ username: identifier, role: 'RESTAURANT_USER' }).select('restaurantId').lean();
  if (user?.restaurantId) {
    const restaurant = await Restaurant.findOne({ _id: user.restaurantId, status: 'ACTIVE' }).select(projection).lean();
    if (restaurant) return restaurant;
  }
  // Fallback: check if identifier matches restaurant slug directly
  return Restaurant.findOne({ slug: identifier, status: 'ACTIVE' }).select(projection).lean();
};
