const { withLogging } = require('../utils/wrapper');
const wrap = (name, handler) => withLogging('nri', name, handler);

exports.renderNRILanding = wrap('renderNRI', (req, res) => res.render('pages/nri'));

// ─── Individual NRI Plan Renderers ───────────────────────────────────────────

exports.renderBasicNriFiling = wrap('renderBasicNriFiling', (req, res) => res.render('nri/basic-nri-filing'));
exports.renderStandardNriFiling = wrap('renderStandardNriFiling', (req, res) => res.render('nri/standard-nri-filing'));
exports.renderAdvancedNriTaxSolution = wrap('renderAdvancedNriTaxSolution', (req, res) => res.render('nri/advanced-nri-tax-solution'));
exports.renderNriResidentCombo = wrap('renderNriResidentCombo', (req, res) => res.render('nri/nri-resident-combo'));
exports.renderCompleteFamilyPack = wrap('renderCompleteFamilyPack', (req, res) => res.render('nri/complete-family-pack'));
exports.renderGstRegistration = wrap('renderGstRegistration', (req, res) => res.render('nri/gst-registration'));
exports.renderGstReturn = wrap('renderGstReturn', (req, res) => res.render('nri/gst-return'));
exports.renderTdsReturn = wrap('renderTdsReturn', (req, res) => res.render('nri/tds-return'));
exports.renderNoticeHandling = wrap('renderNoticeHandling', (req, res) => res.render('nri/notice-handling'));
