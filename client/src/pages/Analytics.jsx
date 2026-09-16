import { useEffect, useMemo, useState } from 'react';
import RestaurantLayout from '../components/RestaurantLayout';
import { analyticsService } from '../services/analyticsService';

const pad = (value) => String(value).padStart(2, '0');
const dateString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const rangeFromDays = (days) => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - days + 1); return { startDate: dateString(start), endDate: dateString(end) }; };
const formatDate = (value) => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`));

const InfoHint = ({ children }) => <span className="analytics-info" title={children} aria-label={children}>i</span>;
const Stat = ({ label, value, detail, hint }) => <article className="analytics-stat"><div><p>{label} {hint && <InfoHint>{hint}</InfoHint>}</p><strong>{value}</strong><small>{detail}</small></div></article>;
const BarList = ({ items, valueKey = 'count', empty = 'Henüz yeterli veri oluşmadı.' }) => { const max = Math.max(...items.map((item) => item[valueKey] || 0), 1); return items.length ? <div className="analytics-bar-list">{items.map((item) => <div className="analytics-bar-row" key={item.name || item.day || item.hour}><div className="analytics-bar-row__label"><span>{item.name || item.day || `${item.hour}:00–${item.hour + 1}:00`}</span><b>{item[valueKey] || 0}</b></div><span className="analytics-bar"><i style={{ width: `${((item[valueKey] || 0) / max) * 100}%` }} /></span></div>)}</div> : <p className="analytics-empty">{empty}</p>; };

const Analytics = () => {
  const [range, setRange] = useState('7');
  const [custom, setCustom] = useState(rangeFromDays(7));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);

  const selectedRange = useMemo(() => range === 'custom' ? custom : rangeFromDays(Number(range)), [range, custom]);
  useEffect(() => { setLoading(true); setError(''); analyticsService.getOverview(selectedRange).then(setData).catch((err) => setError(err.response?.data?.error || 'İstatistikler yüklenemedi.')).finally(() => setLoading(false)); }, [selectedRange]);

  const comparison = data?.summary?.comparison;
  const heatmapMax = Math.max(...(data?.heatmap || []).map((item) => item.count + item.interactions + item.categoryInteractions), 1);
  const hasData = (data?.summary?.views || 0) + (data?.summary?.productInteractions || 0) + (data?.summary?.categoryInteractions || 0) > 0;
  const maxViews = Math.max(...(data?.dailyViews || []).map((item) => item.count), 1);
  const heatmapSize = (data?.range?.days || 7) <= 7 ? 'comfortable' : (data?.range?.days || 7) <= 30 ? 'compact' : 'dense';
  const activeDay = selectedDay || data?.heatmap?.at(-1);

  return (
    <RestaurantLayout>
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        <header className="analytics-header"><div><p className="text-sm font-medium text-emerald-600">İstatistikler</p><h2>Menünüz nasıl gidiyor?</h2><p>Menü ziyaretlerini ve müşterilerinizin ilgisini sade bir görünümde takip edin.</p></div><div className="analytics-range">{[['1', 'Bugün'], ['7', 'Son 7 Gün'], ['30', 'Son 30 Gün'], ['90', 'Son 90 Gün'], ['custom', 'Tarih Seç']].map(([value, label]) => <button type="button" key={value} className={range === value ? 'is-active' : ''} onClick={() => setRange(value)}>{label}</button>)}</div></header>
        {range === 'custom' && <div className="analytics-custom-range"><label>Başlangıç<input type="date" value={custom.startDate} onChange={(event) => setCustom((current) => ({ ...current, startDate: event.target.value }))} /></label><label>Bitiş<input type="date" value={custom.endDate} onChange={(event) => setCustom((current) => ({ ...current, endDate: event.target.value }))} /></label></div>}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {loading ? <div className="analytics-loading"><span /><span /><span /></div> : <>
          {!hasData && <div className="analytics-empty-state"><h3>Henüz yeterli veri oluşmadı.</h3><p>Menünüz ziyaret edilmeye başladıkça burada görüntülenme ve etkileşim istatistiklerini görebileceksiniz.</p></div>}
          <section className="analytics-stat-grid"><Stat label="Menü Görüntülenmeleri" value={data?.summary?.views || 0} detail={comparison === null ? 'Önceki dönem için yeterli veri yok' : `${comparison >= 0 ? '+' : ''}${comparison}% önceki döneme göre`} hint="Menünüzün ziyaretçiler tarafından açılma sayısı." /><Stat label="Ürün Etkileşimleri" value={data?.summary?.productInteractions || 0} detail="Ürün detaylarının açılması" hint="Müşterilerin ürün detaylarını açma ve ürünlere tıklama etkileşimleri." /><Stat label="Kategori Etkileşimleri" value={data?.summary?.categoryInteractions || 0} detail="Kategori seçimleri" /><Stat label="En Çok İlgi Gören Ürün" value={data?.summary?.topProduct?.name || '-'} detail={data?.summary?.topProduct ? `${data.summary.topProduct.count} görüntülenme` : 'Henüz veri yok'} hint="Bu veriler satış adedi değildir." /><Stat label="En Çok İlgi Gören Kategori" value={data?.summary?.topCategory?.name || '-'} detail={data?.summary?.topCategory ? `${data.summary.topCategory.count} seçim` : 'Henüz veri yok'} /><Stat label="En Yoğun Saat" value={data?.summary?.busiestHour ? `${data.summary.busiestHour.hour}:00–${data.summary.busiestHour.hour + 1}:00` : '-'} detail={data?.summary?.busiestHour ? `${data.summary.busiestHour.count} aktivite` : 'Henüz veri yok'} /></section>
          <section className="analytics-main-grid"><article className="analytics-panel analytics-line-panel"><div className="analytics-panel__heading"><div><p className="analytics-eyebrow">Nasıl gidiyor?</p><h3>Menü Görüntülenmeleri</h3></div><small>{data?.range?.days} günlük dönem</small></div><div className="analytics-line-chart">{(data?.dailyViews || []).map((item) => <div className="analytics-line-point" key={item.date} title={`${formatDate(item.date)}: ${item.count}`}><i style={{ height: `${Math.max((item.count / maxViews) * 100, 3)}%` }} /><small>{formatDate(item.date)}</small></div>)}</div>{!data?.summary?.views && <p className="analytics-empty">Bu tarih aralığında henüz görüntülenme yok.</p>}</article><article className="analytics-panel"><div className="analytics-panel__heading"><div><p className="analytics-eyebrow">Günlük ritim</p><h3>Aktivite yoğunluğu</h3></div><small>Az → Çok</small></div><div className={`analytics-heatmap analytics-heatmap--${heatmapSize}`}>{(data?.heatmap || []).map((item) => { const intensity = (item.count + item.interactions + item.categoryInteractions) / heatmapMax; return <button type="button" key={item.date} className={activeDay?.date === item.date ? 'is-selected' : ''} onClick={() => setSelectedDay(item)} title={`${formatDate(item.date)}\n${item.count} menü görüntülenmesi\n${item.interactions} ürün etkileşimi\n${item.categoryInteractions} kategori etkileşimi`} style={{ opacity: intensity ? .2 + intensity * .8 : .12 }} aria-label={`${formatDate(item.date)} aktivitesi`} />; })}</div><div className="analytics-legend"><span>Az</span><i /><i /><i /><i /><span>Çok</span></div>{activeDay && <div className="analytics-day-detail"><b>{formatDate(activeDay.date)}</b><span>{activeDay.count} Menü Görüntülenmesi</span><span>{activeDay.interactions} Ürün Etkileşimi</span><span>{activeDay.categoryInteractions} Kategori Etkileşimi</span></div>}</article></section>
          <section className="analytics-two-column"><article className="analytics-panel"><div className="analytics-panel__heading"><div><p className="analytics-eyebrow">Müşteriler neyle ilgileniyor?</p><h3>En Çok İlgi Gören Ürünler</h3></div></div><BarList items={data?.topProducts || []} /><p className="analytics-footnote">Bu veriler satış adedi değil, ürün görüntülenmeleridir.</p></article><article className="analytics-panel"><div className="analytics-panel__heading"><div><p className="analytics-eyebrow">Kategori ilgisi</p><h3>En Çok İlgi Gören Kategoriler</h3></div></div><BarList items={data?.topCategories || []} /></article></section>
          <section className="analytics-two-column"><article className="analytics-panel"><div className="analytics-panel__heading"><div><p className="analytics-eyebrow">Daha fazla bilgi</p><h3>En Yoğun Günler</h3></div></div><BarList items={data?.busiestDays || []} /></article><article className="analytics-panel"><div className="analytics-panel__heading"><div><p className="analytics-eyebrow">Daha fazla bilgi</p><h3>En Yoğun Saatler</h3></div></div><BarList items={data?.busiestHours || []} /></article></section>
        </>}
      </div>
    </RestaurantLayout>
  );
};

export default Analytics;
