import Restaurant from '../models/Restaurant.js';
import RestaurantSettings from '../models/RestaurantSettings.js';
import { cloudinary, cloudinaryConfigured } from '../config/cloudinary.js';

const themes = ['DEFAULT', 'GRID', 'MINIMAL', 'BISTRO', 'ELEGANT', 'WARM', 'MODERN', 'DARK', 'CLASSIC'];
const fonts = ['Inter', 'DM Sans', 'Playfair Display', 'Lora'];
const layoutStyles = ['STANDARD', 'COMPACT', 'EDITORIAL'];
const hexColor = /^#[0-9A-Fa-f]{6}$/;
const validPlatforms = ['instagram', 'facebook', 'x', 'youtube', 'tiktok', 'linkedin', 'whatsapp', 'website'];
const getRestaurantId = (req) => req.restaurant._id;

const getDefaultSavedMenu = (fallback = {}) => ({
  slot: 1,
  name: 'Varsayılan Menü',
  theme: fallback.theme || 'DEFAULT',
  mode: fallback.mode || 'LIGHT',
  font: fallback.font || 'Inter',
  primaryColor: fallback.primaryColor || '#1F2937',
  secondaryColor: fallback.secondaryColor || '#FFFFFF',
  layout: {
    showImages: fallback.layout?.showImages ?? true,
    showDescriptions: fallback.layout?.showDescriptions ?? true,
    showPrices: fallback.layout?.showPrices ?? true,
    emphasizeFeatured: fallback.layout?.emphasizeFeatured ?? true,
    style: fallback.layout?.style || 'STANDARD',
    showStories: fallback.layout?.showStories ?? false,
  },
});

