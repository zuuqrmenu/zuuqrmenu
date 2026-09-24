import { useState, useRef, useEffect, useCallback } from 'react';
import {
  sendChatMessage,
  getAiQuota,
  sendAdminChatMessage,
  getAdminAiSettings,
} from '../services/aiService';
import './ZuuAIAssistant.css';


/**
 * Close (X) Icon
 */
const IconClose = ({ size = 18 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * Send Arrow Icon
 */
const IconSend = ({ size = 16 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

/**
 * Chevron / Arrow Right for Suggestions
 */
const IconChevron = ({ size = 13 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/**
 * Retry Refresh Icon
 */
const IconRefresh = ({ size = 12 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
  </svg>
);

/**
 * Lightning Bolt Icon for Usage Limit
 */
const IconBolt = ({ size = 11, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
  </svg>
);

/**
 * Calculates remaining time until next 00:00 Europe/Istanbul (Daily reset)
 * @returns {string} e.g. "7s 24dk", "42dk"
 */
const getDailyResetCountdown = () => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const p = {};
    parts.forEach((item) => { p[item.type] = parseInt(item.value, 10); });

    const istanbulNow = new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second || 0);
    const nextMidnight = new Date(p.year, p.month - 1, p.day + 1, 0, 0, 0, 0);

    const diffMs = nextMidnight.getTime() - istanbulNow.getTime();
    if (diffMs <= 0) return '0dk';

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours}s ${minutes}dk`;
    if (hours > 0) return `${hours}s`;
    return `${Math.max(1, minutes)}dk`;
  } catch {
    return '00:00';
  }
};

/**
 * Calculates remaining time until the 1st of next month in Europe/Istanbul (Monthly reset)
 * @returns {string} e.g. "9g 4s", "1g 12s", "18s"
 */
const getMonthlyResetCountdown = () => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const p = {};
    parts.forEach((item) => { p[item.type] = parseInt(item.value, 10); });

    const istanbulNow = new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second || 0);
    const nextMonthFirst = new Date(p.year, p.month, 1, 0, 0, 0, 0);

    const diffMs = nextMonthFirst.getTime() - istanbulNow.getTime();
    if (diffMs <= 0) return '0dk';

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    const remainingMinutes = totalMinutes % 60;

    if (days > 0) {
      return remainingHours > 0 ? `${days}g ${remainingHours}s` : `${days}g`;
    }
    if (totalHours > 0) {
      return remainingMinutes > 0 ? `${totalHours}s ${remainingMinutes}dk` : `${totalHours}s`;
    }
    return `${Math.max(1, remainingMinutes)}dk`;
  } catch {
    return 'Ay başında';
  }
};

const QUICK_ACTIONS = [
  {
    label: 'Menümü analiz et',
    action: 'send',
    text: 'Menümü analiz et.',
  },
  {
    label: 'Ürün açıklaması oluştur',
    action: 'send',
    text: 'Ürün açıklaması oluşturmama yardımcı olur musun?',
  },
  {
    label: 'Menümü nasıl geliştirebilirim?',
    action: 'send',
    text: 'Menümü nasıl geliştirebilirim?',
  },
  {
    label: 'Bir şey sor',
    action: 'focus',
  },
];

const ZuuAIAssistant = ({ adminMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFailedText, setLastFailedText] = useState(null);
  const [quota, setQuota] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [countdownText, setCountdownText] = useState('');

  const widgetRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const popoverRef = useRef(null);
  const usageBtnRef = useRef(null);
  const idCounterRef = useRef(0);

  // Fetch the correct model and usage context when the assistant opens.
  const fetchQuota = useCallback(async () => {
    try {
      if (adminMode) {
        const res = await getAdminAiSettings();
        const activeModel = res?.data?.activeModel;
        const activeModelName = res?.data?.availableModels?.find((model) => model.id === activeModel)?.name || activeModel;
        setQuota({ isAdmin: true });
        if (activeModel) {
          setMessages((previous) => [...previous, {
            id: `assistant-${++idCounterRef.current}`,
            role: 'assistant',
            text: `Şu anda aktif model: ${activeModelName} (${activeModel}). Bu admin sohbetinde günlük ve aylık kullanım kotası yoktur; her konuda konuşabiliriz.`,
          }]);
        }
      } else {
        const res = await getAiQuota();
        if (res?.data) {
          setQuota(res.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch ZuuAI quota:', err);
    }
  }, [adminMode]);

  useEffect(() => {
    if (isOpen) {
      fetchQuota();
    }
  }, [isOpen, fetchQuota]);

  const isZuuAiDisabled = Boolean(!adminMode && !quota?.isAdmin && quota?.disabled);
  const isDailyExhausted = Boolean(!quota?.isAdmin && !isZuuAiDisabled && quota?.dailyRemaining !== null && quota?.dailyRemaining !== undefined && quota.dailyRemaining <= 0);
  const isMonthlyExhausted = Boolean(!quota?.isAdmin && !isZuuAiDisabled && quota?.monthlyRemaining !== null && quota?.monthlyRemaining !== undefined && quota.monthlyRemaining <= 0);
  const isQuotaExhausted = isDailyExhausted || isMonthlyExhausted;
  const isInputBlocked = !adminMode && (isZuuAiDisabled || isQuotaExhausted);
  const isCritical = Boolean(!quota?.isAdmin && !isZuuAiDisabled && quota?.dailyRemaining !== null && quota?.dailyRemaining > 0 && quota?.dailyRemaining <= 2);
  const isLow = Boolean(!quota?.isAdmin && !isZuuAiDisabled && quota?.dailyRemaining !== null && quota?.dailyRemaining > 2 && quota?.dailyRemaining <= 5);

  // Auto-updating countdown calculation (Europe/Istanbul)
  useEffect(() => {
    if (!isOpen) return;

    const updateCountdown = () => {
      if (isMonthlyExhausted) {
        setCountdownText(getMonthlyResetCountdown());
      } else {
        setCountdownText(getDailyResetCountdown());
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 30000);
    return () => clearInterval(timer);
  }, [isOpen, isDailyExhausted, isMonthlyExhausted]);

  // Click outside and Escape handler for floating popover
  useEffect(() => {
    if (!popoverOpen) return;

    const handlePopoverClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        usageBtnRef.current &&
        !usageBtnRef.current.contains(e.target)
      ) {
        setPopoverOpen(false);
      }
    };

    const handlePopoverKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPopoverOpen(false);
        e.stopPropagation();
      }
    };

    document.addEventListener('mousedown', handlePopoverClickOutside);
    document.addEventListener('keydown', handlePopoverKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePopoverClickOutside);
      document.removeEventListener('keydown', handlePopoverKeyDown);
    };
  }, [popoverOpen]);

  // When panel closes, close popover too
  useEffect(() => {
    if (!isOpen) setPopoverOpen(false);
  }, [isOpen]);

  // Auto-scroll messages container to bottom on message update or typing
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen, scrollToBottom]);

  // Click outside to close & Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (popoverOpen) {
          setPopoverOpen(false);
          return;
        }
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target) && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, popoverOpen]);

  // Focus textarea when panel is opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-resize textarea to content
  const handleTextareaInput = (e) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }
  };

  // Send message handler
  const handleSend = async (rawMessage) => {
    const textToSend = (typeof rawMessage === 'string' ? rawMessage : input).trim();
    if (!textToSend || loading || isQuotaExhausted) return;

    // Reset input
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLastFailedText(null);

    // Append user message
    const msgId = ++idCounterRef.current;
    const userMsg = {
      id: `user-${msgId}`,
      role: 'user',
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = adminMode
        ? await sendAdminChatMessage(textToSend)
        : await sendChatMessage(textToSend);

      if (response && response.success === false) {
        throw new Error(response.error || 'ZuuAI şu anda yanıt veremiyor.');
      }

      // Update quota from response
      if (response?.usage) {
        setQuota(response.usage);
      }

      const reply =
        response?.message ||
        response?.data?.message ||
        (typeof response === 'string' ? response : null);

      if (!reply || !reply.trim()) {
        throw new Error('ZuuAI boş bir yanıt döndürdü.');
      }

      const replyId = ++idCounterRef.current;
      const assistantMsg = {
        id: `assistant-${replyId}`,
        role: 'assistant',
        text: reply.trim(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('ZuuAI chat error:', err);
      const errData = err?.response?.data;
      if (errData?.usage) {
        setQuota(errData.usage);
      }

      const isQuotaCode = errData?.code === 'DAILY_LIMIT_REACHED' || errData?.code === 'MONTHLY_LIMIT_REACHED';
      const errorText = isQuotaCode
        ? (errData.error || 'Mesaj limitinize ulaştınız.')
        : adminMode && errData?.error
        ? errData.error
        : 'ZuuAI şu anda yanıt veremiyor. Lütfen kısa bir süre sonra tekrar deneyin.';

      const errId = ++idCounterRef.current;
      const assistantErrMsg = {
        id: `err-${errId}`,
        role: 'assistant',
        text: errorText,
        isError: true,
      };
      setLastFailedText(isQuotaCode ? null : textToSend);
      setMessages((prev) => [...prev, assistantErrMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (qa) => {
    if (qa.action === 'focus') {
      textareaRef.current?.focus();
    } else if (qa.action === 'send' && qa.text) {
      handleSend(qa.text);
    }
  };

  const handleRetry = () => {
    if (lastFailedText) {
      handleSend(lastFailedText);
    }
  };

  return (
    <div className="zuuai-widget" ref={widgetRef}>
      {/* ────────────────── Chat Panel ────────────────── */}
      <div
        className={`zuuai-panel ${isOpen ? 'is-open' : 'is-closed'}`}
        role="dialog"
        aria-modal="true"
        aria-label="ZuuAI Asistan Paneli"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="zuuai-header">
          <div className="zuuai-header__brand">
            <div className="zuuai-header__avatar" aria-hidden="true">
              <img src="/zuuai.svg" alt="" className="zuuai-header__logo" />
            </div>
            <div className="zuuai-header__info">
              <div className="zuuai-header__title-row">
                <span className="zuuai-header__title">ZuuAI</span>
                <span className="zuuai-header__live-dot" title="Çevrim içi" aria-label="Çevrim içi" />
              </div>
              <span className="zuuai-header__subtitle">{adminMode ? 'Yönetici asistanı' : 'Size nasıl yardımcı olabilirim?'}</span>
            </div>
          </div>
          <button
            type="button"
            className="zuuai-header__close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Paneli kapat"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Message Area */}
        <div className="zuuai-messages">
          {messages.length === 0 ? (
            <div className="zuuai-welcome">
              <div className="zuuai-welcome__icon" aria-hidden="true">
                <img src="/zuuai.svg" alt="" className="zuuai-welcome__logo" />
              </div>
              <h3 className="zuuai-welcome__title">Merhaba! Ben ZuuAI 👋</h3>
              <p className="zuuai-welcome__desc">
                {adminMode ? 'Yönetim, yazılım, analiz ve diğer tüm konularda yardımcı olabilirim.' : 'Menünüz ve işletmeniz hakkında size yardımcı olabilirim.'}
              </p>
              <div className="zuuai-suggestions">
                {QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa.label}
                    type="button"
                    className="zuuai-suggestion-btn"
                    onClick={() => handleQuickAction(qa)}
                  >
                    <span>{qa.label}</span>
                    <IconChevron size={12} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`zuuai-msg-row ${msg.role === 'user' ? 'is-user' : 'is-assistant'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="zuuai-msg-avatar" aria-hidden="true">
                    <img src="/zuuai.svg" alt="" className="zuuai-msg-avatar__logo" />
                  </div>
                )}
                <div
                  className={`zuuai-bubble ${
                    msg.role === 'user'
                      ? 'is-user'
                      : msg.isError
                      ? 'is-error'
                      : 'is-assistant'
                  }`}
                >
                  {msg.text}
                  {msg.isError && lastFailedText && (
                    <div>
                      <button
                        type="button"
                        className="zuuai-retry-btn"
                        onClick={handleRetry}
                      >
                        <IconRefresh size={11} />
                        <span>Tekrar Dene</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {loading && (
            <div className="zuuai-msg-row is-assistant">
              <div className="zuuai-msg-avatar" aria-hidden="true">
                <img src="/zuuai.svg" alt="" className="zuuai-msg-avatar__logo" />
              </div>
              <div className="zuuai-typing">
                <div className="zuuai-typing__dots" aria-hidden="true">
                  <span className="zuuai-typing__dot" />
                  <span className="zuuai-typing__dot" />
                  <span className="zuuai-typing__dot" />
                </div>
                <span className="zuuai-typing__text">ZuuAI yazıyor...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="zuuai-input-wrap">
          <div className={`zuuai-input-box ${isInputBlocked ? 'is-disabled' : ''}`}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              disabled={loading || isInputBlocked}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={
                isZuuAiDisabled
                  ? 'ZuuAI bu restoran için devre dışı bırakılmıştır.'
                  : isDailyExhausted
                  ? 'Günlük mesaj limitiniz doldu'
                  : isMonthlyExhausted
                  ? 'Aylık mesaj limitiniz doldu'
                  : "ZuuAI'ye bir şey sor..."
              }
              className="zuuai-textarea"
              aria-label="ZuuAI mesajı"
            />

            <div className="zuuai-input-actions">
              {/* Compact Usage Limit Pill */}
              {quota && (
                <div className="zuuai-usage-anchor">
                  <button
                    type="button"
                    ref={usageBtnRef}
                    onClick={() => setPopoverOpen((prev) => !prev)}
                    className={`zuuai-usage-pill ${
                      isQuotaExhausted
                        ? 'is-exhausted'
                        : isCritical
                        ? 'is-critical'
                        : isLow
                        ? 'is-low'
                        : 'is-normal'
                    }`}
                    aria-label="ZuuAI kullanım kotası"
                    aria-expanded={popoverOpen}
                    title="ZuuAI kullanım detaylarını göster"
                  >
                    <IconBolt size={11} className="zuuai-usage-pill__icon" />
                    <span className="zuuai-usage-pill__count">
                      {adminMode || quota.isAdmin
                        ? '∞'
                        : isZuuAiDisabled
                        ? '0'
                        : (quota.dailyRemaining ?? 20)}
                    </span>
                  </button>

                  {/* Floating Popover */}
                  {popoverOpen && (
                    <div
                      ref={popoverRef}
                      className="zuuai-usage-popover"
                      role="dialog"
                      aria-label="ZuuAI Kullanım Detayları"
                    >
                      <div className="zuuai-usage-popover__header">
                        <div className="zuuai-usage-popover__title-wrap">
                          <IconBolt size={13} className="zuuai-usage-popover__bolt" />
                          <span className="zuuai-usage-popover__title">ZuuAI Kullanımı</span>
                        </div>
                        {(adminMode || quota.isAdmin) && (
                          <span className="zuuai-usage-popover__admin-badge">Yönetici</span>
                        )}
                      </div>

                      {adminMode || quota.isAdmin ? (
                        <div className="zuuai-usage-popover__admin-info">
                          <p className="zuuai-usage-popover__admin-text">
                            Yönetici hesabınız için ZuuAI mesaj hakkı tamamen <strong>sınırsızdır</strong>.
                          </p>
                        </div>
                      ) : isZuuAiDisabled ? (
                        <div className="zuuai-usage-popover__disabled-info">
                          <p className="zuuai-usage-popover__disabled-text">
                            ZuuAI bu restoran için yönetici tarafından devre dışı bırakılmıştır.
                          </p>
                        </div>
                      ) : (
                        <div className="zuuai-usage-popover__body">
                          {/* Günlük Bölümü */}
                          <div className="zuuai-usage-popover__section">
                            <div className="zuuai-usage-popover__row">
                              <span className="zuuai-usage-popover__label">Günlük</span>
                              <span className="zuuai-usage-popover__count">
                                <strong>{quota.dailyUsed ?? 0}</strong> / {quota.dailyLimit ?? 20} mesaj
                              </span>
                            </div>
                            <div className="zuuai-usage-popover__meta">
                              {isDailyExhausted ? (
                                <span className="zuuai-usage-popover__reset is-exhausted">
                                  Günlük limit doldu • Yenilenmesine <strong>{countdownText || getDailyResetCountdown()}</strong> kaldı
                                </span>
                              ) : (
                                <span className="zuuai-usage-popover__reset">
                                  Günlük limit • 00:00'da yenilenir
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Aylık Bölümü */}
                          <div className="zuuai-usage-popover__section">
                            <div className="zuuai-usage-popover__row">
                              <span className="zuuai-usage-popover__label">Aylık</span>
                              <span className="zuuai-usage-popover__count">
                                <strong>{quota.monthlyUsed ?? 0}</strong> / {quota.monthlyLimit ?? 300} mesaj
                              </span>
                            </div>
                            <div className="zuuai-usage-popover__meta">
                              {isMonthlyExhausted ? (
                                <span className="zuuai-usage-popover__reset is-exhausted">
                                  Aylık limit doldu • Yenilenmesine <strong>{countdownText || getMonthlyResetCountdown()}</strong> kaldı
                                </span>
                              ) : (
                                <span className="zuuai-usage-popover__reset">
                                  Aylık limit • Ayın 1'inde yenilenir
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Düşük Limit / Yükseltme Uyarısı */}
                          {quota.dailyRemaining !== null && quota.dailyRemaining <= 5 && quota.dailyRemaining > 0 && (
                            <div className="zuuai-usage-popover__warning">
                              <span className="zuuai-usage-popover__warning-title">
                                {quota.dailyRemaining === 1
                                  ? 'Son 1 mesaj hakkınız'
                                  : quota.dailyRemaining === 2
                                  ? 'Son 2 mesaj hakkınız'
                                  : `${quota.dailyRemaining} mesaj hakkınız kaldı`}
                              </span>
                              <span className="zuuai-usage-popover__upgrade-hint">
                                Daha fazla ZuuAI kullanmak için planınızı yükseltin.
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                className="zuuai-send-btn"
                onClick={() => handleSend()}
                disabled={loading || isInputBlocked || !input.trim()}
                aria-label="Mesaj Gönder"
              >
                <IconSend size={15} />
              </button>
            </div>
          </div>

          {/* Countdown Helper below composer when exhausted */}
          {(isDailyExhausted || isMonthlyExhausted) && countdownText && (
            <div className="zuuai-composer-helper">
              <span>Yenilenmesine {countdownText} kaldı</span>
            </div>
          )}
        </div>
      </div>

      {/* ────────────────── Floating Trigger Button ────────────────── */}
      <button
        type="button"
        className={`zuuai-trigger-btn ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'ZuuAI Asistanını Kapat' : 'ZuuAI Asistanını Aç'}
        aria-expanded={isOpen}
      >
        <span className="zuuai-trigger-btn__badge" aria-hidden="true" />
        <span className="zuuai-trigger-btn__icon">
          {isOpen ? (
            <IconClose size={22} />
          ) : (
            <img src="/zuuai.svg" alt="ZuuAI" className="zuuai-trigger-btn__logo" />
          )}
        </span>
      </button>
    </div>
  );
};

export default ZuuAIAssistant;
