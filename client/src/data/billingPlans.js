// Presentation copy for the sellable plans; prices come from the server (/api/billing).
export const PLAN_COPY = {
  starter: {
    desc: 'Tek şubeli kafeler ve butik işletmeler için temel dijital menü.',
    features: ['3 kategori ve 25 ürüne kadar', 'Anlık fiyat ve stok güncelleme', 'Dinamik QR menü ve masa kartı', 'Varsayılan tema ve logo özelleştirme'],
  },
  professional: {
    desc: 'ZuuAI, Bento teması ve detaylı analitik isteyen işletmeler için.',
    featured: true,
    features: ['Sınırsız kategori ve ürün', 'ZuuAI menü yükleme (PDF / fotoğraf)', 'Tüm premium temalar', 'Detaylı ürün ve kategori analitiği', 'Öncelikli WhatsApp ve telefon desteği'],
  },
};

export const fmtTry = (n) => `₺${Number(n).toLocaleString('tr-TR')}`;
export const checkoutPath = (plan, period) => `/dashboard/checkout?plan=${plan}&period=${period}`;
