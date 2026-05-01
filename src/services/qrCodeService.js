const QRCode = require('qrcode');

async function generateQrCode(data, options = {}) {
  const qrOptions = {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320,
    ...options
  };

  const [qrCodeDataUrl, qrCodeBuffer] = await Promise.all([
    QRCode.toDataURL(data, qrOptions),
    QRCode.toBuffer(data, { ...qrOptions, type: 'png' })
  ]);

  return { qrCodeData: data, qrCodeDataUrl, qrCodeBuffer };
}

module.exports = { generateQrCode };

