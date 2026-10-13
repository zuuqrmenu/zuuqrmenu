import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from '../components/SeoHead';
import '../styles/auth.css';

const STATUS_COPY = {
  PENDING: {
    title: 'Başvurunuz inceleniyor',
    description: 'Başvurunuz alındı. Hesabınız onaylandığında e-posta ile bilgilendirileceksiniz; ardından menünüzü oluşturup paketinizi seçebilirsiniz.',
    label: 'İnceleniyor',
    icon: '…',
  },
  REJECTED: {
    title: 'Başvurunuz onaylanmadı',
    description: 'Bu restoran başvurusu şu anda yönetim paneline erişim sağlayamıyor. Daha fazla bilgi için bizimle iletişime geçin.',
    label: 'Reddedildi',
    icon: '!',
    bad: true,
  },
  SUSPENDED: {
    title: 'Hesabınız askıya alındı',
    description: 'Restoran hesabınız geçici olarak kullanıma kapatıldı. Yeniden aktifleştirildiğinde erişiminiz geri verilecektir.',
    label: 'Askıya alındı',
    icon: '!',
    bad: true,
  },
};

const PendingApproval = () => {
  const { user, restaurant, logout } = useAuth();
  const copy = STATUS_COPY[restaurant?.status] || STATUS_COPY.PENDING;

  return (
    <div className="reg-page reg-page--center">
      <SeoHead title="Başvuru Durumu | zuuqrmenu" description="zuuqrmenu restoran başvuru durumu." canonical="https://zuuqrmenu.com/pending-approval" robots="noindex,nofollow,noarchive" />
      <div className="reg-success">
        <Link to="/" className="reg-success__logo">
          <img src="/logo.svg" alt="zuuqrmenu" />
        </Link>
        <div className={`reg-success__badge ${copy.bad ? 'reg-success__badge--bad' : ''}`}>
          <span className="reg-success__icon" aria-hidden="true">{copy.icon}</span>
        </div>
        <h2>{copy.title}</h2>
        <p>{user?.name ? `Merhaba ${user.name}, ` : ''}{copy.description}</p>
        {restaurant?.name && <p className="reg-success__restaurant">{restaurant.name}</p>}
        <div className="reg-success__status">
          <span className={`reg-success__status-dot ${copy.bad ? 'reg-success__status-dot--bad' : ''}`} aria-hidden="true" />
          <span>Başvuru durumu: <strong>{copy.label}</strong></span>
        </div>
        <button type="button" className="reg-btn reg-btn--primary" onClick={logout}>Çıkış yap</button>
        <p className="reg-success__help">Sorunuz mu var? <Link to="/iletisim">Bize ulaşın</Link></p>
      </div>
    </div>
  );
};

export default PendingApproval;
