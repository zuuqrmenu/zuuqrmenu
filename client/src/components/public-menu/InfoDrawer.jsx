import { trackEvent } from '../../utils/analytics';

const platformLabels = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  website: 'Website',
};

const socialIcons = {
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" /></svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 21v-8.2h2.7l.4-3.1h-3.1V7.4c0-.9.3-1.6 1.7-1.6H16V2.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.4v2.6H7v3.1h2.3V21h3.9Z" fill="currentColor" /></svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 3h2.8l-6.1 7 7.2 11h-5.7l-4.5-7-5.1 7H4.7l6.5-7.4L4.2 3h5.8l4.1 6.5L18.9 3Zm-1 15.8h1.6L8.3 4.1H6.6l11.3 14.7Z" fill="currentColor" /></svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.1 7.2a2.8 2.8 0 0 0-1.9-2C17.8 4.8 12 4.8 12 4.8s-5.8 0-7.2.4a2.8 2.8 0 0 0-1.9 2C2.5 8.7 2.5 12 2.5 12s0 3.3.4 4.8a2.8 2.8 0 0 0 1.9 2c1.4.4 7.2.4 7.2.4s5.8 0 7.2-.4a2.8 2.8 0 0 0 1.9-2c.4-1.5.4-4.8.4-4.8s0-3.3-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" fill="currentColor" /></svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.7 3.8c.5 1.2 1.5 2.2 2.7 2.8v2.7a7.4 7.4 0 0 1-2.7-.7v5.8c0 3.6-2.8 6.6-6.3 6.6S3.1 15.5 3.1 11.9s2.8-6.6 6.3-6.6c.3 0 .6 0 .9.1v2.8a3.8 3.8 0 0 0-.9-.2c-1.8 0-3.2 1.4-3.2 3.2S8.4 14.3 10.2 14.3c1.7 0 3.1-1.4 3.1-3.1V3.8h2.4Z" fill="currentColor" /></svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 8.4a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM4.8 9.9h3.3V19H4.8V9.9Zm5.6 0h3.2v1.3h.1c.4-.8 1.6-1.7 3.4-1.7 3.6 0 4.3 2.4 4.3 5.5V19h-3.3v-17.8h3.3v2.7h.1c.5-.9 1.8-1.9 3.8-1.9 4.1 0 4.9 2.7 4.9 6.2V19h-3.3v-17.5h3.3v-2.5H13.1V9.9Z" fill="currentColor" /></svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8A9.2 9.2 0 0 0 4.1 16l-1.3 4.8 5-1.3A9.2 9.2 0 1 0 12 2.8Zm5.1 12.7c-.2.6-1.2 1.1-1.7 1.2-.4.1-.9.1-2.7-.6-2.3-1-3.8-3.5-3.9-3.6-.1-.2-1-1.3-1-2.5 0-1.2.6-1.8.8-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.1.1.3.1.5 0 .2-.1.4-.2.5-.1.1-.2.2-.4.4-.1.1-.2.2-.1.4.1.2.6 1 1.2 1.6.8.8 1.5 1.1 1.8 1.2.2.1.4.1.5-.1.1-.2.6-.7.7-.9.1-.2.3-.2.5-.1.2.1 1.3.6 1.5.7.2.1.3.2.4.3.1.1.1.6-.1 1.2Z" fill="currentColor" /></svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M3.8 12h16.4M12 3.5a14.5 14.5 0 0 1 0 17M12 3.5a14.5 14.5 0 0 0 0 17" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
  ),
};