const normalizeSavedMenuEntries = (entries, fallback = {}) => {
  const source = Array.isArray(entries) ? entries.filter(Boolean) : [];
  const normalized = source.map((entry) => {
    if (!entry || typeof entry !== 'object') return null;
    const layout = entry.layout || {};
    const slot = Number.isInteger(entry.slot) ? Math.min(5, Math.max(1, entry.slot)) : 1;
    return {
      ...(entry._id ? { _id: entry._id } : {}),
      slot,
      name: typeof entry.name === 'string' ? entry.name.trim().slice(0, 60) : 'Menü',
      theme: themes.includes(entry.theme) ? (entry.theme === 'BISTRO' || entry.theme === 'MINIMAL' ? 'DEFAULT' : entry.theme) : fallback.theme || 'DEFAULT',
      mode: ['LIGHT', 'DARK'].includes(entry.mode) ? entry.mode : fallback.mode || 'LIGHT',
      font: fonts.includes(entry.font) ? entry.font : fallback.font || 'Inter',
      primaryColor: typeof entry.primaryColor === 'string' && hexColor.test(entry.primaryColor) ? entry.primaryColor.toUpperCase() : fallback.primaryColor || '#1F2937',
      secondaryColor: typeof entry.secondaryColor === 'string' && hexColor.test(entry.secondaryColor) ? entry.secondaryColor.toUpperCase() : fallback.secondaryColor || '#FFFFFF',
      layout: {
        showImages: layout.showImages !== false,
        showDescriptions: layout.showDescriptions !== false,
        showPrices: layout.showPrices !== false,
        emphasizeFeatured: layout.emphasizeFeatured !== false,
        style: layoutStyles.includes(layout.style) ? layout.style : fallback.layout?.style || 'STANDARD',
        showStories: layout.showStories === true,
      },
    };
  }).filter((entry) => entry && entry.name);

  if (!normalized.length) {
    return [getDefaultSavedMenu(fallback)];
  }

  const ordered = [...normalized].sort((a, b) => (Number(a.slot) || 1) - (Number(b.slot) || 1));
  const unique = [];
  const seen = new Set();
  ordered.forEach((entry, index) => {
    const key = String(entry._id || entry.name || index);
    if (seen.has(key)) return;
    seen.add(key);
    unique.push({ ...entry, slot: index === 0 ? 1 : Math.min(5, index + 1) });
  });
  return unique.slice(0, 5);
};

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

    if (req.body.mode !== undefined) {
      if (!['LIGHT', 'DARK'].includes(req.body.mode)) return res.status(400).json({ error: 'Geçersiz menü modu seçimi.' });
      updates.mode = req.body.mode;
    }

    if (req.body.activeMenuId !== undefined) {
      if (req.body.activeMenuId !== null && !/^[a-f\d]{24}$/i.test(String(req.body.activeMenuId))) return res.status(400).json({ error: 'Geçersiz aktif menü seçimi.' });
      updates.activeMenuId = req.body.activeMenuId;
    }

    if (req.body.activeMenuThemeId !== undefined) {
      if (req.body.activeMenuThemeId !== null && !/^[a-f\d]{24}$/i.test(String(req.body.activeMenuThemeId))) return res.status(400).json({ error: 'Geçersiz menü teması seçimi.' });
      updates.activeMenuThemeId = req.body.activeMenuThemeId;
    }

    if (req.body.savedMenus !== undefined) {
      if (!Array.isArray(req.body.savedMenus) || req.body.savedMenus.length > 5) return res.status(400).json({ error: 'En fazla 5 menü kaydı oluşturabilirsiniz.' });
      const normalizedMenus = normalizeSavedMenuEntries(req.body.savedMenus, {
        theme: req.body.theme || 'MINIMAL',
        mode: req.body.mode || 'LIGHT',
        font: req.body.font || 'Inter',
        primaryColor: req.body.primaryColor || '#1F2937',
        secondaryColor: req.body.secondaryColor || '#FFFFFF',
        layout: { style: 'STANDARD' },
      });
      if (normalizedMenus.some((entry) => !entry || !entry.name)) return res.status(400).json({ error: 'Menü adı zorunludur.' });
      updates.savedMenus = normalizedMenus;
      updates.menuThemes = normalizedMenus;
      if (updates.activeMenuId && !normalizedMenus.some((entry) => String(entry._id || entry.name) === String(updates.activeMenuId))) updates.activeMenuId = normalizedMenus[0]?._id || null;
      if (updates.activeMenuThemeId && !normalizedMenus.some((entry) => String(entry._id || entry.name) === String(updates.activeMenuThemeId))) updates.activeMenuThemeId = normalizedMenus[0]?._id || null;
      if (!updates.activeMenuId && !updates.activeMenuThemeId) {
        updates.activeMenuId = normalizedMenus[0]?._id || null;
        updates.activeMenuThemeId = normalizedMenus[0]?._id || null;
      }
    }

    if (req.body.menuThemes !== undefined) {
      if (!Array.isArray(req.body.menuThemes) || req.body.menuThemes.length > 5) return res.status(400).json({ error: 'En fazla 5 menü kaydı oluşturabilirsiniz.' });
      const normalizedThemes = normalizeSavedMenuEntries(req.body.menuThemes, {
        theme: req.body.theme || 'MINIMAL',
        mode: req.body.mode || 'LIGHT',
        font: req.body.font || 'Inter',
        primaryColor: req.body.primaryColor || '#1F2937',
        secondaryColor: req.body.secondaryColor || '#FFFFFF',
        layout: { style: 'STANDARD' },
      });
      if (normalizedThemes.some((entry) => !entry || !entry.name)) return res.status(400).json({ error: 'Tema adı zorunludur.' });
      updates.savedMenus = normalizedThemes;
      updates.menuThemes = normalizedThemes;
      if (updates.activeMenuId && !normalizedThemes.some((entry) => String(entry._id || entry.name) === String(updates.activeMenuId))) updates.activeMenuId = normalizedThemes[0]?._id || null;
      if (updates.activeMenuThemeId && !normalizedThemes.some((entry) => String(entry._id || entry.name) === String(updates.activeMenuThemeId))) updates.activeMenuThemeId = normalizedThemes[0]?._id || null;
      if (!updates.activeMenuId && !updates.activeMenuThemeId) {
        updates.activeMenuId = normalizedThemes[0]?._id || null;
        updates.activeMenuThemeId = normalizedThemes[0]?._id || null;
      }
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