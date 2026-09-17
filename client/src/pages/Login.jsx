import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from '../components/SeoHead';
import { authService } from '../services/authService';
import { auth } from '../config/firebase';
import { getFirebaseAuthError } from '../utils/firebaseAuthErrors';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';

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
      if (!formData.email.includes('@')) {
        const result = await login(formData);
        if (result.success) {
          redirectApplicationUser(result.user, result.restaurant);
        } else {
          setError(result.error);
        }
        return;
      }

      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const session = await authService.firebaseSession();
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
      <SeoHead title="Giriş Yap | zuuqrmenu" description="zuuqrmenu restoran panelinize güvenli şekilde giriş yapın." canonical="https://zuuqrmenu.com/login" robots="noindex,nofollow" />
      <aside className="login-shell__brand">
        <Link to="/" className="landing-brand"><img src="/logo_darkmode.svg" alt="zuuqrmenu" className="landing-brand__logo" /></Link>
        <h1>Dijital menünüz, işletmenizin ritmine ayak uydursun.</h1>
        <p>Menünüzü yönetin, QR kodunuzu hazırlayın ve müşterilerinizle daha hızlı buluşun.</p>
      </aside>
      <div className="login-shell__form">
        <div className="login-card">
          <Link to="/" className="landing-brand"><img src="/logo.svg" alt="zuuqrmenu" className="landing-brand__logo" /></Link>
          <h2>Tekrar hoş geldiniz</h2>
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
