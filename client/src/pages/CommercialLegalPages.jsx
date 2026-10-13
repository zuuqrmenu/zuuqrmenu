import React from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from './LegalPages';
import { companyInfo as c } from '../data/companyInfo';

const Block = ({ title, children }) => (
  <div className="lp3-legal-block">
    {title && <h2>{title}</h2>}
    {children}
  </div>
);

const SellerList = () => (
  <ul className="lp3-legal-list">
    <li><strong>Ticari Unvan / Ad Soyad:</strong> {c.legalName}</li>
    <li><strong>Vergi Dairesi / No:</strong> {c.taxOffice} / {c.taxNumber}</li>
    {c.mersisNo && <li><strong>MERSİS No:</strong> {c.mersisNo}</li>}
    <li><strong>Adres:</strong> {c.address}</li>
    <li><strong>E-posta:</strong> <a href={`mailto:${c.email}`}>{c.email}</a></li>
    <li><strong>Telefon:</strong> {c.phone}</li>
    <li><strong>Web sitesi:</strong> {c.website.replace('https://', '')}</li>
  </ul>
);

/* ─────────────────────────── Satıcı Bilgileri ─────────────────────────── */
export const SellerInfoPage = () => (
  <PageShell
    title="Satıcı Bilgileri"
    eyebrow="Yasal Bilgilendirme"
    subtitle="6563 sayılı Elektronik Ticaret Kanunu kapsamında hizmet sağlayıcının kimlik ve iletişim bilgileri."
    canonical="/satici-bilgileri"
    metaDesc="zuuqrmenu hizmet sağlayıcı (satıcı) kimlik ve iletişim bilgileri."
  >
    <Block title="Hizmet Sağlayıcı">
      <SellerList />
    </Block>
    <Block title="Sunulan Hizmet">
      <p>
        {c.brand}; restoran, kafe ve benzeri işletmelerin QR kod ile erişilen dijital menülerini oluşturmasına, yönetmesine ve yayınlamasına imkân tanıyan abonelik esaslı bir internet yazılımı (SaaS) hizmetidir. Hizmet; internet sitesi ve yönetim paneli üzerinden elektronik ortamda sunulur, fiziksel teslimat içermez.
      </p>
    </Block>
    <Block title="Ödeme Altyapısı">
      <p>
        Kredi / banka kartı ile yapılan ödemeler, 6493 sayılı Kanun kapsamında lisanslı ödeme kuruluşu PayTR (PayTR Ödeme ve Elektronik Para Hizmetleri A.Ş.) altyapısı üzerinden gerçekleştirilir. Kart bilgileriniz {c.brand} tarafından görüntülenmez ve saklanmaz.
      </p>
    </Block>
    <Block title="İlgili Sayfalar">
      <ul className="lp3-legal-list">
        <li><Link to="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link></li>
        <li><Link to="/on-bilgilendirme-formu">Ön Bilgilendirme Formu</Link></li>
        <li><Link to="/iptal-iade-kosullari">İptal ve İade Koşulları</Link></li>
        <li><Link to="/gizlilik">Gizlilik Politikası</Link></li>
        <li><Link to="/kvkk">KVKK Aydınlatma Metni</Link></li>
      </ul>
    </Block>
  </PageShell>
);

