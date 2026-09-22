/**
 * Product Templates, Smart Autocomplete, and Ingredients/Allergens Dictionary
 * 100% Static / Local Data - Absolutely NO AI API or Network Calls
 */

// Turkish text normalization helper
export const normalizeTurkishProductText = (text = '') => {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, ' ');
};

/* ══════════════════════════════════════════════════════════════════════
   1. Comprehensive Product Catalogue (Ready-Made Delicious Descriptions)
   ══════════════════════════════════════════════════════════════════════ */
export const PRODUCT_CATALOGUE = [
  // ── Çorbalar ──
  {
    name: 'Mercimek Çorbası',
    category: 'Çorbalar',
    description: 'Özenle süzülmüş kırmızı mercimek, tereyağında kavrulmuş taze sebzeler ve hafif nane sosu eşliğinde sıcacık bir lezzet.',
    shortDescription: 'Geleneksel tereyağlı süzme kırmızı mercimek çorbası.',
  },
  {
    name: 'Ezogelin Çorbası',
    category: 'Çorbalar',
    description: 'Kırmızı mercimek, pirinç ve bulgurun nane ve pul biberli tereyağ sosuyla harmanlandığı doyurucu Anadolu klasiği.',
    shortDescription: 'Baharatlı tereyağ sosuyla zenginleştirilmiş ezogelin çorbası.',
  },
  {
    name: 'Domates Çorbası',
    category: 'Çorbalar',
    description: 'Fırınlanmış taze tarla domatesleri, hafif krema dokunuşu ve rendelenmiş kaşar peyniri eşliğinde kadifemsi kıvam.',
    shortDescription: 'Rendelenmiş kaşar peyniri ve kruton ekmek ile.',
  },
  {
    name: 'Yayla Çorbası',
    category: 'Çorbalar',
    description: 'Süzme yoğurt, pirinç ve mis kokulu nane sosunun tereyağıyla buluştuğu ferahlatıcı geleneksel lezzet.',
    shortDescription: 'Nane soslu, süzme yoğurtlu hafif çorba.',
  },
  {
    name: 'Tavuk Suyu Çorbası',
    category: 'Çorbalar',
    description: 'Ağır ateşte pişirilmiş köy tavuğu suyu, tel şehriye, taze havuç parçaları ve limon ferahlığı ile şifa kaynağı.',
    shortDescription: 'Tel şehriyeli, taze sebzeli şifalı tavuk suyu çorbası.',
  },
  {
    name: 'Kelle Paça Çorbası',
    category: 'Çorbalar',
    description: 'Saatlerce kısık ateşte demlenerek pişirilen zengin et suyu, özel sarımsaklı sirke ve kızgın biberli tereyağı sosuyla.',
    shortDescription: 'Sarımsaklı sirke ve acı tereyağ sosu ile.',
  },
  {
    name: 'Kremalı Mantar Çorbası',
    category: 'Çorbalar',
    description: 'Taze kültür mantarlarının tereyağında sotelenip ipeksi krema ve taze kekik aromasıyla birleştiği nefis çorba.',
    shortDescription: 'Taze kekik aromalı, yoğun kıvamlı mantar çorbası.',
  },
  {
    name: 'Tarhana Çorbası',
    category: 'Çorbalar',
    description: 'Ev yapımı doğal tarhana, tereyağı ve hafif acı pul biber aromasıyla sofranıza geleneksel sıcaklık katıyor.',
    shortDescription: 'Geleneksel el yapımı tereyağlı tarhana çorbası.',
  },

  // ── Başlangıçlar & Mezeler ──
  {
    name: 'Humus',
    category: 'Başlangıçlar',
    description: 'Haşlanmış taze nohut, tahin, taze sarımsak, sızma zeytinyağı ve kimyonun pürüzsüz uyumu; ılık tereyağ dokunuşuyla.',
    shortDescription: 'Sızma zeytinyağlı ve kimyonlu ipeksi humus.',
  },
  {
    name: 'Haydari',
    category: 'Başlangıçlar',
    description: 'Koyu kıvamlı süzme yoğurt, taze nane, sarımsak, ezilmiş beyaz peynir ve soğuk sıkım zeytinyağının mükemmel dengesi.',
    shortDescription: 'Taze naneli ve sarımsaklı süzme yoğurt mezesi.',
  },
  {
    name: 'Şakşuka',
    category: 'Başlangıçlar',
    description: 'Kızartılmış patlıcan, kabak ve biber küplerinin sarımsaklı zengin domates sosuyla demlenerek buluştuğu Akdeniz klasiği.',
    shortDescription: 'Sarımsaklı domates soslu fırınlanmış patlıcan mezesi.',
  },
  {
    name: 'Sigara Böreği',
    category: 'Başlangıçlar',
    description: 'İnce el açması yufkaya sarılı yağlı beyaz peynir ve taze maydanoz dolgusu, altın sarısı çıtır kıvamıyla sıcacık sunulur.',
    shortDescription: 'Peynir ve maydanoz dolgulu altın sarısı çıtır börekler.',
  },
  {
    name: 'Paçanga Böreği',
    category: 'Başlangıçlar',
    description: 'Çıtır yufka içerisine sarılmış kaliteli çemenli pastırma, eriyen kaşar peyniri, domates ve biberin karşı konulmaz uyumu.',
    shortDescription: 'Pastırma ve eriyen kaşar peynirli çıtır sıcak börek.',
  },
  {
    name: 'Mücver',
    category: 'Başlangıçlar',
    description: 'Rendelenmiş taze kabak, dereotu, taze soğan ve beyaz peynirin hafif kızartılıp süzme yoğurtla servis edildiği hafif lezzet.',
    shortDescription: 'Sarımsaklı yoğurt ile servis edilen kabak mücveri.',
  },
  {
    name: 'Bruschetta',
    category: 'Başlangıçlar',
    description: 'Kızarmış ekşi mayalı baget ekmekleri üzerinde fesleğenli domates konfi, sarımsak ve kaliteli sızma zeytinyağı dokunuşu.',
    shortDescription: 'Fesleğenli domates ve zeytinyağlı İtalyan çıtır ekmekleri.',
  },
  {
    name: 'Karides Güveç',
    category: 'Başlangıçlar',
    description: 'Toprak güveçte tereyağı, sarımsak, mantar ve domates ile fırınlanıp üzerine kaşar eritilerek sunulan enfes deniz lezzeti.',
    shortDescription: 'Fırında sarımsaklı ve kaşarlı tereyağlı güveç karides.',
  },

  // ── Kahvaltılıklar ──
  {
    name: 'Serpme Kahvaltı',
    category: 'Kahvaltı',
    description: 'Yöresel peynir çeşitleri, zeytinler, ev reçelleri, bal-kaymak, sıcak pişi, sahanda yumurta ve sınırsız çay ile zengin ziyafet.',
    shortDescription: 'Zengin yöresel lezzetler ve sınırsız taze çay ile.',
  },
  {
    name: 'Menemen',
    category: 'Kahvaltı',
    description: 'Köz kokulu sivri biber ve taze domateslerin tereyağında ağır ağır pişip yumurta ile buluştuğu sulu ve nefis tava klasiği.',
    shortDescription: 'Tereyağlı, taze domates ve biberli geleneksel tava lezzeti.',
  },
  {
    name: 'Sucuklu Yumurta',
    category: 'Kahvaltı',
    description: 'Doğal fermente kasap sucuğunun kendi leziz yağında pişirilip taze köy yumurtasıyla taçlandırıldığı enfes sahan lezzeti.',
    shortDescription: 'Hakiki kasap sucuğu ve taze köy yumurtası ile.',
  },
  {
    name: 'Kuymak (Mıhlama)',
    category: 'Kahvaltı',
    description: 'Özel Karadeniz mısır unu, mis kokulu yayık tereyağı ve uzayan kolot peynirinin döküm tavada sıcak dansı.',
    shortDescription: 'Yayık tereyağı ve uzayan kolot peynirli Karadeniz lezzeti.',
  },
  {
    name: 'Pancake Tabağı',
    category: 'Kahvaltı',
    description: 'Puf puf kabarmış taze pancake katları, mevsim meyveleri, çikolata sosu ve hakiki akçaağaç şurubu eşliğinde tatlı başlangıç.',
    shortDescription: 'Taze meyveler, Nutella ve akçaağaç şurubu ile.',
  },

  // ── Burgerler & Sandviçler ──
  {
    name: 'Klasik Burger',
    category: 'Burger & Sandviçler',
    description: '140g dinlendirilmiş dana köfte, taze marul, domates, karamelize soğan ve özel burger sosu; çıtır patates kızartması ile.',
    shortDescription: '140g dana köfte, karamelize soğan ve çıtır patates ile.',
  },
  {
    name: 'Cheeseburger',
    category: 'Burger & Sandviçler',
    description: 'Izgara dana köfte üzerine eritilmiş duble cheddar peyniri, kornişon turşu, karamelize soğan ve ev yapımı füme sos.',
    shortDescription: 'Eritilmiş duble cheddar, dana köfte ve patates kızartması.',
  },
  {
    name: 'Tavuk Burger',
    category: 'Burger & Sandviçler',
    description: 'Özel baharatlarla marine edilmiş çıtır panelenmiş tavuk göğsü, taze coleslaw salatası ve ballı hardallı mayonez sos.',
    shortDescription: 'Çıtır tavuk göğsü, coleslaw ve ballı hardal sosuyla.',
  },
  {
    name: 'Crispy Chicken Burger',
    category: 'Burger & Sandviçler',
    description: 'Dışı altın rengi ekstra çıtır mısır gevreği kaplı sulu tavuk fileto, cheddar peyniri ve hafif acılı chipotle sos ile.',
    shortDescription: 'Ekstra çıtır tavuk fileto, cheddar ve chipotle sos.',
  },
  {
    name: 'Kulüp Sandviç (Club Sandwich)',
    category: 'Burger & Sandviçler',
    description: 'Kızarmış üç kat tost ekmeği arasında ızgara tavuk dilimleri, dana füme et, yumurta, kaşar peyniri, domates ve mayonez.',
    shortDescription: 'Üç kat kızarmış ekmekte tavuk, füme et ve peynir dolgusu.',
  },
  {
    name: 'Kaşarlı Tost',
    category: 'Burger & Sandviçler',
    description: 'Özel taş fırın tost ekmeğinde bol taze kaşar peynirinin tereyağıyla çıtır çıtır basıldığı doyurucu ve klasik lezzet.',
    shortDescription: 'Bol eriyen kaşar peyniri ve tereyağlı çıtır ekmek.',
  },
  {
    name: 'Karışık Tost',
    category: 'Burger & Sandviçler',
    description: 'Kaliteli kasap sucuğu ve bol kaşar peynirinin tereyağlı tost ekmeğinde harmanlandığı günün her saatine uygun ziyafet.',
    shortDescription: 'Kasap sucuğu, bol kaşar peyniri ve domates dilimi ile.',
  },
  {
    name: 'Ayvalık Tostu',
    category: 'Burger & Sandviçler',
    description: 'Özel Ayvalık ekmeğinde sucuk, sosis, kaşar peyniri, rus salatası, turşu ve ketçap-mayonez dolu dev lezzet.',
    shortDescription: 'Hakiki Ayvalık ekmeğinde bol malzemeli efsane tost.',
  },

  // ── Pizzalar ──
  {
    name: 'Margherita Pizza',
    category: 'Pizza',
    description: 'İncecik İtalyan hamuru üzerinde taze San Marzano domates sosu, bol mozzarella peyniri ve mis kokulu taze fesleğen yaprakları.',
    shortDescription: 'Taze mozzarella, fesleğen ve zengin domates sosu.',
  },
  {
    name: 'Karışık Pizza',
    category: 'Pizza',
    description: 'Domates sosu ve mozzarella tabanı üzerine dana sucuk, sosis, taze mantar, yeşil biber, siyah zeytin ve mısır şöleni.',
    shortDescription: 'Sucuk, sosis, mantar, zeytin, biber ve mısır ile.',
  },
  {
    name: 'Pepperoni Pizza',
    category: 'Pizza',
    description: 'İnce çıtır hamur, zengin mozzarella peyniri ve fırında nar gibi kızarmış bol dana pepperoni dilimlerinin enfes uyumu.',
    shortDescription: 'Bol dana pepperoni, mozzarella ve özel domates sos.',
  },
  {
    name: 'Dört Peynirli Pizza (Quattro Formaggi)',
    category: 'Pizza',
    description: 'Mozzarella, gorgonzola, parmesan ve taze ricotta peynirlerinin fırında eriyerek harmanlandığı yoğun peynir deneyimi.',
    shortDescription: 'Mozzarella, parmesan, gorgonzola ve ricotta uyumu.',
  },
  {
    name: 'Barbekü Tavuklu Pizza',
    category: 'Pizza',
    description: 'Tütsülenmiş barbekü sosu, ızgara tavuk parçaları, kırmızı soğan, mısır ve bol mozzarella peynirli modern İtalyan yorumu.',
    shortDescription: 'Tütsülenmiş barbekü soslu ızgara tavuk ve mozzarella.',
  },

  // ── Makarnalar ──
  {
    name: 'Penne Arabbiata',
    category: 'Makarna',
    description: 'Al dente haşlanmış penne makarnası, acılı sarımsaklı taze domates sosu, dilim siyah zeytin ve rendelenmiş parmesan peyniri.',
    shortDescription: 'Hafif acılı domates sosu, sarımsak ve parmesan peyniri ile.',
  },
  {
    name: 'Fettuccine Alfredo',
    category: 'Makarna',
    description: 'Taze mantar ve marine tavuk dilimlerinin tereyağı, yoğun krema ve yıllanmış parmesan sosuyla buluştuğu ipeksi makarna.',
    shortDescription: 'Kremalı tavuk, taze mantar ve parmesan soslu fettuccine.',
  },
  {
    name: 'Spaghetti Bolognese',
    category: 'Makarna',
    description: 'Ağır ateşte sebzeler ve domates sosuyla demlendirilmiş dana kıymalı geleneksel İtalyan ragù sosu ve taze fesleğen.',
    shortDescription: 'Ağır ateşte pişmiş dana kıymalı zengin domates sosu.',
  },
  {
    name: 'Kayseri Mantısı',
    category: 'Makarna',
    description: 'İncecik el açması hamura sarılı baharatlı dana kıyma taneleri, sarımsaklı süzme yoğurt ve kızgın naneli tereyağ sosu ile.',
    shortDescription: 'Sarımsaklı yoğurt, naneli pul biberli tereyağ sosu ile.',
  },

  // ── Izgaralar & Ana Yemekler ──
  {
    name: 'Izgara Köfte',
    category: 'Ana Yemekler',
    description: 'Özel baharatlarla yoğrulmuş sulu dana ızgara köfteler, közlenmiş biber, domates, tırnak pide ve sumaklı soğan eşliğinde.',
    shortDescription: 'Közlenmiş sebzeler, pilav ve sumaklı soğan ile.',
  },
  {
    name: 'Kasap Köfte',
    category: 'Ana Yemekler',
    description: 'Satır kıymasından hazırlanan dolgun ve sulu kasap köftesi, özel baharat dengesi ve ızgara lezzetiyle sofranın yıldızı.',
    shortDescription: 'Satır kıymasından doyurucu ve sulu kasap köftesi.',
  },
  {
    name: 'Tavuk Şiş',
    category: 'Ana Yemekler',
    description: 'Zeytinyağı, yoğurt ve kekikle marine edilmiş yumuşacık tavuk göğsü küpleri; ızgara sebzeler ve tereyağlı pirinç pilavı ile.',
    shortDescription: 'Özel marinasyonlu yumuşak tavuk şiş, pilav ve köz sebze.',
  },
  {
    name: 'Kuzu Şiş',
    category: 'Ana Yemekler',
    description: 'Körpe kuzu but etinin zeytinyağı ve taze biberiyeyle marine edilip kömür ateşinde lokum kıvamında pişirilmiş hali.',
    shortDescription: 'Kömür ateşinde pişmiş lokum kıvamında marine kuzu şiş.',
  },
  {
    name: 'Adana Kebap',
    category: 'Ana Yemekler',
    description: 'Zırh kıyması kuzu eti, pul biber ve kuyruk yağının şişte kömür ateşinde enfes uyumu; lavaş ve közlenmiş biberler eşliğinde.',
    shortDescription: 'Zırhtan çekilmiş hafif acılı zengin kuzu kebabı.',
  },
  {
    name: 'Urfa Kebap',
    category: 'Ana Yemekler',
    description: 'Zırhta çekilmiş taze kuzu eti ve özel baharatların acısız ve dengeli lezzeti; sıcacık tırnak pide üzerinde servis edilir.',
    shortDescription: 'Zırhtan çekilmiş acısız kuzu kıyma kebabı.',
  },
  {
    name: 'Dana Antrikot',
    category: 'Ana Yemekler',
    description: 'Mermerimsi yağ dokusuna sahip 220g dinlendirilmiş dana antrikot; fırın patates, ızgara sebzeler ve demi-glace sos ile.',
    shortDescription: '220g dinlendirilmiş ızgara dana antrikot ve fırın sebze.',
  },
  {
    name: 'Ali Nazik',
    category: 'Ana Yemekler',
    description: 'Közlenmiş patlıcanlı sarımsaklı süzme yoğurt yatağı üzerinde tereyağında sotelenmiş yumuşacık lokum dana eti parçaları.',
    shortDescription: 'Köz patlıcanlı yoğurt yatağında sotelenmiş lokum dana eti.',
  },
  {
    name: 'Körili Tavuk',
    category: 'Ana Yemekler',
    description: 'Jülyen tavuk fileto parçaları, taze mantar ve renkli biberlerin aromatik köri sosu ve taze krema ile tavada sotesi.',
    shortDescription: 'Aromatik köri soslu kremalı tavuk sote ve pilav.',
  },

  // ── Salatalar ──
  {
    name: 'Sezar Salata (Tavuklu)',
    category: 'Salatalar',
    description: 'Taze göbek marul yaprakları, ızgara tavuk dilimleri, sarımsaklı çıtır kruton ekmekler, parmesan peyniri ve Sezar sosu.',
    shortDescription: 'Izgara tavuk, kruton ve parmesanlı Sezar salata.',
  },
  {
    name: 'Çoban Salata',
    category: 'Salatalar',
    description: 'Küp doğranmış tarla domatesi, çıtır salatalık, sivri biber, kuru soğan, taze maydanoz, sızma zeytinyağı ve nar ekşisi.',
    shortDescription: 'Geleneksel taze sebzeler, zeytinyağı ve nar ekşisi ile.',
  },
  {
    name: 'Akdeniz Salatası',
    category: 'Salatalar',
    description: 'Taze Akdeniz yeşillikleri, cherry domates, kalamata zeytin, küp beyaz peynir, ceviz içi ve ballı hardallı zeytinyağı sosu.',
    shortDescription: 'Taze yeşillikler, beyaz peynir, ceviz ve zeytinyağı.',
  },
  {
    name: 'Hellim Peynirli Salata',
    category: 'Salatalar',
    description: 'Izgara edilmiş ılık hellim peyniri dilimleri, taze roka, kuru domates, nar taneleri ve hafif balzamik sirke sosu.',
    shortDescription: 'Izgara hellim peyniri, taze roka ve balzamik sos ile.',
  },

  // ── Tatlılar ──
  {
    name: 'San Sebastian Cheesecake',
    category: 'Tatlılar',
    description: 'Dışı hafif karamelize yanık dokulu, içi ipeksi ve akışkan kıvamlı efsane İspanyol keki; ılık Belçika çikolatası eşliğinde.',
    shortDescription: 'İpeksi akışkan kıvam ve ılık eritilmiş Belçika çikolatası ile.',
  },
  {
    name: 'Tiramisu',
    category: 'Tatlılar',
    description: 'Espresso ile ıslatılmış savoiardi kedidili bisküvileri, kadifemsi mascarpone peynir kreması ve yoğun bitter kakao tozu.',
    shortDescription: 'Orijinal İtalyan mascarpone kreması ve yoğun espresso aroması.',
  },
  {
    name: 'Sufle (Çikolatalı)',
    category: 'Tatlılar',
    description: 'Fırından yeni çıkmış, içi sıcacık akışkan bitter çikolata dolgulu kek; yanında bir top vanilyalı dondurma ile.',
    shortDescription: 'Sıcak akışkan çikolatalı sufle ve vanilyalı dondurma.',
  },
  {
    name: 'Fıstıklı Baklava',
    category: 'Tatlılar',
    description: '40 kat incecik el açması yufka arasına bol Antep fıstığı ve doğal pancar şekeri şerbetiyle çıtır çıtır Gaziantep lezzeti.',
    shortDescription: 'Bol Antep fıstıklı, çıtır geleneksel Gaziantep baklavası.',
  },
  {
    name: 'Künefe',
    category: 'Tatlılar',
    description: 'Özel tel kadayıf arasına konulan taze tuzsuz Hatay peynirinin tereyağında nar gibi kızartılıp ılık şerbetle buluşması.',
    shortDescription: 'Sıcak eriyen Hatay peyniri ve Antep fıstıklı künefe.',
  },
  {
    name: 'Fırın Sütlaç',
    category: 'Tatlılar',
    description: 'Köy sütü, pirinç ve vanilyanın toprak güveçte fırınlanarak üzeri nar gibi kızartıldığı hafif ve pürüzsüz sütlü tatlı.',
    shortDescription: 'Üzeri fırınlanmış geleneksel toprak güveçte sütlaç.',
  },
  {
    name: 'Magnolia (Çilekli)',
    category: 'Tatlılar',
    description: 'Hafif ipeksi vanilyalı krema katmanları arasında taze bahçe çilekleri ve ince çekilmiş bisküvi kırıntılarının uyumu.',
    shortDescription: 'Taze çilek dilimleri ve bisküvili ipeksi krema.',
  },

  // ── Sıcak İçecekler & Kahveler ──
  {
    name: 'Türk Kahvesi',
    category: 'İçecekler',
    description: 'Taze kavrulmuş kaliteli Arabica çekirdeklerinden bol köpüklü geleneksel pişirim; yanında lokum ve su ile servis edilir.',
    shortDescription: 'Geleneksel bol köpüklü Türk kahvesi ve lokum.',
  },
  {
    name: 'Espresso',
    category: 'İçecekler',
    description: 'İnce öğütülmüş seçkin kahve çekirdeklerinden yüksek basınçla demlenmiş yoğun aromalı ve altın renkli kremalı shot.',
    shortDescription: 'Yoğun gövdeli ve zengin kremalı İtalyan klasiği.',
  },
  {
    name: 'Americano',
    category: 'İçecekler',
    description: 'Çift shot taze espresso üzerine eklenen sıcak su ile dengeli, yumuşak içimli ve zengin aromalı filtre kahve hissi.',
    shortDescription: 'Çift shot espresso ve sıcak suyun dengeli uyumu.',
  },
  {
    name: 'Caffe Latte',
    category: 'İçecekler',
    description: 'Tek shot taze espressonun kadifemsi sıcak süt ve hafif süt kremasıyla buluştuğu yumuşacık kahve keyfi.',
    shortDescription: 'Kadifemsi sıcak süt ve taze espresso uyumu.',
  },
  {
    name: 'Cappuccino',
    category: 'İçecekler',
    description: 'Eşit oranda espresso, sıcak süt ve yoğun kadifemsi süt köpüğünün üzerine serpiştirilmiş hafif kakao dokunuşu.',
    shortDescription: 'Yoğun süt köpüğü ve taze espresso lezzeti.',
  },
  {
    name: 'Filtre Kahve',
    category: 'İçecekler',
    description: 'Taze çekilmiş yöresel single origin kahve çekirdeklerinden taze demlenen berrak ve zengin gövdeli fincan.',
    shortDescription: 'Günün taze demlenmiş aromatik filtre kahvesi.',
  },
  {
    name: 'Melisa Çayı',
    category: 'İçecekler',
    description: 'Doğal kurutulmuş taze melisa yapraklarının sıcak suda demlenmesiyle hazırlanan dinlendirici ve sakinleştirici bitki çayı.',
    shortDescription: 'Doğal sakinleştirici ve hafif narenciye aromalı bitki çayı.',
  },
  {
    name: 'Ihlamur',
    category: 'İçecekler',
    description: 'Taze ıhlamur çiçeklerinin elma dilimleri ve tarçın çubuğu eşliğinde demlendiği sıcacık kış şifası; bal ile sunulur.',
    shortDescription: 'Bal ve limon eşliğinde demlenmiş taze çiçek ıhlamur.',
  },
  {
    name: 'Demleme Çay',
    category: 'İçecekler',
    description: 'Doğu Karadeniz yaylalarının taze sürgün çay yapraklarından demlenen berrak, taze ve tavşan kanı ince belli bardak çay.',
    shortDescription: 'Taze demlenmiş berrak Karadeniz çayı.',
  },
  {
    name: 'Sıcak Çikolata',
    category: 'İçecekler',
    description: 'Hakiki Belçika çikolatası ve taze sütün yoğun kıvamda eritilmesiyle hazırlanan sıcacık, kremsi ve tatlı kupa.',
    shortDescription: 'Yoğun Belçika çikolatası ve sıcak süt kreması.',
  },
  {
    name: 'Salep',
    category: 'İçecekler',
    description: 'Doğal dağ salebi ve tam yağlı sütün kısık ateşte demlenmesiyle elde edilen yoğun kadife içecek; üzeri bol tarçınlı.',
    shortDescription: 'Hakiki dağ salebi ve mis kokulu toz tarçın ile.',
  },

  // ── Soğuk İçecekler ──
  {
    name: 'Ev Yapımı Limonata',
    category: 'İçecekler',
    description: 'Taze sıkılmış sulu limonlar, nane yaprakları ve hafif şeker şurubuyla hazırlanan serinletici ferahlık.',
    shortDescription: 'Taze nane yaprakları ve limon dilimi eşliğinde soğuk servis.',
  },
  {
    name: 'Iced Latte',
    category: 'İçecekler',
    description: 'Duble shot taze espresso, soğuk süt ve bol buz parçalarının cam bardakta katmanlı ferahlatıcı dansı.',
    shortDescription: 'Buz gibi soğuk süt ve taze espresso katmanı.',
  },
  {
    name: 'Iced Americano',
    category: 'İçecekler',
    description: 'Buz dolu bardağa eklenen soğuk su ve duble shot taze espressonun sunduğu berrak, şekersiz ve ferahlatıcı kahve keyfi.',
    shortDescription: 'Bol buz ve çift shot espresso ile yoğun serinlik.',
  },
  {
    name: 'Yayık Ayranı',
    category: 'İçecekler',
    description: 'Doğal köy yoğurdu ve taze kaynak suyunun meşe yayıkta çalkalanmasıyla hazırlanan bol köpüklü geleneksel içecek.',
    shortDescription: 'Bol köpüklü, doğal köy yoğurdundan geleneksel ayran.',
  },
  {
    name: 'Taze Sıkma Portakal Suyu',
    category: 'İçecekler',
    description: 'Mevsimin sulu ve tatlı Akdeniz portakallarından sipariş üzerine anında sıkılan %100 doğal C vitamini deposu.',
    shortDescription: 'Sipariş üzerine taze sıkılmış %100 doğal portakal suyu.',
  },
  {
    name: 'Çilekli Milkshake',
    category: 'İçecekler',
    description: 'Hakiki vanilyalı dondurma, taze çilek püresi ve soğuk sütün mikserde kremamsı kıvama gelene kadar çırpılmış hali.',
    shortDescription: 'Dondurma ve taze çileklerle hazırlanan yoğun milkshake.',
  },
];

