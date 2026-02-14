const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'views', 'individualpackage.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Use a regex that is very loose on whitespace
const regex = /<a\s+href="whatsapp:\/\/send\?phone=919811945176[\s\S]*?class="whatsapp-float"[\s\S]*?<\/a>/g;
const newContent = content.replace(regex, '');

if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Successfully removed redundant WhatsApp from individualpackage.ejs');
} else {
    console.log('Redundant WhatsApp not found or already removed');
}
