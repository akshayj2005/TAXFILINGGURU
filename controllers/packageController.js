const Package = require('../models/Package');
const FAQ = require('../models/FAQ');
const { withLogging } = require('../utils/wrapper');

const wrap = (module, name, handler) => withLogging(module, name, handler);

/**
 * Groups packages by heading and extracts subheadings.
 */
function groupPackages(packages) {
    const grouped = {};
    const subheadings = {};

    packages.forEach(pkg => {
        if (!grouped[pkg.heading]) {
            grouped[pkg.heading] = [];
            subheadings[pkg.heading] = pkg.subheading;
        }
        grouped[pkg.heading].push(pkg);
    });

    return { grouped, subheadings };
}

/**
 * Renders the resident packages list (individualpackage.ejs).
 */
exports.renderResidentList = wrap('package', 'renderResidentList', async (req, res) => {
    const packages = await Package.find({
        type: { $in: ['resident', 'global'] },
        isActive: true,
        slug: { $nin: ['TaxNotice', 'AdvanceTaxCalculation', 'TaxConsultation', 'GSTCompliance',
                       'video-consultation-45', 'video-consultation-90', 'FreeConsultation'] }
    }).sort('position');

    const rawFaqs = await FAQ.find({ page: 'resident', isActive: true }).sort('position');
    const globalFaqs = await FAQ.find({ page: 'global', isActive: true }).sort('position');
    const combinedFaqs = [...rawFaqs, ...globalFaqs];
    
    // Deduplicate by question to prevent double FAQs from showing
    const seen = new Set();
    const residentFaqs = combinedFaqs.filter(f => {
        const key = f.question.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const { grouped, subheadings } = groupPackages(packages);

    res.render('pages/resident', {
        groupedPackages: grouped,
        categorySubheadings: subheadings,
        pageFaqs: residentFaqs,
        seo: {
            ...res.locals.seo,
            headings: { h1: 'Expert Tax Filing for Resident Indians' },
            description: "Maximize your refunds with India's most trusted CA-assisted tax filing platform. Accurate, secure, and hassle-free."
        }
    });
});

/**
 * Renders the NRI packages list (nri.ejs).
 */
exports.renderNRIList = wrap('package', 'renderNRIList', async (req, res) => {
    const packages = await Package.find({
        type: { $in: ['nri', 'global'] },
        isActive: true,
        slug: { $nin: ['TaxNotice', 'AdvanceTaxCalculation', 'TaxConsultation', 'GSTCompliance',
                       'video-consultation-45', 'video-consultation-90', 'FreeConsultation'] }
    }).sort('position');

    const rawFaqs = await FAQ.find({ page: 'nri', isActive: true }).sort('position');
    const globalFaqs = await FAQ.find({ page: 'global', isActive: true }).sort('position');
    const combinedFaqs = [...rawFaqs, ...globalFaqs];

    // Deduplicate by question to prevent double FAQs from showing
    const seenNri = new Set();
    const nriFaqs = combinedFaqs.filter(f => {
        const key = f.question.trim().toLowerCase();
        if (seenNri.has(key)) return false;
        seenNri.add(key);
        return true;
    });

    const { grouped, subheadings } = groupPackages(packages);

    res.render('pages/nri', {
        groupedPackages: grouped,
        categorySubheadings: subheadings,
        pageFaqs: nriFaqs,
        seo: {
            ...res.locals.seo,
            headings: { h1: 'Expert NRI Tax Compliance Specialists' },
            description: 'Bridging the gap between Indian tax laws and your global residency status with precision and reliability.'
        }
    });
});


const fs = require('fs');
const path = require('path');

/**
 * Generates a stub view file for a package in its type folder.
 * This allows the package to have its own URL structure while
 * still using DB-driven data via packages/detail.ejs
 */
exports.generatePackageView = function(pkg) {
    // Determine which folders need stubs based on type
    let folders = [pkg.type];
    
    // If global, it should be available in both categories
    if (pkg.type === 'global') {
        folders = ['resident', 'nri', 'global'];
    }

    folders.forEach(folder => {
        const typeFolder = path.join(__dirname, '../views', folder);
        if (!fs.existsSync(typeFolder)) {
            fs.mkdirSync(typeFolder, { recursive: true });
        }
        
        const filePath = path.join(typeFolder, `${pkg.slug}.ejs`);
        
        // Only create if doesn't exist — never overwrite custom views
        if (!fs.existsSync(filePath)) {
            // This stub just passes through to the universal detail template
            // We use '../packages/detail' because we are inside a subfolder of 'views'
            const stub = `<%# Auto-generated stub for package: ${pkg.name} (${pkg.slug}) %>
<%# All content is loaded from DB via the pkg variable passed by the controller %>
<%- include('../packages/detail') %>
`;
            fs.writeFileSync(filePath, stub, 'utf-8');
            console.log(`✅ Auto-generated view: views/${folder}/${pkg.slug}.ejs`);
        }
    });
};

/**
 * Renders the detailed view of a single package — fully DB-driven.
 * URL type prefix is used for context only; the slug is the source of truth.
 */
exports.renderPackageDetail = wrap('package', 'renderPackageDetail', async (req, res) => {
    const { slug } = req.params;

    // Find by slug across all active packages
    const pkg = await Package.findOne({ slug, isActive: true });

    if (!pkg) {
        return res.status(404).render('pages/404');
    }

    // Ensure the view stub exists (auto-creates if missing)
    exports.generatePackageView(pkg);

    // For package pages, we combine package-specific FAQs with global ones
    let pageFaqs = [];
    try {
        const globalFaqs = await FAQ.find({ page: 'global', isActive: true }).sort('position');
        const pkgFaqs = (pkg.faqs || []).map(f => ({ question: f.question, answer: f.answer }));
        
        const combined = [...pkgFaqs, ...globalFaqs];
        const seen = new Set();
        pageFaqs = combined.filter(f => {
            if (!f.question) return false;
            const key = f.question.trim().toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    } catch (err) {
        console.error('Error loading FAQs for package detail:', err);
    }

    // Always render the universal, DB-driven detail template
    res.render('packages/detail', {
        pkg,
        pageFaqs,
        seo: {
            ...res.locals.seo,
            title: `${pkg.name} - Tax Filing Guru`,
            headings: { h1: pkg.name },
            description: pkg.shortDescription || pkg.subheading
        }
    });
});