/* ══════════════════════════════════════════════════════════════════════
   2. Autocomplete Filter (Category-aware on focus, global on any query)
   ══════════════════════════════════════════════════════════════════════ */
export const getFilteredProductSuggestions = (query = '', selectedCategoryName = '') => {
  const q = normalizeTurkishProductText(query);

  // If query is empty: filter by the currently selected category!
  if (!q) {
    if (selectedCategoryName) {
      const catNorm = normalizeTurkishProductText(selectedCategoryName);
      const categoryProducts = PRODUCT_CATALOGUE.filter((item) => {
        const itemCat = normalizeTurkishProductText(item.category || '');
        return itemCat.includes(catNorm) || catNorm.includes(itemCat);
      });
      if (categoryProducts.length > 0) {
        return categoryProducts.slice(0, 5);
      }
    }
    // Fallback to top 5 products if no matching category items
    return PRODUCT_CATALOGUE.slice(0, 5);
  }

  // If user typed even a single letter: search globally across ALL categories
  const prefixMatches = [];
  const containsMatches = [];

  for (const item of PRODUCT_CATALOGUE) {
    const norm = normalizeTurkishProductText(item.name);
    if (norm === q) {
      prefixMatches.unshift(item);
    } else if (norm.startsWith(q)) {
      prefixMatches.push(item);
    } else if (norm.includes(q)) {
      containsMatches.push(item);
    }
  }

  // Combine and strictly take maximum 5 as requested
  return [...prefixMatches, ...containsMatches].slice(0, 5);
};

