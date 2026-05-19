import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

async function generate() {
  const sizes = [192, 512, 180] // 180 is for apple-touch-icon
  
  const iconDir = path.join(process.cwd(), 'public', 'icons')
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true })
  }

  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  if (!fs.existsSync(logoPath)) {
    console.error("No logo.png found in public directory.")
    return
  }

  for (const size of sizes) {
    const fileName = size === 180 ? "apple-touch-icon.png" : "icon-" + size + ".png"
    
    await sharp(logoPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(iconDir, fileName))
      
    console.log("Generated " + fileName + " from logo.png")
  }
}

generate().catch(console.error)
