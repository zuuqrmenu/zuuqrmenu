import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { trackEvent } from '../utils/analytics';

const steps = [
  ['01', 'Restoranınızı oluşturun'],
  ['02', 'Menünüzü düzenleyin'],
  ['03', 'QR kodunuzu masanıza koyun'],
];

const LandingHeader = () => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="landing-header">
      <div className="landing-header__inner">
        <Link to="/" className="landing-brand" onClick={close}>
          <img src="/logo_darkmode.svg" alt="zuuqrmenu" className="landing-brand__logo" />
        </Link>
        <nav className={`landing-nav ${open ? 'is-open' : ''}`} aria-label="Landing navigation">
          <a href="#features" onClick={close}>Özellikler</a>
          <a href="#how-it-works" onClick={close}>Nasıl Çalışır?</a>
          <Link to="/login" onClick={close}>Giriş Yap</Link>
          <Link
            to="/register"
            className="landing-button landing-button--small"
            onClick={() => {
              trackEvent('click_cta', { cta_name: 'create_restaurant', location: 'header' });
              close();
            }}
          >
            Restoranını Oluştur
          </Link>
        </nav>
        <button type="button" className="landing-menu-button" aria-label="Menüyü aç" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

const DecorativeQrIcon = ({ className = '' }) => (
  <svg className={`decorative-qr-icon ${className}`} viewBox="0 0 64 64" role="img" aria-label="QR tasarım simgesi">
    <rect width="64" height="64" fill="var(--decorative-qr-bg, transparent)" />
    <path d="M7 25V7h18M39 7h18v18M57 39v18H39M25 57H7V39" fill="none" stroke="var(--decorative-qr-ink, currentColor)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" />
    <circle cx="37" cy="36" fill="var(--decorative-qr-ink, currentColor)" r="3" /><circle cx="47" cy="45" fill="var(--decorative-qr-ink, currentColor)" r="3" /><circle cx="35" cy="49" fill="var(--decorative-qr-ink, currentColor)" r="3" />
  </svg>
);

const ProductPreview = ({ mode = 'dashboard' }) => (
  <div className={`landing-product-stage landing-product-stage--${mode}`} aria-label="zuuqrmenu ürün önizlemesi">
    <div className="landing-product-window">
      <div className="landing-product-window__topbar"><span /><span /><span /><small>zuuqrmenu / panel</small></div>
      <div className="landing-product-window__body">
        <aside><img src="/logo_darkmode.svg" alt="zuuqrmenu" /><span className="is-active">Genel Bakış</span><span>Menü</span><span>QR Kod</span><span>İstatistikler</span></aside>
        <div className="landing-dashboard-preview">
          <div className="landing-preview-heading"><div><small>GENEL BAKIŞ</small><h3>Menünüzü yönetin</h3></div><span className="landing-preview-status">Yayında</span></div>
          <div className="landing-preview-stats"><span><b>1.248</b><small>Menü görüntülenmesi</small></span><span><b>6</b><small>Kategori</small></span><span><b>24</b><small>Aktif ürün</small></span></div>
          <div className="landing-preview-chart"><div><i style={{ height: '36%' }} /><i style={{ height: '54%' }} /><i style={{ height: '42%' }} /><i style={{ height: '74%' }} /><i style={{ height: '62%' }} /><i style={{ height: '90%' }} /><i style={{ height: '68%' }} /></div><small>Son 7 gün · Menü görüntülenmeleri</small></div>
        </div>
      </div>
    </div>
    <div className="landing-product-qr"><DecorativeQrIcon /><small>Menüyü aç</small></div>
  </div>
);

