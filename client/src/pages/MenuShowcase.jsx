import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { trackEvent } from '../utils/analytics';
import { getPanelUrl } from '../utils/domainHelpers';
import { publicMenuService } from '../services/publicMenuService';
import LandingZuuAI from '../components/LandingZuuAI';
import { LandingHeader, LandingFooter } from './LandingPage';
import '../styles/landing.css';

/* ─── Prefetch demo bundles on hover / touch ─────────────────── */
const prefetchDemo = (demoUrl) => {
  try {
    import('./PublicMenu');
    const username = demoUrl?.replace('/menu', '').replace('/', '');
    if (username) {
      publicMenuService.prefetchMenu(username);
    }
  } catch (_) {}
};

/* ─── Modern Theme Mockup Component (Clean Light Gray Bento Grid) ─ */
export const ModernThemeMockup = () => (
  <div className="lp3-phone-screen lp3-phone-screen--modern" aria-hidden="true">
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
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="3" />
        </svg>
      </div>
    </div>

    {/* Bento Categories Scroll Area (Clean Light Gray Palette) */}
    <div className="lp3-m-bento-scroll">
      {/* 1. Başlangıçlar (Wide Banner) */}
      <div className="lp3-m-bcard lp3-m-bcard--wide" style={{ background: 'linear-gradient(135deg, #f5f4ee, #e9e7df)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
        <div className="lp3-m-bcard__info">
          <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Başlangıçlar</span>
          <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>Paylaşmalık sıcak ve soğuk lezzetler</span>
        </div>
      </div>

      {/* 2. Çorbalar & Salatalar (Two Halves) */}
      <div className="lp3-m-bgrid-row">
        <div className="lp3-m-bcard lp3-m-bcard--half" style={{ background: 'linear-gradient(135deg, #f1f0e8, #e4e2da)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
          <div className="lp3-m-bcard__info">
            <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Çorbalar</span>
            <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>Günün taze çorbaları</span>
          </div>
        </div>
        <div className="lp3-m-bcard lp3-m-bcard--half" style={{ background: 'linear-gradient(135deg, #f6f5ef, #eae8de)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
          <div className="lp3-m-bcard__info">
            <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Salatalar</span>
            <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>Taze mevsim yeşillikleri</span>
          </div>
        </div>
      </div>

      {/* 3. Ana Yemekler (Wide Banner) */}
      <div className="lp3-m-bcard lp3-m-bcard--wide" style={{ background: 'linear-gradient(135deg, #f3f2eb, #e6e4dc)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
        <div className="lp3-m-bcard__info">
          <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Ana Yemekler</span>
          <span className="lp3-m-bcard__sub" style={{ color: '#75746e' }}>Doyurucu şef spesiyalleri</span>
        </div>
      </div>

      {/* 4. Burger & Pizzalar (Two Halves) */}
      <div className="lp3-m-bgrid-row">
        <div className="lp3-m-bcard lp3-m-bcard--half" style={{ background: 'linear-gradient(135deg, #f5f4ec, #e8e6dc)', border: '1px solid rgba(20, 20, 16, 0.08)' }}>
          <div className="lp3-m-bcard__info">
            <span className="lp3-m-bcard__title" style={{ color: '#1a1a18' }}>Burger & Sandviç</span>
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
);

/* ─── Default Theme Mockup Component (Clean Light Palette with Lime Ring) ─ */
export const DefaultThemeMockup = () => (
  <div className="lp3-phone-screen lp3-phone-screen--default" aria-hidden="true">
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
);

/* ─── Themes Data ────────────────────────────────────────────── */
const themes = [
  {
    id: 'default',
    name: 'Varsayılan',
    tag: 'Klasik & Hikaye',
    tagColor: '#deff36',
    badge: 'En Popüler',
    description: 'Temiz, sade ve her restoran konseptine uyum sağlayan zamansız bir deneyim. Üst kısımdaki hikaye (story) halkalarıyla öne çıkan spesiyalleri veya günün menüsünü sosyal medya akıcılığında sunun.',
    features: [
      'Hikaye (Story) önizleme çemberleri ile duyuru & kampanya modülü',
      'Hızlı kategori navigasyonu ve anlık ürün filtreleme',
      'Kapsamlı ürün detay modalı (alerjen, içerik, porsiyon)',
      'Açık ve koyu (Dark Mode) tasarım uyumluluğu',
    ],
    demoUrl: '/demo/menu',
    mockup: <DefaultThemeMockup />,
  },
  {
    id: 'modern',
    name: 'Modern',
    tag: 'Bento Grid',
    tagColor: '#a78bfa',
    badge: 'Görsel Odaklı',
    description: 'Fotoğraf ve görsel lezzet odaklı Bento Grid kart mimarisi. Şefinizin imza kategorilerini ve spesiyallerini büyüleyici kart bloklarıyla sergileyerek masadaki sipariş hacmini ve iştahı artırın.',
    features: [
      'Bento Grid asimetrik ve şık görsel kart blokları',
      'Öne çıkan şef spesiyalleri ve promosyon vitrini',
      'Yüksek çözünürlüklü lezzet fotoğrafları odaklı menü keşfi',
      'Akıcı mikro animasyonlar ve modern restoran atmosferi',
    ],
    demoUrl: '/demo2/menu',
    mockup: <ModernThemeMockup />,
  },
];

const MenuShowcase = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    const reveals = document.querySelectorAll('.lp3-reveal');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('lp3-reveal--in');
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp3-page">
      <SeoHead
        title="QR Menü Temaları — Restoranınıza Özel Tasarım | zuuqrmenu"
        description="Restoranınız için en şık QR menü temasını seçin. Modern Bento Grid ve Story modüllü klasik tasarımları canlı deneyin. zuuqrmenu ile dijital menünüzü özelleştirin."
        canonical="https://zuuqrmenu.com/menu"
        image="https://zuuqrmenu.com/og-cover.png"
        ogType="website"
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              '@id': 'https://zuuqrmenu.com/menu#page',
              name: 'QR Menü Temaları | zuuqrmenu',
              description: 'Restoranınız için QR menü temaları koleksiyonu. Her tema farklı bir dijital menü deneyimi sunar.',
              url: 'https://zuuqrmenu.com/menu',
              inLanguage: 'tr-TR',
              isPartOf: { '@id': 'https://zuuqrmenu.com/#website' },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://zuuqrmenu.com/' },
                { '@type': 'ListItem', position: 2, name: 'QR Menü Temaları', item: 'https://zuuqrmenu.com/menu' },
              ],
            },
          ],
        }}
      />

      <LandingHeader />

      <main style={{ paddingTop: '5.5rem' }}>
        {/* Hero Section */}
        <section className="lp3-showcase-hero">
          <div className="lp3-showcase-hero__inner lp3-reveal">
            <span className="lp3-label">CANLI MENÜ TEMALARI</span>
            <h1 className="lp3-showcase-hero__headline">
              Restoranınıza yakışan<br />
              <em>tasarımı canlı keşfedin.</em>
            </h1>
            <p className="lp3-showcase-hero__sub">
              Farklı konseptler ve mutfak tipleri için özel olarak tasarlanmış QR menü temalarımızı deneyimleyin.
              Beğendiğiniz temayı tek tıkla canlı menü üzerinden test edin.
            </p>
          </div>
        </section>

        {/* Themes Grid */}
        <section className="lp3-showcase-section">
          <div className="lp3-showcase-container">
            <div className="lp3-showcase-cards">
              {themes.map((theme, index) => (
                <article
                  key={theme.id}
                  className={`lp3-showcase-card lp3-reveal lp3-reveal--delay-${index + 1}`}
                >
                  <div className="lp3-showcase-card__top">
                    <span
                      className="lp3-showcase-card__tag"
                      style={{
                        borderColor: `${theme.tagColor}44`,
                        color: theme.tagColor === '#deff36' ? '#2a2a20' : theme.tagColor,
                        background: `${theme.tagColor}22`,
                      }}
                    >
                      {theme.tag}
                    </span>
                    {theme.badge && (
                      <span className="lp3-showcase-card__badge">
                        {theme.badge}
                      </span>
                    )}
                  </div>

                  {/* High Fidelity Phone Frame */}
                  <div className="lp3-showcase-card__mockup-wrapper">
                    <div className="lp3-theme-device-frame">
                      <div className="lp3-theme-device-notch" />
                      {theme.mockup}
                    </div>
                  </div>

                  <div className="lp3-showcase-card__body">
                    <h2 className="lp3-showcase-card__title">{theme.name}</h2>
                    <p className="lp3-showcase-card__desc">{theme.description}</p>

                    <div className="lp3-showcase-card__features-title">Öne Çıkan Özellikler:</div>
                    <ul className="lp3-showcase-card__features">
                      {theme.features.map((feature, fIdx) => (
                        <li key={fIdx}>
                          <span className="lp3-showcase-card__check">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Single Clean Action Button */}
                    <div className="lp3-showcase-card__actions">
                      <Link
                        to={theme.demoUrl}
                        className="lp3-btn lp3-btn--primary lp3-showcase-btn"
                        onClick={() =>
                          trackEvent('click_theme_demo', {
                            theme_id: theme.id,
                            theme_name: theme.name,
                          })
                        }
                        onMouseEnter={() => prefetchDemo(theme.demoUrl)}
                        onTouchStart={() => prefetchDemo(theme.demoUrl)}
                        aria-label={`${theme.name} canlı demosunu incele`}
                      >
                        Canlı Menüyü İncele ↗
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Coming Soon Themes Card (Clean Layout without Star Icon) */}
            <div className="lp3-showcase-coming lp3-reveal lp3-reveal--delay-3">
              <div className="lp3-showcase-coming__content">
                <div className="lp3-showcase-coming__info">
                  <span className="lp3-label" style={{ marginBottom: '0.4rem' }}>YENİ TEMALAR YOLDA</span>
                  <h3 className="lp3-showcase-coming__title">Bistro, Minimal & Fine Dining Tasarımları</h3>
                  <p className="lp3-showcase-coming__desc">
                    Farklı konseptler için yeni şablonlarımız hazırlanıyor. Çok yakında kütüphanemize eklenecek olan yeni temalara ilk siz erişin.
                  </p>
                  <div className="lp3-showcase-coming__pills">
                    <span className="lp3-showcase-coming__pill">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                        <line x1="6" y1="1" x2="6" y2="4" />
                        <line x1="10" y1="1" x2="10" y2="4" />
                        <line x1="14" y1="1" x2="14" y2="4" />
                      </svg>
                      Minimal Cafe & Bakery
                    </span>
                    <span className="lp3-showcase-coming__pill">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polygon points="8 21 16 21 12 17 8 21" />
                        <line x1="12" y1="17" x2="12" y2="10" />
                        <polygon points="4 4 20 4 12 10 4 4" />
                      </svg>
                      Single-Page Gastro Bistro
                    </span>
                    <span className="lp3-showcase-coming__pill">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
                      </svg>
                      Fine Dining Prestige
                    </span>
                  </div>
                </div>
              </div>
              <div className="lp3-showcase-coming__action">
                <a
                  href={getPanelUrl('/register')}
                  className="lp3-btn lp3-btn--ghost"
                  onClick={() =>
                    trackEvent('click_cta', {
                      cta_name: 'early_access_themes',
                      location: 'showcase_coming_soon',
                    })
                  }
                >
                  Erken Erişim Al ↗
                </a>
              </div>
            </div>

            {/* Features Strip with Clean Vector Icons */}
            <div className="lp3-showcase-perks lp3-reveal">
              <div className="lp3-showcase-perk">
                <div className="lp3-showcase-perk__icon-box">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="lp3-showcase-perk__title">0.3 Saniye Yükleme</div>
                <div className="lp3-showcase-perk__desc">Tüm temalar ultra hafif kod yapısıyla en zayıf bağlantılarda dahi anında açılır.</div>
              </div>

              <div className="lp3-showcase-perk">
                <div className="lp3-showcase-perk__icon-box">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
                  </svg>
                </div>
                <div className="lp3-showcase-perk__title">%100 Mobil Uyumlu</div>
                <div className="lp3-showcase-perk__desc">iOS, Android ve tüm ekran boyutlarında kusursuz duyarlı (responsive) deneyim.</div>
              </div>

              <div className="lp3-showcase-perk">
                <div className="lp3-showcase-perk__icon-box">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </div>
                <div className="lp3-showcase-perk__title">Anlık Senkronizasyon</div>
                <div className="lp3-showcase-perk__desc">Fiyat ve stok güncellemeleri sayfayı yenilemeye gerek kalmadan anında yansır.</div>
              </div>

              <div className="lp3-showcase-perk">
                <div className="lp3-showcase-perk__icon-box">
                  {/* Clean 4-Point AI Sparkle Icon */}
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                  </svg>
                </div>
                <div className="lp3-showcase-perk__title">ZuuAI Destekli</div>
                <div className="lp3-showcase-perk__desc">Fotoğraftan menü yükleme ve yapay zeka ile iştah açıcı ürün açıklamaları oluşturma.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="lp3-final-cta" style={{ paddingTop: '1rem', paddingBottom: '5rem' }}>
          <div className="lp3-final-cta__box lp3-reveal">
            <h2 className="lp3-final-cta__headline">Kendi menünüzü 7 gün ücretsiz deneyin.</h2>
            <p className="lp3-final-cta__sub">
              Kredi kartı gerekmez. Dakikalar içinde menünüzü oluşturup kendi logonuz ve renklerinizle yayınlayın.
            </p>
            <div className="lp3-final-cta__actions">
              <a
                href={getPanelUrl('/register')}
                className="lp3-btn lp3-btn--primary"
                onClick={() =>
                  trackEvent('click_cta', {
                    cta_name: 'register',
                    location: 'showcase_bottom',
                  })
                }
              >
                Hemen Ücretsiz Başla ↗
              </a>
              <Link to="/fiyatlandirma" className="lp3-btn lp3-btn--ghost">
                Paketleri İncele →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <LandingZuuAI />
    </div>
  );
};

export default MenuShowcase;