const InfoDrawer = ({ restaurant, language, onLanguage, onReview, onClose, themeKey, mode }) => {
  const isGrid = themeKey === 'GRID';
  const activeMode = mode || (isGrid ? 'DARK' : 'LIGHT');
  const socialItems = (restaurant.socialMedia || []).filter((item) => item?.url && item?.platform);

  if (isGrid) {
    return (
      <div
        className="public-drawer-backdrop public-drawer-backdrop--grid"
        data-theme={themeKey}
        data-mode={activeMode}
        role="presentation"
        onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      >
        <aside
          className="public-drawer public-drawer--right public-drawer--grid public-drawer--grid-info"
          data-theme={themeKey}
          data-mode={activeMode}
        >
          <div className="drawer-grid-container drawer-grid-container--info">
            <div className="drawer-grid-header">
              <button
                type="button"
                className="drawer-grid-close"
                onClick={onClose}
                aria-label="Kapat"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="drawer-grid-info-scroll">
              {/* 1. Restoran Adı */}
              <div className="drawer-grid-info-brand">
                <h2 className="drawer-grid-info-title">{restaurant.name}</h2>
                {restaurant.description && (
                  <p className="drawer-grid-info-desc">{restaurant.description}</p>
                )}
              </div>

              <div className="drawer-grid-divider" />

              {/* 2. Adres Bilgisi */}
              {restaurant.address && (
                <div className="drawer-grid-card">
                  <div className="drawer-grid-card-head">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Adres</span>
                  </div>
                  <p className="drawer-grid-card-text">{restaurant.address}</p>
                </div>
              )}

              {/* 3. Telefon Bilgisi */}
              {restaurant.phone && (
                <div className="drawer-grid-card">
                  <div className="drawer-grid-card-head">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>Telefon</span>
                  </div>
                  <a href={`tel:${restaurant.phone}`} className="drawer-grid-card-link">
                    {restaurant.phone}
                  </a>
                </div>
              )}

              {/* 4. Bizi Değerlendirin Butonu */}
              <button
                type="button"
                className="drawer-grid-review-btn"
                onClick={() => {
                  trackEvent('open_review', {
                    restaurant_username: restaurant.slug || restaurant.username,
                    restaurant_name: restaurant.name,
                  });
                  onClose();
                  onReview();
                }}
              >
                <span className="review-btn-star">★</span>
                <span>Bizi Değerlendirin</span>
              </button>

              {/* 5. Sosyal Medya İkonları */}
              {socialItems.length > 0 && (
                <div className="drawer-grid-socials-block" aria-label="Sosyal medya hesapları">
                  <div className="drawer-grid-socials-label">Bizi Takip Edin</div>
                  <div className="drawer-grid-socials-list">
                    {socialItems.map((item) => (
                      <a
                        key={`${item.platform}-${item.url}`}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="drawer-grid-social-btn"
                        aria-label={platformLabels[item.platform] || item.platform}
                        title={platformLabels[item.platform] || item.platform}
                        onClick={() => {
                          trackEvent('click_social', {
                            restaurant_username: restaurant.slug || restaurant.username,
                            platform: item.platform,
                          });
                        }}
                      >
                        <span className="drawer-social-link__icon">{socialIcons[item.platform] || socialIcons.website}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="drawer-grid-footer">
              <p className="drawer-grid-powered">POWERED BY ZUUQRMENU</p>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="public-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="public-drawer public-drawer--right">
        <button type="button" className="drawer-close" onClick={onClose} aria-label="Kapat">×</button>
        <div className="drawer-store-image">{restaurant.logo ? <img src={restaurant.logo} alt={`${restaurant.name} logosu`} /> : restaurant.storeImage ? <img src={restaurant.storeImage} alt={`${restaurant.name} mağaza görseli`} /> : <span aria-hidden="true">{restaurant.name.charAt(0)}</span>}</div>
        <h2>{restaurant.name}</h2>
        <p className="drawer-label">Dil</p>
        <div className="language-options">{[['tr','Türkçe'],['en','English'],['ar','العربية']].map(([value,label]) => <button type="button" key={value} className={language === value ? 'is-selected' : ''} onClick={() => onLanguage(value)}>{label}</button>)}</div>
        <button
          type="button"
          className="review-open-button"
          onClick={() => {
            trackEvent('open_review', {
              restaurant_username: restaurant.slug || restaurant.username,
              restaurant_name: restaurant.name,
            });
            onClose();
            onReview();
          }}
        >
          ★ Bizi Değerlendirin
        </button>
        {socialItems.length > 0 && (
          <div className="drawer-socials" aria-label="Sosyal medya hesapları">
            <div className="drawer-socials__list">
              {socialItems.map((item) => (
                <a
                  key={`${item.platform}-${item.url}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="drawer-social-link"
                  aria-label={platformLabels[item.platform] || item.platform}
                  title={platformLabels[item.platform] || item.platform}
                  onClick={() => {
                    trackEvent('click_social', {
                      restaurant_username: restaurant.slug || restaurant.username,
                      platform: item.platform,
                    });
                  }}
                >
                  <span className="drawer-social-link__icon">{socialIcons[item.platform] || socialIcons.website}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        {restaurant.address && (
          <div className="drawer-address-block">
            <p className="drawer-label drawer-label--address"><span className="address-pin">⌖</span> Adres</p>
            <p className="drawer-address">{restaurant.address}</p>
          </div>
        )}
        {(restaurant.phone || restaurant.email || restaurant.website) && (
          <div className="drawer-contact-block">
            <p className="drawer-label">İletişim</p>
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="drawer-contact-link"
                onClick={() => {
                  trackEvent('click_contact', {
                    restaurant_username: restaurant.slug || restaurant.username,
                    contact_type: 'phone',
                  });
                }}
              >
                {restaurant.phone}
              </a>
            )}
            {restaurant.email && (
              <a
                href={`mailto:${restaurant.email}`}
                className="drawer-contact-link"
                onClick={() => {
                  trackEvent('click_contact', {
                    restaurant_username: restaurant.slug || restaurant.username,
                    contact_type: 'email',
                  });
                }}
              >
                {restaurant.email}
              </a>
            )}
            {restaurant.website && (
              <a
                href={restaurant.website}
                target="_blank"
                rel="noreferrer"
                className="drawer-contact-link"
                onClick={() => {
                  trackEvent('click_contact', {
                    restaurant_username: restaurant.slug || restaurant.username,
                    contact_type: 'website',
                  });
                }}
              >
                Web sitesini ziyaret et
              </a>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};

export default InfoDrawer;