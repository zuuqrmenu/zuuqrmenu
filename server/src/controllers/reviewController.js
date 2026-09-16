import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import { findPublicRestaurant } from '../utils/publicRestaurant.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\d\s.-]{7,25}$/;

export const createPublicReview = async (req, res, next) => {
  try {
    const restaurant = await findPublicRestaurant(req.params.username, '_id ownerId');
    if (!restaurant) return res.status(404).json({ error: 'Bu menü şu anda kullanılamıyor.' });
    const { name, email, phone, comment, rating } = req.body;
    const numericRating = Number(rating);
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) return res.status(400).json({ error: 'Adınız zorunludur.' });
    if (typeof email !== 'string' || !emailPattern.test(email.trim())) return res.status(400).json({ error: 'Geçerli bir e-posta girin.' });
    if (typeof phone !== 'string' || !phonePattern.test(phone.trim())) return res.status(400).json({ error: 'Geçerli bir telefon girin.' });
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) return res.status(400).json({ error: 'Lütfen 1-5 yıldız arasında değerlendirme yapın.' });
    if (typeof comment !== 'string' || !comment.trim() || comment.trim().length > 1000) return res.status(400).json({ error: 'Yorumunuz zorunludur ve 1000 karakteri geçemez.' });

    const owner = await User.findById(restaurant.ownerId).select('email').lean();
    console.info('Public review received', { restaurantId: restaurant._id.toString(), recipientConfigured: Boolean(owner?.email), rating: numericRating });
    res.status(202).json({ message: 'Değerlendirmeniz alındı.', delivery: 'pending' });
  } catch (error) {
    next(error);
  }
};