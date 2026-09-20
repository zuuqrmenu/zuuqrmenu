import express from 'express';
import {
  activateRestaurant,
  approveRestaurant,
  deleteRestaurant,
  getRestaurant,
  getStats,
  listRestaurants,
  rejectRestaurant,
  suspendRestaurant,
  updateRestaurant,
} from '../controllers/adminController.js';
import { adminAuth, auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth, adminAuth);
router.get('/restaurants', listRestaurants);
router.get('/restaurants/:id', getRestaurant);
router.patch('/restaurants/:id', updateRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);
router.patch('/restaurants/:id/approve', approveRestaurant);
router.patch('/restaurants/:id/reject', rejectRestaurant);
router.patch('/restaurants/:id/suspend', suspendRestaurant);
router.patch('/restaurants/:id/activate', activateRestaurant);
router.get('/stats', getStats);

export default router;