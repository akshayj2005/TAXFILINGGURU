const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// ─── Dashboard Rendering ─────────────────────────────────────────────────────
router.get('/dashboard', dashboardController.renderDashboard);
router.get('/dashboard/profile', dashboardController.renderProfile);
router.put('/api/dashboard/profile', dashboardController.updateProfile);

// ─── Document Management ───────────────────────────────────────────────────
router.post('/api/dashboard/upload', dashboardController.uploadDocument);
router.delete('/api/dashboard/documents/:docId', dashboardController.deleteDocument);
router.patch('/api/dashboard/documents/:docId', dashboardController.updateDocumentLabel);
router.get('/api/dashboard/documents/:docId/view', dashboardController.viewDocument);

// ─── Analytics (used by frontend JS) ─────────────────────────────────────────
router.post('/api/log-interaction', dashboardController.logInteraction);
router.post('/api/all_api_logs', dashboardController.getAllApiLogs);
router.get('/api/online-users', dashboardController.getOnlineUsers);

// ─── Receipts & Invoices ───────────────────────────────────────────────────
router.get('/api/dashboard/invoice', dashboardController.renderInvoice);

// ─── Profile Image ──────────────────────────────────────────────────────────
router.post('/api/dashboard/profile/image', dashboardController.updateProfileImage);
router.delete('/api/dashboard/profile/image', dashboardController.deleteProfileImage);

module.exports = router;
