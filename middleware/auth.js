// Authentication middleware
// Protect routes that require login

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Expires', '-1');
        res.set('Pragma', 'no-cache');
        return next();
    }
    res.redirect('/login');
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.isAdmin) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Expires', '-1');
        res.set('Pragma', 'no-cache');
        return next();
    }
    res.status(403).send('Access denied');
};

module.exports = {
    isAuthenticated,
    isAdmin
};
