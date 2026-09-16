import Restaurant from '../models/Restaurant.js';
import RestaurantSettings from '../models/RestaurantSettings.js';
import { cloudinary, cloudinaryConfigured } from '../config/cloudinary.js';

const themes = ['MINIMAL', 'ELEGANT', 'WARM', 'MODERN', 'DARK', 'CLASSIC'];
const hexColor = /^#[0-9A-Fa-f]{6}$/;
const validPlatforms = ['instagram', 'facebook', 'x', 'youtube', 'tiktok', 'linkedin', 'whatsapp', 'website'];
const getRestaurantId = (req) => req.restaurant._id;

const getSettings = (restaurantId) => RestaurantSettings.findOneAndUpdate(
  { restaurantId },
  { $setOnInsert: { restaurantId } },
  { upsert: true, new: true, setDefaultsOnInsert: true },
);

const getCloudinaryPublicId = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  try {
    const pathname = new URL(imageUrl).pathname;
    const markerIndex = pathname.indexOf('/upload/');
    if (markerIndex === -1) return null;
    const uploadPath = pathname.slice(markerIndex + '/upload/'.length);
    const folderIndex = uploadPath.indexOf('zuulab-qr/restaurants/');
    if (folderIndex === -1) return null;
    return uploadPath.slice(folderIndex).replace(/\.[^/.]+$/, '');
  } catch (error) {
    return null;
  }
};

const removeImage = async (imageUrl) => {
  const publicId = getCloudinaryPublicId(imageUrl);
  if (!publicId || !cloudinaryConfigured) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
};

const uploadImage = (buffer, restaurantId, type) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({
    folder: `zuulab-qr/restaurants/${restaurantId}/branding/${type}`,
    resource_type: 'image',
    transformation: [{ width: type === 'logo' ? 800 : 1600, height: type === 'logo' ? 800 : 900, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
  }, (error, result) => (error ? reject(error) : resolve(result)));
  stream.end(buffer);
});

export const getRestaurantSettings = async (req, res, next) => {
  try {
    const restaurantId = getRestaurantId(req);
    const [settings, restaurant] = await Promise.all([
      getSettings(restaurantId),
      Restaurant.findById(restaurantId).select('address').lean(),
    ]);
    res.json({ settings: { ...settings.toObject(), address: restaurant?.address || '' } });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurantSettings = async (req, res, next) => {
  try {
    const updates = {};
    const restaurantId = getRestaurantId(req);

    if (req.body.description !== undefined) {
      if (typeof req.body.description !== 'string' || req.body.description.trim().length > 500) {
        return res.status(400).json({ error: 'Açıklama 500 karakterden uzun olamaz.' });
      }
      updates.description = req.body.description.trim();
    }

    if (req.body.address !== undefined) {
      if (typeof req.body.address !== 'string' || req.body.address.trim().length > 250) {
        return res.status(400).json({ error: 'Adres 250 karakterden uzun olamaz.' });
      }
      await Restaurant.findByIdAndUpdate(restaurantId, { $set: { address: req.body.address.trim() } }, { new: true });
    }

    for (const field of ['primaryColor', 'secondaryColor']) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== 'string' || !hexColor.test(req.body[field])) return res.status(400).json({ error: 'Geçerli bir HEX renk kodu girin.' });
        updates[field] = req.body[field].toUpperCase();
      }
    }
    if (req.body.theme !== undefined) {
      if (!themes.includes(req.body.theme)) return res.status(400).json({ error: 'Geçersiz tema seçimi.' });
      updates.theme = req.body.theme;
    }

    if (req.body.socialMedia !== undefined) {
      const normalized = Array.isArray(req.body.socialMedia) ? req.body.socialMedia.filter((entry) => entry && typeof entry === 'object') : [];
      const seen = new Set();
      const socialMedia = normalized
        .map((entry) => ({
          platform: typeof entry.platform === 'string' ? entry.platform : '',
          url: typeof entry.url === 'string' ? entry.url.trim() : '',
        }))
        .filter((entry) => validPlatforms.includes(entry.platform) && entry.url)
        .filter((entry) => {
          try {
            const url = new URL(entry.url);
            if (!['http:', 'https:'].includes(url.protocol)) return false;
          } catch {
            return false;
          }
          if (seen.has(entry.platform)) return false;
          seen.add(entry.platform);
          return true;
        })
        .map((entry) => ({ platform: entry.platform, url: entry.url }));

      updates.socialMedia = socialMedia;
    }

    if (!Object.keys(updates).length) {
      const settings = await getSettings(restaurantId);
      return res.json({ message: 'Ayarlar güncellendi', settings: { ...settings.toObject(), address: (await Restaurant.findById(restaurantId).select('address').lean())?.address || '' } });
    }

    const settings = await RestaurantSettings.findOneAndUpdate(
      { restaurantId },
      { $set: updates, $setOnInsert: { restaurantId } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    const restaurant = await Restaurant.findById(restaurantId).select('address').lean();
    res.json({ message: 'Ayarlar güncellendi', settings: { ...settings.toObject(), address: restaurant?.address || '' } });
  } catch (error) {
    next(error);
  }
};

const uploadBrandingImage = async (req, res, next, type, field) => {
  try {
    if (!cloudinaryConfigured) return res.status(503).json({ error: 'Görsel yükleme şu anda yapılandırılmamış.' });
    if (!req.file) return res.status(400).json({ error: 'Lütfen bir görsel seçin.' });
    const restaurantId = getRestaurantId(req);
    const settings = await getSettings(restaurantId);
    const uploaded = await uploadImage(req.file.buffer, restaurantId, type);
    const previousImage = settings[field];
    settings[field] = uploaded.secure_url;
    await settings.save();

    if (previousImage) {
      try {
        await removeImage(previousImage);
      } catch (cleanupError) {
        console.error(`Previous branding ${type} cleanup failed:`, cleanupError.message);
      }
    }
    res.json({ message: `${type === 'logo' ? 'Logo' : 'Kapak görseli'} güncellendi`, settings });
  } catch (error) {
    console.error(`Branding ${type} upload failed:`, error.message);
    next(error);
  }
};

export const uploadLogo = (req, res, next) => uploadBrandingImage(req, res, next, 'logo', 'logo');
export const uploadCover = (req, res, next) => uploadBrandingImage(req, res, next, 'cover', 'coverImage');
export const uploadStore = (req, res, next) => uploadBrandingImage(req, res, next, 'store', 'storeImage');

const removeBrandingImage = async (req, res, next, field, label) => {
  try {
    const settings = await getSettings(getRestaurantId(req));
    if (!settings[field]) return res.status(400).json({ error: `${label} bulunmuyor.` });
    try {
      await removeImage(settings[field]);
    } catch (cleanupError) {
      console.error(`${label} cleanup failed:`, cleanupError.message);
    }
    settings[field] = null;
    await settings.save();
    res.json({ message: `${label} kaldırıldı`, settings });
  } catch (error) {
    next(error);
  }
};

export const removeLogo = (req, res, next) => removeBrandingImage(req, res, next, 'logo', 'Logo');
export const removeCover = (req, res, next) => removeBrandingImage(req, res, next, 'coverImage', 'Kapak görseli');
export const removeStore = (req, res, next) => removeBrandingImage(req, res, next, 'storeImage', 'Mağaza görseli');