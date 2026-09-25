import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import aiService from '../services/ai/aiService.js';
import restaurantContextService from '../services/ai/restaurantContextService.js';
import { checkTopicScope } from '../services/ai/scopeGuard.js';
import aiConfigService from '../services/ai/aiConfigService.js';
import Restaurant from '../models/Restaurant.js';

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
  const { message, context, images = [] } = req.body || {};
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
      images,
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
      error: isClientError || statusCode === 502 || statusCode === 504
        ? error.message
        : 'ZuuAI şu anda yanıt veremiyor. Lütfen tekrar deneyin.',
      ...(isClientError ? {} : { details: error.message }),
    });
  }
};

export const getMenuAnalysisStatus = async (req, res, next) => {
  try {
    const restaurantId = req.restaurant?._id || req.user?.restaurantId;
    const isAdmin = req.user?.role === 'ADMIN';
    const isPromo = aiConfigService.isMenuImportUnlimitedPromo();

    if (isAdmin || isPromo) {
      return res.status(200).json({
        success: true,
        data: {
          canAnalyze: true,
          limitUsed: false,
          remainingSeconds: 0,
          isAdmin: Boolean(isAdmin),
          isPromo: Boolean(isPromo),
          promoEndsAt: '2026-10-01T00:00:00.000+03:00',
        },
      });
    }

    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restoran bulunamadı.' });
    }

    const restaurant = req.restaurant || await Restaurant.findById(restaurantId).select('lastMenuAnalysisAt').lean();
    const { startOfToday } = aiConfigService.getIstanbulDateBoundaries();

    const lastUsed = restaurant?.lastMenuAnalysisAt ? new Date(restaurant.lastMenuAnalysisAt) : null;
    const isUsedToday = Boolean(lastUsed && lastUsed >= startOfToday);

    let remainingSeconds = 0;
    if (isUsedToday) {
      const now = new Date();
      const nextMidnight = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
      remainingSeconds = Math.max(0, Math.ceil((nextMidnight - now) / 1000));
    }

    return res.status(200).json({
      success: true,
      data: {
        canAnalyze: !isUsedToday,
        limitUsed: isUsedToday,
        remainingSeconds,
        lastAnalysisAt: lastUsed,
        isAdmin: false,
        isPromo: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeMenuImages = async (req, res, next) => {
  const { images = [] } = req.body || {};
  try {
    const restaurantId = req.restaurant?._id || req.user?.restaurantId;
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';
    const isPromo = aiConfigService.isMenuImportUnlimitedPromo();

    if (!isAdmin && !isPromo && restaurantId) {
      const restaurant = req.restaurant || await Restaurant.findById(restaurantId).select('lastMenuAnalysisAt').lean();
      const { startOfToday } = aiConfigService.getIstanbulDateBoundaries();
      const lastUsed = restaurant?.lastMenuAnalysisAt ? new Date(restaurant.lastMenuAnalysisAt) : null;

      if (lastUsed && lastUsed >= startOfToday) {
        const now = new Date();
        const nextMidnight = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        const remainingSeconds = Math.max(0, Math.ceil((nextMidnight - now) / 1000));
        return res.status(429).json({
          success: false,
          code: 'DAILY_MENU_ANALYSIS_LIMIT_REACHED',
          error: 'Günlük menü analiz limitinize ulaştınız. Normal hesaplar için günde 1 menü analizi yapılabilir.',
          remainingSeconds,
        });
      }
    }

    const draft = await aiService.generateMenuImportDraft({ images, restaurantId, userId });

    if (!isAdmin && restaurantId) {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        lastMenuAnalysisAt: new Date(),
      });
    }

    return res.status(200).json({ success: true, data: draft });
  } catch (error) {
    return next(error);
  }
};

export const suggestProductDetails = async (req, res, next) => {
  try {
    const restaurantId = req.restaurant?._id || req.user?.restaurantId;
    const userId = req.user?.userId;
    const { name, categoryName, currentDescription, ingredients, allergens, dietaryTags } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Ürün adı gereklidir.' });
    }

    const suggestion = await aiService.suggestProductDetails({
      name,
      categoryName,
      currentDescription,
      ingredients,
      allergens,
      dietaryTags,
      restaurantId,
      userId,
    });

    return res.status(200).json({
      success: true,
      data: suggestion,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const isClientError = statusCode >= 400 && statusCode < 500;
    return res.status(statusCode).json({
      success: false,
      error: isClientError || statusCode === 502 || statusCode === 504
        ? error.message
        : 'ZuuAI ürün açıklaması oluşturamadı. Lütfen manuel olarak devam edin veya tekrar deneyin.',
    });
  }
};

export const batchGenerateProductDescriptions = async (req, res, next) => {
  try {
    const restaurantId = req.restaurant?._id || req.user?.restaurantId;
    const userId = req.user?.userId;
    const { categories = [] } = req.body || {};

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ success: false, error: 'Kategori ve ürün listesi gereklidir.' });
    }

    const result = await aiService.batchGenerateProductDescriptions({
      categories,
      restaurantId,
      userId,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const isClientError = statusCode >= 400 && statusCode < 500;
    return res.status(statusCode).json({
      success: false,
      error: isClientError || statusCode === 502 || statusCode === 504
        ? error.message
        : 'ZuuAI toplu açıklamaları oluşturamadı.',
    });
  }
};
