import express from 'express';
import { restaurantAuth } from '../middleware/auth.js';
import { authDual } from '../middleware/authDual.js';
import { productImageUpload } from '../middleware/upload.js';
import {
  getRestaurantSettings,
  removeCover,
  removeLogo,
  removeStore,
  updateRestaurantSettings,
  uploadCover,
  uploadLogo,
  uploadStore,
} from '../controllers/restaurantSettingsController.js';

const router = express.Router();

router.use(authDual, restaurantAuth);
router.get('/', getRestaurantSettings);
router.patch('/', updateRestaurantSettings);
router.post('/logo', productImageUpload, uploadLogo);
router.post('/cover', productImageUpload, uploadCover);
router.post('/store', productImageUpload, uploadStore);
router.delete('/logo', removeLogo);
router.delete('/cover', removeCover);
router.delete('/store', removeStore);

export default router;