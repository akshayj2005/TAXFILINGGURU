const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    // Page-based FAQs: 'resident', 'nri', 'home', 'terms', 'privacy'
    // Package-based FAQs: use packageSlug field and set page to 'package'
    page:        { type: String, required: true },   // 'resident' | 'nri' | 'package' | 'home'
    packageSlug: { type: String, default: null },    // set when page === 'package'
    packageName: { type: String, default: null },    // display label
    question:   { type: String, required: true },
    answer:     { type: String, required: true },
    position:   { type: Number, default: 0 },
    isActive:   { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('FAQ', faqSchema);
