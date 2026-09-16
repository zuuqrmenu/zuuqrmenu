import express from 'express';
import { restaurantAuth } from '../middleware/auth.js';
import { authDual } from '../middleware/authDual.js';
import { getAnalyticsOverview } from '../controllers/analyticsController.js';

const router = express.Router();
router.use(authDual, restaurantAuth);
router.get('/overview', getAnalyticsOverview);

export default router;