import { useMemo, useState } from 'react';
import {
  DESIGN_STYLES,
  PAPER_SIZES,
  buildPaperRatio,
  buildPrintPreviewConfig,
  exportQrPrintPdf,
  getCompatibleLayouts,
  getDefaultLayout,
  getDefaultPaperSize,
  getLayoutSupportLabel,
  isLogoAvailable,
} from '../../utils/qrPrintDesigner';
import { trackEvent } from '../../utils/analytics';

const LAYOUT_TITLES = {
  A: 'Üst Logo & QR',
  B: 'Ortalanmış Düzen',
  C: 'Yan Yana Düzen',
  D: 'Büyük QR Vurgulu',
  E: 'Minimal Alt Bilgi',
};

const PAPER_DETAILS = {
  A4: { desc: 'Tam Menü Boyutu', isRecommended: false },
  A5: { desc: 'Masa Standı (Önerilen)', isRecommended: true },
  A6: { desc: 'Kompakt Kart', isRecommended: false },
  A7: { desc: 'Mini Stand', isRecommended: false },
};

const STYLE_DETAILS = {
  Minimal: { label: 'Minimal', desc: 'Sade & Net' },
  Modern: { label: 'Modern', desc: 'Canlı & Çağdaş' },
  Elegant: { label: 'Zarif', desc: 'Sıcak & Klasik' },
  Bold: { label: 'Vurgulu', desc: 'Güçlü & Kontrast' },
};

const QRPreview = ({ qrSvg, restaurant, settings, paperId, styleId, layoutId }) => {
  const config = useMemo(
    () => buildPrintPreviewConfig({ restaurant, settings, paperId, styleId, layoutId }),
    [restaurant, settings, paperId, styleId, layoutId]
  );
  const { paper, style, layout, primary, secondary, brandText } = config;
  const logoAvailable = isLogoAvailable(settings);

  const renderLogo = () => {
    if (logoAvailable) {
      return <img src={settings.logo} alt={`${brandText} logo`} className="qr-print-sheet__logo-image" />;
    }

    return (
      <div className="qr-print-sheet__initial" style={{ background: primary, color: secondary }}>
        {brandText?.trim()?.charAt(0)?.toUpperCase() || 'R'}
      </div>
    );
  };

  const template = (() => {
    switch (layout.id) {
      case 'B':
        return (
          <div className="qr-print-layout qr-print-layout--center">
            <div className="qr-print-layout__brand qr-print-layout__brand--centered">
              {renderLogo()}
              <div className="qr-print-layout__name" style={{ color: style.text }}>{brandText}</div>
            </div>
            <div className="qr-print-layout__qr-frame" style={{ borderColor: style.accent }}>
              <div className="qr-print-layout__qr-svg" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            </div>
            <div className="qr-print-layout__cta" style={{ color: primary }}>{layout.headline}</div>
            <div className="qr-print-layout__supporting" style={{ color: style.muted }}>{layout.supporting}</div>
          </div>
        );
      case 'C':
        return (
          <div className="qr-print-layout qr-print-layout--side-by-side">
            <div className="qr-print-layout__content-block">
              <div className="qr-print-layout__logo-row">{renderLogo()}</div>
              <div className="qr-print-layout__name" style={{ color: style.text }}>{brandText}</div>
              <div className="qr-print-layout__cta" style={{ color: primary }}>{layout.headline}</div>
              <div className="qr-print-layout__supporting" style={{ color: style.muted }}>{layout.supporting}</div>
            </div>
            <div className="qr-print-layout__qr-frame qr-print-layout__qr-frame--side" style={{ borderColor: style.accent }}>
              <div className="qr-print-layout__qr-svg" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            </div>
          </div>
        );
      case 'D':
        return (
          <div className="qr-print-layout qr-print-layout--large-qr">
            <div className="qr-print-layout__brand">
              {renderLogo()}
              <div className="qr-print-layout__name" style={{ color: style.text }}>{brandText}</div>
            </div>
            <div className="qr-print-layout__cta qr-print-layout__cta--large" style={{ color: primary }}>{layout.headline}</div>
            <div className="qr-print-layout__qr-frame qr-print-layout__qr-frame--large" style={{ borderColor: style.accent }}>
              <div className="qr-print-layout__qr-svg" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            </div>
            <div className="qr-print-layout__supporting" style={{ color: style.muted }}>{layout.supporting}</div>
          </div>
        );
      case 'E':
        return (
          <div className="qr-print-layout qr-print-layout--bottom-info">
            <div className="qr-print-layout__brand">{renderLogo()}</div>
            <div className="qr-print-layout__qr-frame" style={{ borderColor: style.accent }}>
              <div className="qr-print-layout__qr-svg" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            </div>
            <div className="qr-print-layout__name" style={{ color: style.text }}>{brandText}</div>
            <div className="qr-print-layout__supporting" style={{ color: style.muted }}>{layout.supporting}</div>
          </div>
        );
      case 'A':
      default:
        return (
          <div className="qr-print-layout qr-print-layout--stacked">
            <div className="qr-print-layout__brand">{renderLogo()}</div>
            <div className="qr-print-layout__name" style={{ color: style.text }}>{brandText}</div>
            <div className="qr-print-layout__cta" style={{ color: primary }}>{layout.headline}</div>
            <div className="qr-print-layout__qr-frame" style={{ borderColor: style.accent }}>
              <div className="qr-print-layout__qr-svg" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            </div>
            <div className="qr-print-layout__supporting" style={{ color: style.muted }}>{layout.supporting}</div>
          </div>
        );
    }
  })();

  return (
    <div className="qr-print-paper" style={{ aspectRatio: buildPaperRatio(paperId) }}>
      <div className="qr-print-sheet" data-style={style.id} style={{ background: style.background, borderColor: style.accent, color: style.text }}>
        <div className="qr-print-sheet__header" style={{ background: primary, color: secondary }}>
          <span>Masa Standı</span>
          <span>{paper.label} · {paper.width}×{paper.height}mm</span>
        </div>
        {template}
      </div>
    </div>
  );
};

