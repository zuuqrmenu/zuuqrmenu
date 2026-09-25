import express from 'express';
import {
  createCategory,
  deleteCategory,
  getOverview,
  updateMenuStatus,
  listCategories,
  toggleCategory,
  updateCategory,
  bulkDeleteCategories,
} from '../controllers/menuController.js';
import { restaurantAuth } from '../middleware/auth.js';
import { authDual } from '../middleware/authDual.js';
import {
  createProduct,
  deleteProduct,
  listCategoryProducts,
  listProducts,
  toggleAvailability,
  toggleFeatured,
  updateProduct,
  uploadProductImage,
  removeProductImage,
  bulkDeleteProducts,
  bulkClearDescriptions,
} from '../controllers/productController.js';
import { productImageUpload } from '../middleware/upload.js';

const router = express.Router();

router.use(authDual, restaurantAuth);
router.get('/overview', getOverview);
router.patch('/status', updateMenuStatus);
router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.patch('/categories/:id/toggle', toggleCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/products', listProducts);
router.get('/categories/:categoryId/products', listCategoryProducts);
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.patch('/products/:id/toggle-availability', toggleAvailability);
router.patch('/products/:id/toggle-featured', toggleFeatured);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/image', productImageUpload, uploadProductImage);
router.delete('/products/:id/image', removeProductImage);

// Bulk operations
router.post('/bulk-delete-categories', bulkDeleteCategories);
router.post('/bulk-delete-products', bulkDeleteProducts);
router.post('/bulk-clear-descriptions', bulkClearDescriptions);

export default router;