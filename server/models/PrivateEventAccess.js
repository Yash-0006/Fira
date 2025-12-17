const mongoose = require('mongoose');

const privateEventAccessSchema = new mongoose.Schema({
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
    accessCode: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    requestMessage: {
        type: String,
        default: null
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    respondedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate requests
privateEventAccessSchema.index({ user: 1, event: 1 }, { unique: true });
privateEventAccessSchema.index({ event: 1, status: 1 });

module.exports = mongoose.model('PrivateEventAccess', privateEventAccessSchema);
