import '../styles/dashboard-skeleton.css';

/**
 * One skeleton language for every panel page.
 *
 * Rules that keep pages from jumping when data arrives:
 *  - the static page header is always rendered by the page itself; only data-dependent regions use a skeleton
 *  - each variant mirrors the real layout (same grid, same card radius/padding, similar heights)
 *  - every block sits on the same glass card the real content uses
 */
const Bar = ({ w = '100%', h = '0.9rem', r, className = '' }) => (
  <span className={`dsk ${className}`} style={{ width: w, height: h, borderRadius: r }} aria-hidden="true" />
);

const Card = ({ className = '', children, ...rest }) => (
  <div className={`dsk-card ${className}`} {...rest}>{children}</div>
);

const Wrap = ({ label, className = '', bare = false, children }) => (bare ? <>{children}</> : (
  <div className={`dsk-wrap ${className}`} role="status" aria-busy="true" aria-live="polite" aria-label={label}>
    {children}
  </div>
));

const StatCard = () => (
  <Card className="dsk-stat">
    <div className="dsk-row dsk-row--between"><Bar w="2.4rem" h="2.4rem" r="14px" /><Bar w="4.5rem" h="1.4rem" r="999px" /></div>
    <Bar w="55%" h="0.95rem" />
    <div className="dsk-row dsk-row--between dsk-row--end"><Bar w="38%" h="2.4rem" r="12px" /><Bar w="24%" h="0.8rem" /></div>
  </Card>
);

const ChartBars = ({ count = 7 }) => (
  <div className="dsk-bars" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => <Bar key={i} className="dsk-bars__bar" h={`${34 + ((i * 37) % 52)}%`} w="100%" r="10px 10px 4px 4px" />)}
  </div>
);

const ListRows = ({ rows = 3, avatar = true }) => (
  <div className="dsk-list">
    {Array.from({ length: rows }, (_, i) => (
      <div className="dsk-list__row" key={i}>
        {avatar && <Bar w="2.6rem" h="2.6rem" r="14px" />}
        <div className="dsk-list__text"><Bar w={`${58 - i * 6}%`} h="0.95rem" /><Bar w="32%" h="0.75rem" /></div>
        <Bar w="3.6rem" h="1.5rem" r="999px" />
      </div>
    ))}
  </div>
);

const Heading = ({ title = '60%', sub = '38%' }) => (
  <div className="dsk-heading"><Bar w="22%" h="0.8rem" /><Bar w={title} h="1.5rem" r="10px" /><Bar w={sub} h="0.85rem" /></div>
);

