import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required'],
  },
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: [true, 'Menu ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  displayOrder: {
    type: Number,
    required: [true, 'Display order is required'],
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for restaurant lookup
categorySchema.index({ restaurantId: 1 });

// Index for menu lookup
categorySchema.index({ menuId: 1 });

// Compound index for restaurant + display order
categorySchema.index({ restaurantId: 1, displayOrder: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
