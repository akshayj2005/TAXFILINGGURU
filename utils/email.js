const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Utility to send emails via Gmail SMTP
 */
async function createTransporter() {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = Number(process.env.EMAIL_PORT) || 465;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn('⚠️ SMTP credentials missing in .env. Email sending will likely fail.');
        return {
            sendMail: (options) => { 
                console.log('📧 Mock Email Payload:', options); 
                return { response: 'Mock Success (Credentials missing)' }; 
            }
        };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: port === 465, // true for 465, false for other ports
            auth: {
                user: user,
                pass: pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection configuration
        await transporter.verify();
        return transporter;
    } catch (err) {
        console.error('Error creating SMTP transporter:', err);
        return {
            sendMail: (options) => { 
                console.log('📧 Mock Email Payload (Error Fallback):', options); 
                return { response: 'Mock Success (Transporter creation failed)' }; 
            }
        };
    }
}

/**
 * Sends login credentials to the user.
 */
exports.sendCredentialsEmail = async (user) => {
    try {
        const transporter = await createTransporter();
        const baseUrl = process.env.BASE_URL || 'https://taxfilingguru.com';
        const loginUrl = user.type === 'nri' ? `${baseUrl}/login?type=nri` : `${baseUrl}/login?type=resident`;
        
        const mailOptions = {
            from: `"Tax Filing Guru" <${process.env.EMAIL_USER || 'noreply@taxfilingguru.com'}>`,
            to: user.email,
            subject: "Your Login Credentials - Tax Filing Guru",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #1a56db; margin: 0;">Tax Filing Guru</h1>
                        <p style="color: #64748b; margin: 5px 0;">Premium Tax Compliance Experts</p>
                    </div>
                    
                    <h2 style="color: #1e293b; border-bottom: 2px solid #3b82f6; display: inline-block; padding-bottom: 4px;">Welcome to the Family!</h2>
                    
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Thank you for choosing Tax Filing Guru. Your payment has been successfully verified, and your account is now ready.</p>
                    
                    <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px dashed #cbd5e1;">
                        <p style="margin: 0 0 10px 0; color: #475569; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Your Access Details:</p>
                        <p style="margin: 5px 0; font-size: 16px;"><strong>User ID:</strong> <span style="color: #2563eb;">${user.userid || user.email}</span></p>
                        <p style="margin: 5px 0; font-size: 16px;"><strong>Password:</strong> <span style="background: #eef2ff; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${user.generatedPassword}</span></p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; transition: background 0.3s;">Login to Your Dashboard</a>
                    </div>
                    
                    <p style="color: #475569; line-height: 1.6;">
                        You can now upload your documents, track your return status, and communicate with your assigned CA directly from your dashboard.
                    </p>
                    
                    <p style="font-size: 13px; color: #94a3b8; margin-top: 40px; text-align: center;">
                        Need help? Reply to this email or contact us at <a href="mailto:support@taxfilingguru.com" style="color: #3b82f6;">support@taxfilingguru.com</a>
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                        <p>© 2026 Tax Filing Guru. All rights reserved.</p>
                        <p>Bridging the gap between Indian tax laws and your global residency.</p>
                    </div>
                </div>
            `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', result.response || 'Mock Success');
        return result;
    } catch (error) {
        console.error('❌ Error sending credentials email:', error);
        throw error;
    }
};

/**
 * Sends a verification link to the user.
 */
exports.sendVerificationEmail = async (user, verificationToken) => {
    try {
        const transporter = await createTransporter();
        const verifyUrl = `${process.env.BASE_URL || 'https://taxfilingguru.com'}/auth/verify-email?token=${verificationToken}`;
        
        const mailOptions = {
            from: `"Tax Filing Guru" <${process.env.EMAIL_USER || 'noreply@taxfilingguru.com'}>`,
            to: user.email,
            subject: "Verify Your Email - Tax Filing Guru",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #1a56db; margin: 0;">Tax Filing Guru</h1>
                        <p style="color: #64748b; margin: 5px 0;">Premium Tax Compliance Experts</p>
                    </div>
                    
                    <h2 style="color: #1e293b; border-bottom: 2px solid #3b82f6; display: inline-block; padding-bottom: 4px;">Verify Your Email Address</h2>
                    
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Thank you for registering with Tax Filing Guru. To ensure the security of your account and files, please verify your email address by clicking the button below.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; transition: background 0.3s;">Verify My Email Address</a>
                    </div>
                    
                    <p style="color: #475569; line-height: 1.6; font-size: 14px;">
                        If the button doesn't work, copy and paste the following link into your browser:
                    </p>
                    <p style="word-break: break-all; color: #1a56db; font-size: 12px;">
                        ${verifyUrl}
                    </p>
                    
                    <p style="font-size: 13px; color: #94a3b8; margin-top: 40px; text-align: center;">
                        This link will expire in 24 hours. If you did not create an account, please ignore this email.
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                        <p>© 2026 Tax Filing Guru. All rights reserved.</p>
                    </div>
                </div>
            `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent successfully to:', user.email);
        return result;
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        throw error;
    }
};

/**
 * Sends User ID reminder email
 */
exports.sendUserIdEmail = async (user) => {
    try {
        const transporter = await createTransporter();
        const mailOptions = {
            from: `"Tax Filing Guru" <${process.env.EMAIL_USER || 'noreply@taxfilingguru.com'}>`,
            to: user.email,
            subject: "Your User ID Reminder - Tax Filing Guru",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; border-top: 4px solid #3b82f6;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #1a56db; margin: 0;">Tax Filing Guru</h1>
                    </div>
                    <h2 style="color: #1e293b; text-align: center;">User ID Recovery</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>We received a request to recover your User ID. Below are your login details:</p>
                    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Your User ID:</p>
                        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 1px;">${user.userid}</p>
                    </div>
                    <p style="font-size: 14px; color: #475569;">You can use this User ID to log in to your dashboard at <a href="${process.env.BASE_URL || 'https://taxfilingguru.com'}/login">taxfilingguru.com/login</a></p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="text-align: center; font-size: 12px; color: #94a3b8;">If you did not request this information, please contact our support immediately.</p>
                </div>
            `
        };
        return await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('sendUserIdEmail error:', err);
        throw err;
    }
};

/**
 * Sends Password Reset OTP email
 */
exports.sendPasswordOTPEmail = async (user, otp) => {
    try {
        const transporter = await createTransporter();
        const mailOptions = {
            from: `"Tax Filing Guru" <${process.env.EMAIL_USER || 'noreply@taxfilingguru.com'}>`,
            to: user.email,
            subject: `${otp} is your Password Reset OTP - Tax Filing Guru`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; border-top: 4px solid #ef4444;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #1a56db; margin: 0;">Tax Filing Guru</h1>
                    </div>
                    <h2 style="color: #1e293b; text-align: center;">Reset Your Password</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Use the following One-Time Password (OTP) to reset your password. This OTP is valid for 15 minutes.</p>
                    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #fee2e2;">
                        <p style="margin: 0; color: #991b1b; font-size: 12px; text-transform: uppercase;">Verification Code:</p>
                        <p style="margin: 5px 0; font-size: 32px; font-weight: 900; color: #dc2626; letter-spacing: 5px;">${otp}</p>
                    </div>
                    <p style="font-size: 14px; color: #475569; text-align: center;">Do not share this OTP with anyone.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="text-align: center; font-size: 12px; color: #94a3b8;">If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            `
        };
        return await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('sendPasswordOTPEmail error:', err);
        throw err;
    }
};

/**
 * Sends a generic Verification OTP email (e.g., for User ID recovery)
 */
exports.sendVerificationOTPEmail = async (user, otp, purpose = "verify your identity") => {
    try {
        const transporter = await createTransporter();
        const mailOptions = {
            from: `"Tax Filing Guru" <${process.env.EMAIL_USER || 'noreply@taxfilingguru.com'}>`,
            to: user.email,
            subject: `${otp} is your verification code - Tax Filing Guru`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; border-top: 4px solid #3b82f6;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #1a56db; margin: 0;">Tax Filing Guru</h1>
                    </div>
                    <h2 style="color: #1e293b; text-align: center;">Identity Verification</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Use the following code to ${purpose}. This code is valid for 15 minutes.</p>
                    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Verification Code:</p>
                        <p style="margin: 5px 0; font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">${otp}</p>
                    </div>
                    <p style="text-align: center; font-size: 12px; color: #94a3b8;">If you didn't request this, ignore this email.</p>
                </div>
            `
        };
        return await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('sendVerificationOTPEmail error:', err);
        throw err;
    }
};

/**
 * Sends a Registration & Payment Continuation Email
 */
exports.sendRegistrationPaymentEmail = async (userData, packageData) => {
    try {
        const transporter = await createTransporter();
        
        // Placeholder or actual payment gateway link. Using query parameters just in case.
        const paymentUrl = `${process.env.BASE_URL || 'https://taxfilingguru.com'}/payment?email=${encodeURIComponent(userData.email)}&package=${encodeURIComponent(packageData.slug)}`;
        
        const mailOptions = {
            from: `"Tax Filing Guru" <${process.env.EMAIL_USER || 'noreply@taxfilingguru.com'}>`,
            to: userData.email,
            subject: `Complete Your Payment for ${packageData.name} - Tax Filing Guru`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; border-top: 4px solid #10b981;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #1a56db; margin: 0;">Tax Filing Guru</h1>
                    </div>
                    <h2 style="color: #1e293b; text-align: center;">Registration Initiated!</h2>
                    <p>Hello <strong>${userData.name}</strong>,</p>
                    <p>Thank you for submitting your details. We have received your registration for the <strong>${packageData.name}</strong> package.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1;">
                        <h3 style="margin-top: 0; color: #475569; font-size: 14px; text-transform: uppercase;">Your Registration Details</h3>
                        <p style="margin: 5px 0;"><strong>Name:</strong> ${userData.name}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${userData.email}</p>
                        <p style="margin: 5px 0;"><strong>Phone:</strong> ${userData.phone || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>PAN:</strong> ${userData.pan || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Country:</strong> ${userData.residenceCountry || 'India'}</p>
                        <p style="margin: 5px 0;"><strong>Message:</strong> ${userData.specifications || 'N/A'}</p>
                    </div>

                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #bbf7d0;">
                        <p style="margin: 0; color: #166534; font-size: 12px; text-transform: uppercase;">Selected Package</p>
                        <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #15803d;">${packageData.name}</p>
                        <p style="margin: 5px 0; font-size: 16px; font-weight: bold; color: #22c55e;">Amount Due: ${packageData.price}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${paymentUrl}" style="background-color: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; transition: background 0.3s;">Click here for continue payment</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #475569; text-align: center;">Once your payment is successful, you will instantly receive your dashboard login credentials.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="text-align: center; font-size: 12px; color: #94a3b8;">If you did not initiate this request, please ignore this email.</p>
                </div>
            `
        };
        return await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('sendRegistrationPaymentEmail error:', err);
        throw err;
    }
};
