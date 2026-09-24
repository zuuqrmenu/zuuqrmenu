import SystemSetting from '../../models/SystemSetting.js';
import AiUsageLog from '../../models/AiUsageLog.js';
import Restaurant from '../../models/Restaurant.js';

export const DEFAULT_MODEL = 'gemini-3.1-flash-lite';
export const DEFAULT_DAILY_LIMIT = 20;
export const DEFAULT_MONTHLY_LIMIT = 300;

export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    description: 'Hızlı, düşük gecikmeli ve yüksek verimli (Önerilen varsayılan)',
    isDefault: true,
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    description: 'Gelişmiş anlama ve zengin yanıt kabiliyeti',
    isDefault: false,
  },
  {
    id: 'google/gemma-4-31b-it',
    name: 'NVIDIA Gemma 4 31B',
    description: 'NVIDIA API üzerinden Google Gemma 4 31B Instruct',
    isDefault: false,
  },
  {
    id: 'z-ai/glm-5.3-flash',
    name: 'NVIDIA GLM 5.3 Flash',
    description: 'NVIDIA API üzerinden hızlı GLM 5.3 Flash modeli',
    isDefault: false,
  },
  {
    id: 'deepseek-ai/deepseek-v4.1-flash',
    name: 'NVIDIA DeepSeek V4.1 Flash',
    description: 'NVIDIA API üzerinden görsel destekli DeepSeek V4.1 Flash',
    isDefault: false,
  },
];

export const MODEL_PROVIDER_LIMITS = {
  'gemini-3.1-flash-lite': {
    name: 'Gemini 3.1 Flash-Lite',
    rpm: 15,
    tpm: 250000,
    rpd: 1500,
    rpmResetText: '1 dakikalık kayan pencere',
    tpmResetText: '1 dakikalık kayan pencere',
    rpdResetText: 'Sağlayıcının günlük kota penceresine göre (Pasifik Saati)',
  },
  'gemini-3.6-flash': {
    name: 'Gemini 3.6 Flash',
    rpm: 15,
    tpm: 1000000,
    rpd: 1500,
    rpmResetText: '1 dakikalık kayan pencere',
    tpmResetText: '1 dakikalık kayan pencere',
    rpdResetText: 'Sağlayıcının günlük kota penceresine göre (Pasifik Saati)',
  },
  'google/gemma-4-31b-it': {
    name: 'NVIDIA Gemma 4 31B',
    rpm: 40,
    tpm: 1000000,
    rpd: 1500,
    rpmResetText: '1 dakikalık kayan pencere',
    tpmResetText: '1 dakikalık kayan pencere',
    rpdResetText: 'Sağlayıcının günlük kota penceresine göre',
  },
  'z-ai/glm-5.3-flash': {
    name: 'NVIDIA GLM 5.3 Flash',
    rpm: 40,
    tpm: 1000000,
    rpd: 1500,
    rpmResetText: '1 dakikalık kayan pencere',
    tpmResetText: '1 dakikalık kayan pencere',
    rpdResetText: 'Sağlayıcının günlük kota penceresine göre',
  },
  'deepseek-ai/deepseek-v4.1-flash': {
    name: 'NVIDIA DeepSeek V4.1 Flash',
    rpm: 40,
    tpm: 1000000,
    rpd: 1500,
    rpmResetText: '1 dakikalık kayan pencere',
    tpmResetText: '1 dakikalık kayan pencere',
    rpdResetText: 'Sağlayıcının günlük kota penceresine göre',
  },
};

const ALLOWED_MODEL_IDS = AVAILABLE_MODELS.map((m) => m.id);

/**
 * Calculates start of today (00:00:00) and start of month in Europe/Istanbul time.
 * Never uses rolling 24-hour / 30-day windows or client-side clocks.
 * @returns {{ startOfToday: Date, startOfMonth: Date }}
 */
export const getIstanbulDateBoundaries = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const istanbulDateStr = formatter.format(now); // Formats to "YYYY-MM-DD"
  const [yearStr, monthStr, dayStr] = istanbulDateStr.split('-');

  // Europe/Istanbul is permanent UTC+3
  const startOfToday = new Date(`${yearStr}-${monthStr}-${dayStr}T00:00:00.000+03:00`);
  const startOfMonth = new Date(`${yearStr}-${monthStr}-01T00:00:00.000+03:00`);

  return { startOfToday, startOfMonth };
};

/**
 * Retrieves the full ZuuAI configuration (active model and user limits) with fallbacks.
 * @returns {Promise<{ activeModel: string, dailyLimit: number, monthlyLimit: number }>}
 */
