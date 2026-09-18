import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from '../components/SeoHead';
import { authService } from '../services/authService';
import { auth } from '../config/firebase';
import { getFirebaseAuthError } from '../utils/firebaseAuthErrors';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { trackEvent } from '../utils/analytics';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    restaurantName: '',
    businessType: 'RESTAURANT',
    city: '',
    address: '',
    website: '',
    instagram: '',
    restaurantPhone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { setApplicationSession } = useAuth();
  const navigate = useNavigate();

  const redirectApplicationUser = (user, restaurant) => {
    if (user?.role === 'ADMIN') return navigate('/admin');
    if (restaurant) return navigate('/dashboard');
    return navigate('/pending-approval');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const currentFirebaseUser = auth.currentUser;
      const isGoogleRegistration = currentFirebaseUser?.providerData.some(({ providerId }) => providerId === 'google.com');
      const reuseGoogleUser = Boolean(isGoogleRegistration && currentFirebaseUser.email === formData.email);
      if (!reuseGoogleUser) {
        if (currentFirebaseUser) await signOut(auth);
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      }
      const result = await authService.registerFirebase({
        ...formData,
        ownerName: formData.name,
        ownerPhone: formData.phone,
      });
      if (result.success) {
        trackEvent('sign_up', { method: 'email' });
        trackEvent('create_restaurant', { business_type: formData.businessType || 'RESTAURANT' });
        await signOut(auth);
        setRegistrationComplete(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err?.code?.startsWith('auth/') ? getFirebaseAuthError(err) : err.response?.data?.error || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      await credential.user.getIdToken();
      try {
        const session = await authService.firebaseSession();
        trackEvent('login', { method: 'google' });
        setApplicationSession(session);
        redirectApplicationUser(session.user, session.restaurant);
        return;
      } catch (sessionError) {
        if (sessionError.response?.status !== 409) throw sessionError;
      }
      const name = credential.user.displayName || credential.user.email?.split('@')[0] || 'Yeni işletme';
      const result = await authService.registerFirebase({
        ownerName: name,
        restaurantName: `${name} Restoranı`,
      });
      trackEvent('sign_up', { method: 'google' });
      trackEvent('create_restaurant', { method: 'google' });
      setApplicationSession(result);
      navigate('/pending-approval');
    } catch (firebaseError) {
      setError(getFirebaseAuthError(firebaseError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <SeoHead title="Restoranını Oluştur | zuuqrmenu" description="Restoranınız için zuuqrmenu dijital menü hesabı oluşturun." canonical="https://zuuqrmenu.com/register" robots="noindex,nofollow" />
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="zuuqrmenu" className="mx-auto h-auto w-40" />
          <p className="text-gray-600 mt-2">Dijital Menü Platformu</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Restoran Kaydı</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {registrationComplete ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-6 text-center text-emerald-800">
              <p className="font-semibold">Tebrikler, kaydınız başarıyla oluşturuldu. Onay için bekleniyor.</p>
              <Link to="/login" className="mt-5 inline-block font-medium text-emerald-700 underline">Giriş sayfasına dön</Link>
            </div>
          ) : <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hesap Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Şifre *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Restaurant Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Restoran Bilgileri</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-1">
                    Restoran Adı *
                  </label>
                  <input
                    type="text"
                    id="restaurantName"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                      İşletme Türü
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="RESTAURANT">Restoran</option>
                      <option value="CAFE">Kafe</option>
                      <option value="BAR">Bar</option>
                      <option value="BAKERY">Fırın</option>
                      <option value="FAST_FOOD">Fast Food</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Şehir *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Adres
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="restaurantPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Restoran Telefonu
                    </label>
                    <input
                      type="tel"
                      id="restaurantPhone"
                      name="restaurantPhone"
                      value={formData.restaurantPhone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      Web Sitesi
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>}

          {!registrationComplete && <>
            <div className="auth-divider"><span>veya</span></div>
            <button type="button" onClick={handleGoogleRegister} disabled={loading} className="auth-google-button auth-google-button--register">
              <span className="auth-google-button__logo">G</span>
              Google ile kayıt ol
            </button>
          </>}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
