import mongoose from 'mongoose';

const aiUsageLogSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  provider: {
    type: String,
    default: 'gemini',
    trim: true,
  },
  success: {
    type: Boolean,
    default: true,
    index: true,
  },
  tokens: {
    promptTokens: { type: Number, default: 0 },
    candidateTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
  durationMs: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: false,
});

// Compound indexes for high performance quota counting
aiUsageLogSchema.index({ restaurantId: 1, success: 1, timestamp: -1 });
aiUsageLogSchema.index({ userId: 1, success: 1, timestamp: -1 });

export default mongoose.model('AiUsageLog', aiUsageLogSchema);
