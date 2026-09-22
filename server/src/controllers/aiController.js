import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import aiService from '../services/ai/aiService.js';
import restaurantContextService from '../services/ai/restaurantContextService.js';
import { checkTopicScope } from '../services/ai/scopeGuard.js';
import aiConfigService from '../services/ai/aiConfigService.js';

/**
 * Strips sensitive values like the Gemini API key from error messages
 */
const sanitizeError = (error, apiKey) => {
  let message = error?.message || 'Unknown error occurred while contacting Gemini API';
  if (apiKey && typeof message === 'string') {
    message = message.split(apiKey).join('[REDACTED]');
  }
  return message;
};

/**
 * Minimal Gemini connection test endpoint
 * GET /api/ai/test
 */
export const testGeminiConnection = async (req, res) => {
  // Reload dotenv to pick up any changes made to .env without requiring a server restart
  dotenv.config({ override: true });
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return res.status(500).json({
      success: false,
      error: 'GEMINI_API_KEY is missing or not configured in environment variables.',
    });
  }

  const modelName = req.query.model || process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: 'Reply with exactly: ZuuAI bağlantısı başarılı.',
    });

    const reply = response?.text?.trim() || 'ZuuAI bağlantısı başarılı.';

    return res.status(200).json({
      success: true,
      message: reply,
    });
  } catch (error) {
    const safeErrorDetails = sanitizeError(error, apiKey);
    console.error('Gemini API test error:', safeErrorDetails);

    return res.status(502).json({
      success: false,
      error: 'Gemini API bağlantısı başarısız oldu.',
      details: safeErrorDetails,
    });
  }
};

/**
 * Lightweight endpoint to retrieve current user quota/usage on chat load.
 * GET /api/ai/usage
 */
export const getQuotaStatus = async (req, res, next) => {
  try {
    const restaurantId = req.restaurant?._id || req.user?.restaurantId;
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';

    const usage = await aiConfigService.getUserUsageAndLimits({ restaurantId, userId, isAdmin });

    return res.status(200).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Chat endpoint for ZuuAI
 * POST /api/ai/chat
 */
export const handleChat = async (req, res) => {
  const { message, context } = req.body || {};
  const restaurantId = req.restaurant?._id || req.user?.restaurantId;
  const userId = req.user?.userId;
  const isAdmin = req.user?.role === 'ADMIN';

  try {
    // 1. Topic Scope Guard check BEFORE building expensive context, checking quota or calling Gemini
    const scopeCheck = checkTopicScope(message);
    if (!scopeCheck.allowed) {
      console.log(
        `[ZuuAI Scope Guard] Out-of-scope question rejected locally without Gemini (category: ${scopeCheck.reason}): "${message}"`
      );
      // Fetch current usage without consuming quota
      const currentQuota = await aiConfigService.getUserUsageAndLimits({ restaurantId, userId, isAdmin });

      return res.status(200).json({
        success: true,
        message: scopeCheck.response,
        usage: currentQuota,
      });
    }

    // 2. Server-Side Quota Enforcement
    const quota = await aiConfigService.getUserUsageAndLimits({ restaurantId, userId, isAdmin });

    if (!isAdmin) {
      if (quota.disabled) {
        return res.status(403).json({
          success: false,
          code: 'ZUUAI_DISABLED',
          error: 'ZuuAI bu restoran için yönetici tarafından devre dışı bırakılmıştır.',
          usage: quota,
        });
      }

      if (quota.dailyRemaining <= 0) {
        return res.status(429).json({
          success: false,
          code: 'DAILY_LIMIT_REACHED',
          error: 'Günlük mesaj limitinize ulaştınız.',
          usage: quota,
        });
      }

      if (quota.monthlyRemaining <= 0) {
        return res.status(429).json({
          success: false,
          code: 'MONTHLY_LIMIT_REACHED',
          error: 'Aylık mesaj limitinize ulaştınız.',
          usage: quota,
        });
      }
    }

    // 3. Build restaurant context
    const restaurantContext = await restaurantContextService.buildRestaurantContext(
      restaurantId,
      userId
    );

    // 4. Generate response via AI service
    const result = await aiService.generateResponse({
      message,
      restaurantContext,
      context,
      restaurantId,
      userId,
    });

    // 5. Compute updated usage only on successful completion
    const updatedUsage = isAdmin ? quota : {
      ...quota,
      dailyUsed: quota.dailyUsed + 1,
      dailyRemaining: Math.max(0, quota.dailyRemaining - 1),
      monthlyUsed: quota.monthlyUsed + 1,
      monthlyRemaining: Math.max(0, quota.monthlyRemaining - 1),
    };

    return res.status(200).json({
      success: true,
      message: result.text,
      usage: updatedUsage,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const isClientError = statusCode >= 400 && statusCode < 500;

    return res.status(statusCode).json({
      success: false,
      error: isClientError ? error.message : 'ZuuAI şu anda yanıt veremiyor. Lütfen tekrar deneyin.',
      ...(isClientError ? {} : { details: error.message }),
    });
  }
};
