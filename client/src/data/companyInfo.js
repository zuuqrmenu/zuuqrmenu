// Seller / company details used ONLY in the official legal pages (satıcı bilgileri, mesafeli satış
// sözleşmesi, ön bilgilendirme formu, iade koşulları). Fill these in before going live: PayTR and
// Turkish distance-sales law require the seller's identity to be shown on those pages.
// Leave the personal / company name out of every marketing surface (landing, footer, blog, ...).
export const companyInfo = {
  brand: 'zuuqrmenu',
  legalName: '[Ticari Unvan / Ad Soyad]',
  taxOffice: '[Vergi Dairesi]',
  taxNumber: '[Vergi Kimlik No / T.C. Kimlik No]',
  mersisNo: '', // optional, shown only when filled
  address: '[Açık Adres]',
  email: 'zuuqrmenu@gmail.com',
  kvkkEmail: 'zuuqrmenu@gmail.com',
  phone: '[Telefon]',
  website: 'https://www.zuuqrmenu.com',
};

export const pendingValue = (value) => /^\[.*\]$/.test(value || '');
