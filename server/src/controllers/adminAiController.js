import aiConfigService from '../services/ai/aiConfigService.js';

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

export default {
  getAiSettings,
  updateAiSettings,
};
