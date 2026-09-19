import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from '../components/SeoHead';
import { authService } from '../services/authService';
import { auth } from '../config/firebase';
import { getFirebaseAuthError } from '../utils/firebaseAuthErrors';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { trackEvent } from '../utils/analytics';
import { isLocalhost, isMainDomain, getMainSiteUrl } from '../utils/domainHelpers';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, setApplicationSession } = useAuth();
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

      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const session = await authService.firebaseSession();
      trackEvent('login', { method: 'email' });
      setApplicationSession(session);
      redirectApplicationUser(session.user, session.restaurant);
    } catch (error) {
      await signOut(auth);
      setError(error.response?.data?.error || getFirebaseAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
          setError(registrationError.response?.data?.error || 'Google hesabınızla kayıt tamamlanamadı. Lütfen tekrar deneyin.');
          await signOut(auth);
        }
      }
    } catch (firebaseError) {
      setError(getFirebaseAuthError(firebaseError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-shell">
      <SeoHead title="Giriş Yap | zuuqrmenu" description="zuuqrmenu restoran panelinize güvenli şekilde giriş yapın." canonical="https://panel.zuuqrmenu.com/login" robots="noindex,nofollow" />
      <aside className="login-shell__brand">
        <a href={getMainSiteUrl('/')} className="landing-brand"><img src="/logo_darkmode.svg" alt="zuuqrmenu" className="landing-brand__logo" /></a>
        <h1>Dijital menünüz, işletmenizin ritmine ayak uydursun.</h1>
        <p>Menünüzü yönetin, QR kodunuzu hazırlayın ve müşterilerinizle daha hızlı buluşun.</p>
      </aside>
      <div className="login-shell__form">
        <div className="login-card">
          <a href={getMainSiteUrl('/')} className="landing-brand"><img src="/logo.svg" alt="zuuqrmenu" className="landing-brand__logo" /></a>
          <h2>Hoş geldiniz</h2>
          <p>Restoran panelinize giriş yapın.</p>

          {error && (
            <div className="login-card__error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">
                E-posta veya kullanıcı adı
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="login-input"
                placeholder="ornek@email.com veya admin"
              />
            </div>

            <div>
              <label htmlFor="password">
                Şifre
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="login-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-submit"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="auth-divider"><span>veya</span></div>
          <button type="button" onClick={handleGoogleLogin} disabled={loading} className="auth-google-button">
            <span className="auth-google-button__logo">G</span>
            Google ile devam et
          </button>

          <div className="login-card__footer">
            <p>
              Hesabınız yok mu?{' '}
              <Link to="/register">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
