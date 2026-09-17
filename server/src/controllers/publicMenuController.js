import Restaurant from '../models/Restaurant.js';
import RestaurantSettings from '../models/RestaurantSettings.js';
import Menu from '../models/Menu.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import MenuView from '../models/MenuView.js';
import User from '../models/User.js';
import { findPublicRestaurant } from '../utils/publicRestaurant.js';

const escapeXml = (value) => String(value).replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character]));

export const getPublicSitemap = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'RESTAURANT_USER' })
      .select('username restaurantId')
      .populate({ path: 'restaurantId', match: { status: 'ACTIVE', menuStatus: 'PUBLISHED' }, select: 'updatedAt' })
      .lean();
    const urls = users
      .filter((user) => user.restaurantId && user.username)
      .map((user) => {
        const url = escapeXml(`https://zuuqrmenu.com/${encodeURIComponent(user.username)}/menu`);
        return `  <url><loc>${url}</loc>${user.restaurantId.updatedAt ? `<lastmod>${new Date(user.restaurantId.updatedAt).toISOString()}</lastmod>` : ''}<changefreq>daily</changefreq><priority>0.8</priority></url>`;
      })
      .join('\n');
    const homepage = '  <url><loc>https://zuuqrmenu.com/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>';
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${homepage}${urls ? `\n${urls}` : ''}\n</urlset>`);
  } catch (error) {
    next(error);
  }
};

const unavailableResponse = (res) => res.status(404).json({
  error: 'Bu menü şu anda kullanılamıyor.',
  code: 'MENU_UNAVAILABLE',
});

export const getPublicMenu = async (req, res, next) => {
  try {
    const restaurant = await findPublicRestaurant(req.params.username);

    if (!restaurant) return unavailableResponse(res);

    if (restaurant.menuStatus === 'HIDDEN') {
      return res.json({
        status: 'HIDDEN',
        restaurant: { name: restaurant.name, slug: restaurant.slug, menuStatus: restaurant.menuStatus },
        menu: null,
        categories: [],
      });
    }

    if (restaurant.menuStatus !== 'PUBLISHED') {
      return res.json({
        status: 'PREPARING',
        restaurant: { name: restaurant.name, slug: restaurant.slug, menuStatus: restaurant.menuStatus },
        menu: null,
        categories: [],
      });
    }

    const [settings, menu, categories] = await Promise.all([
      RestaurantSettings.findOne({ restaurantId: restaurant._id })
        .select('description logo coverImage storeImage primaryColor secondaryColor theme socialMedia activeMenuId activeMenuThemeId savedMenus menuThemes')
        .lean(),
      Menu.findOne({ restaurantId: restaurant._id }).select('name').lean(),
      Category.find({ restaurantId: restaurant._id, isActive: true })
        .select('_id name description displayOrder')
        .sort({ displayOrder: 1, name: 1 })
        .lean(),
    ]);

    if (!menu) return unavailableResponse(res);

    Promise.all([
      MenuView.create({ restaurantId: restaurant._id, userAgent: req.get('user-agent'), ip: req.ip }),
      Restaurant.updateOne({ _id: restaurant._id }, { $inc: { menuViewCount: 1 } }),
    ]).catch((trackingError) => console.error('Menu view tracking failed:', trackingError.message));

    const products = await Product.find({
      restaurantId: restaurant._id,
      categoryId: { $in: categories.map((category) => category._id) },
    })
      .select('_id categoryId name shortDescription description price oldPrice image ingredients allergens dietaryTags calories isAvailable isFeatured displayOrder')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const productsByCategory = products.reduce((grouped, product) => {
      const categoryId = product.categoryId.toString();
      if (!grouped[categoryId]) grouped[categoryId] = [];
        grouped[categoryId].push({
          categoryId: product.categoryId,
        id: product._id,
        name: product.name,
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        image: product.image || null,
        ingredients: product.ingredients || [],
        allergens: product.allergens || [],
        dietaryTags: product.dietaryTags || [],
        calories: product.calories ?? null,
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
      });
      return grouped;
    }, {});

    const publicCategories = categories
      .map((category) => ({
        id: category._id,
        name: category.name,
        description: category.description || '',
        products: productsByCategory[category._id.toString()] || [],
      }))
      .filter((category) => category.products.length > 0);

    const sourceMenus = Array.isArray(settings?.savedMenus) && settings.savedMenus.length ? settings.savedMenus : (Array.isArray(settings?.menuThemes) ? settings.menuThemes : []);
    const activeMenuId = settings?.activeMenuId || settings?.activeMenuThemeId || sourceMenus[0]?._id || null;
    const savedTheme = sourceMenus.find((item) => String(item._id) === String(activeMenuId)) || sourceMenus[0] || null;
    const menuTheme = savedTheme ? {
      id: savedTheme._id,
      name: savedTheme.name,
      font: savedTheme.font,
      layout: savedTheme.layout,
      theme: savedTheme.theme,
      mode: savedTheme.mode || 'LIGHT',
      primaryColor: savedTheme.primaryColor,
      secondaryColor: savedTheme.secondaryColor,
    } : null;

    res.json({
      restaurant: {
        name: restaurant.name,
        slug: restaurant.slug,
        description: settings?.description || '',
        address: restaurant.address || '',
        city: restaurant.city || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        website: restaurant.website || '',
        logo: settings?.logo || null,
        coverImage: settings?.coverImage || null,
        storeImage: settings?.storeImage || null,
        primaryColor: settings?.primaryColor || '#1f2937',
        secondaryColor: settings?.secondaryColor || '#ffffff',
        theme: settings?.theme || 'MINIMAL',
        socialMedia: Array.isArray(settings?.socialMedia) ? settings.socialMedia.filter((item) => item && item.url).map((item) => ({ platform: item.platform, url: item.url.trim() })) : [],
        menuStatus: restaurant.menuStatus,
        menuTheme,
        activeMenuId,
        savedMenus: sourceMenus,
      },
      menu: { name: menu.name },
      categories: publicCategories,
    });
  } catch (error) {
    next(error);
  }
};