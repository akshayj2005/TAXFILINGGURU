const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'views', 'individualpackage.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Regex to match the whatsapp float block
const whatsappRegex = /<a href="whatsapp:\/\/send\?phone=919811945176[\s\S]*?<\/a>/g;
content = content.replace(whatsappRegex, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned individualpackage.ejs');
