const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.resolve(__dirname, '../../data/uploads');

async function generateThumbnail(originalPath, width = 400) {
  const relativePath = originalPath.replace('/uploads/', '');
  const fullOriginal = path.join(UPLOAD_DIR, relativePath);

  const dir = path.dirname(fullOriginal).replace(/[\\/]photos[\\/]/g, (match) => match.replace('photos', 'thumbs'));
  fs.mkdirSync(dir, { recursive: true });

  const filename = path.basename(fullOriginal, path.extname(fullOriginal)) + '-thumb.jpg';
  const thumbPath = path.join(dir, filename);

  await sharp(fullOriginal)
    .resize(width, null, { withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(thumbPath);

  return '/uploads/' + path.relative(UPLOAD_DIR, thumbPath).replace(/\\/g, '/');
}

module.exports = { generateThumbnail };
