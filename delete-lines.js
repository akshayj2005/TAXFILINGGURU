const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'views', 'individualpackage.ejs');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Find the block starting with whatsapp-float
let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('whatsapp-float') && lines[i].includes('<a ')) {
        // Look backwards for the start tag if it's multiline
        let j = i;
        while (j >= 0 && !lines[j].includes('<a ')) j--;
        start = j;

        // Look forwards for the end tag
        let k = i;
        while (k < lines.length && !lines[k].includes('</a>')) k++;
        end = k;
        break;
    }
}

if (start !== -1 && end !== -1) {
    console.log(`Removing lines ${start + 1} to ${end + 1}`);
    lines.splice(start, end - start + 1);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
} else {
    console.log('Could not find whatsapp-float block');
}