/* ─────────────────────────── Mesafeli Satış Sözleşmesi ─────────────────────────── */
export const DistanceSalesPage = () => (
  <PageShell
    title="Mesafeli Satış Sözleşmesi"
    eyebrow="Abonelik Sözleşmesi"
    subtitle="6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında düzenlenmiştir."
    canonical="/mesafeli-satis-sozlesmesi"
    metaDesc="zuuqrmenu abonelik hizmetleri için Mesafeli Satış Sözleşmesi."
  >
    <Block title="Madde 1 – Taraflar">
      <p><strong>SATICI:</strong></p>
      <SellerList />
      <p><strong>ALICI:</strong> {c.brand} platformuna üye olarak ödeme sayfasında adı, iletişim ve fatura bilgilerini beyan eden gerçek veya tüzel kişidir. Alıcının bilgileri sipariş anında ödeme formunda kayda alınır.</p>
    </Block>
    <Block title="Madde 2 – Sözleşmenin Konusu">
      <p>
        İşbu sözleşmenin konusu; ALICI'nın {c.brand} internet sitesi üzerinden elektronik ortamda sipariş verdiği, nitelikleri ve satış fiyatı sipariş ekranında ve Ön Bilgilendirme Formu'nda belirtilen dijital menü yazılımı aboneliğinin SATICI tarafından sunulması ile tarafların hak ve yükümlülüklerinin belirlenmesidir.
      </p>
    </Block>
    <Block title="Madde 3 – Hizmetin Nitelikleri ve Bedeli">
      <ul className="lp3-legal-list">
        <li>Hizmet; seçilen pakete (Başlangıç, Profesyonel) ve dönem (aylık / yıllık) bilgisine göre sipariş ekranında gösterilen özellikleri kapsar.</li>
        <li>Paket fiyatları KDV dahil Türk Lirası olarak gösterilir. Ödenecek toplam bedel, ödeme sayfasında ALICI'ya ayrıca sunulur.</li>
        <li>Abonelik dönemi ödemenin başarıyla tamamlandığı anda başlar; seçilen dönem (1 ay veya 12 ay) sonunda kendiliğinden sona erer. Yenileme için ALICI'nın yeni bir ödeme yapması gerekir.</li>
        <li>SATICI; fiyatları ve paket kapsamını yalnızca ileriye dönük olarak değiştirebilir. Ödemesi tamamlanmış dönemin bedeli değişmez.</li>
      </ul>
    </Block>
    <Block title="Madde 4 – Ödeme">
      <p>
        Ödeme; kredi kartı veya banka kartı ile PayTR güvenli ödeme sayfası üzerinden tek çekim olarak yapılır. Ödemenin onaylanmaması halinde sipariş oluşmaz ve hizmet başlatılmaz.
      </p>
    </Block>
    <Block title="Madde 5 – İfa ve Teslim">
      <p>
        Hizmet elektronik ortamda sunulduğundan fiziksel teslimat yoktur. Ödemenin onaylanmasının ardından ALICI'nın hesabı seçilen pakete göre derhal etkinleştirilir. Teknik bir sorun nedeniyle etkinleştirme gerçekleşmezse ALICI, {c.email} adresinden SATICI'ya ulaşabilir.
      </p>
    </Block>
    <Block title="Madde 6 – Cayma Hakkı">
      <p>
        ALICI, mal ve hizmetin sunulmasından önce, aboneliğin başlamasıyla birlikte hizmetin ifasına başlanmasını açıkça onaylar. Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (1) numaralı fıkrası (ğ) bendi uyarınca, elektronik ortamda anında ifa edilen ve tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler ile ifasına başlanmış hizmetlerde cayma hakkı kullanılamaz.
      </p>
      <p>
        Bununla birlikte SATICI, iyi niyetli bir uygulama olarak <Link to="/iptal-iade-kosullari">İptal ve İade Koşulları</Link> sayfasında belirtilen şartlarda iade imkânı tanıyabilir.
      </p>
    </Block>
    <Block title="Madde 7 – ALICI'nın Yükümlülükleri">
      <ul className="lp3-legal-list">
        <li>Hesap ve fatura bilgilerinin doğru ve güncel olmasından ALICI sorumludur.</li>
        <li>Hizmet; mevzuata, üçüncü kişilerin haklarına ve <Link to="/kullanim-kosullari">Kullanım Koşulları</Link>'na aykırı biçimde kullanılamaz.</li>
        <li>Menüye yüklenen içeriklerin (metin, fotoğraf, marka) hukuka uygunluğundan ALICI sorumludur.</li>
      </ul>
    </Block>
    <Block title="Madde 8 – SATICI'nın Yükümlülükleri ve Sorumluluk">
      <p>
        SATICI, hizmeti makul düzeyde kesintisiz ve güvenli sunmayı taahhüt eder. Planlı bakım, mücbir sebepler, internet altyapısı ve üçüncü taraf hizmet sağlayıcılardan kaynaklanan kesintilerden doğan dolaylı zararlardan SATICI sorumlu değildir.
      </p>
    </Block>
    <Block title="Madde 9 – Fesih">
      <p>
        ALICI, aboneliğin sonraki dönemde yenilenmemesini diledikçe sağlar; dönem içinde hesabını kapatması halinde ödenmiş dönem bedelinin iadesi İptal ve İade Koşulları'na tabidir. SATICI, sözleşmeye veya mevzuata aykırı kullanımın tespiti halinde hizmeti askıya alma veya sonlandırma hakkını saklı tutar.
      </p>
    </Block>
    <Block title="Madde 10 – Kişisel Veriler">
      <p>
        Sipariş sürecinde paylaşılan kişisel veriler, sözleşmenin kurulması ve ifası, faturalandırma ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla <Link to="/kvkk">KVKK Aydınlatma Metni</Link> ve <Link to="/gizlilik">Gizlilik Politikası</Link> çerçevesinde işlenir.
      </p>
    </Block>
    <Block title="Madde 11 – Uyuşmazlıkların Çözümü">
      <p>
        İşbu sözleşmeden doğan uyuşmazlıklarda, her yıl Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar dahilinde ALICI'nın yerleşim yerindeki Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
      </p>
    </Block>
    <Block title="Madde 12 – Yürürlük">
      <p>
        ALICI, sipariş vermeden önce işbu sözleşmenin tüm koşullarını ve Ön Bilgilendirme Formu'nu elektronik ortamda okuyup kabul ettiğini beyan eder. Sözleşme, ödemenin onaylandığı anda yürürlüğe girer.
      </p>
    </Block>
  </PageShell>
);

