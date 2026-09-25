import aiConfigService from '../services/ai/aiConfigService.js';
import aiService from '../services/ai/aiService.js';
import { getAdminSystemPrompt } from '../services/ai/prompts/systemPrompt.js';

/**
 * GET /api/admin/ai/settings
 * Retrieves active ZuuAI model, daily/monthly limits, available models, usage stats, and provider quota status.
 */
export const getAiSettings = async (req, res, next) => {
  try {
    const [{ chatAssistantModel, menuUploadModel, smartProductDescriptionModel, activeModel, dailyLimit, monthlyLimit }, usageStats] = await Promise.all([
      aiConfigService.getAiConfig(),
      aiConfigService.getUsageStats(),
    ]);

    const [availableModels, providerLimits] = await Promise.all([
      aiConfigService.getAvailableModels(),
      aiConfigService.getProviderRateLimitStats(chatAssistantModel || activeModel),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        chatAssistantModel,
        menuUploadModel,
        smartProductDescriptionModel,
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
 * Updates the active ZuuAI feature models and/or user message limits.
 */
export const updateAiSettings = async (req, res, next) => {
  try {
    const { chatAssistantModel, menuUploadModel, smartProductDescriptionModel, model, dailyLimit, monthlyLimit } = req.body || {};

    const updated = await aiConfigService.updateAiConfig({
      chatAssistantModel,
      menuUploadModel,
      smartProductDescriptionModel,
      model,
      dailyLimit,
      monthlyLimit,
    });

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
  const { message, context, images = [] } = req.body || {};

  try {
    const config = await aiConfigService.getAiConfig();
    const model = aiConfigService.getAvailableModels().find((item) => item.id === config.activeModel);
    const result = await aiService.generateResponse({
      message,
      images,
      context,
      userId: req.user?.userId,
      systemInstruction: getAdminSystemPrompt({
        modelId: config.activeModel,
        modelName: model?.name,
      }),
    });

    return res.status(200).json({
      success: true,
      message: result.text,
      activeModel: config.activeModel,
      activeModelName: model?.name || config.activeModel,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const isClientError = statusCode >= 400 && statusCode < 500;
    const errorMessage = statusCode === 503
      ? 'Aktif model şu anda geçici olarak yoğun. Kullanım hakkınız bitmedi; lütfen birkaç saniye sonra tekrar deneyin.'
      : (statusCode === 502 || statusCode === 504)
      ? error.message
      : (isClientError ? error.message : 'ZuuAI şu anda yanıt veremiyor. Lütfen tekrar deneyin.');
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: statusCode === 503 ? 'PROVIDER_TEMPORARILY_UNAVAILABLE' : undefined,
    });
  }
};

export default {
  getAiSettings,
  updateAiSettings,
  handleAdminChat,
};