const DashboardSkeleton = ({ variant = 'panel', bare = false }) => {
  switch (variant) {
    /* Restaurant overview: stats + chart/side + actions/activity */
    case 'overview':
      return (
        <Wrap label="Genel bakış yükleniyor" className="dsk-stack">
          <div className="dsk-grid dsk-grid--4">{[1, 2, 3, 4].map((i) => <StatCard key={i} />)}</div>
          <div className="dsk-grid dsk-grid--main">
            <Card className="dsk-panel dsk-panel--chart"><Heading /><Bar w="100%" h="3rem" r="16px" /><ChartBars /></Card>
            <Card className="dsk-panel"><Heading title="50%" /><Bar w="100%" h="5.2rem" r="18px" /><ListRows rows={3} avatar={false} /></Card>
          </div>
          <div className="dsk-grid dsk-grid--main">
            <Card className="dsk-panel"><Heading title="46%" /><div className="dsk-grid dsk-grid--2">{[1, 2, 3, 4].map((i) => <Bar key={i} h="4.6rem" r="20px" />)}</div></Card>
            <Card className="dsk-panel"><Heading title="52%" /><ListRows rows={3} /></Card>
          </div>
        </Wrap>
      );

    /* Admin overview: stats + applications + two lists */
    case 'admin':
      return (
        <Wrap label="Yönetim paneli yükleniyor" className="dsk-stack">
          <div className="dsk-grid dsk-grid--4">{[1, 2, 3, 4].map((i) => <StatCard key={i} />)}</div>
          <Card className="dsk-panel"><Heading title="40%" /><div className="dsk-grid dsk-grid--3">{[1, 2, 3].map((i) => <Bar key={i} h="9.5rem" r="20px" />)}</div></Card>
          <div className="dsk-grid dsk-grid--2">
            <Card className="dsk-panel"><Heading title="46%" /><ListRows rows={4} avatar={false} /></Card>
            <Card className="dsk-panel"><Heading title="52%" /><ListRows rows={4} /></Card>
          </div>
        </Wrap>
      );

    /* Menu management: the category/product board */
    case 'menu':
      return (
        <Wrap label="Menü içeriği yükleniyor" bare={bare}>
          <Card className="dsk-panel dsk-menu">
            <div className="dsk-row dsk-row--between dsk-menu__head">
              <div className="dsk-heading"><Bar w="3rem" h="0.8rem" /><Bar w="11rem" h="1.5rem" r="10px" /><Bar w="14rem" h="0.85rem" /></div>
              <div className="dsk-row"><Bar w="7.5rem" h="2.5rem" r="999px" /><Bar w="6.5rem" h="2.5rem" r="999px" /><Bar w="7.5rem" h="2.5rem" r="999px" /></div>
            </div>
            {[3, 3].map((products, c) => (
              <div className="dsk-category" key={c}>
                <div className="dsk-category__head">
                  <Bar w="1.2rem" h="1.2rem" r="6px" />
                  <div className="dsk-list__text"><Bar w="30%" h="1.1rem" /><Bar w="22%" h="0.75rem" /></div>
                  <Bar w="1.6rem" h="1.6rem" r="999px" />
                </div>
                {Array.from({ length: products }, (_, p) => (
                  <div className="dsk-product" key={p}>
                    <Bar w="1.2rem" h="1.2rem" r="6px" />
                    <Bar w="3.4rem" h="3.4rem" r="14px" />
                    <div className="dsk-list__text"><Bar w={`${34 - p * 4}%`} h="1rem" /><Bar w="12%" h="0.8rem" /></div>
                    <Bar w="1.6rem" h="1.6rem" r="999px" />
                  </div>
                ))}
              </div>
            ))}
          </Card>
        </Wrap>
      );

    /* Whole menu-management page on first load: status + design cards, import, board */
    case 'menu-page':
      return (
        <Wrap label="Menü yönetimi yükleniyor" className="dsk-stack">
          <div className="dsk-grid dsk-grid--2">
            {/* Yayın durumu: title, status panel, full-width switch */}
            <Card className="dsk-panel">
              <div className="dsk-heading"><Bar w="9rem" h="1.4rem" r="10px" /><Bar w="75%" h="0.85rem" /></div>
              <Bar w="100%" h="4.6rem" r="20px" />
              <Bar w="100%" h="3.1rem" r="999px" />
            </Card>
            {/* Menü tasarımı: title, live design panel, two actions */}
            <Card className="dsk-panel">
              <div className="dsk-heading"><Bar w="9rem" h="1.4rem" r="10px" /><Bar w="80%" h="0.85rem" /></div>
              <div className="dsk-row" style={{ gap: '1rem' }}><Bar w="7.6rem" h="5rem" r="14px" /><div className="dsk-list__text"><Bar w="35%" h="0.75rem" /><Bar w="55%" h="1.1rem" /><Bar w="70%" h="0.8rem" /></div></div>
              <div className="dsk-row"><Bar w="8rem" h="2.6rem" r="999px" /><Bar w="10rem" h="2.6rem" r="999px" /></div>
            </Card>
          </div>
          <Card className="dsk-panel" style={{ minHeight: '13.5rem' }}>
            <div className="dsk-heading"><Bar w="7rem" h="0.8rem" /><Bar w="10rem" h="1.4rem" r="10px" /><Bar w="60%" h="0.85rem" /></div>
            <Bar w="100%" h="4.6rem" r="22px" />
          </Card>
          <DashboardSkeleton variant="menu" bare />
        </Wrap>
      );

    /* Analytics */
    case 'analytics':
      return (
        <Wrap label="İstatistikler yükleniyor" className="dsk-stack">
          <div className="dsk-grid dsk-grid--4">{[1, 2, 3, 4].map((i) => <StatCard key={i} />)}</div>
          <Card className="dsk-ribbon"><Bar w="2.6rem" h="2.6rem" r="14px" />{[1, 2, 3, 4].map((i) => <div key={i} className="dsk-list__text"><Bar w="55%" h="0.7rem" /><Bar w="75%" h="1.1rem" /><Bar w="45%" h="0.8rem" /></div>)}</Card>
          <div className="dsk-grid dsk-grid--main">
            <Card className="dsk-panel dsk-panel--chart"><Heading /><ChartBars /></Card>
            <Card className="dsk-panel"><Heading title="50%" /><div className="dsk-heat">{Array.from({ length: 7 }, (_, i) => <Bar key={i} h="2.6rem" r="12px" />)}</div></Card>
          </div>
          <div className="dsk-grid dsk-grid--2">
            <Card className="dsk-panel"><Heading title="48%" /><ListRows rows={3} /></Card>
            <Card className="dsk-panel"><Heading title="44%" /><ListRows rows={3} /></Card>
          </div>
        </Wrap>
      );

    /* QR page: link + code on the left, side cards on the right */
    case 'qr':
      return (
        <Wrap label="QR kod yükleniyor">
          <div className="dsk-grid dsk-grid--split">
            <div className="dsk-stack">
              <Card className="dsk-panel"><Bar w="38%" h="1rem" /><div className="dsk-row"><Bar w="100%" h="2.8rem" r="14px" /><Bar w="6rem" h="2.8rem" r="14px" /></div><Bar w="70%" h="0.8rem" /></Card>
              <Card className="dsk-panel"><Bar w="34%" h="1rem" /><Bar w="100%" h="18rem" r="24px" /><div className="dsk-grid dsk-grid--3">{[1, 2, 3].map((i) => <Bar key={i} h="5rem" r="18px" />)}</div></Card>
            </div>
            <div className="dsk-stack">
              <Card className="dsk-panel"><Bar w="2.6rem" h="2.6rem" r="14px" /><Bar w="80%" h="1.3rem" /><Bar w="100%" h="0.85rem" /><Bar w="100%" h="2.8rem" r="14px" /></Card>
              <Card className="dsk-panel"><Bar w="45%" h="0.95rem" /><Bar w="100%" h="0.85rem" /><Bar w="92%" h="0.85rem" /><Bar w="84%" h="0.85rem" /></Card>
            </div>
          </div>
        </Wrap>
      );

    /* Subscription modal: status strip + two plans side by side */
    case 'billing':
      return (
        <Wrap label="Abonelik yükleniyor" className="dsk-stack">
          <Card className="dsk-row dsk-row--between" style={{ padding: '0.85rem 1rem', borderRadius: '20px' }}>
            <div className="dsk-row"><Bar w="4.5rem" h="1.6rem" r="999px" /><Bar w="16rem" h="0.9rem" /></div>
            <Bar w="9rem" h="2.6rem" r="999px" />
          </Card>
          <div className="dsk-grid dsk-grid--2">
            {[1, 2].map((i) => (
              <Card className="dsk-panel" key={i} style={{ padding: '1.1rem 1.2rem', borderRadius: '22px' }}>
                <div className="dsk-row dsk-row--between"><Bar w="35%" h="1.2rem" r="8px" /><Bar w="30%" h="1.6rem" r="8px" /></div>
                <Bar w="90%" h="0.8rem" />
                <div className="dsk-list__text" style={{ gap: '0.6rem' }}>{[1, 2, 3, 4].map((k) => <Bar key={k} w={`${85 - k * 8}%`} h="0.8rem" />)}</div>
                <Bar w="100%" h="2.9rem" r="999px" />
              </Card>
            ))}
          </div>
        </Wrap>
      );

    /* Settings tab content */
    case 'settings':
      return (
        <Wrap label="Ayarlar yükleniyor" className="dsk-stack">
          <Card className="dsk-panel">
            <Heading title="42%" sub="58%" />
            <div className="dsk-grid dsk-grid--3">{[1, 2, 3].map((i) => <Bar key={i} h="11rem" r="22px" />)}</div>
            <div className="dsk-grid dsk-grid--2">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="dsk-field"><Bar w="30%" h="0.8rem" /><Bar h="3rem" r="14px" /></div>)}</div>
            <div className="dsk-row">{[1, 2, 3, 4, 5, 6].map((i) => <Bar key={i} w="3rem" h="3rem" r="999px" />)}</div>
            <div className="dsk-row dsk-row--between"><span /><Bar w="11rem" h="2.9rem" r="999px" /></div>
          </Card>
          <Card className="dsk-panel"><Heading title="36%" sub="50%" /><div className="dsk-grid dsk-grid--2">{[1, 2].map((i) => <Bar key={i} h="3rem" r="14px" />)}</div></Card>
        </Wrap>
      );

    /* Resource control: overview strip + service cards + AI card */
    case 'resources':
      return (
        <Wrap label="Kaynaklar yükleniyor" className="dsk-stack">
          <Card className="dsk-panel dsk-grid dsk-grid--2" style={{ alignItems: 'center' }}>
            <div className="dsk-row"><Bar w="0.9rem" h="0.9rem" r="999px" /><div className="dsk-list__text"><Bar w="55%" h="1.4rem" r="10px" /><Bar w="85%" h="0.85rem" /></div></div>
            <div className="dsk-row" style={{ flexWrap: 'wrap' }}>{[1, 2, 3, 4, 5].map((i) => <Bar key={i} w="8.5rem" h="2.3rem" r="999px" />)}</div>
          </Card>
          <div className="dsk-grid dsk-grid--2">
            {[1, 2, 3, 4].map((i) => (
              <Card className="dsk-panel" key={i} style={{ minHeight: '27rem' }}>
                <div className="dsk-row"><Bar w="2.9rem" h="2.9rem" r="16px" /><div className="dsk-list__text"><Bar w="45%" h="1.1rem" /><Bar w="30%" h="0.8rem" /></div><Bar w="5rem" h="1.6rem" r="999px" /></div>
                <Bar w="100%" h="7.4rem" r="20px" />
                <div className="dsk-row"><Bar w="2.2rem" h="2.2rem" r="12px" /><div className="dsk-list__text"><Bar w="25%" h="0.8rem" /><Bar w="55%" h="1rem" /></div></div>
                <div className="dsk-grid dsk-grid--2">{[1, 2, 3, 4].map((k) => <div key={k} className="dsk-list__text"><Bar w="40%" h="0.75rem" /><Bar w="60%" h="1rem" /></div>)}</div>
              </Card>
            ))}
          </div>
        </Wrap>
      );

    /* Tables (restaurants list) */
    case 'table':
    case 'list':
      return (
        <Wrap label="Liste yükleniyor" className="dsk-stack">
          <Card className="dsk-panel dsk-filters"><Bar w="100%" h="3rem" r="14px" /><Bar w="9rem" h="3rem" r="14px" /><Bar w="9rem" h="3rem" r="14px" /></Card>
          <Card className="dsk-panel dsk-table">
            <div className="dsk-table__head">{[1, 2, 3, 4, 5].map((i) => <Bar key={i} w="60%" h="0.8rem" />)}</div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div className="dsk-table__row" key={i}>
                <div className="dsk-row"><Bar w="2.4rem" h="2.4rem" r="12px" /><div className="dsk-list__text"><Bar w="70%" h="0.95rem" /><Bar w="45%" h="0.7rem" /></div></div>
                <Bar w="60%" h="1.4rem" r="8px" /><Bar w="70%" h="0.9rem" /><Bar w="5rem" h="1.5rem" r="999px" /><Bar w="55%" h="0.9rem" />
              </div>
            ))}
          </Card>
        </Wrap>
      );

    default:
      return (
        <Wrap label="İçerik yükleniyor" className="dsk-stack">
          <Card className="dsk-panel"><Heading /><Bar w="100%" h="8rem" r="20px" /><Bar w="70%" h="0.9rem" /></Card>
        </Wrap>
      );
  }
};

export default DashboardSkeleton;
