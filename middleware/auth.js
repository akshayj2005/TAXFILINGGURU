// Authentication middleware
// Protect routes that require login

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.isAdmin) {
        return next();
    }
    res.status(403).send('Access denied');
};

module.exports = {
    isAuthenticated,
    isAdmin
};
