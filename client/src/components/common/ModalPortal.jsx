import { createPortal } from 'react-dom';

/**
 * Renders a dialog straight into <body>. Dashboard cards use backdrop-filter, which turns them into the
 * containing block of any `position: fixed` child — a dialog left inside one is sized and centred against
 * the card instead of the screen. The `.dashboard-shell` wrapper (display: contents, no box of its own)
 * keeps the panel's theme variables and its `.dashboard-shell …` rules applying to the portaled dialog.
 */
const ModalPortal = ({ children }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(<div className="dashboard-shell dashboard-portal">{children}</div>, document.body);
};

export default ModalPortal;
