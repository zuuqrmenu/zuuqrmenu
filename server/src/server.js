import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { pathToFileURL } from 'node:url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import menuRoutes from './routes/menu.js';
import publicRoutes from './routes/public.js';
import restaurantSettingsRoutes from './routes/restaurantSettings.js';
import analyticsRoutes from './routes/analytics.js';
import restaurantProfileRoutes from './routes/restaurantProfile.js';
import aiRoutes from './routes/ai.js';
import { getPublicSitemap } from './controllers/publicMenuController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  'https://zuuqrmenu.com',
  'https://www.zuuqrmenu.com',
  'https://panel.zuuqrmenu.com',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/(.+\.)?zuuqrmenu\.com$/.test(origin) ||
      /\.vercel\.app$/.test(origin)
    ) {
      // Must echo back the exact origin (not `true`) when credentials:true is used,
      // otherwise the browser will reject the response.
      return callback(null, origin);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  maxAge: 86400,
}));

// Disable caching on dynamic API responses to prevent browsers and CDN edges
// from caching responses with mismatching Access-Control-Allow-Origin headers across subdomains.
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ZuuLab QR API is running' });
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/sitemap.xml', getPublicSitemap);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/restaurant/settings', restaurantSettingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/restaurant/profile', restaurantProfileRoutes);
app.use('/api/ai', aiRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  if (err.name === 'ValidationError') {
    const firstKey = Object.keys(err.errors || {})[0];
    const message = firstKey ? err.errors[firstKey].message : err.message;
    return res.status(400).json({ error: message || 'Geçersiz veri formatı.' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Geçersiz kimlik veya veri formatı.' });
  }
  res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong!' });
});

export default app;

const shouldStartLocalServer = (() => {
  if (process.env.VERCEL) return false;
  const currentFile = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
  return currentFile ? currentFile === import.meta.url : false;
})();

if (shouldStartLocalServer) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start local server:', error);
      process.exitCode = 1;
    });
}
