const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    userid: { // Store the explicit user ID for easier tracking
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    generatedPassword: { // Plain text version for initial access / admin view
        type: String
    },
    phone: {
        type: String,
        trim: true
    },
    pan: {
        type: String,
        trim: true
    },
    specifications: {
        type: String,
        trim: true
    },
    residenceCountry: {
        type: String,
        trim: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['resident', 'nri', 'global'],
        default: 'resident'
    },
    packages: [{
        name: String,
        slug: String,
        price: String,
        chosenAt: { type: Date, default: Date.now }
    }],
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    resetPasswordOTP: String,
    resetPasswordOTPExpires: Date,
    profileImage: String,
    invoiceNumber: String,
    tempOTP: String,
    tempOTPExpires: Date,
    documents: [{
        docType: { type: String, enum: ['form16', 'aadhaar_front', 'aadhaar_back', 'pan', 'tds', 'others'], default: 'others' },
        label: String, // Specifically for 'others' or optional descriptions
        filename: String,
        path: String,
        originalName: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now }
    }],
    requestTestimonial: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
userSchema.pre('save', async function (next) {
    this.updatedAt = Date.now();
    
    // Hash password if modified
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    
    // Ensure email is lowercase
    if (this.email) this.email = this.email.toLowerCase();
    
    // Set userid to email if not set
    if (!this.userid) this.userid = this.email;
    
    next();
});

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
