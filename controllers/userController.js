const { withLogging } = require('../utils/wrapper');
const wrap = (name, handler) => withLogging('user', name, handler);
const User = require('../models/User');

const crypto = require('crypto');
const { sendVerificationEmail, sendUserIdEmail, sendPasswordOTPEmail, sendVerificationOTPEmail } = require('../utils/email');

exports.renderLogin = wrap('renderLogin', (req, res) => res.render('auth/login'));

/**
 * Handles Email Verification Link
 */
exports.verifyEmail = wrap('verifyEmail', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.render('auth/verify-result', { success: false, message: 'Invalid verification link.' });

        const user = await User.findOne({ emailVerificationToken: token });
        if (!user) return res.render('auth/verify-result', { success: false, message: 'Invalid or expired verification link.' });

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        res.render('auth/verify-result', { success: true, message: 'Your email has been verified successfully!' });
    } catch (err) {
        console.error('Email verification error:', err);
        res.render('auth/verify-result', { success: false, message: 'Server error during verification.' });
    }
});

/**
 * API to Resend Verification Email
 */
exports.resendVerification = wrap('resendVerification', async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).json({ success: false, error: 'Please login first.' });

        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

        if (user.isEmailVerified) return res.json({ success: true, message: 'Your email is already verified.' });

        // Generate new token if needed
        if (!user.emailVerificationToken) {
            user.emailVerificationToken = crypto.randomBytes(32).toString('hex');
            await user.save();
        }

        console.log(`DEBUG: Sending verification email to ${user.email} with token ${user.emailVerificationToken}`);
        await sendVerificationEmail(user, user.emailVerificationToken);

        res.json({ success: true, message: 'Verification email sent successfully.' });
    } catch (err) {
        console.error('Resend verification error:', err);
        res.status(500).json({ success: false, error: 'Failed to resend verification email.' });
    }
});

/**
 * Handles User Login POST request
 */
exports.login = wrap('login', async (req, res) => {
    try {
        const { userId, password, type } = req.body;
        
        if (!userId || !password) {
            return res.status(400).json({ success: false, error: 'User ID and Password are required.' });
        }

        // Find user by userid OR email OR phone
        // Match phone with or without + if it's a number
        let phoneQuery = userId.trim();
        let altPhone = phoneQuery.startsWith('+') ? phoneQuery.substring(1) : '+' + phoneQuery;

        let findType = type === 'nri' ? 'nri' : 'resident';

        // Find ALL users matching the identifier regardless of type, to allow checking all passwords
        const users = await User.find({ 
            $or: [
                { userid: userId },
                { email: userId.toLowerCase().trim() },
                { phone: phoneQuery },
                { phone: altPhone }
            ]
        });

        if (!users || users.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid User ID or Password.' });
        }

        let matchedUser = null;
        for (let u of users) {
            const isMatch = await u.comparePassword(password);
            if (isMatch) {
                // Prioritize the account type they tried to login from
                if (u.type === findType) {
                    matchedUser = u;
                    break;
                } else if (!matchedUser) {
                    matchedUser = u;
                }
            }
        }

        if (!matchedUser) {
            return res.status(401).json({ success: false, error: 'Invalid User ID or Password.' });
        }

        const user = matchedUser;

        // Save session
        req.session.userId = user._id;
        
        // Determine redirect based on user's history
        let loginType = 'residentbeginner';
        if (user.type === 'nri') {
            loginType = (user.packages && user.packages.length > 0) ? 'nriexisting' : 'nribeginner';
        } else {
            loginType = (user.packages && user.packages.length > 0) ? 'residentexisting' : 'residentbeginner';
        }

        res.json({ 
            success: true, 
            message: 'Login successful.',
            loginType: loginType
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Server error during login.' });
    }
});

/**
 * Handles User Logout
 */
exports.logout = wrap('logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/');
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});


/**
 * Handles Password Reset Verification
 */
exports.verifyResetOTP = wrap('verifyResetOTP', async (req, res) => {
    try {
        const { userId, otp, type } = req.body;
        let findType = type === 'nri' ? 'nri' : 'resident';

        const user = await User.findOne({ 
            $and: [
                { type: findType },
                { $or: [{ userid: userId }, { email: userId.toLowerCase().trim() }, { phone: userId.trim() }] },
                { resetPasswordOTP: otp },
                { resetPasswordOTPExpires: { $gt: Date.now() } }
            ]
        });

        if (!user) return res.status(401).json({ success: false, error: 'Invalid or expired OTP.' });
        res.json({ success: true, message: 'OTP verified successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * Handles Password Reset OTP Request
 */
exports.forgotPasswordOTP = wrap('forgotPasswordOTP', async (req, res) => {
    try {
        const { userId, type } = req.body;
        if (!userId) return res.status(400).json({ success: false, error: 'User ID or Email is required.' });

        let findType = type === 'nri' ? 'nri' : 'resident';

        const user = await User.findOne({ 
            $and: [
                { type: findType },
                { $or: [{ userid: userId }, { email: userId.toLowerCase().trim() }] }
            ]
        });
        
        if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        await sendPasswordOTPEmail(user, otp);
        res.json({ success: true, message: 'OTP sent to your registered email.' });
    } catch (err) {
        console.error('Forgot Password OTP error:', err);
        res.status(500).json({ success: false, error: 'Server error while sending OTP.' });
    }
});

/**
 * Handles Actual Password Reset
 */
exports.resetPassword = wrap('resetPassword', async (req, res) => {
    try {
        const { userId, otp, newPassword, type } = req.body;
        if (!userId || !otp || !newPassword) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }

        let findType = type === 'nri' ? 'nri' : 'resident';

        const user = await User.findOne({ 
            $and: [
                { type: findType },
                { $or: [{ userid: userId }, { email: userId.toLowerCase().trim() }] },
                { resetPasswordOTP: otp },
                { resetPasswordOTPExpires: { $gt: Date.now() } }
            ]
        });

        if (!user) return res.status(401).json({ success: false, error: 'Invalid or expired OTP.' });

        user.password = newPassword;
        user.generatedPassword = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully. You can now login.' });
    } catch (err) {
        console.error('Reset Password error:', err);
        res.status(500).json({ success: false, error: 'Server error while resetting password.' });
    }
});
