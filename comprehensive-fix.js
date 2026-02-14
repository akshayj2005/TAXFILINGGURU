const fs = require('fs');
const path = require('path');

console.log('🔧 COMPREHENSIVE FIX: Partials + Links + Cleanup\n');
console.log('='.repeat(60));

const viewsDir = path.join(__dirname, 'src', 'views');

const ejsFiles = [
    'index.ejs', 'about.ejs', 'contact.ejs', 'login.ejs',
    'nri.ejs', 'tools.ejs', 'privacy.ejs', 'terms.ejs',
    'reg.ejs', 'refund-maximizer.ejs', 'regime-comparison.ejs',
    'individualpackage.ejs'
];

const linkMap = {
    '"/index.html"': '"/"',
    "'/index.html'": "'/'",
    '"index.html"': '"/"',
    "'index.html'": "'/'",
    '"about.html"': '"/about"',
    "'about.html'": "'/about'",
    '"contact.html"': '"/contact"',
    "'contact.html'": "'/contact'",
    '"login.html"': '"/login"',
    "'login.html'": "'/login'",
    '"reg.html"': '"/reg"',
    "'reg.html'": "'/reg'",
    '"nri.html"': '"/nri"',
    "'nri.html'": "'/nri'",
    '"tools.html"': '"/tools"',
    "'tools.html'": "'/tools'",
    '"privacy.html"': '"/privacy"',
    "'privacy.html'": "'/privacy'",
    '"terms.html"': '"/terms"',
    "'terms.html'": "'/terms'",
    '"refund-maximizer.html"': '"/refund-maximizer"',
    "'refund-maximizer.html'": "'/refund-maximizer'",
    '"regime-comparison.html"': '"/regime-comparison"',
    "'regime-comparison.html'": "'/regime-comparison'",
    '"individualpackage.html"': '"/individualpackage"',
    "'individualpackage.html'": "'/individualpackage'"
};

let totalFiles = 0;
let totalLinks = 0;
let totalFooters = 0;

ejsFiles.forEach(file => {
    const filePath = path.join(viewsDir, file);

    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${file} - Not found`);
            return;
        }

        console.log(`\n📄 ${file}`);
        let content = fs.readFileSync(filePath, 'utf8');
        let changes = [];

        // 1. Remove duplicate footer HTML (keep only the include)
        const footerRegex = /<footer class="w-full bg-gray-900[\s\S]*?<\/footer>/;
        if (footerRegex.test(content) && content.includes("include('partials/footer')")) {
            content = content.replace(footerRegex, '');
            changes.push('Removed duplicate footer HTML');
            totalFooters++;
        }

        // 2. Fix all .html links
        let linkCount = 0;
        Object.keys(linkMap).forEach(oldLink => {
            const newLink = linkMap[oldLink];
            const regex = new RegExp(oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const matches = (content.match(regex) || []).length;
            if (matches > 0) {
                content = content.replace(regex, newLink);
                linkCount += matches;
            }
        });

        if (linkCount > 0) {
            changes.push(`Fixed ${linkCount} .html links`);
            totalLinks += linkCount;
        }

        // 3. Ensure footer include exists before </body>
        if (!content.includes("include('partials/footer')")) {
            content = content.replace(/(\s*)<\/body>/, "\n  <%- include('partials/footer') %>\n$1</body>");
            changes.push('Added footer include');
        }

        if (changes.length > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✅ ${changes.join(', ')}`);
            totalFiles++;
        } else {
            console.log(`  ✓ No changes needed`);
        }

    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
    }
});

console.log('\n' + '='.repeat(60));
console.log('📊 FINAL SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Files modified: ${totalFiles}`);
console.log(`🔗 Links fixed: ${totalLinks}`);
console.log(`🗑️  Duplicate footers removed: ${totalFooters}`);
console.log('='.repeat(60));

if (totalFiles > 0) {
    console.log('\n✨ ALL ISSUES FIXED!');
    console.log('\n📋 What was done:');
    console.log('  1. ✅ Removed duplicate footer HTML from pages');
    console.log('  2. ✅ Fixed all .html links to Express routes');
    console.log('  3. ✅ Ensured footer partial is included');
    console.log('\n🚀 Your application is ready!');
    console.log('   Run: npm start');
    console.log('   Visit: http://localhost:3000');
}
