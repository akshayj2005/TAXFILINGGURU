// Database configuration
// Example: MongoDB connection setup

module.exports = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taxfilingguru',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    session: {
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }
};
