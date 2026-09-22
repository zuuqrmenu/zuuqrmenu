import { useState, useEffect, useRef } from 'react';
import { getPanelUrl } from '../utils/domainHelpers';
import './LandingZuuAI.css';

/* ─── Predefined Questions & Answers (Local only, no API calls) ─── */
const LANDING_QUESTIONS = [
  {
    id: 'q1',
    category: 'genel',
    categoryLabel: 'Genel',
    question: 'zuuqrmenu nedir?',
    answer:
      'zuuqrmenu, restoran, kafe ve benzeri yeme-içme işletmeleri için geliştirilmiş modern bir dijital QR menü platformudur. Menünüzü dakikalar içinde oluşturabilir, dilediğiniz zaman güncelleyebilir ve müşterilerinizle QR kod üzerinden paylaşabilirsiniz.',
    showLoginCta: false,
  },
  {
    id: 'q2',
    category: 'menu',
    categoryLabel: 'Menü Yönetimi',
    question: 'QR menü oluşturabilir miyim?',
    answer:
      'Evet. zuuqrmenu ile restoranınız için kolayca dijital QR menü oluşturabilir, kategorilerinizi ve ürünlerinizi yönetebilir ve anında masalarınıza koyabileceğiniz bir QR kod üretebilirsiniz.',
    showLoginCta: false,
  },
  {
    id: 'q3',
    category: 'qr',
    categoryLabel: 'QR & Sunum',
    question: 'QR menümü nasıl oluştururum?',
    answer:
      'Hesabınızı oluşturduktan sonra yönetim paneline giriş yapın. Kategorilerinizi ve ürünlerinizi ekleyin, fiyatlarınızı belirleyin ve QR Kod sekmesinden restoranınıza özel QR kodunuzu hemen indirin.',
    showLoginCta: false,
  },
  {
    id: 'q4',
    category: 'menu',
    categoryLabel: 'Menü Yönetimi',
    question: 'Menümü kendim düzenleyebilir miyim?',
    answer:
      'Evet. Yönetim paneli üzerinden ürün fiyatlarını, ürün açıklamalarını, fotoğraflarını ve kategorilerinizi teknik bir bilgiye ihtiyaç duymadan istediğiniz an tek tıkla düzenleyebilirsiniz.',
    showLoginCta: false,
  },
  {
    id: 'q5',
    category: 'menu',
    categoryLabel: 'Menü Yönetimi',
    question: 'Ürün ve kategori ekleyebilir miyim?',
    answer:
      'Elbette. İstediğiniz kadar kategori oluşturabilir, ürünlerinizi fotoğrafları, fiyatları, detaylı açıklamaları ve alerjen bilgileriyle birlikte menünüze ekleyebilirsiniz.',
    showLoginCta: false,
  },
  {
    id: 'q6',
    category: 'menu',
    categoryLabel: 'Menü Yönetimi',
    question: 'Menüme fotoğraf ekleyebilir miyim?',
    answer:
      'Evet. Ürünlerinize yüksek kaliteli fotoğraflar yükleyebilirsiniz. Yüklenen fotoğraflar sistem tarafından otomatik olarak optimize edilir ve müşterilerinizin cihazında hızlıca açılır.',
    showLoginCta: false,
  },
  {
    id: 'q7',
    category: 'menu',
    categoryLabel: 'Menü Yönetimi',
    question: 'Menümü özelleştirebilir miyim?',
    answer:
      'Evet. Menünüzün açık veya koyu tema görünümünü seçebilir, restoran logonuzu ve kapak fotoğrafınızı ekleyebilir, marka kimliğinize uygun renkleri belirleyebilirsiniz.',
    showLoginCta: false,
  },
  {
    id: 'q8',
    category: 'qr',
    categoryLabel: 'QR & Sunum',
    question: 'QR kodumu yazdırabilir miyim?',
    answer:
      'Evet. Panelde yer alan QR Print Designer aracı sayesinde masa kartlarınızı ve stant tasarımlarınızı hazırlayabilir, yüksek çözünürlüklü olarak indirip baskıya verebilirsiniz.',
    showLoginCta: false,
  },
  {
    id: 'q9',
    category: 'qr',
    categoryLabel: 'QR & Sunum',
    question: 'Müşteriler menümü nasıl görüntüler?',
    answer:
      'Müşterileriniz masadaki QR kodu telefon kameralarıyla taratarak menünüze anında ulaşır. Herhangi bir uygulama yüklemelerine gerek kalmadan tarayıcı üzerinden açılır.',
    showLoginCta: false,
  },
  {
    id: 'q10',
    category: 'qr',
    categoryLabel: 'QR & Sunum',
    question: 'Telefon ve tabletlerde çalışır mı?',
    answer:
      'Evet. zuuqrmenu tüm iPhone, Android telefonlar, tabletler ve modern web tarayıcılarında hızlı, duyarlı ve kesintisiz şekilde çalışır.',
    showLoginCta: false,
  },
  {
    id: 'q11',
    category: 'menu',
    categoryLabel: 'Menü Yönetimi',
    question: 'Birden fazla kategori oluşturabilir miyim?',
    answer:
      'Evet. Başlangıçlar, Ana Yemekler, İçecekler, Tatlılar gibi dilediğiniz sayıda kategori oluşturabilir ve bunları menünüzde kolayca gruplayabilirsiniz.',
    showLoginCta: false,
  },
  {
    id: 'q12',
    category: 'menu',
    categoryLabel: 'Menü Yönetimi',
    question: 'Ürünlerimi sıralayabilir miyim?',
    answer:
      'Evet. Yönetim panelinden hem kategorilerinizi hem de ürünlerinizi istediğiniz önceliğe göre kolayca sıralayabilir ve menü akışını belirleyebilirsiniz.',
    showLoginCta: false,
  },
  {
    id: 'q13',
    category: 'menu',
    categoryLabel: 'Menü Yönetimi',
    question: 'Menümü yayına alabilir miyim?',
    answer:
      'Evet. Menünüzü tamamladığınızda tek bir butonla anında yayına alabilir, dilediğiniz zaman düzenleme moduna çekebilir veya geçici olarak yayından kaldırabilirsiniz.',
    showLoginCta: false,
  },
  {
    id: 'q14',
    category: 'zuuai',
    categoryLabel: 'ZuuAI',
    question: 'ZuuAI ne işe yarıyor?',
    answer:
      'ZuuAI, menünüzü analiz eden, ürün açıklamaları oluşturan ve menünüzü geliştirmeniz için öneriler sunan akıllı bir yapay zeka asistanıdır.',
    showLoginCta: true,
  },
  {
    id: 'q15',
    category: 'zuuai',
    categoryLabel: 'ZuuAI',
    question: 'ZuuAI menümü analiz edebilir mi?',
    answer:
      'Evet. Yönetim panelinde ZuuAI, menü yapınızı ve ürün çeşitliliğinizi inceleyerek eksik kategorileri, fiyatlandırma ipuçlarını ve menü akışını iyileştirecek öneriler sunar.',
    showLoginCta: true,
  },
  {
    id: 'q16',
    category: 'zuuai',
    categoryLabel: 'ZuuAI',
    question: 'ZuuAI ürün açıklaması oluşturabilir mi?',
    answer:
      'Evet. Bir yemeğin veya içeceğin temel malzemelerini girdiğinizde ZuuAI iştah açıcı ve profesyonel ürün açıklamaları hazırlayabilir.',
    showLoginCta: true,
  },
  {
    id: 'q17',
    category: 'genel',
    categoryLabel: 'Genel',
    question: 'Ücretsiz kullanabilir miyim?',
    answer:
      'zuuqrmenu üyelik ve plan bazlı ücretli bir platformdur. Çok yakında sunulacak üyelik paketlerimiz kapsamında yeni restoranlar için 7 günlük ücretsiz deneme süresi sunulacaktır.',
    showLoginCta: false,
  },
  {
    id: 'q18',
    category: 'genel',
    categoryLabel: 'Genel',
    question: 'Nasıl kayıt olabilirim?',
    answer:
      'Sayfanın üst veya alt kısmındaki "Restoranını Oluştur" butonuna tıklayarak adınız, e-posta adresiniz ve restoran bilgilerinizle birkaç dakikada kayıt olabilirsiniz.',
    showLoginCta: false,
  },
  {
    id: 'q19',
    category: 'genel',
    categoryLabel: 'Genel',
    question: 'Restoranım için uygun mu?',
    answer:
      'zuuqrmenu; restoranlar, kafeler, barlar, pastaneler, oteller, plaj işletmeleri ve paket servis noktaları dahil olmak üzere her ölçekteki yeme-içme işletmesi için uygundur.',
    showLoginCta: false,
  },
  {
    id: 'q20',
    category: 'zuuai',
    categoryLabel: 'ZuuAI',
    question: 'Daha gelişmiş özellikler için ne yapmalıyım?',
    answer:
      'Gelişmiş ZuuAI asistanı, detaylı ziyaretçi analizleri ve tam menü yönetimi özelliklerine erişmek için restoran hesabınıza giriş yapabilir veya yeni bir restoran hesabı oluşturabilirsiniz.',
    showLoginCta: true,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Tümü' },
  { id: 'genel', label: 'Genel' },
  { id: 'menu', label: 'Menü' },
  { id: 'qr', label: 'QR & Sunum' },
  { id: 'zuuai', label: 'ZuuAI' },
];

/* ─── SVG Icons ─── */
const IconClose = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconBolt = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconRefresh = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const LandingZuuAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Merhaba! zuuqrmenu hakkında aklınıza takılan soruları yanıtlamak için buradayım. Merak ettiğiniz bir konuyu aşağıdaki sorulardan seçebilirsiniz.',
      showLoginCta: false,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);
  const bubbleTimerRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Initial speech bubble display (1 time per browser session)
  useEffect(() => {
    const hasSeenBubble = sessionStorage.getItem('zuuai_landing_speech_seen');
    if (!hasSeenBubble) {
      const showTimer = setTimeout(() => {
        setShowBubble(true);
        sessionStorage.setItem('zuuai_landing_speech_seen', 'true');

        // Auto-dismiss after 7.5 seconds
        bubbleTimerRef.current = setTimeout(() => {
          setShowBubble(false);
        }, 7500);
      }, 1200);

      return () => {
        clearTimeout(showTimer);
        if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      };
    }
  }, []);

  // Dismiss bubble if user opens panel
  const handleOpenPanel = () => {
    setShowBubble(false);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    setIsOpen(prev => !prev);
  };

  const handleDismissBubble = (e) => {
    e.stopPropagation();
    setShowBubble(false);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
  };

  // Close on outside click & Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // If clicking the trigger button, it will toggle itself
        if (!e.target.closest('.landing-zuuai-trigger-btn')) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-scroll messages container
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Handle question click
  const handleQuestionClick = (item) => {
    if (isTyping) return;

    // 1. Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: item.question,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // 2. Brief typing animation (650ms), then add predefined assistant response
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      const assistantMsg = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: item.answer,
        showLoginCta: item.showLoginCta,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 650);
  };

  // Reset conversation
  const handleResetConversation = () => {
    if (isTyping) return;
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: 'Sohbet sıfırlandı. zuuqrmenu hakkında bilgi almak için aşağıdaki sorulardan dilediğinizi seçebilirsiniz.',
        showLoginCta: false,
      },
    ]);
  };

  const filteredQuestions = selectedCategory === 'all'
    ? LANDING_QUESTIONS
    : LANDING_QUESTIONS.filter(q => q.category === selectedCategory);

  return (
    <aside className="landing-zuuai-widget" aria-label="ZuuAI Tanıtım Asistanı">
      {/* ─── Speech Bubble (Initial subtle entrance) ─── */}
      {showBubble && !isOpen && (
        <div
          className="landing-zuuai-bubble"
          role="status"
          aria-live="polite"
          onClick={handleOpenPanel}
        >
          <div className="landing-zuuai-bubble__content">
            <p className="landing-zuuai-bubble__text">
              QR menüye mi ihtiyacın var? ZuuAI'ya sor.
            </p>
          </div>
          <button
            type="button"
            className="landing-zuuai-bubble__close"
            onClick={handleDismissBubble}
            aria-label="Bildirimi kapat"
            title="Kapat"
          >
            ✕
          </button>
          <div className="landing-zuuai-bubble__arrow" aria-hidden="true" />
        </div>
      )}

      {/* ─── Main Chat Panel ─── */}
      <div
        ref={panelRef}
        className={`landing-zuuai-panel ${isOpen ? 'is-open' : 'is-closed'}`}
        role="dialog"
        aria-label="ZuuAI Asistanı"
        aria-modal="false"
      >
        {/* Header */}
        <header className="landing-zuuai-header">
          <div className="landing-zuuai-header__brand">
            <div className="landing-zuuai-header__avatar" aria-hidden="true">
              <img src="/zuuai.svg" alt="" className="landing-zuuai-header__logo" />
            </div>
            <div className="landing-zuuai-header__titles">
              <div className="landing-zuuai-header__title-row">
                <span className="landing-zuuai-header__title">ZuuAI</span>
                <span className="landing-zuuai-header__live-dot" title="Çevrim içi" aria-label="Çevrim içi" />
              </div>
              <p className="landing-zuuai-header__subtitle">
                zuuqrmenu hakkında merak ettiklerini sor.
              </p>
            </div>
          </div>
          <div className="landing-zuuai-header__actions">
            <button
              type="button"
              className="landing-zuuai-header__reset-btn"
              onClick={handleResetConversation}
              aria-label="Sohbeti temizle"
              title="Sohbeti temizle"
            >
              <IconRefresh size={13} />
            </button>
            <button
              type="button"
              className="landing-zuuai-header__close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Paneli kapat"
              title="Kapat"
            >
              <IconClose size={17} />
            </button>
          </div>
        </header>

        {/* Conversation Stream */}
        <div className="landing-zuuai-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`landing-zuuai-msg-row ${
                msg.sender === 'user' ? 'is-user' : 'is-assistant'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="landing-zuuai-msg-avatar" aria-hidden="true">
                  <img src="/zuuai.svg" alt="" className="landing-zuuai-msg-avatar__logo" />
                </div>
              )}
              <div
                className={`landing-zuuai-bubble-msg ${
                  msg.sender === 'user' ? 'is-user' : 'is-assistant'
                }`}
              >
                <div className="landing-zuuai-bubble-msg__text">{msg.text}</div>
                {msg.showLoginCta && (
                  <div className="landing-zuuai-cta-card">
                    <div className="landing-zuuai-cta-card__header">
                      <IconBolt size={13} className="landing-zuuai-cta-card__bolt" />
                      <span className="landing-zuuai-cta-card__note">
                        Gelişmiş kullanım için giriş yapın.
                      </span>
                    </div>
                    <a
                      href={getPanelUrl('/login')}
                      className="landing-zuuai-cta-btn"
                    >
                      Giriş Yap <span>→</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="landing-zuuai-msg-row is-assistant">
              <div className="landing-zuuai-msg-avatar" aria-hidden="true">
                <img src="/zuuai.svg" alt="" className="landing-zuuai-msg-avatar__logo" />
              </div>
              <div className="landing-zuuai-typing">
                <div className="landing-zuuai-typing__dots" aria-hidden="true">
                  <span className="landing-zuuai-typing__dot" />
                  <span className="landing-zuuai-typing__dot" />
                  <span className="landing-zuuai-typing__dot" />
                </div>
                <span className="landing-zuuai-typing__text">ZuuAI yanıtlıyor...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Predefined Questions Section */}
        <div className="landing-zuuai-questions-area">
          <div className="landing-zuuai-categories-bar">
            <span className="landing-zuuai-categories-label">Hazır Sorular:</span>
            <div className="landing-zuuai-category-tabs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`landing-zuuai-category-tab ${
                    selectedCategory === cat.id ? 'is-active' : ''
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="landing-zuuai-questions-list">
            {filteredQuestions.map((q) => (
              <button
                key={q.id}
                type="button"
                className="landing-zuuai-question-btn"
                onClick={() => handleQuestionClick(q)}
                disabled={isTyping}
              >
                <span>{q.question}</span>
                <span className="landing-zuuai-question-btn__arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subtle Footer CTA */}
        <footer className="landing-zuuai-footer">
          <a
            href={getPanelUrl('/login')}
            className="landing-zuuai-footer__link"
          >
            Gelişmiş ZuuAI özellikleri için giriş yapın →
          </a>
        </footer>
      </div>

      {/* ─── Floating Trigger Button ─── */}
      <button
        type="button"
        className={`landing-zuuai-trigger-btn ${isOpen ? 'is-open' : ''}`}
        onClick={handleOpenPanel}
        aria-label={isOpen ? 'ZuuAI penceresini kapat' : 'ZuuAI Asistanını Aç'}
        aria-expanded={isOpen}
      >
        <span className="landing-zuuai-trigger-btn__badge" aria-hidden="true" />
        <div className="landing-zuuai-trigger-btn__icon">
          {isOpen ? (
            <IconClose size={20} />
          ) : (
            <img src="/zuuai.svg" alt="ZuuAI" className="landing-zuuai-trigger-btn__logo" />
          )}
        </div>
      </button>
    </aside>
  );
};

export default LandingZuuAI;
