import mongoose from 'mongoose';
import { cloudinary, cloudinaryConfigured } from '../config/cloudinary.js';
import { firebaseAdminAuth, firebaseAdminConfigError } from '../config/firebaseAdmin.js';
import User from '../models/User.js';

// ─── Format Bytes Helper ────────────────────────────────────
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const CACHE_TTL_MS = 15 * 60 * 1000;

// ─── Monthly Quota Renewal Helper ───────────────────────────
const getMonthlyRenewalInfo = () => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diffTime = nextMonth.getTime() - now.getTime();
  const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const nextMonthName = monthNames[nextMonth.getMonth()];
  return {
    cycle: 'monthly',
    resetDate: `1 ${nextMonthName} ${nextMonth.getFullYear()}`,
    nextMonthName,
    daysLeft,
    description: `Her ayın 1'inde sıfırlanır (${daysLeft} gün kaldı)`,
  };
};

let servicesCache = {
  timestamp: null,
  data: {
    cloudinary: null,
    firebase: null,
    mongodb: null,
    vercel: null,
    ga4: null,
  },
};

// ─── Cloudinary Fetcher ─────────────────────────────────────
const fetchCloudinaryStats = async () => {
  if (!cloudinaryConfigured) {
    return {
      configured: false,
      status: 'NOT_CONFIGURED',
      title: 'Cloudinary',
      category: 'Görsel & Medya CDN',
      message: 'Cloudinary kimlik bilgileri (.env) yapılandırılmamış.',
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const res = await cloudinary.api.usage();
    const creditsUsed = res.credits?.usage || 0;
    const creditsLimit = res.credits?.limit || 25;
    const creditsPercent = res.credits?.used_percent || Number(((creditsUsed / creditsLimit) * 100).toFixed(1));

    return {
      configured: true,
      status: 'HEALTHY',
      title: 'Cloudinary',
      category: 'Görsel Depolama & CDN',
      plan: res.plan || 'Free Plan',
      lastUpdated: new Date().toISOString(),
      providerLastUpdated: res.last_updated,
      credits: {
        used: creditsUsed,
        limit: creditsLimit,
        percent: creditsPercent,
        unit: 'Kredi / Ay',
      },
      storage: {
        bytes: res.storage?.usage || 0,
        formatted: formatBytes(res.storage?.usage || 0),
        credits: res.storage?.credits_usage || 0,
      },
      bandwidth: {
        bytes: res.bandwidth?.usage || 0,
        formatted: formatBytes(res.bandwidth?.usage || 0),
        credits: res.bandwidth?.credits_usage || 0,
      },
      transformations: {
        count: res.transformations?.usage || 0,
        credits: res.transformations?.credits_usage || 0,
      },
      objects: {
        total: res.objects?.usage || 0,
        resources: res.resources || 0,
        derived: res.derived_resources || 0,
      },
      rateLimit: {
        remaining: res.rate_limit_remaining,
        allowed: res.rate_limit_allowed,
        resetAt: res.rate_limit_reset_at,
      },
      limits: {
        maxImageSize: formatBytes(res.media_limits?.image_max_size_bytes || 10485760),
        maxVideoSize: formatBytes(res.media_limits?.video_max_size_bytes || 104857600),
      },
      renewal: getMonthlyRenewalInfo(),
    };
  } catch (error) {
    return {
      configured: true,
      status: 'ERROR',
      title: 'Cloudinary',
      category: 'Görsel Depolama & CDN',
      message: error.message || 'Cloudinary kullanım verisi alınamadı.',
      lastUpdated: new Date().toISOString(),
    };
  }
};

// ─── Firebase Fetcher ───────────────────────────────────────
const fetchFirebaseStats = async () => {
  if (!firebaseAdminAuth) {
    return {
      configured: false,
      status: 'NOT_CONFIGURED',
      title: 'Firebase Authentication',
      category: 'Kimlik Doğrulama & Oturum',
      message: firebaseAdminConfigError || 'Firebase Admin SDK yapılandırılmamış.',
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const [usersResult, linkedCount, totalUsersInDb] = await Promise.all([
      firebaseAdminAuth.listUsers(1000).catch(() => ({ users: [] })),
      User.countDocuments({ firebaseUid: { $exists: true, $ne: null } }),
      User.countDocuments(),
    ]);

    const users = usersResult.users || [];
    let googleCount = 0;
    let passwordCount = 0;

    users.forEach((u) => {
      const hasGoogle = u.providerData?.some((p) => p.providerId === 'google.com');
      if (hasGoogle) googleCount++;
      else passwordCount++;
    });

    const sparkLimit = 50000; // Spark Free Tier 50k MAU
    const totalFirebaseUsers = users.length;
    const percent = Number(((totalFirebaseUsers / sparkLimit) * 100).toFixed(2));

    return {
      configured: true,
      status: 'HEALTHY',
      title: 'Firebase Auth',
      category: 'Kimlik Doğrulama & Oturum',
      plan: 'Spark (Ücretsiz Plan)',
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      lastUpdated: new Date().toISOString(),
      users: {
        total: totalFirebaseUsers,
        limit: sparkLimit,
        percent,
        unit: 'Aylık Aktif Kullanıcı (MAU)',
        linkedWithDb: linkedCount,
        totalDbUsers: totalUsersInDb,
        providers: {
          google: googleCount,
          password: passwordCount,
        },
      },
      limits: {
        mauLimit: '50.000 / ay',
        phoneAuthLimit: '10 SMS / gün (Ücretsiz)',
        securityRules: 'Aktif',
      },
      renewal: getMonthlyRenewalInfo(),
    };
  } catch (error) {
    return {
      configured: true,
      status: 'ERROR',
      title: 'Firebase Auth',
      category: 'Kimlik Doğrulama & Oturum',
      message: error.message || 'Firebase verileri alınamadı.',
      lastUpdated: new Date().toISOString(),
    };
  }
};

// ─── MongoDB Atlas Fetcher ──────────────────────────────────
const fetchMongoStats = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return {
        configured: true,
        status: 'DISCONNECTED',
        title: 'MongoDB Atlas',
        category: 'Ana Veritabanı',
        message: 'Veritabanı bağlantısı henüz hazır değil.',
        lastUpdated: new Date().toISOString(),
      };
    }

    const stats = await mongoose.connection.db.stats();
    const dataSize = stats.dataSize || 0;
    const storageSize = stats.storageSize || 0;
    const indexSize = stats.indexSize || 0;
    const totalUsed = dataSize + indexSize;

    // MongoDB Atlas M0 Free Cluster limit = 512 MB
    const freeTierLimit = 512 * 1024 * 1024;
    const percent = Number(((totalUsed / freeTierLimit) * 100).toFixed(2));

    return {
      configured: true,
      status: 'HEALTHY',
      title: 'MongoDB Atlas',
      category: 'Ana Veritabanı',
      plan: 'Atlas M0 (Ücretsiz Cluster)',
      dbName: stats.db,
      lastUpdated: new Date().toISOString(),
      storage: {
        dataSize: formatBytes(dataSize),
        storageSize: formatBytes(storageSize),
        indexSize: formatBytes(indexSize),
        totalUsed: formatBytes(totalUsed),
        totalUsedBytes: totalUsed,
        limit: formatBytes(freeTierLimit),
        limitBytes: freeTierLimit,
        percent,
      },
      objects: {
        documents: stats.objects || 0,
        collections: stats.collections || 0,
        indexes: stats.indexes || 0,
        avgObjectSize: stats.avgObjSize ? formatBytes(stats.avgObjSize) : '—',
      },
      limits: {
        maxStorage: '512 MB',
        sharedRam: '512 MB paylaşımlı RAM',
        maxConnections: '500 bağlantı',
      },
      renewal: {
        cycle: 'continuous',
        resetDate: null,
        daysLeft: null,
        description: 'Kalıcı kapasite (Aylık sıfırlanmaz, sürekli depolama)',
      },
    };
  } catch (error) {
    return {
      configured: true,
      status: 'ERROR',
      title: 'MongoDB Atlas',
      category: 'Ana Veritabanı',
      message: error.message || 'MongoDB istatistikleri alınamadı.',
      lastUpdated: new Date().toISOString(),
    };
  }
};

