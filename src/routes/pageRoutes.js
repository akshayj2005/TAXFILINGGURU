const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('index'));
router.get('/about', (req, res) => res.render('about'));
router.get('/contact', (req, res) => res.render('contact'));
router.get('/login', (req, res) => res.render('login'));
router.get('/privacy', (req, res) => res.render('privacy'));
router.get('/terms', (req, res) => res.render('terms'));
router.get('/tools', (req, res) => res.render('tools'));
router.get('/nri', (req, res) => res.render('nri'));
router.get('/reg', (req, res) => res.render('reg'));
router.get('/refund-maximizer', (req, res) => res.render('refund-maximizer'));
router.get('/regime-comparison', (req, res) => res.render('regime-comparison'));
router.get('/individualpackage', (req, res) => res.render('individualpackage'));
router.get('/existing-dashboard', (req, res) => res.render('existing-dashboard'));
router.get('/beginner-dashboard', (req, res) => res.render('beginner-dashboard'));

module.exports = router;
