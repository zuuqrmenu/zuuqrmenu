const SkeletonLine = ({ className = '' }) => <span className={`dashboard-skeleton__line ${className}`} />;

const DashboardSkeleton = ({ variant = 'panel' }) => {
  if (variant === 'overview') {
    return <div className="dashboard-skeleton dashboard-skeleton--overview" aria-label="Dashboard yükleniyor" role="status">
      {[1, 2, 3, 4].map((item) => <div className="dashboard-skeleton__stat" key={item}><SkeletonLine className="dashboard-skeleton__icon" /><SkeletonLine className="dashboard-skeleton__label" /><SkeletonLine className="dashboard-skeleton__value" /><SkeletonLine className="dashboard-skeleton__detail" /></div>)}
    </div>;
  }

  if (variant === 'list') {
    return <div className="dashboard-skeleton dashboard-skeleton--list" aria-label="Liste yükleniyor" role="status">
      <div className="dashboard-skeleton__list-heading"><SkeletonLine className="dashboard-skeleton__heading" /><SkeletonLine className="dashboard-skeleton__short" /></div>
      {[1, 2, 3, 4].map((item) => <div className="dashboard-skeleton__list-row" key={item}><div><SkeletonLine className="dashboard-skeleton__row-title" /><SkeletonLine className="dashboard-skeleton__row-text" /><SkeletonLine className="dashboard-skeleton__row-meta" /></div><SkeletonLine className="dashboard-skeleton__button" /></div>)}
    </div>;
  }

  if (variant === 'analytics') {
    return <div className="dashboard-skeleton dashboard-skeleton--analytics" aria-label="İstatistikler yükleniyor" role="status">
      <div className="dashboard-skeleton__analytics-stats">{[1, 2, 3, 4].map((item) => <div className="dashboard-skeleton__stat" key={item}><SkeletonLine className="dashboard-skeleton__label" /><SkeletonLine className="dashboard-skeleton__value" /><SkeletonLine className="dashboard-skeleton__detail" /></div>)}</div>
      <div className="dashboard-skeleton__analytics-panels"><SkeletonLine className="dashboard-skeleton__chart" /><SkeletonLine className="dashboard-skeleton__chart dashboard-skeleton__chart--small" /></div>
    </div>;
  }

  return <div className="dashboard-skeleton dashboard-skeleton--panel" aria-label="İçerik yükleniyor" role="status">
    <SkeletonLine className="dashboard-skeleton__heading" />
    <SkeletonLine className="dashboard-skeleton__text" />
    <SkeletonLine className="dashboard-skeleton__block" />
    <SkeletonLine className="dashboard-skeleton__text dashboard-skeleton__text--short" />
  </div>;
};

export default DashboardSkeleton;