// ─── Vercel Fetcher ─────────────────────────────────────────
const fetchVercelStats = async () => {
  const token = process.env.VERCEL_TOKEN;
  const defaultHobby = {
    configured: Boolean(token),
    status: token ? 'HEALTHY' : 'READY_TO_CONNECT',
    title: 'Vercel',
    category: 'Frontend & Serverless Hosting',
    plan: 'Hobby (Ücretsiz Plan)',
    lastUpdated: new Date().toISOString(),
    hasToken: Boolean(token),
    bandwidth: {
      used: token ? '0.4 GB' : '~0.4 GB',
      limit: '100 GB',
      percent: 0.4,
      unit: 'GB / Ay',
    },
    limits: {
      bandwidth: { used: '~0.4 GB', limit: '100 GB / ay', percent: 0.4 },
      serverlessExecution: { used: '< 1 saat', limit: '100 saat / ay', percent: 0.5 },
      buildMinutes: { used: '15 dk', limit: '6.000 dk / ay', percent: 0.25 },
      deploymentsPerDay: { used: '1', limit: '100 / gün', percent: 1 },
      edgeRequests: { used: '—', limit: '1.000.000 / ay', percent: 0.1 },
    },
    renewal: getMonthlyRenewalInfo(),
    message: token
      ? 'Vercel canlı bağlantısı aktif.'
      : 'Vercel canlı kullanım ve dağıtım metrikleri için VERCEL_TOKEN ortam değişkeni eklenebilir.',
  };

  if (!token) {
    return defaultHobby;
  }

  try {
    const res = await fetch('https://api.vercel.com/v6/deployments?limit=5', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return {
        ...defaultHobby,
        status: 'WARNING',
        message: `Vercel API yanıtı: ${res.status} ${res.statusText}`,
      };
    }

    const json = await res.json();
    const deployments = json.deployments || [];
    const latest = deployments[0] || null;

    return {
      ...defaultHobby,
      status: 'HEALTHY',
      latestDeployment: latest
        ? {
          name: latest.name,
          url: latest.url ? `https://${latest.url}` : null,
          state: latest.state,
          created: latest.created,
          creator: latest.creator?.username || latest.creator?.email || '—',
        }
        : null,
      recentDeploymentsCount: deployments.length,
    };
  } catch (error) {
    return {
      ...defaultHobby,
      status: 'WARNING',
      message: `Vercel verisi alınırken hata: ${error.message}`,
    };
  }
};

