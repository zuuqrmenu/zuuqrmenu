import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  merchantOid: { type: String, required: true, unique: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['starter', 'professional'], required: true },
  period: { type: String, enum: ['monthly', 'yearly'], required: true },
  amount: { type: Number, required: true }, // TRY
  currency: { type: String, default: 'TL' },
  status: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING', index: true },
  paidAt: { type: Date, default: null },
  periodStart: { type: Date, default: null },
  periodEnd: { type: Date, default: null },
  testMode: { type: Boolean, default: false },
  billing: {
    name: String,
    email: String,
    phone: String,
    address: String,
  },
  failureCode: String,
  failureMessage: String,
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
