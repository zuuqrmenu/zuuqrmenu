import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { trackEvent } from '../utils/analytics';
import { getPanelUrl } from '../utils/domainHelpers';
import { useAuth } from '../context/AuthContext';
import { publicMenuService } from '../services/publicMenuService';
import LandingZuuAI from '../components/LandingZuuAI';
import useScrollScene from '../hooks/useScrollScene';
import {
  Hero, ProblemSection, ScrollStory, UploadSection, AnalyticsSection,
  HowItWorks, Testimonials, FaqSection, FinalCta, ThemesSection, faqItems,
} from './landing/HomeSections';
import '../styles/landing.css';
import '../styles/landing-home.css';

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
   PRICING (shared by the home page and /fiyatlandirma)
   Annual prices are the source of truth; monthly prices are set so the
   annual saving lands around 37-38%.
   ═══════════════════════════════════════════════════════════════ */
const PLANS = [
  {
    id: 'starter',
    name: 'Başlangıç',
    desc: 'Temel dijital menüye geçmek isteyen tek şubeli kafeler ve butik işletmeler için.',
    monthly: 299,
    yearly: 2199,
    features: [
      '7 gün ücretsiz deneme',
      '3 kategori ve 25 ürüne kadar',
      'Anlık fiyat ve stok güncelleme',
      'Dinamik QR menü ve masa kartı üretimi',
      'Varsayılan tema ve logo özelleştirme',
    ],
  },
  {
    id: 'professional',
    featured: true,
    name: 'Profesyonel',
    desc: 'ZuuAI yapay zekâ gücünü, Bento temasını ve zengin menü analitiğini isteyen işletmeler için.',
    monthly: 399,
    yearly: 2999,
    features: [
      { strong: 'Başlangıç planındaki tüm özellikler' },
      { strong: 'Kategori ve ürün sınırı yok', rest: ' (sınırsız menü)' },
      { strong: 'ZuuAI menü yükleme', rest: ' (PDF veya fotoğraftan)' },
      { strong: 'Modern Bento Grid', rest: ' ve tüm premium temalar' },
      'Hikaye (story) önizleme çemberleri',
      'Detaylı ürün ve kategori analitiği',
      'Öncelikli WhatsApp ve telefon desteği',
    ],
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    desc: 'Çok şubeli restoran zincirleri ve özel marka entegrasyonu isteyen markalar için.',
    features: [
      'Çoklu şube ve merkezi menü yönetimi',
      'Özel alan adı (kendi domaininiz) desteği',
      'POS ve kasa sistemi entegrasyonu',
      'Restoranınıza özel tema ve marka tasarımı',
      '7/24 özel müşteri temsilcisi ve SLA',
    ],
  },
];

const fmtTry = (n) => `₺${n.toLocaleString('tr-TR')}`;
const savingPct = (p) => Math.round((1 - p.yearly / (p.monthly * 12)) * 100);
const MAX_SAVING = Math.max(...PLANS.filter((p) => p.yearly).map(savingPct));

