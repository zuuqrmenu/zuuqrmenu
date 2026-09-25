import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { trackEvent } from '../utils/analytics';
import { getPanelUrl } from '../utils/domainHelpers';
import LandingZuuAI from '../components/LandingZuuAI';
import { LandingHeader, LandingFooter, PricingCardsGrid } from './LandingPage';
import '../styles/landing.css';

const comparisonData = [
  {
    category: 'Menü & Ürün Yönetimi',
    rows: [
      { name: 'Kategori ve Ürün Ekleme', starter: 'Sınırsız', pro: 'Sınırsız', enterprise: 'Sınırsız' },
      { name: 'Anlık Fiyat & Stok Güncelleme', starter: true, pro: true, enterprise: true },
      { name: 'Ürün Fotoğrafları & Galeri', starter: true, pro: true, enterprise: true },
      { name: 'Alerjen, Kalori & Etiket Bilgisi', starter: true, pro: true, enterprise: true },
      { name: 'Ürün Varyasyonları (Porsiyon/Boyut)', starter: true, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Tasarım & Temalar',
    rows: [
      { name: 'Varsayılan (Klasik) Tema', starter: true, pro: true, enterprise: true },
      { name: 'Hikaye (Story) Halka Modülü', starter: false, pro: true, enterprise: true },
      { name: 'Modern Bento Grid Teması', starter: false, pro: true, enterprise: true },
      { name: 'Özel Logo & Renk Paleti', starter: true, pro: true, enterprise: true },
      { name: 'Özel Restoran Teması Geliştirme', starter: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'ZuuAI Yapay Zeka Özellikleri',
    rows: [
      { name: 'PDF / Fotoğraftan Otomatik Menü Yükleme', starter: false, pro: true, enterprise: true },
      { name: 'ZuuAI Akıllı Ürün Açıklaması Yazarı', starter: false, pro: true, enterprise: true },
      { name: 'Menü Analizi & Ciro Artırma İpuçları', starter: false, pro: true, enterprise: true },
      { name: 'ZuuAI Asistan Sohbeti', starter: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'QR Çözümleri & Baskı',
    rows: [
      { name: 'Dinamik QR Kod Üretimi', starter: true, pro: true, enterprise: true },
      { name: 'Yüksek Çözünürlüklü Vektörel İndirme', starter: true, pro: true, enterprise: true },
      { name: 'QR Print Designer (Masa Kartı Şablonları)', starter: false, pro: true, enterprise: true },
      { name: 'Masa Numaralı Özel QR Kodlar', starter: true, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Analitik & Raporlama',
    rows: [
      { name: 'Toplam Menü Görüntülenme Sayısı', starter: true, pro: true, enterprise: true },
      { name: 'Ürün & Kategori Bazlı Detaylı Tıklama', starter: false, pro: true, enterprise: true },
      { name: 'Saatlik & Günlük Trafik Trendleri', starter: false, pro: true, enterprise: true },
      { name: 'CSV / Excel Rapor İndirme', starter: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Şube Yönetimi & Destek',
    rows: [
      { name: 'Aktif Restoran / Şube Sayısı', starter: '1 Şube', pro: '1 Şube', enterprise: 'Çoklu / Sınırsız' },
      { name: 'Merkezi Menü Dağıtımı', starter: false, pro: false, enterprise: true },
      { name: 'Özel Alan Adı (Kendi Domaininiz)', starter: false, pro: false, enterprise: true },
      { name: 'POS & Kasa Entegrasyon Desteği', starter: false, pro: false, enterprise: true },
      { name: 'Müşteri Desteği', starter: 'E-posta', pro: 'Öncelikli WhatsApp', enterprise: '7/24 Özel Temsilci' },
    ],
  },
];

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

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

    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp3-page">
      <SeoHead
        title="Fiyatlandırma & Paketler — zuuqrmenu"
        description="Restoranınız için en uygun dijital QR menü planını seçin. Yıllık paketlerde %37'ye varan indirim ve 7 gün ücretsiz deneme fırsatı."
        canonical="https://zuuqrmenu.com/fiyatlandirma"
      />

      <LandingHeader />

      <main style={{ paddingTop: '5.5rem' }}>
        {/* Pricing Cards */}
        <section className="lp3-pricing" style={{ paddingBottom: '3rem' }}>
          <div className="lp3-pricing__inner">
            <PricingCardsGrid isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
          </div>
        </section>

        {/* Detailed Comparison Table (Correctly Structured & Centered) */}
        <section className="lp3-compare-section">
          <div className="lp3-compare-inner">
            <div className="lp3-compare-header lp3-reveal">
              <span className="lp3-label">Detaylı Karşılaştırma</span>
              <h2 className="lp3-compare-headline">Tüm Özellikleri Karşılaştırın</h2>
              <p className="lp3-compare-sub">Hangi paketin restoranınız için en doğrusu olduğunu ayrıntılı tablomuzdan inceleyin.</p>
            </div>

            <div className="lp3-compare-table-wrap lp3-reveal lp3-reveal--delay-1">
              <table className="lp3-compare-table">
                <thead>
                  <tr>
                    <th>Özellikler</th>
                    <th>Başlangıç</th>
                    <th>Profesyonel</th>
                    <th>Kurumsal</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((cat, ci) => (
                    <React.Fragment key={ci}>
                      <tr className="lp3-compare-cat-row">
                        <td colSpan={4}>{cat.category}</td>
                      </tr>
                      {cat.rows.map((row, ri) => (
                        <tr key={ri}>
                          <td><strong>{row.name}</strong></td>
                          <td>
                            {typeof row.starter === 'boolean' ? (
                              row.starter ? <span className="lp3-compare-check">✓</span> : <span className="lp3-compare-cross">—</span>
                            ) : (
                              <span className="lp3-compare-badge">{row.starter}</span>
                            )}
                          </td>
                          <td>
                            {typeof row.pro === 'boolean' ? (
                              row.pro ? <span className="lp3-compare-check">✓</span> : <span className="lp3-compare-cross">—</span>
                            ) : (
                              <span className="lp3-compare-badge">{row.pro}</span>
                            )}
                          </td>
                          <td>
                            {typeof row.enterprise === 'boolean' ? (
                              row.enterprise ? <span className="lp3-compare-check">✓</span> : <span className="lp3-compare-cross">—</span>
                            ) : (
                              <span className="lp3-compare-badge">{row.enterprise}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="lp3-final-cta" style={{ paddingTop: '2rem' }}>
          <div className="lp3-final-cta__box lp3-reveal">
            <h2 className="lp3-final-cta__headline">7 gün ücretsiz deneyin.</h2>
            <p className="lp3-final-cta__sub">Kredi kartı gerekmez. Dakikalar içinde menünüzü oluşturup masalarınıza koyun.</p>
            <div className="lp3-final-cta__actions">
              <a
                href={getPanelUrl('/register')}
                className="lp3-btn lp3-btn--primary"
                onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'pricing_page_bottom' })}
              >
                Hemen Ücretsiz Başla ↗
              </a>
              <Link to="/" className="lp3-btn lp3-btn--ghost">
                ← Ana Sayfaya Dön
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

export default PricingPage;