/* ─────────────────────────── Ön Bilgilendirme Formu ─────────────────────────── */
export const PreInformationPage = () => (
  <PageShell
    title="Ön Bilgilendirme Formu"
    eyebrow="Mesafeli Sözleşmeler Yönetmeliği"
    subtitle="Sipariş vermeden önce bilmeniz gereken temel bilgiler."
    canonical="/on-bilgilendirme-formu"
    metaDesc="zuuqrmenu abonelik satın alma öncesi Ön Bilgilendirme Formu."
  >
    <Block title="1. Satıcı Bilgileri">
      <SellerList />
    </Block>
    <Block title="2. Hizmetin Temel Nitelikleri">
      <p>
        Konusu; QR kod ile erişilen dijital menü yazılımı aboneliğidir. Başlangıç ve Profesyonel paketlerinin kapsamı, sipariş sayfasında ve <Link to="/fiyatlandirma">Fiyatlandırma</Link> sayfasında ayrıntılı olarak listelenmiştir.
      </p>
    </Block>
    <Block title="3. Bedel ve Ödeme Şekli">
      <ul className="lp3-legal-list">
        <li>Fiyatlar KDV dahil TL cinsindendir. Aylık ve yıllık dönem fiyatları sipariş ekranında gösterilir.</li>
        <li>Ödeme kredi kartı / banka kartı ile PayTR güvenli ödeme sayfasında tek çekim yapılır.</li>
        <li>Abonelik ödemenin onaylanmasıyla başlar, dönem sonunda otomatik olarak yenilenmez.</li>
      </ul>
    </Block>
    <Block title="4. İfa ve Teslimat">
      <p>Hizmet elektronik ortamda ifa edilir; ödeme onayından sonra hesabınız derhal ilgili pakete geçirilir. Fiziksel teslimat ve kargo bulunmaz.</p>
    </Block>
    <Block title="5. Cayma Hakkı">
      <p>
        Elektronik ortamda anında ifa edilen hizmetlerde ve tüketicinin onayıyla ifasına başlanan hizmetlerde cayma hakkı kullanılamaz (Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ). Siparişi onaylayarak hizmetin derhal başlamasını kabul etmiş olursunuz. Ayrıntılar için <Link to="/iptal-iade-kosullari">İptal ve İade Koşulları</Link> sayfasına bakın.
      </p>
    </Block>
    <Block title="6. Şikâyet ve Başvuru">
      <p>
        Şikâyet ve talepleriniz için <a href={`mailto:${c.email}`}>{c.email}</a> adresine yazabilirsiniz. Tüketici şikâyetleriniz için ayrıca ikamet ettiğiniz yerdeki Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri'ne başvurma hakkınız saklıdır.
      </p>
    </Block>
    <Block title="7. Onay">
      <p>
        Sipariş sırasında işaretleyeceğiniz onay kutusu ile bu formu ve <Link to="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>'ni okuyup anladığınızı ve elektronik ortamda onayladığınızı beyan edersiniz.
      </p>
    </Block>
  </PageShell>
);