const MobileMenuShowcase = () => (
  <div className="menu-showcase-visual">
    <div className="menu-showcase-paper" aria-hidden="true"><small>MENÜ</small><span>Günün menüsü</span><i /><i /><i /></div>
    <div className="menu-showcase-phone">
      <div className="menu-showcase-phone__speaker" />
      <div className="menu-showcase-screen">
        <header className="menu-showcase-header"><small>TEST RESTORAN</small><strong>Günün lezzetleri</strong><span>09:00 — 23:00</span></header>
        <nav className="menu-showcase-tabs" aria-label="Demo menü kategorileri"><b>Popüler</b><span>Başlangıçlar</span><span>Pizza</span></nav>
        <main className="menu-showcase-content"><small className="menu-showcase-eyebrow">BUGÜNÜN SEÇKİLERİ</small><h3>Paylaşmalık tabaklar</h3>
          <article className="menu-showcase-product"><div className="menu-showcase-product__image menu-showcase-product__image--vegetable" /><span><b>Izgara sebze tabağı</b><small>Mevsim sebzeleri, otlu yoğurt</small><strong>₺280</strong></span></article>
          <article className="menu-showcase-product"><div className="menu-showcase-product__image menu-showcase-product__image--pizza" /><span><b>Fırın pizza</b><small>Domates, mozzarella, fesleğen</small><strong>₺340</strong></span></article>
          <article className="menu-showcase-product"><div className="menu-showcase-product__image menu-showcase-product__image--dessert" /><span><b>Limonlu cheesecake</b><small>Vanilya kreması, limon kabuğu</small><strong>₺190</strong></span></article>
        </main>
      </div>
    </div>
  </div>
);

const MenuExperience = () => (
  <section id="features" className="landing-section menu-experience-section landing-reveal">
    <div className="menu-experience-copy"><span className="landing-kicker">MENÜ DENEYİMİ</span><h2>Menünüz artık sadece bir PDF değil.</h2><p>Basılı menünün tanıdık sadeliği, mobilde yaşayan ve kolay keşfedilen bir deneyime dönüşür.</p></div>
    <MobileMenuShowcase />
  </section>
);

const HowItWorksSection = () => (
  <section id="how-it-works" className="landing-section landing-section--steps landing-reveal">
    <div className="landing-section__intro"><span className="landing-kicker">NASIL ÇALIŞIR?</span><h2>Üç adım. Daha iyi bir menü.</h2><p>Günün yoğunluğunda bile düzenli, hızlı ve markanıza ait bir deneyim.</p></div>
    <div className="landing-steps">{steps.map(([number, title]) => <article className="landing-step" key={number}><span>{number}</span><h3>{title}</h3></article>)}</div>
  </section>
);

const ProductShowcase = () => (
  <section className="landing-section landing-showcase">
    <div className="landing-showcase__copy"><span className="landing-kicker">YÖNETİM ALANI</span><h2>Menünüz sadece yayında değil. Sizin kontrolünüzde.</h2><p>Kategoriler, ürünler, yayın durumu ve analizler; gerçek dashboard deneyiminizin sade bir vitrini.</p><ul><li>Kategorilerinizi ve ürünlerinizi yönetin</li><li>Menü durumunu tek bakışta görün</li><li>Görüntülenmeleri ve popüler ürünleri takip edin</li></ul></div><ProductPreview mode="dashboard" /></section>
);

const QrShowcase = () => (
  <section className="landing-section landing-qr-showcase">
    <div className="landing-qr-showcase__head"><div><span className="landing-kicker">QR PRINT DESIGNER</span><h2>QR kodunuzu sadece üretmeyin, güzelce sunun.</h2></div><p>Tek bir masa kartı, restoranınızın kimliği ve menünüze açılan sade bir davet.</p></div>
    <div className="landing-print-stage"><div className="landing-print-card landing-print-card--secondary"><small>A6 · MINIMAL</small><b>Masadaki menü</b></div><div className="landing-print-card landing-print-card--main"><small>A5 · MODERN</small><img src="/logo.svg" alt="zuuqrmenu" /><strong>Test Restoran</strong><span>Menüyü keşfet</span><DecorativeQrIcon /><b>Menüyü Gör</b></div></div>
  </section>
);

