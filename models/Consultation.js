const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Free Consultation', 'Video Consultation'],
        required: true
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    // Fields specifically for Video Consultation
    name: { type: String },
    email: { type: String },
    mobile: { type: String },
    duration: { type: Number },
    amount: { type: String },
    status: {
        type: String,
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Consultation', ConsultationSchema);