/* ══════════════════════════════════════════════════════════════════════
   3. Smart Local AI Description Generator based on Product Name
   ══════════════════════════════════════════════════════════════════════ */
export const findMatchingProductTemplate = (productName = '') => {
  const q = normalizeTurkishProductText(productName);
  if (!q) return null;

  // Exact or direct match
  const exact = PRODUCT_CATALOGUE.find(
    (item) => normalizeTurkishProductText(item.name) === q
  );
  if (exact) return exact;

  // Prefix match
  const prefix = PRODUCT_CATALOGUE.find((item) =>
    normalizeTurkishProductText(item.name).startsWith(q)
  );
  if (prefix) return prefix;

  // Substring match
  const sub = PRODUCT_CATALOGUE.find((item) =>
    normalizeTurkishProductText(item.name).includes(q)
  );
  if (sub) return sub;

  return null;
};

/**
 * Generates an appetizing description for a given product name.
 * If matched in catalogue, uses that description.
 * Otherwise, generates a bespoke description fitting for a restaurant menu.
 */
export const generateProductDescriptionText = (productName = '', categoryName = '') => {
  const match = findMatchingProductTemplate(productName);
  if (match?.description) {
    return match.description;
  }

  const trimmed = productName.trim();
  if (!trimmed) {
    return 'Özenle seçilmiş taze malzemeler ve şefin özel dokunuşlarıyla hazırlanan lezzetli bir seçenek.';
  }

  // Smart contextual fallbacks based on category or common keywords
  const norm = normalizeTurkishProductText(trimmed);

  if (norm.includes('corba') || categoryName.toLowerCase().includes('corba')) {
    return `Geleneksel tariflerle hazırlanan, taze malzemeler ve nefis tereyağ aromasıyla içinizi ısıtacak sıcacık ${trimmed}.`;
  }
  if (norm.includes('burger') || norm.includes('sandvic') || categoryName.toLowerCase().includes('burger')) {
    return `Taze pişmiş yumuşak ekmek arasında kaliteli malzemeler, özel soslar ve çıtır patates eşliğinde sunulan doyurucu ${trimmed}.`;
  }
  if (norm.includes('pizza') || categoryName.toLowerCase().includes('pizza')) {
    return `Taş fırında nar gibi pişmiş çıtır İtalyan hamuru, zengin domates sosu ve bol eriyen mozzarella peyniriyle ${trimmed}.`;
  }
  if (norm.includes('makarna') || norm.includes('penne') || norm.includes('spaghetti')) {
    return `Kıvamında haşlanmış taze makarna, şefin özel sosu ve rendelenmiş kaliteli parmesan peyniri eşliğinde ${trimmed}.`;
  }
  if (norm.includes('salata') || categoryName.toLowerCase().includes('salata')) {
    return `Mevsimin en taze çıtır yeşillikleri, kaliteli sızma zeytinyağı ve hafif ferahlatıcı soslar eşliğinde hazırlanan ${trimmed}.`;
  }
  if (norm.includes('tatli') || norm.includes('pasta') || norm.includes('kek')) {
    return `Özel kıvamı, dengeli tatlılığı ve taze malzemeleriyle damağınızda unutulmaz bir lezzet bırakacak nefis ${trimmed}.`;
  }
  if (norm.includes('kahve') || norm.includes('cay') || categoryName.toLowerCase().includes('icecek')) {
    return `Özenle seçilmiş kaliteli çekirdek ve yapraklardan taze demlenmiş, günün her anına keyif katacak ${trimmed}.`;
  }
  if (norm.includes('kofte') || norm.includes('kebap') || norm.includes('et') || norm.includes('tavuk')) {
    return `Kömür ateşinde lokum kıvamında pişirilmiş, közlenmiş taze sebzeler ve özel garnitürler eşliğinde sunulan nefis ${trimmed}.`;
  }

  return `Özenle seçilmiş taze malzemeler, şefimizin özel dokunuşları ve dengeli baharatlarıyla damaklarda iz bırakan ${trimmed}.`;
};

