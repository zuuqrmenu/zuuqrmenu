import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { trackEvent } from '../utils/analytics';
import { getPanelUrl } from '../utils/domainHelpers';
import { publicMenuService } from '../services/publicMenuService';

const prefetchDemo = (demoUrl) => {
  try {
    import('./PublicMenu');
    const username = demoUrl?.replace('/menu', '').replace('/', '');
    if (username) {
      publicMenuService.prefetchMenu(username);
    }
  } catch (_) {}
};

const themes = [
  {
    id: 'default',
    name: 'Varsayılan',
    tag: 'Klasik',
    tagColor: '#deff36',
    description: 'Temiz, sade ve her restorana yakışan klasik bir menü deneyimi. Güçlü tipografi ve net ürün hiyerarşisi.',
    features: ['Kategori navigasyonu', 'Hikaye kartları', 'Ürün detay modalı', 'Açık & karanlık mod'],
    demoUrl: '/demo/menu',
    mockupAccent: '#deff36',
    mockupBg: '#1c1c18',
    mockupSurface: '#fbfaf5',
    badge: 'En Popüler',
  },
  {
    id: 'modern',
    name: 'Modern',
    tag: 'Görsel',
    tagColor: '#a78bfa',
    description: 'Görsel ağırlıklı kategori kartları ve fotoğraf odaklı bir keşif deneyimi. Restoran kimliğinizi ön plana çıkarır.',
    features: ['Görsel kategori grid\'i', 'Bento kart düzeni', 'Animasyonlu geçişler', 'Açık & karanlık mod'],
    demoUrl: '/demo2/menu',
    mockupAccent: '#a78bfa',
    mockupBg: '#0a0a0a',
    mockupSurface: '#111111',
    badge: 'Yeni',
  },
];

const ComingSoonTheme = () => (
  <div className="tsc__coming-soon">
    <div className="tsc__coming-soon__inner">
      <div className="tsc__coming-soon__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
        </svg>
      </div>
      <p className="tsc__coming-soon__label">Yeni temalar geliyor</p>
      <p className="tsc__coming-soon__sub">
        Bistro, Minimal ve Lüks temaları hazırlanıyor. Çıkışta bildirim almak için kaydolun.
      </p>
      <Link to="/register" className="tsc__coming-soon__cta">
        Erken Erişim →
      </Link>
    </div>
  </div>
);

