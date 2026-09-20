import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { trackEvent } from '../utils/analytics';
import { getPanelUrl } from '../utils/domainHelpers';
import { useAuth } from '../context/AuthContext';
import { publicMenuService } from '../services/publicMenuService';

const prefetchDemo = () => {
  try {
    import('./MenuShowcase');
    import('./PublicMenu');
    publicMenuService.prefetchMenu('demo');
    publicMenuService.prefetchMenu('demo2');
  } catch (_) {}
};

/* ─── Static data ─────────────────────────────────────────── */
const steps = [
  { n: '01', title: 'Restoranınızı oluşturun', body: 'Dakikalar içinde kurulum. Menünüz hazır, QR kodunuz üretildi.' },
  { n: '02', title: 'Menünüzü düzenleyin', body: 'Kategoriler, ürünler, fiyatlar — tek bir yerden, anlık.' },
  { n: '03', title: 'QR\'ı masaya koyun', body: 'Müşterileriniz kendi cihazından menüyü anında görür.' },
];

const features = [
  { id: 'f1', icon: '◈', title: 'Dijital Menü', body: 'PDF\'e son. Canlı, güncellenebilir, mobil menü.' },
  { id: 'f2', icon: '⌘', title: 'QR Print Designer', body: 'Masa kartlarınızı markanıza uygun hazırlayın.' },
  { id: 'f3', icon: '↗', title: 'Gerçek Zamanlı Analiz', body: 'Hangi ürünler ilgi görüyor? Verilerle görün.' },
  { id: 'f4', icon: '◎', title: 'Anlık Güncelleme', body: 'Fiyat veya içerik değişti mi? Saniyeler içinde yayınla.' },
  { id: 'f5', icon: '✦', title: 'Çoklu Tema', body: 'Her restorana özel menü görünümü ve kişilik.' },
  { id: 'f6', icon: '▣', title: 'Kolay Yönetim', body: 'Teknik bilgiye gerek yok. Sade, net, hızlı panel.' },
];

/* ─── Header ──────────────────────────────────────────────── */
const LandingHeader = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setOpen(false);
  const { isAuthenticated, isRestaurantUser } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`lp2-header ${scrolled ? 'lp2-header--scrolled' : ''}`}>
      <div className="lp2-header__inner">
        <Link to="/" className="lp2-brand" onClick={close}>
          <img src="/logo_darkmode.svg" alt="zuuqrmenu" className="landing-brand__logo lp2-brand__logo" />
        </Link>

        <nav className={`lp2-nav ${open ? 'lp2-nav--open' : ''}`} aria-label="Landing navigation">
          <a href="#ozellikler" onClick={close}>Özellikler</a>
          <a href="#nasil-calisir" onClick={close}>Nasıl Çalışır?</a>
          {isAuthenticated ? (
            <a href={getPanelUrl(isRestaurantUser ? '/dashboard' : '/admin')} onClick={close}>Yönetim Paneli</a>
          ) : (
            <a href={getPanelUrl('/login')} onClick={close}>Giriş Yap</a>
          )}
          <a
            href={getPanelUrl('/register')}
            className="lp2-cta-btn lp2-cta-btn--sm"
            onClick={() => { trackEvent('click_cta', { cta_name: 'create_restaurant', location: 'header' }); close(); }}
          >
            Başla <span>↗</span>
          </a>
        </nav>

        <button
          type="button"
          className={`lp2-hamburger ${open ? 'lp2-hamburger--open' : ''}`}
          aria-label="Menüyü aç"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
};

