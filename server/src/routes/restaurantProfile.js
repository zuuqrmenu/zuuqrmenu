import express from 'express';
import { restaurantAuth } from '../middleware/auth.js';
import { authDual } from '../middleware/authDual.js';
import { getRestaurantProfile, updateRestaurantProfile } from '../controllers/restaurantProfileController.js';

const router = express.Router();

router.use(authDual, restaurantAuth);
router.get('/', getRestaurantProfile);
router.put('/', updateRestaurantProfile);

export default router;
