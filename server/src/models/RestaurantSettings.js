import mongoose from 'mongoose';

const restaurantSettingsSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required'],
    unique: true,
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
    enum: ['MINIMAL', 'ELEGANT', 'WARM', 'MODERN', 'DARK', 'CLASSIC'],
    default: 'MINIMAL',
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
