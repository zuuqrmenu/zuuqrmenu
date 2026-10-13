import { Link } from 'react-router-dom';
import { blogPosts } from '../../data/blog/blogPosts';
import { BlogCard } from './BlogParts';
import '../../styles/blog.css';

// The three newest articles; the full archive lives at /blog.
const latest = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

const BlogSection = () => (
  <section className="bl-home" id="blog" aria-labelledby="blog-heading">
    <div className="bl-home__inner">
      <header className="bl-home__head lp3-reveal">
        <div>
          <span className="lp3-label">Blog</span>
          <h2 id="blog-heading">Menünüzü büyüten fikirler.</h2>
          <p>QR menü, menü tasarımı ve restoran yönetimi üzerine kısa, uygulanabilir rehberler.</p>
        </div>
        <Link to="/blog" className="bl-pill">Tüm yazıları gör <i aria-hidden="true">→</i></Link>
      </header>

      <div className="bl-home__grid lp3-reveal lp3-reveal--delay-1">
        {latest.map((post) => <BlogCard key={post.slug} post={post} />)}
      </div>
    </div>
  </section>
);

export default BlogSection;
