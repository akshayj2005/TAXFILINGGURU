const fs = require('fs');
const path = require('path');

console.log('🔄 Updating all EJS files to use partials...\n');

const viewsDir = path.join(__dirname, 'src', 'views');

// List of all EJS files to update
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

let successCount = 0;
let errorCount = 0;

ejsFiles.forEach(file => {
    const filePath = path.join(viewsDir, file);

    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${file} - File not found, skipping`);
            return;
        }

        console.log(`Processing ${file}...`);

        // Read the file
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 1. Replace header section
        const headerRegex = /<header class="relative w-full[\s\S]*?<\/header>/;
        if (headerRegex.test(content)) {
            content = content.replace(headerRegex, "<%- include('partials/header') %>");
            console.log(`  ✓ Replaced header`);
            modified = true;
        }

        // 2. Replace WhatsApp + Video consultation elements
        const elementsRegex = /<a href="whatsapp:\/\/send\?phone=[\s\S]*?<div id="closeTab"[\s\S]*?<\/div>/;
        if (elementsRegex.test(content)) {
            content = content.replace(elementsRegex, "<%- include('partials/elements') %>");
            console.log(`  ✓ Replaced elements`);
            modified = true;
        }

        // 3. Replace footer section (if exists)
        const footerRegex = /<footer class="w-full bg-gray-900[\s\S]*?<\/footer>/;
        if (footerRegex.test(content)) {
            content = content.replace(footerRegex, "<%- include('partials/footer') %>");
            console.log(`  ✓ Replaced footer`);
            modified = true;
        } else {
            // Add footer before </body> if not present
            const bodyEndRegex = /(\s*)<\/body>/;
            if (bodyEndRegex.test(content) && !content.includes("include('partials/footer')")) {
                content = content.replace(bodyEndRegex, "\n  <%- include('partials/footer') %>\n$1</body>");
                console.log(`  ✓ Added footer`);
                modified = true;
            }
        }

        if (modified) {
            // Write back to file
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${file} - Updated successfully\n`);
            successCount++;
        } else {
            console.log(`⚠️  ${file} - No changes needed\n`);
        }

    } catch (error) {
        console.log(`❌ ${file} - Error: ${error.message}\n`);
        errorCount++;
    }
});

console.log('='.repeat(50));
console.log(`📊 SUMMARY`);
console.log('='.repeat(50));
console.log(`✅ Successfully updated: ${successCount} files`);
console.log(`❌ Errors: ${errorCount} files`);
console.log('='.repeat(50));

if (successCount > 0) {
    console.log('\n✨ All pages now use partials!');
    console.log('\n📝 Partials used:');
    console.log('   <%- include(\'partials/header\') %>');
    console.log('   <%- include(\'partials/elements\') %>');
    console.log('   <%- include(\'partials/footer\') %>');
    console.log('\n🚀 Run "npm start" to test your application!');
}
