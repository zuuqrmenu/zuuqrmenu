import { useEffect } from 'react';

const removeManagedHead = () => {
  document.querySelectorAll('[data-seo-managed="true"]').forEach((element) => element.remove());
};

const setMeta = (attribute, key, content) => {
  if (!content) return;
  const element = document.createElement('meta');
  element.setAttribute(attribute, key);
  element.setAttribute('content', content);
  element.dataset.seoManaged = 'true';
  document.head.appendChild(element);
};

const setLink = (rel, href) => {
  if (!href) return;
  const element = document.createElement('link');
  element.setAttribute('rel', rel);
  element.setAttribute('href', href);
  element.dataset.seoManaged = 'true';
  document.head.appendChild(element);
};

/**
 * SeoHead — manages all head meta tags reactively.
 *
 * Props:
 *   title        — page <title> and og:title / twitter:title
 *   description  — meta description + og:description + twitter:description
 *   canonical    — canonical URL + og:url
 *   image        — og:image + twitter:image (use absolute 1200×630 PNG/JPG for best results)
 *   ogType       — og:type (default: "website"; use "restaurant.menu" for public menu pages)
 *   structuredData — plain JS object, serialised as application/ld+json
 *   robots       — meta robots (default: "index,follow")
 *   twitterSite  — @handle for twitter:site (optional)
 */
const SeoHead = ({
  title,
  description,
  canonical,
  image,
  ogType = 'website',
  structuredData,
  robots = 'index,follow',
  twitterSite,
}) => {
  useEffect(() => {
    document.documentElement.lang = 'tr';
    document.title = title;
    removeManagedHead();

    // Core
    setMeta('name', 'description', description);
    setMeta('name', 'robots', robots);

    // Open Graph
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:site_name', 'zuuqrmenu');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:locale', 'tr_TR');
    setMeta('property', 'og:image', image);
    if (image) {
      setMeta('property', 'og:image:width', '1200');
      setMeta('property', 'og:image:height', '630');
      setMeta('property', 'og:image:alt', title);
    }

    // Twitter / X
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);
    if (twitterSite) setMeta('name', 'twitter:site', twitterSite);

    // Canonical
    setLink('canonical', canonical);

    // JSON-LD Structured Data
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seoManaged = 'true';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return removeManagedHead;
  }, [canonical, description, image, ogType, robots, structuredData, title, twitterSite]);

  return null;
};

export default SeoHead;

