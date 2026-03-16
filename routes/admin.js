const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const packageController = require('../controllers/packageController');


// Models
const User = require('../models/User');
const Consultation = require('../models/Consultation');
const Visitor = require('../models/Visitor');
const Interaction = require('../models/Interaction');
const RequestLog = require('../models/RequestLog');
const Package = require('../models/Package');
const Lead = require('../models/Lead');
const FAQ = require('../models/FAQ');
const Blog = require('../models/Blog');
const { generatePackageView } = require('../controllers/packageController');
const blogController = require('../controllers/blogController');
const adminTestimonialController = require('../controllers/adminTestimonialController');
const blogUpload = require('../utils/blogUpload');
const profileUpload = require('../utils/profileUpload');
const authorController = require('../controllers/authorController');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  AUTH & PROTECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Public routes (No login required)
router.get('/login', (req, res) => {
    if (req.session && req.session.adminUser) return res.redirect('/admin/dashboard');
    res.render('admin/login', { error: null, layout: false });
});

// Logout — must be PUBLIC (before auth middleware) so it always works
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

router.post('/doLogin', (req, res) => {
    let { userid, password } = req.body;
    
    // Trim to avoid spaces issues from copy-pasting on other devices
    if(userid) userid = String(userid).trim();
    if(password) password = String(password).trim();

    // Check case-insensitive for UserId (to help with mobile auto-caps)
    if (userid && password && userid.toLowerCase() === 'taxfilinggururahul'.toLowerCase() && password === 'Rahul@2000') {
        req.session.adminUser = { userid, role: 'Super Administrator' };
        const returnTo = req.session.returnTo || '/admin/dashboard';
        delete req.session.returnTo;
        req.session.save((err) => {
            if (err) console.error('Session save error:', err);
            return res.redirect(returnTo);
        });
        return;
    }
    res.render('admin/login', { error: 'Invalid User ID or Password', layout: false });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Auth middleware — protects ALL routes below this line
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.use((req, res, next) => {
    // Prevent browser from caching admin pages
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Expires', '-1');
    res.set('Pragma', 'no-cache');

    // EXTREMELY IMPORTANT: Disable the global public layout for ALL admin pages
    // The admin pages follow their own header/footer manual inclusion pattern
    res.locals.layout = false;

    if (req.session && req.session.adminUser) {
        res.locals.adminUser = req.session.adminUser;
        return next();
    }
    // Save the originally requested URL so we can redirect back after login
    req.session.returnTo = req.originalUrl;
    req.session.save(() => res.redirect('/admin/login'));
});

// Redirect base /admin to dashboard
router.get('/', (req, res) => {
    res.redirect('/admin/dashboard');
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/dashboard', async (req, res) => {
    try {
        const results = await Promise.all([
            User.countDocuments(),
            Consultation.countDocuments(),
            Visitor.countDocuments({ isOnline: true }),
            Interaction.countDocuments(),
            RequestLog.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(10),
            Package.find().sort({ createdAt: -1 }).limit(10),
            Consultation.find().sort({ createdAt: -1 }).limit(10),
            Lead.find().sort({ createdAt: -1 }).limit(10),
            Lead.countDocuments()
        ]);

        const [usersCount, consultationsCount, activeVisitors, interactionsCount, logsCount, recentUsers, recentPackages, recentConsults, recentLeads, leadsCount] = results;


        // Merge and sort all activities
        const activities = [
            ...recentUsers.map(u => ({
                type: 'User',
                name: u.name || u.fullName || 'Unknown',
                status: u.isAdmin ? 'Admin' : 'Customer',
                date: u.createdAt,
                link: '/admin/users',
                desc: u.email
            })),
            ...recentPackages.map(p => ({
                type: 'Package',
                name: p.name,
                status: p.isActive ? 'Active' : 'Inactive',
                date: p.createdAt,
                link: '/admin/packages',
                desc: `₹${p.price}`
            })),
            ...recentConsults.map(c => ({
                type: 'Consultation',
                name: c.name || 'Guest',
                status: c.status || 'Pending',
                date: c.createdAt,
                link: '/admin/consultations',
                desc: c.type
            })),
            ...recentLeads.map(l => ({
                type: 'Lead',
                name: l.name,
                status: l.status,
                date: l.createdAt,
                link: '/admin/leads',
                desc: l.subject
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        res.render('admin/dashboard', {
            stats: {
                users: usersCount,
                consultations: consultationsCount,
                visitors: activeVisitors,
                interactions: interactionsCount,
                logs: logsCount,
                leads: leadsCount
            },
            activities,
            currentPage: 'dashboard',
            layout: false
        });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  USERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/users', async (req, res) => {
    try {
        const [users, total, residentCount, nriCount, _globalCount, packagesList] = await Promise.all([
            User.find().sort({ createdAt: -1 }),
            User.countDocuments(),
            User.countDocuments({ type: 'resident' }),
            User.countDocuments({ type: 'nri' }),
            User.countDocuments({ type: 'global' }),
            Package.find({ isActive: true })
        ]);
        res.render('admin/users', {
            users,
            packagesList,
            stats: { total, active: total, resident: residentCount, nri: nriCount, global: _globalCount },
            currentPage: 'users',
            layout: false
        });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.post('/users/add', async (req, res) => {
    try {
        let { name, email, phone, password, isAdmin, type, packages, paymentStatus, pan, specifications, residenceCountry, userid, generatedPassword } = req.body;
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({ error: 'Email already registered.' });

        const pkgList = await Package.find();

        // Generate password if not provided
        const finalPassword = password || generatedPassword || Math.random().toString(36).slice(-10).toUpperCase();

        const user = new User({
            name, email: email.toLowerCase(), phone: phone || undefined,
            userid: userid || email.toLowerCase(),
            pan: pan || undefined,
            specifications: specifications || undefined,
            residenceCountry: residenceCountry || undefined,
            password: finalPassword, // Model hook will hash
            generatedPassword: finalPassword,
            isAdmin: isAdmin === 'true',
            type: type || 'resident',
            packages: [].concat(packages || []).map(pName => {
                const pkgInfo = pkgList.find(pl => pl.name === pName);
                return { name: pName, slug: pkgInfo?.slug, price: pkgInfo?.price };
            }),
            paymentStatus: paymentStatus || 'Pending'
        });
        await user.save();

        // Trigger email if added as Completed
        if (paymentStatus === 'Completed') {
            try {
                const { sendCredentialsEmail } = require('../utils/email');
                await sendCredentialsEmail(user);
            } catch (err) { console.error('Admin Create Email Error:', err); }
        }

        res.json({ message: 'User created successfully.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, phone, isAdmin, type, packages, paymentStatus, pan, specifications, residenceCountry, userid, generatedPassword } = req.body;
        const pkgList = await Package.find();
        
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const oldPaymentStatus = user.paymentStatus;
        
        user.name = name;
        user.email = email.toLowerCase();
        user.phone = phone;
        user.isAdmin = isAdmin === 'true';
        user.pan = pan;
        user.specifications = specifications;
        user.residenceCountry = residenceCountry;
        user.type = type || 'resident';
        user.userid = userid || user.userid;
        user.paymentStatus = paymentStatus || 'Pending';
        
        // If password is changed in Admin UI
        if (generatedPassword && user.generatedPassword !== generatedPassword) {
            user.generatedPassword = generatedPassword;
            user.password = generatedPassword; // Will be hashed in pre-save hook
        }
        
        user.packages = [].concat(packages || []).map(pName => {
            const pkgInfo = pkgList.find(pl => pl.name === pName);
            return { name: pName, slug: pkgInfo?.slug, price: pkgInfo?.price };
        });

        await user.save();

        // Trigger email if payment status changed to Completed
        if (paymentStatus === 'Completed' && oldPaymentStatus !== 'Completed') {
            try {
                const { sendCredentialsEmail } = require('../utils/email');
                await sendCredentialsEmail(user);
            } catch (emailErr) {
                console.error('Email Trigger Error:', emailErr);
            }
        }

        res.json({ message: 'User updated successfully.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// Manual trigger to send credentials
router.post('/users/:id/send-credentials', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const { sendCredentialsEmail } = require('../utils/email');
        await sendCredentialsEmail(user);
        
        res.json({ message: 'Credentials email sent successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send email. Check API logs.' });
    }
});

router.post('/users/:id/request-testimonial', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        user.requestTestimonial = true;
        await user.save();
        res.json({ message: 'Testimonial popup scheduled for user.' });
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ error: err.message }); 
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// ─── Document Management for Admin ──────────────────────────────────────────

// List all documents for a user
router.get('/users/:id/documents', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.json(user.documents || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// Delete specific user document (Admin)
router.delete('/users/:id/documents/:docId', async (req, res) => {
    try {
        const { id, docId } = req.params;
        const fs = require('fs');
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const doc = user.documents.id(docId);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        // Delete file
        if (doc.path && fs.existsSync(doc.path)) {
            fs.unlinkSync(doc.path);
        }

        user.documents.pull(docId);
        await user.save();
        res.json({ message: 'Document deleted successfully' });
    } catch (err) {
        console.error('Admin Delete Doc Error:', err);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

// Download all documents as ZIP
router.get('/users/:id/documents/download', async (req, res) => {
    const archiver = require('archiver');
    const path = require('path');
    const fs = require('fs');

    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.documents || user.documents.length === 0) {
            return res.status(404).send('No documents found for this user');
        }

        const zipName = `${user.name.replace(/\s+/g, '_')}_documents.zip`;
        res.attachment(zipName);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        user.documents.forEach(doc => {
            if (fs.existsSync(doc.path)) {
                archive.file(doc.path, { name: doc.filename });
            }
        });

        await archive.finalize();
    } catch (err) {
        console.error('ZIP Error:', err);
        res.status(500).send('Failed to generate ZIP');
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CONSULTATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/consultations', async (req, res) => {
    try {
        const [consultations, total, pending, confirmed, completed] = await Promise.all([
            Consultation.find().sort({ createdAt: -1 }),
            Consultation.countDocuments(),
            Consultation.countDocuments({ status: 'Pending' }),
            Consultation.countDocuments({ status: 'Confirmed' }),
            Consultation.countDocuments({ status: 'Completed' })
        ]);
        res.render('admin/consultations', {
            consultations, stats: { total, pending, confirmed, completed },
            currentPage: 'consultations',
            layout: false
        });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.post('/consultations/add', async (req, res) => {
    try {
        const { type, date, time, name, email, mobile, country, duration, amount, status, paymentStatus } = req.body;
        const consultation = new Consultation({
            type, date, time, status: status || 'Pending',
            paymentStatus: paymentStatus || 'Pending',
            name, email, mobile, country,
            duration: duration ? Number(duration) : undefined,
            amount
        });
        await consultation.save();
        res.json({ message: 'Consultation booked.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.put('/consultations/:id', async (req, res) => {
    try {
        const { type, date, time, name, email, mobile, country, duration, amount, status, paymentStatus } = req.body;
        await Consultation.findByIdAndUpdate(req.params.id, {
            type, date, time, name, email, mobile, country,
            duration: duration ? Number(duration) : undefined,
            amount, status, paymentStatus
        }, { new: true, runValidators: true });
        res.json({ message: 'Consultation updated.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.delete('/consultations/:id', async (req, res) => {
    try {
        await Consultation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Consultation deleted.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  VISITORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/visitors', async (req, res) => {
    try {
        const [visitors, total, online, loggedIn] = await Promise.all([
            Visitor.find().sort({ lastSeen: -1 }).limit(200),
            Visitor.countDocuments(),
            Visitor.countDocuments({ isOnline: true }),
            Visitor.countDocuments({ userId: { $exists: true, $ne: null } })
        ]);
        const countryAgg = await Visitor.aggregate([{ $group: { _id: '$location.country' } }, { $count: 'total' }]);
        const countries = countryAgg[0]?.total || 0;
        res.render('admin/visitors', {
            visitors, stats: { total, online, loggedIn, countries },
            currentPage: 'visitors',
            layout: false
        });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.delete('/visitors/clear-all', async (req, res) => {
    try {
        await Visitor.deleteMany({});
        res.json({ message: 'All visitor records cleared.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  INTERACTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/interactions', async (req, res) => {
    try {
        const [interactions, total, whatsapp, consultation] = await Promise.all([
            Interaction.find().sort({ timestamp: -1 }).limit(500),
            Interaction.countDocuments(),
            Interaction.countDocuments({ type: 'whatsapp_click' }),
            Interaction.countDocuments({ category: 'consultation' })
        ]);
        const other = total - whatsapp - consultation;
        res.render('admin/interactions', {
            interactions, stats: { total, whatsapp, consultation, other: other > 0 ? other : 0 },
            currentPage: 'interactions',
            layout: false
        });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.delete('/interactions/clear-all', async (req, res) => {
    try {
        await Interaction.deleteMany({});
        res.json({ message: 'All interaction logs cleared.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  REQUEST LOGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/logs', async (req, res) => {
    try {
        const [logsInDb, total, success, errors, avgRes] = await Promise.all([
            RequestLog.find().sort({ timestamp: -1 }).limit(500),
            RequestLog.countDocuments(),
            RequestLog.countDocuments({ statusCode: { $gte: 200, $lt: 300 } }),
            RequestLog.countDocuments({ statusCode: { $gte: 400 } }),
            RequestLog.aggregate([{ $group: { _id: null, avg: { $avg: '$responseTime' } } }])
        ]);

        res.render('admin/logs', {
            logs: logsInDb,
            stats: {
                total,
                success,
                errors,
                avgResponse: avgRes[0] ? Math.round(avgRes[0].avg) : 0
            },
            currentPage: 'logs',
            layout: false
        });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.delete('/logs/clear-all', async (req, res) => {
    try {
        await RequestLog.deleteMany({});
        res.json({ message: 'All logs cleared.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  PACKAGES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/packages', async (req, res) => {
    try {
        const [packages, total, active, resident, nri, global_] = await Promise.all([
            Package.find().sort({ position: 1, createdAt: -1 }),
            Package.countDocuments(),
            Package.countDocuments({ isActive: true }),
            Package.countDocuments({ type: 'resident' }),
            Package.countDocuments({ type: 'nri' }),
            Package.countDocuments({ type: 'global' })
        ]);

        res.render('admin/packages', {
            packages, stats: { total, active, resident, nri, global: global_ },
            currentPage: 'packages',
            layout: false
        });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.post('/packages/add', async (req, res) => {
    try {
        const { slug, name, type, heading, subheading, shortDescription, price,
            originalPrice, priceSuffix, discountBadge, badge, badgeClass,
            highlight, featuresRaw, faqsRaw, icon, bestFor, position, isActive } = req.body;
        const features = featuresRaw ? featuresRaw.split('\n').map(f => f.trim()).filter(Boolean) : [];
        let faqs = [];
        try { if (faqsRaw) faqs = JSON.parse(faqsRaw); } catch (e) { }

        const pkg = new Package({
            slug, name, type, heading,
            subheading: subheading || undefined,
            shortDescription: shortDescription || undefined,
            price, originalPrice: originalPrice || undefined,
            priceSuffix: priceSuffix || undefined,
            discountBadge: discountBadge || undefined,
            badge: badge || undefined,
            badgeClass: badgeClass || undefined,
            highlight: highlight || undefined,
            features, faqs, icon, bestFor: bestFor || undefined,
            position: Number(position) || 0,
            isActive: isActive !== 'false'
        });
        await pkg.save();
        // Auto-generate the package detail view file
        try { generatePackageView(pkg); } catch (e) { console.error('View gen error:', e); }
        res.json({ message: 'Package created.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.put('/packages/:id', async (req, res) => {
    try {
        const { slug, name, type, heading, subheading, shortDescription, price,
            originalPrice, priceSuffix, discountBadge, badge, badgeClass,
            highlight, featuresRaw, faqsRaw, icon, bestFor, position, isActive } = req.body;
        const features = featuresRaw ? featuresRaw.split('\n').map(f => f.trim()).filter(Boolean) : [];
        let faqs = [];
        if (faqsRaw) {
            try {
                faqs = typeof faqsRaw === 'string' ? JSON.parse(faqsRaw) : faqsRaw;
            } catch (e) { console.error('FAQ parse error:', e); }
        }

        await Package.findByIdAndUpdate(req.params.id, {
            slug, name, type, heading, subheading, shortDescription, price,
            originalPrice, priceSuffix, discountBadge, badge, badgeClass,
            highlight, features, faqs, icon, bestFor,
            position: Number(position) || 0,
            isActive: isActive !== 'false'
        }, { new: true, runValidators: true });
        // Re-generate stub in case slug or type changed
        const updatedPkg = await Package.findById(req.params.id);
        if (updatedPkg) packageController.generatePackageView(updatedPkg);
        res.json({ message: 'Package updated.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.delete('/packages/:id', async (req, res) => {
    try {
        await Package.findByIdAndDelete(req.params.id);
        res.json({ message: 'Package deleted.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// Redirect old index-services URL to packages
router.get('/index-services', (req, res) => res.redirect('/admin/packages'));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  LEADS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/leads', async (req, res) => {
    try {
        const [leads, total, newCount, contacted, closed] = await Promise.all([
            Lead.find().sort({ createdAt: -1 }),
            Lead.countDocuments(),
            Lead.countDocuments({ status: 'New' }),
            Lead.countDocuments({ status: 'Contacted' }),
            Lead.countDocuments({ status: 'Closed' })
        ]);
        res.render('admin/leads', {
            leads, stats: { total, new: newCount, contacted, closed },
            currentPage: 'leads',
            layout: false
        });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.post('/leads/add', async (req, res) => {
    try {
        const { name, email, phone, country, subject, message, status, source } = req.body;
        const lead = new Lead({
            name, email, phone, country, subject, message,
            status: status || 'New',
            source: source || 'Admin Manual'
        });
        await lead.save();
        res.json({ message: 'Lead added successfully.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.put('/leads/:id', async (req, res) => {
    try {
        const { name, email, phone, country, subject, message, status, notes } = req.body;
        await Lead.findByIdAndUpdate(req.params.id, {
            name, email, phone, country, subject, message, status, notes
        }, { new: true });
        res.json({ message: 'Lead updated successfully.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.delete('/leads/:id', async (req, res) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.json({ message: 'Lead deleted.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  FAQs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/faqs', async (req, res) => {
    try {
        const [faqs, packages, totalFaqs, activeFaqs] = await Promise.all([
            FAQ.find().sort({ page: 1, position: 1, createdAt: -1 }),
            Package.find({ isActive: true }).select('slug name type').sort('position'),
            FAQ.countDocuments(),
            FAQ.countDocuments({ isActive: true })
        ]);
        const pages = ['resident', 'nri', 'home', 'about', 'contact', 'privacy', 'terms', 'global'];
        res.render('admin/faqs', {
            faqs, packages, pages,
            stats: { total: totalFaqs, active: activeFaqs, inactive: totalFaqs - activeFaqs },
            currentPage: 'faqs',
            layout: false
        });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.post('/faqs/add', async (req, res) => {
    try {
        const { page, packageSlug, question, answer, position, isActive } = req.body;
        let packageName = null;
        if (page === 'package' && packageSlug) {
            const pkg = await Package.findOne({ slug: packageSlug });
            packageName = pkg ? pkg.name : packageSlug;
        }
        const faq = new FAQ({
            page, packageSlug: page === 'package' ? packageSlug : null,
            packageName, question, answer,
            position: Number(position) || 0,
            isActive: isActive !== 'false'
        });
        await faq.save();
        res.json({ message: 'FAQ added successfully.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.put('/faqs/:id', async (req, res) => {
    try {
        const { page, packageSlug, question, answer, position, isActive } = req.body;
        let packageName = null;
        if (page === 'package' && packageSlug) {
            const pkg = await Package.findOne({ slug: packageSlug });
            packageName = pkg ? pkg.name : packageSlug;
        }
        await FAQ.findByIdAndUpdate(req.params.id, {
            page, packageSlug: page === 'package' ? packageSlug : null,
            packageName, question, answer,
            position: Number(position) || 0,
            isActive: isActive !== 'false'
        }, { new: true });
        res.json({ message: 'FAQ updated successfully.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

router.delete('/faqs/:id', async (req, res) => {
    try {
        await FAQ.findByIdAndDelete(req.params.id);
        res.json({ message: 'FAQ deleted.' });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  BLOGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/blogs', blogController.adminGetBlogs);
router.post('/blogs/add', blogUpload.single('image'), blogController.adminAddBlog);
router.put('/blogs/:id', blogUpload.single('image'), blogController.adminUpdateBlog);
router.delete('/blogs/:id', blogController.adminDeleteBlog);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TESTIMONIALS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/testimonials', adminTestimonialController.adminGetTestimonials);
router.post('/testimonials/approve-all', adminTestimonialController.adminApproveAllPending);
router.post('/testimonials/:id/approve', adminTestimonialController.adminApproveTestimonial);
router.delete('/testimonials/:id', adminTestimonialController.adminDeleteTestimonial);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  AUTHORS (Properties/Settings)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/authors', authorController.adminGetAuthors);
router.post('/authors/add', profileUpload.single('image'), authorController.adminAddAuthor);
router.put('/authors/:id', profileUpload.single('image'), authorController.adminUpdateAuthor);
router.delete('/authors/:id', authorController.adminDeleteAuthor);

module.exports = router;
