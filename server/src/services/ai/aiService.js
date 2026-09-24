import geminiProvider from './providers/geminiProvider.js';
import nvidiaProvider from './providers/nvidiaProvider.js';
import { getSystemPrompt } from './prompts/systemPrompt.js';
import aiConfigService from './aiConfigService.js';
import AiUsageLog from '../../models/AiUsageLog.js';

const getProviderForModel = (model) => (
  model === 'google/gemma-4-31b-it' || model === 'z-ai/glm-5.3-flash' || model === 'deepseek-ai/deepseek-v4.1-flash' ? nvidiaProvider : geminiProvider
);

const getProviderName = (model) => (
  model === 'google/gemma-4-31b-it' || model === 'z-ai/glm-5.3-flash' || model === 'deepseek-ai/deepseek-v4.1-flash' ? 'nvidia' : 'gemini'
);

const MAX_MESSAGE_LENGTH = 4000;
const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const validateImages = (images) => {
  if (!Array.isArray(images)) {
    const error = new Error('Görseller geçersiz formatta.');
    error.statusCode = 400;
    throw error;
  }
  if (images.length > MAX_IMAGES) {
    const error = new Error(`En fazla ${MAX_IMAGES} görsel ekleyebilirsiniz.`);
    error.statusCode = 400;
    throw error;
  }
  let totalBytes = 0;
  return images.map((image) => {
    if (!image || !ALLOWED_IMAGE_TYPES.has(image.mimeType) || typeof image.data !== 'string' || !image.data) {
      const error = new Error('Yalnızca JPG, PNG veya WEBP görseller yükleyebilirsiniz.');
      error.statusCode = 400;
      throw error;
    }
    const size = Math.ceil((image.data.length * 3) / 4);
    if (size > MAX_IMAGE_BYTES) {
      const error = new Error('Görsel boyutu 10 MB değerinden küçük olmalıdır.');
      error.statusCode = 400;
      throw error;
    }
    totalBytes += size;
    if (totalBytes > MAX_TOTAL_IMAGE_BYTES) {
      const error = new Error('Eklenen görsellerin toplam boyutu 8 MB değerinden küçük olmalıdır.');
      error.statusCode = 400;
      throw error;
    }
    return { mimeType: image.mimeType, data: image.data };
  });
};

/**
 * Validates a user chat message
 * @param {string} message
 */
const validateMessage = (message, hasImages = false) => {
  if (message === undefined || message === null) {
    const error = new Error('Mesaj alanı zorunludur.');
    error.statusCode = 400;
    throw error;
  }

  if (typeof message !== 'string') {
    const error = new Error('Mesaj metin formatında olmalıdır.');
    error.statusCode = 400;
    throw error;
  }

  const trimmed = message.trim();
  if (trimmed.length === 0 && !hasImages) {
    const error = new Error('Mesaj alanı boş bırakılamaz.');
    error.statusCode = 400;
    throw error;
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    const error = new Error(`Mesaj çok uzun. En fazla ${MAX_MESSAGE_LENGTH} karakter gönderilebilir.`);
    error.statusCode = 400;
    throw error;
  }

  return trimmed || 'Eklenen görselleri analiz et.';
};

/**
 * Logs AI request usage asynchronously without blocking the user response
 */
const logAiUsage = async ({ restaurantId, userId, model, provider, success, tokens, durationMs, errorMessage }) => {
  try {
    await AiUsageLog.create({
      restaurantId: restaurantId || null,
      userId: userId || null,
      model,
      provider: provider || 'gemini',
      success,
      tokens: {
        promptTokens: tokens?.promptTokens || 0,
        candidateTokens: tokens?.candidateTokens || 0,
        totalTokens: tokens?.totalTokens || 0,
      },
      durationMs,
      errorMessage: errorMessage || null,
      timestamp: new Date(),
    });
  } catch (logErr) {
    console.error('[ZuuAI Usage] Failed to save usage log:', logErr.message);
  }
};

/**
 * Provider-independent response generation function
 * @param {Object} params
 * @param {string} params.message - The user's input message
 * @param {string} [params.restaurantContext] - Built restaurant menu & analytics context
 * @param {Object} [params.context] - Optional restaurant or conversation context
 * @param {string} [params.restaurantId] - Optional restaurant ObjectId
 * @param {string} [params.userId] - Optional user ObjectId
 * @returns {Promise<{ text: string }>} Normalized response object
 */
