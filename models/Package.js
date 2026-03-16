const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['resident', 'nri', 'global', 'global-services'] },
    heading: { type: String, required: true }, // The main category title (e.g., 'Individual Packages')
    subheading: { type: String }, // The descriptive text below the heading
    shortDescription: { type: String }, // Small text on the card itself
    price: { type: String, required: true },
    originalPrice: { type: String },
    priceSuffix: { type: String }, // e.g., '/ Filing', '+ GST'
    discountBadge: { type: String }, // e.g., '50% OFF'
    badge: { type: String }, // e.g., 'Recommended', 'Most Popular'
    badgeClass: { type: String },
    icon: { type: String }, // Stores SVG icons for index services
    highlight: { type: String }, // e.g., 'Tax Optimisation'
    features: [{ type: String }],
    bestFor: { type: String },
    position: { type: Number, default: 0 },
    faqs: [{
        question: { type: String },
        answer: { type: String }
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);

