const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
    visitorId: { type: String, required: true, index: true }, // From long-lived cookie
    sessionId: { type: String, index: true }, // From express-session
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ipAddress: String,
    location: {
        country: String,
        region: String,
        city: String,
        timezone: String
    },
    userAgent: {
        browser: String,
        os: String,
        device: String,
        raw: String
    },
    currentPath: String,
    pathHistory: [{
        path: String,
        timestamp: { type: Date, default: Date.now }
    }],
    lastSeen: { type: Date, default: Date.now, index: true },
    firstSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: true }
}, { timestamps: true });

// Index to quickly find online users (last 5 mins)
VisitorSchema.index({ lastSeen: -1 });

module.exports = mongoose.model('Visitor', VisitorSchema);
