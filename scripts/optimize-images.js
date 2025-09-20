const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Büyük resimleri optimize et
async function optimizeImages() {
  const publicDir = path.join(__dirname, '../public');
  const images = [
    'modern-pharmaceutical-manufacturing-facility-with-.png',
    'return-management.png',
    'cargo-delivery.png',
    'cosmetic-packaging-mockup.png',
    'order-packaging.png',
    'cargo-stock.png',
    'modern-chemical-manufacturing-facility-with-large-.png',
    'cosmetic-instagram-campaign.png',
    'modern-manufacturing-facility-with-advanced-equipm.png'
  ];

  for (const imageName of images) {
    const inputPath = path.join(publicDir, imageName);
    const outputPath = path.join(publicDir, 'optimized', imageName.replace('.png', '.webp'));
    
    if (fs.existsSync(inputPath)) {
      try {
        await sharp(inputPath)
          .resize(1200, 800, { 
            fit: 'cover',
            withoutEnlargement: true
          })
          .webp({ 
            quality: 85,
            effort: 6
          })
          .toFile(outputPath);
        
        console.log(`✅ Optimized: ${imageName} -> ${path.basename(outputPath)}`);
      } catch (error) {
        console.error(`❌ Error optimizing ${imageName}:`, error.message);
      }
    }
  }
}

// PNG dosyalarını da optimize et
async function optimizePNGs() {
  const publicDir = path.join(__dirname, '../public');
  const images = [
    'modern-pharmaceutical-manufacturing-facility-with-.png',
    'return-management.png',
    'cargo-delivery.png',
    'cosmetic-packaging-mockup.png',
    'order-packaging.png'
  ];

  for (const imageName of images) {
    const inputPath = path.join(publicDir, imageName);
    const outputPath = path.join(publicDir, 'optimized', imageName);
    
    if (fs.existsSync(inputPath)) {
      try {
        await sharp(inputPath)
          .resize(1200, 800, { 
            fit: 'cover',
            withoutEnlargement: true
          })
          .png({ 
            quality: 85,
            compressionLevel: 9
          })
          .toFile(outputPath);
        
        console.log(`✅ Compressed PNG: ${imageName}`);
      } catch (error) {
        console.error(`❌ Error compressing ${imageName}:`, error.message);
      }
    }
  }
}

module.exports = { optimizeImages, optimizePNGs };

if (require.main === module) {
  // Optimized klasörünü oluştur
  const optimizedDir = path.join(__dirname, '../public/optimized');
  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
  }
  
  optimizeImages().then(() => optimizePNGs());
}