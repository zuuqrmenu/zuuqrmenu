import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import RestaurantLayout from '../components/RestaurantLayout';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { useAuth } from '../context/AuthContext';
import { billingService } from '../services/billingService';
import { PageHeader, Card, Button, Segmented, Notice, Chip, Icon } from '../components/dashboard/ui';

const PLAN_COPY = {
  starter: {
    desc: 'Tek şubeli kafeler ve butik işletmeler için temel dijital menü.',
    features: ['3 kategori ve 25 ürüne kadar', 'Anlık fiyat ve stok güncelleme', 'Dinamik QR menü ve masa kartı', 'Varsayılan tema ve logo özelleştirme'],
  },
  professional: {
    desc: 'ZuuAI, Bento teması ve detaylı analitik isteyen işletmeler için.',
    featured: true,
    features: ['Sınırsız kategori ve ürün', 'ZuuAI menü yükleme (PDF / fotoğraf)', 'Tüm premium temalar', 'Detaylı ürün ve kategori analitiği', 'Öncelikli WhatsApp ve telefon desteği'],
  },
};

const fmtTry = (n) => `₺${Number(n).toLocaleString('tr-TR')}`;
const fmtDate = (value) => (value ? new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
const STATUS_TONE = { PAID: 'ok', PENDING: 'warn', FAILED: 'bad' };
const STATUS_LABEL = { PAID: 'Ödendi', PENDING: 'Bekliyor', FAILED: 'Başarısız' };

const loadIframeResizer = () => new Promise((resolve) => {
  if (window.iFrameResize) return resolve();
  const script = document.createElement('script');
  script.src = 'https://www.paytr.com/js/iframeResizer.min.js';
  script.onload = resolve;
  script.onerror = resolve;
  document.head.appendChild(script);
});

const Billing = () => {
  const { user, restaurant } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [period, setPeriod] = useState('yearly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const iframeRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setOverview(await billingService.getOverview());
    } catch (err) {
      setError(err.response?.data?.error || 'Abonelik bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setForm((current) => ({ ...current, name: current.name || restaurant?.name || '', phone: current.phone || restaurant?.phone || '' }));
  }, [restaurant]);

  // While the PayTR frame is open, watch the order so the page reacts as soon as the callback lands.
  useEffect(() => {
    if (!checkout) return undefined;
    loadIframeResizer().then(() => {
      if (window.iFrameResize && iframeRef.current) window.iFrameResize({}, '#paytriframe');
    });
    const timer = window.setInterval(async () => {
      try {
        const { order } = await billingService.getOrder(checkout.merchantOid);
        if (order.status === 'PAID') {
          setCheckout(null);
          setSelectedPlan(null);
          setNotice('Ödemeniz alındı, aboneliğiniz etkinleştirildi. Teşekkürler!');
          load();
        } else if (order.status === 'FAILED') {
          setCheckout(null);
          setError('Ödeme tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz.');
          load();
        }
      } catch { /* keep polling */ }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [checkout, load]);

  const startCheckout = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      const data = await billingService.createCheckout({ plan: selectedPlan, period, ...form });
      setCheckout(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ödeme başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const plans = overview?.plans || [];
  const subscription = overview?.subscription;
  const active = subscription?.status === 'ACTIVE' && subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) > new Date();
  const chosen = plans.find((plan) => plan.id === selectedPlan);

  return (
    <RestaurantLayout>
      <div className="dp">
        <PageHeader
          kicker="Abonelik"
          title="Paketiniz ve ödemeler"
          lede="Paketinizi yükseltin, dönemi uzatın ve geçmiş ödemelerinizi görüntüleyin."
        />

        {notice && <Notice tone="ok">{notice}</Notice>}
        {error && <Notice tone="bad">{error}</Notice>}

        {loading ? (
          <DashboardSkeleton variant="qr" />
        ) : (
          <>
            <Card
              title="Mevcut paket"
              sub={active ? `${subscription.planName} · ${subscription.period === 'yearly' ? 'Yıllık' : 'Aylık'}` : 'Aktif ücretli bir paketiniz yok.'}
              actions={active ? <Chip tone="ok">Aktif</Chip> : <Chip>Paket yok</Chip>}
            >
              <p className="dp-card__sub">
                {active ? `Dönem sonu: ${fmtDate(subscription.currentPeriodEnd)}. Aynı paketi yenilerseniz süre mevcut dönemin sonuna eklenir.` : 'Aşağıdan bir paket seçerek abonelik başlatabilirsiniz.'}
              </p>
            </Card>

            {!overview?.configured && (
              <Notice tone="bad">Online ödeme altyapısı şu an etkin değil. Paket satın almak için destek ekibimizle iletişime geçin.</Notice>
            )}

            {!checkout && (
              <>
                <div className="bill-period">
                  <Segmented label="Faturalama dönemi" value={period} onChange={setPeriod} options={[['monthly', 'Aylık'], ['yearly', 'Yıllık']]} />
                </div>

                <div className="bill-plans">
                  {plans.map((plan) => {
                    const copy = PLAN_COPY[plan.id] || { features: [] };
                    const price = period === 'yearly' ? plan.yearly : plan.monthly;
                    const isCurrent = active && subscription.plan === plan.id;
                    return (
                      <article key={plan.id} className={`bill-plan ${copy.featured ? 'is-featured' : ''} ${selectedPlan === plan.id ? 'is-selected' : ''}`}>
                        {copy.featured && <span className="bill-plan__badge">En popüler</span>}
                        <h3>{plan.name}</h3>
                        <p>{copy.desc}</p>
                        <p className="bill-plan__price"><b>{fmtTry(price)}</b><span>{period === 'yearly' ? '/ yıl' : '/ ay'}</span></p>
                        <ul>{copy.features.map((feature) => <li key={feature}><Icon name="check" size={15} />{feature}</li>)}</ul>
                        <Button variant={copy.featured ? 'lime' : 'ghost'} disabled={!overview?.configured} onClick={() => { setSelectedPlan(plan.id); setError(''); }}>
                          {isCurrent ? 'Süreyi uzat' : 'Bu paketi seç'}
                        </Button>
                      </article>
                    );
                  })}
                </div>

                {chosen && (
                  <Card title="Fatura bilgileri" sub={`${chosen.name} · ${period === 'yearly' ? 'Yıllık' : 'Aylık'} · ${fmtTry(period === 'yearly' ? chosen.yearly : chosen.monthly)} (KDV dahil)`}>
                    <form className="bill-form" onSubmit={startCheckout}>
                      <label>Ad soyad / ünvan
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={3} maxLength={60} autoComplete="name" />
                      </label>
                      <label>Telefon
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required type="tel" placeholder="05XX XXX XX XX" autoComplete="tel" />
                      </label>
                      <label className="bill-form__wide">Fatura adresi
                        <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required minLength={10} maxLength={200} rows={3} autoComplete="street-address" />
                      </label>
                      <p className="bill-form__email">Fatura ve bildirimler <b>{user?.email}</b> adresine gönderilir.</p>
                      <label className="bill-form__consent">
                        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
                        <span>
                          <Link to="/on-bilgilendirme-formu" target="_blank">Ön Bilgilendirme Formu</Link>'nu ve <Link to="/mesafeli-satis-sozlesmesi" target="_blank">Mesafeli Satış Sözleşmesi</Link>'ni okudum, hizmetin ödeme sonrası derhal başlamasını ve <Link to="/iptal-iade-kosullari" target="_blank">İptal ve İade Koşulları</Link>'nı kabul ediyorum.
                        </span>
                      </label>
                      <div className="bill-form__actions">
                        <Button variant="ghost" onClick={() => setSelectedPlan(null)}>Vazgeç</Button>
                        <button type="submit" className="dp-btn dp-btn--lime" disabled={submitting || !consent}>
                          <span>{submitting ? 'Hazırlanıyor...' : 'Ödemeye geç'}</span>
                        </button>
                      </div>
                    </form>
                  </Card>
                )}
              </>
            )}

            {checkout && (
              <Card title="Güvenli ödeme" sub="Kart bilgileriniz PayTR güvenli ödeme sayfasında işlenir; zuuqrmenu tarafından görüntülenmez." actions={<Button variant="ghost" onClick={() => setCheckout(null)}>Ödemeyi iptal et</Button>}>
                <iframe
                  ref={iframeRef}
                  id="paytriframe"
                  title="PayTR güvenli ödeme"
                  src={checkout.iframeUrl}
                  className="bill-frame"
                  scrolling="no"
                />
              </Card>
            )}

            <Card title="Ödeme geçmişi">
              {overview?.orders?.length ? (
                <div className="bill-table-wrap">
                  <table className="bill-table">
                    <thead><tr><th>Tarih</th><th>Paket</th><th>Dönem</th><th>Tutar</th><th>Durum</th></tr></thead>
                    <tbody>
                      {overview.orders.map((order) => (
                        <tr key={order.id}>
                          <td data-label="Tarih">{fmtDate(order.createdAt)}</td>
                          <td data-label="Paket">{order.planName}</td>
                          <td data-label="Dönem">{order.period === 'yearly' ? 'Yıllık' : 'Aylık'}</td>
                          <td data-label="Tutar">{fmtTry(order.amount)}</td>
                          <td data-label="Durum"><Chip tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Chip></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="dp-card__sub">Henüz bir ödemeniz yok.</p>
              )}
            </Card>
          </>
        )}
      </div>
    </RestaurantLayout>
  );
};

export default Billing;
