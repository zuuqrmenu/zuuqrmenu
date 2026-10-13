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
// Providers reset on the account's billing day, not necessarily on the 1st.
// Set CLOUDINARY_BILLING_DAY / VERCEL_BILLING_DAY (1-31) to make the date exact; otherwise it is flagged approximate.
const MONTH_NAMES = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const getMonthlyRenewalInfo = (envName) => {
  const configured = Number.parseInt(process.env[envName] || '', 10);
  const known = Number.isInteger(configured) && configured >= 1 && configured <= 31;
  const day = known ? configured : 1;

  const now = new Date();
  const buildDate = (year, month) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(day, lastDay), 0, 0, 0, 0);
  };
  let next = buildDate(now.getFullYear(), now.getMonth());
  if (next <= now) next = buildDate(now.getFullYear(), now.getMonth() + 1);

  const daysLeft = Math.max(1, Math.ceil((next.getTime() - now.getTime()) / 86400000));
  const nextMonthName = MONTH_NAMES[next.getMonth()];
  const resetDate = next.getDate() + ' ' + nextMonthName + ' ' + next.getFullYear();
  return {
    cycle: 'monthly',
    resetDate,
    resetISO: next.toISOString(),
    nextMonthName,
    daysLeft,
    approximate: !known,
    description: known
      ? 'Her ayın ' + day + "'inde sıfırlanır (" + daysLeft + ' gün kaldı)'
      : "Tahmini: ayın 1'inde (" + daysLeft + ' gün). Kesin gün için ' + envName + ' tanımlayın.',
  };
};

