const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImagePath = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public/icons');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating icons from', inputImagePath);
  
  for (const size of sizes) {
    try {
      // General PWA icon
      await sharp(inputImagePath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
        
      console.log(`Generated icon-${size}x${size}.png`);
      
      if (size === 192) {
        // Create duplicate for manifest that uses just -192.png
        fs.copyFileSync(
          path.join(outputDir, `icon-192x192.png`),
          path.join(outputDir, `icon-192.png`)
        );
        console.log(`Copied to icon-192.png`);
      }
      
      if (size === 512) {
        fs.copyFileSync(
          path.join(outputDir, `icon-512x512.png`),
          path.join(outputDir, `icon-512.png`)
        );
        
        // Also maskable icon (often with some padding, but for now we just resize)
        await sharp(inputImagePath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 249, g: 245, b: 240, alpha: 1 } // #f9f5f0 background
          })
          .toFile(path.join(outputDir, `maskable-icon-512x512.png`));
        console.log(`Generated maskable-icon-512x512.png`);
      }
      
      if (size === 16 || size === 32) {
        fs.copyFileSync(
          path.join(outputDir, `icon-${size}x${size}.png`),
          path.join(outputDir, `favicon-${size}x${size}.png`)
        );
        console.log(`Copied to favicon-${size}x${size}.png`);
      }
    } catch (err) {
      console.error(`Error generating ${size}x${size}:`, err);
    }
  }

  // Apple touch icon (180x180)
  try {
    await sharp(inputImagePath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(path.join(outputDir, `apple-touch-icon.png`));
    console.log(`Generated apple-touch-icon.png`);
  } catch (err) {
    console.error('Error generating apple-touch-icon:', err);
  }
  
  // Favicon.ico
  // We'll just generate a 32x32 ico
  try {
    // Sharp doesn't support writing .ico directly easily, we will just copy a 32x32 png as fallback 
    // or keep the current favicon.ico (it's best to keep the existing if sharp fails, or rename a 32x32)
    fs.copyFileSync(
      path.join(outputDir, `favicon-32x32.png`),
      path.join(__dirname, '../public/favicon.ico')
    );
    console.log('Overwrote public/favicon.ico with 32x32 logo');
  } catch(e) {
    console.log('Error writing favicon.ico', e);
  }

  console.log('All icons generated successfully!');
}

generateIcons();