/* ─────────────────────────── İptal ve İade Koşulları ─────────────────────────── */
export const RefundPolicyPage = () => (
  <PageShell
    title="İptal ve İade Koşulları"
    eyebrow="Abonelik Politikası"
    subtitle="Aboneliğinizin iptali, yenilenmemesi ve ücret iadesine ilişkin esaslar."
    canonical="/iptal-iade-kosullari"
    metaDesc="zuuqrmenu abonelik iptal ve ücret iadesi koşulları."
  >
    <Block title="1. Abonelik İptali">
      <p>
        Abonelikler otomatik yenilenmez; dönem sonunda hesabınız ücretsiz kullanım koşullarına döner. Dilediğiniz zaman destek hattımız üzerinden hesabınızın kapatılmasını talep edebilirsiniz. İptal, ödenmiş dönemin sonuna kadar hizmet almaya devam etmenize engel değildir.
      </p>
    </Block>
    <Block title="2. Cayma Hakkı Hakkında">
      <p>
        Dijital menü hizmeti elektronik ortamda anında ifa edilen bir hizmettir ve ödeme onayıyla birlikte ifasına başlanır. Bu nedenle 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca yasal cayma hakkı kullanılamaz.
      </p>
    </Block>
    <Block title="3. İade Talepleri">
      <p>Aşağıdaki durumlarda ücret iadesi için ödeme tarihinden itibaren 14 gün içinde talepte bulunabilirsiniz:</p>
      <ul className="lp3-legal-list">
        <li>Mükerrer (çift) çekim yapılması,</li>
        <li>Hizmetin SATICI kaynaklı teknik nedenlerle ödemeden sonra etkinleştirilememesi ve bu durumun makul sürede giderilememesi,</li>
        <li>Hizmetin sipariş sayfasında vaat edilen niteliklerde sunulmaması.</li>
      </ul>
      <p>Talepler <a href={`mailto:${c.email}`}>{c.email}</a> adresine, kayıtlı e-posta adresiniz ve sipariş numaranızla iletilmelidir.</p>
    </Block>
    <Block title="4. İade Süreci">
      <p>
        Onaylanan iadeler, ödemenin yapıldığı karta, talebin onaylanmasından itibaren en geç 14 gün içinde PayTR üzerinden iade edilir. Bankanıza bağlı olarak tutarın kart ekstrenize yansıması ek süre alabilir.
      </p>
    </Block>
    <Block title="5. Kötüye Kullanım">
      <p>
        <Link to="/kullanim-kosullari">Kullanım Koşulları</Link>'nın ihlali nedeniyle SATICI tarafından sonlandırılan hesaplarda kalan dönem bedeli iade edilmez.
      </p>
    </Block>
  </PageShell>
);

/* ─────────────────────────── Kötüye Kullanım Bildirimi ─────────────────────────── */
export const AbuseReportPage = () => (
  <PageShell
    title="Kötüye Kullanım Bildirimi"
    eyebrow="Güvenli Platform"
    subtitle="Hukuka aykırı, yanıltıcı veya haklarınızı ihlal eden bir menü ya da içerik gördüyseniz bize bildirin."
    canonical="/kotuye-kullanim"
    metaDesc="zuuqrmenu üzerinde yayınlanan hukuka aykırı içerikler için bildirim ve kaldırma süreci."
  >
    <Block title="Hangi İçerikleri Bildirebilirsiniz?">
      <ul className="lp3-legal-list">
        <li>Fikri mülkiyet haklarınızı ihlal eden görsel, metin veya marka kullanımı,</li>
        <li>Yanıltıcı, dolandırıcılık amaçlı veya kullanıcıları zarara uğratabilecek menü içerikleri,</li>
        <li>Hukuka, genel ahlaka veya kişilik haklarına aykırı içerikler,</li>
        <li>Kişisel verilerinizin izniniz olmadan yayınlanması.</li>
      </ul>
    </Block>
    <Block title="Bildirim Nasıl Yapılır?">
      <p>
        <a href={`mailto:${c.email}`}>{c.email}</a> adresine; ilgili menü adresini (URL), şikâyet konusunu, hak sahibi olduğunuzu gösteren bilgi/belgeyi ve size ulaşabileceğimiz iletişim bilgilerini gönderin.
      </p>
    </Block>
    <Block title="Değerlendirme Süreci">
      <p>
        Bildirimler incelenir; ihlal tespit edilmesi halinde içerik kaldırılır veya ilgili hesap erişime kapatılır. Mevzuat gereği yetkili mercilerden gelen talepler ayrıca yerine getirilir.
      </p>
    </Block>
  </PageShell>
);