const ROLLING_RENEWAL = (description) => ({ cycle: 'rolling', resetDate: null, daysLeft: null, approximate: false, description });

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
      measured: true,
      renewal: getMonthlyRenewalInfo('CLOUDINARY_BILLING_DAY'),
      links: { console: 'https://console.cloudinary.com/', usage: 'https://console.cloudinary.com/settings/billing' },
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
    const listAllUsers = async () => {
      const all = [];
      let pageToken;
      for (let page = 0; page < 20; page += 1) {
        const result = await firebaseAdminAuth.listUsers(1000, pageToken);
        all.push(...result.users);
        pageToken = result.pageToken;
        if (!pageToken) return { users: all, truncated: false };
      }
      return { users: all, truncated: true };
    };

    const [{ users, truncated }, linkedCount, totalUsersInDb] = await Promise.all([
      listAllUsers().catch(() => ({ users: [], truncated: false })),
      User.countDocuments({ firebaseUid: { $exists: true, $ne: null } }),
      User.countDocuments(),
    ]);

    let googleCount = 0;
    let passwordCount = 0;
    let activeLast30 = 0;
    const since = Date.now() - 30 * 86400000;
    users.forEach((u) => {
      if (u.providerData?.some((p) => p.providerId === 'google.com')) googleCount += 1;
      else passwordCount += 1;
      const lastSeen = Date.parse(u.metadata?.lastRefreshTime || u.metadata?.lastSignInTime || '');
      if (Number.isFinite(lastSeen) && lastSeen >= since) activeLast30 += 1;
    });

    const sparkLimit = 50000; // free tier: 50k monthly active users
    const percent = Number(((activeLast30 / sparkLimit) * 100).toFixed(2));
    const projectId = process.env.FIREBASE_PROJECT_ID;

    return {
      configured: true,
      status: 'HEALTHY',
      title: 'Firebase Auth',
      category: 'Kimlik Doğrulama & Oturum',
      plan: 'Spark (Ücretsiz Plan)',
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      lastUpdated: new Date().toISOString(),
      measured: true,
      users: {
        total: users.length,
        truncated,
        activeLast30,
        limit: sparkLimit,
        percent,
        unit: 'Son 30 günde aktif kullanıcı (MAU yaklaşığı)',
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
      renewal: ROLLING_RENEWAL('Kayan 30 günlük pencere: MAU her gün yeniden hesaplanır, belirli bir sıfırlanma günü yoktur.'),
      links: {
        console: projectId ? 'https://console.firebase.google.com/project/' + projectId + '/overview' : 'https://console.firebase.google.com/',
        usage: projectId ? 'https://console.firebase.google.com/project/' + projectId + '/authentication/users' : 'https://console.firebase.google.com/',
      },
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
      measured: true,
      links: { console: 'https://cloud.mongodb.com/', usage: 'https://cloud.mongodb.com/' },
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
// Vercel exposes no usage endpoint for Hobby projects, so usage is reported as "not measured"
// instead of showing made-up figures. Plan limits are listed for reference only.
const VERCEL_PLAN_LIMITS = [
  { key: 'bandwidth', label: 'Hızlı veri aktarımı', limit: '100 GB / ay' },
  { key: 'edgeRequests', label: 'Edge istekleri', limit: '1.000.000 / ay' },
  { key: 'serverless', label: 'Fonksiyon çalışma süresi', limit: '100 saat / ay' },
  { key: 'builds', label: 'Build süresi', limit: '6.000 dk / ay' },
  { key: 'deployments', label: 'Dağıtım sınırı', limit: '100 / gün' },
];

const fetchVercelStats = async () => {
  const token = process.env.VERCEL_TOKEN;
  const base = {
    configured: Boolean(token),
    status: token ? 'HEALTHY' : 'READY_TO_CONNECT',
    title: 'Vercel',
    category: 'Frontend & Serverless Hosting',
    plan: 'Hobby (Ücretsiz Plan)',
    lastUpdated: new Date().toISOString(),
    hasToken: Boolean(token),
    measured: false,
    planLimits: VERCEL_PLAN_LIMITS,
    renewal: getMonthlyRenewalInfo('VERCEL_BILLING_DAY'),
    links: { console: 'https://vercel.com/dashboard', usage: 'https://vercel.com/dashboard' },
    message: token
      ? 'Dağıtım bilgisi canlı. Kullanım (trafik, süre) Vercel panelinden izlenir.'
      : 'Kullanım ölçümü yok. Son dağıtımı görmek için VERCEL_TOKEN ekleyebilirsiniz.',
  };

  if (!token) return base;

  try {
    const res = await fetch('https://api.vercel.com/v6/deployments?limit=5', { headers: { Authorization: 'Bearer ' + token } });
    if (!res.ok) return { ...base, status: 'WARNING', message: 'Vercel API yanıtı: ' + res.status + ' ' + res.statusText };

    const json = await res.json();
    const deployments = json.deployments || [];
    const latest = deployments[0] || null;
    return {
      ...base,
      latestDeployment: latest
        ? { name: latest.name, url: latest.url ? 'https://' + latest.url : null, state: latest.state, created: latest.created, creator: latest.creator?.username || latest.creator?.email || '—' }
        : null,
      recentDeploymentsCount: deployments.length,
    };
  } catch (error) {
    return { ...base, status: 'WARNING', message: 'Vercel verisi alınırken hata: ' + error.message };
  }
};

// ─── Google Analytics (GA4) Fetcher ─────────────────────────
// GA4 usage is not queried (it needs the Data API); only the standard free-property limits are listed.
const fetchGA4Stats = async () => {
  const measurementId = process.env.VITE_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || '';
  return {
    configured: Boolean(measurementId),
    status: measurementId ? 'HEALTHY' : 'NOT_CONFIGURED',
    title: 'Google Analytics 4',
    category: 'Ziyaretçi & Etkinlik Analizi',
    plan: 'Standart GA4 (Ücretsiz)',
    measurementId,
    lastUpdated: new Date().toISOString(),
    measured: false,
    planLimits: [
      { key: 'events', label: 'Aylık etkinlik', limit: '10.000.000 / ay' },
      { key: 'retention', label: 'Veri saklama', limit: '14 ay' },
      { key: 'custom', label: 'Özel etkinlik adı', limit: '500' },
    ],
    renewal: ROLLING_RENEWAL('Etkinlik kotası aylık değerlendirilir; kullanım GA4 panelinden izlenir.'),
    links: { console: 'https://analytics.google.com/', usage: 'https://analytics.google.com/' },
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
