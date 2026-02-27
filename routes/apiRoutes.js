const express = require('express');
const router = express.Router();
const RequestLog = require('../models/RequestLog');
const Visitor = require('../models/Visitor');
const Interaction = require('../models/Interaction');
const { calculateTax, calculateResidentialStatus, calculateTraderTurnover, generateMissedOpportunityReport } = require('../utils/taxCalculator');
const logger = require('../utils/logger')('api');
const Consultation = require('../models/Consultation');

// ... other endpoints

// Log user interaction
router.post('/log-interaction', async (req, res) => {
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
        logger.error('Log Interaction Error', { error: err.message });
        res.status(500).json({ error: 'Failed to log interaction' });
    }
});

// Book Consultation
router.post('/book-consultation', async (req, res) => {
    try {
        const { type, date, time, name, email, mobile, duration, amount } = req.body;

        const consultation = new Consultation({
            type,
            date,
            time,
            name,
            email,
            mobile,
            duration,
            amount
        });

        await consultation.save();
        res.status(200).json({ success: true, message: 'Consultation booked successfully' });
    } catch (err) {
        logger.error('Book Consultation Error', { error: err.message });
        res.status(500).json({ error: 'Failed to book consultation' });
    }
});

// Missed Opportunity Report
router.post('/missed-opportunity', async (req, res) => {
    logger.info('Missed Opportunity Report Requested', { requestId: req.requestId });
    try {
        const { income, deductions, currentRegime } = req.body;

        const report = generateMissedOpportunityReport(
            parseFloat(income),
            parseFloat(deductions || 0),
            currentRegime || 'old'
        );

        logger.info('Missed Opportunity Report Generated', { requestId: req.requestId, savings: report.missedSavings });
        res.json(report);
    } catch (err) {
        logger.error('Missed Opportunity Error', { requestId: req.requestId, error: err.message });
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

module.exports = router;

// Analytics Endpoint
// ... exists

// Real-time Online Users
// ... exists

// Tax Calculation Comparison
// ... exists

// NRI Status Calculator
router.post('/calculate-nri-status', async (req, res) => {
    logger.info('NRI Status Calculation Requested', { requestId: req.requestId });
    try {
        const { daysInIndia, daysInIndiaPast4Years, isIndianCitizen, incomeInIndiaExceeds15L } = req.body;

        const status = calculateResidentialStatus(
            parseInt(daysInIndia),
            parseInt(daysInIndiaPast4Years),
            isIndianCitizen === 'true',
            incomeInIndiaExceeds15L === 'true'
        );

        logger.info('NRI Status Calculated', { requestId: req.requestId, status });
        res.json({ status });
    } catch (err) {
        logger.error('NRI Calculation Error', { requestId: req.requestId, error: err.message });
        res.status(500).json({ error: 'Calculation failed' });
    }
});

// Trader Turnover Calculator
router.post('/calculate-trader-turnover', async (req, res) => {
    logger.info('Trader Turnover Calculation Requested', { requestId: req.requestId });
    try {
        const { trades } = req.body; // Expecting array of { profit: number, loss: number }

        const result = calculateTraderTurnover(trades);

        logger.info('Trader Turnover Calculated', { requestId: req.requestId, turnover: result.absoluteTurnover });
        res.json(result);
    } catch (err) {
        logger.error('Trader Calculation Error', { requestId: req.requestId, error: err.message });
        res.status(500).json({ error: 'Calculation failed' });
    }
});

module.exports = router;

// Analytics Endpoint
router.post('/all_api_logs', async (req, res) => {
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

// Real-time Online Users
router.get('/online-users', async (req, res) => {
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

// Tax Calculation Comparison
router.post('/calculate-tax', async (req, res) => {
    const { income, deductions = 0 } = req.body;

    // Entry Log
    logger.info('Tax Calculation Requested', {
        requestId: req.requestId,
        income,
        deductions
    });

    try {
        const grossIncome = parseFloat(income);
        const totalDeductions = parseFloat(deductions);

        if (isNaN(grossIncome)) {
            logger.warn('Invalid income input', { requestId: req.requestId, income });
            return res.status(400).json({ error: 'Invalid income value' });
        }

        const results = {
            old: calculateTax(grossIncome, totalDeductions, 'old'),
            new_24_25: calculateTax(grossIncome, 0, 'new_24_25'),
            new_25_26: calculateTax(grossIncome, 0, 'new_25_26')
        };

        // Exit Log with Data
        logger.info('Tax Calculation Completed', {
            requestId: req.requestId,
            savings: results.old.totalTax - results.new_25_26.totalTax
        });

        res.json(results);
    } catch (err) {
        logger.error('Tax Calculation Error', {
            requestId: req.requestId,
            error: err.message
        });
        res.status(500).json({ error: 'Tax calculation failed', message: err.message });
    }
});

module.exports = router;
