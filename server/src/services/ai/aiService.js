import geminiProvider from './providers/geminiProvider.js';
import nvidiaProvider from './providers/nvidiaProvider.js';
import { getSystemPrompt } from './prompts/systemPrompt.js';
import aiConfigService from './aiConfigService.js';
import AiUsageLog from '../../models/AiUsageLog.js';

const getProviderForModel = (model) => (
  model && !model.startsWith('gemini-') ? nvidiaProvider : geminiProvider
);

const getProviderName = (model) => (
  model && !model.startsWith('gemini-') ? 'nvidia' : 'gemini'
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
const logAiUsage = async ({ restaurantId, userId, model, provider, success, tokens, durationMs, errorMessage, feature = 'chatAssistant' }) => {
  try {
    await AiUsageLog.create({
      restaurantId: restaurantId || null,
      userId: userId || null,
      model,
      provider: provider || 'gemini',
      feature: feature || 'chatAssistant',
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
 * @param {string} [params.model] - Optional model ID override
 * @param {'chatAssistant'|'menuUpload'} [params.feature='chatAssistant'] - Feature name
 * @returns {Promise<{ text: string }>} Normalized response object
 */
export const generateResponse = async ({
  message,
  images = [],
  restaurantContext,
  context,
  restaurantId,
  userId,
  systemInstruction: customSystemInstruction,
  responseMimeType,
  providerTimeoutMs,
  model,
  feature = 'chatAssistant',
}) => {
  const cleanImages = validateImages(images);
  const cleanMessage = validateMessage(message, cleanImages.length > 0);
  const systemInstruction = customSystemInstruction || getSystemPrompt();

  let resolvedContext = restaurantContext;
  if (!resolvedContext && typeof context === 'string') {
    resolvedContext = context;
  } else if (context && typeof context === 'object' && Object.keys(context).length > 0) {
    resolvedContext = `${resolvedContext ? `${resolvedContext}\n\n` : ''}[Ek Bağlam]:\n${JSON.stringify(context)}`;
  }

  const activeModel = model || (await aiConfigService.getFeatureModel(feature));
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
      feature,
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
      feature,
      success: false,
      durationMs,
      errorMessage: error.message,
    });
    throw error;
  }
};

export const generateMenuImportDraft = async ({ images, restaurantId, userId, model }) => {
  const menuModel = model || (await aiConfigService.getFeatureModel('menuUpload'));
  const supportsMenuImages = menuModel.startsWith('gemini-') ||
    menuModel === 'deepseek-ai/deepseek-v4.1-flash' ||
    menuModel === 'meta/llama-3.2-11b-vision-instruct' ||
    menuModel === 'google/diffusiongemma-26b-a4b-it';
  if (!supportsMenuImages) {
    const modelError = new Error(`Menünü Yükle için seçili model (${menuModel}) görsel analizi desteklemiyor. Lütfen admin panelinden Gemini, DeepSeek V4.1 Flash, Meta Llama 3.2 11B Vision veya Google DiffusionGemma 26B modelini seçin.`);
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
    let str = String(text || '').trim();

    // Strip <think>...</think> or <thought>...</thought> tags if model produces reasoning
    str = str.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();

    // Extract from markdown code fence if present
    const codeBlockMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      str = codeBlockMatch[1].trim();
    }

    // Find outermost JSON structure
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      str = str.slice(firstBrace, lastBrace + 1);
    }

    // Remove trailing commas before } or ]
    str = str.replace(/,\s*([\]}])/g, '$1');

    let parsed;
    try {
      parsed = JSON.parse(str);
    } catch (parseErr) {
      console.warn('Draft JSON parse error. Raw response was:\n', text);
      const syntaxErr = new Error('Menü görselinden geçerli JSON yapısı elde edilemedi.');
      syntaxErr.statusCode = 422;
      throw syntaxErr;
    }

    if (!Array.isArray(parsed.categories)) {
      if (Array.isArray(parsed)) {
        parsed = { categories: parsed };
      } else if (Array.isArray(parsed.menu)) {
        parsed = { categories: parsed.menu };
      } else if (Array.isArray(parsed.data)) {
        parsed = { categories: parsed.data };
      } else {
        const schemaErr = new Error('Menü görselinde kategori listesi bulunamadı.');
        schemaErr.statusCode = 422;
        throw schemaErr;
      }
    }

    const draft = {
      categories: parsed.categories.map((category) => ({
        name: String(category.name || category.categoryName || category.kategori || '').trim(),
        description: String(category.description || category.aciklama || '').trim(),
        products: Array.isArray(category.products || category.items || category.urunler)
          ? (category.products || category.items || category.urunler).map((product) => ({
            name: String(product.name || product.urunAdi || product.title || '').trim(),
            price: Number.isFinite(Number(product.price ?? product.fiyat)) ? Number(product.price ?? product.fiyat) : 0,
            oldPrice: product.oldPrice === null || product.oldPrice === undefined ? null : Number(product.oldPrice) || null,
            shortDescription: String(product.shortDescription || '').trim(),
            description: String(product.description || product.aciklama || '').trim(),
            ingredients: Array.isArray(product.ingredients || product.malzemeler) ? (product.ingredients || product.malzemeler).map(String).filter(Boolean) : [],
            allergens: Array.isArray(product.allergens || product.alerjenler) ? (product.allergens || product.alerjenler).map(String).filter(Boolean) : [],
            calories: product.calories === null || product.calories === undefined ? null : Number(product.calories) || null,
          })).filter((product) => product.name)
          : [],
      })).filter((category) => category.name),
    };

    if (draft.categories.length === 0) {
      const emptyError = new Error('Menü görselinde okunabilir kategori veya ürün bulunamadı. Lütfen görselin net olduğundan emin olun.');
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
        model: menuModel,
        feature: 'menuUpload',
      });
      return parseDraft(result.text);
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }

  if (lastError?.statusCode === 422) {
    throw lastError;
  }

  const parseError = new Error(lastError?.statusCode === 504
    ? 'AI sağlayıcısı zamanında yanıt vermedi. Görseli tekrar deneyin veya Gemini modelini seçin.'
    : (lastError?.message || 'Menü analizi beklenen veriyi üretemedi. Aynı görselle otomatik olarak tekrar denendi; lütfen yeniden deneyin.'));
  parseError.statusCode = lastError?.statusCode || 502;
  throw parseError;
};

