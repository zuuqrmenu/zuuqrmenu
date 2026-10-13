import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import RestaurantLayout from '../components/RestaurantLayout';
import { useAuth } from '../context/AuthContext';
import { restaurantSettingsService } from '../services/restaurantSettingsService';
import { getPublicMenuUrl } from '../utils/publicMenuUrl';
import { createQrSvg, qrOptions } from '../utils/qrCode';
import DashboardSkeleton from '../components/DashboardSkeleton';
import QrPrintDesigner from '../components/qr/QrPrintDesigner';
import { PageHeader, Card, Button, Segmented, EmptyState, Notice, Icon } from '../components/dashboard/ui';

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
      <div className="dp">
        <PageHeader
          kicker="QR kod"
          title="Menünüz için QR kod"
          lede="Müşterileriniz bu kodu okutarak dijital menünüze ulaşır. İndirin, basın, masalara koyun."
          actions={(
            <Segmented
              label="QR bölümü"
              value={activeTab}
              onChange={setActiveTab}
              options={[['simple', 'Menü QR kodu'], ['stand', 'Masa standı']]}
            />
          )}
        />

        {feedback && <Notice tone="ok">{feedback}</Notice>}
        {error && <Notice tone="bad">{error}</Notice>}

        {loading ? (
          <DashboardSkeleton variant="qr" />
        ) : !publicUrl ? (
          <EmptyState title="Önce menü adresinizi oluşturun" text="QR kod, menü adresinizden üretilir. Genel bakış sayfasından adresinizi oluşturabilirsiniz." action={<Button to="/dashboard" variant="lime">Genel bakışa git</Button>} />
        ) : (
          <>
            <div className={activeTab === 'simple' ? 'dp-grid dp-grid--qr' : 'hidden'}>
              {/* QR itself */}
              <Card className="dp-qr">
                <div className="dp-qr__stage">
                  <div className="dp-qr__frame">
                    <canvas
                      ref={(node) => {
                        canvasRef.current = node;
                        if (node && publicUrl && settings) {
                          QRCode.toCanvas(node, publicUrl, qrOptions(settings.primaryColor), () => {});
                        }
                      }}
                      aria-label="Restoran menü QR kodu"
                    />
                  </div>
                  <p className="dp-qr__name">{restaurant?.name || 'Menümüz'}</p>
                  <p className="dp-qr__sub">Menüyü görmek için kameranızla okutun</p>
                </div>

                <div className="dp-downloads" role="group" aria-label="QR kodunu indir">
                  <button type="button" className="dp-download" onClick={() => download('png')}>
                    <Icon name="download" size={20} />
                    <b>PNG</b>
                    <small>Sosyal medya ve ekranlar</small>
                  </button>
                  <button type="button" className="dp-download" onClick={() => download('svg')}>
                    <Icon name="download" size={20} />
                    <b>SVG</b>
                    <small>Matbaa ve büyük baskı</small>
                  </button>
                  <button type="button" className="dp-download" onClick={() => download('pdf')}>
                    <Icon name="print" size={20} />
                    <b>PDF</b>
                    <small>A4, hemen yazdırın</small>
                  </button>
                </div>
              </Card>

              {/* Right column */}
              <div className="dp-stack">
                <Card title="Menü adresiniz" sub="QR kodun açtığı kalıcı bağlantı. Menüyü güncellediğinizde adres değişmez.">
                  <div className="dp-link">
                    <code title={publicUrl}>{publicUrl.replace(/^https?:\/\//, '')}</code>
                    <button type="button" className="dp-btn dp-btn--sm" onClick={copyUrl}><Icon name="copy" size={15} /><span>Kopyala</span></button>
                  </div>
                  <Button href={publicUrl} variant="ghost" icon="external">Menüyü aç</Button>
                </Card>

                <Card title="Masa standı hazırlayın" sub="Akrilik stand için hazır şablonlar: renk, düzen ve boyutu seçin, PDF olarak indirin.">
                  <Button variant="lime" icon="print" onClick={() => setActiveTab('stand')}>Şablonlara geç</Button>
                </Card>

                <Card title="Nasıl kullanılır?">
                  <ol className="dp-steps">
                    <li><span>1</span><div><b>Yazdırın</b><p>SVG ya da PDF dosyasını A5/A6 boyutunda basın.</p></div></li>
                    <li><span>2</span><div><b>Masalara koyun</b><p>Stand, çerçeve veya yapışkanla göz hizasına yerleştirin.</p></div></li>
                    <li><span>3</span><div><b>Her yerde paylaşın</b><p>Menü adresini Instagram ve Google İşletme profilinize ekleyin.</p></div></li>
                  </ol>
                </Card>

                <a className="dp-promo" href="https://www.kisaltici.com/" target="_blank" rel="noopener noreferrer">
                  <img src="/KSLT_FAVICON.png" alt="" width="40" height="40" />
                  <span><b>Logolu QR ve link analizi mi lazım?</b><small>Kısaltıcı ile özel QR kodları oluşturun ve tıklamaları izleyin.</small></span>
                  <Icon name="external" size={16} />
                </a>
              </div>
            </div>

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
