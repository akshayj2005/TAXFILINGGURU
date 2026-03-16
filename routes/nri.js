const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');

// ─── NRI Pages ────────────────────────────────────────────────────────────────
router.get('/nri', packageController.renderNRIList);

// ─── Individual NRI Plan Routes (Now handled dynamically) ─────────────────────
router.get('/nri/:slug', packageController.renderPackageDetail);


module.exports = router;
