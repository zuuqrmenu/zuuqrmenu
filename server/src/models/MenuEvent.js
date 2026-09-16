import mongoose from 'mongoose';

const menuEventSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  eventType: { type: String, enum: ['PRODUCT_VIEW', 'CATEGORY_VIEW', 'PRODUCT_CLICK'], required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  eventAt: { type: Date, default: Date.now },
}, { timestamps: true });

menuEventSchema.index({ restaurantId: 1, eventAt: -1 });
menuEventSchema.index({ restaurantId: 1, eventType: 1, eventAt: -1 });
menuEventSchema.index({ restaurantId: 1, productId: 1, eventAt: -1 });
menuEventSchema.index({ restaurantId: 1, categoryId: 1, eventAt: -1 });

const MenuEvent = mongoose.model('MenuEvent', menuEventSchema);

export default MenuEvent;
