import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { cloudinary, cloudinaryConfigured } from '../config/cloudinary.js';

const productImageFolder = (restaurantId) => `zuulab-qr/restaurants/${restaurantId}/products`;

const uploadToCloudinary = (buffer, restaurantId) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({
    folder: productImageFolder(restaurantId),
    resource_type: 'image',
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }],
  }, (error, result) => (error ? reject(error) : resolve(result)));
  stream.end(buffer);
});

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

const removeFromCloudinary = async (imageUrl) => {
  const publicId = getCloudinaryPublicId(imageUrl);
  if (!publicId || !cloudinaryConfigured) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
};

const dietaryTags = ['VEGAN', 'VEGETARIAN', 'GLUTEN_FREE', 'SPICY', 'MILD', 'HALAL'];
const getRestaurantId = (req) => req.restaurant._id;
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const parseList = (value, fieldName) => {
  if (value === undefined) return { value: undefined };
  const values = Array.isArray(value) ? value : String(value).split(',');
  const list = values.map((item) => String(item).trim()).filter(Boolean);
  if (list.some((item) => item.length > 120)) return { error: `${fieldName} değerleri çok uzun` };
  return { value: list };
};

const parseNumber = (value, label, { required = false, integer = false } = {}) => {
  if (value === undefined || value === null || value === '') {
    return required ? { error: `${label} zorunludur` } : { value: null };
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || (integer && !Number.isInteger(number))) {
    return { error: `${label} sıfır veya daha büyük geçerli bir sayı olmalıdır` };
  }
  return { value: number };
};

const parseProductFields = (body, { partial = false } = {}) => {
  const fields = {};

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) return { error: 'Ürün adı zorunludur' };
    fields.name = body.name.trim();
  }

  if (!partial || body.price !== undefined) {
    const parsed = parseNumber(body.price, 'Fiyat', { required: true });
    if (parsed.error) return parsed;
    fields.price = parsed.value;
  }

  if (body.categoryId !== undefined) {
    if (!isValidId(body.categoryId)) return { error: 'Geçersiz kategori ID' };
    fields.categoryId = body.categoryId;
  } else if (!partial) {
    return { error: 'Kategori seçimi zorunludur' };
  }

  for (const field of ['description', 'shortDescription']) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== 'string') return { error: `${field === 'description' ? 'Açıklama' : 'Kısa açıklama'} metin olmalıdır` };
      fields[field] = body[field].trim();
    }
  }

  for (const field of ['oldPrice', 'calories']) {
    if (body[field] !== undefined) {
      const parsed = parseNumber(body[field], field === 'oldPrice' ? 'Eski fiyat' : 'Kalori', { integer: field === 'calories' });
      if (parsed.error) return parsed;
      fields[field] = parsed.value;
    }
  }

  for (const field of ['ingredients', 'allergens']) {
    const parsed = parseList(body[field], field === 'ingredients' ? 'İçindekiler' : 'Alerjenler');
    if (parsed.error) return parsed;
    if (parsed.value !== undefined) fields[field] = parsed.value;
  }

  if (body.dietaryTags !== undefined) {
    const parsed = parseList(body.dietaryTags, 'Diyet etiketleri');
    if (parsed.error) return parsed;
    if (parsed.value.some((tag) => !dietaryTags.includes(tag))) return { error: 'Geçersiz diyet etiketi' };
    fields.dietaryTags = parsed.value;
  }

  for (const field of ['isAvailable', 'isFeatured']) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== 'boolean') return { error: `${field === 'isAvailable' ? 'Mevcudiyet' : 'Öne çıkarma'} değeri geçersiz` };
      fields[field] = body[field];
    }
  }

  if (body.displayOrder !== undefined) {
    const parsed = parseNumber(body.displayOrder, 'Görüntüleme sırası', { integer: true });
    if (parsed.error) return parsed;
    fields.displayOrder = parsed.value;
  }

  return { fields };
};

const verifyCategoryOwnership = async (categoryId, restaurantId) => {
  if (!isValidId(categoryId)) return null;
  return Category.findOne({ _id: categoryId, restaurantId }).select('_id name displayOrder');
};

export const listProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ restaurantId: getRestaurantId(req) })
      .populate('categoryId', 'name displayOrder restaurantId')
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

