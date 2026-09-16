export const PAPER_SIZES = {
  A4: { id: 'A4', label: 'A4', width: 210, height: 297 },
  A5: { id: 'A5', label: 'A5', width: 148, height: 210 },
  A6: { id: 'A6', label: 'A6', width: 105, height: 148 },
  A7: { id: 'A7', label: 'A7', width: 74, height: 105 },
};

const toRgbArray = (hex) => {
  const { r, g, b } = hexToRgb(hex || '#000000');
  return [r, g, b];
};

export const DESIGN_STYLES = {
  Minimal: {
    id: 'Minimal',
    name: 'Minimal',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    muted: '#64748b',
    accent: '#e2e8f0',
    primary: '#0f172a',
    secondary: '#ffffff',
  },
  Elegant: {
    id: 'Elegant',
    name: 'Elegant',
    background: '#f8f5f1',
    surface: '#fffdfc',
    text: '#1f2937',
    muted: '#6b7280',
    accent: '#e7ddcf',
    primary: '#7c5a3a',
    secondary: '#fff7ed',
  },
  Modern: {
    id: 'Modern',
    name: 'Modern',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#111827',
    muted: '#475569',
    accent: '#dbeafe',
    primary: '#DEFF36',
    secondary: '#ecfeff',
  },
  Bold: {
    id: 'Bold',
    name: 'Bold',
    background: '#ffffff',
    surface: '#fdf2f8',
    text: '#111827',
    muted: '#4b5563',
    accent: '#f9a8d4',
    primary: '#ec4899',
    secondary: '#fff7ed',
  },
};

export const QR_LAYOUTS = [
  {
    id: 'A',
    name: 'Logo Top / QR Bottom',
    headline: 'Menümüzü Keşfedin',
    supporting: 'Menüyü görüntülemek için QR kodu okutun.',
    compatible: ['A4', 'A5', 'A6', 'A7'],
  },
  {
    id: 'B',
    name: 'Centered Composition',
    headline: 'Menüyü Görüntüle',
    supporting: 'QR kodu okutarak menümüze ulaşabilirsiniz.',
    compatible: ['A4', 'A5', 'A6', 'A7'],
  },
  {
    id: 'C',
    name: 'Side by Side',
    headline: 'Menümüze Göz Atın',
    supporting: 'Hızlı erişim için QR kodu okutun.',
    compatible: ['A4', 'A5'],
  },
  {
    id: 'D',
    name: 'Large QR Focus',
    headline: 'Menüyü Görüntüle',
    supporting: 'Masanızdan kolayca menüye erişin.',
    compatible: ['A4', 'A5'],
  },
  {
    id: 'E',
    name: 'Minimal Bottom Info',
    headline: 'Menümüzü Keşfedin',
    supporting: 'QR kodu okutun ve menümüzü görün.',
    compatible: ['A4', 'A5', 'A6', 'A7'],
  },
];

export const getCompatibleLayouts = (paperSizeId) => QR_LAYOUTS.filter((layout) => layout.compatible.includes(paperSizeId));

export const getDefaultPaperSize = () => 'A5';

export const getDefaultLayout = (paperSizeId) => getCompatibleLayouts(paperSizeId)[0]?.id || 'A';

const hexToRgb = (hex) => {
  const value = (hex || '#000000').replace('#', '');
  const normalized = value.length === 3 ? value.split('').map((part) => part + part).join('') : value;
  const numeric = Number.parseInt(normalized, 16);
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
};

const rgbObjectToHex = ({ r, g, b }) => `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`.toUpperCase();

export const getReadableTextColor = (background) => {
  const { r, g, b } = hexToRgb(background);
  const luminance = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
  return luminance > 180 ? '#0F172A' : '#FFFFFF';
};

export const buildPrintPreviewConfig = ({ restaurant, settings, paperId, styleId, layoutId }) => {
  const paper = PAPER_SIZES[paperId] || PAPER_SIZES.A5;
  const style = DESIGN_STYLES[styleId] || DESIGN_STYLES.Minimal;
  const layout = QR_LAYOUTS.find((item) => item.id === layoutId) || QR_LAYOUTS[0];
  const primary = settings?.primaryColor || style.primary;
  const secondary = settings?.secondaryColor || style.secondary;
  const accent = primary;
  const brandText = restaurant?.name || 'Restoran';

  return {
    paper,
    style,
    layout,
    primary,
    secondary,
    accent,
    brandText,
    headline: layout.headline,
    supporting: layout.supporting,
  };
};

export const loadImageAsDataUrl = (src) => new Promise((resolve) => {
  if (!src) return resolve(null);
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext('2d');
    if (!context) return resolve(null);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL('image/png'));
  };
  image.onerror = () => resolve(null);
  image.src = src;
});

