import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'],
    default: 'PENDING',
  },
  businessType: {
    type: String,
    enum: ['RESTAURANT', 'CAFE', 'BAR', 'BAKERY', 'FAST_FOOD'],
    default: 'RESTAURANT',
  },
  city: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  instagram: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => !value || /^\S+@\S+\.\S+$/.test(value),
      message: 'Please provide a valid restaurant email',
    },
  },
  menuStatus: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'HIDDEN'],
    default: 'DRAFT',
  },
  publishedAt: {
    type: Date,
  },
  menuViewCount: {
    type: Number,
    default: 0,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for owner lookup
restaurantSchema.index({ ownerId: 1 });

// Index for status filtering
restaurantSchema.index({ status: 1 });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;
