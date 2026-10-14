import { useEffect, useRef, useState } from 'react';
import ModalPortal from '../common/ModalPortal';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import '../../styles/account.css';

/** Shared shell for the account dialogs (subscription, account settings): portaled, Esc / backdrop to close, animated exit. */
const AccountDialog = ({ title, kicker, wide = false, onClose, tabs = null, activeTab, onTab, children }) => {
  useBodyScrollLock(true);
  const [closing, setClosing] = useState(false);
  const bodyRef = useRef(null);

  // A new tab always starts at the top instead of inheriting the previous tab's scroll position.
  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); }, [activeTab]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 180);
  };

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <ModalPortal>
      <div className={`acc-backdrop ${closing ? 'is-closing' : ''}`} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()}>
        <div className={`acc-dialog ${wide ? 'acc-dialog--wide' : ''} ${tabs ? 'acc-dialog--side' : ''} ${closing ? 'is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="acc-title">
          <header className="acc-head">
            <div>
              {kicker && <p className="acc-kicker">{kicker}</p>}
              <h2 id="acc-title">{title}</h2>
            </div>
            <button type="button" className="acc-close" onClick={close} aria-label="Kapat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </header>
          {tabs && (
            <div className="acc-tabs" role="tablist" aria-orientation="vertical">
              {tabs.map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'is-active' : ''} onClick={() => onTab(id)}>{label}</button>
              ))}
            </div>
          )}
          <div className="acc-body" ref={bodyRef}>{children}</div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AccountDialog;
