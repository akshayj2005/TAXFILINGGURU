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
    country: { type: String },
    duration: { type: Number },
    amount: { type: String },
    status: {
        type: String,
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    }
}, { timestamps: true });

ConsultationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Consultation', ConsultationSchema);