export const getAiConfig = async () => {
  try {
    const setting = await SystemSetting.findOne({ key: 'zuuai_config' }).lean();
    const val = setting?.value || {};

    const activeModel = (val.activeModel && ALLOWED_MODEL_IDS.includes(val.activeModel))
      ? val.activeModel
      : DEFAULT_MODEL;

    const dailyLimit = (Number.isInteger(val.dailyLimit) && val.dailyLimit >= 1)
      ? val.dailyLimit
      : DEFAULT_DAILY_LIMIT;

    const monthlyLimit = (Number.isInteger(val.monthlyLimit) && val.monthlyLimit >= 1)
      ? val.monthlyLimit
      : DEFAULT_MONTHLY_LIMIT;

    return {
      activeModel,
      dailyLimit,
      monthlyLimit,
    };
  } catch (error) {
    console.error('Failed to read ZuuAI config from SystemSetting, falling back to defaults:', error.message);
    return {
      activeModel: DEFAULT_MODEL,
      dailyLimit: DEFAULT_DAILY_LIMIT,
      monthlyLimit: DEFAULT_MONTHLY_LIMIT,
    };
  }
};

/**
 * Retrieves active AI model name.
 * @returns {Promise<string>}
 */
export const getActiveModel = async () => {
  const config = await getAiConfig();
  return config.activeModel;
};

/**
 * Updates ZuuAI configuration (model and/or limits) with validation.
 * @param {Object} params
 * @param {string} [params.model]
 * @param {number} [params.dailyLimit]
 * @param {number} [params.monthlyLimit]
 * @returns {Promise<{ activeModel: string, dailyLimit: number, monthlyLimit: number }>}
 */
