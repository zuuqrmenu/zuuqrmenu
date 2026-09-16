import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import RestaurantSettings from './models/RestaurantSettings.js';
import Menu from './models/Menu.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

const requiredSeedEnv = [
  'SEED_ADMIN_USERNAME',
  'SEED_ADMIN_PASSWORD',
  'SEED_RESTAURANT_EMAIL',
  'SEED_RESTAURANT_PASSWORD',
];
const missingSeedEnv = requiredSeedEnv.filter((name) => !process.env[name]?.trim());

if (missingSeedEnv.length) {
  throw new Error(`Missing required seed environment variables: ${missingSeedEnv.join(', ')}`);
}

const ADMIN_IDENTIFIER = process.env.SEED_ADMIN_USERNAME.trim();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const RESTAURANT_EMAIL = process.env.SEED_RESTAURANT_EMAIL.trim().toLowerCase();
const RESTAURANT_PASSWORD = process.env.SEED_RESTAURANT_PASSWORD;

const demoMenu = [
  { name: 'Başlangıçlar', products: [
    ['Çıtır Tavuk Parçaları', 220, 'Baharatlı çıtır tavuk parçaları, özel dip sos ile', 'Çıtır tavuk, özel dip sos', ['Tavuk', 'Un', 'Baharat'], ['GLUTEN_FREE'], 520],
    ['Akdeniz Salatası', 180, 'Mevsim yeşillikleri, beyaz peynir ve zeytin', 'Yeşillik, beyaz peynir, zeytin', ['Yeşillik', 'Beyaz peynir', 'Zeytin'], ['VEGETARIAN'], 260],
  ] },
  { name: 'Çorbalar', products: [
    ['Mercimek Çorbası', 120, 'Geleneksel kırmızı mercimek çorbası, limon ile', 'Kırmızı mercimek çorbası', ['Mercimek', 'Soğan', 'Havuç'], ['VEGAN', 'GLUTEN_FREE'], 210],
    ['Kremalı Mantar Çorbası', 145, 'Taze mantar ve krema ile hazırlanan sıcak çorba', 'Kremalı mantar çorbası', ['Mantar', 'Krema', 'Soğan'], ['VEGETARIAN'], 280],
  ] },
  { name: 'Ana Yemekler', products: [
    ['Izgara Köfte', 340, 'Izgara köfte, patates ve mevsim garnitürü', 'Izgara köfte, patates, garnitür', ['Dana kıyma', 'Patates', 'Mevsim sebzeleri'], ['HALAL'], 690],
    ['Tavuk Izgara', 310, 'Marine edilmiş tavuk göğsü, pilav ve ızgara sebzeler', 'Tavuk göğsü, pilav, sebze', ['Tavuk', 'Pirinç', 'Sebze'], ['GLUTEN_FREE', 'HALAL'], 560],
    ['Fettuccine Alfredo', 295, 'Kremalı parmesan sos ve taze fettucine makarna', 'Fettucine, parmesan, krema', ['Makarna', 'Parmesan', 'Krema'], ['VEGETARIAN'], 740],
  ] },
  { name: 'Burger & Sandviç', products: [
    ['Klasik Burger', 285, 'Izgara dana köfte, cheddar, marul ve özel sos', 'Dana köfte, cheddar, özel sos', ['Dana köfte', 'Cheddar', 'Burger ekmeği'], ['HALAL'], 820],
    ['Çıtır Tavuk Burger', 270, 'Çıtır tavuk, coleslaw ve ballı hardal sos', 'Çıtır tavuk, coleslaw, ballı hardal', ['Tavuk', 'Lahana', 'Hardal'], ['SPICY'], 760],
  ] },
  { name: 'Tatlılar', products: [
    ['San Sebastian Cheesecake', 220, 'İçi akışkan, fırınlanmış San Sebastian cheesecake', 'San Sebastian cheesecake', ['Krem peynir', 'Yumurta', 'Şeker'], ['VEGETARIAN'], 610],
    ['Sufle', 190, 'Sıcak çikolatalı sufle, vanilyalı dondurma ile', 'Sıcak çikolatalı sufle', ['Çikolata', 'Yumurta', 'Un'], ['VEGETARIAN'], 540],
  ] },
  { name: 'İçecekler', products: [
    ['Ev Yapımı Limonata', 95, 'Taze limon ve nane ile hazırlanan ev yapımı limonata', 'Taze limonata', ['Limon', 'Nane'], ['VEGAN', 'GLUTEN_FREE'], 120],
    ['Türk Kahvesi', 85, 'Geleneksel Türk kahvesi, lokum eşliğinde', 'Geleneksel Türk kahvesi', ['Türk kahvesi'], ['VEGAN', 'GLUTEN_FREE'], 8],
    ['Soğuk Çay', 90, 'Şeftali ve limon aromalı ferahlatıcı soğuk çay', 'Şeftalili soğuk çay', ['Çay', 'Şeftali', 'Limon'], ['VEGAN', 'GLUTEN_FREE'], 90],
  ] },
];

