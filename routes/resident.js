const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');

// ─── Individual Resident Plan Routes (Handled Dynamically) ───────────────────
router.get('/resident/:slug', packageController.renderPackageDetail);

module.exports = router;
