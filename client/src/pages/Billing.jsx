import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RestaurantLayout from '../components/RestaurantLayout';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { billingService } from '../services/billingService';
import { PLAN_COPY, checkoutPath, fmtTry } from '../data/billingPlans';
import { PageHeader, Card, Button, Segmented, Notice, Chip, Icon } from '../components/dashboard/ui';

const fmtDate = (value) => (value ? new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
const STATUS_TONE = { PAID: 'ok', PENDING: 'warn', FAILED: 'bad' };
const STATUS_LABEL = { PAID: 'Ödendi', PENDING: 'Bekliyor', FAILED: 'Başarısız' };

const Billing = () => {
  const [searchParams] = useSearchParams();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('yearly');
  const paid = searchParams.get('odeme') === 'basarili';

  useEffect(() => {
    billingService.getOverview()
      .then(setOverview)
      .catch((err) => setError(err.response?.data?.error || 'Abonelik bilgileri yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const plans = overview?.plans || [];
  const subscription = overview?.subscription;
  const active = subscription?.status === 'ACTIVE' && subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) > new Date();

  return (
    <RestaurantLayout>
      <div className="dp">
        <PageHeader
          kicker="Abonelik"
          title="Paketiniz ve ödemeler"
          lede="Paketinizi yükseltin, dönemi uzatın ve geçmiş ödemelerinizi görüntüleyin."
        />

        {paid && <Notice tone="ok">Ödemeniz alındı, aboneliğiniz etkinleştirildi. Teşekkürler!</Notice>}
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

            <div className="bill-period">
              <Segmented label="Faturalama dönemi" value={period} onChange={setPeriod} options={[['monthly', 'Aylık'], ['yearly', 'Yıllık']]} />
            </div>

            <div className="bill-plans">
              {plans.map((plan) => {
                const copy = PLAN_COPY[plan.id] || { features: [] };
                const price = period === 'yearly' ? plan.yearly : plan.monthly;
                const isCurrent = active && subscription.plan === plan.id;
                return (
                  <article key={plan.id} className={`bill-plan ${copy.featured ? 'is-featured' : ''}`}>
                    {copy.featured && <span className="bill-plan__badge">En popüler</span>}
                    <h3>{plan.name}</h3>
                    <p>{copy.desc}</p>
                    <p className="bill-plan__price"><b>{fmtTry(price)}</b><span>{period === 'yearly' ? '/ yıl' : '/ ay'}</span></p>
                    <ul>{copy.features.map((feature) => <li key={feature}><Icon name="check" size={15} />{feature}</li>)}</ul>
                    <Button to={checkoutPath(plan.id, period)} variant={copy.featured ? 'lime' : 'ghost'}>
                      {isCurrent ? 'Süreyi uzat' : 'Satın al'}
                    </Button>
                  </article>
                );
              })}
            </div>
            <p className="dp-card__sub">
              Çok şubeli işletmeler veya özel entegrasyon için <a href="https://www.zuuqrmenu.com/iletisim" target="_blank" rel="noopener noreferrer">Kurumsal paket için bize ulaşın</a>.
            </p>

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
