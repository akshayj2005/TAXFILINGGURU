const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
    visitorId: { type: String, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true }, // e.g., 'whatsapp_click'
    category: String, // e.g., 'floating_button', 'booking_modal', 'consultation'
    text: String, // The message content or button text
    path: String, // Page where it happened
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Interaction', InteractionSchema);
