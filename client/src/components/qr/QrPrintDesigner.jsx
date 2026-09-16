import { useMemo, useState } from 'react';
import {
  DESIGN_STYLES,
  PAPER_SIZES,
  QR_LAYOUTS,
  buildPaperRatio,
  buildPrintPreviewConfig,
  exportQrPrintPdf,
  getCompatibleLayouts,
  getDefaultLayout,
  getDefaultPaperSize,
  getLayoutSupportLabel,
  isLogoAvailable,
} from '../../utils/qrPrintDesigner';

const QRPreview = ({ qrSvg, restaurant, settings, paperId, styleId, layoutId }) => {
  const config = useMemo(() => buildPrintPreviewConfig({ restaurant, settings, paperId, styleId, layoutId }), [restaurant, settings, paperId, styleId, layoutId]);
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
          <span>QR Print</span>
          <span>{paper.label}</span>
        </div>
        {template}
      </div>
    </div>
  );
};

const QrPrintDesigner = ({ restaurant, settings, qrSvg, onDownloadPng, onDownloadSvg, setFeedback }) => {
  const paperOptions = Object.values(PAPER_SIZES);
  const styleOptions = Object.values(DESIGN_STYLES);
  const [paperId, setPaperId] = useState(getDefaultPaperSize());
  const [styleId, setStyleId] = useState('Minimal');
  const [layoutId, setLayoutId] = useState(getDefaultLayout(getDefaultPaperSize()));

  const availableLayouts = useMemo(() => getCompatibleLayouts(paperId), [paperId]);
  const activeLayoutId = availableLayouts.some((layout) => layout.id === layoutId)
    ? layoutId
    : getDefaultLayout(paperId);

  const handlePdfDownload = async () => {
    if (!qrSvg) return;
    try {
      await exportQrPrintPdf({
        restaurant,
        settings,
        qrSvg,
        paperId,
        styleId,
        layoutId,
      });
      setFeedback?.('PDF indirildi');
    } catch {
      setFeedback?.('PDF oluşturulamadı.');
    }
  };

  return (
    <div className="qr-print-designer">
      <div className="qr-print-designer__controls">
        <div className="qr-print-section">
          <div className="qr-print-section__title-row">
            <h3>Kağıt Boyutu</h3>
            <span>{PAPER_SIZES[paperId]?.width} × {PAPER_SIZES[paperId]?.height} mm</span>
          </div>
          <div className="qr-print-option-grid qr-print-option-grid--paper">
            {paperOptions.map((paper) => (
              <button
                key={paper.id}
                type="button"
                onClick={() => setPaperId(paper.id)}
                className={`qr-print-option ${paper.id === paperId ? 'is-selected' : ''}`}
              >
                <span>{paper.label}</span>
                <small>{paper.width} × {paper.height} mm</small>
              </button>
            ))}
          </div>
        </div>

        <div className="qr-print-section">
          <div className="qr-print-section__title-row">
            <h3>Tasarım</h3>
          </div>
          <div className="qr-print-option-grid qr-print-option-grid--style">
            {styleOptions.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setStyleId(style.id)}
                className={`qr-print-option ${style.id === styleId ? 'is-selected' : ''}`}
              >
                <span className="qr-print-option__swatch" style={{ background: `linear-gradient(135deg, ${style.primary}, ${style.background})` }} />
                <span>{style.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="qr-print-section">
          <div className="qr-print-section__title-row">
            <h3>Yerleşim</h3>
            <span>{getLayoutSupportLabel(paperId)}</span>
          </div>
          <div className="qr-print-option-grid qr-print-option-grid--layout">
            {availableLayouts.map((layout) => (
              <button
                key={layout.id}
                type="button"
                onClick={() => setLayoutId(layout.id)}
                className={`qr-print-layout-card ${layout.id === activeLayoutId ? 'is-selected' : ''}`}
              >
                <span>{layout.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="qr-print-preview-panel">
        <div className="qr-print-preview-header">
          <div>
            <p>Önizleme</p>
            <strong>{PAPER_SIZES[paperId]?.label || 'A5'} · {QR_LAYOUTS.find((layout) => layout.id === activeLayoutId)?.name || 'Logo Top / QR Bottom'}</strong>
          </div>
          <div className="qr-print-preview-actions">
            <button type="button" className="download-button" onClick={handlePdfDownload}>PDF Olarak İndir</button>
            <button type="button" className="download-button" onClick={onDownloadPng}>PNG Olarak İndir</button>
            <button type="button" className="download-button" onClick={onDownloadSvg}>SVG Olarak İndir</button>
          </div>
        </div>
        <div className="qr-print-preview-shell">
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
    </div>
  );
};

export default QrPrintDesigner;
