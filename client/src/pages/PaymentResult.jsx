import { getPanelUrl } from '../utils/domainHelpers';
import '../styles/dashboard-pages.css';

// Rendered inside PayTR's iframe after a payment attempt. It has no auth and no layout chrome on purpose.
const PaymentResult = () => {
  const success = new URLSearchParams(window.location.search).get('durum') === 'basarili';
  const panelUrl = getPanelUrl('/dashboard/billing');

  return (
    <main className="pay-result" data-state={success ? 'ok' : 'fail'}>
      <span className="pay-result__icon" aria-hidden="true">{success ? '✓' : '!'}</span>
      <h1>{success ? 'Ödemeniz alındı' : 'Ödeme tamamlanamadı'}</h1>
      <p>
        {success
          ? 'Aboneliğiniz birkaç saniye içinde etkinleşir. Panele dönerek paket durumunuzu görebilirsiniz.'
          : 'Kartınızdan çekim yapılmadı. Bilgilerinizi kontrol edip tekrar deneyebilirsiniz.'}
      </p>
      <a className="pay-result__btn" href={panelUrl} target="_top">Panele dön</a>
    </main>
  );
};

export default PaymentResult;
