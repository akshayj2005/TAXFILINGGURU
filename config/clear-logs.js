const mongoose = require('mongoose');
const RequestLog = require('../models/RequestLog');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taxfilingguru');
        const count = await RequestLog.countDocuments();
        await RequestLog.deleteMany({});
        console.log(`✅ Success: ${count} Request Log entries cleared.`);
    } catch (err) {
        console.error('❌ Error clearing request logs:', err.message);
    } finally {
        process.exit(0);
    }
}
run();
