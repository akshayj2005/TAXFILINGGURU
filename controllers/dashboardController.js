const { withLogging } = require('../utils/wrapper');
const RequestLog = require('../models/RequestLog');
const Visitor = require('../models/Visitor');
const Interaction = require('../models/Interaction');
const logger = require('../utils/logger')('dashboard');
const wrap = (name, handler) => withLogging('dashboard', name, handler);

// ─── View Rendering ──────────────────────────────────────────────────────────

const Testimonial = require('../models/Testimonial');

exports.renderDashboard = wrap('renderDashboard', async (req, res) => {
    if (!req.user) return res.redirect('/login');
    // Fetch user's recent testimonials
    const userTestimonials = await Testimonial.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    let shouldShowPopup = false;
    if (req.user.requestTestimonial) {
        shouldShowPopup = true;
        // Clear flag immediately after triggering it once
        await User.findByIdAndUpdate(req.user._id, { requestTestimonial: false });
    }

    res.render('dashboard/index', { user: req.user, userTestimonials, shouldShowPopup });
});

const upload = require('../utils/upload');
const profileUpload = require('../utils/profileUpload');
const User = require('../models/User');
const Counter = require('../models/Counter');
const path = require('path');
const fs = require('fs');

exports.uploadDocument = wrap('uploadDocument', (req, res) => {
    upload.single('document')(req, res, async (err) => {
        if (err) {
            logger.error('Multer Error', err);
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Please select a file to upload' });
        }

        try {
            if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
            
            const { docType, label } = req.body;
            
            const docData = {
                docType: docType || 'others',
                label: label || '',
                filename: req.file.filename,
                path: req.file.path,
                originalName: req.file.originalname,
                size: req.file.size,
                uploadedAt: new Date()
            };

            await User.findByIdAndUpdate(req.user._id, {
                $push: { documents: docData }
            });

            res.json({ 
                success: true, 
                message: 'Document uploaded successfully',
                document: docData
            });
        } catch (dbErr) {
            logger.error('Upload DB Error', dbErr);
            res.status(500).json({ error: 'Failed to save document details' });
        }
    });
});

exports.deleteDocument = wrap('deleteDocument', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        
        const { docId } = req.params;
        const fs = require('fs');

        // Find user and get document details before pulling
        const user = await User.findById(req.user._id);
        const doc = user.documents.id(docId);

        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Handle possible path absolute/relative movement dynamically
        const folderName = (user.name || user.userid || 'unknown').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const expectedPath = path.join(__dirname, '../uploads', folderName, doc.filename);
        const targetPath = (doc.path && fs.existsSync(doc.path)) ? doc.path : expectedPath;

        // Delete physical file
        if (targetPath && fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
        }

        // Remove from database
        user.documents.pull(docId);
        await user.save();

        res.json({ success: true, message: 'Document deleted successfully' });
    } catch (err) {
        logger.error('Delete Document Error', err);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

exports.updateDocumentLabel = wrap('updateDocumentLabel', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        
        const { docId } = req.params;
        const { label } = req.body;

        await User.updateOne(
            { _id: req.user._id, 'documents._id': docId },
            { $set: { 'documents.$.label': label } }
        );

        res.json({ success: true, message: 'Label updated successfully' });
    } catch (err) {
        logger.error('Update Label Error', err);
        res.status(500).json({ error: 'Failed to update document label' });
    }
});

exports.viewDocument = wrap('viewDocument', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        
        const { docId } = req.params;
        const fs = require('fs');
        const path = require('path');

        const user = await User.findById(req.user._id);
        const doc = user.documents.id(docId);

        if (!doc) {
            return res.status(404).send('Document not found in directory.');
        }

        const folderName = (user.name || user.userid || 'unknown').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const expectedPath = path.join(__dirname, '../uploads', folderName, doc.filename);
        const targetPath = (doc.path && fs.existsSync(doc.path)) ? doc.path : expectedPath;

        if (!fs.existsSync(targetPath)) {
            return res.status(404).send('Document not found on server');
        }

        const ext = path.extname(targetPath).toLowerCase();
        let contentType = 'application/octet-stream';
        
        if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';

        res.contentType(contentType);
        // Set content disposition to inline so it opens in the browser if possible
        res.setHeader('Content-Disposition', 'inline; filename="' + doc.originalName + '"');
        res.sendFile(path.resolve(targetPath));
    } catch (err) {
        logger.error('View Document Error', err);
        res.status(500).send('Failed to open document');
    }
});

exports.renderInvoice = wrap('renderInvoice', async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login');
        if (req.user.paymentStatus !== 'Completed') {
            return res.status(403).send('Invoice only available for completed payments');
        }

        const user = await User.findById(req.user._id);
        let invoiceNumber = user.invoiceNumber;

        if (!invoiceNumber) {
            // Get next serial number
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'invoice' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            
            // Format: TFG/26-27/001
            const year = new Date().getFullYear().toString().slice(-2);
            const nextYear = (parseInt(year) + 1).toString();
            const seq = counter.seq.toString().padStart(3, '0');
            invoiceNumber = `TFG/${year}-${nextYear}/${seq}`;
            
            user.invoiceNumber = invoiceNumber;
            await user.save();
        }

        const invoiceDate = new Date(user.updatedAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

        res.render('dashboard/invoice', {
            user: user,
            invoiceNumber,
            invoiceDate,
            layout: false
        });
    } catch (err) {
        logger.error('Invoice Render Error', err);
        res.status(500).send('Failed to generate invoice');
    }
});

