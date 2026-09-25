import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { trackEvent } from '../utils/analytics';
import { getPanelUrl } from '../utils/domainHelpers';
import { useAuth } from '../context/AuthContext';
import { publicMenuService } from '../services/publicMenuService';
import LandingZuuAI from '../components/LandingZuuAI';
import '../styles/landing.css';

/* ─── Prefetch demo bundles on idle ──────────────────────────── */
const prefetchDemo = () => {
  try {
    import('./MenuShowcase');
    import('./PublicMenu');
    publicMenuService.prefetchMenu('demo');
    publicMenuService.prefetchMenu('demo2');
  } catch (_) {}
};

/* ═══════════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════════ */
export const LandingHeader = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, isRestaurantUser } = useAuth();
  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const dashUrl = getPanelUrl(isRestaurantUser ? '/dashboard' : '/admin');
  const loginUrl = getPanelUrl('/login');
  const registerUrl = getPanelUrl('/register');

  const handleHashClick = (e, targetId) => {
    if (window.location.pathname === '/') {
      if (!targetId || targetId === 'anasayfa' || targetId === 'urun') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        close();
        return;
      }
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
        close();
      }
    }
  };

  return (
    <>
      <header className={`lp3-header ${scrolled ? 'lp3-header--scrolled' : ''}`}>
        <div className="lp3-header__inner">
          <Link to="/" className="lp3-brand" onClick={close} aria-label="zuuqrmenu ana sayfa">
            <img src="/logo.svg" alt="zuuqrmenu" className="lp3-brand__logo" />
          </Link>

          <nav className="lp3-nav" aria-label="Ana gezinme">
            <a href="/" className="lp3-nav__link" onClick={(e) => handleHashClick(e, 'anasayfa')}>Ana Sayfa</a>
            <a href="/#nasil-calisir" className="lp3-nav__link" onClick={(e) => handleHashClick(e, 'nasil-calisir')}>Nasıl Çalışır?</a>
            <a href="/#temalar" className="lp3-nav__link" onClick={(e) => handleHashClick(e, 'temalar')}>Temalar</a>
            <a href="/#fiyatlandirma" className="lp3-nav__link" onClick={(e) => handleHashClick(e, 'fiyatlandirma')}>Fiyatlandırma</a>
            <a href="/#yorumlar" className="lp3-nav__link" onClick={(e) => handleHashClick(e, 'yorumlar')}>Restoranlar</a>
            <Link to="/menu" className="lp3-nav__link" onMouseEnter={prefetchDemo}>Demo Menüler</Link>
          </nav>

          <div className="lp3-header__actions">
            {isAuthenticated ? (
              <a href={dashUrl} className="lp3-header__login">Yönetim Paneli</a>
            ) : (
              <a href={loginUrl} className="lp3-header__login">Giriş Yap</a>
            )}
            <a
              href={registerUrl}
              className="lp3-header__cta"
              onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'header' })}
            >
              <span>Ücretsiz Başla ↗</span>
            </a>
          </div>

          {/* Dedicated mobile Login button */}
          <a href={loginUrl} className="lp3-header__mobile-login">
            Giriş Yap
          </a>

          <button
            type="button"
            className={`lp3-hamburger ${open ? 'lp3-hamburger--open' : ''}`}
            aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <nav
        className={`lp3-mobile-nav ${open ? 'is-open' : ''}`}
        aria-label="Mobil gezinme"
        aria-hidden={!open}
      >
        <a href="/" className="lp3-mobile-nav__link" onClick={(e) => handleHashClick(e, 'anasayfa')}>Ana Sayfa</a>
        <a href="/#nasil-calisir" className="lp3-mobile-nav__link" onClick={(e) => handleHashClick(e, 'nasil-calisir')}>Nasıl Çalışır?</a>
        <a href="/#temalar" className="lp3-mobile-nav__link" onClick={(e) => handleHashClick(e, 'temalar')}>Temalar</a>
        <a href="/#fiyatlandirma" className="lp3-mobile-nav__link" onClick={(e) => handleHashClick(e, 'fiyatlandirma')}>Fiyatlandırma</a>
        <a href="/#yorumlar" className="lp3-mobile-nav__link" onClick={(e) => handleHashClick(e, 'yorumlar')}>Restoranlar</a>
        <Link to="/menu" className="lp3-mobile-nav__link" onClick={close} onMouseEnter={prefetchDemo}>Demo Menüler</Link>
        {isAuthenticated ? (
          <a href={dashUrl} className="lp3-mobile-nav__link" onClick={close}>Yönetim Paneli</a>
        ) : (
          <a href={loginUrl} className="lp3-mobile-nav__link" onClick={close}>Giriş Yap</a>
        )}
        <a
          href={registerUrl}
          className="lp3-mobile-nav__cta"
          onClick={() => { trackEvent('click_cta', { cta_name: 'register', location: 'mobile_nav' }); close(); }}
        >
          Ücretsiz Başla ↗
        </a>
      </nav>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   THEMES DATA & SHARED PHONE PREVIEW
   ═══════════════════════════════════════════════════════════════ */
export const themesData = [
  {
    id: 'default',
    name: 'Varsayılan',
    desc: 'Temiz, sade ve her restorana yakışan klasik QR menü deneyimi. Üstte hikaye (story) halkaları, net kategori sekmeleri ve akıcı ürün listesi.',
    features: ['Hikaye (Story) önizleme çemberleri', 'Hızlı kategori navigasyonu', 'Kapsamlı ürün detay modalı', 'Yüksek okunabilirlik'],
    accent: '#deff36',
  },
  {
    id: 'modern',
    name: 'Modern (Bento Grid)',
    desc: 'Görsel odaklı Bento Grid kart düzeni. Öne çıkan spesiyaller, zengin fotoğraf blokları ve premium restoranlara özel lüks bir keşif deneyimi.',
    features: ['Bento grid görsel kart düzeni', 'Öne çıkan şefin spesiyali vitrini', 'Fotoğraf ve lezzet odaklı keşif', 'Akıcı mikro animasyonlar'],
    accent: '#a78bfa',
  },
];

