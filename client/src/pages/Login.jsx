import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from '../components/SeoHead';
import { AuthPanel, GoogleMark, PasswordInput } from '../components/auth/AuthPanel';
import '../styles/auth.css';
import { authService } from '../services/authService';
import { auth } from '../config/firebase';
import { getFirebaseAuthError } from '../utils/firebaseAuthErrors';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { trackEvent } from '../utils/analytics';
import { isLocalhost, isMainDomain, getMainSiteUrl, getSafeNextPath, rememberCheckoutIntent } from '../utils/domainHelpers';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const { login, setApplicationSession } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => { rememberCheckoutIntent(search); }, [search]);

  const redirectApplicationUser = (user, restaurant) => {
    if (user?.role === 'ADMIN') return navigate('/admin');
    if (restaurant) {
      if (!isLocalhost() && isMainDomain()) {
        window.location.replace(`https://panel.zuuqrmenu.com${getSafeNextPath(search) || '/dashboard'}`);
        return;
      }
      return navigate(getSafeNextPath(search) || '/dashboard');
    }
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
      if (!formData.email.includes('@')) {
        const result = await login(formData);
        if (result.success) {
          trackEvent('login', { method: 'username' });
          redirectApplicationUser(result.user, result.restaurant);
        } else {
          setError(result.error);
        }
        return;
      }

      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch {}
      }
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const session = await authService.firebaseSession();
      trackEvent('login', { method: 'email' });
      setApplicationSession(session);
      redirectApplicationUser(session.user, session.restaurant);
    } catch (error) {
      await signOut(auth);
      console.error('Restaurant login failed:', error);
      const serverError = error.response?.data?.error;
      if (serverError && !serverError.toLowerCase().includes('firebase') && !serverError.toLowerCase().includes('admin')) {
        setError(serverError);
      } else {
        setError(getFirebaseAuthError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch {}
      }
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      await credential.user.getIdToken();
      try {
        const session = await authService.firebaseSession();
        trackEvent('login', { method: 'google' });
        setApplicationSession(session);
        redirectApplicationUser(session.user, session.restaurant);
      } catch (sessionError) {
        if (sessionError.response?.status !== 409) throw sessionError;
        try {
          const name = credential.user.displayName || credential.user.email?.split('@')[0] || 'Yeni işletme';
          const registration = await authService.registerFirebase({
            ownerName: name,
            restaurantName: `${name} Restoranı`,
          });
          setApplicationSession(registration);
          trackEvent('sign_up', { method: 'google' });
          trackEvent('create_restaurant', { method: 'google' });
          navigate('/pending-approval');
        } catch (registrationError) {
          console.error('Google registration failed:', registrationError);
          const regErr = registrationError.response?.data?.error;
          setError(regErr && !regErr.toLowerCase().includes('firebase') ? regErr : 'Giriş yapılamadı. Lütfen tekrar deneyin.');
          await signOut(auth);
        }
      }
    } catch (firebaseError) {
      console.error('Google login failed:', firebaseError);
      setError(getFirebaseAuthError(firebaseError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page login-page">
      <SeoHead title="Giriş Yap | zuuqrmenu" description="zuuqrmenu restoran panelinize güvenli şekilde giriş yapın." canonical="https://panel.zuuqrmenu.com/login" robots="noindex,nofollow" />

      <AuthPanel
        href={getMainSiteUrl('/')}
        headline="İşletmenizin kontrolü tek ekranda."
        sub="Canlı menü yönetimi, masa QR'ları ve ziyaretçi analitiğine anında erişin."
        points={[
          ['Hızlı menü yönetimi', 'Fiyat ve stokları saniyeler içinde güncelleyin.'],
          ['Anlık ziyaret analitiği', 'Popüler ürünleri ve masa trafiğini takip edin.'],
          ['Akıllı masa QR\'ları', 'Yeniden basım gerektirmeyen dinamik kodlar.'],
        ]}
        note="Güvenli yönetim portalı · 256-bit SSL korumalı"
      />

      <div className="reg-form-wrap">
        <div className="reg-card">
          <a href={getMainSiteUrl('/')} className="reg-card__mobile-logo">
            <img src="/logo.svg" alt="zuuqrmenu" />
          </a>

          <h1 className="reg-card__title">Tekrar hoş geldiniz</h1>
          <p className="reg-card__sub">Restoran yönetim panelinize erişin.</p>

          {error && (
            <div className="reg-error" role="alert">
              <div>{error}</div>
              {error.includes('kaydı bulunamadı') && (
                <div className="reg-error__action">
                  <Link to={`/register${search}`}>Restoran kaydınızı oluşturun</Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="reg-form" noValidate>
            <div className="reg-field">
              <label htmlFor="email">E-posta veya kullanıcı adı</label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="username"
                className="reg-input"
                placeholder="ornek@email.com veya admin"
              />
            </div>

            <div className="reg-field">
              <label htmlFor="password">Şifre</label>
              <PasswordInput
                show={showPw}
                onToggle={() => setShowPw((v) => !v)}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Şifreniz"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="reg-btn reg-btn--primary"
              id="login-submit-btn"
            >
              {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            </button>
          </form>

          <div className="auth-divider"><span>veya</span></div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="auth-google-button"
            id="login-google-btn"
          >
            <GoogleMark />
            Google ile devam et
          </button>

          <p className="reg-card__footer">
            Hesabınız yok mu?{' '}
            <Link to={`/register${search}`}>Restoranınızı oluşturun</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