// ─── Analytics & Visitor Actions ──────────────────────────────────────────────

exports.logInteraction = wrap('logInteraction', async (req, res) => {
    try {
        const { type, category, text, metadata } = req.body;
        const visitorId = req.cookies.visitor_id;

        const interaction = new Interaction({
            visitorId,
            type,
            category,
            text,
            path: req.headers.referer || 'unknown',
            metadata
        });

        await interaction.save();
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to log interaction' });
    }
});

exports.getAllApiLogs = wrap('getAllApiLogs', async (req, res) => {
    try {
        const { requestId, userId, limit = 50 } = req.body;
        const query = {};
        if (requestId) query.requestId = requestId;
        if (userId) query.userId = userId;

        const logs = await RequestLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch logs', message: err.message });
    }
});

exports.getOnlineUsers = wrap('getOnlineUsers', async (req, res) => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const onlineUsers = await Visitor.find({
            lastSeen: { $gte: fiveMinutesAgo }
        }).sort({ lastSeen: -1 });

        const stats = {
            total: onlineUsers.length,
            new: 0,
            returning: 0
        };

        const detailedUsers = onlineUsers.map(u => {
            const isReturning = (new Date() - u.firstSeen) > (24 * 60 * 60 * 1000);
            if (isReturning) stats.returning++; else stats.new++;

            return {
                id: u.visitorId,
                ip: u.ipAddress,
                location: `${u.location.city || 'Unknown'}, ${u.location.country || 'Unknown'}`,
                browser: u.userAgent.browser,
                currentPath: u.currentPath,
                lastSeen: u.lastSeen,
                firstSeen: u.firstSeen,
                isReturning: isReturning
            };
        });

        res.json({ summary: stats, users: detailedUsers });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch online users', message: err.message });
    }
});

/**
 * Renders the user profile page
 */
exports.renderProfile = wrap('renderProfile', async (req, res) => {
    if (!req.user) return res.redirect('/login');
    res.render('dashboard/profile', { user: req.user, title: 'My Profile' });
});

/**
 * Updates user profile information
 */
exports.updateProfile = wrap('updateProfile', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const { name, phone, pan, residenceCountry, oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        // Update fields if provided in request body (allow empty strings for optional fields)
        if (name !== undefined && name.trim() !== '') user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (pan !== undefined) user.pan = pan;
        if (residenceCountry !== undefined) user.residenceCountry = residenceCountry;

        // Password change logic
        if (oldPassword && newPassword) {
            const isMatch = await user.comparePassword(oldPassword);
            if (!isMatch) {
                return res.status(400).json({ success: false, error: 'Incorrect current password' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
            }
            user.password = newPassword;
            user.generatedPassword = newPassword; // Sync plain text
        } else if (newPassword && !oldPassword) {
            return res.status(400).json({ success: false, error: 'Please provide current password to set a new one' });
        }

        await user.save();
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        logger.error('Profile Update Error', err);
        const errorMessage = err.name === 'ValidationError' 
            ? Object.values(err.errors).map(e => e.message).join(', ') 
            : 'Failed to update profile';
        res.status(500).json({ success: false, error: errorMessage });
    }
});

/**
 * Updates user profile image
 */
exports.updateProfileImage = wrap('updateProfileImage', (req, res) => {
    profileUpload.single('profileImage')(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, error: err.message });
        if (!req.file) return res.status(400).json({ success: false, error: 'No image uploaded' });

        try {
            const user = await User.findById(req.user._id);
            // Delete old image if exists
            if (user.profileImage) {
                const oldPath = path.join(__dirname, '../public', user.profileImage);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            user.profileImage = `/uploads/profiles/${req.file.filename}`;
            await user.save();

            res.json({ success: true, message: 'Profile image updated', imageUrl: user.profileImage });
        } catch (dbErr) {
            console.error('Update Profile Image Error', dbErr);
            res.status(500).json({ success: false, error: 'Database error while saving image: ' + dbErr.message });
        }
    });
});

/**
 * Deletes user profile image
 */
exports.deleteProfileImage = wrap('deleteProfileImage', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.profileImage) {
            const oldPath = path.join(__dirname, '../public', user.profileImage);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        
        // Remove field entirely from DB using $unset
        await User.findByIdAndUpdate(req.user._id, { $unset: { profileImage: 1 } });
        
        res.json({ success: true, message: 'Profile image removed' });
    } catch (err) {
        console.error('Delete Profile Image Error', err);
        res.status(500).json({ success: false, error: 'Failed to delete profile image: ' + err.message });
    }
});
