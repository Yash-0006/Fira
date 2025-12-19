const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    length: 4
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  lastSentAt: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for automatic cleanup of expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster email lookups
otpSchema.index({ email: 1, verified: 1 });

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

// Method to check if cooldown period has passed (90 seconds)
otpSchema.methods.canResend = function() {
  const cooldownMs = 90 * 1000; // 90 seconds
  return Date.now() - this.lastSentAt.getTime() >= cooldownMs;
};

// Method to get remaining cooldown time in seconds
otpSchema.methods.getRemainingCooldown = function() {
  const cooldownMs = 90 * 1000;
  const elapsed = Date.now() - this.lastSentAt.getTime();
  const remaining = Math.max(0, Math.ceil((cooldownMs - elapsed) / 1000));
  return remaining;
};

module.exports = mongoose.model('OTP', otpSchema);
