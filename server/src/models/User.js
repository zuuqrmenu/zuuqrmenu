import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(value) {
        if (this.role === 'ADMIN') {
          return /^\S+$/.test(value);
        }

        return /^\S+@\S+\.\S+$/.test(value);
      },
      message: 'Please provide a valid email or admin identifier',
    },
  },
  password: {
    type: String,
    required: [function() { return !this.firebaseUid; }, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  username: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 40,
    match: [/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, underscores, and hyphens'],
    unique: true,
    sparse: true,
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    trim: true,
  },
  authProvider: {
    type: String,
    enum: ['PASSWORD', 'GOOGLE', 'MULTIPLE'],
    default: 'PASSWORD',
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['ADMIN', 'RESTAURANT_USER'],
    default: 'RESTAURANT_USER',
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password || !candidatePassword) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
