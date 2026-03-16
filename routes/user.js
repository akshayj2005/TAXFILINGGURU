const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/login', userController.renderLogin);
router.post('/api/login', userController.login);
router.get('/logout', userController.logout);

// Email Verification
router.get('/auth/verify-email', userController.verifyEmail);
router.post('/api/auth/resend-verification', userController.resendVerification);

// Forgot Credentials
router.post('/api/auth/forgot-password-otp', userController.forgotPasswordOTP);
router.post('/api/auth/verify-reset-otp', userController.verifyResetOTP);
router.post('/api/auth/reset-password', userController.resetPassword);

module.exports = router;
