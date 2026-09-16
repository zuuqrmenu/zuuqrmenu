import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required'],
    unique: true,
  },
  name: {
    type: String,
    default: 'Ana Menü',
    trim: true,
  },
}, {
  timestamps: true,
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;
