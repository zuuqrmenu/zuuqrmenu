import { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import RestaurantLayout from '../components/RestaurantLayout';
import QrPrintDesigner from '../components/qr/QrPrintDesigner';
import { useAuth } from '../context/AuthContext';
import { restaurantSettingsService } from '../services/restaurantSettingsService';
import { getPublicMenuUrl } from '../utils/publicMenuUrl';
import { createQrSvg, qrOptions } from '../utils/qrCode';
import DashboardSkeleton from '../components/DashboardSkeleton';

const QrManagement = () => {
  const { user, restaurant } = useAuth();
  const canvasRef = useRef(null);
  const [settings, setSettings] = useState(null);
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const publicUrl = user?.username ? getPublicMenuUrl(user.username) : null;

  useEffect(() => {
    restaurantSettingsService.get()
      .then((data) => setSettings(data.settings))
      .catch((err) => setError(err.response?.data?.error || 'QR ayarları yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!publicUrl || !settings || !canvasRef.current) return undefined;
    let active = true;
    QRCode.toCanvas(canvasRef.current, publicUrl, qrOptions(settings.primaryColor), () => {});
    createQrSvg(publicUrl, settings.primaryColor).then((value) => active && setSvg(value));
    return () => { active = false; };
  }, [publicUrl, settings]);

  const showFeedback = (message) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2200);
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
      showFeedback('Kopyalandı');
    } catch {
      setError('URL kopyalanamadı.');
    }
  };

  const download = (format) => {
    if (!publicUrl || !canvasRef.current || !svg) return;
    const filename = `${restaurant.slug}-qr`;
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
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      pdf.setFontSize(22);
      pdf.text(restaurant.name, 105, 42, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('Menümüzü görmek için QR kodu okutun', 105, 52, { align: 'center' });
      pdf.addImage(canvasRef.current.toDataURL('image/png'), 'PNG', 45, 65, 120, 120);
      pdf.save(`${filename}.pdf`);
    }
    showFeedback(`${format.toUpperCase()} indirildi`);
  };

  return (
    <RestaurantLayout>
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-8">
        <section>
          <p className="text-sm font-medium text-emerald-600">QR Kod</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">QR Kodunuz</h2>
          <p className="mt-2 text-sm text-slate-500">Müşterileriniz bu QR kodu okutarak dijital menünüze ulaşabilir.</p>
        </section>

        {feedback && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        {loading ? (
          <DashboardSkeleton variant="panel" />
        ) : !publicUrl ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">Önce menü kullanıcı adınızı oluşturun.</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Public menü URL&apos;si</p>
              <div className="mt-3 flex items-center gap-2">
                <input readOnly value={publicUrl} className="field-input min-w-0 text-xs" />
                <button type="button" onClick={copyUrl} className="shrink-0 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Kopyala</button>
              </div>
              <p className="mt-3 text-xs text-slate-500">Bu QR kod, restoranınızın kalıcı public menü adresini içerir.</p>
              <div className="mt-8 flex flex-wrap gap-2">
                <button type="button" onClick={() => download('png')} className="download-button">PNG indir</button>
                <button type="button" onClick={() => download('svg')} className="download-button">SVG indir</button>
                <button type="button" onClick={() => download('pdf')} className="download-button">PDF indir</button>
              </div>
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Önizleme</p>
                <div className="mt-4 qr-card qr-card--compact">
                  <div className="qr-frame qr-frame--compact">
                    <canvas ref={canvasRef} aria-label="Restoran public menü QR kodu" />
                  </div>
                </div>
              </div>
            </section>
            <QrPrintDesigner
              restaurant={restaurant}
              settings={settings}
              publicUrl={publicUrl}
              qrSvg={svg}
              onDownloadPng={() => download('png')}
              onDownloadSvg={() => download('svg')}
              setFeedback={showFeedback}
            />
          </div>
        )}
      </div>
    </RestaurantLayout>
  );
};

export default QrManagement;
