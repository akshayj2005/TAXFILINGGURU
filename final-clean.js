const fs = require('fs');
const path = require('path');

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
    const p = path.join(viewsDir, file);
    let c = fs.readFileSync(p, 'utf8');

    // 1. Remove old footer block if include exists
    if (c.includes("include('partials/footer')")) {
        const footerMatch = c.match(/<footer[\s\S]*?<\/footer>/);
        if (footerMatch) {
            c = c.replace(footerMatch[0], '');
        }
    }

    // 2. Fix all .html links in the remaining content
    Object.keys(linkMap).forEach(oldLink => {
        const newLink = linkMap[oldLink];
        // Replace href="link.html" or href='link.html'
        const regex = new RegExp(`href=(["'])${oldLink.replace('.', '\\.')}(["'])`, 'g');
        c = c.replace(regex, `href=$1${newLink}$2`);
        // Replace href="link.html?..." or href='link.html?...'
        const qRegex = new RegExp(`href=(["'])${oldLink.replace('.', '\\.')}\\?`, 'g');
        c = c.replace(qRegex, `href=$1${newLink}?`);
    });

    fs.writeFileSync(p, c, 'utf8');
});
console.log('Cleanup finished!');
