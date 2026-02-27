const { withLogging } = require('../utils/wrapper');
const Consultation = require('../models/Consultation');

const wrap = (name, handler) => withLogging('pages', name, handler);

// ─── Static Pages ─────────────────────────────────────────────────────────────
exports.renderHome = wrap('renderHome', (req, res) => res.render('pages/index'));
exports.renderAbout = wrap('renderAbout', (req, res) => res.render('pages/about'));
exports.renderContact = wrap('renderContact', (req, res) => res.render('pages/contact'));
exports.renderPrivacy = wrap('renderPrivacy', (req, res) => res.render('pages/privacy'));
exports.renderTerms = wrap('renderTerms', (req, res) => res.render('pages/terms'));

// ─── Package Landing Pages ────────────────────────────────────────────────────
exports.renderNRI = wrap('renderNRI', (req, res) => res.render('pages/nri'));
exports.renderIndividualPackage = wrap('renderIndividualPackage', (req, res) => res.render('pages/individualpackage'));

// ─── Consultations ─────────────────────────────────────────────────────────────
exports.renderConsultation = wrap('renderConsultation', async (req, res) => {
    const consultations = await Consultation.find().sort({ createdAt: -1 });
    res.render('pages/consultation', { consultations });
});

// ─── Auth Pages ───────────────────────────────────────────────────────────────
exports.renderLogin = wrap('renderLogin', (req, res) => res.render('auth/login', {
    layout: 'layouts/main',
    seo: {
        title: 'Client Login – Tax Filing Guru',
        headings: { h1: 'Client Login' },
        description: 'Log in to your Tax Filing Guru account to access your ITR filings, documents, and CA support.'
    }
}));

// ─── Tool Pages ───────────────────────────────────────────────────────────────
exports.renderTools = wrap('renderTools', (req, res) => res.render('tools/index'));
exports.renderRefundMaximizer = wrap('renderRefundMaximizer', (req, res) => res.render('tools/refund-maximizer'));
exports.renderRegimeComparison = wrap('renderRegimeComparison', (req, res) => res.render('tools/regime-comparison'));
exports.renderNRIStatus = wrap('renderNRIStatus', (req, res) => res.render('tools/nri-status'));
exports.renderTraderTurnover = wrap('renderTraderTurnover', (req, res) => res.render('tools/trader-turnover'));
exports.renderRefundStatus = wrap('renderRefundStatus', (req, res) => res.render('tools/refund-status'));

// ─── Dashboard Pages ──────────────────────────────────────────────────────────
exports.renderExistingDashboard = wrap('renderExistingDashboard', (req, res) => res.render('dashboard/existing-dashboard'));
exports.renderBeginnerDashboard = wrap('renderBeginnerDashboard', (req, res) => res.render('dashboard/beginner-dashboard'));

// ─── Resident Plan Pages  (/resident/:plan) ───────────────────────────────────
const RESIDENT_PLANS = new Set([
    'standard-tax-filing', 'business-professional', 'premium-tax-package',
    'salary-essential', 'salary-advanced', 'salary-professional', 'salary-elite-hni',
    'capital-gains', 'freelancer-gig', 'business-owner', 'nri-tax-package',
    'gst-registration', 'gst-return', 'tds-return', 'notice-handling',
    'nri-resident-combo', 'complete-family-pack',
]);

const formatPlanTitle = (plan, type) => {
    const formattedPlan = plan.split('-').map(w => {
        if (w === 'nri') return 'NRI';
        if (w === 'gst') return 'GST';
        if (w === 'tds') return 'TDS';
        if (w === 'hni') return 'HNI';
        return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');

    const typeLabel = type === 'nri' ? 'NRI Registration' : 'Resident Registration';
    return `${formattedPlan} - ${typeLabel} - Tax Filing Guru`;
};

exports.renderResidentPlan = wrap('renderResidentPlan', (req, res, next) => {
    const { plan } = req.params;
    if (!RESIDENT_PLANS.has(plan)) return next();
    res.render(`resident/${plan}`, {
        layout: 'layouts/main',
        seo: {
            title: formatPlanTitle(plan, 'resident'),
            headings: { h1: formatPlanTitle(plan, 'resident') },
            description: `Register for ${formatPlanTitle(plan, 'resident')} at Tax Filing Guru. Expert CA-assisted ITR filing.`
        }
    });
});

// ─── NRI Plan Pages  (/nri/:plan) ─────────────────────────────────────────────
const NRI_PLANS = new Set([
    'basic-nri-filing', 'standard-nri-filing', 'advanced-nri-tax-solution',
    'nri-resident-combo', 'complete-family-pack',
    'gst-registration', 'gst-return', 'tds-return', 'notice-handling',
]);

exports.renderNriPlan = wrap('renderNriPlan', (req, res, next) => {
    const { plan } = req.params;
    if (!NRI_PLANS.has(plan)) return next();
    res.render(`nri/${plan}`, {
        layout: 'layouts/main',
        seo: {
            title: formatPlanTitle(plan, 'nri'),
            headings: { h1: formatPlanTitle(plan, 'nri') },
            description: `Register for ${formatPlanTitle(plan, 'nri')} at Tax Filing Guru. Specialist NRI tax filing and DTAA advisory.`
        }
    });
});
