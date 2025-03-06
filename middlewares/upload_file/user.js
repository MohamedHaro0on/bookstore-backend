import path from 'path';
import fs from "fs"
import multer from 'multer';

// Ensure uploads directory exists
const __dirname = process.cwd();
const uploadsDir = path.join(__dirname, 'public/users/');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}



// More detailed storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir) // Use the absolute path
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});


// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 5MB file size limit
    },
    fileFilter: (req, file, cb) => {
        // File type validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
        }
    }
});

export default upload;