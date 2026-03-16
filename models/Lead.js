const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    country: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    source: { type: String, default: 'Contact Form' }, // e.g., 'Contact Page', 'Footer Form'
    status: { 
        type: String, 
        enum: ['New', 'Contacted', 'In Progress', 'Closed', 'Archived'], 
        default: 'New' 
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
