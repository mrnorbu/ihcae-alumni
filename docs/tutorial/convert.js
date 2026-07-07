const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertImages() {
  const dir = path.join(__dirname, 'images');
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (file.endsWith('.png')) {
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, file.replace('.png', '.webp'));
      
      try {
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);
          
        // Delete original PNG after successful conversion
        fs.unlinkSync(inputPath);
        console.log(`Converted ${file} to WebP.`);
      } catch (err) {
        console.error(`Error converting ${file}:`, err);
      }
    }
  }
  console.log('Conversion complete!');
}

convertImages();
