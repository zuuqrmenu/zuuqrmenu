import QRCode from 'qrcode';

const hexToRgb = (hex) => {
  const value = hex.replace('#', '');
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
};

const luminance = ({ r, g, b }) => {
  const channels = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
};

const contrastRatio = (hex1, hex2) => {
  const normalize = (hex) => {
    const rgb = hexToRgb(hex);
    const channels = [rgb.r, rgb.g, rgb.b].map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
  };

  const l1 = normalize(hex1);
  const l2 = normalize(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const getReadableQrColor = (color) => {
  if (!/^#[0-9A-Fa-f]{6}$/.test(color || '')) return '#111827';
  const candidate = color.toUpperCase();
  const safeDark = '#111827';
  return contrastRatio(candidate, '#FFFFFF') >= 3 ? candidate : safeDark;
};

export const qrOptions = (color) => ({
  errorCorrectionLevel: 'H',
  margin: 4,
  width: 360,
  color: { dark: getReadableQrColor(color), light: '#FFFFFF' },
});

export const createQrSvg = (url, color) => QRCode.toString(url, { ...qrOptions(color), type: 'svg' });