export const ThemePhone = ({ theme }) => {
  const isDefault = theme.id === 'default';

  return (
    <div className="lp3-theme-device-frame lp3-theme-device-frame--switchable" aria-label={`${theme.name} tema önizlemesi`}>
      <div className="lp3-theme-device-notch" aria-hidden="true" />
      <div className={`lp3-phone-screen lp3-phone-screen--default ${isDefault ? 'is-active' : 'is-inactive'}`} aria-hidden="true">
        {/* Header with Dark Premium Gradient */}
          <div className="lp3-d-header" style={{ background: 'linear-gradient(180deg, #2b2c30 0%, #18191c 100%)' }}>
            <div className="lp3-d-topbar">
              <span className="lp3-m-topbar__btn lp3-m-topbar__btn--light">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </span>
              <span className="lp3-d-header__title">Varsayılan Tema</span>
              <span className="lp3-m-topbar__btn lp3-m-topbar__btn--light">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="3" />
                </svg>
              </span>
            </div>
          </div>

          {/* Horizontal Category Nav */}
          <div className="lp3-d-tabs">
            <span className="lp3-d-tab lp3-d-tab--active">Başlangıçlar</span>
            <span className="lp3-d-tab">Çorbalar</span>
            <span className="lp3-d-tab">Salatalar</span>
            <span className="lp3-d-tab">Ana Yemekler</span>
            <span className="lp3-d-tab">Burgerler</span>
          </div>

          {/* Content Scroll Area */}
          <div className="lp3-d-scroll">
            {/* Stories Section with Brand Lime Rings */}
            <div className="lp3-d-stories-box">
              <div className="lp3-d-stories-title">ÖNE ÇIKANLAR</div>
              <div className="lp3-d-stories-strip">
                {[
                  { name: 'Humus', color: 'linear-gradient(135deg, #f3f2eb, #dfded6)' },
                  { name: 'Mercimek', color: 'linear-gradient(135deg, #f0efe8, #dbdad2)' },
                  { name: 'Sezar', color: 'linear-gradient(135deg, #f5f4ee, #e2e1d9)' },
                  { name: 'Külbastı', color: 'linear-gradient(135deg, #eeebe4, #d8d6ce)' },
                  { name: 'Burger', color: 'linear-gradient(135deg, #f2f1ea, #dedcd4)' },
                  { name: 'Margherita', color: 'linear-gradient(135deg, #f6f5ef, #e5e3db)' },
                  { name: 'Penne', color: 'linear-gradient(135deg, #efeee7, #dbd9d1)' },
                  { name: 'Tatlı', color: 'linear-gradient(135deg, #edece5, #d6d4cc)' },
                ].map((s, i) => (
                  <div key={i} className="lp3-d-story-item">
                    <div className="lp3-d-story-ring">
                      <div className="lp3-d-story-avatar" style={{ background: s.color }} />
                    </div>
                    <span className="lp3-d-story-name">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Başlangıçlar */}
            <div className="lp3-d-section-title">Başlangıçlar</div>

            <div className="lp3-d-product-card">
              <div className="lp3-d-product-thumb" style={{ background: 'linear-gradient(135deg, #f0efe8, #dedcd4)' }} />
              <div className="lp3-d-product-info">
                <div className="lp3-d-product-head">
                  <span className="lp3-d-product-name">Humus</span>
                  <span className="lp3-d-badge">Öne Çıkan</span>
                </div>
                <span className="lp3-d-product-desc">Tahini, limon ve sızma zeytinyağı</span>
                <div className="lp3-d-product-prices">
                  <span className="lp3-d-price-old">₺200.00</span>
                  <span className="lp3-d-price-current">₺180.00</span>
                </div>
              </div>
            </div>

            <div className="lp3-d-product-card">
              <div className="lp3-d-product-thumb" style={{ background: 'linear-gradient(135deg, #edebe4, #dbd9d1)' }} />
              <div className="lp3-d-product-info">
                <span className="lp3-d-product-name">Paçanga Böreği</span>
                <span className="lp3-d-product-desc">Pastırma, kaşar ve biberli çıtır börek</span>
                <div className="lp3-d-product-prices">
                  <span className="lp3-d-price-current">₺240.00</span>
                </div>
              </div>
            </div>

            <div className="lp3-d-product-card">
              <div className="lp3-d-product-thumb" style={{ background: 'linear-gradient(135deg, #f3f2eb, #e1e0d8)' }} />
              <div className="lp3-d-product-info">
                <span className="lp3-d-product-name">Patlıcan Söğürme</span>
                <span className="lp3-d-product-desc">Közlenmiş patlıcan, domates ve sarımsak</span>
                <div className="lp3-d-product-prices">
                  <span className="lp3-d-price-current">₺190.00</span>
                </div>
              </div>
            </div>

            <div className="lp3-d-product-card">
              <div className="lp3-d-product-thumb" style={{ background: 'linear-gradient(135deg, #eeebe3, #dad8cf)' }} />
              <div className="lp3-d-product-info">
                <span className="lp3-d-product-name">Çıtır Tavuk Parçaları</span>
                <span className="lp3-d-product-desc">Baharatlı çıtır tavuk ve dip sos</span>
                <div className="lp3-d-product-prices">
                  <span className="lp3-d-price-current">₺280.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`lp3-phone-screen lp3-phone-screen--modern ${!isDefault ? 'is-active' : 'is-inactive'}`} aria-hidden="true">
          {/* App Topbar */}
          <div className="lp3-m-topbar">
            <div className="lp3-m-topbar__btn">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>
            <span className="lp3-m-topbar__title">Modern Tema</span>
            <div className="lp3-m-topbar__btn">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Bento Category Scroll */}
          <div className="lp3-m-bento-scroll">
            {/* 1. Kahvaltı (Wide Banner) */}
            <div className="lp3-m-bcard lp3-m-bcard--wide" style={{ background: 'linear-gradient(135deg, #f5f4ee, #e8e6dd)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
              <div className="lp3-m-bcard__info">
                <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Kahvaltı & Serpme</span>
                <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>Güne taze lezzetlerle başlayın</span>
              </div>
            </div>

            {/* 2. Başlangıçlar & Çorbalar (Two Halves) */}
            <div className="lp3-m-bgrid-row">
              <div className="lp3-m-bcard lp3-m-bcard--half" style={{ background: 'linear-gradient(135deg, #f0efe7, #e2e0d6)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
                <div className="lp3-m-bcard__info">
                  <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Başlangıçlar</span>
                  <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>Meze & sıcak tabaklar</span>
                </div>
              </div>
              <div className="lp3-m-bcard lp3-m-bcard--half" style={{ background: 'linear-gradient(135deg, #f6f5ef, #e9e7df)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
                <div className="lp3-m-bcard__info">
                  <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Çorbalar</span>
                  <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>Günün taze çorbası</span>
                </div>
              </div>
            </div>

            {/* 3. Ana Yemekler (Wide Hero Banner) */}
            <div className="lp3-m-bcard lp3-m-bcard--wide" style={{ background: 'linear-gradient(135deg, #eeebe3, #dedbd1)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
              <div className="lp3-m-bcard__info">
                <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Ana Yemekler</span>
                <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>Izgaralar & Şef Spesiyalleri</span>
              </div>
            </div>

            {/* 4. Burgerler & Pizzalar (Two Halves) */}
            <div className="lp3-m-bgrid-row">
              <div className="lp3-m-bcard lp3-m-bcard--half" style={{ background: 'linear-gradient(135deg, #f3f2eb, #e6e4dc)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
                <div className="lp3-m-bcard__info">
                  <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Burgerler</span>
                  <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>Ev yapımı ekmeklerle</span>
                </div>
              </div>
              <div className="lp3-m-bcard lp3-m-bcard--half" style={{ background: 'linear-gradient(135deg, #f2f1e9, #e5e3db)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
                <div className="lp3-m-bcard__info">
                  <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Pizzalar</span>
                  <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>Taş fırın çıtırlığı</span>
                </div>
              </div>
            </div>

            {/* 5. Makarna (Wide Banner) */}
            <div className="lp3-m-bcard lp3-m-bcard--wide" style={{ background: 'linear-gradient(135deg, #f7f6f0, #eae8df)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
              <div className="lp3-m-bcard__info">
                <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Makarna</span>
                <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>İtalyan usulü taze soslarla</span>
              </div>
            </div>

            {/* 6. Tatlılar & İçecekler (Two Halves) */}
            <div className="lp3-m-bgrid-row">
              <div className="lp3-m-bcard lp3-m-bcard--half" style={{ background: 'linear-gradient(135deg, #f4f3eb, #e7e5dc)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
                <div className="lp3-m-bcard__info">
                  <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Tatlılar</span>
                  <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>Günün tatlı kapanışı</span>
                </div>
              </div>
              <div className="lp3-m-bcard lp3-m-bcard--half" style={{ background: 'linear-gradient(135deg, #f1f0e7, #e3e1d7)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
                <div className="lp3-m-bcard__info">
                  <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>İçecekler</span>
                  <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>Sıcak & soğuk kahveler</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HERO (Minimalist, Editorial & Focused)
   ═══════════════════════════════════════════════════════════════ */
const Hero = ({ prefetch }) => {
  const registerUrl = getPanelUrl('/register');

  return (
    <section className="lp3-hero" aria-label="Hero">
      <div className="lp3-hero__grid" aria-hidden="true" />

      <div className="lp3-hero__inner">
        <div className="lp3-hero__eyebrow lp3-reveal">
          <span className="lp3-hero__eyebrow-dot" aria-hidden="true" />
          Restoranlar için Akıllı QR Dijital Menü
        </div>

        <h1 className="lp3-hero__h1 lp3-reveal lp3-reveal--delay-1">
          Menünüz <em>artık</em><br />
          <strong>masada değil.</strong>
        </h1>

        <p className="lp3-hero__sub lp3-reveal lp3-reveal--delay-2">
          QR kodunuzu okutun — menünüz saniyeler içinde müşterinizin telefonunda.
          Fiyatları, ürünleri ve stok durumunu tek bir yerden anında yönetin.
        </p>

        <div className="lp3-hero__actions lp3-reveal lp3-reveal--delay-3">
          <a
            href={registerUrl}
            className="lp3-btn lp3-btn--primary"
            onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'hero' })}
          >
            Ücretsiz Başla ↗
          </a>
          <Link
            to="/menu"
            className="lp3-btn lp3-btn--ghost"
            onClick={() => trackEvent('click_cta', { cta_name: 'demo', location: 'hero' })}
            onMouseEnter={prefetch}
            onTouchStart={prefetch}
          >
            Demo Menüyü Gör →
          </Link>
        </div>

        <div className="lp3-hero__trust lp3-reveal lp3-reveal--delay-4">
          <span className="lp3-hero__trust-item">
            <svg className="lp3-hero__trust-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Kodsuz anında kurulum
          </span>
          <span className="lp3-hero__trust-sep" aria-hidden="true" />
          <span className="lp3-hero__trust-item">
            <svg className="lp3-hero__trust-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            1 saniyede fiyat güncelleme
          </span>
          <span className="lp3-hero__trust-sep" aria-hidden="true" />
          <span className="lp3-hero__trust-item">
            <svg className="lp3-hero__trust-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tüm telefon ve tabletlerde uyumlu
          </span>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TICKER (Seamless Infinite Loop)
   ═══════════════════════════════════════════════════════════════ */
const Ticker = () => {
  const items = [
    'Dijital QR Menü',
    'Anlık Fiyat Güncelleme',
    'ZuuAI Menü Asistanı',
    'PDF & Fotoğraftan Menü Yükleme',
    'QR Masa Kartı Tasarımcısı',
    'Modern Bento Tema',
    'Detaylı Menü Analitiği',
    'Çoklu Kategori & Varyasyon',
    'Hızlı & Kesintisiz Deneyim',
    'Stok & Ürün Durumu Yönetimi',
  ];

  return (
    <div className="lp3-ticker" aria-hidden="true">
      <div className="lp3-ticker__track">
        {[...Array(4)].map((_, gi) => (
          <div className="lp3-ticker__group" key={gi}>
            {items.map((item, i) => (
              <span className="lp3-ticker__item" key={`${gi}-${i}`}>
                <span className="lp3-ticker__sep" />
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PROBLEM STORY (Aligned 2-Column Grid)
   ═══════════════════════════════════════════════════════════════ */
const ProblemSection = () => (
  <section className="lp3-problem" id="urun">
    <div className="lp3-problem__inner">
      <div className="lp3-problem__col-left lp3-reveal">
        <span className="lp3-label">Geleneksel Menü Sorunu</span>
        <h2 className="lp3-problem__headline">
          Menü değişti.<br />
          Fiyat değişti.<br />
          Stok bitti.
          <em>Ama basılı menü hâlâ masada.</em>
        </h2>
      </div>

      <div className="lp3-problem__col-right">
        <div className="lp3-problem__step lp3-reveal lp3-reveal--delay-1">
          <div className="lp3-problem__step-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <circle cx="12" cy="14" r="3.5"></circle>
              <polyline points="12 12.5 12 14 13.5 14"></polyline>
            </svg>
          </div>
          <div className="lp3-problem__step-text">
            <strong>Basılı menü ilk günden eskir.</strong>
            Maliyetler ve fiyatlar sürekli değişiyor ama masadaki kağıt menü eskisini gösteriyor. Müşteri kafa karışıklığı ve garson mahcubiyeti yaşanıyor.
          </div>
        </div>

        <div className="lp3-problem__step lp3-reveal lp3-reveal--delay-2">
          <div className="lp3-problem__step-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
          </div>
          <div className="lp3-problem__step-text">
            <strong>Her güncelleme yüksek matbaa masrafı demek.</strong>
            Tasarım, onay, baskı, dağıtım... Hem bütçe hem günler harcanıyor ve 1 ay sonra yine aynı masraflı döngü başlıyor.
          </div>
        </div>

        <div className="lp3-problem__step lp3-reveal lp3-reveal--delay-3">
          <div className="lp3-problem__step-icon lp3-problem__step-icon--accent" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
          </div>
          <div className="lp3-problem__step-text">
            <strong>zuuqrmenu ile tek seferlik akıllı dijital geçiş.</strong>
            Bir kez masaya şık QR kodunuzu yerleştirin. Sonraki tüm değişiklikleri yönetim panelinizden saniyeler içinde yapın, tüm masalar anında güncellensin.
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   SCROLL STORY (Compact, Clean & Sleek)
   ═══════════════════════════════════════════════════════════════ */
const storySteps = [
  { num: '01', title: 'Menünüzü oluşturun.', desc: 'Kategorilerinizi ve ürünlerinizi birkaç tıklamayla ekleyin. Fotoğraf, açıklama ve fiyat.' },
  { num: '02', title: 'Fiyatı saniyeler içinde değiştirin.', desc: 'Enflasyon, mevsim, kampanya — herhangi bir nedenle fiyatları anında güncelleyin.' },
  { num: '03', title: 'Stok durumunu anında yönetin.', desc: 'Bir ürün bitti mi? Tek tıkla stok dışı yapın. Müşteriler boşuna sipariş vermesin.' },
  { num: '04', title: 'Özel lezzetleri öne çıkarın.', desc: 'Günün spesiyalini veya şefin önerisini vitrine taşıyın, satışları artırın.' },
  { num: '05', title: 'Tüm masalarda anında yayında.', desc: 'Masadaki QR kod tarandığında müşteriniz en güncel ve kusursuz menüyü görür.' },
];

const ScrollStory = () => {
  const [active, setActive] = useState(0);

  return (
    <section className="lp3-scroll-story" id="nasil-calisir">
      <div className="lp3-scroll-story__inner">
        {/* Compact Steps Column */}
        <div className="lp3-scroll-story__label">
          <div className="lp3-reveal">
            <span className="lp3-label">Kolay İş Akışı</span>
            <h2 className="lp3-scroll-story__headline">Bir değişiklik.<br />Her yerde anında güncel.</h2>
          </div>
          <div className="lp3-scroll-story__steps">
            {storySteps.map((step, i) => (
              <div
                key={step.num}
                className={`lp3-story-step ${active === i ? 'is-active' : ''}`}
                onClick={() => setActive(i)}
                role="button"
                tabIndex={0}
              >
                <div className="lp3-story-step__num-badge">{step.num}</div>
                <div className="lp3-story-step__content">
                  <h3 className="lp3-story-step__title">{step.title}</h3>
                  <p className="lp3-story-step__desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compact Phone Mockup Column */}
        <div className="lp3-scroll-story__phone-wrap lp3-reveal lp3-reveal--delay-1">
          <div className="lp3-story-phone" aria-label="Menü önizlemesi">
            <div className="lp3-story-phone__notch" aria-hidden="true" />
            <div className="lp3-story-phone__screen">
              <header className="lp3-story-phone__header">
                <p className="lp3-story-phone__rname">La Cucina Ristorante</p>
                <p className="lp3-story-phone__rstatus">
                  {active === 1 && '● Fiyat Değişikliği Uygulandı'}
                  {active === 2 && '● Stok Durumu Güncellendi'}
                  {active === 3 && '● Öne Çıkan Ürün Eklendi'}
                  {active === 4 && '● QR Menü Yayında'}
                  {active === 0 && '● Menü Aktif'}
                </p>
              </header>

              <div className="lp3-story-phone__body">
                {/* Product Item 1 */}
                <div className={`lp3-story-item ${active === 1 ? 'lp3-story-item--highlight' : ''} ${active === 3 ? 'lp3-story-item--highlight' : ''}`}>
                  <div className="lp3-story-item__thumb" style={{ background: 'linear-gradient(135deg, #d4a57a, #c4855a)' }} />
                  <div className="lp3-story-item__info">
                    <div className="lp3-story-item__title">
                      {active === 3 ? '🔥 Şefin İmzası - Trüflü Pizza' : 'Margherita Pizza'}
                    </div>
                    <div className="lp3-story-item__desc">Domates sosu, manda mozzarella, taze fesleğen</div>
                  </div>
                  <div className="lp3-story-item__price">
                    {active === 1 ? <><span className="lp3-story-item__old-price">₺320</span>₺360</> : '₺360'}
                  </div>
                </div>

                {/* Product Item 2 */}
                <div className="lp3-story-item">
                  <div className="lp3-story-item__thumb" style={{ background: 'linear-gradient(135deg, #7fb87a, #5a9a55)' }} />
                  <div className="lp3-story-item__info">
                    <div className="lp3-story-item__title">Roka & Burrata Salatası</div>
                    <div className="lp3-story-item__desc">Taze burrata, çeri domates, balsamik sos</div>
                  </div>
                  <div className="lp3-story-item__price">₺240</div>
                </div>

                {/* Product Item 3 */}
                <div className={`lp3-story-item ${active === 2 ? 'lp3-story-item--dimmed' : ''}`}>
                  <div className="lp3-story-item__thumb" style={{ background: 'linear-gradient(135deg, #e8b86d, #c8a04d)' }} />
                  <div className="lp3-story-item__info">
                    <div className="lp3-story-item__title">Günün Balığı & Deniz Mahsulü</div>
                    <div className="lp3-story-item__desc">
                      {active === 2 ? '⚠️ Bugünlük tükendi (Stok dışı)' : 'Izgara levrek fileto, tereyağlı sebzeler'}
                    </div>
                  </div>
                  <div className="lp3-story-item__price" style={active === 2 ? { textDecoration: 'line-through', color: '#999' } : {}}>
                    ₺390
                  </div>
                </div>

                {/* Product Item 4 */}
                <div className="lp3-story-item">
                  <div className="lp3-story-item__thumb" style={{ background: 'linear-gradient(135deg, #d4a4b0, #b07080)' }} />
                  <div className="lp3-story-item__info">
                    <div className="lp3-story-item__title">İtalyan Tiramisu</div>
                    <div className="lp3-story-item__desc">Mascarpone kreması, espresso, kakao</div>
                  </div>
                  <div className="lp3-story-item__price">₺210</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SPEED / INSTANT UPDATE
   ═══════════════════════════════════════════════════════════════ */
const SpeedSection = () => (
  <section className="lp3-speed">
    <div className="lp3-speed__inner">
      <div className="lp3-reveal">
        <span className="lp3-label">Anlık Güncelleme</span>
        <h2 className="lp3-speed__headline">Bir değişiklik.<br />Bir saniye.<br />Her yerde yayında.</h2>
        <p className="lp3-speed__body">
          Fiyat mı değişti? Ürün mü tükendi? Yeni bir kampanya mı başladı?
          Yönetim panelinizden tek tıkla kaydedin — masalardaki QR kodu okutan her müşteri anında güncel menüyü görür.
        </p>
        <a href={getPanelUrl('/register')} className="lp3-btn lp3-btn--primary"
           onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'speed' })}>
          Hemen Başla ↗
        </a>
      </div>

      <div className="lp3-price-demo lp3-reveal lp3-reveal--delay-2">
        <p className="lp3-price-demo__title">Canlı Menü Güncelleme Simülasyonu</p>
        {[
          { name: 'Margherita Pizza', oldPrice: '₺320', newPrice: '₺350', status: 'active', label: 'Mevcut' },
          { name: 'Roka Salatası', oldPrice: null, newPrice: '₺180', status: 'active', label: 'Mevcut' },
          { name: 'Günün Çorbası', oldPrice: null, newPrice: '₺95', status: 'inactive', label: 'Stokta Yok' },
          { name: 'Tiramisu', oldPrice: null, newPrice: '₺210', status: 'active', label: 'Mevcut' },
        ].map((item, i) => (
          <div className="lp3-price-demo__item" key={i}>
            <span className="lp3-price-demo__name">{item.name}</span>
            <div className="lp3-price-demo__right">
              <div className="lp3-price-demo__price">
                {item.oldPrice && <span className="lp3-price-demo__old">{item.oldPrice}</span>}
                <span className="lp3-price-demo__new" style={item.status === 'inactive' ? { color: 'var(--lp-ink-3)' } : {}}>{item.newPrice}</span>
              </div>
              <div className={`lp3-price-demo__status lp3-price-demo__status--${item.status}`}>
                <span className="lp3-price-demo__status-dot" />
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   MENU UPLOAD WITH ZUUAI
   ═══════════════════════════════════════════════════════════════ */
const UploadSection = () => (
  <section className="lp3-upload">
    <div className="lp3-upload__inner">
      <div className="lp3-reveal">
        <span className="lp3-zuuai-label">
          <span className="lp3-zuuai-label__icon">✦</span>
          ZuuAI ile Otomatik Yükleme
        </span>
        <h2 className="lp3-upload__headline">
          Menünüz zaten hazırsa,<br />
          <em>tek tek yeniden yazmayın.</em>
        </h2>
        <p className="lp3-upload__body">
          Mevcut menünüzün fotoğrafını veya PDF dosyasını yükleyin.
          ZuuAI yapay zekası kategorileri, ürün isimlerini ve fiyatları saniyeler içinde çıkararak dijital menünüze aktarır.
        </p>
        <a href={getPanelUrl('/register')} className="lp3-btn lp3-btn--primary"
           onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'upload' })}>
          Menünü Yükle ↗
        </a>
      </div>

      <div className="lp3-upload-visual lp3-reveal lp3-reveal--delay-2">
        <div className="lp3-upload-visual__title">Akıllı Dijitalleştirme Akışı</div>
        <div className="lp3-upload-flow">
          <div className="lp3-upload-step">
            <span className="lp3-upload-step__num">1</span>
            <div className="lp3-upload-step__info">
              <p className="lp3-upload-step__label">Menü Görseli veya PDF</p>
              <p className="lp3-upload-step__sub">Fotoğraf çekin veya dosya seçin</p>
            </div>
            <span className="lp3-upload-step__badge">PDF / JPG</span>
          </div>

          <div className="lp3-upload-arrow">↓</div>

          <div className="lp3-upload-step lp3-upload-step--ai">
            <span className="lp3-upload-step__num lp3-upload-step__num--ai">✦</span>
            <div className="lp3-upload-step__info">
              <p className="lp3-upload-step__label">ZuuAI Ayrıştırma</p>
              <p className="lp3-upload-step__sub">Kategori, ürün ve fiyat tespiti</p>
            </div>
            <span className="lp3-upload-step__badge lp3-upload-step__badge--ai">2.4 sn</span>
          </div>

          <div className="lp3-upload-arrow">↓</div>

          <div className="lp3-upload-step lp3-upload-step--done">
            <span className="lp3-upload-step__num lp3-upload-step__num--done">✓</span>
            <div className="lp3-upload-step__info">
              <p className="lp3-upload-step__label">Dijital QR Menü Hazır</p>
              <p className="lp3-upload-step__sub">Tüm masalarda anında yayında</p>
            </div>
            <span className="lp3-upload-step__badge lp3-upload-step__badge--done">Canlı</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   THEMES SECTION
   ═══════════════════════════════════════════════════════════════ */
export const ThemesSection = () => {
  const [activeTheme, setActiveTheme] = useState('default');
  const [displayedThemeId, setDisplayedThemeId] = useState('default');
  const [isFading, setIsFading] = useState(false);

  const handleSelectTheme = (id) => {
    if (id === activeTheme) return;
    setActiveTheme(id);
    setIsFading(true);
    setTimeout(() => {
      setDisplayedThemeId(id);
      setIsFading(false);
    }, 150);
  };

  const currentTheme = themesData.find(t => t.id === activeTheme) || themesData[0];
  const displayedTheme = themesData.find(t => t.id === displayedThemeId) || themesData[0];

  return (
    <section className="lp3-themes" id="temalar">
      <div className="lp3-themes__inner">
        <div className="lp3-themes__header lp3-reveal">
          <div>
            <span className="lp3-label">Görsel Özelleştirme</span>
            <h2 className="lp3-themes__headline">Restoranınızın ruhuna<br />yakışan tasarım.</h2>
          </div>
          <div className="lp3-themes__tabs" role="tablist" aria-label="Menü temaları">
            {themesData.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTheme === t.id}
                className={`lp3-themes__tab ${activeTheme === t.id ? 'is-active' : ''}`}
                onClick={() => handleSelectTheme(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="lp3-themes__content lp3-reveal lp3-reveal--delay-1">
          <div className="lp3-themes__mockup-wrap">
            <ThemePhone theme={currentTheme} />
          </div>
          <div className={`lp3-themes__info ${isFading ? 'lp3-theme-info-fade' : ''}`}>
            <h3 className="lp3-themes__name">{displayedTheme.name}</h3>
            <p className="lp3-themes__desc">{displayedTheme.desc}</p>
            <ul className="lp3-themes__features" aria-label="Tema özellikleri">
              {displayedTheme.features.map(f => (
                <li key={f} className="lp3-themes__feature">{f}</li>
              ))}
            </ul>
            <Link
              to="/menu"
              className="lp3-btn lp3-btn--ghost"
              onClick={() => trackEvent('click_theme_demo', { theme_id: activeTheme })}
            >
              Tüm Temaları Canlı Dene →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS
   ═══════════════════════════════════════════════════════════════ */
const AnalyticsSection = () => {
  const bars = [35, 52, 41, 68, 58, 82, 100];
  return (
    <section className="lp3-analytics">
      <div className="lp3-analytics__inner">
        <div className="lp3-reveal">
          <span className="lp3-label">Menü Analitiği</span>
          <h2 className="lp3-analytics__headline">Menünüzü sadece yayınlamayın.<br />Müşteri ilgisini ölçün.</h2>
          <p className="lp3-analytics__body">
            Hangi yemekler daha çok inceleniyor? Hangi saatlerde menü trafiği artıyor?
            Paneldeki detaylı ziyaretçi ve menü analitiği ile menünüzü karlı ürünlere göre optimize edin.
          </p>
          <a href={getPanelUrl('/register')} className="lp3-btn lp3-btn--primary"
             onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'analytics' })}>
            Analitiği Keşfet ↗
          </a>
        </div>

        <div className="lp3-analytics-card lp3-reveal lp3-reveal--delay-2">
          <div className="lp3-analytics-card__header">
            <span className="lp3-analytics-card__title">Menü Görüntülenme Trafiği</span>
            <span className="lp3-analytics-card__period">Son 7 Gün</span>
          </div>
          <div className="lp3-analytics-stats">
            <div className="lp3-analytics-stat">
              <span className="lp3-analytics-stat__value">1.420+</span>
              <span className="lp3-analytics-stat__label">QR Tarama</span>
            </div>
            <div className="lp3-analytics-stat">
              <span className="lp3-analytics-stat__value">12</span>
              <span className="lp3-analytics-stat__label">Aktif Kategori</span>
            </div>
            <div className="lp3-analytics-stat">
              <span className="lp3-analytics-stat__value">64</span>
              <span className="lp3-analytics-stat__label">Görüntülenen Ürün</span>
            </div>
          </div>
          <div className="lp3-bar-chart" aria-label="Haftalık görüntülenme grafiği" role="img">
            {bars.map((h, i) => (
              <div
                key={i}
                className={`lp3-bar-chart__bar ${i === bars.length - 1 ? 'lp3-bar-chart__bar--accent' : ''}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="lp3-analytics-card__caption">Panelinizde anlık ve gerçek verilerinizi takip edersiniz.</p>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════ */
const HowItWorks = () => (
  <section className="lp3-hiw">
    <div className="lp3-hiw__inner">
      <h2 className="lp3-hiw__headline lp3-reveal">Üç adımda dijital menünüz hazır.</h2>
      <p className="lp3-hiw__sub lp3-reveal">Teknik bilgiye gerek yok. Bugün başlayın, dakikalar içinde masalarınıza koyun.</p>
      <div className="lp3-hiw__steps">
        {[
          { num: '01', title: 'Restoranınızı kaydedin.', desc: 'Restoran adınızı girin, menünüzü oluşturun veya ZuuAI ile tek tıkla yükleyin.' },
          { num: '02', title: 'QR kodunuzu indirin.', desc: 'Şık QR masa kartınızı otomatik oluşturun, yüksek çözünürlüklü indirin veya baskıya verin.' },
          { num: '03', title: 'Müşterileriniz anında ulaşsın.', desc: 'Kamera ile taranan menü anında açılır. Uygulama indirme yok, bekleme yok.' },
        ].map(s => (
          <div key={s.num} className="lp3-hiw-step lp3-reveal">
            <div className="lp3-hiw-step__num">{s.num}</div>
            <h3 className="lp3-hiw-step__title">{s.title}</h3>
            <p className="lp3-hiw-step__desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   PRICING SECTION (Yıllık 2999/4999 TL & Aylık 399/599 TL)
   ═══════════════════════════════════════════════════════════════ */
export const PricingCardsGrid = ({ isAnnual, setIsAnnual }) => {
  const registerUrl = getPanelUrl('/register');

  return (
    <>
      <div className="lp3-pricing__header lp3-reveal">
        <span className="lp3-label">Şeffaf Fiyatlandırma</span>
        <h2 className="lp3-pricing__headline">İşletmenize uygun planı seçin.</h2>
        <p className="lp3-pricing__sub">Gizli ücret yok, sürpriz yok. 7 gün ücretsiz deneyin, dilediğiniz an iptal edin.</p>

        <div className="lp3-pricing__toggle-wrap">
          <button
            type="button"
            className={`lp3-pricing__toggle-btn ${!isAnnual ? 'is-active' : ''}`}
            onClick={() => setIsAnnual(false)}
          >
            Aylık
          </button>
          <button
            type="button"
            className={`lp3-pricing__toggle-btn ${isAnnual ? 'is-active' : ''}`}
            onClick={() => setIsAnnual(true)}
          >
            <span>Yıllık</span>
            <span className="lp3-pricing__discount-pill">%37 İndirim</span>
          </button>
        </div>
      </div>

      <div className="lp3-pricing__grid lp3-reveal lp3-reveal--delay-1">
        {/* Tier 1: Başlangıç */}
        <div className="lp3-price-card">
          <div className="lp3-price-card__header">
            <h3 className="lp3-price-card__name">Başlangıç</h3>
            <p className="lp3-price-card__desc">Temel dijital menüye geçmek isteyen tek şubeli kafeler ve butik işletmeler için.</p>
          </div>
          <div className="lp3-price-card__price-box">
            <span className="lp3-price-card__amount">{isAnnual ? '₺2.999' : '₺399'}</span>
            <span className="lp3-price-card__period">{isAnnual ? '/ yıl' : '/ ay'}</span>
          </div>
          {isAnnual && (
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="lp3-price-card__savings-pill">₺249 / ay (%37 İndirim)</span>
            </div>
          )}
          <ul className="lp3-price-card__features">
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              7 Gün Ücretsiz Deneme Süresi
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              Sınırsız kategori ve ürün ekleme
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              Anlık fiyat ve stok güncelleme
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              Dinamik QR menü & masa kartı üretimi
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              Varsayılan Tema & Logo özelleştirme
            </li>
          </ul>
          <a
            href={registerUrl}
            className="lp3-btn lp3-btn--ghost lp3-price-card__cta"
            onClick={() => trackEvent('click_pricing_plan', { plan: 'starter', isAnnual })}
          >
            Planı Seç ↗
          </a>
        </div>

        {/* Tier 2: Profesyonel (Featured) */}
        <div className="lp3-price-card lp3-price-card--featured">
          <div className="lp3-price-card__badge">En Popüler</div>
          <div className="lp3-price-card__header">
            <h3 className="lp3-price-card__name">Profesyonel</h3>
            <p className="lp3-price-card__desc">ZuuAI yapay zeka gücünü, Bento temasını ve zengin menü analitiğini isteyen işletmeler için.</p>
          </div>
          <div className="lp3-price-card__price-box">
            <span className="lp3-price-card__amount">{isAnnual ? '₺4.999' : '₺599'}</span>
            <span className="lp3-price-card__period">{isAnnual ? '/ yıl' : '/ ay'}</span>
          </div>
          {isAnnual ? (
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="lp3-price-card__savings-pill">₺416 / ay (%30 İndirim)</span>
            </div>
          ) : (
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="lp3-price-card__trial-badge">7 Gün Ücretsiz Deneyin</span>
            </div>
          )}
          <ul className="lp3-price-card__features">
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              <strong>7 Gün Ücretsiz Deneme Süresi</strong>
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              <strong>Başlangıç planındaki tüm özellikler</strong>
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              <strong>ZuuAI Menü Yükleme</strong> (PDF/Fotoğraftan)
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              <strong>Modern Bento Grid</strong> & Tüm Premium Temalar
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              Hikaye (Story) önizleme çemberleri
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              Detaylı ürün ve kategori analitiği
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              Öncelikli WhatsApp & telefon desteği
            </li>
          </ul>
          <a
            href={registerUrl}
            className="lp3-btn lp3-btn--primary lp3-price-card__cta"
            onClick={() => trackEvent('click_pricing_plan', { plan: 'professional', isAnnual })}
          >
            Planı Seç ↗
          </a>
        </div>

        {/* Tier 3: Kurumsal */}
        <div className="lp3-price-card">
          <div className="lp3-price-card__header">
            <h3 className="lp3-price-card__name">Kurumsal</h3>
            <p className="lp3-price-card__desc">Çok şubeli restoran zincirleri ve özel marka entegrasyonu isteyen markalar için.</p>
          </div>
          <div className="lp3-price-card__price-box lp3-price-card__price-box--custom">
            <span className="lp3-price-card__amount lp3-price-card__amount--custom">Özel Fiyat</span>
            <span className="lp3-price-card__period">/ İhtiyaca göre</span>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="lp3-price-card__custom-pill">Esnek Fiyatlandırma</span>
          </div>
          <ul className="lp3-price-card__features">
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              Çoklu şube ve merkezi menü yönetimi
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              Özel alan adı (kendi domaininiz) desteği
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              POS & Kasa sistemi entegrasyonu
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              Restoranınıza özel tema ve marka tasarımı
            </li>
            <li className="lp3-price-card__feature">
              <span className="lp3-price-card__check">✓</span>
              7/24 Özel Müşteri Temsilcisi & SLA
            </li>
          </ul>
          <a
            href="/iletisim"
            className="lp3-btn lp3-btn--ghost lp3-price-card__cta"
            onClick={() => trackEvent('click_pricing_plan', { plan: 'enterprise', isAnnual })}
          >
            Bize Ulaşın →
          </a>
        </div>
      </div>
    </>
  );
};

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="lp3-pricing" id="fiyatlandirma">
      <div className="lp3-pricing__inner">
        <PricingCardsGrid isAnnual={isAnnual} setIsAnnual={setIsAnnual} />

        {/* Trust strip */}
        <div className="lp3-pricing__trust lp3-reveal lp3-reveal--delay-2">
          <span className="lp3-pricing__trust-item">✓ 7 gün ücretsiz deneyin</span>
          <span className="lp3-pricing__trust-item">✓ Kredi kartı gerekmez</span>
          <span className="lp3-pricing__trust-item">✓ İstediğiniz an tek tıkla iptal edin</span>
        </div>

        {/* Detail Page Link */}
        <div className="lp3-pricing__detail-link-wrap lp3-reveal lp3-reveal--delay-3">
          <Link to="/fiyatlandirma" className="lp3-pricing__detail-link">
            Tüm paket detaylarını ve kapsamlı özellik karşılaştırmasını inceleyin <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════════════ */
const testimonialsList = [
  {
    name: 'Ahmet Yılmaz',
    role: 'Kurucu Şef — Trattoria Bella (İstanbul)',
    avatar: 'AY',
    stars: '★★★★★',
    quote: 'Kağıt menü bastırmaktan ve her fiyat değişikliğinde matbaayla haftalarca uğraşmaktan kurtulduk. zuuqrmenu ile 10 saniyede fiyatlar tüm masalarda güncelleniyor. Müşteri memnuniyetimiz ciddi oranda arttı.',
  },
  {
    name: 'Zeynep Karaca',
    role: 'İşletmeci — Kahve Fabrikası (İzmir)',
    avatar: 'ZK',
    stars: '★★★★★',
    quote: 'ZuuAI menü yükleme özelliği bize inanılmaz bir kolaylık sağladı. Eski PDF menümüzü sisteme yükledik ve 2 dakikada kategorilere ayrılmış harika bir dijital menümüz oldu. Herkese tavsiye ediyorum.',
  },
  {
    name: 'Emre Demir',
    role: 'Genel Koordinatör — The Garden Bistro & Lounge (Ankara)',
    avatar: 'ED',
    stars: '★★★★★',
    quote: 'Modern Bento Grid temasına geçtikten sonra müşterilerimizin menüde gezinme süresi ve özel lezzetleri keşfetme oranı %40 arttı. QR masa kartlarının şıklığı da mekanımıza çok yakıştı.',
  },
];

const Testimonials = () => (
  <section className="lp3-testimonials" id="yorumlar">
    <div className="lp3-testimonials__inner">
      <div className="lp3-testimonials__header lp3-reveal">
        <span className="lp3-label">Müşteri Deneyimleri</span>
        <h2 className="lp3-testimonials__headline">Restoranlar ne diyor?</h2>
        <p className="lp3-testimonials__sub">zuuqrmenu kullanan yüzlerce işletmenin gerçek deneyimleri.</p>
      </div>

      <div className="lp3-testimonials__grid lp3-reveal lp3-reveal--delay-1">
        {testimonialsList.map((t, idx) => (
          <article className="lp3-testimonial-card" key={idx}>
            <div className="lp3-testimonial-card__stars" aria-label="5 yıldız">{t.stars}</div>
            <blockquote className="lp3-testimonial-card__quote">"{t.quote}"</blockquote>
            <div className="lp3-testimonial-card__author">
              <div className="lp3-testimonial-card__avatar">{t.avatar}</div>
              <div className="lp3-testimonial-card__info">
                <div className="lp3-testimonial-card__name">{t.name}</div>
                <div className="lp3-testimonial-card__role">{t.role}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════════════ */
const faqItems = [
  { q: 'QR menü nedir ve nasıl çalışır?', a: 'QR menü, müşterilerinizin telefon kameraları ile masadaki QR kodu okutarak dijital olarak görüntüleyebildiği modern bir menüdür. Herhangi bir uygulama indirmeye gerek kalmadan saniyeler içinde doğrudan tarayıcıda açılır.' },
  { q: 'Müşterilerimin herhangi bir uygulama indirmesi gerekir mi?', a: 'Hayır, kesinlikle gerekmez. Standart telefon kamerasıyla masadaki QR kodu tarattıkları an menünüz saniyeler içinde doğrudan mobil tarayıcıda açılır.' },
  { q: 'Fiyatları ve ürün stoklarını ne kadar sürede güncelleyebilirim?', a: 'Yönetim panelinizden veya cep telefonunuzdan bir fiyatı veya ürünün stok durumunu değiştirdiğiniz an (ortalama 1 saniye içinde) masalardaki tüm QR menülerde değişiklik anında geçerli olur.' },
  { q: 'Mevcut basılı menümü nasıl dijital menüye aktarabilirim?', a: 'zuuqrmenu\'nun yapay zeka destekli ZuuAI asistanı sayesinde, mevcut menünüzün fotoğrafını veya PDF dosyasını yüklemeniz yeterlidir. Yapay zeka tüm ürünleri, açıklamaları ve fiyatları otomatik olarak ayrıştırıp menünüze ekler.' },
  { q: 'Ücretsiz deneme süresi var mı? Kredi kartı gerekli mi?', a: 'Evet! Tüm paketlerimizi 7 gün boyunca hiçbir ücret ödemeden ve kredi kartı bilgisi girmeden tüm özellikleriyle deneyebilirsiniz.' },
];

const FaqSection = () => {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="lp3-faq" id="sss">
      <div className="lp3-faq__inner">
        <div className="lp3-faq__header lp3-reveal">
          <span className="lp3-label">Sıkça Sorulan Sorular</span>
          <h2 className="lp3-faq__headline">Aklınıza takılan her şey.</h2>
        </div>

        <div className="lp3-faq__list lp3-reveal lp3-reveal--delay-1">
          {faqItems.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`lp3-faq-item ${isOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="lp3-faq-item__trigger"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span className="lp3-faq-item__question">{item.q}</span>
                  <span className="lp3-faq-item__icon">+</span>
                </button>
                <div className="lp3-faq-item__answer">
                  <div className="lp3-faq-item__answer-inner">
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════════ */
const FinalCtaSection = () => {
  const registerUrl = getPanelUrl('/register');
  return (
    <section className="lp3-final-cta">
      <div className="lp3-final-cta__inner lp3-reveal">
        <div className="lp3-final-cta__box">
          <h2 className="lp3-final-cta__headline">Kağıt menü devrini bugün kapatın.</h2>
          <p className="lp3-final-cta__sub">
            Yüzlerce restoran gibi siz de dakikalar içinde modern dijital QR menünüze geçin.
          </p>
          <div className="lp3-final-cta__actions">
            <a
              href={registerUrl}
              className="lp3-btn lp3-btn--primary"
              onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'final_cta' })}
            >
              7 Gün Ücretsiz Başla ↗
            </a>
            <Link to="/menu" className="lp3-btn lp3-btn--ghost" onMouseEnter={prefetchDemo}>
              Demo Menüleri İncele →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */
export const LandingFooter = () => {
  const year = new Date().getFullYear();
  const handleHashClick = (e, targetId) => {
    if (window.location.pathname === '/') {
      if (!targetId || targetId === 'anasayfa' || targetId === 'urun') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="lp3-footer">
      <div className="lp3-footer__inner">
        {/* Brand */}
        <div>
          <img src="/logo_darkmode.svg" alt="zuuqrmenu" className="lp3-footer__brand-logo" />
          <p className="lp3-footer__brand-desc">
            Restoranlar için modern dijital QR menü platformu.
            Kategorilerinizi, ürünlerinizi ve fiyatlarınızı tek bir yerden yönetin.
          </p>
        </div>

        {/* Ana Sayfa */}
        <div>
          <h4 className="lp3-footer__col-title">Ana Sayfa</h4>
          <nav className="lp3-footer__links" aria-label="Ana sayfa bağlantıları">
            <a href="/" className="lp3-footer__link" onClick={(e) => handleHashClick(e, 'anasayfa')}>Ana Sayfa</a>
            <a href="/#temalar" className="lp3-footer__link" onClick={(e) => handleHashClick(e, 'temalar')}>Temalar</a>
            <a href="/#zuuai" className="lp3-footer__link" onClick={(e) => handleHashClick(e, 'zuuai')}>ZuuAI Asistan</a>
            <a href="/#fiyatlandirma" className="lp3-footer__link" onClick={(e) => handleHashClick(e, 'fiyatlandirma')}>Fiyatlandırma</a>
            <Link to="/menu" className="lp3-footer__link">Demo Menüler</Link>
          </nav>
        </div>

        {/* Şirket */}
        <div>
          <h4 className="lp3-footer__col-title">Şirket</h4>
          <nav className="lp3-footer__links" aria-label="Şirket bağlantıları">
            <Link to="/hakkimizda" className="lp3-footer__link">Hakkımızda</Link>
            <Link to="/iletisim" className="lp3-footer__link">İletişim</Link>
          </nav>
        </div>

        {/* Yasal */}
        <div>
          <h4 className="lp3-footer__col-title">Yasal</h4>
          <nav className="lp3-footer__links" aria-label="Yasal bağlantılar">
            <Link to="/gizlilik" className="lp3-footer__link">Gizlilik Politikası</Link>
            <Link to="/kullanim-kosullari" className="lp3-footer__link">Kullanım Koşulları</Link>
            <Link to="/kvkk" className="lp3-footer__link">KVKK</Link>
            <Link to="/cerez" className="lp3-footer__link">Çerez Politikası</Link>
          </nav>
        </div>
      </div>

      <div className="lp3-footer__bottom">
        <span className="lp3-footer__copy">© {year} zuuqrmenu. Tüm hakları saklıdır.</span>
        <div className="lp3-footer__legal">
          <Link to="/gizlilik">Gizlilik</Link>
          <Link to="/kullanim-kosullari">Koşullar</Link>
          <Link to="/kvkk">KVKK</Link>
        </div>
      </div>
    </footer>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  useEffect(() => {
    const reveals = document.querySelectorAll('.lp3-reveal');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('lp3-reveal--in');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(el => observer.observe(el));

    const idleTimer = 'requestIdleCallback' in window
      ? window.requestIdleCallback(prefetchDemo, { timeout: 3000 })
      : setTimeout(prefetchDemo, 2500);

    return () => {
      observer.disconnect();
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleTimer);
      else clearTimeout(idleTimer);
    };
  }, []);

  return (
    <div className="lp3-page">
      <SeoHead
        title="zuuqrmenu — Restoran için QR Menü | Dijital Menü Oluştur"
        description="Restoranınız için dakikalar içinde QR dijital menü oluşturun. Anlık güncelleme, ZuuAI asistanı, menü yükleme ve özelleştirilebilir temalar. Kağıt menü çağı bitti."
        canonical="https://zuuqrmenu.com/"
        image="https://zuuqrmenu.com/og-cover.png"
        ogType="website"
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': 'https://zuuqrmenu.com/#organization',
              name: 'zuuqrmenu',
              url: 'https://zuuqrmenu.com/',
              logo: { '@type': 'ImageObject', url: 'https://zuuqrmenu.com/logo.svg', width: 512, height: 512 },
              description: 'Restoranlar için modern QR menü oluşturma ve dijital menü yönetim platformu.',
              foundingDate: '2024',
              areaServed: { '@type': 'Country', name: 'Turkey' },
            },
            {
              '@type': 'WebSite',
              '@id': 'https://zuuqrmenu.com/#website',
              name: 'zuuqrmenu',
              url: 'https://zuuqrmenu.com/',
              inLanguage: 'tr-TR',
              publisher: { '@id': 'https://zuuqrmenu.com/#organization' },
            },
            {
              '@type': 'SoftwareApplication',
              '@id': 'https://zuuqrmenu.com/#app',
              name: 'zuuqrmenu',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '2999',
                priceCurrency: 'TRY',
              },
            },
          ],
        }}
      />

      <LandingHeader />

      <main>
        <Hero prefetch={prefetchDemo} />
        <Ticker />
        <ProblemSection />
        <ScrollStory />
        <SpeedSection />
        <UploadSection />
        <ThemesSection />
        <AnalyticsSection />
        <HowItWorks />
        <PricingSection />
        <Testimonials />
        <FaqSection />
        <FinalCtaSection />
      </main>

      <LandingZuuAI />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
