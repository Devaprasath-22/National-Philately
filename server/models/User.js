const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  location: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  collectingInterests: [{
    type: String,
    trim: true
  }],
  favoriteStamps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stamp'
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stamp'
  }],
  bookmarkedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Password reset
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpiry: {
    type: Date,
    default: null
  },
  // Notifications / alerts for wishlist matches
  wishlistAlerts: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-generate username from name if not provided
userSchema.pre('save', async function (next) {
  if (!this.username) {
    const base = this.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    this.username = `${base}_${rand}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
