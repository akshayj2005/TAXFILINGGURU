const { withLogging } = require('../utils/wrapper');
const { calculateTax, calculateResidentialStatus, calculateTraderTurnover, generateMissedOpportunityReport } = require('../utils/taxCalculator');
const logger = require('../utils/logger')('tools');
const wrap = (name, handler) => withLogging('tools', name, handler);

const FAQ = require('../models/FAQ');

// ─── Tool Renderers ────────────────────────────────────────────────────────────

exports.renderTools = wrap('renderTools', async (req, res) => {
    const pageFaqs = await FAQ.find({ page: 'global', isActive: true }).sort('position');
    res.render('tools/index', { pageFaqs });
});
exports.renderRefundMaximizer = wrap('renderRefundMaximizer', async (req, res) => {
    const pageFaqs = await FAQ.find({ page: 'global', isActive: true }).sort('position');
    res.render('tools/refund-maximizer', { pageFaqs });
});
exports.renderRegimeComparison = wrap('renderRegimeComparison', async (req, res) => {
    const pageFaqs = await FAQ.find({ page: 'global', isActive: true }).sort('position');
    res.render('tools/regime-comparison', { pageFaqs });
});
exports.renderNRIStatus = wrap('renderNRIStatus', async (req, res) => {
    const pageFaqs = await FAQ.find({ page: 'global', isActive: true }).sort('position');
    res.render('tools/nri-status', { pageFaqs });
});
exports.renderTraderTurnover = wrap('renderTraderTurnover', async (req, res) => {
    const pageFaqs = await FAQ.find({ page: 'global', isActive: true }).sort('position');
    res.render('tools/trader-turnover', { pageFaqs });
});
exports.renderRefundStatus = wrap('renderRefundStatus', async (req, res) => {
    const pageFaqs = await FAQ.find({ page: 'global', isActive: true }).sort('position');
    res.render('tools/refund-status', { pageFaqs });
});

// ─── Calculation Actions ───────────────────────────────────────────────────────

exports.calculateTax = wrap('calculateTax', async (req, res) => {
    try {
        const { income, deductions = 0 } = req.body;
        const grossIncome = parseFloat(income);
        const totalDeductions = parseFloat(deductions);

        if (isNaN(grossIncome)) {
            return res.status(400).json({ error: 'Invalid income value' });
        }

        const results = {
            old: calculateTax(grossIncome, totalDeductions, 'old'),
            new_24_25: calculateTax(grossIncome, 0, 'new_24_25'),
            new_25_26: calculateTax(grossIncome, 0, 'new_25_26')
        };

        logger.info('Tax Calculation Completed', {
            requestId: req.requestId,
            savings: results.old.totalTax - results.new_25_26.totalTax
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Tax calculation failed', message: err.message });
    }
});

exports.calculateNRIStatus = wrap('calculateNRIStatus', async (req, res) => {
    try {
        const { daysInIndia, daysInIndiaPast4Years, isIndianCitizen, incomeInIndiaExceeds15L } = req.body;

        const status = calculateResidentialStatus(
            parseInt(daysInIndia),
            parseInt(daysInIndiaPast4Years),
            isIndianCitizen === 'true',
            incomeInIndiaExceeds15L === 'true'
        );

        res.json({ status });
    } catch (err) {
        res.status(500).json({ error: 'Calculation failed' });
    }
});

exports.calculateTraderTurnover = wrap('calculateTraderTurnover', async (req, res) => {
    try {
        const { trades } = req.body;
        const result = calculateTraderTurnover(trades);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Calculation failed' });
    }
});

exports.generateMissedOpportunityReport = wrap('missedOpportunity', async (req, res) => {
    try {
        const { income, deductions, currentRegime } = req.body;
        const report = generateMissedOpportunityReport(
            parseFloat(income),
            parseFloat(deductions || 0),
            currentRegime || 'old'
        );
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
});
