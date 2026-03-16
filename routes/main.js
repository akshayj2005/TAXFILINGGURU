const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const path = require('path');

const packageController = require('../controllers/packageController');

router.get('/', mainController.renderHome);
router.get('/about', mainController.renderAbout);
router.get('/contact', mainController.renderContact);
router.get('/privacy', mainController.renderPrivacy);
router.get('/terms', mainController.renderTerms);
// --- Primary Listing Routes ---
router.get('/resident', packageController.renderResidentList);
router.get('/nri', packageController.renderNRIList);

// --- SEO & Legacy Redirects ---
router.get(['/individualpackage', '/packages/resident', '/packages/residence'], (req, res) => res.redirect('/resident'));
router.get(['/package/nri', '/packages/nri'], (req, res) => res.redirect('/nri'));

router.post('/api/register-package', mainController.registerPackage);
router.post('/api/book-consultation', mainController.bookConsultation);
router.post('/api/testimonials', mainController.submitTestimonial);
router.put('/api/testimonials/:id', mainController.updateTestimonial);
router.delete('/api/testimonials/:id', mainController.deleteUserTestimonial);
router.post('/contact', mainController.submitContact);

router.get('/api/faqs', async (req, res) => {
    try {
        const Package = require('../models/Package');
        const packages = await Package.find({ isActive: true }).select('type slug faqs');
        
        // Flatten all FAQs from all packages and add category metadata
        let allFaqs = [];
        packages.forEach(pkg => {
            if (pkg.faqs && pkg.faqs.length > 0) {
                const category = pkg.type === 'global-services' ? pkg.slug : pkg.type;
                pkg.faqs.forEach(f => {
                    allFaqs.push({
                        category: category,
                        question: f.question,
                        answer: f.answer,
                        sourceSlug: pkg.slug
                    });
                });
            }
        });
        
        res.json(allFaqs);
    } catch (err) {
        console.error('FAQ fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
});

router.get('/reg', async (req, res) => {
    try {
        const { type } = req.query;
        if (!type) return res.redirect('/');

        const Package = require('../models/Package');
        const pkg = await Package.findOne({ 
            $or: [
                { slug: type }, 
                { name: new RegExp('^' + type + '$', 'i') }
            ],
            isActive: true 
        });

        if (pkg) {
            // Redirect to the clean new URL structure: /type/slug
            // For root-level services, type might be global-services
            return res.redirect(`/${pkg.type}/${pkg.slug}`);
        }

        res.redirect('/');
    } catch (err) {
        console.error('Registration redirect error:', err);
        res.redirect('/');
    }
});

router.get('/api/packages', async (req, res) => {
    try {
        const { type } = req.query;
        const Package = require('../models/Package');
        const query = type ? { type, isActive: true } : { isActive: true };
        const result = await Package.find(query).sort('position');
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Package detail pages: /resident/{slug}, /nri/{slug}, /global/{slug}, etc.
router.get('/:type(resident|nri|global|global-services|package)/:slug', packageController.renderPackageDetail);

router.get('/payment', (req, res) => {
    res.send(`
        <div style="text-align:center; padding: 50px; font-family: sans-serif;">
            <h1>Mock Payment Gateway</h1>
            <p>Ready to integrate Razorpay or Stripe here.</p>
            <p><strong>Pending Payment For:</strong> ${req.query.email || 'N/A'}</p>
            <p><strong>Package:</strong> ${req.query.package || 'N/A'}</p>
            <a href="/login" style="display:inline-block; margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Go to My Dashboard</a>
        </div>
    `);
});

module.exports = router;
