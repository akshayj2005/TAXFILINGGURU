const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');

// ─── Tool Pages ───────────────────────────────────────────────────────────────
router.get('/tools', toolController.renderTools);
router.get('/refund-maximizer', toolController.renderRefundMaximizer);
router.get('/regime-comparison', toolController.renderRegimeComparison);
router.get('/nri-status', toolController.renderNRIStatus);
router.get('/trader-turnover', toolController.renderTraderTurnover);
router.get('/refund-status', toolController.renderRefundStatus);

// ─── Tool Logic (POST) ────────────────────────────────────────────────────────
// Keeping /api prefix for frontend compatibility as per existing scripts
router.post('/api/calculate-tax', toolController.calculateTax);
router.post('/api/calculate-nri-status', toolController.calculateNRIStatus);
router.post('/api/calculate-trader-turnover', toolController.calculateTraderTurnover);
router.post('/api/missed-opportunity', toolController.generateMissedOpportunityReport);

module.exports = router;
