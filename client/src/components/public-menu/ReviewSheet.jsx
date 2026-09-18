import { useState } from 'react';
import { publicMenuService } from '../../services/publicMenuService';
import { trackEvent } from '../../utils/analytics';

const ReviewSheet = ({ username, onClose, onSubmitted, themeKey, mode }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', comment: '', rating: 0 });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const isGrid = themeKey === 'GRID';
  const activeMode = mode || (isGrid ? 'DARK' : 'LIGHT');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+()\d\s.-]{7,25}$/;
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!form.name.trim() || form.name.trim().length > 120) return setError('Adınız zorunlu ve 120 karakteri geçemez.');
    if (!emailPattern.test(form.email.trim())) return setError('Geçerli bir e-posta adresi girin.');
    if (!phonePattern.test(form.phone.trim())) return setError('Geçerli bir telefon numarası girin.');
    if (form.comment.trim().length < 5 || form.comment.trim().length > 1000) return setError('Yorum en az 5, en fazla 1000 karakter olmalıdır.');
    if (!form.rating) return setError('Lütfen 1-5 yıldız arasında puan verin.');
    setSaving(true);
    try {
      await publicMenuService.submitReview(username, form);
      trackEvent('submit_review', {
        restaurant_username: username,
        rating: form.rating,
      });
      setSuccess(true);
      onSubmitted?.();
    } catch (err) { setError(err.response?.data?.error || 'Değerlendirme gönderilemedi.'); } finally { setSaving(false); }
  };

  if (isGrid) {
    return (
      <div
        className="public-modal-backdrop public-modal-backdrop--grid public-review-backdrop--grid"
        data-theme={themeKey}
        data-mode={activeMode}
        role="presentation"
        onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      >
        <div
          className="public-modal public-modal--grid public-review-modal--grid"
          data-theme={themeKey}
          data-mode={activeMode}
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-title"
        >
          <button type="button" className="public-modal__close" onClick={onClose} aria-label="Kapat">×</button>
          {success ? (
            <div className="grid-review-success">
              <div className="grid-review-success__icon">★</div>
              <h2>Teşekkürler!</h2>
              <p>Değerlendirmeniz ve görüşleriniz başarıyla iletildi.</p>
              <button type="button" className="grid-review-submit-btn" onClick={onClose}>Tamam</button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid-review-form">
              <div className="grid-review-head">
                <h2 id="review-title">Bizi Değerlendirin</h2>
                <p>Görüşleriniz ve geri bildirimleriniz bizim için çok değerli.</p>
              </div>

              <div className="grid-review-stars" aria-label="Yıldız puanı">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    aria-label={`${star} yıldız`}
                    className={`grid-star-btn ${form.rating >= star ? 'is-selected' : ''}`}
                    onClick={() => setForm((current) => ({ ...current, rating: star }))}
                  >
                    ★
                  </button>
                ))}
              </div>

              {error && <p className="grid-review-error">{error}</p>}

              <div className="grid-review-inputs">
                <label className="grid-review-field">
                  <span>Adınız</span>
                  <input
                    name="name"
                    type="text"
                    placeholder="Adınız Soyadınız"
                    value={form.name}
                    onChange={update}
                    required
                  />
                </label>

                <div className="grid-review-row">
                  <label className="grid-review-field">
                    <span>E-posta</span>
                    <input
                      name="email"
                      type="email"
                      placeholder="ornek@mail.com"
                      value={form.email}
                      onChange={update}
                      required
                    />
                  </label>

                  <label className="grid-review-field">
                    <span>Telefon</span>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      value={form.phone}
                      onChange={update}
                      required
                    />
                  </label>
                </div>

                <label className="grid-review-field">
                  <span>Yorumunuz</span>
                  <textarea
                    name="comment"
                    value={form.comment}
                    onChange={update}
                    maxLength="1000"
                    rows="3"
                    placeholder="Yemeklerimiz ve servisimiz hakkındaki düşünceleriniz..."
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                className="grid-review-submit-btn"
                disabled={saving}
              >
                {saving ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="public-sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="public-sheet" role="dialog" aria-modal="true" aria-labelledby="review-title">
        <div className="sheet-handle" />
        <button type="button" className="public-modal__close" onClick={onClose} aria-label="Kapat">×</button>
        {success ? (
          <div className="review-success">
            <h2>Teşekkürler!</h2>
            <p>Değerlendirmeniz başarıyla gönderildi.</p>
            <button type="button" className="sheet-primary-button" onClick={onClose}>Kapat</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 id="review-title">Değerlendirmeniz</h2>
            <div className="star-input" aria-label="Yıldız puanı">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} aria-label={`${star} yıldız`} className={form.rating >= star ? 'is-selected' : ''} onClick={() => setForm((current) => ({ ...current, rating: star }))}>★</button>
              ))}
            </div>
            {error && <p className="sheet-error">{error}</p>}
            {[['name','Adınız','text'],['email','E-posta','email'],['phone','Telefon','tel']].map(([name,label,type]) => (
              <label key={name}>{label}<input name={name} type={type} value={form[name]} onChange={update} /></label>
            ))}
            <label>Yorumunuz<textarea name="comment" value={form.comment} onChange={update} maxLength="1000" rows="4" /></label>
            <button type="submit" className="sheet-primary-button" disabled={saving}>{saving ? 'Gönderiliyor...' : 'Gönder'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewSheet;