const { v4: uuidv4 } = require('uuid');
const geoip = require('geoip-lite');
const RequestLog = require('../models/RequestLog');

const redactFields = ['password', 'token', 'secret', 'authorization', 'credit_card', 'otp'];

const redact = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
    for (let key in newObj) {
        if (redactFields.includes(key.toLowerCase())) {
            newObj[key] = '[REDACTED]';
        } else if (typeof newObj[key] === 'object') {
            newObj[key] = redact(newObj[key]);
        }
    }
    return newObj;
};

const auditMiddleware = (req, res, next) => {
    const startTime = Date.now();
    req.requestId = uuidv4();
    res.setHeader('X-Request-Id', req.requestId);

    res.on('finish', async () => {
        const responseTime = Date.now() - startTime;
        const ip = req.ip || req.connection.remoteAddress;
        const geo = geoip.lookup(ip) || {};

        const logData = {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            responseTime: responseTime,
            userId: req.user ? req.user.id || req.user._id : (req.body ? req.body.userId : null),
            ip: ip,
            geo: {
                country: geo.country,
                region: geo.region,
                city: geo.city,
                ll: geo.ll
            },
            userAgent: req.get('User-Agent'),
            payload: {
                headers: redact(req.headers),
                body: redact(req.body),
                query: redact(req.query)
            }
        };

        // Async save to MongoDB
        RequestLog.create(logData).catch(err => {
            console.error('Audit Log Error:', err.message);
        });
    });

    next();
};

module.exports = auditMiddleware;