/* ─── Realistic QR Icon ──────────────────────────────────── */
const QrIcon = ({ className = '' }) => (
  <svg
    className={`lp2-qr-icon ${className}`}
    viewBox="0 0 40 40"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="QR kod"
  >
    {/* Finder — top-left */}
    <rect x="1" y="1" width="12" height="12" fill="currentColor" rx="1"/>
    <rect x="3" y="3" width="8"  height="8"  fill="var(--qr-bg,#fff)"/>
    <rect x="5" y="5" width="4"  height="4"  fill="currentColor"/>

    {/* Finder — top-right */}
    <rect x="27" y="1" width="12" height="12" fill="currentColor" rx="1"/>
    <rect x="29" y="3" width="8"  height="8"  fill="var(--qr-bg,#fff)"/>
    <rect x="31" y="5" width="4"  height="4"  fill="currentColor"/>

    {/* Finder — bottom-left */}
    <rect x="1" y="27" width="12" height="12" fill="currentColor" rx="1"/>
    <rect x="3" y="29" width="8"  height="8"  fill="var(--qr-bg,#fff)"/>
    <rect x="5" y="31" width="4"  height="4"  fill="currentColor"/>

    {/* Alignment pattern — bottom-right */}
    <rect x="27" y="27" width="12" height="12" fill="currentColor" rx="1"/>
    <rect x="29" y="29" width="8"  height="8"  fill="var(--qr-bg,#fff)"/>
    <rect x="31" y="31" width="4"  height="4"  fill="currentColor"/>

    {/* Top-center data modules */}
    <rect x="15" y="1"  width="2" height="2" fill="currentColor"/>
    <rect x="19" y="1"  width="4" height="2" fill="currentColor"/>
    <rect x="15" y="5"  width="4" height="2" fill="currentColor"/>
    <rect x="21" y="5"  width="2" height="2" fill="currentColor"/>
    <rect x="15" y="9"  width="2" height="2" fill="currentColor"/>
    <rect x="19" y="9"  width="4" height="2" fill="currentColor"/>
    <rect x="23" y="7"  width="2" height="4" fill="currentColor"/>

    {/* Left-center data modules */}
    <rect x="1"  y="15" width="4" height="2" fill="currentColor"/>
    <rect x="7"  y="15" width="2" height="4" fill="currentColor"/>
    <rect x="11" y="15" width="2" height="2" fill="currentColor"/>
    <rect x="3"  y="19" width="2" height="4" fill="currentColor"/>
    <rect x="7"  y="21" width="6" height="2" fill="currentColor"/>
    <rect x="11" y="21" width="2" height="4" fill="currentColor"/>
    <rect x="1"  y="23" width="2" height="2" fill="currentColor"/>
    <rect x="5"  y="23" width="4" height="2" fill="currentColor"/>

    {/* Center data modules */}
    <rect x="15" y="15" width="4" height="4" fill="currentColor"/>
    <rect x="21" y="15" width="2" height="2" fill="currentColor"/>
    <rect x="25" y="15" width="2" height="4" fill="currentColor"/>
    <rect x="15" y="21" width="2" height="4" fill="currentColor"/>
    <rect x="19" y="21" width="6" height="2" fill="currentColor"/>
    <rect x="21" y="23" width="2" height="4" fill="currentColor"/>
    <rect x="17" y="25" width="4" height="2" fill="currentColor"/>
    <rect x="25" y="21" width="2" height="2" fill="currentColor"/>
    <rect x="19" y="17" width="2" height="2" fill="currentColor"/>

    {/* Bottom-center data modules */}
    <rect x="15" y="27" width="2" height="2" fill="currentColor"/>
    <rect x="19" y="27" width="4" height="2" fill="currentColor"/>
    <rect x="25" y="27" width="2" height="4" fill="currentColor"/>
    <rect x="15" y="31" width="4" height="2" fill="currentColor"/>
    <rect x="21" y="31" width="2" height="4" fill="currentColor"/>
    <rect x="15" y="35" width="6" height="2" fill="currentColor"/>
    <rect x="23" y="35" width="2" height="2" fill="currentColor"/>
  </svg>
);

