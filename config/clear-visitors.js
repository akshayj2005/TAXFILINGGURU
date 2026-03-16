const mongoose = require('mongoose');
const Visitor = require('../models/Visitor');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taxfilingguru');
        const count = await Visitor.countDocuments();
        await Visitor.deleteMany({});
        console.log(`✅ Success: ${count} Visitor records cleared.`);
    } catch (err) {
        console.error('❌ Error clearing visitors:', err.message);
    } finally {
        process.exit(0);
    }
}
run();
