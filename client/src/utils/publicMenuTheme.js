export const publicMenuThemes = {
  DEFAULT: {
    light: {
      background: '#f7f5f0',
      surface: '#fffdf8',
      text: '#25231f',
      muted: '#777064',
      border: 'rgb(54 45 31 / 10%)',
      radius: '1rem',
      shadow: '0 0 45px rgb(54 45 31 / 7%)',
    },
    dark: {
      background: '#111515',
      surface: '#1a211f',
      text: '#f3f0e9',
      muted: '#a4afa8',
      border: 'rgb(243 240 233 / 14%)',
      radius: '1rem',
      shadow: '0 16px 45px rgb(0 0 0 / 25%)',
    },
  },
  GRID: {
    light: {
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
      border: 'rgba(0, 0, 0, 0.08)',
      radius: '1.15rem',
      shadow: '0 12px 35px rgba(0, 0, 0, 0.06)',
    },
    dark: {
      background: '#0c0c0e',
      surface: '#16161a',
      text: '#ffffff',
      muted: '#94a3b8',
      border: 'rgba(255, 255, 255, 0.1)',
      radius: '1.15rem',
      shadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    },
  },
  MINIMAL: {
    light: {
      background: '#f7f5f0',
      surface: '#fffdf8',
      text: '#25231f',
      muted: '#777064',
      border: 'rgb(54 45 31 / 10%)',
      radius: '1rem',
      shadow: '0 0 45px rgb(54 45 31 / 7%)',
    },
    dark: {
      background: '#111515',
      surface: '#1a211f',
      text: '#f3f0e9',
      muted: '#a4afa8',
      border: 'rgb(243 240 233 / 14%)',
      radius: '1rem',
      shadow: '0 16px 45px rgb(0 0 0 / 25%)',
    },
  },
  BISTRO: {
    light: {
      background: '#f7f1e6',
      surface: '#fffdf9',
      text: '#2a1d18',
      muted: '#7d6258',
      border: 'rgb(113 74 50 / 18%)',
      radius: '1.2rem',
      shadow: '0 18px 52px rgb(94 62 30 / 12%)',
    },
    dark: {
      background: '#1f1714',
      surface: '#2a201d',
      text: '#f5efe8',
      muted: '#c7b4a6',
      border: 'rgb(244 225 210 / 18%)',
      radius: '1.2rem',
      shadow: '0 18px 52px rgb(17 8 5 / 28%)',
    },
  },
  ELEGANT: {
    light: { background: '#f1eee8', surface: '#fffefa', text: '#29231f', muted: '#776b63', border: 'rgb(78 56 43 / 16%)', radius: '1.35rem', shadow: '0 16px 45px rgb(78 56 43 / 10%)' },
    dark: { background: '#161513', surface: '#211f1d', text: '#f3efe7', muted: '#c0b5a3', border: 'rgb(226 211 194 / 18%)', radius: '1.35rem', shadow: '0 16px 45px rgb(11 8 4 / 25%)' },
  },
  WARM: {
    light: { background: '#fff2df', surface: '#fffaf2', text: '#3d281d', muted: '#896b57', border: 'rgb(161 91 42 / 18%)', radius: '1.2rem', shadow: '0 15px 40px rgb(161 91 42 / 11%)' },
    dark: { background: '#1e1714', surface: '#2a221f', text: '#f4e8d5', muted: '#d3b8a2', border: 'rgb(232 182 121 / 18%)', radius: '1.2rem', shadow: '0 15px 40px rgb(30 14 6 / 25%)' },
  },
  MODERN: {
    light: { background: '#eef3f2', surface: '#ffffff', text: '#182627', muted: '#607273', border: 'rgb(244 76 77 / 14%)', radius: '.7rem', shadow: '0 12px 35px rgb(24 76 77 / 9%)' },
    dark: { background: '#12191a', surface: '#1b2425', text: '#edf5f4', muted: '#b9cdcb', border: 'rgb(203 226 223 / 14%)', radius: '.7rem', shadow: '0 12px 35px rgb(6 17 18 / 24%)' },
  },
  DARK: {
    light: { background: '#111515', surface: '#1a211f', text: '#f3f0e9', muted: '#a4afa8', border: 'rgb(243 240 233 / 14%)', radius: '1rem', shadow: '0 16px 45px rgb(0 0 0 / 25%)' },
    dark: { background: '#090c0c', surface: '#101616', text: '#f2f4f1', muted: '#b9c4bc', border: 'rgb(243 240 233 / 14%)', radius: '1rem', shadow: '0 16px 45px rgb(0 0 0 / 25%)' },
  },
  CLASSIC: {
    light: { background: '#f4f0e8', surface: '#fffdf7', text: '#2d2b27', muted: '#756f64', border: 'rgb(70 64 52 / 14%)', radius: '.35rem', shadow: '0 10px 30px rgb(70 64 52 / 9%)' },
    dark: { background: '#1b1916', surface: '#2a261f', text: '#f3f0e8', muted: '#cec3ae', border: 'rgb(196 176 147 / 16%)', radius: '.35rem', shadow: '0 10px 30px rgb(27 20 12 / 22%)' },
  },
};

export const normalizeThemeKey = (theme) => {
  const normalized = typeof theme === 'string' ? theme.trim().toUpperCase() : '';
  if (normalized === 'DEFAULT' || normalized === 'MINIMAL' || normalized === 'BISTRO' || normalized === 'STORY') {
    return 'DEFAULT';
  }
  return publicMenuThemes[normalized] ? normalized : 'DEFAULT';
};

export const getPublicMenuTheme = (theme, mode = 'LIGHT') => {
  const normalizedTheme = normalizeThemeKey(theme);
  const selectedTheme = publicMenuThemes[normalizedTheme] || publicMenuThemes.DEFAULT || publicMenuThemes.MINIMAL;
  const variant = mode === 'DARK' ? (selectedTheme.dark || selectedTheme.light) : (selectedTheme.light || selectedTheme);
  return { ...variant };
};

export const publicMenuFonts = {
  Inter: 'Inter, system-ui, sans-serif',
  'DM Sans': '"DM Sans", "Segoe UI", sans-serif',
  'Playfair Display': '"Playfair Display", Georgia, serif',
  Lora: '"Lora", Georgia, serif',
};

export const publicMenuFontOptions = ['Inter', 'DM Sans', 'Playfair Display', 'Lora'];