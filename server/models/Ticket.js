const mongoose = require('mongoose');
const crypto = require('crypto');

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    qrCode: {
        type: String,
        required: true
    },
    ticketType: {
        type: String,
        enum: ['general', 'vip', 'early_bird'],
        default: 'general'
    },
    price: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 1
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        default: null
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date,
        default: null
    },
    checkedInBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'used', 'cancelled', 'expired'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Generate unique ticket ID and QR code before saving
ticketSchema.pre('save', function (next) {
    if (!this.ticketId) {
        this.ticketId = 'TKT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    }
    if (!this.qrCode) {
        // QR code contains ticket ID and event ID for validation
        this.qrCode = Buffer.from(JSON.stringify({
            ticketId: this.ticketId,
            eventId: this.event.toString(),
            userId: this.user.toString()
        })).toString('base64');
    }
    next();
});

// Indexes
ticketSchema.index({ ticketId: 1 });
ticketSchema.index({ user: 1 });
ticketSchema.index({ event: 1 });
ticketSchema.index({ status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
