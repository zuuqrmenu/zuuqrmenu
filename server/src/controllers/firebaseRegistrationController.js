import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Menu from '../models/Menu.js';
import { setAuthCookie } from './authController.js';

const businessTypes = ['RESTAURANT', 'CAFE', 'BAR', 'BAKERY', 'FAST_FOOD'];

const normalizeSlug = (value) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'restaurant';

const getUniqueSlug = async (name) => {
  const base = normalizeSlug(name);
  let slug = base;
  let suffix = 2;
  while (await Restaurant.exists({ slug })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
};

const validationError = (body) => {
  if (!body.ownerName?.trim()) return 'Ad soyad zorunludur.';
  if (!body.restaurantName?.trim()) return 'Restoran adı zorunludur.';
  if (!body.city?.trim()) return 'Şehir zorunludur.';
  if (!businessTypes.includes(body.businessType)) return 'Geçersiz işletme türü.';
  if (body.ownerPhone && body.ownerPhone.trim().length > 40) return 'Geçerli bir telefon girin.';
  if (body.restaurantPhone && body.restaurantPhone.trim().length > 40) return 'Geçerli bir restoran telefonu girin.';
  if (body.address && body.address.trim().length > 250) return 'Adres 250 karakterden uzun olamaz.';
  return null;
};

const providerFromToken = (firebaseUser) => (firebaseUser.firebase?.sign_in_provider === 'google.com' ? 'GOOGLE' : 'PASSWORD');

export const registerFirebase = async (req, res, next) => {
  const firebaseUser = req.firebaseUser;
  const body = req.body || {};
  let createdUser = null;
  let createdRestaurant = null;
  let createdMenu = null;

  try {
    if (!firebaseUser?.uid) return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş oturum.' });
    if (!firebaseUser.email) return res.status(400).json({ error: 'Giriş hesabında e-posta adresi bulunamadı.' });

    const email = firebaseUser.email.trim().toLowerCase();
    const authProvider = providerFromToken(firebaseUser);
    const ownerName = body.ownerName?.trim() || firebaseUser.name?.trim() || email.split('@')[0];
    const restaurantName = body.restaurantName?.trim() || (authProvider === 'GOOGLE' ? `${ownerName} Restoranı` : '');
    const city = body.city?.trim() || (authProvider === 'GOOGLE' ? 'Belirtilmedi' : '');
    const businessType = body.businessType || (authProvider === 'GOOGLE' ? 'RESTAURANT' : '');
    const normalizedBody = { ...body, ownerName, restaurantName, city, businessType };
    const invalidField = validationError(normalizedBody);
    if (invalidField) return res.status(400).json({ error: invalidField });

    const existingUid = await User.findOne({ firebaseUid: firebaseUser.uid }).select('_id');
    if (existingUid) return res.status(409).json({ error: 'Bu hesap zaten bir zuuqrmenu hesabına bağlı.' });

    const existingEmail = await User.findOne({ email }).select('_id');
    if (existingEmail) return res.status(409).json({ error: 'Bu e-posta adresiyle zaten bir zuuqrmenu hesabı bulunuyor.' });

    createdUser = await User.create({
      email,
      name: ownerName,
      phone: body.ownerPhone?.trim() || '',
      role: 'RESTAURANT_USER',
      firebaseUid: firebaseUser.uid,
      authProvider,
    });

    createdRestaurant = await Restaurant.create({
      name: restaurantName,
      slug: await getUniqueSlug(restaurantName),
      ownerId: createdUser._id,
      status: 'PENDING',
      businessType,
      city,
      address: body.address?.trim() || '',
      website: body.website?.trim() || '',
      instagram: body.instagram?.trim() || '',
      phone: body.restaurantPhone?.trim() || '',
    });

    createdMenu = await Menu.create({ restaurantId: createdRestaurant._id, name: 'Ana Menü' });

    createdUser.restaurantId = createdRestaurant._id;
    await createdUser.save();
    const token = setAuthCookie(res, createdUser);
    return res.status(201).json({
      success: true,
      message: 'Hesabınız oluşturuldu. Yönetici onayı bekleniyor.',
      status: 'PENDING',
      token,
      user: { id: createdUser._id, email: createdUser.email, name: createdUser.name, role: createdUser.role, restaurantId: createdUser.restaurantId },
      restaurant: { id: createdRestaurant._id, name: createdRestaurant.name, slug: createdRestaurant.slug, status: createdRestaurant.status },
    });
  } catch (error) {
    await Promise.allSettled([
      createdMenu ? Menu.deleteOne({ _id: createdMenu._id }) : Promise.resolve(),
      createdRestaurant ? Restaurant.deleteOne({ _id: createdRestaurant._id }) : Promise.resolve(),
      createdUser ? User.deleteOne({ _id: createdUser._id }) : Promise.resolve(),
    ]);

    if (error?.code === 11000) {
      if (error.keyPattern?.firebaseUid) return res.status(409).json({ error: 'Bu hesap zaten bir zuuqrmenu hesabına bağlı.' });
      if (error.keyPattern?.email) return res.status(409).json({ error: 'Bu e-posta adresiyle zaten bir zuuqrmenu hesabı bulunuyor.' });
      if (error.keyPattern?.slug) return res.status(409).json({ error: 'Bu restoran adıyla kayıt oluşturulamadı. Lütfen farklı bir restoran adı deneyin.' });
    }
    return next(error);
  }
};