const QrPrintDesigner = ({
  restaurant,
  settings,
  qrSvg,
  setFeedback,
}) => {
  const paperOptions = Object.values(PAPER_SIZES);
  const styleOptions = Object.values(DESIGN_STYLES);
  const [paperId, setPaperId] = useState(getDefaultPaperSize());
  const [styleId, setStyleId] = useState('Minimal');
  const [layoutId, setLayoutId] = useState(getDefaultLayout(getDefaultPaperSize()));
  const [isExporting, setIsExporting] = useState(false);

  const availableLayouts = useMemo(() => getCompatibleLayouts(paperId), [paperId]);
  const activeLayoutId = availableLayouts.some((layout) => layout.id === layoutId)
    ? layoutId
    : getDefaultLayout(paperId);

  const handlePdfDownload = async () => {
    if (!qrSvg || isExporting) return;
    setIsExporting(true);
    try {
      await exportQrPrintPdf({
        restaurant,
        settings,
        qrSvg,
        paperId,
        styleId,
        layoutId: activeLayoutId,
      });
      trackEvent('download_table_stand_pdf', { paper_size: paperId, style: styleId, layout: activeLayoutId });
      setFeedback?.('Baskıya hazır masa standı PDF dosyası indirildi!');
    } catch {
      setFeedback?.('PDF oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="qr-stand-shell">
      <div className="qr-stand-layout">
        {/* Left Column: Customization Controls */}
        <div className="qr-stand-controls">
          {/* Section 1: Paper Size Selection */}
          <div className="qr-stand-card">
            <div className="qr-stand-card__header">
              <div>
                <h3 className="qr-stand-card__title">Kağıt & Stand Boyutu</h3>
                <p className="qr-stand-card__subtitle">Kullanacağınız pleksi stand veya menü ölçüsü</p>
              </div>
              <span className="qr-stand-card__badge">{PAPER_SIZES[paperId]?.width} × {PAPER_SIZES[paperId]?.height} mm</span>
            </div>

            <div className="qr-paper-grid">
              {paperOptions.map((paper) => {
                const isSelected = paper.id === paperId;
                const detail = PAPER_DETAILS[paper.id] || { desc: '', isRecommended: false };
                return (
                  <button
                    key={paper.id}
                    type="button"
                    onClick={() => setPaperId(paper.id)}
                    className={`qr-paper-card ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div className="qr-paper-card__top">
                      <span className="qr-paper-card__label">{paper.label}</span>
                      {detail.isRecommended && (
                        <span className="qr-paper-card__recommended">Önerilen</span>
                      )}
                    </div>
                    <span className="qr-paper-card__desc">{detail.desc}</span>
                    <span className="qr-paper-card__dims">{paper.width} × {paper.height} mm</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Design Style Selection */}
          <div className="qr-stand-card">
            <div className="qr-stand-card__header">
              <div>
                <h3 className="qr-stand-card__title">Tasarım Stili & Renkler</h3>
                <p className="qr-stand-card__subtitle">Masa standınızın görsel teması</p>
              </div>
            </div>

            <div className="qr-style-grid">
              {styleOptions.map((style) => {
                const isSelected = style.id === styleId;
                const detail = STYLE_DETAILS[style.id] || { label: style.name, desc: '' };
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setStyleId(style.id)}
                    className={`qr-style-card ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div className="qr-style-card__preview" style={{ background: style.background, borderColor: style.accent }}>
                      <span className="qr-style-card__dot" style={{ background: style.primary }} />
                      <span className="qr-style-card__bar" style={{ background: style.text }} />
                    </div>
                    <div className="qr-style-card__text">
                      <span className="qr-style-card__name">{detail.label}</span>
                      <span className="qr-style-card__desc">{detail.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Layout Arrangement */}
          <div className="qr-stand-card">
            <div className="qr-stand-card__header">
              <div>
                <h3 className="qr-stand-card__title">Yerleşim Şablonu</h3>
                <p className="qr-stand-card__subtitle">{getLayoutSupportLabel(paperId)}</p>
              </div>
            </div>

            <div className="qr-layout-grid">
              {availableLayouts.map((layout) => {
                const isSelected = layout.id === activeLayoutId;
                return (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => setLayoutId(layout.id)}
                    className={`qr-layout-card ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div className="qr-layout-card__check">
                      {isSelected ? (
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                      ) : (
                        <span className="qr-layout-card__dot" />
                      )}
                    </div>
                    <div className="qr-layout-card__info">
                      <span className="qr-layout-card__name">{LAYOUT_TITLES[layout.id] || layout.name}</span>
                      <span className="qr-layout-card__sample">{layout.headline}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview Sheet */}
        <div className="qr-stand-preview-wrapper">
          <div className="qr-stand-preview-panel">
            <div className="qr-stand-preview-topbar">
              <div className="qr-stand-preview-info">
                <span className="qr-stand-preview-badge">
                  {PAPER_SIZES[paperId]?.label} · {STYLE_DETAILS[styleId]?.label || styleId}
                </span>
                <span className="qr-stand-preview-layout-tag">
                  {LAYOUT_TITLES[activeLayoutId] || 'Standart Şablon'}
                </span>
              </div>

              <div className="qr-stand-preview-actions">
                <button
                  type="button"
                  onClick={handlePdfDownload}
                  disabled={isExporting}
                  className="qr-stand-print-btn"
                  title="Seçtiğiniz ölçü ve stilde baskıya hazır PDF indir"
                >
                  {isExporting ? (
                    <>
                      <span className="qr-studio-spinner" />
                      <span>Hazırlanıyor...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Baskıya Hazır PDF İndir</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Workstation Frame */}
            <div className="qr-stand-workstation">
              <div className="qr-stand-workstation-inner">
                <QRPreview
                  qrSvg={qrSvg}
                  restaurant={restaurant}
                  settings={settings}
                  paperId={paperId}
                  styleId={styleId}
                  layoutId={activeLayoutId}
                />
              </div>
            </div>

            {/* Practical Advice Note */}
            <div className="qr-stand-tip-footer">
              <div className="qr-stand-tip-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </div>
              <p className="qr-stand-tip-text">
                <strong>Baskı & Kullanım Önerisi:</strong> İndirdiğiniz PDF dosyasını seçtiğiniz kağıt boyutunda (A5 veya A6) kuşe kağıda basıp akrilik masa standlarına yerleştirerek masalarınızda profesyonel bir deneyim sunabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrPrintDesigner;
