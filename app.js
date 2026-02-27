require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

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

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Core Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session Config (Stored in DB)
app.use(session({
    secret: process.env.SESSION_SECRET || 'tfg-secret-123',
    resave: false,
    saveUninitialized: false, // Don't create session until something is stored
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        collection: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Tracking Middlewares
app.use(auditMiddleware); // Logs the request details
app.use(clientTracker);   // Tracks the client identity/state
app.use(seoMiddleware);   // Injects SEO Data

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
const pageRoutes = require('./routes/pageRoutes');
const apiRoutes = require('./routes/apiRoutes');

app.use('/', pageRoutes);
app.use('/api', apiRoutes);

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
