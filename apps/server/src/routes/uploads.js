const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateThumbnail } = require('../utils/thumbnail');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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
  upload.single('photo')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large (max 50MB)' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const filePath = req.file.path.replace(UPLOAD_DIR, '/uploads').replace(/\\/g, '/');
      const thumbPath = await generateThumbnail(filePath, 400);

      const record = await prisma.record.create({
        data: {
          type: 'photo',
          recordDate: new Date(),
        },
      });

      const photo = await prisma.photo.create({
        data: {
          recordId: record.id,
          originalPath: filePath,
          thumbPath: thumbPath,
          fileSize: req.file.size,
        },
      });

      res.json({
        success: true,
        photoId: photo.id,
        recordId: record.id,
        filePath,
        thumbPath,
        originalName: req.file.originalname,
      });
    } catch (err) {
      next(err);
    }
  });
});

module.exports = router;
