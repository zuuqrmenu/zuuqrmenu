import express from 'express';
import { restaurantAuth } from '../middleware/auth.js';
import { authDual } from '../middleware/authDual.js';
import { createCheckout, getBillingOverview, getOrderStatus, paytrCallback } from '../controllers/billingController.js';

const router = express.Router();

// Called server-to-server by PayTR: no user session, authenticated by the HMAC hash instead.
router.post('/paytr/callback', paytrCallback);

router.use(authDual, restaurantAuth);
router.get('/', getBillingOverview);
router.post('/checkout', createCheckout);
router.get('/orders/:merchantOid', getOrderStatus);

export default router;
