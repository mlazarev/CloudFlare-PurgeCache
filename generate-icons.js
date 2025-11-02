// Simple icon generator script
// Run: node generate-icons.js
// Requires: npm install sharp

const sharp = require('sharp');
const fs = require('fs');

const sizes = [16, 48, 128];
const svgBuffer = fs.readFileSync('icon.svg');

async function generateIcons() {
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`icon${size}.png`);
    console.log(`Generated icon${size}.png`);
  }
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
