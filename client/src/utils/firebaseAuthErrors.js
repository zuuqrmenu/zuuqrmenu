const messages = {
  'auth/invalid-credential': 'E-posta veya şifre hatalı.',
  'auth/invalid-email': 'Geçerli bir e-posta adresi girin.',
  'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanılıyor.',
  'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
  'auth/popup-closed-by-user': 'Google giriş penceresi kapatıldı.',
  'auth/popup-blocked': 'Google giriş penceresi tarayıcı tarafından engellendi.',
  'auth/too-many-requests': 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.',
  'auth/network-request-failed': 'Bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edin.',
  'auth/user-disabled': 'Bu Firebase hesabı devre dışı bırakılmış.',
};

export const getFirebaseAuthError = (error) => messages[error?.code] || 'Firebase işlemi tamamlanamadı. Lütfen tekrar deneyin.';
