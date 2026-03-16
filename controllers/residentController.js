const { withLogging } = require('../utils/wrapper');
const wrap = (name, handler) => withLogging('resident', name, handler);

// ─── Individual Resident Plan Renderers ──────────────────────────────────────

exports.renderStandardTaxFiling = wrap('renderStandardTaxFiling', (req, res) => res.render('resident/standard-tax-filing'));
exports.renderBusinessProfessional = wrap('renderBusinessProfessional', (req, res) => res.render('resident/business-professional'));
exports.renderPremiumTaxPackage = wrap('renderPremiumTaxPackage', (req, res) => res.render('resident/premium-tax-package'));
exports.renderSalaryEssential = wrap('renderSalaryEssential', (req, res) => res.render('resident/salary-essential'));
exports.renderSalaryAdvanced = wrap('renderSalaryAdvanced', (req, res) => res.render('resident/salary-advanced'));
exports.renderSalaryProfessional = wrap('renderSalaryProfessional', (req, res) => res.render('resident/salary-professional'));
exports.renderSalaryEliteHNI = wrap('renderSalaryEliteHNI', (req, res) => res.render('resident/salary-elite-hni'));
exports.renderCapitalGains = wrap('renderCapitalGains', (req, res) => res.render('resident/capital-gains'));
exports.renderFreelancerGig = wrap('renderFreelancerGig', (req, res) => res.render('resident/freelancer-gig'));
exports.renderBusinessOwner = wrap('renderBusinessOwner', (req, res) => res.render('resident/business-owner'));
exports.renderNRITaxPackage = wrap('renderNRITaxPackage', (req, res) => res.render('resident/nri-tax-package'));
exports.renderGSTRegistration = wrap('renderGSTRegistration', (req, res) => res.render('resident/gst-registration'));
exports.renderGSTReturn = wrap('renderGSTReturn', (req, res) => res.render('resident/gst-return'));
exports.renderTDSReturn = wrap('renderTDSReturn', (req, res) => res.render('resident/tds-return'));
exports.renderNoticeHandling = wrap('renderNoticeHandling', (req, res) => res.render('resident/notice-handling'));
exports.renderNRIResidentCombo = wrap('renderNRIResidentCombo', (req, res) => res.render('resident/nri-resident-combo'));
exports.renderCompleteFamilyPack = wrap('renderCompleteFamilyPack', (req, res) => res.render('resident/complete-family-pack'));
