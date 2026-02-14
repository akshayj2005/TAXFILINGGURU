const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'fix-progress.txt');
fs.writeFileSync(logFile, 'Starting fix...\n');

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

log('🔧 ROBUST CLEANUP STARTING');

const viewsDir = path.join(__dirname, 'src', 'views');
const ejsFiles = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs') && f !== 'partials');

const linkMap = {
    'index.html': '/',
    'about.html': '/about',
    'contact.html': '/contact',
    'login.html': '/login',
    'reg.html': '/reg',
    'nri.html': '/nri',
    'tools.html': '/tools',
    'privacy.html': '/privacy',
    'terms.html': '/terms',
    'refund-maximizer.html': '/refund-maximizer',
    'regime-comparison.html': '/regime-comparison',
    'individualpackage.html': '/individualpackage'
};

ejsFiles.forEach(file => {
    const filePath = path.join(viewsDir, file);
    log(`\nProcessing ${file}...`);

    let content = fs.readFileSync(filePath, 'utf8');
    let originalLength = content.length;

    // 1. Remove redundancy: Header (if duplicated)
    content = content.replace(/<header[\s\S]*?<\/header>/g, (match) => {
        if (content.includes("include('partials/header')")) return '';
        return match;
    });

    // 2. Remove redundancy: Elements (WhatsApp/Booking)
    // Looking for specific markers that indicate redundancy
    const whatsappMarker = 'whatsapp-float';
    const bookingMarker = 'vcOpenBooking';
    if (content.includes("include('partials/elements')")) {
        // Find and remove the old WhatsApp link
        content = content.replace(/<a[^>]*whatsapp-float[^>]*>[\s\S]*?<\/a>/g, '');
        // Find and remove booking overlay, tabs
        content = content.replace(/<div[^>]*rightTab[^>]*>[\s\S]*?<\/div>/g, '');
        content = content.replace(/<div[^>]*bookingOverlay[^>]*>[\s\S]*?<\/div>/g, '');
        content = content.replace(/<div[^>]*closeTab[^>]*>[\s\S]*?<\/div>/g, '');
    }

    // 3. Remove redundancy: Footer
    const footerIncludeFound = content.includes("include('partials/footer')");
    content = content.replace(/<footer[\s\S]*?<\/footer>/g, (match) => {
        if (footerIncludeFound) {
            log('  🗑️ Removed duplicate footer');
            return '';
        }
        return match;
    });

    // 4. Fix ALL .html links in the remaining content
    Object.keys(linkMap).forEach(oldLink => {
        const newLink = linkMap[oldLink];
        // Replace with boundaries to avoid catching substrings like nri.html.bak
        const regex = new RegExp(`(href=["'])${oldLink.replace('.', '\\.')}(["'])`, 'g');
        content = content.replace(regex, `$1${newLink}$2`);

        // Also catch links with query params
        const queryRegex = new RegExp(`(href=["'])${oldLink.replace('.', '\\.')}\\?`, 'g');
        content = content.replace(queryRegex, `$1${newLink}?`);
    });

    // 5. Cleanup extra scripts if already in footer or head
    // (Optional: can be aggressive, but let's stick to obvious stuff)

    if (content.length !== originalLength) {
        fs.writeFileSync(filePath, content, 'utf8');
        log(`  ✅ Modified (Saved ${originalLength - content.length} bytes)`);
    } else {
        log('  ✓ No changes needed');
    }
});

log('\n✨ CLEANUP COMPLETE');
