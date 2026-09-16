import { useAuth } from '../context/AuthContext';

const PendingApproval = () => {
  const { user, restaurant, logout } = useAuth();
  const statusMessages = {
    PENDING: {
      title: 'Başvurunuz İnceleniyor',
      description: 'Başvurunuz başarıyla alındı. Hesabınızın incelenmesi için bekliyoruz.',
      notice: 'Hesabınız onaylandığında menünüzü yönetmeye başlayabilirsiniz.',
    },
    REJECTED: {
      title: 'Başvurunuz Reddedildi',
      description: 'Bu restoran başvurusu şu anda yönetim paneline erişim sağlayamıyor.',
      notice: 'Daha fazla bilgi için zuuqrmenu yöneticinizle iletişime geçin.',
    },
    SUSPENDED: {
      title: 'Hesabınız Askıya Alındı',
      description: 'Restoran hesabınız geçici olarak kullanıma kapatıldı.',
      notice: 'Hesabınız yeniden aktifleştirildiğinde erişiminiz geri verilecektir.',
    },
  };
  const currentStatus = statusMessages[restaurant?.status] || statusMessages.PENDING;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{currentStatus.title}</h2>

          <p className="text-gray-600 mb-6">
            Merhaba {user?.name}, {currentStatus.description}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Restoran:</strong> {restaurant?.name}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Durum:</strong> {restaurant?.status === 'PENDING' ? 'Onay bekliyor' : restaurant?.status === 'REJECTED' ? 'Reddedildi' : 'Askıya alındı'}
            </p>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            {currentStatus.notice}
          </p>

          <button
            onClick={logout}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
