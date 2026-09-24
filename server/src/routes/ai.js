import express from 'express';
import { testGeminiConnection, handleChat, getQuotaStatus, analyzeMenuImages } from '../controllers/aiController.js';
import { restaurantAuth } from '../middleware/auth.js';
import { authDual } from '../middleware/authDual.js';

const router = express.Router();

// GET /api/ai/test - Minimal connection test for ZuuAI / Gemini
router.get('/test', testGeminiConnection);

// GET /api/ai/usage - Current user quota & usage information
router.get('/usage', authDual, getQuotaStatus);

// POST /api/ai/chat - Chat with ZuuAI (requires authenticated restaurant user)
router.post('/chat', authDual, restaurantAuth, handleChat);
router.post('/menu-analyze', authDual, restaurantAuth, analyzeMenuImages);

export default router;
