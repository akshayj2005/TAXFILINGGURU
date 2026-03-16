const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'uploads', 'blogs');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
    console.log('Directory created:', dir);
} else {
    console.log('Directory already exists:', dir);
}
