import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import RestaurantLayout from '../components/RestaurantLayout';
import { useAuth } from '../context/AuthContext';
import { restaurantSettingsService } from '../services/restaurantSettingsService';
import { getPublicMenuUrl } from '../utils/publicMenuUrl';
import { createQrSvg, qrOptions } from '../utils/qrCode';
import DashboardSkeleton from '../components/DashboardSkeleton';
import QrPrintDesigner from '../components/qr/QrPrintDesigner';

const QrManagement = () => {
  const { user, restaurant } = useAuth();
  const canvasRef = useRef(null);
  const [settings, setSettings] = useState(null);
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('simple'); // 'simple' | 'stand'
  const publicUrl = user?.username ? getPublicMenuUrl(user.username) : null;

  useEffect(() => {
    restaurantSettingsService.get()
      .then((data) => setSettings(data.settings))
      .catch((err) => setError(err.response?.data?.error || 'QR ayarları yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!publicUrl || !settings) return undefined;
    let active = true;
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, publicUrl, qrOptions(settings.primaryColor), () => {});
    }
    createQrSvg(publicUrl, settings.primaryColor).then((value) => active && setSvg(value));
    return () => { active = false; };
  }, [publicUrl, settings, activeTab]);

  const showFeedback = (message) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 3500);
  };

  const copyUrl = async () => {
    if (!publicUrl) return setError('Önce menü kullanıcı adınızı oluşturun.');
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(publicUrl);
      else {
        const input = document.createElement('textarea');
        input.value = publicUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      showFeedback('Menü adresi kopyalandı');
    } catch {
      setError('URL kopyalanamadı.');
    }
  };

  const download = async (format) => {
    if (!publicUrl || !canvasRef.current || !svg) return;
    const filename = `${restaurant?.slug || 'restoran'}-qr`;
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    } else if (format === 'svg') {
      const link = document.createElement('a');
      link.download = `${filename}.svg`;
      link.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      link.click();
    } else {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      pdf.setFontSize(22);
      pdf.text(restaurant?.name || 'Menümüz', 105, 42, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('Menümüzü görmek için QR kodu okutun', 105, 52, { align: 'center' });
      pdf.addImage(canvasRef.current.toDataURL('image/png'), 'PNG', 45, 65, 120, 120);
      pdf.save(`${filename}.pdf`);
    }
    showFeedback(`${format.toUpperCase()} formatında indirildi`);
  };

  return (
    <RestaurantLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8">
        {/* Page Header */}
        <section className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-emerald-600">QR Kod</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Menü QR Kodunuz</h2>
          <p className="mt-1 text-sm text-slate-500">
            Müşterileriniz bu QR kodu okutarak dijital menünüze ulaşabilir.
          </p>
        </section>

        {/* View Switcher Tabs: Direct QR vs Table Stand Designer */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="qr-page-tabs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('simple')}
              className={`qr-page-tab ${activeTab === 'simple' ? 'is-active' : ''}`}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 7h.01" />
                <path d="M17 7h.01" />
                <path d="M7 17h.01" />
                <path d="M17 17h.01" />
              </svg>
              <span>Menü QR Kodu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stand')}
              className={`qr-page-tab ${activeTab === 'stand' ? 'is-active' : ''}`}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V2h12v7" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 14h12v8H6z" />
              </svg>
              <span className="hidden sm:inline">Masa Standı & Baskı Şablonları</span>
              <span className="sm:hidden">Masa Standı</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {feedback}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <DashboardSkeleton variant="panel" />
        ) : !publicUrl ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Önce menü kullanıcı adınızı oluşturun.
          </div>
        ) : (
          <>
            {/* Tab 1: Direct QR Code Hub */}
            <div className={activeTab === 'simple' ? 'block' : 'hidden'}>
              <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Left Column: QR Code Display & Quick Downloads */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Public Menu URL Card */}
              <div className="qr-direct-card">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <h3 className="text-sm font-bold text-slate-900">Public Menü Bağlantısı</h3>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    <span>Menüyü Aç</span>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <input readOnly value={publicUrl} className="field-input min-w-0 text-xs font-mono" />
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Kopyala</span>
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Bu bağlantı, müşterilerinizin cep telefonundan tarayıcıyla açacağı kalıcı dijital menü adresinizdir.
                </p>
              </div>

              {/* Direct QR Code Display & Quick Download */}
              <div className="qr-direct-card">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Menü QR Kodunuz</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Yüksek çözünürlüklü dijital menü QR kodu</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    Aktif
                  </span>
                </div>

                {/* QR Code Presentation Box (190px - clean, clear contrast, white background) */}
                <div className="qr-direct-preview-zone">
                  <div className="qr-direct-frame">
                    <canvas
                      ref={(node) => {
                        canvasRef.current = node;
                        if (node && publicUrl && settings) {
                          QRCode.toCanvas(node, publicUrl, qrOptions(settings.primaryColor), () => {});
                        }
                      }}
                      aria-label="Restoran public menü QR kodu"
                    />
                  </div>
                  <div className="qr-direct-caption">
                    <p className="qr-direct-name">{restaurant?.name || 'Menümüz'}</p>
                    <p className="qr-direct-sub">Menüyü görüntülemek için kameranızla tarayın</p>
                  </div>
                </div>

                {/* Direct Download Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 mb-2.5">QR Kodunu İndir:</p>
                  <div className="qr-download-grid">
                    <button
                      type="button"
                      onClick={() => download('png')}
                      className="qr-download-btn"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span className="qr-download-btn-title">PNG İndir</span>
                      <span className="qr-download-btn-sub">Görsel / Dijital</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => download('svg')}
                      className="qr-download-btn"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                      </svg>
                      <span className="qr-download-btn-title">SVG İndir</span>
                      <span className="qr-download-btn-sub">Vektörel Baskı</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => download('pdf')}
                      className="qr-download-btn"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      <span className="qr-download-btn-title">PDF İndir</span>
                      <span className="qr-download-btn-sub">A4 Yazdırılabilir</span>
                    </button>
                  </div>
                </div>

                {/* Table Stand Recommendation Callout */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-600">
                    Masalarınıza koymak için hazır akrilik stand baskısı mı istiyorsunuz?
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('stand')}
                    className="shrink-0 font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <span>Stand Şablonlarına Geç</span>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Kısaltıcı Promo & Tips */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Kısaltıcı Natural Promo Card (High contrast, guaranteed readable) */}
              <div className="kisaltici-promo-box">
                <div className="kisaltici-promo-box__header">
                  <div className="kisaltici-promo-box__icon-wrap">
                    <img src="/KSLT_FAVICON.png" alt="Kısaltıcı Logo" className="kisaltici-promo-box__icon" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="kisaltici-promo-box__tag">
                      GELİŞMİŞ QR & LİNK YÖNETİMİ
                    </span>
                    <h4 className="kisaltici-promo-box__title">
                      Daha fazla QR Kod özelleştirmesi için Kısaltıcı&apos;yı Deneyin
                    </h4>
                  </div>
                </div>

                <p className="kisaltici-promo-box__desc">
                  Özel logolu QR kodlar, dinamik link kısaltma ve detaylı tıklama analizleri için Kısaltıcı platformumuzu ücretsiz deneyin.
                </p>

                <div className="kisaltici-promo-box__features">
                  <div className="kisaltici-promo-box__feature-item">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>Logolu ve Renkli QR Kod Oluşturma</span>
                  </div>
                  <div className="kisaltici-promo-box__feature-item">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>Dinamik Link Kısaltma (URL Shortener)</span>
                  </div>
                  <div className="kisaltici-promo-box__feature-item">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>Detaylı Tarama & Tıklama İstatistikleri</span>
                  </div>
                </div>

                <a
                  href="https://www.kisaltici.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kisaltici-promo-box__btn"
                >
                  <span>Kısaltıcı&apos;yı Keşfet</span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>

              {/* Usage Tips Card */}
              <div className="qr-tips-box">
                <h4 className="qr-tips-box__title">
                  💡 Hızlı Kullanım İpuçları
                </h4>
                <ul className="qr-tips-box__list">
                  <li>
                    <span>•</span>
                    <span><strong>Masa Standları:</strong> QR kodunuzu A5 veya A6 boyutunda basıp akrilik masa standlarına yerleştirerek müşterilerinizin kolayca okutmasını sağlayın.</span>
                  </li>
                  <li>
                    <span>•</span>
                    <span><strong>Baskı Kalitesi:</strong> Profesyonel matbaa ve reklamcı baskıları için vektörel <strong>SVG</strong> formatını kullanmanız önerilir.</span>
                  </li>
                  <li>
                    <span>•</span>
                    <span><strong>Sosyal Medya:</strong> Menü linkinizi Instagram veya Google İşletme profilinize ekleyerek menünüzü online olarak da paylaşabilirsiniz.</span>
                  </li>
                </ul>
                </div>
              </div>
            </div>
          </div>

            {/* Tab 2: Customizable Table Stand Print Designer */}
            <div className={activeTab === 'stand' ? 'block' : 'hidden'}>
              <QrPrintDesigner
                restaurant={restaurant}
                settings={settings}
                publicUrl={publicUrl}
                qrSvg={svg}
                canvasRef={canvasRef}
                setFeedback={showFeedback}
              />
            </div>
          </>
        )}
      </div>
    </RestaurantLayout>
  );
};

export default QrManagement;
