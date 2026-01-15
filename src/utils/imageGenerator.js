const Jimp = require('jimp');
const path = require('path');

const overlayQRCode = async (backgroundPath, qrPath, outputPath, options = {}) => {
  const { x = 50, y = 50, scale = 1 } = options;

  const bg = await Jimp.read(backgroundPath);
  const qr = await Jimp.read(qrPath);

  qr.scale(scale);
  bg.composite(qr, x, y);

  await bg.writeAsync(outputPath);
  return outputPath;
};

module.exports = {
  overlayQRCode
};
