const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String, // e.g., "Business Owner", "NRI Client"
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5
    },
    image: {
        type: String, // Optional user image
        default: null
    },
    isApproved: {
        type: Boolean,
        default: false // Admin must approve before showing on homepage
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
