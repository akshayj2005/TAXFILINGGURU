const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing ALL .html links to proper Express routes...\n');

const viewsDir = path.join(__dirname, 'src', 'views');

// Map of all .html links to their Express route equivalents
const linkMap = {
    'index.html': '/',
    '/index.html': '/',
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

// List of all EJS files
const ejsFiles = [
    'index.ejs',
    'about.ejs',
    'contact.ejs',
    'login.ejs',
    'nri.ejs',
    'tools.ejs',
    'privacy.ejs',
    'terms.ejs',
    'reg.ejs',
    'refund-maximizer.ejs',
    'regime-comparison.ejs',
    'individualpackage.ejs'
];

let totalChanges = 0;
let filesModified = 0;

ejsFiles.forEach(file => {
    const filePath = path.join(viewsDir, file);

    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${file} - File not found, skipping`);
            return;
        }

        console.log(`\n📄 Processing ${file}...`);

        // Read the file
        let content = fs.readFileSync(filePath, 'utf8');
        let fileChanges = 0;

        // Replace all .html links
        Object.keys(linkMap).forEach(oldLink => {
            const newLink = linkMap[oldLink];

            // Match href="oldLink" and href='oldLink'
            const regex1 = new RegExp(`href="${oldLink}"`, 'g');
            const regex2 = new RegExp(`href='${oldLink}'`, 'g');

            const count1 = (content.match(regex1) || []).length;
            const count2 = (content.match(regex2) || []).length;

            if (count1 > 0 || count2 > 0) {
                content = content.replace(regex1, `href="${newLink}"`);
                content = content.replace(regex2, `href='${newLink}'`);
                const totalCount = count1 + count2;
                console.log(`  ✓ ${oldLink} → ${newLink} (${totalCount} occurrences)`);
                fileChanges += totalCount;
            }
        });

        // Also fix query string references in JavaScript
        // e.g., "login.html?type=nri" → "/login?type=nri"
        Object.keys(linkMap).forEach(oldLink => {
            if (oldLink.includes('/')) return; // Skip already absolute paths
            const newLink = linkMap[oldLink];

            // Match "oldLink?" for query strings
            const regex = new RegExp(`"${oldLink}\\?`, 'g');
            const count = (content.match(regex) || []).length;

            if (count > 0) {
                content = content.replace(regex, `"${newLink}?`);
                console.log(`  ✓ ${oldLink}? → ${newLink}? (${count} occurrences in JS)`);
                fileChanges += count;
            }
        });

        if (fileChanges > 0) {
            // Write back to file
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${file} - ${fileChanges} links fixed`);
            filesModified++;
            totalChanges += fileChanges;
        } else {
            console.log(`✓ ${file} - No changes needed`);
        }

    } catch (error) {
        console.log(`❌ ${file} - Error: ${error.message}`);
    }
});

console.log('\n' + '='.repeat(60));
console.log(`📊 SUMMARY`);
console.log('='.repeat(60));
console.log(`✅ Files modified: ${filesModified}`);
console.log(`🔗 Total links fixed: ${totalChanges}`);
console.log('='.repeat(60));

if (totalChanges > 0) {
    console.log('\n✨ All .html links have been converted to Express routes!');
    console.log('\n🚀 Your application is ready. Run "npm start" to test!');
    console.log('\n📝 All navigation should now work perfectly.');
}
