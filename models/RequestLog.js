const mongoose = require('mongoose');

const RequestLogSchema = new mongoose.Schema({
    requestId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    method: String,
    url: String,
    statusCode: Number,
    responseTime: Number,
    userId: { type: String, index: true },
    ip: String,
    geo: {
        country: String,
        region: String,
        city: String,
        ll: [Number]
    },
    userAgent: String,
    payload: {
        headers: Object,
        body: Object,
        query: Object
    }
});

module.exports = mongoose.model('RequestLog', RequestLogSchema);
