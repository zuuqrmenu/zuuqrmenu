import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { trackEvent } from '../utils/analytics';
import { getPanelUrl } from '../utils/domainHelpers';
import LandingZuuAI from '../components/LandingZuuAI';
import { LandingHeader, LandingFooter } from './LandingPage';
import '../styles/landing.css';

/* Shared Page Wrapper */
const PageShell = ({ title, eyebrow, subtitle, children, canonical, metaDesc }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="lp3-page">
      <SeoHead
        title={`${title} — zuuqrmenu`}
        description={metaDesc || `${title} sayfası. Restoranlar için akıllı QR dijital menü platformu.`}
        canonical={`https://zuuqrmenu.com${canonical}`}
      />
      <LandingHeader />

      <main className="lp3-legal-page">
        <header className="lp3-legal-page__header">
          <div className="lp3-legal-page__header-inner">
            {eyebrow && <span className="lp3-label">{eyebrow}</span>}
            <h1 className="lp3-legal-page__title">{title}</h1>
            {subtitle && <p className="lp3-legal-page__subtitle">{subtitle}</p>}
          </div>
        </header>

        <section className="lp3-legal-page__body">
          <div className="lp3-legal-page__content">
            {children}
          </div>
        </section>
      </main>

      <LandingZuuAI />
      <LandingFooter />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   1. HAKKIMIZDA
   ═══════════════════════════════════════════════════════════════ */
export const AboutPage = () => {
  return (
    <PageShell
      title="Hakkımızda"
      eyebrow="Hikayemiz & Vizyonumuz"
      subtitle="Restoran ve kafe işletmelerinin kağıt menü maliyetlerinden kurtulmasını ve dijital çağa kusursuz adım atmasını sağlıyoruz."
      canonical="/hakkimizda"
      metaDesc="zuuqrmenu, restoran ve kafeler için modern, hızlı ve yapay zeka destekli QR menü çözümleri sunar."
    >
      <div className="lp3-legal-block">
        <h2>Biz Kimiz?</h2>
        <p>
          <strong>zuuqrmenu</strong>, yeme-içme sektöründeki işletmelerin menü yönetimini zahmetsiz, anlık ve maliyetsiz hale getirmek amacıyla kurulmuş yeni nesil bir restoran teknolojisi platformudur.
        </p>
        <p>
          Kağıt menülerin ilk günden eskidiği, her fiyat ve stok değişikliğinde haftalarca matbaa süreçleriyle uğraşıldığı günleri geride bırakıyoruz. Restoran sahiplerine, şeflere ve işletmecilere menülerini saniyeler içinde güncelleyebilecekleri, yapay zeka ile zenginleştirebilecekleri ve müşterilerine büyüleyici bir görsel deneyim sunabilecekleri bir altyapı sağlıyoruz.
        </p>
      </div>

      <div className="lp3-legal-block">
        <h2>Misyonumuz</h2>
        <p>
          Geleneksel menü süreçlerindeki tüm operasyonel sürtünmeleri ortadan kaldırarak; ister tek şubeli butik bir kahveci ister çok şubeli büyük bir restoran zinciri olsun, her işletmenin dakikalar içinde en üst düzey dijital menüye sahip olmasını sağlamak.
        </p>
      </div>

      <div className="lp3-legal-block">
        <h2>Neden zuuqrmenu?</h2>
        <ul className="lp3-legal-list">
          <li><strong>1 Saniyede Canlı Güncelleme:</strong> Fiyat, ürün açıklaması veya stok durumu değiştirdiğinizde tüm masalarda aynı anda güncellenir.</li>
          <li><strong>ZuuAI Yapay Zeka Asistanı:</strong> PDF veya menü fotoğrafından otomatik menü aktarımı ve akıllı ürün önerileri.</li>
          <li><strong>Modern Tasarım & Temalar:</strong> Bento Grid, hikaye (story) halkaları ve restoranınızın marka kimliğine uyumlu renk seçenekleri.</li>
          <li><strong>Masa Bazlı Analitik:</strong> Hangi ürünlerin kaç kez görüntülendiğini ve müşteri eğilimlerini anlık takip edebilme.</li>
        </ul>
      </div>

      <div className="lp3-legal-cta">
        <h3>Restoranınızı dijitalleştirmeye hazır mısınız?</h3>
        <p>7 gün ücretsiz deneyin, kredi kartı gerekmeden hemen menünüzü oluşturun.</p>
        <a href={getPanelUrl('/register')} className="lp3-btn lp3-btn--primary">Hemen Ücretsiz Başla ↗</a>
      </div>
    </PageShell>
  );
};

/* ═══════════════════════════════════════════════════════════════
   2. İLETİŞİM
   ═══════════════════════════════════════════════════════════════ */
export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', restaurant: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    trackEvent('submit_contact_form', { location: 'contact_page' });
  };

  return (
    <PageShell
      title="İletişim"
      eyebrow="Bize Ulaşın"
      subtitle="Sorularınız, kurumsal iş birlikleri ve özel entegrasyon talepleriniz için ekibimiz her zaman yanınızda."
      canonical="/iletisim"
      metaDesc="zuuqrmenu destek ve satış ekibiyle iletişime geçin. 7/24 hızlı geri dönüş."
    >
      <div className="lp3-contact-grid">
        <div className="lp3-contact-info">
          <h3>İletişim Kanalları</h3>
          <p>Her türlü soru ve talebiniz için bize dilediğiniz kanaldan ulaşabilirsiniz.</p>

          <div className="lp3-contact-card">
            <span className="lp3-contact-card__icon">✉️</span>
            <div>
              <strong>E-Posta</strong>
              <p><a href="mailto:destek@zuuqrmenu.com">destek@zuuqrmenu.com</a></p>
            </div>
          </div>

          <div className="lp3-contact-card">
            <span className="lp3-contact-card__icon">💬</span>
            <div>
              <strong>WhatsApp Destek Hattı</strong>
              <p><a href="https://wa.me/908500000000" target="_blank" rel="noreferrer">+90 850 000 00 00</a></p>
            </div>
          </div>

          <div className="lp3-contact-card">
            <span className="lp3-contact-card__icon">📍</span>
            <div>
              <strong>Adres & Ofis</strong>
              <p>Maslak Mah. Büyükdere Cad. No: 255, Sarıyer / İstanbul</p>
            </div>
          </div>
        </div>

        <div className="lp3-contact-form-wrap">
          {submitted ? (
            <div className="lp3-contact-success">
              <span className="lp3-contact-success__icon">✓</span>
              <h3>Mesajınız Alındı!</h3>
              <p>Ekibimiz en kısa sürede (genellikle 1 iş saati içinde) sizinle iletişime geçecektir.</p>
              <button type="button" className="lp3-btn lp3-btn--ghost" onClick={() => setSubmitted(false)}>Yeni Mesaj Gönder</button>
            </div>
          ) : (
            <form className="lp3-contact-form" onSubmit={handleSubmit}>
              <h3>Bize Mesaj Bırakın</h3>
              <div className="lp3-form-group">
                <label htmlFor="c-name">Adınız Soyadınız</label>
                <input
                  id="c-name"
                  type="text"
                  required
                  placeholder="Ahmet Yılmaz"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="lp3-form-row">
                <div className="lp3-form-group">
                  <label htmlFor="c-email">E-Posta Adresiniz</label>
                  <input
                    id="c-email"
                    type="email"
                    required
                    placeholder="ahmet@restoran.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="lp3-form-group">
                  <label htmlFor="c-phone">Telefon Numaranız</label>
                  <input
                    id="c-phone"
                    type="tel"
                    placeholder="0532 000 00 00"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="lp3-form-group">
                <label htmlFor="c-restaurant">Restoran / İşletme Adı</label>
                <input
                  id="c-restaurant"
                  type="text"
                  placeholder="Trattoria Bella"
                  value={formData.restaurant}
                  onChange={e => setFormData({ ...formData, restaurant: e.target.value })}
                />
              </div>

              <div className="lp3-form-group">
                <label htmlFor="c-message">Mesajınız</label>
                <textarea
                  id="c-message"
                  rows="4"
                  required
                  placeholder="Nasıl yardımcı olabiliriz?"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="lp3-btn lp3-btn--primary">Mesajı Gönder →</button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
};

/* ═══════════════════════════════════════════════════════════════
   3. GİZLİLİK POLİTİKASI
   ═══════════════════════════════════════════════════════════════ */
export const PrivacyPage = () => (
  <PageShell
    title="Gizlilik Politikası"
    eyebrow="Yasal Bilgilendirme"
    subtitle="Kişisel verilerinizin gizliliği ve güvenliği zuuqrmenu için en yüksek önceliktir."
    canonical="/gizlilik"
    metaDesc="zuuqrmenu Gizlilik Politikası. Kullanıcı verilerinin toplanması, korunması ve işlenmesine ilişkin kurallar."
  >
    <div className="lp3-legal-block">
      <h2>1. Genel Bilgilendirme</h2>
      <p>
        Bu Gizlilik Politikası, zuuqrmenu (“Platform”) üzerinden sunulan dijital menü ve restoran yönetim hizmetlerini kullanan işletmecilerin, restoran personellerinin ve menüyü görüntüleyen son kullanıcıların kişisel verilerinin nasıl işlendiğini, saklandığını ve korunduğunu açıklamaktadır.
      </p>
    </div>

    <div className="lp3-legal-block">
      <h2>2. Toplanan Veriler</h2>
      <p>Hizmetlerimiz kapsamında aşağıdaki veriler toplanabilmektedir:</p>
      <ul className="lp3-legal-list">
        <li><strong>Hesap Bilgileri:</strong> İsim, e-posta adresi, telefon numarası, restoran adı ve şube bilgileri.</li>
        <li><strong>Menü & İçerik Verileri:</strong> Ürün adları, fiyatlar, fotoğraflar, kategori yapıları ve stok durumları.</li>
        <li><strong>Kullanım & Analitik Verileri:</strong> QR kod tarama sayısı, ziyaret edilen kategori/ürünler, anonimleştirilmiş cihaz ve tarayıcı türleri.</li>
      </ul>
    </div>

    <div className="lp3-legal-block">
      <h2>3. Verilerin Kullanım Amaçları</h2>
      <p>Toplanan kişisel veriler;</p>
      <ul className="lp3-legal-list">
        <li>Platform hizmetlerinin eksiksiz ve güvenli şekilde sunulması,</li>
        <li>Restoran yönetim paneli erişiminin sağlanması,</li>
        <li>Fatura ve ödeme süreçlerinin yürütülmesi,</li>
        <li>Kullanıcı deneyiminin ve platform performansının artırılması amacıyla işlenmektedir.</li>
      </ul>
    </div>

    <div className="lp3-legal-block">
      <h2>4. Veri Güvenliği</h2>
      <p>
        Verileriniz endüstri standardı SSL/TLS şifreleme protokolleri ve güvenlik duvarları ile korunmaktadır. Yetkisiz erişim, veri kaybı veya kötüye kullanıma karşı düzenli güvenlik denetimleri uygulanmaktadır.
      </p>
    </div>
  </PageShell>
);

/* ═══════════════════════════════════════════════════════════════
   4. KULLANIM KOŞULLARI
   ═══════════════════════════════════════════════════════════════ */
export const TermsPage = () => (
  <PageShell
    title="Kullanım Koşulları"
    eyebrow="Hizmet Sözleşmesi"
    subtitle="zuuqrmenu platformunu kullanarak kabul ettiğiniz temel şartlar ve kurallar."
    canonical="/kullanim-kosullari"
    metaDesc="zuuqrmenu Kullanım Koşulları ve Hizmet Şartları."
  >
    <div className="lp3-legal-block">
      <h2>1. Taraflar ve Kapsam</h2>
      <p>
        İşbu Kullanım Koşulları, zuuqrmenu platformuna üye olan veya platformu ziyaret eden tüm kullanıcılar ("Kullanıcı") ile zuuqrmenu arasında akdedilmiştir.
      </p>
    </div>

    <div className="lp3-legal-block">
      <h2>2. Hizmetin Tanımı</h2>
      <p>
        zuuqrmenu, restoran ve işletmeler için dijital menü oluşturma, anlık fiyat/stok yönetimi, yapay zeka tabanlı menü analizi ve QR kod üretimi sağlayan bir SaaS (Hizmet Olarak Yazılım) platformudur.
      </p>
    </div>

    <div className="lp3-legal-block">
      <h2>3. Üyelik ve Hesap Güvenliği</h2>
      <p>
        Kullanıcı, hesap oluştururken doğru, güncel ve eksiksiz bilgi vermekle yükümlüdür. Hesap şifresinin gizliliğinden ve hesap üzerinden gerçekleştirilen tüm faaliyetlerden bizzat Kullanıcı sorumludur.
      </p>
    </div>

    <div className="lp3-legal-block">
      <h2>4. Fikri Mülkiyet Hakları</h2>
      <p>
        zuuqrmenu platformunun yazılımı, tasarımı, logoları, temaları ve tüm altyapısı zuuqrmenu'ya aittir. Kullanıcı tarafından yüklenen menü metinleri ve fotoğrafların fikri mülkiyeti ise ilgili işletmeye aittir.
      </p>
    </div>
  </PageShell>
);

/* ═══════════════════════════════════════════════════════════════
   5. KVKK AYDINLATMA METNİ
   ═══════════════════════════════════════════════════════════════ */
export const KvkkPage = () => (
  <PageShell
    title="KVKK Aydınlatma Metni"
    eyebrow="6698 Sayılı Kanun Kapsamında"
    subtitle="Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca haklarınız ve veri işleme süreçlerimiz."
    canonical="/kvkk"
    metaDesc="zuuqrmenu KVKK Aydınlatma Metni ve Veri Sahibi Hakları."
  >
    <div className="lp3-legal-block">
      <h2>1. Veri Sorumlusu</h2>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla zuuqrmenu tarafından işlenmektedir.
      </p>
    </div>

    <div className="lp3-legal-block">
      <h2>2. Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
      <p>
        Kişisel verileriniz, KVKK'nın 5. ve 6. maddelerinde belirtilen sözleşmenin kurulması ve ifası, hukuki yükümlülüklerin yerine getirilmesi, meşru menfaatler ve açık rıza hukuki sebeplerine dayalı olarak işlenmektedir.
      </p>
    </div>

    <div className="lp3-legal-block">
      <h2>3. İlgili Kişinin Hakları (Madde 11)</h2>
      <p>KVKK'nın 11. maddesi kapsamında her veri sahibi;</p>
      <ul className="lp3-legal-list">
        <li>Kişisel verilerinin işlenip işlenmediğini öğrenme,</li>
        <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
        <li>KVKK 7. maddesi uyarınca silinmesini veya yok edilmesini talep etme haklarına sahiptir.</li>
      </ul>
      <p>Başvurularınızı <a href="mailto:kvkk@zuuqrmenu.com">kvkk@zuuqrmenu.com</a> adresine iletebilirsiniz.</p>
    </div>
  </PageShell>
);

/* ═══════════════════════════════════════════════════════════════
   6. ÇEREZ POLİTİKASI
   ═══════════════════════════════════════════════════════════════ */
export const CookiePage = () => (
  <PageShell
    title="Çerez Politikası"
    eyebrow="Gizlilik & Tercihler"
    subtitle="Web sitemizde ve dijital menülerimizde kullanılan çerez türleri ve yönetim yöntemleri."
    canonical="/cerez"
    metaDesc="zuuqrmenu Çerez (Cookie) Politikası ve Çerez Yönetimi."
  >
    <div className="lp3-legal-block">
      <h2>1. Çerez Nedir?</h2>
      <p>
        Çerezler (cookies), bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Sitenin düzgün çalışması ve kullanıcı tercihlerinin hatırlanması için kullanılır.
      </p>
    </div>

    <div className="lp3-legal-block">
      <h2>2. Kullandığımız Çerez Türleri</h2>
      <ul className="lp3-legal-list">
        <li><strong>Zorunlu Çerezler:</strong> Platform oturumunun açık tutulması ve güvenlik kontrolleri için zorunludur.</li>
        <li><strong>Performans & Analitik Çerezleri:</strong> Menü görüntülenme sayılarını anonim olarak ölçümlemek ve performansı optimize etmek için kullanılır.</li>
        <li><strong>İşlevsellik Çerezleri:</strong> Dil, tema ve son görüntülenen kategori tercihlerinizin hatırlanmasını sağlar.</li>
      </ul>
    </div>

    <div className="lp3-legal-block">
      <h2>3. Çerezlerin Yönetimi</h2>
      <p>
        Tarayıcınızın ayarlarından çerezleri dilediğiniz zaman silebilir veya yeni çerez kabulünü engelleyebilirsiniz. Ancak zorunlu çerezlerin kapatılması durumunda yönetim panelinin bazı özellikleri düzgün çalışmayabilir.
      </p>
    </div>
  </PageShell>
);
