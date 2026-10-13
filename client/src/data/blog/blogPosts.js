// Blog metadata. Article bodies live in ./posts/<slug>.js and are loaded on demand, so the landing page
// (which only needs three cards) never downloads the full articles.
// tone: 0-5 selects the generated cover palette in blog.css.

export const blogCategories = ['Rehber', 'Tasarım', 'Büyüme', 'Teknoloji', 'Operasyon'];

export const blogPosts = [
  {
    slug: 'qr-menu-nedir-nasil-calisir',
    title: 'QR Menü Nedir? Restoranlar İçin Nasıl Çalışır?',
    excerpt: 'QR menünün ne olduğunu, müşteri ve işletme tarafında nasıl çalıştığını ve geleneksel menüden farkını sade bir dille anlatıyoruz.',
    category: 'Rehber',
    date: '2026-10-08',
    readMinutes: 6,
    tone: 0,
    keywords: ['qr menü nedir', 'dijital menü', 'qr menü nasıl çalışır'],
  },
  {
    slug: 'restoran-icin-qr-menu-nasil-olusturulur',
    title: 'Restoran İçin QR Menü Nasıl Oluşturulur? Adım Adım Rehber',
    excerpt: 'Kategorilerden QR kodun masaya konmasına kadar, bir restoranın QR menüsünü sıfırdan yayına almak için izlenecek yol.',
    category: 'Rehber',
    date: '2026-10-05',
    readMinutes: 8,
    tone: 1,
    keywords: ['qr menü oluştur', 'restoran qr menü', 'ücretsiz qr menü'],
  },
  {
    slug: 'kagit-menu-mu-qr-menu-mu-maliyet-karsilastirmasi',
    title: 'Kağıt Menü mü, QR Menü mü? Maliyet Karşılaştırması',
    excerpt: 'Baskı, güncelleme, yıpranma ve zaman maliyetini kalem kalem çıkarıyoruz. Hangi işletme için hangi seçenek mantıklı?',
    category: 'Büyüme',
    date: '2026-09-30',
    readMinutes: 7,
    tone: 2,
    keywords: ['kağıt menü maliyeti', 'qr menü fiyat', 'dijital menü avantajları'],
  },
  {
    slug: 'kafeler-icin-dijital-menu-rehberi',
    title: 'Kafeler İçin Dijital Menü Rehberi: Hız, Sadelik, Sadık Müşteri',
    excerpt: 'Yoğun saatlerde sırayı kısaltan, sezonluk ürünleri dakikalar içinde güncelleyen bir kafe menüsü nasıl kurgulanır?',
    category: 'Rehber',
    date: '2026-09-26',
    readMinutes: 6,
    tone: 3,
    keywords: ['kafe qr menü', 'kafe dijital menü', 'kahve dükkanı menü'],
  },
  {
    slug: 'qr-menu-tasarim-ipuclari',
    title: 'QR Menü Tasarımında 9 Altın Kural',
    excerpt: 'Okunabilirlik, görsel hiyerarşi, renk ve tipografi: müşterinin telefonunda gerçekten iş gören bir menü tasarımının ilkeleri.',
    category: 'Tasarım',
    date: '2026-09-22',
    readMinutes: 7,
    tone: 4,
    keywords: ['qr menü tasarımı', 'menü tasarım ipuçları', 'mobil menü tasarımı'],
  },
  {
    slug: 'menu-muhendisligi-ile-ciro-artirma',
    title: 'Menü Mühendisliği ile Ciro Artırma: Yıldız ve Bulmaca Ürünler',
    excerpt: 'Hangi ürünleri öne çıkarmalı, hangilerini menüden çıkarmalı? Menü mühendisliği matrisini QR menüde uygulamanın yolları.',
    category: 'Büyüme',
    date: '2026-09-18',
    readMinutes: 8,
    tone: 5,
    keywords: ['menü mühendisliği', 'restoran ciro artırma', 'ürün fiyatlandırma'],
  },
  {
    slug: 'qr-kod-masa-standi-baski-rehberi',
    title: 'QR Kod Masa Standı ve Baskı Rehberi: Boyut, Kontrast, Yerleşim',
    excerpt: 'Okunmayan bir QR kod, kaybedilmiş bir siparişten farksızdır. Baskı boyutu, kontrast ve masa üzerindeki konum için pratik rehber.',
    category: 'Operasyon',
    date: '2026-09-14',
    readMinutes: 6,
    tone: 0,
    keywords: ['qr kod baskı', 'masa standı', 'qr kod boyutu'],
  },
  {
    slug: 'yapay-zeka-ile-menu-hazirlama',
    title: 'Yapay Zeka ile Menü Hazırlama: PDF ve Fotoğraftan Dakikalar İçinde Menü',
    excerpt: 'Elinizdeki PDF ya da menü fotoğrafını yapay zekayla yapılandırılmış bir dijital menüye dönüştürmenin mantığı ve dikkat edilecek noktalar.',
    category: 'Teknoloji',
    date: '2026-09-10',
    readMinutes: 7,
    tone: 1,
    keywords: ['yapay zeka menü', 'pdf menü dönüştür', 'ai restoran'],
  },
  {
    slug: 'menu-urun-fotografciligi',
    title: 'Menü İçin Ürün Fotoğrafı Çekimi: Telefonla Profesyonel Sonuç',
    excerpt: 'Pahalı ekipman şart değil. Işık, açı, tabak ve düzenleme ile telefonla iştah açan menü fotoğrafları çekmenin yolları.',
    category: 'Tasarım',
    date: '2026-09-06',
    readMinutes: 7,
    tone: 2,
    keywords: ['yemek fotoğrafı', 'menü fotoğrafı', 'ürün görseli'],
  },
  {
    slug: 'menude-alerjen-ve-kalori-bilgisi',
    title: 'Menüde Alerjen ve Kalori Bilgisi: Neden ve Nasıl Gösterilmeli?',
    excerpt: 'Alerjen bilgisi müşteri güveninin parçası. Dijital menüde bu bilgiyi anlaşılır ve güncel tutmanın pratik yolları.',
    category: 'Operasyon',
    date: '2026-09-02',
    readMinutes: 6,
    tone: 3,
    keywords: ['menüde alerjen', 'kalori bilgisi menü', 'gıda alerjeni restoran'],
  },
  {
    slug: 'qr-menu-analitigi-nasil-okunur',
    title: 'QR Menü Analitiği Nasıl Okunur? Tıklamalardan Karar Çıkarmak',
    excerpt: 'Görüntülenme, popüler ürün, saatlik trafik: menü istatistiklerini fiyat, stok ve vitrin kararlarına dönüştürmenin yöntemi.',
    category: 'Büyüme',
    date: '2026-08-28',
    readMinutes: 7,
    tone: 4,
    keywords: ['menü analitiği', 'restoran istatistik', 'qr menü raporlama'],
  },
  {
    slug: 'dijital-menu-secerken-10-kriter',
    title: 'Dijital Menü Seçerken Bakmanız Gereken 10 Kriter',
    excerpt: 'Piyasada onlarca QR menü çözümü var. Doğru platformu seçmek için hız, yönetim kolaylığı, tema, destek ve maliyet kriterleri.',
    category: 'Rehber',
    date: '2026-08-24',
    readMinutes: 8,
    tone: 5,
    keywords: ['qr menü karşılaştırma', 'dijital menü seçimi', 'en iyi qr menü'],
  },
];

export const getPostMeta = (slug) => blogPosts.find((post) => post.slug === slug) || null;

const bodyLoaders = import.meta.glob('./posts/*.js');

/** Resolves the block list of an article (lazy chunk per article). */
export const loadPostBody = async (slug) => {
  const loader = bodyLoaders[`./posts/${slug}.js`];
  if (!loader) return null;
  const module = await loader();
  return module.default;
};

export const formatPostDate = (iso) => new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
