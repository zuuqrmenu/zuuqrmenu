import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { billingService } from '../services/billingService';
import { fmtTry } from '../data/billingPlans';
import { Card, Icon } from '../components/dashboard/ui';

const REDIRECT_SECONDS = 10;
const fmtDate = (value) => (value ? new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');

/** Shown right after a successful payment, then hands the user back to the dashboard. */
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const merchantOid = searchParams.get('oid');
  const [order, setOrder] = useState(null);
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (!merchantOid) return;
    billingService.getOrder(merchantOid).then((data) => setOrder(data.order)).catch(() => {});
  }, [merchantOid]);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (seconds <= 0) navigate('/dashboard', { replace: true });
  }, [seconds, navigate]);

  return (
    <div className="ck">
      <SeoHead title="Ödeme Başarılı | zuuqrmenu" description="Ödemeniz alındı." canonical="https://panel.zuuqrmenu.com/dashboard/odeme-basarili" robots="noindex,nofollow,noarchive" />
      <header className="ck__bar">
        <span className="ck__brand">zuuqrmenu</span>
      </header>
      <main className="ck__main dp ck__success">
        <span className="ck__success-icon" aria-hidden="true"><Icon name="check" size={34} /></span>
        <h1 className="ck__title">Ödemeniz alındı</h1>
        <p className="dp-card__sub">Aboneliğiniz etkinleştirildi. Teşekkür ederiz!</p>

        {order && (
          <Card className="ck__success-card">
            <dl className="bill-summary">
              <div><dt>Paket</dt><dd>{order.planName}</dd></div>
              <div><dt>Dönem</dt><dd>{order.period === 'yearly' ? 'Yıllık' : 'Aylık'}</dd></div>
              <div><dt>Ödenen tutar</dt><dd>{fmtTry(order.amount)}</dd></div>
              <div><dt>Abonelik bitişi</dt><dd>{fmtDate(order.periodEnd)}</dd></div>
              <div><dt>Sipariş no</dt><dd>{order.merchantOid}</dd></div>
            </dl>
          </Card>
        )}

        <Link to="/dashboard" replace className="dp-btn dp-btn--lime"><span>Panele git</span></Link>
        <p className="dp-card__sub">{Math.max(seconds, 0)} saniye içinde panele yönlendirileceksiniz.</p>
      </main>
    </div>
  );
};

export default PaymentSuccess;
