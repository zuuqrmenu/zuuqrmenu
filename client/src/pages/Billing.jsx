import { useSearchParams } from 'react-router-dom';
import RestaurantLayout from '../components/RestaurantLayout';
import BillingPanel from '../components/account/BillingPanel';
import { PageHeader } from '../components/dashboard/ui';

const Billing = () => {
  const [searchParams] = useSearchParams();
  const paid = searchParams.get('odeme') === 'basarili';

  return (
    <RestaurantLayout>
      <div className="dp">
        <PageHeader
          kicker="Abonelik"
          title="Paketiniz ve ödemeler"
          lede="Paketinizi yükseltin, dönemi uzatın ve geçmiş ödemelerinizi görüntüleyin."
        />
        <BillingPanel paid={paid} />
      </div>
    </RestaurantLayout>
  );
};

export default Billing;
