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

const SeoHead = ({ title, description, canonical, image, structuredData, robots = 'index,follow' }) => {
  useEffect(() => {
    document.documentElement.lang = 'tr';
    document.title = title;
    removeManagedHead();
    setMeta('name', 'description', description);
    setMeta('name', 'robots', robots);
    setMeta('property', 'og:type', 'restaurant.menu');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:locale', 'tr_TR');
    setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);
    setLink('canonical', canonical);

    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seoManaged = 'true';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return removeManagedHead;
  }, [canonical, description, image, robots, structuredData, title]);

  return null;
};

export default SeoHead;
