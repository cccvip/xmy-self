const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.resolve(__dirname, '../../data/uploads');

async function generateThumbnail(originalPath, width = 400) {
  // originalPath is like /uploads/photos/2026/04/24/filename.jpg
  const relativePath = originalPath.replace(/^\/uploads\//, '');
  const fullOriginal = path.join(UPLOAD_DIR, relativePath);

  // Build thumb path: replace "photos" segment with "thumbs"
  const pathParts = relativePath.split(/[\\/]/);
  const photosIndex = pathParts.indexOf('photos');
  if (photosIndex === -1) {
    throw new Error('Invalid photo path: missing "photos" segment');
  }
  pathParts[photosIndex] = 'thumbs';

  const basename = path.basename(fullOriginal, path.extname(fullOriginal));
  pathParts[pathParts.length - 1] = basename + '-thumb.jpg';

  const thumbRelative = path.join(...pathParts);
  const thumbFullPath = path.join(UPLOAD_DIR, thumbRelative);

  fs.mkdirSync(path.dirname(thumbFullPath), { recursive: true });

  try {
    await sharp(fullOriginal)
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(thumbFullPath);
  } catch (err) {
    // Clean up partial file if it exists
    try {
      fs.unlinkSync(thumbFullPath);
    } catch (_) {
      // ignore cleanup error
    }
    throw new Error(`Thumbnail generation failed: ${err.message}`);
  }

  return '/uploads/' + thumbRelative.replace(/\\/g, '/');
}

module.exports = { generateThumbnail };