export const updateAiConfig = async ({ model, dailyLimit, monthlyLimit }) => {
  const current = await getAiConfig();
  const updates = {};

  if (model !== undefined) {
    if (!model || typeof model !== 'string') {
      const error = new Error('Model kimliği zorunludur.');
      error.statusCode = 400;
      throw error;
    }
    const trimmed = model.trim();
    if (!ALLOWED_MODEL_IDS.includes(trimmed)) {
      const error = new Error(
        `Geçersiz model seçimi. Desteklenen modeller: ${ALLOWED_MODEL_IDS.join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }
    updates['value.activeModel'] = trimmed;
  }

  if (dailyLimit !== undefined) {
    const num = Number(dailyLimit);
    if (!Number.isInteger(num) || num < 1) {
      const error = new Error('Günlük kullanıcı limiti en az 1 olan pozitif bir tam sayı olmalıdır.');
      error.statusCode = 400;
      throw error;
    }
    updates['value.dailyLimit'] = num;
  }

  if (monthlyLimit !== undefined) {
    const num = Number(monthlyLimit);
    if (!Number.isInteger(num) || num < 1) {
      const error = new Error('Aylık kullanıcı limiti en az 1 olan pozitif bir tam sayı olmalıdır.');
      error.statusCode = 400;
      throw error;
    }
    updates['value.monthlyLimit'] = num;
  }

  if (Object.keys(updates).length === 0) {
    return current;
  }

  const updatedSetting = await SystemSetting.findOneAndUpdate(
    { key: 'zuuai_config' },
    {
      $set: {
        ...updates,
        description: 'ZuuAI global model and usage limit configuration',
      },
    },
    { upsert: true, new: true }
  ).lean();

  const val = updatedSetting?.value || {};
  return {
    activeModel: val.activeModel || DEFAULT_MODEL,
    dailyLimit: val.dailyLimit || DEFAULT_DAILY_LIMIT,
    monthlyLimit: val.monthlyLimit || DEFAULT_MONTHLY_LIMIT,
  };
};

/**
 * Backward compatible helper for setting active model only.
 */
export const setActiveModel = async (modelId) => {
  const result = await updateAiConfig({ model: modelId });
  return { activeModel: result.activeModel };
};

/**
 * Returns available model definitions
 */
export const getAvailableModels = () => {
  return AVAILABLE_MODELS;
};

/**
 * Computes actual Gemini project usage metrics against active model rate limits.
 * RPM: Rolling 60s requests
 * TPM: Rolling 60s tokens
 * RPD: Today's requests
 * @param {string} [modelId]
 */
export const getProviderRateLimitStats = async (modelId) => {
  const activeModel = modelId || (await getActiveModel());
  const limits = MODEL_PROVIDER_LIMITS[activeModel] || MODEL_PROVIDER_LIMITS[DEFAULT_MODEL];

  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const { startOfToday } = getIstanbulDateBoundaries();

  const [recentLogs, todayRequestsCount] = await Promise.all([
    AiUsageLog.find({
      timestamp: { $gte: oneMinuteAgo },
      success: true,
    }).select('tokens').lean(),
    AiUsageLog.countDocuments({
      timestamp: { $gte: startOfToday },
      success: true,
    }),
  ]);

  const rpmUsed = recentLogs.length;
  const tpmUsed = recentLogs.reduce((acc, log) => acc + (log.tokens?.totalTokens || 0), 0);
  const rpdUsed = todayRequestsCount;

  const computeMetric = (used, limit, resetText, unit) => {
    const percent = Math.min(Math.round((used / limit) * 1000) / 10, 100);
    let status = 'normal';
    if (percent >= 90) status = 'critical';
    else if (percent >= 70) status = 'warning';

    return {
      used,
      limit,
      percent,
      status,
      resetText,
      unit,
    };
  };

  return {
    model: activeModel,
    modelName: limits.name,
    rpd: computeMetric(rpdUsed, limits.rpd, limits.rpdResetText, 'günlük istek'),
    tpm: computeMetric(tpmUsed, limits.tpm, limits.tpmResetText, 'dakikadaki token'),
    rpm: computeMetric(rpmUsed, limits.rpm, limits.rpmResetText, 'dakikadaki istek'),
  };
};

/**
 * Calculates current usage and remaining quotas for a given user or restaurant.
 * Respects restaurant-specific ZuuAI access toggle (enabled) and limit overrides.
 * @param {Object} params
 * @param {string} [params.restaurantId]
 * @param {string} [params.userId]
 * @param {boolean} [params.isAdmin]
 * @returns {Promise<{ isAdmin: boolean, disabled: boolean, isCustom: boolean, dailyUsed: number, dailyLimit: number|null, dailyRemaining: number|null, monthlyUsed: number, monthlyLimit: number|null, monthlyRemaining: number|null }>}
 */
export const getUserUsageAndLimits = async ({ restaurantId, userId, isAdmin = false }) => {
  if (isAdmin) {
    return {
      isAdmin: true,
      disabled: false,
      isCustom: false,
      dailyUsed: 0,
      dailyLimit: null,
      dailyRemaining: null,
      monthlyUsed: 0,
      monthlyLimit: null,
      monthlyRemaining: null,
    };
  }

  const globalConfig = await getAiConfig();
  let restaurant = null;

  if (restaurantId) {
    try {
      restaurant = await Restaurant.findById(restaurantId).select('zuuai').lean();
    } catch (err) {
      console.warn('Failed to fetch restaurant for ZuuAI limits check:', err.message);
    }
  }

  // Check if ZuuAI is disabled for this restaurant
  const isEnabled = restaurant?.zuuai?.enabled !== false;

  // Determine effective limits (custom override vs global default)
  const hasCustomDaily = restaurant?.zuuai?.customDailyLimit !== null && restaurant?.zuuai?.customDailyLimit !== undefined;
  const hasCustomMonthly = restaurant?.zuuai?.customMonthlyLimit !== null && restaurant?.zuuai?.customMonthlyLimit !== undefined;

  const dailyLimit = hasCustomDaily ? restaurant.zuuai.customDailyLimit : globalConfig.dailyLimit;
  const monthlyLimit = hasCustomMonthly ? restaurant.zuuai.customMonthlyLimit : globalConfig.monthlyLimit;
  const isCustom = hasCustomDaily || hasCustomMonthly;

  const { startOfToday, startOfMonth } = getIstanbulDateBoundaries();

  // Match restaurantId if available; fallback to userId
  const targetFilter = restaurantId ? { restaurantId } : (userId ? { userId } : null);

  if (!targetFilter) {
    return {
      isAdmin: false,
      disabled: !isEnabled,
      isCustom,
      dailyUsed: 0,
      dailyLimit,
      dailyRemaining: isEnabled ? dailyLimit : 0,
      monthlyUsed: 0,
      monthlyLimit,
      monthlyRemaining: isEnabled ? monthlyLimit : 0,
    };
  }

  // Count only successful processed requests
  const [dailyUsed, monthlyUsed] = await Promise.all([
    AiUsageLog.countDocuments({
      ...targetFilter,
      success: true,
      timestamp: { $gte: startOfToday },
    }),
    AiUsageLog.countDocuments({
      ...targetFilter,
      success: true,
      timestamp: { $gte: startOfMonth },
    }),
  ]);

  const dailyRemaining = isEnabled ? Math.max(0, dailyLimit - dailyUsed) : 0;
  const monthlyRemaining = isEnabled ? Math.max(0, monthlyLimit - monthlyUsed) : 0;

  return {
    isAdmin: false,
    disabled: !isEnabled,
    isCustom,
    dailyUsed,
    dailyLimit,
    dailyRemaining,
    monthlyUsed,
    monthlyLimit,
    monthlyRemaining,
  };
};

/**
 * Returns ZuuAI usage counts for a specific restaurant.
 * @param {string} restaurantId
 * @returns {Promise<{ todayUsed: number, thisMonthUsed: number }>}
 */
export const getRestaurantZuuAiStats = async (restaurantId) => {
  if (!restaurantId) return { todayUsed: 0, thisMonthUsed: 0 };
  const { startOfToday, startOfMonth } = getIstanbulDateBoundaries();

  const [todayUsed, thisMonthUsed] = await Promise.all([
    AiUsageLog.countDocuments({
      restaurantId,
      success: true,
      timestamp: { $gte: startOfToday },
    }),
    AiUsageLog.countDocuments({
      restaurantId,
      success: true,
      timestamp: { $gte: startOfMonth },
    }),
  ]);

  return { todayUsed, thisMonthUsed };
};

/**
 * Aggregates application-level ZuuAI usage metrics from AiUsageLog
 */
export const getUsageStats = async () => {
  const { startOfToday, startOfMonth } = getIstanbulDateBoundaries();

  const [
    totalRequests,
    requestsToday,
    requestsThisMonth,
    successfulRequests,
    failedRequests,
    activeRestaurants,
    tokenAggregate,
    todayTokenAggregate,
    monthTokenAggregate,
  ] = await Promise.all([
    AiUsageLog.countDocuments(),
    AiUsageLog.countDocuments({ timestamp: { $gte: startOfToday } }),
    AiUsageLog.countDocuments({ timestamp: { $gte: startOfMonth } }),
    AiUsageLog.countDocuments({ success: true }),
    AiUsageLog.countDocuments({ success: false }),
    AiUsageLog.distinct('restaurantId', { restaurantId: { $ne: null } }),
    AiUsageLog.aggregate([
      {
        $group: {
          _id: null,
          promptTokens: { $sum: '$tokens.promptTokens' },
          candidateTokens: { $sum: '$tokens.candidateTokens' },
          totalTokens: { $sum: '$tokens.totalTokens' },
        },
      },
    ]),
    AiUsageLog.aggregate([
      { $match: { timestamp: { $gte: startOfToday }, success: true } },
      {
        $group: {
          _id: null,
          promptTokens: { $sum: '$tokens.promptTokens' },
          candidateTokens: { $sum: '$tokens.candidateTokens' },
          totalTokens: { $sum: '$tokens.totalTokens' },
        },
      },
    ]),
    AiUsageLog.aggregate([
      { $match: { timestamp: { $gte: startOfMonth }, success: true } },
      {
        $group: {
          _id: null,
          promptTokens: { $sum: '$tokens.promptTokens' },
          candidateTokens: { $sum: '$tokens.candidateTokens' },
          totalTokens: { $sum: '$tokens.totalTokens' },
        },
      },
    ]),
  ]);

  const tokenUsage = tokenAggregate[0] || {
    promptTokens: 0,
    candidateTokens: 0,
    totalTokens: 0,
  };

  const todayTokens = todayTokenAggregate[0]?.totalTokens || 0;
  const monthTokens = monthTokenAggregate[0]?.totalTokens || 0;

  return {
    totalRequests,
    requestsToday,
    requestsThisMonth,
    successfulRequests,
    failedRequests,
    activeRestaurantsCount: activeRestaurants.length,
    tokenUsage: {
      promptTokens: tokenUsage.promptTokens || 0,
      candidateTokens: tokenUsage.candidateTokens || 0,
      totalTokens: tokenUsage.totalTokens || 0,
      todayTokens,
      monthTokens,
    },
  };
};

/**
 * Returns provider quota availability status
 */
export const getQuotaInfo = () => {
  return {
    available: false,
    message: 'Sağlayıcı kota bilgisi bu API üzerinden alınamıyor.',
    provider: 'Google Gemini',
  };
};

export default {
  DEFAULT_MODEL,
  DEFAULT_DAILY_LIMIT,
  DEFAULT_MONTHLY_LIMIT,
  AVAILABLE_MODELS,
  MODEL_PROVIDER_LIMITS,
  getIstanbulDateBoundaries,
  getAiConfig,
  getActiveModel,
  setActiveModel,
  updateAiConfig,
  getAvailableModels,
  getProviderRateLimitStats,
  getUserUsageAndLimits,
  getRestaurantZuuAiStats,
  getUsageStats,
  getQuotaInfo,
};