export const svgToDataUrl = async (svgString) => {
  if (!svgString) return null;
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('SVG render failed'));
      img.src = objectUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1200;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const exportQrPrintPdf = async ({ restaurant, settings, qrSvg, paperId, styleId, layoutId }) => {
  const { jsPDF } = await import('jspdf');
  const { paper, style, layout, primary, secondary, brandText } = buildPrintPreviewConfig({
    restaurant,
    settings,
    paperId,
    styleId,
    layoutId,
  });

  const pdf = new jsPDF({ unit: 'mm', format: [paper.width, paper.height] });
  const pageWidth = paper.width;
  const pageHeight = paper.height;
  const margin = 12;

  pdf.setFillColor(...toRgbArray(style.background));
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  const accentColor = toRgbArray(primary);

  pdf.setDrawColor(...accentColor);
  pdf.setLineWidth(0.8);
  pdf.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

  const accentBarHeight = 7;
  pdf.setFillColor(...accentColor);
  pdf.rect(margin, margin, pageWidth - (margin * 2), accentBarHeight, 'F');

  const logoDataUrl = await loadImageAsDataUrl(settings?.logo);
  const qrDataUrl = await svgToDataUrl(qrSvg);

  if (logoDataUrl) {
    const logoSize = Math.min(28, pageWidth * 0.2);
    const logoX = (pageWidth - logoSize) / 2;
    pdf.addImage(logoDataUrl, 'PNG', logoX, margin + 11, logoSize, logoSize, undefined, 'FAST');
  } else {
    const badgeSize = 18;
    const badgeX = (pageWidth - badgeSize) / 2;
    pdf.setFillColor(...accentColor);
    pdf.circle(badgeX + (badgeSize / 2), margin + 18, badgeSize / 2, 'F');
    pdf.setTextColor(...toRgbArray(secondary));
    pdf.setFontSize(12);
    pdf.text((brandText || 'R').slice(0, 1).toUpperCase(), badgeX + (badgeSize / 2), margin + 22, { align: 'center' });
  }

  pdf.setTextColor(...toRgbArray(style.text));
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  const nameY = layout.id === 'C' ? margin + 32 : margin + 40;
  pdf.text(brandText, pageWidth / 2, nameY, { align: 'center' });

  pdf.setTextColor(...toRgbArray(style.muted));
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const title = layout.headline || 'Menümüzü Keşfedin';
  const subtitle = layout.supporting || 'Menüyü görüntülemek için QR kodu okutun.';

  if (layout.id === 'C') {
    const leftX = margin + 8;
    const qrX = pageWidth - 52;
    const qrY = margin + 18;
    const qrSize = Math.min(pageWidth * 0.28, 42);

    pdf.setTextColor(...toRgbArray(primary));
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, leftX, margin + 52, { maxWidth: pageWidth * 0.42 });
    pdf.setTextColor(...toRgbArray(style.text));
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(subtitle, leftX, margin + 62, { maxWidth: pageWidth * 0.42 });

    if (qrDataUrl) {
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize, undefined, 'FAST');
    }
  } else if (layout.id === 'D') {
    const qrSize = Math.min(pageWidth * 0.5, 62);
    const qrX = (pageWidth - qrSize) / 2;
    pdf.setTextColor(...toRgbArray(primary));
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, pageWidth / 2, margin + 48, { align: 'center' });
    pdf.setTextColor(...toRgbArray(style.muted));
    pdf.setFontSize(9);
    pdf.text(subtitle, pageWidth / 2, margin + 56, { align: 'center' });
    if (qrDataUrl) {
      pdf.addImage(qrDataUrl, 'PNG', qrX, margin + 63, qrSize, qrSize, undefined, 'FAST');
    }
  } else {
    const qrSize = layout.id === 'E' ? 52 : Math.min(pageWidth * 0.48, 62);
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = layout.id === 'E' ? margin + 38 : margin + 52;

    pdf.setTextColor(...toRgbArray(primary));
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, pageWidth / 2, layout.id === 'E' ? margin + 23 : margin + 28, { align: 'center' });

    if (qrDataUrl) {
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize, undefined, 'FAST');
    }

    pdf.setTextColor(...toRgbArray(style.text));
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(subtitle, pageWidth / 2, qrY + qrSize + 10, { align: 'center' });
  }

  pdf.save(`${(restaurant?.slug || 'restaurant')}-qr-print-${paperId.toLowerCase()}.pdf`);
};

export const getLayoutSupportLabel = (paperId) => {
  const paper = PAPER_SIZES[paperId] || PAPER_SIZES.A5;
  if (paper.id === 'A7') return 'A7 için sadece basit dikey düzenler önerilir.';
  if (paper.id === 'A6') return 'A6 için dikey ve minimal düzenler tercih edilir.';
  return 'Tüm ana düzenler uygun.';
};

export const buildPaperRatio = (paperId) => {
  const paper = PAPER_SIZES[paperId] || PAPER_SIZES.A5;
  return `${paper.width} / ${paper.height}`;
};

export const getPaperDisplay = (paperId) => `${PAPER_SIZES[paperId]?.label || 'A5'} · ${PAPER_SIZES[paperId]?.width || 148} × ${PAPER_SIZES[paperId]?.height || 210} mm`;

export const getSmoothStyleName = (name) => name.toLowerCase().replace(/\s+/g, '-');

export const isLogoAvailable = (settings) => Boolean(settings?.logo && settings.logo.trim());

export const getBrandInitial = (restaurantName) => (restaurantName || 'R').trim().charAt(0).toUpperCase();

export const getPrimaryColor = (settings, fallbackPrimary) => settings?.primaryColor || fallbackPrimary;

export const getSecondaryColor = (settings, fallbackSecondary) => settings?.secondaryColor || fallbackSecondary;

export const getDesignContrast = (color) => (rgbObjectToHex(hexToRgb(color)) ? getReadableTextColor(color) : '#0F172A');
