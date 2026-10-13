import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../../utils/analytics';
import { getPanelUrl } from '../../utils/domainHelpers';

/* ═══════════════════════════════════════════════════════════════
   SHARED BITS
   ═══════════════════════════════════════════════════════════════ */
const photo = (name) => `/landing/${name}.webp`;
const DEMO_QR_TARGET = 'https://zuuqrmenu.com/menu';

const Arrow = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
  </svg>
);

/** Pill button with the trailing icon sitting in its own circle. */
export const Btn = ({ href, to, variant = 'solid', onClick, onMouseEnter, onTouchStart, children }) => {
  const props = {
    className: `lp4-btn lp4-btn--${variant}`,
    onClick,
    onMouseEnter,
    onTouchStart,
  };
  const inner = (
    <>
      <span>{children}</span>
      <span className="lp4-btn__icon"><Arrow /></span>
    </>
  );
  return to ? <Link to={to} {...props}>{inner}</Link> : <a href={href} {...props}>{inner}</a>;
};

/** Real, scannable QR that opens the public demo menus. Loaded on idle so it never blocks first paint. */
const useQrSvg = (value) => {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    let live = true;
    import('qrcode')
      .then(({ default: QRCode }) => QRCode.toString(value, {
        type: 'svg',
        margin: 0,
        errorCorrectionLevel: 'M',
        color: { dark: '#11160f', light: '#0000' },
      }))
      .then((out) => { if (live) setSvg(out); })
      .catch(() => {});
    return () => { live = false; };
  }, [value]);
  return svg;
};

const Qr = ({ svg, label }) => (
  <div className="lp4-qr" role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />
);

