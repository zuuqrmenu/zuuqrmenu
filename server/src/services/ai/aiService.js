import geminiProvider from './providers/geminiProvider.js';
import nvidiaProvider from './providers/nvidiaProvider.js';
import { getSystemPrompt } from './prompts/systemPrompt.js';
import aiConfigService from './aiConfigService.js';
import AiUsageLog from '../../models/AiUsageLog.js';

const getProviderForModel = (model) => (
  model === 'google/gemma-4-31b-it' ? nvidiaProvider : geminiProvider
);

const getProviderName = (model) => (
  model === 'google/gemma-4-31b-it' ? 'nvidia' : 'gemini'
);

const MAX_MESSAGE_LENGTH = 4000;

/**
 * Validates a user chat message
 * @param {string} message
 */
const validateMessage = (message) => {
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
  if (trimmed.length === 0) {
    const error = new Error('Mesaj alanı boş bırakılamaz.');
    error.statusCode = 400;
    throw error;
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    const error = new Error(`Mesaj çok uzun. En fazla ${MAX_MESSAGE_LENGTH} karakter gönderilebilir.`);
    error.statusCode = 400;
    throw error;
  }

  return trimmed;
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
export const generateResponse = async ({ message, restaurantContext, context, restaurantId, userId }) => {
  const cleanMessage = validateMessage(message);
  const systemInstruction = getSystemPrompt();

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

export default {
  generateResponse,
};
