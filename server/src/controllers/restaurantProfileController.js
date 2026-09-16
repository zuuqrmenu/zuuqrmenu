import Restaurant from '../models/Restaurant.js';

const businessTypes = ['RESTAURANT', 'CAFE', 'BAR', 'BAKERY', 'FAST_FOOD'];
const urlFields = ['website', 'instagram'];

const validateUrl = (value) => {
  if (!value) return '';
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) ? value : null;
  } catch {
    return null;
  }
};

const serializeRestaurant = (restaurant) => ({
  id: restaurant._id,
  name: restaurant.name,
  slug: restaurant.slug,
  businessType: restaurant.businessType,
  city: restaurant.city || '',
  address: restaurant.address || '',
  phone: restaurant.phone || '',
  email: restaurant.email || '',
  website: restaurant.website || '',
  instagram: restaurant.instagram || '',
  status: restaurant.status,
  menuStatus: restaurant.menuStatus,
});

export const getRestaurantProfile = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurant._id).lean();
    if (!restaurant) return res.status(404).json({ error: 'Restoran bulunamadı.' });
    res.json({ restaurant: serializeRestaurant(restaurant) });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurantProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'businessType', 'city', 'address', 'phone', 'email', 'website', 'instagram'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] === undefined) continue;
      if (typeof req.body[field] !== 'string') return res.status(400).json({ error: 'Geçersiz restoran bilgisi.' });
      updates[field] = req.body[field].trim();
    }

    if (updates.name !== undefined && !updates.name) return res.status(400).json({ error: 'Restoran adı zorunludur.' });
    if (updates.businessType !== undefined && !businessTypes.includes(updates.businessType)) return res.status(400).json({ error: 'Geçersiz işletme türü.' });
    if (updates.name?.length > 120 || updates.city?.length > 100 || updates.address?.length > 250 || updates.phone?.length > 40) {
      return res.status(400).json({ error: 'Restoran bilgileri izin verilen uzunluğu aşıyor.' });
    }

    if (updates.email && !/^\S+@\S+\.\S+$/.test(updates.email)) return res.status(400).json({ error: 'Restoran e-posta adresi geçersiz.' });

    for (const field of urlFields) {
      if (updates[field] === undefined || !updates[field]) continue;
      const normalized = validateUrl(updates[field]);
      if (!normalized) return res.status(400).json({ error: `${field === 'instagram' ? 'Instagram' : 'Website'} için geçerli bir URL girin.` });
      updates[field] = normalized;
    }

    const restaurant = await Restaurant.findByIdAndUpdate(req.restaurant._id, { $set: updates }, { new: true, runValidators: true });
    if (!restaurant) return res.status(404).json({ error: 'Restoran bulunamadı.' });
    res.json({ message: 'Restoran bilgileri güncellendi.', restaurant: serializeRestaurant(restaurant) });
  } catch (error) {
    next(error);
  }
};
