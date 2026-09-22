/**
 * Topic Scope Guard for ZuuAI
 *
 * Ensures ZuuAI remains a focused assistant for restaurant owners using zuuqrmenu.
 * Rejects clearly out-of-scope queries (weather, sports, crypto, coding, trivia, poems, etc.)
 * LOCALLY before building restaurant context and calling Gemini, saving tokens and latency.
 *
 * Important principle:
 * Context matters. If an inquiry has a restaurant, menu, food, drink, pricing, or
 * zuuqrmenu dimension (e.g. "Bugün hava sıcaksa soğuk içecekleri öne çıkarmalı mıyım?"),
 * it is allowed through to Gemini.
 */

export const OUT_OF_SCOPE_RESPONSE =
  'Bu konuda yardımcı olamıyorum. Ben zuuqrmenu üzerindeki menünüz, ürünleriniz ve dijital menü deneyiminizle ilgili konularda yardımcı olmak için buradayım.';

/**
 * Normalizes text for consistent inspection (lowercased, transliterated Turkish characters, single spaces)
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Restaurant / Menu strategy keywords that rescue a query from being blocked
 * even if it mentions general concepts like weather.
 */
const STRATEGY_RESCUE_PATTERNS = [
  /\bmenu/i,
  /\burun/i,
  /\bfiyat/i,
  /\bicecek/i,
  /\byemek/i,
  /\btatli/i,
  /\bcorba/i,
  /\bkahve/i,
  /\bcay\b/i,
  /\bkahvalti/i,
  /\bburger/i,
  /\bpizza/i,
  /\bmakarna/i,
  /\bsalata/i,
  /\bone\s+cikar/i,
  /\bsatis/i,
  /\brestoran/i,
  /\brestaurant/i,
  /\bkafe/i,
  /\bcafe/i,
  /\blokanta/i,
  /\bmusteri/i,
  /\bgarson/i,
  /\bmutfak/i,
  /\bzuuqrmenu/i,
  /\bkarekod/i,
  /\bgoruntulen/i,
];

/**
 * Explicit out-of-scope patterns that have zero connection to restaurant/menu.
 */
