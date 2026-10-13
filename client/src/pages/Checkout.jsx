import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { useAuth } from '../context/AuthContext';
import { billingService } from '../services/billingService';
import { PLAN_COPY, fmtTry } from '../data/billingPlans';
import { Card, Segmented, Notice, Icon } from '../components/dashboard/ui';

const loadIframeResizer = () => new Promise((resolve) => {
  if (window.iFrameResize) return resolve();
  const script = document.createElement('script');
  script.src = 'https://www.paytr.com/js/iframeResizer.min.js';
  script.onload = resolve;
  script.onerror = resolve;
  document.head.appendChild(script);
});

/** Standalone checkout: plan + period choice, billing details, then the PayTR payment frame. */
const Checkout = () => {
  const { user, restaurant } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState(searchParams.get('period') === 'monthly' ? 'monthly' : 'yearly');
  const [planId, setPlanId] = useState(PLAN_COPY[searchParams.get('plan')] ? searchParams.get('plan') : 'professional');
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    billingService.getOverview()
      .then(setOverview)
      .catch((err) => setError(err.response?.data?.error || 'Paket bilgileri yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setForm((current) => ({ ...current, name: current.name || restaurant?.name || '', phone: current.phone || restaurant?.phone || '' }));
  }, [restaurant]);

  // While the PayTR frame is open, watch the order so we move on as soon as the callback lands.
  useEffect(() => {
    if (!checkout) return undefined;
    loadIframeResizer().then(() => {
      if (window.iFrameResize && iframeRef.current) window.iFrameResize({}, '#paytriframe');
    });
    const timer = window.setInterval(async () => {
      try {
        const { order } = await billingService.getOrder(checkout.merchantOid);
        if (order.status === 'PAID') {
          navigate(`/dashboard/odeme-basarili?oid=${checkout.merchantOid}`, { replace: true });
        } else if (order.status === 'FAILED') {
          setCheckout(null);
          setError('Ödeme tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz.');
        }
      } catch { /* keep polling */ }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [checkout, navigate]);

  const startCheckout = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { plan: planId, period, ...form };
      try {
        setCheckout(await billingService.createCheckout(payload));
      } catch (firstError) {
        // No JSON body means the request never reached our handler (cold start / gateway timeout): one quiet retry.
        if (firstError.response?.data?.error) throw firstError;
        await new Promise((resolve) => { window.setTimeout(resolve, 1200); });
        setCheckout(await billingService.createCheckout(payload));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const status = err.response?.status;
      setError(err.response?.data?.error || `Ödeme başlatılamadı. Lütfen tekrar deneyin. (${status ? `Sunucu yanıtı: ${status}` : 'Sunucuya ulaşılamadı'})`);
    } finally {
      setSubmitting(false);
    }
  };

  const plans = overview?.plans || [];
  const chosen = plans.find((plan) => plan.id === planId);
  const price = chosen ? (period === 'yearly' ? chosen.yearly : chosen.monthly) : 0;
  const saving = chosen ? chosen.monthly * 12 - chosen.yearly : 0;

  return (
    <div className="ck">
      <SeoHead title="Güvenli Ödeme | zuuqrmenu" description="zuuqrmenu abonelik ödemesi." canonical="https://panel.zuuqrmenu.com/dashboard/checkout" robots="noindex,nofollow,noarchive" />
      <header className="ck__bar">
        <span className="ck__brand">zuuqrmenu</span>
        <span className="ck__secure"><Icon name="check" size={15} /> PayTR güvenli ödeme</span>
        <Link to="/dashboard/billing" className="ck__back">← Aboneliğe dön</Link>
      </header>

      <main className="ck__main dp">
        <h1 className="ck__title">Ödeme</h1>
        {error && <Notice tone="bad">{error}</Notice>}

        {loading ? (
          <DashboardSkeleton variant="qr" />
        ) : !chosen ? (
          <Notice tone="bad">Paket bilgileri bulunamadı. <Link to="/dashboard/billing">Aboneliğe dönün.</Link></Notice>
        ) : (
          <div className="ck__grid">
            <div className="ck__steps">
              {!checkout && (
                <Card title="1 · Paketinizi seçin" sub="Dilediğiniz paketi ve dönemi buradan değiştirebilirsiniz.">
                  <div className="bill-period">
                    <Segmented label="Faturalama dönemi" value={period} onChange={setPeriod} options={[['monthly', 'Aylık'], ['yearly', 'Yıllık']]} />
                  </div>
                  <div className="ck__plans">
                    {plans.map((plan) => {
                      const copy = PLAN_COPY[plan.id] || { features: [] };
                      const amount = period === 'yearly' ? plan.yearly : plan.monthly;
                      return (
                        <label key={plan.id} className={`ck__plan ${planId === plan.id ? 'is-selected' : ''}`}>
                          <input type="radio" name="plan" checked={planId === plan.id} onChange={() => setPlanId(plan.id)} />
                          <span className="ck__plan-head"><b>{plan.name}</b>{copy.featured && <em>En popüler</em>}</span>
                          <span className="ck__plan-price">{fmtTry(amount)}<small>{period === 'yearly' ? ' / yıl' : ' / ay'}</small></span>
                          <span className="ck__plan-desc">{copy.desc}</span>
                        </label>
                      );
                    })}
                  </div>
                </Card>
              )}

              {!checkout ? (
                <Card title="2 · Fatura bilgileri" sub="Kart bilgilerinizi bir sonraki adımda PayTR güvenli ödeme sayfasında gireceksiniz.">
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
                    {!overview?.configured && (
                      <div className="bill-form__wide"><Notice tone="bad">Online ödeme altyapısı şu an etkin değil. Lütfen destek ekibimizle iletişime geçin.</Notice></div>
                    )}
                    <div className="bill-form__actions">
                      <button type="submit" className="dp-btn dp-btn--lime" disabled={submitting || !consent || !overview?.configured}>
                        <span>{submitting ? 'Hazırlanıyor...' : `Ödemeye geç · ${fmtTry(price)}`}</span>
                      </button>
                    </div>
                  </form>
                </Card>
              ) : (
                <Card
                  title="Kart bilgileri"
                  sub="Kart bilgileriniz PayTR güvenli ödeme sayfasında işlenir; zuuqrmenu tarafından görüntülenmez."
                  actions={<button type="button" className="dp-btn dp-btn--ghost" onClick={() => setCheckout(null)}><span>Geri dön</span></button>}
                >
                  <iframe ref={iframeRef} id="paytriframe" title="PayTR güvenli ödeme" src={checkout.iframeUrl} className="bill-frame" scrolling="no" />
                </Card>
              )}
            </div>

            <Card title="Sipariş özeti" className="bill-summary">
              <dl>
                <div><dt>Paket</dt><dd>{chosen.name}</dd></div>
                <div><dt>Dönem</dt><dd>{period === 'yearly' ? 'Yıllık (12 ay)' : 'Aylık'}</dd></div>
                {period === 'yearly' && saving > 0 && <div><dt>Yıllık tasarruf</dt><dd>{fmtTry(saving)}</dd></div>}
                <div className="bill-summary__total"><dt>Toplam (KDV dahil)</dt><dd>{fmtTry(price)}</dd></div>
              </dl>
              <ul className="ck__features">
                {(PLAN_COPY[chosen.id]?.features || []).map((feature) => <li key={feature}><Icon name="check" size={15} />{feature}</li>)}
              </ul>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Checkout;
