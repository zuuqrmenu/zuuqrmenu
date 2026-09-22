import mongoose from 'mongoose';
import Restaurant from '../../models/Restaurant.js';
import User from '../../models/User.js';
import RestaurantSettings from '../../models/RestaurantSettings.js';
import Category from '../../models/Category.js';
import Product from '../../models/Product.js';
import MenuView from '../../models/MenuView.js';
import MenuEvent from '../../models/MenuEvent.js';

const menuStatusMap = {
  PUBLISHED: 'Yayında',
  DRAFT: 'Taslak',
  HIDDEN: 'Gizli',
};

const formatDateTR = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${d.getUTCFullYear()}`;
};

/**
 * Builds a compact, structured text representation of the restaurant and its menu data for the AI.
 * Excludes internal IDs, credentials, and image URLs to conserve tokens and preserve privacy.
 *
 * @param {string|mongoose.Types.ObjectId} restaurantId
 * @param {string|mongoose.Types.ObjectId} [userId]
 * @returns {Promise<string>}
 */
export const buildRestaurantContext = async (restaurantId, userId) => {
  if (!restaurantId) {
    return 'RESTORAN BAĞLAMI:\nRestoran bilgisi bulunamadı.';
  }

  try {
    const restObjId = mongoose.Types.ObjectId.isValid(restaurantId)
      ? new mongoose.Types.ObjectId(restaurantId)
      : restaurantId;

    const [
      restaurant,
      user,
      settings,
      categories,
      products,
      totalMenuViews,
      uniqueIps,
      productEventCounts,
      categoryEventCounts,
      oldestView,
      newestView,
    ] = await Promise.all([
      Restaurant.findById(restaurantId)
        .select('name slug businessType city menuStatus publishedAt menuViewCount')
        .lean(),
      userId
        ? User.findById(userId).select('username name email').lean()
        : null,
      RestaurantSettings.findOne({ restaurantId })
        .select('description theme mode')
        .lean(),
      Category.find({ restaurantId, isActive: true })
        .select('_id name description displayOrder isFeatured')
        .sort({ displayOrder: 1, name: 1 })
        .lean(),
      Product.find({ restaurantId })
        .select('name categoryId price oldPrice description shortDescription ingredients allergens dietaryTags calories isAvailable isFeatured displayOrder')
        .sort({ displayOrder: 1, name: 1 })
        .lean(),
      MenuView.countDocuments({ restaurantId: restObjId }),
      MenuView.distinct('ip', { restaurantId: restObjId }),
      MenuEvent.aggregate([
        { $match: { restaurantId: restObjId, eventType: 'PRODUCT_VIEW', productId: { $exists: true } } },
        { $group: { _id: '$productId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      MenuEvent.aggregate([
        { $match: { restaurantId: restObjId, eventType: 'CATEGORY_VIEW', categoryId: { $exists: true } } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      MenuView.findOne({ restaurantId: restObjId }).sort({ viewedAt: 1 }).select('viewedAt').lean(),
      MenuView.findOne({ restaurantId: restObjId }).sort({ viewedAt: -1 }).select('viewedAt').lean(),
    ]);

    if (!restaurant) {
      return 'RESTORAN BAĞLAMI:\nRestoran kaydı bulunamadı.';
    }

    const lines = [];

    // 1. Restaurant Profile
    lines.push('=== RESTORAN BİLGİLERİ ===');
    lines.push(`Restoran Adı: ${restaurant.name}`);
    if (user?.username || restaurant.slug) {
      lines.push(`Kullanıcı Adı: ${user?.username || restaurant.slug}`);
    }
    const statusLabel = menuStatusMap[restaurant.menuStatus] || restaurant.menuStatus || 'Taslak';
    lines.push(`Menü Yayın Durumu: ${statusLabel}`);
    if (restaurant.businessType) {
      lines.push(`İşletme Türü: ${restaurant.businessType}`);
    }
    if (restaurant.city) {
      lines.push(`Şehir: ${restaurant.city}`);
    }
    const desc = settings?.description || '';
    if (desc) {
      lines.push(`Restoran Açıklaması: ${desc}`);
    }
    if (settings?.theme) {
      lines.push(`Aktif Menü Teması: ${settings.theme}${settings.mode ? ` (${settings.mode})` : ''}`);
    }

    // 2. Analytics & Statistics
    const productViewMap = new Map();
    for (const item of (productEventCounts || [])) {
      if (item._id) {
        productViewMap.set(item._id.toString(), item.count);
      }
    }

    const categoryViewMap = new Map();
    for (const item of (categoryEventCounts || [])) {
      if (item._id) {
        categoryViewMap.set(item._id.toString(), item.count);
      }
    }

    // Attach view counts to products
    const productsWithViews = products.map((p) => ({
      ...p,
      viewCount: productViewMap.get(p._id.toString()) || 0,
    }));

    const sortedByViews = [...productsWithViews].sort((a, b) => b.viewCount - a.viewCount);
    const topViewedProducts = sortedByViews.filter((p) => p.viewCount > 0);
    const zeroViewedProducts = sortedByViews.filter((p) => p.viewCount === 0);

    lines.push('');
    lines.push('=== ANALİTİK VE İSTATİSTİKLER (GERÇEK VERİLER) ===');
    const viewsCount = Math.max(totalMenuViews || 0, restaurant.menuViewCount || 0);
    const uniqueCount = (uniqueIps || []).filter(Boolean).length;
    lines.push(`• Toplam Menü Görüntülenmesi: ${viewsCount}`);
    lines.push(`• Tekil Ziyaretçi Sayısı: ${uniqueCount}`);

    if (oldestView?.viewedAt && newestView?.viewedAt) {
      lines.push(`• Veri Tarih Aralığı: ${formatDateTR(oldestView.viewedAt)} - ${formatDateTR(newestView.viewedAt)} (Kayıtlı veriler)`);
    }

    if (topViewedProducts.length > 0) {
      lines.push('• En Çok Görüntülenen Ürünler:');
      for (const p of topViewedProducts.slice(0, 10)) {
        lines.push(`  - ${p.name}: ${p.viewCount} görüntülenme`);
      }
    } else {
      lines.push('• Henüz özel olarak incelenmiş ürün görüntüleme kaydı bulunmuyor.');
    }

    if (zeroViewedProducts.length > 0) {
      lines.push('• En Az Görüntülenen / Henüz Görüntülenmemiş Ürünler (0 görüntülenme):');
      for (const p of zeroViewedProducts.slice(0, 5)) {
        lines.push(`  - ${p.name}: 0 görüntülenme`);
      }
      if (zeroViewedProducts.length > 5) {
        lines.push(`  (Diğer ${zeroViewedProducts.length - 5} aktif ürünün de görüntülenme sayısı 0'dır)`);
      }
    }

    const categoryViewEntries = categories
      .map((cat) => ({
        name: cat.name,
        count: categoryViewMap.get(cat._id.toString()) || 0,
      }))
      .sort((a, b) => b.count - a.count);

    if (categoryViewEntries.some((c) => c.count > 0)) {
      lines.push('• Kategori Bazlı Görüntülenmeler:');
      for (const c of categoryViewEntries) {
        lines.push(`  - ${c.name}: ${c.count} görüntülenme`);
      }
    }

    lines.push('');
    lines.push('ÖNEMLİ ANALİTİK VE SATIŞ KURALLARI:');
    lines.push('• Sistemde menü ve ürünler için yalnızca "görüntülenme" (ziyaret ve tıklanma) verisi bulunmaktadır.');
    lines.push('• Sipariş, satış veya ciro verisi sistemde TUTULMAMAKTADIR.');
    lines.push('• "En çok satan ürünüm hangisi?" sorulursa satış verisine erişimin olmadığını açıkla, ancak menü görüntülenmelerine göre en çok ilgi gören ürünün hangisi olduğunu alternatif olarak belirt.');
    lines.push('• "En çok görüntülenen ürünüm hangisi?" sorulduğunda doğrudan yukarıdaki en yüksek görüntülenmeye sahip ürünü ve tam görüntülenme sayısını söyle.');
    lines.push('• "En az görüntülenen 3 ürünümü söyle." gibi sorularda 0 görüntülenmeye sahip ürünlerden 3 tanesini net olarak sırala.');
    lines.push('• ASLA "zuuqrmenu platformunda analitik verisi tutulmamaktadır" DEME. Analitik verileri mevcuttur.');

    lines.push('');
    lines.push('=== MENÜ VE KATEGORİLER ===');

    if ((!categories || categories.length === 0) && (!products || products.length === 0)) {
      lines.push('Bu restorana ait henüz kayıtlı kategori veya ürün bulunmuyor.');
      return lines.join('\n');
    }

    lines.push(`Toplam Aktif Kategori Sayısı: ${categories.length}`);
    lines.push(`Toplam Ürün Sayısı: ${products.length}`);
    const activeProductsCount = productsWithViews.filter((p) => p.isAvailable).length;
    lines.push(`Aktif/Satışta Ürün Sayısı: ${activeProductsCount}`);
    if (products.length > activeProductsCount) {
      lines.push(`Tükenmiş/Pasif Ürün Sayısı: ${products.length - activeProductsCount}`);
    }

    // Map products to categories
    const productsByCategoryId = new Map();
    for (const prod of productsWithViews) {
      const catIdStr = prod.categoryId ? prod.categoryId.toString() : 'uncategorized';
      if (!productsByCategoryId.has(catIdStr)) {
        productsByCategoryId.set(catIdStr, []);
      }
      productsByCategoryId.get(catIdStr).push(prod);
    }

    lines.push('');
    lines.push('--- KATEGORİ DETAYLARI VE ÜRÜNLER ---');

    for (const cat of categories) {
      const catIdStr = cat._id.toString();
      const catProducts = productsByCategoryId.get(catIdStr) || [];
      lines.push(`\n[KATEGORİ] ${cat.name} (Sıra: ${cat.displayOrder}, Ürün Sayısı: ${catProducts.length})`);
      if (cat.description) {
        lines.push(`  Kategori Açıklaması: ${cat.description}`);
      }

      if (catProducts.length === 0) {
        lines.push('  (Bu kategoride henüz ürün yok)');
        continue;
      }

      for (const p of catProducts) {
        let pLine = `  * ${p.name} - ${p.price} TL`;
        if (p.oldPrice && p.oldPrice > p.price) {
          pLine += ` (Eski Fiyat: ${p.oldPrice} TL)`;
        }
        pLine += ` | Görüntülenme: ${p.viewCount}`;
        if (p.isFeatured) {
          pLine += ' [Öne Çıkan]';
        }
        if (!p.isAvailable) {
          pLine += ' [TÜKENDİ / SATIŞTA DEĞİL]';
        }
        lines.push(pLine);

        const description = (p.description || p.shortDescription || '').trim();
        if (description) {
          lines.push(`    Açıklama: ${description}`);
        } else {
          lines.push('    Açıklama: (Açıklama girilmemiş)');
        }

        if (Array.isArray(p.ingredients) && p.ingredients.length > 0) {
          lines.push(`    İçindekiler: ${p.ingredients.join(', ')}`);
        }
        if (Array.isArray(p.allergens) && p.allergens.length > 0) {
          lines.push(`    Alerjenler: ${p.allergens.join(', ')}`);
        }
        if (Array.isArray(p.dietaryTags) && p.dietaryTags.length > 0) {
          lines.push(`    Beslenme Etiketleri: ${p.dietaryTags.join(', ')}`);
        }
        if (p.calories) {
          lines.push(`    Kalori: ${p.calories} kcal`);
        }
      }
    }

    // Check for uncategorized products
    const uncategorized = productsByCategoryId.get('uncategorized') || [];
    if (uncategorized.length > 0) {
      lines.push(`\n[KATEGORİ] Kategorisiz / Diğer (Ürün Sayısı: ${uncategorized.length})`);
      for (const p of uncategorized) {
        let pLine = `  * ${p.name} - ${p.price} TL`;
        if (!p.isAvailable) pLine += ' [TÜKENDİ / SATIŞTA DEĞİL]';
        lines.push(pLine);
        const description = (p.description || p.shortDescription || '').trim();
        if (description) lines.push(`    Açıklama: ${description}`);
        else lines.push('    Açıklama: (Açıklama girilmemiş)');
      }
    }

    return lines.join('\n');
  } catch (error) {
    console.error('Failed to build restaurant context:', error.message);
    return 'RESTORAN BAĞLAMI:\nRestoran ve menü verileri yüklenirken bir sorun oluştu.';
  }
};

export default {
  buildRestaurantContext,
};
