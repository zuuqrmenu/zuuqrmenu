/* Expands the `S ` shorthand in src/styles/dashboard-theme.src.css into the full high-specificity prefix
   and writes src/styles/dashboard-theme.css.   Run: node scripts/build-dashboard-theme.cjs */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'styles');
const PREFIX = 'body .dashboard-shell.dashboard-shell';
const MODAL_SCOPE = 'body[data-dashboard-theme] :is(' + ['product-modal', 'bulk-actions-modal', 'menu-import-modal', 'menu-compact', 'menu-customization', 'settings-modal', 'analytics-modal', 'analytics-detail-modal', 'menu-onboarding', 'overview-status-dialog', 'qr-print', 'category-modal'].map((c) => '[class*="' + c + '"]').join(', ') + ')';
const src = fs.readFileSync(path.join(dir, 'dashboard-theme.src.css'), 'utf8');

// `S ` at the start of a line, or right after a comma in a selector list, becomes the prefix.
const out = src
  .replace(/(^[ 	]*|, )M(?= [.:[a-z*>])/gm, (_, lead) => lead + MODAL_SCOPE)
  .replace(/(^[ 	]*|, )S(?= [.:[a-z*>])/gm, (_, lead) => lead + PREFIX)
  .replace(/^S(\.[a-z-]+)?\s*\{/gm, (_, mod) => `${PREFIX}${mod || ''} {`);

const banner = '/* GENERATED from dashboard-theme.src.css by scripts/build-dashboard-theme.cjs. Do not edit by hand. */\n';
fs.writeFileSync(path.join(dir, 'dashboard-theme.css'), banner + out);
console.log('dashboard-theme.css written,', out.length, 'bytes');
