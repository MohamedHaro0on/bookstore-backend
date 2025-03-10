import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import multer from 'multer';

const UploadFile = (fieldName, dirName) => {
  // Ensure the uploads directory exists
  const __dirname = process.cwd();
  const uploadsDir = path.join(__dirname, `public/${dirName}/`);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, {recursive: true});
  }

  // Storage configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });

  // Multer configuration
  const upload = multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024 * 1024 * 1024 // 10MB file size limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
      }
    }
  });

  // Return the middleware
  return upload.single(fieldName);
};

export default UploadFile;