/* ─── Dashboard mock window ──────────────────────────────── */
const DashMock = () => (
  <div className="lp2-dash-mock" aria-label="Dashboard önizlemesi">
    <div className="lp2-dash-mock__bar">
      <span /><span /><span />
      <small>zuuqrmenu · panel</small>
    </div>
    <div className="lp2-dash-mock__body">
      <aside className="lp2-dash-mock__sidebar">
        <img src="/logo_darkmode.svg" alt="" />
        <span className="lp2-dash-mock__nav-item lp2-dash-mock__nav-item--active">Genel Bakış</span>
        <span className="lp2-dash-mock__nav-item">Menü</span>
        <span className="lp2-dash-mock__nav-item">QR Kod</span>
        <span className="lp2-dash-mock__nav-item">İstatistikler</span>
      </aside>
      <div className="lp2-dash-mock__main">
        <div className="lp2-dash-mock__head">
          <div>
            <small>GENEL BAKIŞ</small>
            <h3>Menünüzü yönetin</h3>
          </div>
          <span className="lp2-dash-mock__badge">Yayında</span>
        </div>
        <div className="lp2-dash-mock__stats">
          <span><b>1.248</b><small>Görüntülenme</small></span>
          <span><b>6</b><small>Kategori</small></span>
          <span><b>24</b><small>Ürün</small></span>
        </div>
        <div className="lp2-dash-mock__chart">
          <div className="lp2-dash-mock__bars">
            {[36, 54, 42, 74, 62, 90, 68].map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <small>Son 7 gün · Görüntülenme</small>
        </div>
      </div>
    </div>
    {/* QR badge */}
    <div className="lp2-dash-mock__qr">
      <QrIcon />
      <small>Menüyü aç</small>
    </div>
  </div>
);

/* ─── Phone mock ─────────────────────────────────────────── */
const PhoneMock = () => (
  <div className="lp2-phone">
    <div className="lp2-phone__notch" />
    <div className="lp2-phone__screen">
      <header className="lp2-phone__header">
        <small>TEST RESTORAN</small>
        <strong>Günün lezzetleri</strong>
        <span>09:00 — 23:00</span>
      </header>
      <nav className="lp2-phone__tabs">
        <b>Popüler</b>
        <span>Başlangıçlar</span>
        <span>Pizza</span>
        <span>Tatlılar</span>
      </nav>
      <div className="lp2-phone__content">
        <small className="lp2-phone__eyebrow">BUGÜNÜN SEÇKİLERİ</small>
        <h3>Paylaşmalık tabaklar</h3>
        {[
          { cls: 'vegetable', name: 'Izgara sebze tabağı', desc: 'Mevsim sebzeleri, otlu yoğurt', price: '₺280' },
          { cls: 'pizza',     name: 'Fırın pizza',         desc: 'Domates, mozzarella, fesleğen', price: '₺340' },
          { cls: 'dessert',   name: 'Limonlu cheesecake', desc: 'Vanilya kreması, limon kabuğu', price: '₺190' },
        ].map(p => (
          <article className="lp2-phone__product" key={p.cls}>
            <div className={`lp2-phone__product-img lp2-phone__product-img--${p.cls}`} />
            <span>
              <b>{p.name}</b>
              <small>{p.desc}</small>
              <strong>{p.price}</strong>
            </span>
          </article>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Print cards ─────────────────────────────────────────── */
const PrintStage = () => (
  <div className="lp2-print-stage" aria-label="QR print card önizlemesi">
    {/* secondary card behind */}
    <div className="lp2-print-card lp2-print-card--back">
      <small>A6 · MİNİMAL</small>
      <b>Masadaki menü</b>
    </div>
    {/* main card */}
    <div className="lp2-print-card lp2-print-card--front">
      <small>A5 · MODERN</small>
      <img src="/logo.svg" alt="zuuqrmenu" />
      <strong>Test Restoran</strong>
      <span>Menüyü keşfet</span>
      <QrIcon className="lp2-print-card__qr" />
      <b>Menüyü Gör</b>
    </div>
  </div>
);

/* ─── Analytics preview card ─────────────────────────────── */
const AnalyticsCard = () => (
  <div className="lp2-analytics-card">
    <div className="lp2-analytics-card__head">
      <span>GENEL BAKIŞ</span>
      <b>Bu hafta</b>
    </div>
    <h3>Menü performansı</h3>
    <div className="lp2-analytics-card__stats">
      <span><b>1.248</b><small>Görüntülenme</small></span>
      <span><b>6</b><small>Kategori</small></span>
      <span><b>24</b><small>Ürün</small></span>
    </div>
    <div className="lp2-analytics-card__chart">
      {[36, 54, 45, 72, 62, 88, 76].map((h, i) => (
        <i key={i} style={{ height: `${h}%` }} />
      ))}
    </div>
    <small className="lp2-analytics-card__caption">Son 7 gün · Menü görüntülenmeleri</small>
  </div>
);

/* ─── Main page ──────────────────────────────────────────── */
const LandingPage = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    /* Intersection reveal */
    const reveals = document.querySelectorAll('.lp2-reveal');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('lp2-reveal--in', e.isIntersecting)),
      { threshold: 0.12 }
    );
    reveals.forEach(el => observer.observe(el));

    /* Parallax scroll var */
    const onScroll = () =>
      document.documentElement.style.setProperty('--lp2-scroll', `${window.scrollY}px`);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Idle prefetch of menu bundle & demo data for instant navigation */
    const idleTimer = typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? window.requestIdleCallback(prefetchDemo, { timeout: 3000 })
      : setTimeout(prefetchDemo, 2000);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (typeof window !== 'undefined') {
        if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleTimer);
        else clearTimeout(idleTimer);
      }
    };
  }, []);

  return (
    <div className="lp2-page">
      <SeoHead
        title="zuuqrmenu | Restoranlar için dijital menü platformu"
        description="zuuqrmenu ile restoranınızın dijital menüsünü oluşturun, QR kodunuzu hazırlayın ve menü deneyiminizi yönetin."
        canonical="https://zuuqrmenu.com/"
        image="https://zuuqrmenu.com/logo_darkmode.svg"
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'Organization', name: 'zuuqrmenu', url: 'https://zuuqrmenu.com/', logo: 'https://zuuqrmenu.com/logo_darkmode.svg' },
            { '@type': 'WebSite', name: 'zuuqrmenu', url: 'https://zuuqrmenu.com/', inLanguage: 'tr-TR' },
          ],
        }}
      />
      <LandingHeader />

      <main>

        {/* ══ HERO — full-bleed wrapper fixes bg-cut ═══════ */}
        <div className="lp2-hero-wrap">
          {/* bg decorative layers */}
          <div className="lp2-hero__dots"    aria-hidden="true" />
          <div className="lp2-hero__glow"    aria-hidden="true" />
          {/* watermark */}
          <span className="lp2-hero__wm"     aria-hidden="true">MENU</span>
          {/* floating accent squares */}
          <span className="lp2-hero__sq lp2-hero__sq--1" aria-hidden="true" />
          <span className="lp2-hero__sq lp2-hero__sq--2" aria-hidden="true" />
          <span className="lp2-hero__sq lp2-hero__sq--3" aria-hidden="true" />

          <section className="lp2-hero lp2-reveal" ref={heroRef}>
            <div className="lp2-hero__copy">
              <div className="lp2-hero__eyebrow">
                <span className="lp2-hero__tag">RESTORANLAR İÇİN</span>
                <span className="lp2-hero__tag lp2-hero__tag--accent">DİJİTAL MENÜ ↗</span>
              </div>
              <h1>
                <span className="lp2-hero__line">Menünüz <em>dijital.</em></span>
                <span className="lp2-hero__line">Markanız <em>önde.</em></span>
              </h1>
              <p>
                zuuqrmenu ile menünüzü oluşturun, QR kodunuzu hazırlayın
                ve müşterilerinizin deneyimini tek bir yerden yönetin.
              </p>
              <div className="lp2-hero__actions">
                <a
                  href={getPanelUrl('/register')}
                  className="lp2-cta-btn"
                  onClick={() => trackEvent('click_cta', { cta_name: 'create_restaurant', location: 'hero' })}
                >
                  Restoranını Oluştur <span>↗</span>
                </a>
                <Link
                  to="/menu"
                  className="lp2-cta-btn lp2-cta-btn--ghost"
                  onClick={() => trackEvent('click_cta', { cta_name: 'view_demo', location: 'hero' })}
                  onMouseEnter={prefetchDemo}
                  onTouchStart={prefetchDemo}
                >
                  Demo Menüyü Gör <span>→</span>
                </Link>
              </div>
              <div className="lp2-hero__meta">
                <div className="lp2-hero__stat"><b>Kodsuz</b><small>teknik bilgi gerekmez</small></div>
                <div className="lp2-hero__stat-sep" />
                <div className="lp2-hero__stat"><b>3 dakika</b><small>ortalama kurulum süresi</small></div>
                <div className="lp2-hero__stat-sep" />
                <div className="lp2-hero__stat"><b>Dinamik QR</b><small>baskı yenilemeden anlık güncelle</small></div>
              </div>
            </div>

            <div className="lp2-hero__visual">
              <DashMock />
            </div>
          </section>
        </div>

        {/* ══ TICKER ════════════════════════════════════════ */}
        <div className="lp2-ticker" aria-hidden="true">
          <div className="lp2-ticker__track">
            {['Tek menü sistemi', 'Her ekranda iyi görünür', 'QR ile anında erişim', 'Gerçek zamanlı analiz', 'Kolay yönetim', 'Anlık güncelleme'].map((t, i) => (
              <span key={i}><b>✦</b> {t}</span>
            ))}
            {/* duplicate for seamless loop */}
            {['Tek menü sistemi', 'Her ekranda iyi görünür', 'QR ile anında erişim', 'Gerçek zamanlı analiz', 'Kolay yönetim', 'Anlık güncelleme'].map((t, i) => (
              <span key={`d${i}`} aria-hidden="true"><b>✦</b> {t}</span>
            ))}
          </div>
        </div>

        {/* ══ MENU EXPERIENCE ══════════════════════════════ */}
        <section id="ozellikler" className="lp2-section lp2-section--experience lp2-reveal">
          <div className="lp2-section__intro lp2-reveal">
            <span className="lp2-kicker">MENÜ DENEYİMİ</span>
            <h2>Menünüz artık<br /><em>sadece bir PDF değil.</em></h2>
            <p>Basılı menünün tanıdık sadeliği, mobilde yaşayan ve kolay keşfedilen bir deneyime dönüşür.</p>
          </div>
          <div className="lp2-phone-wrap lp2-reveal">
            {/* decorative paper menu behind phone */}
            <div className="lp2-paper" aria-hidden="true">
              <small>MENÜ</small>
              <span>Günün menüsü</span>
              <i /><i /><i />
            </div>
            <PhoneMock />
          </div>
        </section>

        {/* ══ FEATURES GRID ════════════════════════════════ */}
        <section className="lp2-section lp2-section--features lp2-reveal">
          <div className="lp2-section__intro lp2-reveal">
            <span className="lp2-kicker">PLATFORM</span>
            <h2>İhtiyacınız olan<br />her şey burada.</h2>
          </div>
          <div className="lp2-features">
            {features.map(f => (
              <article className="lp2-feature lp2-reveal" key={f.id}>
                <span className="lp2-feature__icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ══ HOW IT WORKS ═════════════════════════════════ */}
        <section id="nasil-calisir" className="lp2-section lp2-section--steps lp2-reveal">
          <div className="lp2-section__intro lp2-reveal">
            <span className="lp2-kicker">NASIL ÇALIŞIR?</span>
            <h2>Üç adım.<br /><em>Daha iyi bir menü.</em></h2>
            <p>Günün yoğunluğunda bile düzenli, hızlı ve markanıza ait bir deneyim.</p>
          </div>
          <ol className="lp2-steps">
            {steps.map(s => (
              <li className="lp2-step lp2-reveal" key={s.n}>
                <span className="lp2-step__num">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ══ DASHBOARD SHOWCASE ═══════════════════════════ */}
        <section className="lp2-section lp2-section--showcase lp2-reveal">
          <div className="lp2-section__intro lp2-reveal">
            <span className="lp2-kicker">YÖNETİM ALANI</span>
            <h2>Menünüz sadece yayında<br /><em>değil. Kontrolünüzde.</em></h2>
            <p>Kategoriler, ürünler, yayın durumu ve analizler — tek bir yerden.</p>
            <ul className="lp2-check-list">
              <li>Kategorilerinizi ve ürünlerinizi yönetin</li>
              <li>Menü durumunu tek bakışta görün</li>
              <li>Görüntülenmeleri ve popüler ürünleri takip edin</li>
            </ul>
          </div>
          <div className="lp2-showcase-visual lp2-reveal">
            <DashMock />
          </div>
        </section>

        {/* ══ QR PRINT ═════════════════════════════════════ */}
        <section className="lp2-section lp2-section--qr lp2-reveal">
          <div className="lp2-section__intro lp2-reveal">
            <span className="lp2-kicker">QR PRINT DESIGNER</span>
            <h2>QR kodunuzu sadece<br />üretmeyin, <em>güzelce sunun.</em></h2>
            <p>Tek bir masa kartı, restoranınızın kimliği ve menünüze açılan sade bir davet.</p>
          </div>
          <div className="lp2-reveal">
            <PrintStage />
          </div>
        </section>

        {/* ══ ANALYTICS ════════════════════════════════════ */}
        <section className="lp2-section lp2-section--analytics lp2-reveal">
          <div className="lp2-section__intro lp2-reveal">
            <span className="lp2-kicker">YÖNETİM PLATFORMU</span>
            <h2>Bir QR kodundan<br /><em>fazlası.</em></h2>
            <p>Menünüzü yayınladıktan sonra da işiniz devam eder. Görüntülenmeleri, kategorileri ve ürünleri tek bir yönetim alanında görün.</p>
          </div>
          <div className="lp2-reveal">
            <AnalyticsCard />
          </div>
        </section>

        {/* ══ FINAL CTA ════════════════════════════════════ */}
        <section className="lp2-final-cta lp2-reveal">
          <div className="lp2-final-cta__inner">
            <span className="lp2-kicker">HAZIR MISINIZ?</span>
            <h2>Menünüzü dijitale taşıyın.</h2>
            <p>Restoranınız için daha iyi bir menü deneyimi bugün başlayabilir.</p>
            <div className="lp2-final-cta__actions">
              <a
                href={getPanelUrl('/register')}
                className="lp2-cta-btn"
                onClick={() => trackEvent('click_cta', { cta_name: 'create_restaurant', location: 'footer_cta' })}
              >
                Restoranını Oluştur <span>↗</span>
              </a>
              <a href={getPanelUrl('/login')} className="lp2-cta-btn lp2-cta-btn--ghost">Giriş Yap</a>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="lp2-footer">
        <div className="lp2-footer__inner">
          <div className="lp2-footer__brand">
            <Link to="/" className="lp2-brand">
              <img src="/logo_darkmode.svg" alt="zuuqrmenu" className="landing-brand__logo lp2-brand__logo" />
            </Link>
            <p>Restoranlar için modern dijital menü platformu.</p>
          </div>
          <nav className="lp2-footer__nav" aria-label="Footer navigation">
            <a href="#ozellikler">Özellikler</a>
            <a href="#nasil-calisir">Nasıl Çalışır?</a>
            <a href={getPanelUrl('/login')}>Giriş Yap</a>
            <a href={getPanelUrl('/register')}>Restoranını Oluştur</a>
          </nav>
          <small className="lp2-footer__copy">© 2026 zuuqrmenu</small>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
