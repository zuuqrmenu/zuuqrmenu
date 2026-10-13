// Demo content for the live preview in the customizer (the restaurant's own name / logo / cover are merged in).
export const previewDemoRestaurant = {
  name: 'Demo Restoran',
  description: 'Geleneksel & Modern Lezzetler',
  coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  logo: null,
  primaryColor: '#1F2937',
  secondaryColor: '#FFFFFF',
  menuViewCount: 12480,
};

const photo = (id, width = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

const product = (id, name, shortDescription, price, oldPrice, image, isFeatured = false) => ({
  id, name, shortDescription, price, oldPrice, image: photo(image), isFeatured, isAvailable: true,
});

export const previewDemoCategories = [
  {
    id: 'baslangiclar',
    name: 'Başlangıçlar',
    image: photo('photo-1544025162-d76694265947', 800),
    products: [
      product('p1', 'Çıtır Tavuk Parçaları', 'Kızarmış patates, özel dip sos ve taze yeşillik', 280, 320, 'photo-1544025162-d76694265947', true),
      product('p2', 'Akdeniz Salatası', 'Zeytin, domates, tulum peyniri ve fesleğenli zeytinyağı sosu', 240, null, 'photo-1546793665-c74683f339c1'),
    ],
  },
  {
    id: 'ana-yemekler',
    name: 'Ana Yemekler',
    image: photo('photo-1555949258-eb67b1ef0ceb', 800),
    products: [
      product('p3', 'Trüflü Makarna', 'Parmesan, taze mantar ve trüf yağı', 420, 450, 'photo-1555949258-eb67b1ef0ceb', true),
      product('p4', 'Izgara Somon & Kuşkonmaz', 'Limonlu tereyağı sosu ve fırınlanmış bebek patates', 490, 530, 'photo-1519708227418-c8fd9a32b7a2'),
    ],
  },
  {
    id: 'burger-wrap',
    name: 'Burger & Dürüm',
    image: photo('photo-1568901346375-23c9450c58cd', 800),
    products: [
      product('p7', 'Trüflü Dana Burger', 'Karamelize soğan, trüf mayonez ve patates kızartması', 380, null, 'photo-1568901346375-23c9450c58cd', true),
      product('p8', 'Çıtır Tavuk Dürüm', 'Cheddar sos, turşu ve taze yeşillikler', 270, 295, 'photo-1626700051175-6818013e1d4f'),
    ],
  },
  {
    id: 'pizza-firin',
    name: 'Taş Fırın & Pizza',
    image: photo('photo-1513104890138-7c749659a591', 800),
    products: [
      product('p9', 'Odun Ateşinde Margherita', 'San Marzano domates, taze mozzarella ve fesleğen', 340, null, 'photo-1513104890138-7c749659a591', true),
      product('p10', 'Dört Peynirli İtalyan Pizza', 'Mozzarella, gorgonzola, parmesan ve gouda peyniri', 390, 420, 'photo-1573821663912-569905455b1c'),
    ],
  },
  {
    id: 'tatlilar',
    name: 'Tatlılar',
    image: photo('photo-1551024601-bec78aea704b', 800),
    products: [
      product('p5', 'San Sebastian Cheesecake', 'Karamelize kremalı enfes klasik tatlı', 190, null, 'photo-1551024601-bec78aea704b'),
      product('p6', 'Bourbon Brownie', 'Ceviz, bitter çikolata ve vanilyalı dondurma', 170, 200, 'photo-1509440159596-0249088772ff'),
    ],
  },
  {
    id: 'icecekler',
    name: 'İçecekler & Kahve',
    image: photo('photo-1514362545857-3bc16c4c7d1b', 800),
    products: [
      product('p11', 'Ev Yapımı Çilekli Limonata', 'Taze nane yaprakları ve çilek taneleri', 120, null, 'photo-1513558161293-cdaf765ed2fd', true),
      product('p12', 'Karamel Macchiato', 'Espresso, vanilya şurubu, süt kreması ve karamel', 135, null, 'photo-1517256064527-09c73fc73e38'),
    ],
  },
];
