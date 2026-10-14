import AccountDialog from './AccountDialog';
import BillingPanel from './BillingPanel';

const SubscriptionModal = ({ onClose, onLoaded }) => (
  <AccountDialog kicker="Abonelik" title="Paketiniz ve ödemeler" wide onClose={onClose}>
    <div className="dp acc-dp">
      <BillingPanel compact onLoaded={onLoaded} />
    </div>
  </AccountDialog>
);

export default SubscriptionModal;
