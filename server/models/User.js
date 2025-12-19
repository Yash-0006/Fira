const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'venue_owner', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  },
  verificationBadge: {
    type: String,
    enum: ['none', 'brand', 'band', 'organizer'],
    default: 'none'
  },
  socialLinks: {
    instagram: { type: String, default: null },
    twitter: { type: String, default: null },
    facebook: { type: String, default: null },
    website: { type: String, default: null }
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bankDetails: {
    accountName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    ifscCode: { type: String, default: null },
    bankName: { type: String, default: null }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
