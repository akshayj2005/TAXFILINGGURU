const express = require('express');
const router = express.Router();
const c = require('../controllers/pageController');

// ─── Static Pages ─────────────────────────────────────────────────────────────
router.get('/', c.renderHome);
router.get('/about', c.renderAbout);
router.get('/contact', c.renderContact);
router.get('/login', c.renderLogin);
router.get('/privacy', c.renderPrivacy);
router.get('/terms', c.renderTerms);
router.get('/consultation', c.renderConsultation);
// ─── Tools ────────────────────────────────────────────────────────────────────
router.get('/tools', c.renderTools);
router.get('/refund-maximizer', c.renderRefundMaximizer);
router.get('/regime-comparison', c.renderRegimeComparison);
router.get('/nri-status', c.renderNRIStatus);
router.get('/trader-turnover', c.renderTraderTurnover);
router.get('/refund-status', c.renderRefundStatus);

// ─── Package Landing Pages ────────────────────────────────────────────────────
router.get('/individualpackage', c.renderIndividualPackage);
router.get('/nri', c.renderNRI);           // NRI landing — must be BEFORE /nri/:plan

// ─── Resident Plan Registration  →  /resident/:plan ──────────────────────────
router.get('/resident/:plan', c.renderResidentPlan);

// ─── NRI Plan Registration  →  /nri/:plan ────────────────────────────────────
router.get('/nri/:plan', c.renderNriPlan);

// ─── Dashboards ───────────────────────────────────────────────────────────────
router.get('/dashboard/existing', c.renderExistingDashboard);
router.get('/dashboard/beginner', c.renderBeginnerDashboard);

module.exports = router;
