import mongoose from 'mongoose';

const menuThemeSchema = new mongoose.Schema({
  slot: { type: Number, min: 1, max: 5, default: 1 },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  theme: { type: String, enum: ['DEFAULT', 'GRID', 'MINIMAL', 'BISTRO', 'ELEGANT', 'WARM', 'MODERN', 'DARK', 'CLASSIC'], default: 'DEFAULT' },
  mode: { type: String, enum: ['LIGHT', 'DARK'], default: 'LIGHT' },
  font: { type: String, default: 'Inter', maxlength: 40 },
  primaryColor: { type: String, default: '#1F2937', match: /^#[0-9A-Fa-f]{6}$/ },
  secondaryColor: { type: String, default: '#FFFFFF', match: /^#[0-9A-Fa-f]{6}$/ },
  layout: {
    showImages: { type: Boolean, default: true },
    showDescriptions: { type: Boolean, default: true },
    showPrices: { type: Boolean, default: true },
    emphasizeFeatured: { type: Boolean, default: true },
    style: { type: String, enum: ['STANDARD', 'COMPACT', 'EDITORIAL'], default: 'STANDARD' },
    showStories: { type: Boolean, default: true },
  },
}, { _id: true, timestamps: true });

const restaurantSettingsSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required'],
    unique: true,
  },
  activeMenuId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  activeMenuThemeId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  logo: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String,
    trim: true,
  },
  storeImage: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  primaryColor: {
    type: String,
    default: '#000000',
    match: [/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color'],
  },
  secondaryColor: {
    type: String,
    default: '#ffffff',
    match: [/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color'],
  },
  theme: {
    type: String,
    enum: ['DEFAULT', 'GRID', 'MINIMAL', 'BISTRO', 'ELEGANT', 'WARM', 'MODERN', 'DARK', 'CLASSIC'],
    default: 'DEFAULT',
  },
  mode: {
    type: String,
    enum: ['LIGHT', 'DARK'],
    default: 'LIGHT',
  },
  menuThemes: {
    type: [menuThemeSchema],
    default: [],
    validate: { validator: (themes) => themes.length <= 3, message: 'En fazla 3 özel tema kaydedebilirsiniz.' },
  },
  savedMenus: {
    type: [menuThemeSchema],
    default: [],
    validate: { validator: (themes) => themes.length <= 3, message: 'En fazla 3 özel tema kaydedebilirsiniz.' },
  },
  seoEnabled: {
    type: Boolean,
    default: true,
  },
  socialMedia: {
    type: [
      {
        platform: {
          type: String,
          enum: ['instagram', 'facebook', 'x', 'youtube', 'tiktok', 'linkedin', 'whatsapp', 'website'],
          required: true,
        },
        url: {
          type: String,
          trim: true,
          default: '',
        },
      },
    ],
    default: [],
  },
  openingHours: {
    monday: {
      open: String,
      close: String,
    },
    tuesday: {
      open: String,
      close: String,
    },
    wednesday: {
      open: String,
      close: String,
    },
    thursday: {
      open: String,
      close: String,
    },
    friday: {
      open: String,
      close: String,
    },
    saturday: {
      open: String,
      close: String,
    },
    sunday: {
      open: String,
      close: String,
    },
  },
}, {
  timestamps: true,
});

const RestaurantSettings = mongoose.model('RestaurantSettings', restaurantSettingsSchema);

export default RestaurantSettings;