/* ══════════════════════════════════════════════════════════════════════
   4. Ingredients & Allergens Autocomplete Dictionaries
   ══════════════════════════════════════════════════════════════════════ */
export const COMMON_INGREDIENTS = [
  'Domates', 'Soğan', 'Sarımsak', 'Biber', 'Sivri biber', 'Kırmızı biber', 'Patates',
  'Patlıcan', 'Kabak', 'Havuç', 'Mantar', 'Kültür mantarı', 'Mısır', 'Salatalık',
  'Zeytin', 'Siyah zeytin', 'Yeşil zeytin', 'Kapari', 'Kurutulmuş domates',
  'Maydanoz', 'Dereotu', 'Roka', 'Nane', 'Fesleğen', 'Kekik', 'Biberiye', 'Ispanak', 'Marul',
  'Kıyma', 'Dana eti', 'Kuzu eti', 'Tavuk göğsü', 'Tavuk but', 'Pastırma', 'Sucuk', 'Sosis',
  'Kaşar peyniri', 'Mozzarella', 'Parmesan', 'Cheddar', 'Beyaz peynir', 'Tulum peyniri',
  'Hellim peyniri', 'Lor peyniri', 'Gorgonzola', 'Tereyağı', 'Krema', 'Süt', 'Yoğurt',
  'Süzme yoğurt', 'Zeytinyağı', 'Ayçiçek yağı', 'Salça', 'Domates salçası', 'Biber salçası',
  'Kırmızı mercimek', 'Pirinç', 'Bulgur', 'Nohut', 'Fasulye', 'Un', 'Galeta unu',
  'Ceviz', 'Fındık', 'Antep fıstığı', 'Badem', 'Susam', 'Bal', 'Limon', 'Sirke', 'Nar ekşisi',
  'Karabiber', 'Pul biber', 'Kimyon', 'Kekik', 'Tuz', 'Hardal', 'Mayonez', 'Ketçap'
];

export const COMMON_ALLERGENS = [
  'Alerjen İçermez',
  'Gluten',
  'Süt (Laktoz)',
  'Yumurta',
  'Fıstık',
  'Sert Kabuklu Yemişler (Fındık, Ceviz, Badem vb.)',
  'Soya',
  'Balık',
  'Kabuklu Deniz Ürünleri',
  'Kereviz',
  'Hardal',
  'Susam',
  'Kükürt Dioksit / Sülfitler',
  'Acıbakla',
  'Yumuşakçalar',
];

export const filterSuggestionsList = (list = [], query = '', currentItems = []) => {
  const q = normalizeTurkishProductText(query);
  if (!q) return [];

  const currentSet = new Set(currentItems.map((item) => normalizeTurkishProductText(item)));

  return list
    .filter((item) => {
      const norm = normalizeTurkishProductText(item);
      return norm.includes(q) && !currentSet.has(norm);
    })
    .slice(0, 6);
};
