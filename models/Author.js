const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        default: 'Expert'
    },
    bio: {
        type: String,
        default: 'Expert at TaxFilingGuru Team.'
    },
    image: {
        type: String,
        default: '/assets/images/TFG_LOGO.png'
    },
    socialLinks: {
        linkedin: String,
        twitter: String,
        website: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Author', authorSchema);
