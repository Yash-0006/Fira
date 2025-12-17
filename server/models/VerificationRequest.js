const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['brand', 'band', 'organizer'],
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    documents: [{
        name: { type: String },
        url: { type: String },
        type: { type: String } // 'id_proof', 'business_registration', 'portfolio', 'other'
    }],
    socialLinks: {
        instagram: { type: String, default: null },
        twitter: { type: String, default: null },
        facebook: { type: String, default: null },
        youtube: { type: String, default: null },
        spotify: { type: String, default: null },
        website: { type: String, default: null }
    },
    portfolio: [{
        title: { type: String },
        description: { type: String },
        url: { type: String }
    }],
    followerCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    adminNotes: {
        type: String,
        default: null
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
verificationRequestSchema.index({ user: 1 });
verificationRequestSchema.index({ status: 1 });
verificationRequestSchema.index({ type: 1 });
verificationRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
