const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImage() {
  const inputPath = 'C:\\Users\\Administrateur\\.gemini\\antigravity\\brain\\7b949c7e-9708-4a69-841d-88b9a8d53e7e\\fonelove_pack_crystal_1780149609310.png';
  const outputPath = path.join(__dirname, 'public', 'images', 'fonelove-crystal.webp');
  
  // Ensure directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  try {
    // We will resize it to a reasonable size (e.g. 512x512) and convert to WEBP with high compression
    await sharp(inputPath)
      .resize(512, 512, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    console.log('Image successfully optimized and saved to ' + outputPath);
  } catch (error) {
    console.error('Error optimizing image:', error);
  }
}

optimizeImage();
