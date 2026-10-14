import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/cookie-banner.css';
import { getCookieConsent, setCookieConsent } from '../utils/consent';

/** Cookie consent bar for the marketing site. Analytics cookies stay off until "Kabul et". */
const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  if (!visible) return null;

  const choose = (value) => {
    setCookieConsent(value);
    setVisible(false);
  };

  return (
    <div className="lp3-cookie" role="dialog" aria-label="Çerez tercihleri" aria-live="polite">
      <p className="lp3-cookie__text">
        Siteyi geliştirmek için anonim analiz çerezleri kullanıyoruz. Zorunlu çerezler her zaman açıktır.{' '}
        <Link to="/cerez">Çerez Politikası</Link>
      </p>
      <div className="lp3-cookie__actions">
        <button type="button" className="lp3-cookie__btn lp3-cookie__btn--ghost" onClick={() => choose('necessary')}>Yalnızca zorunlu</button>
        <button type="button" className="lp3-cookie__btn lp3-cookie__btn--primary" onClick={() => choose('all')}>Kabul et</button>
      </div>
    </div>
  );
};

export default CookieBanner;