const parseJsonFromResponse = (text) => {
  let str = String(text || '').trim();
  str = str.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
  const codeBlockMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    str = codeBlockMatch[1].trim();
  }
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    str = str.slice(firstBrace, lastBrace + 1);
  }
  str = str.replace(/,\s*([\]}])/g, '$1');
  return JSON.parse(str);
};

/**
 * Suggests detailed product information (description, estimated calories, ingredients, allergens, dietary tags)
 * using the configured smartProductDescriptionModel.
 */
export const suggestProductDetails = async ({
  name,
  categoryName = '',
  currentDescription = '',
  ingredients = [],
  allergens = [],
  dietaryTags = [],
  restaurantId,
  userId,
}) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    const err = new Error('Ürün adı gereklidir.');
    err.statusCode = 400;
    throw err;
  }

  const prompt = `Restoran menüsü için ürün bilgilerini zenginleştir ve sadece geçerli JSON döndür.

Ürün Bilgileri:
- Ürün Adı: "${name.trim()}"
- Kategori: "${(categoryName || '').trim()}"
${currentDescription ? `- Mevcut Açıklama: "${currentDescription.trim()}"` : ''}
${Array.isArray(ingredients) && ingredients.length > 0 ? `- Girilen Malzemeler: ${ingredients.join(', ')}` : ''}
${Array.isArray(allergens) && allergens.length > 0 ? `- Girilen Alerjenler: ${allergens.join(', ')}` : ''}
${Array.isArray(dietaryTags) && dietaryTags.length > 0 ? `- Diyet Etiketleri: ${dietaryTags.join(', ')}` : ''}

Kurallar:
1. "description": İştah açıcı, kaliteli, 1-2 cümlelik restoran menü açıklaması. Kullanıcı tarafından belirtilmemiş kesin gramaj veya uydurma köken iddialarında bulunma; güvenli ve şık bir dil kullan.
2. "calories": Ürün için gerçekçi yaklaşık kalori tahmini (tamsayı, örn: 320) veya emin değilsen null.
3. "ingredients": Ürünün temel olası malzemeleri (Türkçe dizi, örn: ["Domates", "Soğan"]).
4. "allergens": Olası alerjenler (örn: ["Gluten", "Süt (Laktoz)"] veya alerjen yoksa ["Alerjen İçermez"]).
5. "dietaryTags": Yalnızca geçerli değerler: "VEGETARIAN", "VEGAN", "GLUTEN_FREE", "DAIRY_FREE", "NUT_FREE", "HALAL", "KOSHER", "ORGANIC" (uygun olanlar).

JSON Şeması:
{
  "description": "...",
  "calories": 350,
  "ingredients": ["..."],
  "allergens": ["..."],
  "dietaryTags": ["..."]
}`;

  const smartModel = await aiConfigService.getFeatureModel('smartProductDescription');
  const result = await generateResponse({
    message: prompt,
    restaurantId,
    userId,
    systemInstruction: 'Sen restoran menüleri için uzman bir gastronomi ve menü içerik asistanısın. Kullanıcıya sohbet yanıtı verme; yalnızca belirtilen JSON formatında yanıt üret.',
    responseMimeType: 'application/json',
    providerTimeoutMs: 60000,
    model: smartModel,
    feature: 'smartProductDescription',
  });

  try {
    const parsed = parseJsonFromResponse(result.text);
    const VALID_DIETARY_TAGS = new Set(['VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'NUT_FREE', 'HALAL', 'KOSHER', 'ORGANIC']);

    return {
      description: String(parsed.description || '').trim(),
      calories: Number.isFinite(Number(parsed.calories)) ? Math.round(Number(parsed.calories)) : null,
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.map(String).map((s) => s.trim()).filter(Boolean) : [],
      allergens: Array.isArray(parsed.allergens) ? parsed.allergens.map(String).map((s) => s.trim()).filter(Boolean) : [],
      dietaryTags: Array.isArray(parsed.dietaryTags) ? parsed.dietaryTags.filter((tag) => VALID_DIETARY_TAGS.has(tag)) : [],
    };
  } catch (parseErr) {
    console.warn('[ZuuAI Product Suggest] JSON parse error, raw text was:', result.text);
    return {
      description: String(result.text || '').trim(),
      calories: null,
      ingredients: [],
      allergens: [],
      dietaryTags: [],
    };
  }
};

/**
 * Generates smart product descriptions in chunks for the menu import confirmation flow.
 */
export const batchGenerateProductDescriptions = async ({
  categories = [],
  restaurantId,
  userId,
}) => {
  const productsToProcess = [];
  categories.forEach((cat, catIdx) => {
    (cat.products || []).forEach((prod, prodIdx) => {
      productsToProcess.push({
        catIdx,
        prodIdx,
        name: prod.name,
        categoryName: cat.name,
        existingDescription: prod.description || prod.shortDescription || '',
      });
    });
  });

  if (productsToProcess.length === 0) {
    return { categories, processedCount: 0, failedCount: 0 };
  }

  const smartModel = await aiConfigService.getFeatureModel('smartProductDescription');
  const CHUNK_SIZE = 10;
  const deepClonedCategories = JSON.parse(JSON.stringify(categories));
  let processedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < productsToProcess.length; i += CHUNK_SIZE) {
    const chunk = productsToProcess.slice(i, i + CHUNK_SIZE);
    const chunkItemsText = chunk.map((item, index) =>
      `${index + 1}. Ürün Adı: "${item.name}" (Kategori: "${item.categoryName}")${item.existingDescription ? ` [Mevcut: "${item.existingDescription}"]` : ''}`
    ).join('\n');

    const prompt = `Aşağıdaki ${chunk.length} restoran ürünü için iştah açıcı, 1-2 cümlelik menü açıklamaları ve yaklaşık kalori/alerjen bilgileri oluştur. Yalnızca geçerli JSON formatı döndür.

Ürünler:
${chunkItemsText}

Kurallar:
- Her ürün için "description" (menüye uygun, iştah açıcı, kesin uydurma veri içermeyen 1-2 cümlelik açıklama), "calories" (tahmini kalori sayısı veya null), "allergens" (olası alerjenler dizisi veya ["Alerjen İçermez"]) üret.
- Sıralamayı ve index eşleşmesini koru.

JSON Formatı:
{
  "items": [
    {
      "index": 1,
      "description": "...",
      "calories": 350,
      "allergens": ["..."]
    }
  ]
}`;

    try {
      const result = await generateResponse({
        message: prompt,
        restaurantId,
        userId,
        systemInstruction: 'Sen profesyonel restoran menü yazarı ve gastronomi asistanısın. Yalnızca belirtilen JSON formatında yanıt üret.',
        responseMimeType: 'application/json',
        providerTimeoutMs: 90000,
        model: smartModel,
        feature: 'smartProductDescription',
      });

      const parsed = parseJsonFromResponse(result.text);
      const items = Array.isArray(parsed.items) ? parsed.items : (Array.isArray(parsed) ? parsed : []);

      chunk.forEach((meta, idx) => {
        const itemResult = items[idx] || items.find((it) => it.index === idx + 1);
        const targetProd = deepClonedCategories[meta.catIdx]?.products?.[meta.prodIdx];
        if (targetProd) {
          if (itemResult?.description) {
            targetProd.description = String(itemResult.description).trim();
            if (!targetProd.shortDescription) {
              targetProd.shortDescription = targetProd.description.length > 80
                ? targetProd.description.slice(0, 77) + '...'
                : targetProd.description;
            }
            processedCount++;
          }
          if (targetProd.calories === null || targetProd.calories === undefined) {
            if (Number.isFinite(Number(itemResult?.calories))) {
              targetProd.calories = Math.round(Number(itemResult.calories));
            }
          }
          if ((!targetProd.allergens || targetProd.allergens.length === 0) && Array.isArray(itemResult?.allergens)) {
            targetProd.allergens = itemResult.allergens.map(String).map((s) => s.trim()).filter(Boolean);
          }
        }
      });
    } catch (chunkErr) {
      console.warn(`[ZuuAI Batch Description] Chunk ${i / CHUNK_SIZE + 1} failed:`, chunkErr.message);
      failedCount += chunk.length;
    }
  }

  return {
    categories: deepClonedCategories,
    processedCount,
    failedCount,
  };
};

export default {
  generateResponse,
  generateMenuImportDraft,
  suggestProductDetails,
  batchGenerateProductDescriptions,
};