export const PricingCardsGrid = ({ isAnnual, setIsAnnual }) => {
  const registerUrl = getPanelUrl('/register');

  return (
    <>
      <div className="lp3-pricing__header lp3-reveal">
        <span className="lp3-label">Şeffaf fiyatlandırma</span>
        <h2 className="lp3-pricing__headline">İşletmenize uygun planı seçin.</h2>
        <p className="lp3-pricing__sub">Gizli ücret yok, sürpriz yok. 7 gün ücretsiz deneyin, dilediğiniz an iptal edin.</p>

        <div className={`lp3-pricing__toggle-wrap ${isAnnual ? 'is-annual' : ''}`} role="group" aria-label="Faturalama dönemi">
          <button type="button" className={`lp3-pricing__toggle-btn ${!isAnnual ? 'is-active' : ''}`} aria-pressed={!isAnnual} onClick={() => setIsAnnual(false)}>
            Aylık
          </button>
          <button type="button" className={`lp3-pricing__toggle-btn ${isAnnual ? 'is-active' : ''}`} aria-pressed={isAnnual} onClick={() => setIsAnnual(true)}>
            Yıllık
            <span className="lp3-pricing__discount-pill">%{MAX_SAVING}’e varan indirim</span>
          </button>
        </div>
      </div>

      <div className="lp3-pricing__grid lp3-reveal lp3-reveal--delay-1">
        {PLANS.map((plan) => {
          const custom = !plan.yearly;
          const amount = isAnnual ? plan.yearly : plan.monthly;
          return (
            <article key={plan.id} className={`lp3-price-card ${plan.featured ? 'lp3-price-card--featured' : ''}`}>
              {plan.featured && <span className="lp3-price-card__popular-badge">En popüler</span>}

              <header className="lp3-price-card__header">
                <h3 className="lp3-price-card__name">{plan.name}</h3>
                <p className="lp3-price-card__desc">{plan.desc}</p>
              </header>

              <div className="lp3-price-card__price-box">
                {custom ? (
                  <span className="lp3-price-card__amount lp3-price-card__amount--custom">Özel fiyat</span>
                ) : (
                  <>
                    <span key={`${plan.id}-${isAnnual}`} className="lp3-price-card__amount lp3-price-swap">{fmtTry(amount)}</span>
                    <span className="lp3-price-card__period">{isAnnual ? '/ yıl' : '/ ay'}</span>
                  </>
                )}
              </div>

              <p key={`n-${isAnnual}`} className="lp3-price-card__note lp3-price-swap">
                {custom && 'İhtiyacınıza göre esnek fiyatlandırma'}
                {!custom && isAnnual && `Aylık ${fmtTry(Math.round(plan.yearly / 12))}’e denk gelir · %${savingPct(plan)} indirim`}
                {!custom && !isAnnual && '7 gün ücretsiz deneyin'}
              </p>

              <ul className="lp3-price-card__features">
                {plan.features.map((f) => {
                  const item = typeof f === 'string' ? { rest: f } : f;
                  return (
                    <li key={item.strong || item.rest} className="lp3-price-card__feature">
                      <span className="lp3-price-card__check" aria-hidden="true">✓</span>
                      <span>{item.strong && <strong>{item.strong}</strong>}{item.rest}</span>
                    </li>
                  );
                })}
              </ul>

              <a
                href={custom ? '/iletisim' : registerUrl}
                className={`lp3-btn ${plan.featured ? 'lp3-btn--accent' : 'lp3-btn--ghost'} lp3-price-card__cta`}
                onClick={() => trackEvent('click_pricing_plan', { plan: plan.id, isAnnual })}
              >
                {custom ? 'Bize ulaşın' : 'Planı seç'}
              </a>
            </article>
          );
        })}
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

        <ul className="lp3-pricing__trust lp3-reveal lp3-reveal--delay-2">
          <li>7 gün ücretsiz deneme</li>
          <li>Kredi kartı gerekmez</li>
          <li>İstediğiniz an tek tıkla iptal</li>
        </ul>

        <div className="lp3-pricing__detail-link-wrap lp3-reveal lp3-reveal--delay-3">
          <Link to="/fiyatlandirma" className="lp3-pricing__detail-link">
            Tüm paketleri ayrıntılı karşılaştırın <span aria-hidden="true">→</span>
          </Link>
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
  const pageRef = useRef(null);
  useScrollScene(pageRef);

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
    <div className="lp3-page lp4-home" ref={pageRef}>
      <a className="lp4-skip" href="#icerik">İçeriğe geç</a>
      <SeoHead
        title="Restoran için QR Menü ve Dijital Menü Oluştur | zuuqrmenu"
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
              '@type': 'FAQPage',
              '@id': 'https://zuuqrmenu.com/#faq',
              mainEntity: faqItems.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
              })),
            },
            {
              '@type': 'SoftwareApplication',
              '@id': 'https://zuuqrmenu.com/#app',
              name: 'zuuqrmenu',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '2199',
                priceCurrency: 'TRY',
              },
            },
          ],
        }}
      />

      <LandingHeader />

      <main id="icerik">
        <Hero prefetch={prefetchDemo} />
        <ProblemSection />
        <ScrollStory />
        <UploadSection />
        <ThemesSection />
        <AnalyticsSection />
        <HowItWorks />
        <PricingSection />
        <Testimonials />
        <FaqSection />
        <FinalCta prefetch={prefetchDemo} />
      </main>

      <LandingZuuAI />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