export const listCategoryProducts = async (req, res, next) => {
  try {
    const restaurantId = getRestaurantId(req);
    const category = await verifyCategoryOwnership(req.params.categoryId, restaurantId);
    if (!category) return res.status(isValidId(req.params.categoryId) ? 404 : 400).json({ error: isValidId(req.params.categoryId) ? 'Kategori bulunamadı' : 'Geçersiz kategori ID' });

    const products = await Product.find({ restaurantId, categoryId: category._id })
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    res.json({ category, products });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { fields, error } = parseProductFields(req.body);
    if (error) return res.status(400).json({ error });

    const category = await verifyCategoryOwnership(fields.categoryId, restaurantId);
    if (!category) return res.status(404).json({ error: 'Kategori bulunamadı veya bu restorana ait değil' });

    if (fields.displayOrder === undefined) {
      const lastProduct = await Product.findOne({ restaurantId, categoryId: category._id }).sort({ displayOrder: -1 });
      fields.displayOrder = lastProduct ? lastProduct.displayOrder + 1 : 0;
    }

    const product = await Product.create({ ...fields, restaurantId, categoryId: category._id });
    const populatedProduct = await Product.findById(product._id).populate('categoryId', 'name displayOrder');
    res.status(201).json({ message: 'Ürün oluşturuldu', product: populatedProduct });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Geçersiz ürün ID' });
    const restaurantId = getRestaurantId(req);
    const { fields, error } = parseProductFields(req.body, { partial: true });
    if (error) return res.status(400).json({ error });
    if (!Object.keys(fields).length) return res.status(400).json({ error: 'Güncellenecek alan bulunamadı' });

    const product = await Product.findOne({ _id: req.params.id, restaurantId });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    if (fields.categoryId) {
      const category = await verifyCategoryOwnership(fields.categoryId, restaurantId);
      if (!category) return res.status(404).json({ error: 'Kategori bulunamadı veya bu restorana ait değil' });
    }

    Object.assign(product, fields);
    await product.save();
    const populatedProduct = await Product.findById(product._id).populate('categoryId', 'name displayOrder');
    res.json({ message: 'Ürün güncellendi', product: populatedProduct });
  } catch (error) {
    next(error);
  }
};

export const toggleAvailability = (req, res, next) => toggleProductField(req, res, next, 'isAvailable', 'Mevcudiyet');
export const toggleFeatured = (req, res, next) => toggleProductField(req, res, next, 'isFeatured', 'Öne çıkarma');

const toggleProductField = async (req, res, next, field, label) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Geçersiz ürün ID' });
    const product = await Product.findOne({ _id: req.params.id, restaurantId: getRestaurantId(req) });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    product[field] = !product[field];
    await product.save();
    const populatedProduct = await Product.findById(product._id).populate('categoryId', 'name displayOrder');
    res.json({ message: `${label} durumu güncellendi`, product: populatedProduct });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Geçersiz ürün ID' });
    const product = await Product.findOneAndDelete({ _id: req.params.id, restaurantId: getRestaurantId(req) });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json({ message: 'Ürün silindi' });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImage = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Geçersiz ürün ID' });
    if (!req.file) return res.status(400).json({ error: 'Lütfen bir görsel seçin.' });

    const restaurantId = getRestaurantId(req);
    const product = await Product.findOne({ _id: req.params.id, restaurantId });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
    if (!cloudinaryConfigured) return res.status(503).json({ error: 'Görsel yükleme şu anda yapılandırılmamış.' });

    const uploaded = await uploadToCloudinary(req.file.buffer, restaurantId);
    const previousImage = product.image;
    product.image = uploaded.secure_url;
    await product.save();

    if (previousImage) {
      try {
        await removeFromCloudinary(previousImage);
      } catch (cleanupError) {
        console.error('Previous product image cleanup failed:', cleanupError.message);
      }
    }

    res.json({ message: 'Ürün görseli yüklendi', image: product.image, product });
  } catch (error) {
    console.error('Product image upload failed:', error.message);
    next(error);
  }
};

export const removeProductImage = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Geçersiz ürün ID' });

    const product = await Product.findOne({ _id: req.params.id, restaurantId: getRestaurantId(req) });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
    if (!product.image) return res.status(400).json({ error: 'Bu üründe kaldırılacak görsel bulunmuyor.' });
    if (!cloudinaryConfigured) return res.status(503).json({ error: 'Görsel yönetimi şu anda yapılandırılmamış.' });

    const previousImage = product.image;
    await removeFromCloudinary(previousImage);
    product.image = null;
    await product.save();

    res.json({ message: 'Ürün görseli kaldırıldı', product });
  } catch (error) {
    console.error('Product image removal failed:', error.message);
    next(error);
  }
};