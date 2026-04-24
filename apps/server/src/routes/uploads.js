const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const UPLOAD_DIR = path.resolve(__dirname, '../../data/uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const today = new Date();
    const dir = path.join(UPLOAD_DIR, 'photos', String(today.getFullYear()), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0'));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

router.post('/photo', (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large (max 50MB)' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
      success: true,
      originalName: req.file.originalname,
      filePath: req.file.path.replace(UPLOAD_DIR, '/uploads').replace(/\\/g, '/'),
    });
  });
});

module.exports = router;
