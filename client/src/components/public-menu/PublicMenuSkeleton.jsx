import React from 'react';

const PublicMenuSkeleton = () => {
  return (
    <div className="public-menu-shell public-menu-shell--skeleton" aria-label="Menü yükleniyor" role="status">
      <div className="public-menu-page">
        {/* Header Skeleton */}
        <header className="public-header public-header--skeleton">
          <div className="public-header__bar">
            <span className="dashboard-skeleton__line pms-control" />
            <div className="pms-identity">
              <span className="dashboard-skeleton__line pms-title" />
              <span className="dashboard-skeleton__line pms-subtitle" />
            </div>
            <span className="dashboard-skeleton__line pms-control" />
          </div>
        </header>

        {/* Category Nav Skeleton */}
        <div className="category-nav category-nav--skeleton">
          <div className="category-nav__inner">
            <span className="dashboard-skeleton__line pms-pill pms-pill--active" />
            <span className="dashboard-skeleton__line pms-pill" />
            <span className="dashboard-skeleton__line pms-pill" />
            <span className="dashboard-skeleton__line pms-pill" />
            <span className="dashboard-skeleton__line pms-pill" />
          </div>
        </div>

        {/* Products Skeleton */}
        <main className="public-menu-content">
          <div className="public-category">
            <div className="public-category__heading">
              <span className="dashboard-skeleton__line pms-cat-heading" />
            </div>
            <div className="public-products">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="public-product public-product--skeleton">
                  <span className="dashboard-skeleton__line pms-thumb" />
                  <div className="public-product__body">
                    <span className="dashboard-skeleton__line pms-prod-title" />
                    <span className="dashboard-skeleton__line pms-prod-desc" />
                    <span className="dashboard-skeleton__line pms-prod-price" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicMenuSkeleton;
