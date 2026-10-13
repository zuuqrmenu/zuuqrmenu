import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import LandingZuuAI from '../components/LandingZuuAI';
import { LandingHeader, LandingFooter } from './LandingPage';
import { blogCategories, blogPosts } from '../data/blog/blogPosts';
import { BlogCard } from './blog/BlogParts';
import { getPanelUrl } from '../utils/domainHelpers';
import { trackEvent } from '../utils/analytics';
import '../styles/landing.css';
import '../styles/blog.css';

const sorted = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));

const BlogPage = () => {
  const [category, setCategory] = useState('Tümü');
  const [query, setQuery] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const filtering = category !== 'Tümü' || query.trim() !== '';
  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('tr-TR');
    return sorted.filter((post) => {
      if (category !== 'Tümü' && post.category !== category) return false;
      if (!term) return true;
      return `${post.title} ${post.excerpt} ${post.keywords.join(' ')}`.toLocaleLowerCase('tr-TR').includes(term);
    });
  }, [category, query]);

  const [featured, ...rest] = results;

  return (
    <div className="lp3-page bl-page">
      <SeoHead
        title="Blog: QR Menü, Dijital Menü ve Restoran Yönetimi Rehberleri | zuuqrmenu"
        description="QR menü nasıl kurulur, menü tasarımı nasıl olmalı, ciro nasıl artırılır? Restoran ve kafe işletmecileri için pratik rehberler."
        canonical="https://zuuqrmenu.com/blog"
        image="https://zuuqrmenu.com/og-cover.png"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'zuuqrmenu Blog',
          url: 'https://zuuqrmenu.com/blog',
          inLanguage: 'tr-TR',
          blogPost: sorted.map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            datePublished: post.date,
            url: `https://zuuqrmenu.com/blog/${post.slug}`,
          })),
        }}
      />
      <LandingHeader />

      <main className="bl-main">
        <header className="bl-hero">
          <div className="bl-hero__inner">
            <span className="lp3-label">zuuqrmenu Blog</span>
            <h1>Restoranınız için <em>daha iyi</em> bir menü.</h1>
            <p>QR menü kurulumundan menü mühendisliğine, tasarımdan yapay zekaya: işletmenize doğrudan uygulayabileceğiniz rehberler.</p>

            <div className="bl-tools">
              <div className="bl-filters" role="group" aria-label="Kategoriye göre filtrele">
                {['Tümü', ...blogCategories].map((name) => (
                  <button key={name} type="button" className={category === name ? 'is-active' : ''} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>
                ))}
              </div>
              <label className="bl-search">
                <span className="bl-visually-hidden">Yazılarda ara</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Yazılarda ara" />
              </label>
            </div>
          </div>
        </header>

        <section className="bl-list" aria-label="Blog yazıları">
          {results.length === 0 ? (
            <p className="bl-empty">Aramanızla eşleşen yazı bulunamadı. <button type="button" onClick={() => { setCategory('Tümü'); setQuery(''); }}>Filtreleri temizle</button></p>
          ) : (
            <>
              {!filtering && featured && (
                <div className="bl-feature"><BlogCard post={featured} variant="featured" /></div>
              )}
              <div className="bl-grid">
                {(filtering ? results : rest).map((post) => <BlogCard key={post.slug} post={post} />)}
              </div>
            </>
          )}
        </section>

        <section className="bl-cta">
          <div className="bl-cta__inner">
            <h2>Okuduklarınızı menünüzde deneyin.</h2>
            <p>7 gün ücretsiz deneyin, menünüzü dakikalar içinde yayına alın.</p>
            <a className="bl-pill bl-pill--dark" href={getPanelUrl('/register')} onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'blog_index' })}>Ücretsiz başla <i aria-hidden="true">→</i></a>
            <Link to="/fiyatlandirma" className="bl-link">Fiyatları incele</Link>
          </div>
        </section>
      </main>

      <LandingZuuAI />
      <LandingFooter />
    </div>
  );
};

export default BlogPage;
