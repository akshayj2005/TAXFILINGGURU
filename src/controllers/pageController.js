// Page controllers
// Handle rendering of EJS pages

exports.renderHome = (req, res) => {
    res.render('index', { title: 'Tax Filing Guru - Home' });
};

exports.renderAbout = (req, res) => {
    res.render('about', { title: 'About Us - Tax Filing Guru' });
};

exports.renderContact = (req, res) => {
    res.render('contact', { title: 'Contact Us - Tax Filing Guru' });
};

exports.renderLogin = (req, res) => {
    res.render('login', { title: 'Login - Tax Filing Guru' });
};

exports.renderNRI = (req, res) => {
    res.render('nri', { title: 'NRI Tax Services - Tax Filing Guru' });
};

exports.renderTools = (req, res) => {
    res.render('tools', { title: 'Tax Tools - Tax Filing Guru' });
};

exports.renderPrivacy = (req, res) => {
    res.render('privacy', { title: 'Privacy Policy - Tax Filing Guru' });
};

exports.renderTerms = (req, res) => {
    res.render('terms', { title: 'Terms & Conditions - Tax Filing Guru' });
};

exports.renderRegistration = (req, res) => {
    res.render('reg', { title: 'Register - Tax Filing Guru' });
};

exports.renderRefundMaximizer = (req, res) => {
    res.render('refund-maximizer', { title: 'Refund Maximizer - Tax Filing Guru' });
};

exports.renderRegimeComparison = (req, res) => {
    res.render('regime-comparison', { title: 'Tax Regime Comparison - Tax Filing Guru' });
};

exports.renderIndividualPackage = (req, res) => {
    res.render('individualpackage', { title: 'Individual Packages - Tax Filing Guru' });
};
