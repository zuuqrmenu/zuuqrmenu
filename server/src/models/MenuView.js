import mongoose from 'mongoose';

const menuViewSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required'],
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
  userAgent: {
    type: String,
    trim: true,
  },
  ip: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for restaurant lookup
menuViewSchema.index({ restaurantId: 1 });

// Compound index for restaurant + viewedAt (for analytics queries)
menuViewSchema.index({ restaurantId: 1, viewedAt: -1 });

// Index for time-based queries
menuViewSchema.index({ viewedAt: -1 });

const MenuView = mongoose.model('MenuView', menuViewSchema);

export default MenuView;
