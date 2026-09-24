import aiConfigService from '../services/ai/aiConfigService.js';
import aiService from '../services/ai/aiService.js';
import { getAdminSystemPrompt } from '../services/ai/prompts/systemPrompt.js';

/**
 * GET /api/admin/ai/settings
 * Retrieves active ZuuAI model, daily/monthly limits, available models, usage stats, and provider quota status.
 */
export const getAiSettings = async (req, res, next) => {
  try {
    const [{ activeModel, dailyLimit, monthlyLimit }, usageStats] = await Promise.all([
      aiConfigService.getAiConfig(),
      aiConfigService.getUsageStats(),
    ]);

    const [availableModels, providerLimits] = await Promise.all([
      aiConfigService.getAvailableModels(),
      aiConfigService.getProviderRateLimitStats(activeModel),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        activeModel,
        dailyLimit,
        monthlyLimit,
        availableModels,
        usageStats,
        providerLimits,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/ai/settings
 * Updates the active ZuuAI model and/or user message limits.
 */
export const updateAiSettings = async (req, res, next) => {
  try {
    const { model, dailyLimit, monthlyLimit } = req.body || {};

    const updated = await aiConfigService.updateAiConfig({ model, dailyLimit, monthlyLimit });

    return res.status(200).json({
      success: true,
      message: 'ZuuAI ayarları başarıyla güncellendi.',
      data: updated,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
};

/**
 * POST /api/admin/ai/chat
 * Admin-only ZuuAI chat without restaurant topic scope or user quotas.
 */
export const handleAdminChat = async (req, res) => {
  const { message, context } = req.body || {};

  try {
    const result = await aiService.generateResponse({
      message,
      context,
      userId: req.user?.userId,
      systemInstruction: getAdminSystemPrompt(),
    });
    const config = await aiConfigService.getAiConfig();
    const model = aiConfigService.getAvailableModels().find((item) => item.id === config.activeModel);

    return res.status(200).json({
      success: true,
      message: result.text,
      activeModel: config.activeModel,
      activeModelName: model?.name || config.activeModel,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const isClientError = statusCode >= 400 && statusCode < 500;
    return res.status(statusCode).json({
      success: false,
      error: isClientError ? error.message : 'ZuuAI şu anda yanıt veremiyor. Lütfen tekrar deneyin.',
    });
  }
};

export default {
  getAiSettings,
  updateAiSettings,
  handleAdminChat,
};
