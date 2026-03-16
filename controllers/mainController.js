const { withLogging } = require('../utils/wrapper');
const wrap = (name, handler) => withLogging('main', name, handler);

// ─── Page Renderers ───────────────────────────────────────────────────────────

const Package = require('../models/Package');
const Testimonial = require('../models/Testimonial');

exports.renderHome = wrap('renderHome', async (req, res) => {
    let servicesData = {};
    let testimonials = [];
    try {
        // Fetch specialized services from DB
        const packages = await Package.find({
            type: 'global-services',
            isActive: true,
            slug: { $nin: ['video-consultation-45', 'video-consultation-90', 'FreeConsultation'] }
        }).sort('position');

        if (packages && packages.length > 0) {
            packages.forEach(pkg => {
                let rate = pkg.price;
                if (pkg.price === '0' || pkg.price === 'Free') {
                    rate = 'Free';
                } else if (pkg.price !== 'Custom' && !pkg.price.startsWith('₹')) {
                    rate = '₹ ' + pkg.price;
                }

                servicesData[pkg.slug] = {
                    name: pkg.name,
                    rate: pkg.priceSuffix ? `${rate} ${pkg.priceSuffix}` : rate,
                    description: pkg.shortDescription || pkg.subheading,
                    features: pkg.features,
                    icon: pkg.icon
                };
            });
        }

        // Fetch approved testimonials - newest first
        testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });

        const totalTestimonials = testimonials.length;
        const avgRating = totalTestimonials > 0
            ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / totalTestimonials).toFixed(1)
            : '0.0';

        const FAQ = require('../models/FAQ');
        let pageFaqs = [];
        try {
            const rawFaqs = await FAQ.find({
                page: { $in: ['home', 'global'] },
                isActive: true
            }).sort('position');

            const seen = new Set();
            pageFaqs = rawFaqs.filter(f => {
                const key = f.question.trim().toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        } catch (err) {
            console.error('Error loading FAQs for home page:', err);
        }

        res.render('pages/index', { servicesData, pageFaqs, testimonials, avgRating, totalTestimonials });
    } catch (err) {
        console.error('Error loading data for home page:', err);
        res.render('pages/index', { servicesData: {}, pageFaqs: [], testimonials: [], avgRating: '0.0', totalTestimonials: 0 });
    }
});

exports.submitTestimonial = wrap('submitTestimonial', async (req, res) => {
    try {
        const { name, role, content, rating } = req.body;
        if (!name || !content) {
            return res.status(400).json({ success: false, error: 'Name and content are required' });
        }

        const userId = req.session.userId || null;

        // Apply limit for registered users: Max 3 in 6 months
        if (userId) {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const count = await Testimonial.countDocuments({
                userId,
                createdAt: { $gte: sixMonthsAgo }
            });

            if (count >= 3) {
                return res.status(400).json({
                    success: false,
                    error: 'You have reached the limit of 3 testimonials in a 6-month period.'
                });
            }
        }

        const testimonial = new Testimonial({
            userId,
            name,
            role: role || 'Client',
            content,
            rating: parseInt(rating) || 5,
            isApproved: false // Requires admin approval
        });

        await testimonial.save();
        res.json({ success: true, message: 'Thank you! Your testimonial has been submitted for review.' });
    } catch (err) {
        console.error('Submit Testimonial error:', err);
        res.status(500).json({ success: false, error: 'Failed to submit testimonial' });
    }
});

exports.updateTestimonial = wrap('updateTestimonial', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, rating } = req.body;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Authentication required to edit.' });
        }

        const testimonial = await Testimonial.findOne({ _id: id, userId });
        if (!testimonial) {
            return res.status(404).json({ success: false, error: 'Testimonial not found or you are not the owner.' });
        }

        testimonial.content = content || testimonial.content;
        testimonial.rating = parseInt(rating) || testimonial.rating;
        testimonial.isApproved = false; // Reset approval when content changes

        await testimonial.save();
        res.json({ success: true, message: 'Testimonial updated and queued for re-approval.' });
    } catch (err) {
        console.error('Update Testimonial error:', err);
        res.status(500).json({ success: false, error: 'Failed to update testimonial' });
    }
});

