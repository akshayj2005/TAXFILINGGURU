const mongoose = require('mongoose');
const Interaction = require('../models/Interaction');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taxfilingguru');
        const count = await Interaction.countDocuments();
        await Interaction.deleteMany({});
        console.log(`✅ Success: ${count} Interaction records cleared.`);
    } catch (err) {
        console.error('❌ Error clearing interactions:', err.message);
    } finally {
        process.exit(0);
    }
}
run();
