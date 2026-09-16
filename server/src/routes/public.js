import express from 'express';
import { getPublicMenu } from '../controllers/publicMenuController.js';
import { createPublicReview } from '../controllers/reviewController.js';
import { trackMenuEvent } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/menu/:username', getPublicMenu);
router.post('/reviews/:username', createPublicReview);
router.post('/analytics/events/:username', trackMenuEvent);

export default router;