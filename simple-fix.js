const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs') && f !== 'partials');

console.log(`Cleaning ${files.length} files...`);

files.forEach(file => {
    const p = path.join(viewsDir, file);
    let c = fs.readFileSync(p, 'utf8');

    // Remove old footer
    const footerRegex = /<footer[\s\S]*?<\/footer>/g;
    if (c.includes("include('partials/footer')") && footerRegex.test(c)) {
        c = c.replace(footerRegex, '');
        console.log(`- Removed old footer from ${file}`);
    }

    // Fix .html links
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

    Object.keys(linkMap).forEach(oldLink => {
        const newLink = linkMap[oldLink];
        const regex = new RegExp(`href=["']${oldLink.replace('.', '\\.')}["']`, 'g');
        if (regex.test(c)) {
            c = c.replace(regex, `href="${newLink}"`);
            console.log(`- Fixed ${oldLink} in ${file}`);
        }
    });

    fs.writeFileSync(p, c, 'utf8');
});
console.log('Done!');
