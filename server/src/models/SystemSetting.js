import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('SystemSetting', systemSettingSchema);
