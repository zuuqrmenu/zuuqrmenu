export const publicMenuThemes = {
  MINIMAL: { background: '#f7f5f0', surface: '#fffdf8', text: '#25231f', muted: '#777064', border: 'rgb(54 45 31 / 10%)', radius: '1rem', shadow: '0 0 45px rgb(54 45 31 / 7%)' },
  ELEGANT: { background: '#f1eee8', surface: '#fffefa', text: '#29231f', muted: '#776b63', border: 'rgb(78 56 43 / 16%)', radius: '1.35rem', shadow: '0 16px 45px rgb(78 56 43 / 10%)' },
  WARM: { background: '#fff2df', surface: '#fffaf2', text: '#3d281d', muted: '#896b57', border: 'rgb(161 91 42 / 18%)', radius: '1.2rem', shadow: '0 15px 40px rgb(161 91 42 / 11%)' },
  MODERN: { background: '#eef3f2', surface: '#ffffff', text: '#182627', muted: '#607273', border: 'rgb(24 76 77 / 14%)', radius: '.7rem', shadow: '0 12px 35px rgb(24 76 77 / 9%)' },
  DARK: { background: '#111515', surface: '#1a211f', text: '#f3f0e9', muted: '#a4afa8', border: 'rgb(243 240 233 / 14%)', radius: '1rem', shadow: '0 16px 45px rgb(0 0 0 / 25%)' },
  CLASSIC: { background: '#f4f0e8', surface: '#fffdf7', text: '#2d2b27', muted: '#756f64', border: 'rgb(70 64 52 / 14%)', radius: '.35rem', shadow: '0 10px 30px rgb(70 64 52 / 9%)' },
};

export const getPublicMenuTheme = (theme) => publicMenuThemes[theme] || publicMenuThemes.MINIMAL;