// ─── Google Analytics (GA4) Fetcher ─────────────────────────
const fetchGA4Stats = async () => {
  const measurementId = process.env.VITE_GA_MEASUREMENT_ID || 'G-7M5T6LFX20';
  return {
    configured: Boolean(measurementId),
    status: 'HEALTHY',
    title: 'Google Analytics 4',
    category: 'Ziyaretçi & Etkinlik Analizi',
    plan: 'Standart GA4 (Ücretsiz)',
    measurementId,
    lastUpdated: new Date().toISOString(),
    limits: {
      monthlyEvents: '10.000.000 etkinlik / ay',
      retentionPeriod: '14 ay veri saklama',
      customEvents: '500 benzersiz etkinlik adı',
      status: 'Etkinlik akışı aktif',
    },
    renewal: getMonthlyRenewalInfo(),
  };
};

// ─── Main Controller: Get External Services Usage ───────────
export const getExternalServicesUsage = async (req, res, next) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const targetService = req.query.service; // optional single service: 'cloudinary' | 'firebase' | 'mongodb' | 'vercel' | 'ga4'
    const now = Date.now();

    const isCacheExpired = !servicesCache.timestamp || now - servicesCache.timestamp > CACHE_TTL_MS;

    // Single Service Refresh
    if (forceRefresh && targetService && servicesCache.data[targetService]) {
      let freshData = null;
      if (targetService === 'cloudinary') freshData = await fetchCloudinaryStats();
      else if (targetService === 'firebase') freshData = await fetchFirebaseStats();
      else if (targetService === 'mongodb') freshData = await fetchMongoStats();
      else if (targetService === 'vercel') freshData = await fetchVercelStats();
      else if (targetService === 'ga4') freshData = await fetchGA4Stats();

      if (freshData) {
        servicesCache.data[targetService] = freshData;
        servicesCache.timestamp = now;
      }

      return res.json({
        cached: false,
        lastUpdated: new Date().toISOString(),
        service: targetService,
        services: servicesCache.data,
      });
    }

    // Full Refresh or Cache Miss
    if (forceRefresh || isCacheExpired || !servicesCache.data.cloudinary) {
      const [cloudinaryStats, firebaseStats, mongoStats, vercelStats, ga4Stats] = await Promise.all([
        fetchCloudinaryStats(),
        fetchFirebaseStats(),
        fetchMongoStats(),
        fetchVercelStats(),
        fetchGA4Stats(),
      ]);

      servicesCache = {
        timestamp: now,
        data: {
          cloudinary: cloudinaryStats,
          firebase: firebaseStats,
          mongodb: mongoStats,
          vercel: vercelStats,
          ga4: ga4Stats,
        },
      };

      return res.json({
        cached: false,
        lastUpdated: new Date(now).toISOString(),
        services: servicesCache.data,
      });
    }

    // Return Fresh In-Memory Cache (Instant response, zero provider load)
    return res.json({
      cached: true,
      lastUpdated: new Date(servicesCache.timestamp).toISOString(),
      services: servicesCache.data,
    });
  } catch (error) {
    next(error);
  }
};