const upsertUser = async ({ identifier, password, name, role, restaurantId = null }) => {
  let user = await User.findOne({ email: identifier }).select('+password');

  if (!user) {
    user = new User({
      email: identifier,
      password,
      name,
      role,
      restaurantId,
      isActive: true,
    });
  } else {
    user.name = name;
    user.role = role;
    user.restaurantId = restaurantId;
    user.isActive = true;
    user.password = password;
  }

  await user.save();
  return user;
};

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  const admin = await upsertUser({
    identifier: ADMIN_IDENTIFIER,
    password: ADMIN_PASSWORD,
    name: 'Development Admin',
    role: 'ADMIN',
  });

  let restaurantUser = await User.findOne({ email: RESTAURANT_EMAIL }).select('+password');
  if (!restaurantUser) {
    restaurantUser = await upsertUser({
      identifier: RESTAURANT_EMAIL,
      password: RESTAURANT_PASSWORD,
      name: 'Test Restoran Owner',
      role: 'RESTAURANT_USER',
    });
  }

  let restaurant = await Restaurant.findOne({ slug: 'test-restoran' });
  if (!restaurant) {
    restaurant = new Restaurant({
      name: 'Test Restoran',
      slug: 'test-restoran',
      ownerId: restaurantUser._id,
      status: 'ACTIVE',
      menuStatus: 'DRAFT',
      businessType: 'RESTAURANT',
      city: 'Istanbul',
      address: 'Development address',
      phone: '+90 555 000 0000',
    });
  } else {
    restaurant.name = 'Test Restoran';
    restaurant.status = 'ACTIVE';
    restaurant.menuStatus = 'DRAFT';
  }

  const linkedRestaurantUser = await upsertUser({
    identifier: RESTAURANT_EMAIL,
    password: RESTAURANT_PASSWORD,
    name: 'Test Restoran Owner',
    role: 'RESTAURANT_USER',
    restaurantId: restaurant._id,
  });

  restaurant.ownerId = linkedRestaurantUser._id;
  await restaurant.save();

  await RestaurantSettings.findOneAndUpdate(
    { restaurantId: restaurant._id },
    {
      $set: {
        description: 'Development test restaurant',
        primaryColor: '#1f2937',
        secondaryColor: '#ffffff',
        theme: 'MINIMAL',
      },
      $setOnInsert: { restaurantId: restaurant._id },
    },
    { upsert: true, new: true, runValidators: true },
  );

  await Menu.findOneAndUpdate(
    { restaurantId: restaurant._id },
    {
      $set: { name: 'Test Restoran Menüsü' },
      $setOnInsert: { restaurantId: restaurant._id },
    },
    { upsert: true, new: true, runValidators: true },
  );

  const menu = await Menu.findOne({ restaurantId: restaurant._id });
  for (const [categoryIndex, categoryData] of demoMenu.entries()) {
    const category = await Category.findOneAndUpdate(
      { restaurantId: restaurant._id, menuId: menu._id, name: categoryData.name },
      { $set: { displayOrder: categoryIndex, isActive: true }, $setOnInsert: { restaurantId: restaurant._id, menuId: menu._id, name: categoryData.name } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    for (const [productIndex, [name, price, description, shortDescription, ingredients, dietaryTags, calories]] of categoryData.products.entries()) {
      await Product.findOneAndUpdate(
        { restaurantId: restaurant._id, categoryId: category._id, name },
        {
          $set: { price, description, shortDescription, ingredients, dietaryTags, calories, displayOrder: productIndex, isAvailable: true },
          $setOnInsert: { restaurantId: restaurant._id, categoryId: category._id, name },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }
  }

  const adminPasswordMatches = await admin.comparePassword(ADMIN_PASSWORD);
  const restaurantPasswordMatches = await linkedRestaurantUser.comparePassword(RESTAURANT_PASSWORD);

  if (!adminPasswordMatches || !restaurantPasswordMatches) {
    throw new Error('Seed verification failed: password hash comparison did not match');
  }

  console.log('Development seed completed.');
  console.log(`Admin: ${admin.email} (${admin.role}, active=${admin.isActive})`);
  console.log(`Restaurant user: ${linkedRestaurantUser.email} (${linkedRestaurantUser.role}, active=${linkedRestaurantUser.isActive})`);
  console.log(`Restaurant: ${restaurant.slug} (${restaurant.status}, menu=${restaurant.menuStatus})`);
};

try {
  await seed();
} catch (error) {
  console.error(`Development seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