const DashboardPreview = () => (
  <div className="landing-dashboard-preview-card">
    <div className="landing-dashboard-preview-card__top"><span>GENEL BAKIŞ</span><b>Bu hafta</b></div>
    <h3>Menü performansı</h3>
    <div className="landing-dashboard-preview-card__stats"><span><b>1.248</b><small>Menü Görüntülenmeleri</small></span><span><b>6</b><small>Kategoriler</small></span><span><b>24</b><small>Ürünler</small></span></div>
    <div className="landing-dashboard-preview-card__chart"><i style={{ height: '36%' }} /><i style={{ height: '54%' }} /><i style={{ height: '45%' }} /><i style={{ height: '72%' }} /><i style={{ height: '62%' }} /><i style={{ height: '88%' }} /><i style={{ height: '76%' }} /></div>
    <small className="landing-dashboard-preview-card__caption">Son 7 gün · Menü görüntülenmeleri</small>
  </div>
);

const AnalyticsShowcase = () => (
  <section className="landing-section landing-analytics-showcase landing-reveal"><div className="landing-analytics-card"><div><span className="landing-kicker">YÖNETİM PLATFORMU</span><h2>Bir QR kodundan fazlası.</h2><p>Menünüzü yayınladıktan sonra da işiniz devam eder. Görüntülenmeleri, kategorileri ve ürünleri tek bir yönetim alanında görün.</p></div><DashboardPreview /></div></section>
);

const LandingPage = () => {
  useEffect(() => {
    const reveals = document.querySelectorAll('.landing-reveal');
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting)), { threshold: 0.16 });
    reveals.forEach((element) => observer.observe(element));
    const onScroll = () => document.documentElement.style.setProperty('--landing-scroll', `${window.scrollY}px`);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  return (
  <div className="landing-page">
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
      <section className="landing-hero landing-reveal"><div className="landing-hero__copy"><span className="landing-kicker">RESTORANLAR İÇİN DİJİTAL MENÜ</span><h1>Menünüzü dijitale taşıyın.<br /><em>Markanız gibi görünsün.</em></h1><p>zuuqrmenu ile menünüzü oluşturun, QR kodunuzu hazırlayın ve müşterilerinizin deneyimini tek bir yerden yönetin.</p><div className="landing-hero__actions">
  <Link
    to="/register"
    className="landing-button"
    onClick={() => trackEvent('click_cta', { cta_name: 'create_restaurant', location: 'hero' })}
  >
    Restoranını Oluştur <span>↗</span>
  </Link>
  <Link
    to="/menu"
    className="landing-button landing-button--quiet"
    onClick={() => trackEvent('click_cta', { cta_name: 'view_demo', location: 'hero' })}
  >
    Demo Menüyü Gör <span>→</span>
  </Link>
</div><div className="landing-hero__note"><span>●</span> Menü · QR · analizler tek platformda</div></div><ProductPreview /></section>
      <section className="landing-value-strip"><span><b>01</b>Tek bir menü sistemi</span><span><b>02</b>Her ekranda iyi görünür</span><span><b>03</b>QR ile anında erişim</span><span><b>04</b>Veriyle daha iyi kararlar</span></section>
      <MenuExperience />
      <HowItWorksSection />
      <ProductShowcase />
      <QrShowcase />
      <AnalyticsShowcase />
      <section className="landing-final-cta landing-reveal"><span className="landing-kicker">HAZIR MISINIZ?</span><h2>Menünüzü dijitale taşıyın.</h2><p>Restoranınız için daha iyi bir menü deneyimi bugün başlayabilir.</p><div>
        <Link
          to="/register"
          className="landing-button"
          onClick={() => trackEvent('click_cta', { cta_name: 'create_restaurant', location: 'footer_cta' })}
        >
          Restoranını Oluştur <span>↗</span>
        </Link>
        <Link to="/login" className="landing-button landing-button--quiet">Giriş Yap</Link>
      </div></section>
    </main>
    <footer className="landing-footer"><div><Link to="/" className="landing-brand"><img src="/logo_darkmode.svg" alt="zuuqrmenu" className="landing-brand__logo" /></Link><p>Restoranlar için modern dijital menü platformu.</p></div><nav><a href="#features">Özellikler</a><a href="#how-it-works">Nasıl Çalışır?</a><Link to="/login">Giriş Yap</Link><Link to="/register">Restoranını Oluştur</Link></nav><small>© 2026 zuuqrmenu</small></footer>
  </div>
  );
};

export default LandingPage;
