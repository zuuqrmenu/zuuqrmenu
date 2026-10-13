import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import LandingZuuAI from '../components/LandingZuuAI';
import { LandingHeader, LandingFooter } from './LandingPage';
import { blogPosts, formatPostDate, getPostMeta, loadPostBody } from '../data/blog/blogPosts';
import { BlogCard, BlogCover } from './blog/BlogParts';
import { getPanelUrl } from '../utils/domainHelpers';
import { trackEvent } from '../utils/analytics';
import '../styles/landing.css';
import '../styles/blog.css';

const slugify = (text) => text
  .toLocaleLowerCase('tr-TR')
  .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const Block = ({ block }) => {
  const [type, content] = block;
  if (type === 'h2') return <h2 id={slugify(content)}>{content}</h2>;
  if (type === 'p') return <p>{content}</p>;
  if (type === 'ul') return <ul>{content.map((item) => <li key={item}>{item}</li>)}</ul>;
  if (type === 'ol') return <ol>{content.map((item) => <li key={item}>{item}</li>)}</ol>;
  if (type === 'tip') return <aside className="bl-tip"><b>zuuqrmenu ile</b><p>{content}</p></aside>;
  return null;
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = getPostMeta(slug);
  const [blocks, setBlocks] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setBlocks(null);
    let alive = true;
    loadPostBody(slug).then((body) => { if (alive) setBlocks(body || []); });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toc = useMemo(() => (blocks || []).filter(([type]) => type === 'h2').map(([, text]) => ({ text, id: slugify(text) })), [blocks]);
  const related = useMemo(() => {
    if (!post) return [];
    const others = blogPosts.filter((item) => item.slug !== post.slug);
    const same = others.filter((item) => item.category === post.category);
    return [...same, ...others.filter((item) => item.category !== post.category)].slice(0, 3);
  }, [post]);

  if (!post) return <Navigate to="/blog" replace />;

  const url = `https://zuuqrmenu.com/blog/${post.slug}`;

  return (
    <div className="lp3-page bl-page">
      <SeoHead
        title={`${post.title} | zuuqrmenu Blog`}
        description={post.excerpt}
        canonical={url}
        image="https://zuuqrmenu.com/og-cover.png"
        ogType="article"
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.excerpt,
              datePublished: post.date,
              dateModified: post.date,
              inLanguage: 'tr-TR',
              keywords: post.keywords.join(', '),
              mainEntityOfPage: url,
              image: 'https://zuuqrmenu.com/og-cover.png',
              author: { '@type': 'Organization', name: 'zuuqrmenu' },
              publisher: { '@type': 'Organization', name: 'zuuqrmenu', logo: { '@type': 'ImageObject', url: 'https://zuuqrmenu.com/logo.svg' } },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://zuuqrmenu.com/' },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://zuuqrmenu.com/blog' },
                { '@type': 'ListItem', position: 3, name: post.title, item: url },
              ],
            },
          ],
        }}
      />
      <div className="bl-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <LandingHeader />

      <main className="bl-main">
        <header className="bl-article-head">
          <nav className="bl-crumbs" aria-label="Sayfa yolu">
            <Link to="/">Ana Sayfa</Link><span aria-hidden="true">/</span><Link to="/blog">Blog</Link>
          </nav>
          <p className="bl-article-head__cat">{post.category}</p>
          <h1>{post.title}</h1>
          <p className="bl-article-head__lede">{post.excerpt}</p>
          <p className="bl-card__meta">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readMinutes} dk okuma</span>
          </p>
        </header>

        <div className="bl-article-cover"><BlogCover post={post} large /></div>

        <div className="bl-article-layout">
          {toc.length > 0 && (
            <nav className="bl-toc" aria-label="İçindekiler">
              <p>İçindekiler</p>
              <ol>{toc.map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.text}</a></li>)}</ol>
            </nav>
          )}

          <article className="bl-prose">
            {blocks === null && <p className="bl-loading">Yazı yükleniyor…</p>}
            {blocks && blocks.map((block, index) => <Block key={index} block={block} />)}

            <div className="bl-endcta">
              <h2>Menünüzü şimdi dijitale taşıyın</h2>
              <p>zuuqrmenu ile 7 gün ücretsiz deneyin; kredi kartı gerekmez.</p>
              <a className="bl-pill bl-pill--dark" href={getPanelUrl('/register')} onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'blog_post' })}>Ücretsiz başla <i aria-hidden="true">→</i></a>
            </div>
          </article>
        </div>

        <section className="bl-related" aria-labelledby="related-heading">
          <div className="bl-related__inner">
            <h2 id="related-heading">Bunlar da ilginizi çekebilir</h2>
            <div className="bl-home__grid">
              {related.map((item) => <BlogCard key={item.slug} post={item} />)}
            </div>
          </div>
        </section>
      </main>

      <LandingZuuAI />
      <LandingFooter />
    </div>
  );
};

export default BlogPostPage;
