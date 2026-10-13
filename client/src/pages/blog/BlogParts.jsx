import { Link } from 'react-router-dom';
import { formatPostDate } from '../../data/blog/blogPosts';

/** Generated cover: a palette per `tone` plus a quiet geometric motif, so no image files are needed. */
export const BlogCover = ({ post, large = false }) => (
  <div className={`bl-cover bl-cover--${post.tone} ${large ? 'bl-cover--large' : ''}`} aria-hidden="true">
    <svg className="bl-cover__art" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="320" cy="60" r="150" opacity="0.22" />
        <circle cx="320" cy="60" r="104" opacity="0.3" />
        <circle cx="320" cy="60" r="58" opacity="0.45" />
        <path d="M-10 230 C 90 170, 170 250, 260 200 S 380 170, 420 205" opacity="0.5" />
      </g>
      <g fill="currentColor" transform="translate(0 52)">
        <rect x="34" y="34" width="28" height="28" rx="6" opacity="0.9" />
        <rect x="70" y="34" width="12" height="12" rx="3" opacity="0.5" />
        <rect x="34" y="70" width="12" height="12" rx="3" opacity="0.5" />
      </g>
    </svg>
    <span className="bl-cover__tag">{post.category}</span>
  </div>
);

export const BlogCard = ({ post, variant = 'default' }) => (
  <article className={`bl-card bl-card--${variant}`}>
    <Link to={`/blog/${post.slug}`} className="bl-card__link" aria-label={post.title}>
      <BlogCover post={post} large={variant === 'featured'} />
      <div className="bl-card__body">
        <p className="bl-card__meta">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readMinutes} dk okuma</span>
        </p>
        <h3 className="bl-card__title">{post.title}</h3>
        <p className="bl-card__excerpt">{post.excerpt}</p>
        <span className="bl-card__more">Yazıyı oku <i aria-hidden="true">→</i></span>
      </div>
    </Link>
  </article>
);
