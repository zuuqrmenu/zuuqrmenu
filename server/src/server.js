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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true,
}));
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

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/restaurant/settings', restaurantSettingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/restaurant/profile', restaurantProfileRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
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
