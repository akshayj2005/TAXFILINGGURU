require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet');

// Configurations & Middleware
const dbConfig = require('./config/database');
const auditMiddleware = require('./middleware/logRequestMiddleware');
const clientTracker = require('./middleware/clientTracker');
const seoMiddleware = require('./middleware/seoMiddleware');
const logger = require('./utils/logger')('app');

// Connect to MongoDB
mongoose.connect(dbConfig.mongodb.uri, dbConfig.mongodb.options)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const app = express();
const expressLayouts = require('express-ejs-layouts');

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com", "https://cdn.quilljs.com", "https://unpkg.com"],
            "script-src-attr": ["'unsafe-inline'"],
            "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net", "https://*.taxfilingguru.com", "https://cdn.tailwindcss.com", "https://ui-avatars.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://cdn.quilljs.com", "https://unpkg.com"],
            "font-src": ["'self'", "data:", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        },
    },
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Disable default layout for admin routes
app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) {
        res.locals.layout = false;
    }
    next();
});

// Core Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Trust proxies so cookies work over HTTPS behind a reverse proxy/load balancer
app.set('trust proxy', 1);

const { MongoStore } = require('connect-mongo');

// Session Config (Uses MongoDB to persist sessions and avoid memory leaks)
app.use(session({
    secret: process.env.SESSION_SECRET || 'tfg-secret-123',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: dbConfig.mongodb.uri,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        secure: 'auto', // Automatically true for HTTPS, false for HTTP
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
// Tracking Middlewares
app.use(auditMiddleware); // Logs the request details
app.use(clientTracker);   // Tracks the client identity/state
app.use(seoMiddleware);   // Injects SEO Data

// Auth Middleware to expose user to views
const User = require('./models/User');
app.use(async (req, res, next) => {
    try {
        // Global Template Variables
        res.locals.contactEmail = process.env.SUPPORT_EMAIL || 'info@taxfilingguru.com';
        res.locals.contactPhone = process.env.SUPPORT_PHONE || '+91 98119 45176';

        // Add a global utility for calculating time difference
        res.locals.timeAgo = (date) => {
            if (!date) return '';
            const seconds = Math.floor((new Date() - new Date(date)) / 1000);
            
            let interval = Math.floor(seconds / 31536000); // Years
            if (interval > 0) return `${interval} year${interval > 1 ? 's' : ''} ago`;
            
            interval = Math.floor(seconds / (24 * 3600)); // Days
            if (interval > 0) {
                if (interval === 1) return 'Yesterday';
                return `${interval} day${interval > 1 ? 's' : ''} ago`;
            }
            
            interval = Math.floor(seconds / 3600); // Hours
            if (interval > 0) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
            
            interval = Math.floor(seconds / 60); // Minutes
            if (interval > 0) return `${interval} minute${interval > 1 ? 's' : ''} ago`;
            
            return 'Just now';
        };

        if (req.session && req.session.userId) {
            const user = await User.findById(req.session.userId);
            res.locals.user = user;
            req.user = user;

            // Prevent browser caching for logged-in users
            // This ensures clicking 'Back' after logout forces a server request (redirecting to login)
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.set('Expires', '-1');
            res.set('Pragma', 'no-cache');
        } else {
            res.locals.user = null;
        }
    } catch (err) {
        console.error('Auth Middleware Error:', err);
    }
    next();
});

// Sitemap Route
app.get('/sitemap.xml', (req, res) => {
    const seoConfig = require('./config/seo.json');
    const baseUrl = seoConfig.default.canonical;
    const paths = Object.keys(seoConfig).filter(p => p.startsWith('/'));

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    paths.forEach(path => {
        const priority = path === '/' ? '1.0' : '0.8';
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${path === '/' ? '' : path}</loc>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += `    <priority>${priority}</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
});

// Routes
const routes = require('./routes/index');
const adminRoutes = require('./routes/admin');

app.use('/', routes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('pages/404', {
        title: 'Page Not Found',
        layout: 'layouts/main'
    });
});

// Global Error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled Error', {
        requestId: req.requestId,
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });
    res.status(500).render('pages/500', {
        title: 'Server Error',
        error: err.message,
        layout: 'layouts/main'
    });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        const startTime = new Date().toLocaleString();
        console.log(`🚀 Server started at: ${startTime}`);
        console.log(`📡 Running on: http://localhost:${PORT}`);
        console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

module.exports = app;
