import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from '../components/SeoHead';
import { authService } from '../services/authService';
import { auth } from '../config/firebase';
import { getFirebaseAuthError } from '../utils/firebaseAuthErrors';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { trackEvent } from '../utils/analytics';
import { isLocalhost, isMainDomain } from '../utils/domainHelpers';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    restaurantName: '',
    businessType: 'RESTAURANT',
    city: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { setApplicationSession } = useAuth();
  const navigate = useNavigate();

  const redirectApplicationUser = (user, restaurant) => {
    if (user?.role === 'ADMIN') return navigate('/admin');
    if (restaurant) {
      if (!isLocalhost() && isMainDomain()) {
        window.location.replace('https://panel.zuuqrmenu.com/dashboard');
        return;
      }
      return navigate('/dashboard');
    }
    return navigate('/pending-approval');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        try {
          await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        } catch (firebaseErr) {
          if (firebaseErr?.code === 'auth/email-already-in-use') {
            try {
              await signInWithEmailAndPassword(auth, formData.email, formData.password);
            } catch {
              throw new Error('Bu e-posta adresi zaten kullanımda. Hesabınız varsa lütfen giriş yapın veya farklı bir e-posta deneyin.');
            }
          } else {
            throw firebaseErr;
          }
        }
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
      const backendError = err.response?.data?.error;
      if (backendError) {
        setError(backendError);
      } else if (err?.code?.startsWith('auth/')) {
        setError(getFirebaseAuthError(err));
      } else {
        setError(err?.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
      }
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
      const name = credential.user.displayName || credential.user.email?.split('@')[0] || 'Yeni isletme';
      const result = await authService.registerFirebase({
        ownerName: name,
        restaurantName: `${name} Restorani`,
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

  if (registrationComplete) {
    return (
      <div className="reg-page reg-page--center">
        <SeoHead
          title="Kayıt Tamamlandı | zuuqrmenu"
          description="Restoranınız başarıyla oluşturuldu."
          canonical="https://zuuqrmenu.com/register"
          robots="noindex,nofollow"
        />
        <div className="reg-success">
          <Link to="/" className="reg-success__logo">
            <img src="/logo.svg" alt="zuuqrmenu" />
          </Link>
          <div className="reg-success__badge">
            <span className="reg-success__icon" aria-hidden="true">✓</span>
          </div>
          <h2>Kaydınız Alındı</h2>
          <p>
            Restoranınız incelemeye alındı. Hesabınız onaylandığında e-posta ile bilgilendirileceksiniz.
          </p>
          <div className="reg-success__status">
            <span className="reg-success__status-dot" aria-hidden="true" />
            <span>Başvuru Durumu: <strong>İnceleniyor</strong></span>
          </div>
          <Link
            to="/login"
            className="reg-btn reg-btn--primary"
            style={{ width: '100%', marginTop: '1.25rem', display: 'inline-flex', justifyContent: 'center' }}
          >
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reg-page">
      <SeoHead title="Restoranını Oluştur | zuuqrmenu" description="Restoranınız için zuuqrmenu dijital menü hesabı oluşturun." canonical="https://zuuqrmenu.com/register" robots="noindex,nofollow" />

      <aside className="reg-panel" aria-hidden="true">
        <a href="/" className="reg-panel__logo-link">
          <img src="/logo_darkmode.svg" alt="zuuqrmenu" className="reg-panel__logo" />
        </a>
        <div className="reg-panel__body">
          <p className="reg-panel__kicker">RESTORANLAR İÇİN</p>
          <h2 className="reg-panel__headline">
            Menünüzü dijitale<br /><em>taşıyın.</em>
          </h2>
          <p className="reg-panel__sub">
            QR menü, analitik ve yönetim paneli — tek çatı altında.
          </p>
          <ul className="reg-panel__features">
            <li className="reg-panel__feature"><span className="reg-panel__feature-icon" aria-hidden="true">◈</span><span><b>Dijital menü</b><small>PDF'e son, canlı menü başlasın.</small></span></li>
            <li className="reg-panel__feature"><span className="reg-panel__feature-icon" aria-hidden="true">⌘</span><span><b>QR tasarımı</b><small>Masanıza özel baskı kartları.</small></span></li>
            <li className="reg-panel__feature"><span className="reg-panel__feature-icon" aria-hidden="true">↗</span><span><b>Gerçek zamanlı analiz</b><small>Hangi ürün ilgi görüyor, görün.</small></span></li>
            <li className="reg-panel__feature"><span className="reg-panel__feature-icon" aria-hidden="true">◎</span><span><b>Anlık güncelleme</b><small>Fiyat değişti mi? Saniyede yayında.</small></span></li>
          </ul>
        </div>
        <p className="reg-panel__note">Ücretli üyelik · Ücretsiz deneme dönemi mevcuttur</p>
      </aside>

      <div className="reg-form-wrap">
        <div className="reg-card">
          <a href="/" className="reg-card__mobile-logo">
            <img src="/logo.svg" alt="zuuqrmenu" />
          </a>

          <h1 className="reg-card__title">Restoran Kaydı</h1>
          <p className="reg-card__sub">Birkaç adımda hazır olun.</p>

          {error && <div className="reg-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="reg-form" noValidate>
            <div className="reg-section">
              <span className="reg-section__label">Hesap bilgileri</span>
              <div className="reg-grid2">
                <div className="reg-field">
                  <label htmlFor="reg-name">Ad Soyad <abbr title="zorunlu">*</abbr></label>
                  <input id="reg-name" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ahmet Yılmaz" className="reg-input" />
                </div>
                <div className="reg-field">
                  <label htmlFor="reg-email">E-posta <abbr title="zorunlu">*</abbr></label>
                  <input id="reg-email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="ornek@email.com" className="reg-input" />
                </div>
                <div className="reg-field">
                  <label htmlFor="reg-password">Şifre <abbr title="zorunlu">*</abbr></label>
                  <input id="reg-password" type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" placeholder="En az 6 karakter" className="reg-input" />
                </div>
                <div className="reg-field">
                  <label htmlFor="reg-phone">Telefon</label>
                  <input id="reg-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+90 5XX XXX XX XX" className="reg-input" />
                </div>
              </div>
            </div>

            <div className="reg-section">
              <span className="reg-section__label">Restoran bilgileri</span>
              <div className="reg-grid3">
                <div className="reg-field reg-field--grow">
                  <label htmlFor="reg-restaurantName">Restoran Adı <abbr title="zorunlu">*</abbr></label>
                  <input id="reg-restaurantName" type="text" name="restaurantName" value={formData.restaurantName} onChange={handleChange} required placeholder="Restoranınızın adı" className="reg-input" />
                </div>
                <div className="reg-field">
                  <label htmlFor="reg-businessType">Tür</label>
                  <select id="reg-businessType" name="businessType" value={formData.businessType} onChange={handleChange} className="reg-input reg-input--select">
                    <option value="RESTAURANT">Restoran</option>
                    <option value="CAFE">Kafe</option>
                    <option value="BAR">Bar</option>
                    <option value="BAKERY">Fırın</option>
                    <option value="FAST_FOOD">Fast Food</option>
                  </select>
                </div>
                <div className="reg-field">
                  <label htmlFor="reg-city">Şehir <abbr title="zorunlu">*</abbr></label>
                  <input id="reg-city" type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="İstanbul" className="reg-input" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="reg-btn reg-btn--primary" id="reg-submit-btn">
              {loading ? 'Kayıt yapılıyor…' : 'Restoranı Oluştur'}
            </button>
          </form>

          <div className="auth-divider"><span>veya</span></div>
          <button type="button" onClick={handleGoogleRegister} disabled={loading} className="auth-google-button auth-google-button--register" id="reg-google-btn">
            <span className="auth-google-button__logo">G</span>
            Google ile kayıt ol
          </button>

          <p className="reg-card__footer">
            Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