const OUT_OF_SCOPE_RULES = [
  // 1. General Weather (when no menu/beverage strategy rescue is present)
  {
    category: 'weather',
    pattern: /(?:(?:bugun|yarin|haftalik|istanbul|ankara|izmir|bursa|antalya)?\s*hava(?:lar)?\s*(?:.*?\s+)?(?:nasil|kac\s+derece|durumu|raporu|soguk\s+mu|sicak\s+mi)|hava\s+durumu|yagmur\s+(?:yagacak\s+mi|var\s+mi)|kar\s+(?:yagacak\s+mi|var\s+mi)|how('?s|\s+is)\s+the\s+weather|weather\s+today|weather\s+forecast)/i,
    canBeRescued: true,
  },

  // 2. Software Development / General Coding (except QR code / platform topics)
  {
    category: 'coding',
    pattern: /(?:\b(?:python|javascript|typescript|golang|php|react|vue|angular|svelte|django|flask|laravel)\b|c\+\+|c\#|\b(?:array|dizi|pointer|fonksiyon|algoritma)\s+(?:nasil|nedir|siralanir|yazilir)|\b(?:sql\s+injection|select\s+\*\s+from)\b|\b(?:kod|script)\s+(?:yaz|yazar\s+misin|yazarmisin|ornegi)\b|\b(?:html|css)\s+(?:div|flexbox|grid)\b|\bhow\s+to\s+(?:code|program|sort\s+an\s+array|use\s+react|use\s+python)\b)/i,
    canBeRescued: false,
  },

  // 3. Sports & Gaming
  {
    category: 'sports_gaming',
    pattern: /(?:\b(?:futbol|basketbol|voleybol|super\s+lig|sampiyonlar\s+ligi|uefa|fifa|derbi|nba|premier\s+league|la\s+liga)\b|\b(?:mac|maclar)\s+(?:sonuclari|neler|ne\s+zaman|kac\s+kac|var\s+mi|fiksturu|var\b)|\b(?:hangi\s+maclar)\b|\b(?:galatasaray|fenerbahce|besiktas|trabzonspor|real\s+madrid|barcelona)\b|\b(?:oyun\s+oyna|valorant|counter\s+strike|csgo|cs\s*2|pubg|minecraft|fortnite|gta)\b|\b(?:football|soccer|champions\s+league|match\s+scores?|who\s+won\s+the\s+match)\b)/i,
    canBeRescued: false,
  },

  // 4. Crypto, Currency, Stock Market & General Finance
  {
    category: 'finance_crypto',
    pattern: /(?:\b(?:bitcoin|btc|ethereum|eth|kripto|altcoin|dogecoin|solana)\b|\b(?:dolar|euro|sterlin|doviz)\s*(?:kuru|kac|ne\s+kadar|fiyati)\b|\b(?:dolar|euro)\s+(?:bugun|ne\s+kadar|kac\s+tl)\b|\b(?:altin|gram\s+altin|ceyrek\s+altin)\s*(?:fiyati|ne\s+kadar|kac)\b|\b(?:borsa\s+istanbul|bist\s*100|hisse\s+senedi|faiz\s+orani)\b|\bhow\s+much\s+is\s+bitcoin\b)/i,
    canBeRescued: false,
  },

  // 5. Creative Writing / Entertainment / Jokes / Horoscopes (poems, fairy tales, jokes)
  {
    category: 'entertainment_poetry',
    pattern: /(?:\b(?:siir|siiri)\s+(?:yaz|yazar\s+misin|yazarmisin|soyle|oku)\b|\b(?:bana\s+bir\s+(?:.*?\s+)?(?:siir|siiri))\b|\b(?:fikra)\s+(?:anlat|anlatir\s+misin|anlatirmisin|soyle)\b|\b(?:masal|hikaye|oyku)\s+(?:anlat|yaz|yazar\s+misin)\b|\b(?:espri|saka)\s+(?:yap|patlat)\b|\b(?:sarki\s+sozu)\s+yaz\b|\b(?:fal\s+bak|burc\s+yorumu|burcum\s+ne)\b|\bwrite\s+(?:me\s+a\s+poem|a\s+story|a\s+joke)\b)/i,
    canBeRescued: false,
  },

  // 6. General Math / Homework
  {
    category: 'math_homework',
    pattern: /(?:\b(?:odevimi\s+yap|odevime\s+yardim)\b|\b(?:turev|integral|logaritma|trigonometri)\b|^\s*\d+\s*[\+\-\*\/xX]\s*\d+\s*(?:kac\s+eder|kac|nedir|\=)?\s*\??\s*$)/i,
    canBeRescued: false,
  },

  // 7. Politics & Elections
  {
    category: 'politics',
    pattern: /(?:\b(?:secim|secimler|secimleri)\s+(?:sonuclari|ne\s+zaman|anketi|kim\s+kazandi)\b|\b(?:cumhurbaskani|basbakan)\s+kim\b|\b(?:ak\s+parti|chp|mhp|iyi\s+parti)\b)/i,
    canBeRescued: false,
  },

  // 8. Medical / Illness Diagnosis
  {
    category: 'medical',
    pattern: /(?:\b(?:hangi\s+ilaci|ilac\s+oner)\b|\b(?:hastayim\s+ne\s+yapayim)\b|\b(?:basim|karnim|midem)\s+agriyor\b)/i,
    canBeRescued: false,
  },
];

/**
 * Checks if a user's message is within ZuuAI's specialized scope.
 *
 * @param {string} message - Raw message from user
 * @returns {{ allowed: boolean, reason?: string, response?: string }}
 */
export const checkTopicScope = (message) => {
  const text = normalizeText(message);
  if (!text) {
    return { allowed: true };
  }

  // Check if any strategy rescue patterns match
  const hasStrategyRescue = STRATEGY_RESCUE_PATTERNS.some((p) => p.test(text));

  for (const rule of OUT_OF_SCOPE_RULES) {
    if (rule.pattern.test(text)) {
      // If rule can be rescued and user has a menu/restaurant strategy context, allow it
      if (rule.canBeRescued && hasStrategyRescue) {
        continue;
      }

      return {
        allowed: false,
        reason: rule.category,
        response: OUT_OF_SCOPE_RESPONSE,
      };
    }
  }

  // If not matched by any disallowed rule, allow it to proceed to Gemini
  return {
    allowed: true,
  };
};

export default {
  checkTopicScope,
  OUT_OF_SCOPE_RESPONSE,
};
