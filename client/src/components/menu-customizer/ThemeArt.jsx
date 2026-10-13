/** Tiny wireframe of each menu theme, drawn in the draft's mode and accent colour. */
const ThemeArt = ({ theme, mode = 'LIGHT', accent = '#1F2937', className = '' }) => {
  const dark = mode === 'DARK';
  const bg = dark ? '#15171c' : '#f4f2ec';
  const card = dark ? '#23262d' : '#ffffff';
  const line = dark ? '#343843' : '#dedbd1';
  const photo = dark ? '#3a3f4b' : '#cfd6c4';
  const photo2 = dark ? '#2f343f' : '#e6d9c3';
  const text = dark ? '#d9dbe0' : '#2a2c31';

  return (
    <svg className={`mcz-art ${className}`} viewBox="0 0 120 90" role="img" aria-hidden="true" focusable="false">
      <rect width="120" height="90" rx="10" fill={bg} />
      {theme === 'GRID' && (
        <>
          <rect x="8" y="8" width="104" height="10" rx="5" fill={card} />
          <rect x="14" y="11.5" width="26" height="3" rx="1.5" fill={text} opacity="0.7" />
          <rect x="8" y="23" width="104" height="30" rx="8" fill={photo} />
          <rect x="14" y="40" width="34" height="4" rx="2" fill="#fff" opacity="0.92" />
          <rect x="14" y="46.5" width="20" height="3" rx="1.5" fill="#fff" opacity="0.6" />
          <rect x="8" y="58" width="50" height="24" rx="8" fill={photo2} />
          <rect x="62" y="58" width="50" height="24" rx="8" fill={photo} />
          <rect x="13" y="73" width="22" height="3.5" rx="1.75" fill="#fff" opacity="0.9" />
          <rect x="67" y="73" width="22" height="3.5" rx="1.75" fill="#fff" opacity="0.9" />
        </>
      )}
      {theme === 'STUDIO' && (
        <>
          <circle cx="16" cy="14" r="6" fill={accent} />
          <rect x="26" y="9.5" width="30" height="4" rx="2" fill={text} opacity="0.85" />
          <rect x="26" y="16" width="22" height="2.6" rx="1.3" fill={line} />
          <circle cx="100" cy="14" r="5" fill={card} stroke={line} />
          <rect x="8" y="26" width="26" height="9" rx="4.5" fill={text} />
          <rect x="38" y="26" width="24" height="9" rx="4.5" fill={card} stroke={line} />
          <rect x="66" y="26" width="24" height="9" rx="4.5" fill={card} stroke={line} />
          <rect x="8" y="40" width="40" height="24" rx="7" fill={photo} />
          <rect x="52" y="40" width="40" height="24" rx="7" fill={photo2} />
          <rect x="96" y="40" width="20" height="24" rx="7" fill={photo} />
          <rect x="12" y="55" width="16" height="5" rx="2.5" fill="#fff" opacity="0.92" />
          <rect x="8" y="69" width="50" height="18" rx="7" fill={card} stroke={line} />
          <rect x="62" y="69" width="50" height="18" rx="7" fill={card} stroke={line} />
          <rect x="30" y="76" width="60" height="10" rx="5" fill={text} opacity="0.92" />
          <rect x="35" y="79.5" width="22" height="3" rx="1.5" fill={bg} />
        </>
      )}
      {theme !== 'GRID' && theme !== 'STUDIO' && (
        <>
          <rect x="0" y="0" width="120" height="22" rx="10" fill={accent} />
          <rect x="0" y="12" width="120" height="10" fill={accent} />
          <rect x="40" y="7" width="40" height="4.5" rx="2.25" fill="#fff" opacity="0.92" />
          <rect x="8" y="27" width="28" height="9" rx="4.5" fill={accent} />
          <rect x="40" y="29.5" width="20" height="4" rx="2" fill={line} />
          <rect x="64" y="29.5" width="24" height="4" rx="2" fill={line} />
          <circle cx="16" cy="48" r="6" fill={photo2} stroke={accent} />
          <circle cx="34" cy="48" r="6" fill={photo} stroke={accent} />
          <circle cx="52" cy="48" r="6" fill={photo2} stroke={accent} />
          <rect x="8" y="59" width="104" height="13" rx="6" fill={card} stroke={line} />
          <rect x="12" y="62" width="8" height="7" rx="2" fill={photo} />
          <rect x="24" y="63" width="40" height="3" rx="1.5" fill={text} opacity="0.85" />
          <rect x="24" y="68" width="28" height="2.4" rx="1.2" fill={line} />
          <rect x="8" y="75" width="104" height="11" rx="6" fill={card} stroke={line} />
          <rect x="12" y="77.5" width="8" height="6" rx="2" fill={photo2} />
          <rect x="24" y="79" width="36" height="3" rx="1.5" fill={text} opacity="0.85" />
        </>
      )}
    </svg>
  );
};

export default ThemeArt;
