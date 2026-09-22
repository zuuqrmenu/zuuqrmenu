const messages = {
  'auth/invalid-credential': 'E-posta veya şifre hatalı.',
  'auth/invalid-email': 'Geçerli bir e-posta adresi girin.',
  'auth/user-not-found': 'E-posta veya şifre hatalı.',
  'auth/wrong-password': 'E-posta veya şifre hatalı.',
  'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanılıyor.',
  'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
  'auth/popup-closed-by-user': 'Google giriş penceresi kapatıldı.',
  'auth/popup-blocked': 'Google giriş penceresi tarayıcı tarafından engellendi.',
  'auth/too-many-requests': 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.',
  'auth/network-request-failed': 'Giriş yapılamadı. Lütfen tekrar deneyin.',
  'auth/user-disabled': 'Hesabınız devre dışı bırakılmış.',
};

export const getFirebaseAuthError = (error) => {
  if (error) {
    console.error('Authentication internal error:', error);
  }
  return messages[error?.code] || 'Giriş yapılamadı. Lütfen tekrar deneyin.';
};
