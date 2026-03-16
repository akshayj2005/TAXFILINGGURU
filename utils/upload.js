const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure base upload directory exists
const baseDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!req.user) return cb(new Error('Unauthorized'));
        
        // Use sanitized name or userid as folder name
        const folderName = (req.user.name || req.user.userid || 'unknown').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const userDir = path.join(baseDir, folderName);
        
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        // user-document type
        // We get docType from req.body (will be passed along with the file)
        const docType = req.body.docType || 'others';
        const sanitizedUserName = (req.user.name || 'user').split(' ')[0].toLowerCase().replace(/[^a-z0-9]/gi, '_');
        
        const ext = path.extname(file.originalname);
        
        // Format: user-docType.ext (Removed timestamp as requested)
        cb(null, `${sanitizedUserName}-${docType}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, JPG, and PNG files are allowed!'));
        }
    }
});

module.exports = upload;
