// Utility script to seed initial data or perform database migrations
// Run with: node src/scripts/seed.js

const mongoose = require('mongoose');
const config = require('../config/database');

async function seedDatabase() {
    try {
        await mongoose.connect(config.mongodb.uri, config.mongodb.options);
        console.log('Connected to MongoDB');

        // Add your seed data here
        console.log('Seeding database...');

        // Example:
        // const User = require('../models/User');
        // await User.create({ name: 'Admin', email: 'admin@example.com', password: 'hashed_password', isAdmin: true });

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