export const generateResponse = async ({ message, images = [], restaurantContext, context, restaurantId, userId, systemInstruction: customSystemInstruction, responseMimeType, providerTimeoutMs }) => {
  const cleanImages = validateImages(images);
  const cleanMessage = validateMessage(message, cleanImages.length > 0);
  const systemInstruction = customSystemInstruction || getSystemPrompt();

  let resolvedContext = restaurantContext;
  if (!resolvedContext && typeof context === 'string') {
    resolvedContext = context;
  } else if (context && typeof context === 'object' && Object.keys(context).length > 0) {
    resolvedContext = `${resolvedContext ? `${resolvedContext}\n\n` : ''}[Ek Bağlam]:\n${JSON.stringify(context)}`;
  }

  const activeModel = await aiConfigService.getActiveModel();
  const activeProvider = getProviderForModel(activeModel);
  const providerName = getProviderName(activeModel);
  const startTime = Date.now();

  try {
    const providerResult = await activeProvider.generateText({
      prompt: cleanMessage,
      systemInstruction,
      restaurantContext: resolvedContext,
      model: activeModel,
      images: cleanImages,
      responseMimeType,
      providerTimeoutMs,
    });

    const durationMs = Date.now() - startTime;
    const text = typeof providerResult === 'string' ? providerResult : providerResult?.text;
    const usage = providerResult?.usage || null;

    // Asynchronously log usage metrics
    logAiUsage({
      restaurantId,
      userId,
      model: activeModel,
      provider: providerName,
      success: true,
      tokens: usage,
      durationMs,
    });

    return {
      text,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logAiUsage({
      restaurantId,
      userId,
      model: activeModel,
      provider: providerName,
      success: false,
      durationMs,
      errorMessage: error.message,
    });
    throw error;
  }
};

export const generateMenuImportDraft = async ({ images, restaurantId, userId }) => {
  const activeModel = await aiConfigService.getActiveModel();
  const supportsMenuImages = activeModel.startsWith('gemini-') || activeModel === 'deepseek-ai/deepseek-v4.1-flash';
  if (!supportsMenuImages) {
    const modelError = new Error(`Seçili model (${activeModel}) görsel analizi desteklemiyor. Menü yüklemek için Gemini veya NVIDIA DeepSeek V4.1 Flash modelini seçin.`);
    modelError.statusCode = 422;
    throw modelError;
  }

  const analyzerPrompt = `Yüklenen menü görsellerini analiz et ve yalnızca geçerli JSON döndür.

JSON şeması:
{
  "categories": [
    {
      "name": "Kategori adı",
      "description": "Kısa kategori açıklaması",
      "products": [
        {
          "name": "Ürün adı",
          "price": 0,
          "oldPrice": null,
          "shortDescription": "Kısa açıklama",
          "description": "Ürün açıklaması",
          "ingredients": [],
          "allergens": [],
          "calories": null
        }
      ]
    }
  ]
}

Menüde açıkça yazmayan fiyatları tahmin etme; price bilinmiyorsa 0 kullan. Görselde olmayan ürün veya kategori uydurma. Metin okunamıyorsa en yakın okunabilir metni kullan. JSON dışında hiçbir açıklama yazma.`;
  const parseDraft = (text) => {
    const responseText = String(text || '').trim();
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');
    const raw = jsonStart >= 0 && jsonEnd > jsonStart
      ? responseText.slice(jsonStart, jsonEnd + 1)
      : responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.categories)) throw new Error('categories alanı bulunamadı');
    const draft = {
      categories: parsed.categories.map((category) => ({
        name: String(category.name || '').trim(),
        description: String(category.description || '').trim(),
        products: Array.isArray(category.products) ? category.products.map((product) => ({
          name: String(product.name || '').trim(),
          price: Number.isFinite(Number(product.price)) ? Number(product.price) : 0,
          oldPrice: product.oldPrice === null || product.oldPrice === undefined ? null : Number(product.oldPrice) || null,
          shortDescription: String(product.shortDescription || '').trim(),
          description: String(product.description || '').trim(),
          ingredients: Array.isArray(product.ingredients) ? product.ingredients.map(String).filter(Boolean) : [],
          allergens: Array.isArray(product.allergens) ? product.allergens.map(String).filter(Boolean) : [],
          calories: product.calories === null || product.calories === undefined ? null : Number(product.calories) || null,
        })).filter((product) => product.name) : [],
      })).filter((category) => category.name),
    };
    if (draft.categories.length === 0) {
      const emptyError = new Error('Menü görselinde okunabilir kategori veya ürün bulunamadı.');
      emptyError.statusCode = 422;
      throw emptyError;
    }
    return draft;
  };

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await generateResponse({
        message: analyzerPrompt,
        images,
        restaurantId,
        userId,
        systemInstruction: 'Sen menü görsellerinden yapılandırılmış menü verisi çıkaran bir veri analiz aracısısın. Kullanıcıya sohbet yanıtı verme; yalnızca istenen JSON şemasını üret.',
        responseMimeType: 'application/json',
        providerTimeoutMs: 180000,
      });
      return parseDraft(result.text);
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }

  const parseError = new Error(lastError?.statusCode === 504
    ? 'AI sağlayıcısı zamanında yanıt vermedi. Görseli tekrar deneyin veya Gemini modelini seçin.'
    : 'Menü analizi beklenen veriyi üretemedi. Aynı görselle otomatik olarak tekrar denendi; lütfen yeniden deneyin.');
  parseError.statusCode = lastError?.statusCode || 502;
  throw parseError;
};

export default {
  generateResponse,
  generateMenuImportDraft,
};
