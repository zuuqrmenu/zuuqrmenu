import { ASSISTANT_ACTIONS } from './prompts/platformKnowledge.js';

const TAG_PATTERN = /\[\[\s*git\s*:\s*([a-z_]+)\s*\]\]/gi;

const normalize = (text) => String(text || '')
  .toLowerCase()
  .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
  .replace(/\s+/g, ' ');

const toAction = (id) => {
  const action = ASSISTANT_ACTIONS[id];
  return action ? { id, label: action.label, to: action.to } : null;
};

/** Removes [[git:ID]] tags from the model output and returns the clean text plus the validated actions. */
export const extractActions = (text) => {
  const ids = [];
  const cleaned = String(text || '')
    .replace(TAG_PATTERN, (_, id) => { ids.push(id.toLowerCase()); return ''; })
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text: cleaned, ids };
};

// Fallback so a navigation button still appears when the model forgets the tag. Order matters: first hit wins per rule.
const INTENT_RULES = [
  { id: 'menu_customize', pattern: /(ozellestir|tasarim|tema\b|temayi|renk|yazi tipi|font|gorunum)/ },
  { id: 'menu_import', pattern: /(menu(mu)? (yukle|aktar)|pdf|fotograftan menu|menu(yu)? ice aktar)/ },
  { id: 'add_category', pattern: /kategori (ekle|olustur|nasil)/ },
  { id: 'qr', pattern: /(qr|karekod|masa stand)/ },
  { id: 'analytics', pattern: /(istatistik|analitik|goruntulen|kac kisi|ziyaretci)/ },
  { id: 'billing', pattern: /(abonelik|odeme|paket sat|satin al|faturam|fatura|paketimi)/ },
  { id: 'settings_security', pattern: /(sifre|guvenlik)/ },
  { id: 'settings_brand', pattern: /(logo|kapak|sosyal medya|instagram|marka)/ },
  { id: 'pricing', pattern: /(fiyat(lar)?i? nedir|paket(ler)? (neler|farki)|ucret|kac tl|ne kadar)/ },
  { id: 'menu', pattern: /(urun (ekle|duzenle|sil)|fiyat(i)? (degistir|guncelle)|menu(mu)? (duzenle|yonet)|tukendi)/ },
];

const NAVIGATION_VERB = /(nasil|nereden|nerede|gitmek|git|ac\b|acabilir|yapabilirim|istiyorum|isterim|yonlendir|goster|neden|nedir)/;

export const detectIntentAction = (message) => {
  const text = normalize(message);
  if (!text || !NAVIGATION_VERB.test(text)) return null;
  const rule = INTENT_RULES.find((item) => item.pattern.test(text));
  return rule ? toAction(rule.id) : null;
};

/**
 * Combines model-chosen and intent-detected actions: unique, valid, max 2.
 * Model choices win; the intent fallback only fills in when the model gave none.
 */
export const resolveActions = ({ ids = [], userMessage = '' }) => {
  const actions = [];
  const seen = new Set();
  for (const id of ids) {
    const action = toAction(id);
    if (action && !seen.has(id)) { seen.add(id); actions.push(action); }
    if (actions.length === 2) return actions;
  }
  if (actions.length === 0) {
    const fallback = detectIntentAction(userMessage);
    if (fallback) actions.push(fallback);
  }
  return actions;
};