exports.deleteUserTestimonial = wrap('deleteUserTestimonial', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ success: false, error: 'Authentication required.' });

        const result = await Testimonial.findOneAndDelete({ _id: id, userId });
        if (!result) return res.status(404).json({ success: false, error: 'Not found.' });

        res.json({ success: true, message: 'Deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Delete failed.' });
    }
});

exports.renderAbout = wrap('renderAbout', async (req, res) => {
    const FAQ = require('../models/FAQ');
    const rawFaqs = await FAQ.find({ page: { $in: ['about', 'global'] }, isActive: true }).sort('position');
    const seen = new Set();
    const pageFaqs = rawFaqs.filter(f => {
        const key = f.question.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    res.render('pages/about', { pageFaqs });
});

exports.renderContact = wrap('renderContact', async (req, res) => {
    const FAQ = require('../models/FAQ');
    const rawFaqs = await FAQ.find({ page: { $in: ['contact', 'global'] }, isActive: true }).sort('position');
    const seen = new Set();
    const pageFaqs = rawFaqs.filter(f => {
        const key = f.question.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    res.render('pages/contact', { pageFaqs });
});

exports.renderPrivacy = wrap('renderPrivacy', async (req, res) => {
    const FAQ = require('../models/FAQ');
    const rawFaqs = await FAQ.find({ page: { $in: ['privacy', 'global'] }, isActive: true }).sort('position');
    const seen = new Set();
    const pageFaqs = rawFaqs.filter(f => {
        const key = f.question.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    res.render('pages/privacy', { pageFaqs });
});

exports.renderTerms = wrap('renderTerms', async (req, res) => {
    const FAQ = require('../models/FAQ');
    const rawFaqs = await FAQ.find({ page: { $in: ['terms', 'global'] }, isActive: true }).sort('position');
    const seen = new Set();
    const pageFaqs = rawFaqs.filter(f => {
        const key = f.question.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    res.render('pages/terms', { pageFaqs });
});

// ─── Actions ──────────────────────────────────────────────────────────────────

const User = require('../models/User');
const Lead = require('../models/Lead');

exports.registerPackage = wrap('registerPackage', async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const pan = req.body.pan;
        const specifications = req.body.message || req.body.specifications;
        const residenceCountry = req.body.country || req.body.residenceCountry;

        // Support both old (planName/planRate) and new (packageName/packagePrice/packageSlug) formats
        const packageName = req.body.packageName || req.body.planName;
        const packagePrice = req.body.packagePrice || req.body.planRate;
        const packageSlugInput = req.body.packageSlug || (req.body.planName ? req.body.planName.toLowerCase().replace(/ /g, '-') : '');
        const packageSlug = String(packageSlugInput || '').toLowerCase();
        const isNriFlag = req.body.isNri === true || req.body.isNri === 'true';

        if (!name || !email || !packageName) {
            return res.status(400).json({ success: false, error: 'Missing required fields (name, email, or package info)' });
        }

        // Use normalized email ONLY for searching
        const normalizedEmailSearch = email.toLowerCase();

        const Package = require('../models/Package');
        const dbPackage = await Package.findOne({ slug: packageSlug });

        // Determine user type from package data or fall back to slug/flag
        let userType = 'resident';
        if (isNriFlag || packageSlug.toLowerCase().includes('nri')) {
            userType = 'nri';
        } else if (dbPackage && dbPackage.type === 'nri') {
            userType = 'nri';
        }

        const packageData = {
            name: String(packageName || ''),
            slug: packageSlug,
            price: String(packagePrice || ''),
            chosenAt: new Date()
        };

        // Check across all types for existing users
        const existingUsers = await User.find({
            email: { $regex: new RegExp('^' + email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
        });

        const isGlobalPackage = dbPackage && (dbPackage.type === 'global' || dbPackage.type === 'global-services');

        let user = null;
        if (existingUsers.length > 0) {
            if (isGlobalPackage) {
                // Global packages are always allowed, just pick the existing profile to append to
                user = existingUsers[0];
            } else {
                // Find if they have an active profile for the type they are trying to register for
                const matchTypeUser = existingUsers.find(u => u.type === userType);
                if (matchTypeUser) {
                    user = matchTypeUser;
                } else {
                    // Mismatched type! (e.g. Trying to register NRI but already have Resident)
                    const existingType = existingUsers[0].type === 'nri' ? 'NRI' : 'Resident';
                    return res.status(400).json({ 
                        success: false, 
                        error: `Already registered as a ${existingType} user using this email. Please login using your ${existingType} profile.` 
                    });
                }
            }
        }

        if (!user) {
            // Generate a random 10-character password for client login
            const autoPass = Math.random().toString(36).slice(-10).toUpperCase(); // Better format

            user = new User({
                name: name,
                email: email, // Store as entered
                userid: `${email.toLowerCase()}-${userType.substring(0, 3)}`, // Give a unique userid to avoid clashes
                phone: phone || '',
                pan: pan || '',
                specifications: specifications || '',
                residenceCountry: residenceCountry || '',
                password: autoPass, // Will be hashed in model pre-save
                generatedPassword: autoPass,
                type: userType,
                packages: [packageData]
            });
            await user.save();
        } else {
            // Update existing user
            if (!user.phone && phone) user.phone = phone;
            if (!user.pan && pan) user.pan = pan;
            if (!user.specifications && specifications) user.specifications = specifications;
            if (!user.residenceCountry && residenceCountry) user.residenceCountry = residenceCountry;

            if (!user.residenceCountry && residenceCountry) user.residenceCountry = residenceCountry;

            const alreadyHas = user.packages.some(p => p.slug === packageSlug.toLowerCase());
            if (!alreadyHas) {
                user.packages.push(packageData);
            }

            await user.save();
        }

        let paymentUrl = '';

        // Auto-complete if the package is free
        if (dbPackage && (dbPackage.price === '0' || dbPackage.price === 'Free')) {
            const oldStatus = user.paymentStatus;
            user.paymentStatus = 'Completed';
            await user.save();

            if (oldStatus !== 'Completed') {
                try {
                    const { sendCredentialsEmail } = require('../utils/email');
                    await sendCredentialsEmail(user);
                } catch (err) { console.error('Auto-Email Error:', err); }
            }
        } else {
            // Not a free package: Send payment link email
            try {
                const { sendRegistrationPaymentEmail } = require('../utils/email');
                const pData = {
                    name: packageName || 'Package',
                    slug: packageSlug || 'package',
                    price: packagePrice || 'TBD'
                };
                // Send the payment instruction email asynchronously
                sendRegistrationPaymentEmail(user, pData).catch(err => console.error('Payment Auto-Email Error:', err));

                // Formulate the redirect URL to send back to the client
                paymentUrl = `/payment?email=${encodeURIComponent(user.email)}&package=${encodeURIComponent(pData.slug)}`;
            } catch (err) { console.error('Could not initiate payment email:', err); }
        }

        res.json({
            success: true,
            message: 'Package selection saved successfully',
            redirectUrl: paymentUrl,
            generatedPass: user.generatedPassword // Return it so the UI can show it if needed
        });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

exports.submitContact = wrap('submitContact', async (req, res) => {
    try {
        const { name, email, subject, message, phone, country } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Please provide your name, email and message.'
            });
        }

        const newLead = new Lead({
            name,
            email,
            phone: phone || '',
            country: country || 'Not Provided',
            subject: subject || 'No Subject',
            message,
            source: 'Contact Page'
        });

        await newLead.save();

        res.json({
            success: true,
            message: 'Thank you! Your message has been received. Our team will contact you shortly.'
        });
    } catch (err) {
        console.error('Contact Submission Error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to send message. Please try again later.'
        });
    }
});

exports.bookConsultation = wrap('bookConsultation', async (req, res) => {
    try {
        const { type, date, time, name, email, mobile, country, duration, amount } = req.body;

        if (!type || !date || !time) {
            return res.status(400).json({ success: false, error: 'Missing required fields: type, date, time.' });
        }

        const Consultation = require('../models/Consultation');

        const record = new Consultation({
            type,
            date,
            time,
            name: name || undefined,
            email: email || undefined,
            mobile: mobile || undefined,
            country: country || undefined,
            duration: duration || undefined,
            amount: amount || undefined,
        });

        await record.save();

        res.json({ success: true, message: 'Consultation booked successfully.' });
    } catch (err) {
        console.error('Consultation Booking Error:', err);
        res.status(500).json({ success: false, error: 'Could not save booking. Please try again.' });
    }
});
