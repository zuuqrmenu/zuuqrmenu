import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required'],
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  shortDescription: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  oldPrice: {
    type: Number,
    min: [0, 'Old price cannot be negative'],
  },
  image: {
    type: String,
    trim: true,
  },
  ingredients: [{
    type: String,
    trim: true,
  }],
  allergens: [{
    type: String,
    trim: true,
  }],
  dietaryTags: [{
    type: String,
    enum: ['VEGAN', 'VEGETARIAN', 'GLUTEN_FREE', 'SPICY', 'MILD', 'HALAL'],
  }],
  calories: {
    type: Number,
    min: [0, 'Calories cannot be negative'],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  displayOrder: {
    type: Number,
    required: [true, 'Display order is required'],
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for restaurant lookup
productSchema.index({ restaurantId: 1 });

// Index for category lookup
productSchema.index({ categoryId: 1 });

// Compound index for restaurant + display order
productSchema.index({ restaurantId: 1, displayOrder: 1 });

// Index for availability filtering
productSchema.index({ isAvailable: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
