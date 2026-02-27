const { v4: uuidv4 } = require('uuid');
const geoip = require('geoip-lite');
const Visitor = require('../models/Visitor');
const useragent = require('useragent');

const clientTracker = async (req, res, next) => {
    try {
        // 1. Visitor Fingerprinting (Permanent Cookie)
        let visitorId = req.cookies.visitor_id;
        if (!visitorId) {
            visitorId = uuidv4();
            // Set for 1 Year
            res.cookie('visitor_id', visitorId, { 
                maxAge: 365 * 24 * 60 * 60 * 1000, 
                httpOnly: true,
                sameSite: 'lax'
            });
        }

        // 2. Client Details (IP & User-Agent)
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const agent = useragent.parse(req.get('User-Agent'));
        const geo = geoip.lookup(ip) || {};

        // 3. Update/Create Visitor State in MongoDB
        const visitorData = {
            visitorId: visitorId,
            sessionId: req.sessionID, // From express-session
            userId: req.user ? req.user._id : null,
            ipAddress: ip,
            location: {
                country: geo.country,
                region: geo.region,
                city: geo.city,
                timezone: geo.timezone
            },
            userAgent: {
                browser: agent.toAgent(),
                os: agent.os.toString(),
                device: agent.device.toString(),
                raw: req.get('User-Agent')
            },
            currentPath: req.originalUrl,
            lastSeen: new Date(),
            isOnline: true
        };

        // Push to path history, keep only last 20
        const visitor = await Visitor.findOneAndUpdate(
            { visitorId: visitorId },
            { 
                $set: visitorData,
                $push: { 
                    pathHistory: { 
                        $each: [{ path: req.originalUrl, timestamp: new Date() }],
                        $slice: -20 // Limit history to last 20 pages
                    }
                }
            },
            { upsert: true, new: true }
        );

        // Attach to req for use in controllers if needed
        req.visitor = visitor;

        next();
    } catch (err) {
        console.error('Client Tracker Error:', err.message);
        next(); // Don't block the request if tracking fails
    }
};

module.exports = clientTracker;