/* ─── Phone menu screen (hero + story share it) ─────────────── */
const MenuScreen = ({ status = 'Menü aktif', chips, items, eager = false }) => (
  <div className="lp4-screen">
    <div className="lp4-screen__top">
      <strong>La Cucina</strong>
      <span className="lp4-screen__live"><i aria-hidden="true" />{status}</span>
    </div>
    <div className="lp4-screen__chips">
      {chips.map((c, i) => <span key={c} className={i === 0 ? 'is-on' : ''}>{c}</span>)}
    </div>
    <ul className="lp4-screen__list">
      {items.map((it) => (
        <li
          key={it.id}
          className={[
            it.hot ? 'is-hot' : '',
            it.out ? 'is-out' : '',
            it.feature ? 'is-feature' : '',
          ].join(' ')}
        >
          <img src={photo(it.photo)} alt="" width="72" height="72" loading={eager ? 'eager' : 'lazy'} decoding="async" />
          <div className="lp4-screen__meta">
            <p className="lp4-screen__name">
              {it.name}
              {it.feature && <em>Günün spesiyali</em>}
            </p>
            <p className="lp4-screen__desc">{it.out ? 'Bugünlük tükendi' : it.desc}</p>
          </div>
          <span className="lp4-screen__price">
            {it.old && <s>{it.old}</s>}
            {it.price}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const Phone = ({ children, className = '' }) => (
  <div className={`lp4-phone ${className}`}>
    <div className="lp4-phone__island" aria-hidden="true" />
    <div className="lp4-phone__glass">{children}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   HERO — a table seen from above
   ═══════════════════════════════════════════════════════════════ */
const HERO_ITEMS = [
  { id: 'h1', name: 'Margherita', desc: 'Manda mozzarella, fesleğen', price: '₺360', photo: 'margherita' },
  { id: 'h2', name: 'Dört Peynir', desc: 'Gorgonzola, parmesan, mozzarella', price: '₺340', photo: 'dort-peynir' },
  { id: 'h3', name: 'Penne Arrabbiata', desc: 'Acılı domates sosu, fesleğen', price: '₺260', photo: 'penne-arrabbiata' },
  { id: 'h4', name: 'Paçanga Böreği', desc: 'Pastırma, kaşar, biber', price: '₺240', photo: 'pacanga-boregi' },
  { id: 'h5', name: 'Tiramisu', desc: 'Mascarpone, espresso, kakao', price: '₺210', photo: 'tiramisu' },
  { id: 'h6', name: 'Çikolatalı Sufle', desc: 'Sıcak, akışkan çikolata', price: '₺190', photo: 'cikolatali-sufle' },
];

const PLATES = [
  { name: 'humus', size: 120, left: '58%', top: '-1%', speed: 0.07, rot: 40, tag: null },
  { name: 'klasik-burger', size: 184, left: '-6%', top: '48%', speed: -0.1, rot: -26, tag: 'Klasik Burger ₺290' },
  { name: 'firinda-somon', size: 140, left: '70%', top: '70%', speed: 0.12, rot: 30, tag: null },
  { name: 'cilekli-ev-yapimi-limonata', size: 92, left: '8%', top: '8%', speed: -0.18, rot: 60, tag: null },
  { name: 'san-sebastian-cheesecake', size: 108, left: '78%', top: '30%', speed: -0.14, rot: -40, tag: 'San Sebastian ₺230' },
  { name: 'turk-kahvesi', size: 78, left: '38%', top: '92%', speed: 0.2, rot: 90, tag: null },
];

export const Hero = ({ prefetch }) => {
  const qr = useQrSvg(DEMO_QR_TARGET);

  return (
    <section className="lp4-hero" id="anasayfa" data-scene="range" data-start="0" data-end="-1" aria-label="Giriş">
      <div className="lp4-hero__inner">
        <div className="lp4-hero__copy">
          <h1 className="lp4-hero__title">
            <span className="lp4-line"><span>Menünüz artık</span></span>
            <span className="lp4-line"><span>masada değil.</span></span>
          </h1>

          <p className="lp4-hero__sub">
            QR kodunuzu okutun, menünüz saniyeler içinde müşterinizin telefonunda.
            Fiyatları, ürünleri ve stok durumunu tek bir yerden anında yönetin.
          </p>

          <div className="lp4-hero__actions">
            <Btn href={getPanelUrl('/register')} onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'hero' })}>
              Ücretsiz başla
            </Btn>
            <Btn
              to="/menu"
              variant="ghost"
              onClick={() => trackEvent('click_cta', { cta_name: 'demo', location: 'hero' })}
              onMouseEnter={prefetch}
              onTouchStart={prefetch}
            >
              Demo menüyü gör
            </Btn>
          </div>

          <ul className="lp4-hero__proof">
            <li>Kodsuz, dakikalar içinde kurulum</li>
            <li>Fiyat güncellemesi tek tıkla</li>
            <li>Uygulama indirmeden her telefonda</li>
          </ul>
        </div>

        <div className="lp4-hero__stage" aria-hidden="true">
          <div className="lp4-hero__table" />

          {PLATES.map((p, i) => (
            <div
              key={p.name}
              className="lp4-plate"
              data-speed={p.speed}
              style={{ '--s': p.size, left: p.left, top: p.top, '--r': p.rot, '--i': i }}
            >
              <img src={photo(p.name)} alt="" width="320" height="320" loading="eager" decoding="async" />
              {p.tag && <span className="lp4-plate__tag">{p.tag}</span>}
            </div>
          ))}

          <div className="lp4-hero__phone" data-speed="-0.04">
            <Phone>
              <MenuScreen chips={['Pizzalar', 'Başlangıç', 'Tatlılar']} items={HERO_ITEMS} eager />
            </Phone>
          </div>

          <div className="lp4-tent" data-speed="0.05">
            <span>Menü için okutun</span>
            <Qr svg={qr} label="zuuqrmenu demo menüsünü açan QR kod" />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PROBLEM — words light up as you read
   ═══════════════════════════════════════════════════════════════ */
const PROBLEM_TEXT = 'Menü değişti. Fiyat değişti. Stok bitti. Ama basılı menü hâlâ masada.';

const problemPoints = [
  {
    title: 'Basılı menü ilk günden eskir.',
    text: 'Maliyetler ve fiyatlar sürekli değişiyor ama masadaki kâğıt eskisini gösteriyor. Müşteri kafa karışıklığı yaşıyor, garson mahcup oluyor.',
  },
  {
    title: 'Her güncelleme matbaa masrafı.',
    text: 'Tasarım, onay, baskı, dağıtım. Hem bütçe hem günler harcanıyor ve bir ay sonra aynı döngü yeniden başlıyor.',
  },
  {
    title: 'zuuqrmenu ile bir kez kurun.',
    text: 'QR kodunuzu masaya bir kez yerleştirin. Sonraki tüm değişiklikleri panelinizden saniyeler içinde yapın, tüm masalar anında güncellensin.',
    answer: true,
  },
];

export const ProblemSection = () => {
  const words = PROBLEM_TEXT.split(' ');
  return (
    <section className="lp4-problem" id="urun">
      <div className="lp4-problem__read" data-scene="range" data-start="0.82" data-end="0.18">
        <p className="lp4-words" aria-label={PROBLEM_TEXT}>
          {words.map((w, i) => (
            <span key={i} className="lp4-word" style={{ '--i': i, '--n': words.length }} aria-hidden="true">{w} </span>
          ))}
        </p>
      </div>

      <ol className="lp4-problem__points">
        {problemPoints.map((pt) => (
          <li key={pt.title} className={pt.answer ? 'is-answer' : ''}>
            <h3>{pt.title}</h3>
            <p>{pt.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STORY — sticky phone, steps drive it
   ═══════════════════════════════════════════════════════════════ */
const storySteps = [
  { title: 'Menünüzü oluşturun.', desc: 'Kategorilerinizi ve ürünlerinizi birkaç tıklamayla ekleyin. Fotoğraf, açıklama, fiyat.', panel: 'Ürün eklendi' },
  { title: 'Fiyatı saniyeler içinde değiştirin.', desc: 'Enflasyon, mevsim, kampanya: neden olursa olsun fiyatlar anında güncellenir.', panel: 'Margherita ₺320 → ₺360' },
  { title: 'Stok durumunu anında yönetin.', desc: 'Bir ürün mü bitti? Tek tıkla stok dışı yapın. Müşteri boşuna sipariş vermesin.', panel: 'Fırında Somon stok dışı' },
  { title: 'Özel lezzetleri öne çıkarın.', desc: 'Günün spesiyalini ya da şefin önerisini vitrine taşıyın, satışları artırın.', panel: 'Tiramisu öne çıkarıldı' },
  { title: 'Tüm masalarda anında yayında.', desc: 'Masadaki QR kod okutulduğunda müşteriniz en güncel menüyü görür.', panel: 'Menü yayında' },
];

const storyItems = (active) => [
  { id: 's1', name: 'Margherita', desc: 'Manda mozzarella, fesleğen', price: '₺360', old: active === 1 ? '₺320' : null, photo: 'margherita', hot: active === 1 },
  { id: 's2', name: 'Fırında Somon', desc: 'Tereyağlı mevsim sebzeleri', price: '₺520', photo: 'firinda-somon', out: active === 2 },
  { id: 's3', name: 'Tiramisu', desc: 'Mascarpone, espresso, kakao', price: '₺210', photo: 'tiramisu', feature: active === 3 },
  { id: 's4', name: 'Humus', desc: 'Tahin, limon, sızma zeytinyağı', price: '₺180', photo: 'humus' },
  { id: 's5', name: 'Dört Peynir', desc: 'Gorgonzola, parmesan, mozzarella', price: '₺340', photo: 'dort-peynir' },
  { id: 's6', name: 'Çıtır Tavuklu Sezar', desc: 'Marul, parmesan, kruton', price: '₺280', photo: 'citir-tavuklu-sezar' },
];

const STATUS = ['Menü hazır', 'Fiyat güncellendi', 'Stok güncellendi', 'Öne çıkan eklendi', 'Yayında'];

export const ScrollStory = () => {
  const [active, setActive] = useState(0);
  const stepRefs = useRef([]);
  const [thumb, setThumb] = useState({ y: 0, h: 0 });

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setActive(Number(e.target.dataset.index));
      }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const place = () => {
      const el = stepRefs.current[active];
      if (el) setThumb({ y: el.offsetTop, h: el.offsetHeight });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [active]);

  const jump = (i) => stepRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <section className="lp4-story" id="nasil-calisir">
      <div className="lp4-story__inner">
        <header className="lp4-story__head">
          <h2>Bir değişiklik.<br />Her masada anında güncel.</h2>
          <p>Panelde yaptığınız her düzenleme, telefondaki menüye aynı anda yansır.</p>
        </header>

        <div className="lp4-story__steps">
          <span className="lp4-story__thumb" aria-hidden="true" style={{ transform: `translateY(${thumb.y}px)`, height: thumb.h }} />
          {storySteps.map((s, i) => (
            <button
              type="button"
              key={s.title}
              ref={(el) => { stepRefs.current[i] = el; }}
              data-index={i}
              className={`lp4-step ${active === i ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}
              aria-current={active === i ? 'step' : undefined}
              onClick={() => jump(i)}
            >
              <span className="lp4-step__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="lp4-step__body">
                <span className="lp4-step__title">{s.title}</span>
                <span className="lp4-step__desc">{s.desc}</span>
                <span className="lp4-step__tag">{s.panel}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="lp4-story__device">
          <div className="lp4-story__sticky">
            <div className="lp4-story__stage">
            <div className="lp4-panelchip" key={active} aria-live="polite">
              <span className="lp4-panelchip__dot" aria-hidden="true" />
              <span><small>Panel</small>{storySteps[active].panel}</span>
            </div>
            <Phone>
              <MenuScreen status={STATUS[active]} chips={['Pizzalar', 'Ana yemek', 'Tatlılar']} items={storyItems(active)} />
              <div className={`lp4-tables ${active === 4 ? 'is-on' : ''}`} aria-hidden="true">
                <span>Masalarda yayında</span>
                <div>{[1, 2, 3, 4, 5, 6].map((n) => <i key={n} style={{ '--i': n }} />)}</div>
              </div>
            </Phone>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ZUUAI — printed menu in, structured menu out
   ═══════════════════════════════════════════════════════════════ */
const PRINTED = [
  ['Humus', '180'],
  ['Paçanga Böreği', '240'],
  ['Patlıcan Söğürme', '190'],
  ['Çıtır Tavuk Parçaları', '280'],
];

export const UploadSection = () => (
  <section className="lp4-ai" id="zuuai">
    <div className="lp4-ai__inner">
      <div className="lp4-ai__copy">
        <p className="lp4-ai__badge"><span aria-hidden="true">✦</span> ZuuAI ile otomatik yükleme</p>
        <h2>Menünüz zaten hazırsa, tek tek yeniden yazmayın.</h2>
        <p className="lp4-ai__body">
          Mevcut menünüzün fotoğrafını ya da PDF dosyasını yükleyin. ZuuAI kategorileri, ürün adlarını ve fiyatları
          okuyup dijital menünüze aktarsın.
        </p>
        <Btn variant="lime" href={getPanelUrl('/register')} onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'upload' })}>
          Menünüzü yükleyin
        </Btn>
      </div>

      <div className="lp4-ai__stage" data-scene="range" data-start="0.9" data-end="0.2" role="img" aria-label="Basılı menü fotoğrafının ZuuAI ile ürün listesine dönüşmesi">
        <div className="lp4-paper" aria-hidden="true">
          <p className="lp4-paper__title">Başlangıçlar</p>
          {PRINTED.map(([n, pr]) => (
            <p className="lp4-paper__row" key={n}><span>{n}</span><i /><b>{pr}</b></p>
          ))}
          <div className="lp4-paper__scan" />
        </div>

        <div className="lp4-parsed" aria-hidden="true">
          <p className="lp4-parsed__head"><span>Başlangıçlar</span><small>4 ürün bulundu</small></p>
          {PRINTED.map(([n, pr], i) => (
            <p className="lp4-parsed__row" key={n} style={{ '--i': i }}>
              <span>{n}</span>
              <b>₺{pr}</b>
            </p>
          ))}
          <p className="lp4-parsed__done">Menü hazır, yayına alabilirsiniz</p>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS
   ═══════════════════════════════════════════════════════════════ */
const DAYS = [
  ['Pzt', 35], ['Sal', 52], ['Çar', 41], ['Per', 68], ['Cum', 58], ['Cmt', 82], ['Paz', 100],
];

export const AnalyticsSection = () => (
  <section className="lp4-analytics">
    <div className="lp4-analytics__inner">
      <div className="lp4-analytics__copy">
        <h2>Menünüzü yalnızca yayınlamayın, müşteri ilgisini ölçün.</h2>
        <p>
          Hangi yemekler daha çok inceleniyor? Hangi saatlerde menü trafiği artıyor?
          Paneldeki ziyaretçi ve menü analitiğiyle menünüzü kârlı ürünlere göre düzenleyin.
        </p>
        <Btn variant="ghost" href={getPanelUrl('/register')} onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'analytics' })}>
          Analitiği keşfedin
        </Btn>
      </div>

      <figure className="lp4-chart" data-scene="range" data-start="0.95" data-end="0.35">
        <figcaption>
          <span>Menü görüntülenme trafiği</span>
          <small>Örnek veri · son 7 gün</small>
        </figcaption>
        <dl className="lp4-chart__stats">
          <div><dt>QR tarama</dt><dd>1.420</dd></div>
          <div><dt>Aktif kategori</dt><dd>12</dd></div>
          <div><dt>İncelenen ürün</dt><dd>64</dd></div>
        </dl>
        <div className="lp4-chart__bars" role="img" aria-label="Haftalık görüntülenme grafiği">
          {DAYS.map(([d, h], i) => (
            <div className="lp4-bar" key={d} style={{ '--h': `${h}%`, '--i': i }}>
              <span className="lp4-bar__fill" />
              <small>{d}</small>
            </div>
          ))}
        </div>
      </figure>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   HOW IT WORKS — a real 3-step sequence
   ═══════════════════════════════════════════════════════════════ */
export const HowItWorks = () => {
  const qr = useQrSvg(DEMO_QR_TARGET);
  return (
    <section className="lp4-how">
      <div className="lp4-how__inner">
        <header>
          <h2>Üç adımda dijital menünüz hazır.</h2>
          <p>Teknik bilgi gerekmez. Bugün başlayın, dakikalar içinde masalarınıza koyun.</p>
        </header>

        <ol className="lp4-how__steps" data-scene="range" data-start="0.9" data-end="0.4">
          <li>
            <span className="lp4-how__num">1</span>
            <h3>Restoranınızı kaydedin.</h3>
            <p>Restoran adınızı girin, menünüzü oluşturun ya da ZuuAI ile tek tıkla yükleyin.</p>
          </li>
          <li>
            <span className="lp4-how__num">2</span>
            <h3>QR kodunuzu indirin.</h3>
            <p>Masa kartınızı otomatik oluşturun, yüksek çözünürlükte indirin ya da doğrudan baskıya verin.</p>
            <div className="lp4-how__qr" aria-hidden="true"><Qr svg={qr} label="" /></div>
          </li>
          <li>
            <span className="lp4-how__num">3</span>
            <h3>Müşteriniz hemen ulaşsın.</h3>
            <p>Kamerayla okutulan menü anında açılır. Uygulama indirmek ya da beklemek gerekmez.</p>
          </li>
        </ol>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════════════ */
const testimonialsList = [
  {
    name: 'Ahmet Yılmaz',
    role: 'Kurucu Şef, Trattoria Bella (İstanbul)',
    quote: 'Kâğıt menü bastırmaktan ve her fiyat değişikliğinde matbaayla haftalarca uğraşmaktan kurtulduk. zuuqrmenu ile 10 saniyede fiyatlar tüm masalarda güncelleniyor. Müşteri memnuniyetimiz ciddi oranda arttı.',
  },
  {
    name: 'Zeynep Karaca',
    role: 'İşletmeci, Kahve Fabrikası (İzmir)',
    quote: 'ZuuAI menü yükleme özelliği bize inanılmaz bir kolaylık sağladı. Eski PDF menümüzü yükledik, 2 dakikada kategorilere ayrılmış bir dijital menümüz oldu.',
  },
  {
    name: 'Emre Demir',
    role: 'Genel Koordinatör, The Garden Bistro & Lounge (Ankara)',
    quote: 'Modern Bento Grid temasına geçtikten sonra müşterilerimizin menüde gezinme süresi ve özel lezzetleri keşfetme oranı %40 arttı. QR masa kartlarının şıklığı da mekânımıza çok yakıştı.',
  },
];

const initials = (name) => name.split(' ').map((w) => w[0]).join('');

export const Testimonials = () => {
  const [lead, ...rest] = testimonialsList;
  return (
    <section className="lp4-voices" id="yorumlar">
      <div className="lp4-voices__inner">
        <h2 className="lp4-voices__title">Restoranlar ne diyor?</h2>

        <figure className="lp4-voice lp4-voice--lead">
          <blockquote>“{lead.quote}”</blockquote>
          <figcaption>
            <span className="lp4-voice__avatar">{initials(lead.name)}</span>
            <span><b>{lead.name}</b>{lead.role}</span>
          </figcaption>
        </figure>

        {rest.map((t) => (
          <figure className="lp4-voice" key={t.name}>
            <blockquote>“{t.quote}”</blockquote>
            <figcaption>
              <span className="lp4-voice__avatar">{initials(t.name)}</span>
              <span><b>{t.name}</b>{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════════════ */
export const faqItems = [
  { q: 'QR menü nedir ve nasıl çalışır?', a: 'QR menü, müşterilerinizin telefon kamerasıyla masadaki QR kodu okutarak dijital olarak görüntüleyebildiği modern bir menüdür. Uygulama indirmeye gerek kalmadan saniyeler içinde doğrudan tarayıcıda açılır.' },
  { q: 'Müşterilerimin uygulama indirmesi gerekir mi?', a: 'Hayır. Standart telefon kamerasıyla masadaki QR kodu okuttukları anda menünüz mobil tarayıcıda açılır.' },
  { q: 'Fiyatları ve stokları ne kadar sürede güncelleyebilirim?', a: 'Yönetim panelinizden ya da cep telefonunuzdan bir fiyatı veya stok durumunu değiştirdiğiniz an (ortalama 1 saniye içinde) masalardaki tüm QR menülerde değişiklik geçerli olur.' },
  { q: 'Basılı menümü dijital menüye nasıl aktarırım?', a: 'ZuuAI asistanı sayesinde mevcut menünüzün fotoğrafını ya da PDF dosyasını yüklemeniz yeterli. Yapay zekâ ürünleri, açıklamaları ve fiyatları ayrıştırıp menünüze ekler.' },
  { q: 'Ücretsiz deneme var mı? Kredi kartı gerekli mi?', a: 'Evet. Tüm paketleri 7 gün boyunca ücret ödemeden ve kredi kartı bilgisi girmeden tüm özellikleriyle deneyebilirsiniz.' },
];

export const FaqSection = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="lp4-faq" id="sss">
      <div className="lp4-faq__inner">
        <header className="lp4-faq__head">
          <h2>Aklınıza takılan her şey.</h2>
          <p>Cevabı burada bulamazsanız sağ alttaki ZuuAI asistanına sorabilirsiniz.</p>
        </header>

        <div className="lp4-faq__list">
          {faqItems.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={item.q} className={`lp4-qa ${isOpen ? 'is-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${idx}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${idx}`}
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                  >
                    <span>{item.q}</span>
                    <i aria-hidden="true" />
                  </button>
                </h3>
                <div className="lp4-qa__panel" id={`faq-a-${idx}`} role="region" aria-labelledby={`faq-q-${idx}`}>
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════════ */
export const FinalCta = ({ prefetch }) => {
  const qr = useQrSvg(DEMO_QR_TARGET);
  return (
    <section className="lp4-cta" data-scene>
      <div className="lp4-cta__inner">
        <div className="lp4-cta__copy">
          <h2>Kâğıt menü devrini bugün kapatın.</h2>
          <p>Dakikalar içinde modern dijital QR menünüze geçin. İlk 7 gün ücretsiz, kredi kartı gerekmez.</p>
          <div className="lp4-cta__actions">
            <Btn variant="lime" href={getPanelUrl('/register')} onClick={() => trackEvent('click_cta', { cta_name: 'register', location: 'final_cta' })}>
              7 gün ücretsiz başlayın
            </Btn>
            <Btn variant="line" to="/menu" onMouseEnter={prefetch}>Demo menüleri inceleyin</Btn>
          </div>
        </div>

        <div className="lp4-cta__art" aria-hidden="true">
          <div className="lp4-cta__plate lp4-cta__plate--a" data-speed="-0.08"><img src={photo('margherita')} alt="" width="320" height="320" loading="lazy" decoding="async" /></div>
          <div className="lp4-cta__plate lp4-cta__plate--b" data-speed="0.1"><img src={photo('tiramisu')} alt="" width="320" height="320" loading="lazy" decoding="async" /></div>
          <div className="lp4-cta__card" data-speed="0.04">
            <Qr svg={qr} label="" />
            <span>zuuqrmenu.com/menu</span>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   THEMES — default + bento, switchable
   ═══════════════════════════════════════════════════════════════ */
const themesData = [
  {
    id: 'default',
    name: 'Varsayılan',
    desc: 'Temiz, sade ve her restorana yakışan klasik QR menü deneyimi. Üstte hikaye (story) halkaları, net kategori sekmeleri ve akıcı ürün listesi.',
    features: ['Hikaye (Story) önizleme çemberleri', 'Hızlı kategori navigasyonu', 'Kapsamlı ürün detay modalı', 'Yüksek okunabilirlik'],
    accent: '#deff36',
  },
  {
    id: 'modern',
    name: 'Modern (Bento Grid)',
    desc: 'Görsel odaklı Bento Grid kart düzeni. Öne çıkan spesiyaller, zengin fotoğraf blokları ve premium restoranlara özel lüks bir keşif deneyimi.',
    features: ['Bento grid görsel kart düzeni', 'Öne çıkan şefin spesiyali vitrini', 'Fotoğraf ve lezzet odaklı keşif', 'Akıcı mikro animasyonlar'],
    accent: '#a78bfa',
  },
];

const ThemePhone = ({ theme }) => {
  const isDefault = theme.id === 'default';

  return (
    <div className="lp3-theme-device-frame lp3-theme-device-frame--switchable" aria-label={`${theme.name} tema önizlemesi`}>
      <div className="lp3-theme-device-notch" aria-hidden="true" />
      <div className={`lp3-phone-screen lp3-phone-screen--default ${isDefault ? 'is-active' : 'is-inactive'}`} aria-hidden="true">
        {/* Header with Dark Premium Gradient */}
          <div className="lp3-d-header" style={{ background: 'linear-gradient(180deg, #2b2c30 0%, #18191c 100%)' }}>
            <div className="lp3-d-topbar">
              <span className="lp3-m-topbar__btn lp3-m-topbar__btn--light">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </span>
              <span className="lp3-d-header__title">Varsayılan Tema</span>
              <span className="lp3-m-topbar__btn lp3-m-topbar__btn--light">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="3" />
                </svg>
              </span>
            </div>
          </div>

          {/* Horizontal Category Nav */}
          <div className="lp3-d-tabs">
            <span className="lp3-d-tab lp3-d-tab--active">Başlangıçlar</span>
            <span className="lp3-d-tab">Çorbalar</span>
            <span className="lp3-d-tab">Salatalar</span>
            <span className="lp3-d-tab">Ana Yemekler</span>
            <span className="lp3-d-tab">Burgerler</span>
          </div>

          {/* Content Scroll Area */}
          <div className="lp3-d-scroll">
            {/* Stories Section with Brand Lime Rings */}
            <div className="lp3-d-stories-box">
              <div className="lp3-d-stories-title">ÖNE ÇIKANLAR</div>
              <div className="lp3-d-stories-strip">
                {[
                  { name: 'Humus', photo: 'humus' },
                  { name: 'Mercimek', photo: 'mercimek-corbasi' },
                  { name: 'Sezar', photo: 'citir-tavuklu-sezar' },
                  { name: 'Külbastı', photo: 'kofte-izgara' },
                  { name: 'Burger', photo: 'klasik-burger' },
                  { name: 'Margherita', photo: 'margherita' },
                  { name: 'Penne', photo: 'penne-arrabbiata' },
                  { name: 'Tatlı', photo: 'tiramisu' },
                ].map((s, i) => (
                  <div key={i} className="lp3-d-story-item">
                    <div className="lp3-d-story-ring">
                      <div className="lp3-d-story-avatar" style={{ backgroundImage: `url(/landing/${s.photo}.webp)` }} />
                    </div>
                    <span className="lp3-d-story-name">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Başlangıçlar */}
            <div className="lp3-d-section-title">Başlangıçlar</div>

            <div className="lp3-d-product-card">
              <div className="lp3-d-product-thumb" style={{ backgroundImage: 'url(/landing/humus.webp)' }} />
              <div className="lp3-d-product-info">
                <div className="lp3-d-product-head">
                  <span className="lp3-d-product-name">Humus</span>
                  <span className="lp3-d-badge">Öne Çıkan</span>
                </div>
                <span className="lp3-d-product-desc">Tahini, limon ve sızma zeytinyağı</span>
                <div className="lp3-d-product-prices">
                  <span className="lp3-d-price-old">₺200.00</span>
                  <span className="lp3-d-price-current">₺180.00</span>
                </div>
              </div>
            </div>

            <div className="lp3-d-product-card">
              <div className="lp3-d-product-thumb" style={{ backgroundImage: 'url(/landing/pacanga-boregi.webp)' }} />
              <div className="lp3-d-product-info">
                <span className="lp3-d-product-name">Paçanga Böreği</span>
                <span className="lp3-d-product-desc">Pastırma, kaşar ve biberli çıtır börek</span>
                <div className="lp3-d-product-prices">
                  <span className="lp3-d-price-current">₺240.00</span>
                </div>
              </div>
            </div>

            <div className="lp3-d-product-card">
              <div className="lp3-d-product-thumb" style={{ backgroundImage: 'url(/landing/patlican-sogurme.webp)' }} />
              <div className="lp3-d-product-info">
                <span className="lp3-d-product-name">Patlıcan Söğürme</span>
                <span className="lp3-d-product-desc">Közlenmiş patlıcan, domates ve sarımsak</span>
                <div className="lp3-d-product-prices">
                  <span className="lp3-d-price-current">₺190.00</span>
                </div>
              </div>
            </div>

            <div className="lp3-d-product-card">
              <div className="lp3-d-product-thumb" style={{ backgroundImage: 'url(/landing/citir-tavuk-parcalari.webp)' }} />
              <div className="lp3-d-product-info">
                <span className="lp3-d-product-name">Çıtır Tavuk Parçaları</span>
                <span className="lp3-d-product-desc">Baharatlı çıtır tavuk ve dip sos</span>
                <div className="lp3-d-product-prices">
                  <span className="lp3-d-price-current">₺280.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`lp3-phone-screen lp3-phone-screen--modern ${!isDefault ? 'is-active' : 'is-inactive'}`} aria-hidden="true">
          {/* App Topbar */}
          <div className="lp3-m-topbar">
            <div className="lp3-m-topbar__btn">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>
            <span className="lp3-m-topbar__title">Modern Tema</span>
            <div className="lp3-m-topbar__btn">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Bento Category Scroll */}
          <div className="lp3-m-bento-scroll">
            {/* 1. Kahvaltı (Wide Banner) */}
            <div className="lp3-m-bcard lp3-m-bcard--wide" style={{ backgroundImage: 'linear-gradient(180deg, rgba(10,16,10,0.02) 35%, rgba(10,16,10,0.74) 100%), url(/landing/pacanga-boregi.webp)' }}>
              <div className="lp3-m-bcard__info">
                <span className="lp3-m-bcard__title" style={{ color: '#fff' }}>Kahvaltı & Serpme</span>
                <span className="lp3-m-bcard__sub" style={{ color: 'rgba(255,255,255,0.78)' }}>Güne taze lezzetlerle başlayın</span>
              </div>
            </div>

            {/* 2. Başlangıçlar & Çorbalar (Two Halves) */}
            <div className="lp3-m-bgrid-row">
              <div className="lp3-m-bcard lp3-m-bcard--half" style={{ backgroundImage: 'linear-gradient(180deg, rgba(10,16,10,0.02) 35%, rgba(10,16,10,0.74) 100%), url(/landing/humus.webp)' }}>
                <div className="lp3-m-bcard__info">
                  <span className="lp3-m-bcard__title" style={{ color: '#fff' }}>Başlangıçlar</span>
                  <span className="lp3-m-bcard__sub" style={{ color: 'rgba(255,255,255,0.78)' }}>Meze & sıcak tabaklar</span>
                </div>
              </div>
              <div className="lp3-m-bcard lp3-m-bcard--half" style={{ backgroundImage: 'linear-gradient(180deg, rgba(10,16,10,0.02) 35%, rgba(10,16,10,0.74) 100%), url(/landing/mercimek-corbasi.webp)' }}>
                <div className="lp3-m-bcard__info">
                  <span className="lp3-m-bcard__title" style={{ color: '#fff' }}>Çorbalar</span>
                  <span className="lp3-m-bcard__sub" style={{ color: 'rgba(255,255,255,0.78)' }}>Günün taze çorbası</span>
                </div>
              </div>
            </div>

            {/* 3. Ana Yemekler (Wide Hero Banner) */}
            <div className="lp3-m-bcard lp3-m-bcard--wide" style={{ backgroundImage: 'linear-gradient(180deg, rgba(10,16,10,0.02) 35%, rgba(10,16,10,0.74) 100%), url(/landing/kofte-izgara.webp)' }}>
              <div className="lp3-m-bcard__info">
                <span className="lp3-m-bcard__title" style={{ color: '#fff' }}>Ana Yemekler</span>
                <span className="lp3-m-bcard__sub" style={{ color: 'rgba(255,255,255,0.78)' }}>Izgaralar & Şef Spesiyalleri</span>
              </div>
            </div>

            {/* 4. Burgerler & Pizzalar (Two Halves) */}
            <div className="lp3-m-bgrid-row">
              <div className="lp3-m-bcard lp3-m-bcard--half" style={{ backgroundImage: 'linear-gradient(180deg, rgba(10,16,10,0.02) 35%, rgba(10,16,10,0.74) 100%), url(/landing/klasik-burger.webp)' }}>
                <div className="lp3-m-bcard__info">
                  <span className="lp3-m-bcard__title" style={{ color: '#fff' }}>Burgerler</span>
                  <span className="lp3-m-bcard__sub" style={{ color: 'rgba(255,255,255,0.78)' }}>Ev yapımı ekmeklerle</span>
                </div>
              </div>
              <div className="lp3-m-bcard lp3-m-bcard--half" style={{ backgroundImage: 'linear-gradient(180deg, rgba(10,16,10,0.02) 35%, rgba(10,16,10,0.74) 100%), url(/landing/margherita.webp)' }}>
                <div className="lp3-m-bcard__info">
                  <span className="lp3-m-bcard__title" style={{ color: '#fff' }}>Pizzalar</span>
                  <span className="lp3-m-bcard__sub" style={{ color: 'rgba(255,255,255,0.78)' }}>Taş fırın çıtırlığı</span>
                </div>
              </div>
            </div>

            {/* 5. Makarna (Wide Banner) */}
            <div className="lp3-m-bcard lp3-m-bcard--wide" style={{ backgroundImage: 'linear-gradient(180deg, rgba(10,16,10,0.02) 35%, rgba(10,16,10,0.74) 100%), url(/landing/penne-arrabbiata.webp)' }}>
              <div className="lp3-m-bcard__info">
                <span className="lp3-m-bcard__title" style={{ color: '#fff' }}>Makarna</span>
                <span className="lp3-m-bcard__sub" style={{ color: 'rgba(255,255,255,0.78)' }}>İtalyan usulü taze soslarla</span>
              </div>
            </div>

            {/* 6. Tatlılar & İçecekler (Two Halves) */}
            <div className="lp3-m-bgrid-row">
              <div className="lp3-m-bcard lp3-m-bcard--half" style={{ backgroundImage: 'linear-gradient(180deg, rgba(10,16,10,0.02) 35%, rgba(10,16,10,0.74) 100%), url(/landing/tiramisu.webp)' }}>
                <div className="lp3-m-bcard__info">
                  <span className="lp3-m-bcard__title" style={{ color: '#fff' }}>Tatlılar</span>
                  <span className="lp3-m-bcard__sub" style={{ color: 'rgba(255,255,255,0.78)' }}>Günün tatlı kapanışı</span>
                </div>
              </div>
              <div className="lp3-m-bcard lp3-m-bcard--half" style={{ backgroundImage: 'linear-gradient(180deg, rgba(10,16,10,0.02) 35%, rgba(10,16,10,0.74) 100%), url(/landing/cilekli-ev-yapimi-limonata.webp)' }}>
                <div className="lp3-m-bcard__info">
                  <span className="lp3-m-bcard__title" style={{ color: '#fff' }}>İçecekler</span>
                  <span className="lp3-m-bcard__sub" style={{ color: 'rgba(255,255,255,0.78)' }}>Sıcak & soğuk kahveler</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   THEMES SECTION
   ═══════════════════════════════════════════════════════════════ */
export const ThemesSection = () => {
  const [activeTheme, setActiveTheme] = useState('default');
  const [displayedThemeId, setDisplayedThemeId] = useState('default');
  const [isFading, setIsFading] = useState(false);

  const handleSelectTheme = (id) => {
    if (id === activeTheme) return;
    setActiveTheme(id);
    setIsFading(true);
    setTimeout(() => {
      setDisplayedThemeId(id);
      setIsFading(false);
    }, 150);
  };

  const currentTheme = themesData.find((t) => t.id === activeTheme) || themesData[0];
  const displayedTheme = themesData.find((t) => t.id === displayedThemeId) || themesData[0];

  return (
    <section className="lp4-themes" id="temalar">
      <div className="lp4-themes__inner">
        <div className="lp4-themes__copy">
          <h2>Restoranınızın ruhuna yakışan tasarım.</h2>

          <div className="lp4-themes__tabs" role="tablist" aria-label="Menü temaları">
            {themesData.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTheme === t.id}
                className={activeTheme === t.id ? 'is-active' : ''}
                onClick={() => handleSelectTheme(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className={`lp4-themes__info ${isFading ? 'is-fading' : ''}`}>
            <p className="lp4-themes__desc">{displayedTheme.desc}</p>
            <ul className="lp4-themes__features" aria-label="Tema özellikleri">
              {displayedTheme.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <Btn to="/menu" variant="ghost" onClick={() => trackEvent('click_theme_demo', { theme_id: activeTheme })}>
              Temaları canlı deneyin
            </Btn>
          </div>
        </div>

        <div className="lp4-themes__stage" data-scene>
          <div className="lp4-themes__disk" aria-hidden="true" />
          <div className="lp4-themes__phone" data-speed="-0.05">
            <ThemePhone theme={currentTheme} />
          </div>
        </div>
      </div>
    </section>
  );
};