const ThemeMockup = ({ theme }) => (
  <div className="tsc-mockup" aria-hidden="true">
    <div className="tsc-mockup__phone" style={{ background: theme.mockupBg, borderColor: `${theme.mockupAccent}22` }}>
      <div className="tsc-mockup__notch" />
      <div className="tsc-mockup__screen">
        {/* Header */}
        <div className="tsc-mockup__header" style={{ background: theme.mockupBg }}>
          <div className="tsc-mockup__header-bar">
            <span className="tsc-mockup__dot" />
            <span className="tsc-mockup__logo-pill" style={{ background: `${theme.mockupAccent}22`, color: theme.mockupAccent }} />
            <span className="tsc-mockup__dot" />
          </div>
          <div className="tsc-mockup__hero-text" style={{ background: theme.mockupSurface }}>
            <span className="tsc-mockup__eyebrow" style={{ color: theme.mockupAccent }} />
            <span className="tsc-mockup__title" />
          </div>
        </div>
        {/* Nav tabs */}
        <div className="tsc-mockup__nav" style={{ background: theme.mockupSurface, borderColor: `${theme.mockupAccent}18` }}>
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className="tsc-mockup__tab"
              style={{
                background: i === 1 ? theme.mockupAccent : 'transparent',
                color: i === 1 ? theme.mockupBg : '#666',
              }}
            />
          ))}
        </div>
        {/* Product rows */}
        <div className="tsc-mockup__products" style={{ background: theme.mockupSurface }}>
          {[0.9, 0.7, 0.8].map((w, i) => (
            <div key={i} className="tsc-mockup__product-row">
              <div className="tsc-mockup__product-img" style={{ background: `${theme.mockupAccent}22` }} />
              <div className="tsc-mockup__product-info">
                <span style={{ width: `${w * 100}%`, background: theme.id === 'default' ? '#2a2a24' : '#888' }} />
                <span style={{ width: `${w * 65}%`, background: '#ccc' }} />
                <span className="tsc-mockup__product-price" style={{ color: theme.mockupAccent }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ThemeCard = ({ theme, isLatest }) => {
  const badgeText = theme.badge ?? (isLatest ? 'Yeni' : null);

  return (
    <article className="tsc-card" data-theme-id={theme.id}>
      {badgeText && (
        <div className="tsc-card__badge" style={{ background: theme.mockupAccent, color: theme.mockupBg }}>
          {badgeText}
        </div>
      )}

    <div className="tsc-card__mockup-wrap">
      <ThemeMockup theme={theme} />
    </div>

    <div className="tsc-card__body">
      <div className="tsc-card__head">
        <div className="tsc-card__title-row">
          <h2 className="tsc-card__name">{theme.name}</h2>
          <span className="tsc-card__tag" style={{ color: theme.tagColor, borderColor: `${theme.tagColor}33`, background: `${theme.tagColor}11` }}>
            {theme.tag}
          </span>
        </div>
        <p className="tsc-card__desc">{theme.description}</p>
      </div>

      <ul className="tsc-card__features" aria-label={`${theme.name} tema özellikleri`}>
        {theme.features.map((feature) => (
          <li key={feature}>
            <span className="tsc-card__check" style={{ color: theme.mockupAccent }} aria-hidden="true">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        to={theme.demoUrl}
        className="tsc-card__cta"
        style={{ '--cta-accent': theme.mockupAccent, '--cta-bg': `${theme.mockupAccent}12` }}
        onClick={() => trackEvent('click_theme_demo', { theme_id: theme.id, theme_name: theme.name })}
        onMouseEnter={() => prefetchDemo(theme.demoUrl)}
        onTouchStart={() => prefetchDemo(theme.demoUrl)}
        aria-label={`${theme.name} temasını önizle`}
      >
        <span>Temayı Önizle</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
    </div>
  </article>
  );
};

const MenuShowcase = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="tsc-page">
      <SeoHead
        title="Menü Temaları | zuuqrmenu"
        description="zuuqrmenu'nun farklı menü temalarını keşfedin. Restoranınıza en uygun tasarımı seçin ve demo menüyü anında görüntüleyin."
        canonical="https://zuuqrmenu.com/menu"
        image="https://zuuqrmenu.com/logo_darkmode.svg"
      />

      {/* Header */}
      <header className="tsc-header">
        <div className="tsc-header__inner">
          <Link to="/" className="tsc-header__brand" aria-label="zuuqrmenu ana sayfa">
            <img src="/logo_darkmode.svg" alt="zuuqrmenu" className="tsc-header__logo" />
          </Link>
          <Link
            to="/register"
            className="tsc-header__cta"
            onClick={() => trackEvent('click_cta', { cta_name: 'create_restaurant', location: 'menu_showcase_header' })}
          >
            Restoranını Oluştur <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="tsc-hero">
        <div className="tsc-hero__inner">
          <span className="tsc-hero__kicker">MENÜ TEMALARı</span>
          <h1 className="tsc-hero__title">
            Restoranınıza yakışan<br />
            <em>tasarımı seçin.</em>
          </h1>
          <p className="tsc-hero__desc">
            Her tema farklı bir deneyim sunar. Beğendiğinizi canlı önizleyin,
            restoranınızda kullanmaya başlamak için hemen kaydolun.
          </p>
        </div>
      </section>

      {/* Theme grid */}
      <main className="tsc-main">
        <div className="tsc-grid">
          {themes.map((theme, index) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isLatest={index === themes.length - 1}
            />
          ))}
          <ComingSoonTheme />
        </div>

        {/* Bottom CTA strip */}
        <div className="tsc-bottom-strip">
          <div className="tsc-bottom-strip__inner">
            <div>
              <p className="tsc-bottom-strip__label">Kendi restoranınız için kullanmak ister misiniz?</p>
              <p className="tsc-bottom-strip__sub">Restoran panelinize erişmek ve menünüzü yönetmek için giriş yapın.</p>
            </div>
            <a
              href={getPanelUrl('/login')}
              className="tsc-bottom-strip__cta"
              onClick={() => trackEvent('click_cta', { cta_name: 'login', location: 'menu_showcase_bottom' })}
            >
              Giriş Yap <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="tsc-footer">
        <Link to="/" className="tsc-footer__brand" aria-label="zuuqrmenu ana sayfa">
          <img src="/logo_darkmode.svg" alt="zuuqrmenu" className="tsc-footer__logo" />
        </Link>
        <p className="tsc-footer__copy">© 2026 zuuqrmenu · Restoranlar için modern dijital menü platformu.</p>
        <nav className="tsc-footer__nav" aria-label="Alt gezinme">
          <Link to="/">Ana Sayfa</Link>
          <Link to="/register">Kayıt Ol</Link>
          <a href={getPanelUrl('/login')}>Giriş Yap</a>
        </nav>
      </footer>
    </div>
  );
};

export default MenuShowcase;
