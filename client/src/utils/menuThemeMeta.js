// What the dashboard shows about each selectable menu theme (the public rendering lives in components/public-menu).
export const menuThemeOptions = [
  { value: 'DEFAULT', label: 'Klasik', kind: 'Liste görünümü', description: 'Üstte kapak, kategori sekmeleri ve sade ürün listesi. Her menüye uyan güvenli seçim.' },
  { value: 'GRID', label: 'Modern', kind: 'Kategori kartları', description: 'Büyük fotoğraflı kategori kartlarıyla açılır; her kategori kendi sayfasında gezilir.' },
  { value: 'STUDIO', label: 'Stüdyo', kind: 'Fotoğraflı vitrin', description: 'Uygulama hissi: önerilenler şeridi, iki sütunlu fotoğraf kartları ve yüzen kısayol çubuğu.' },
];

export const getMenuThemeOption = (value) => menuThemeOptions.find((option) => option.value === value) || menuThemeOptions[0];

export const menuFonts = ['Inter', 'DM Sans', 'Playfair Display', 'Lora'];
export const menuFontMeta = {
  Inter: 'Modern ve temiz',
  'DM Sans': 'Yumuşak ve modern',
  'Playfair Display': 'Zarif ve klasik',
  Lora: 'Editoryal ve sıcak',
};

export const menuLayoutOptions = [
  { value: 'STANDARD', label: 'Dengeli', description: 'Fotoğraf, açıklama ve fiyat için dengeli yerleşim.' },
  { value: 'COMPACT', label: 'Kompakt', description: 'Sıkı aralıklar; daha az kaydırma, hızlı tarama.' },
  { value: 'EDITORIAL', label: 'Ferah', description: 'Geniş kartlar ve boşluklar; dergi hissi.' },
];

export const menuPalettes = [
  { name: 'Amber', primary: '#B45309', secondary: '#FFFDF8' },
  { name: 'Adaçayı', primary: '#31572C', secondary: '#F7F9F6' },
  { name: 'Gece mavisi', primary: '#1D4ED8', secondary: '#F8FAFC' },
  { name: 'Şarap', primary: '#881337', secondary: '#FFF5F5' },
  { name: 'Mercan', primary: '#C2410C', secondary: '#FFF7ED' },
  { name: 'Grafit', primary: '#1F2937', secondary: '#FFFFFF' },
];

export const menuToggleOptions = [
  ['showImages', 'Ürün görselleri', 'Fotoğrafları menüde göster.'],
  ['showDescriptions', 'Ürün açıklamaları', 'Kısa açıklamalar görünür kalsın.'],
  ['showPrices', 'Fiyatlar', 'Fiyatları ürün kartlarında göster.'],
  ['emphasizeFeatured', 'Öne çıkan vurgusu', 'Öne çıkan ürünler daha belirgin olsun.'],
  ['showStories', 'Öne çıkanlar şeridi', 'Menünün üstünde önerilen ürünleri göster.'],
  ['showEcoBadge', 'Doğa dostu rozeti', 'Sayfa sonunda kağıt tasarrufu sayacını göster.'],
];
