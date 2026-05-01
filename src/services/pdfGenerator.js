const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { generateQrCode } = require('./qrCodeService');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

async function generateCertificate(certificateData, language = 'en') {
  const startedAt = Date.now();

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const viewUrl = `${baseUrl}/view/${certificateData.accessToken}`;

  const { qrCodeDataUrl, qrCodeBuffer } = await generateQrCode(viewUrl);

  const outDir = path.join(process.cwd(), 'tmp', 'certificates');
  ensureDirSync(outDir);

  const filename = `certificate-${certificateData.certificateId}.pdf`;
  const filepath = path.join(outDir, filename);

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
  const writeStream = fs.createWriteStream(filepath);
  doc.pipe(writeStream);

  doc.fontSize(10).fillColor('#6b7280').text('CERTIFICATE', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(28).fillColor('#111827').text('Certificate of Completion', { align: 'center' });
  doc.moveDown(1.0);

  doc.fontSize(14).fillColor('#374151').text('This certifies that', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(30).fillColor('#2563eb').text(certificateData.studentName, { align: 'center' });
  doc.moveDown(0.5);

  doc.fontSize(14).fillColor('#374151').text('has successfully completed', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(20).fillColor('#16a34a').text(certificateData.courseTitle, { align: 'center' });
  doc.moveDown(1.0);

  const completionDate = certificateData.completionDate
    ? new Date(certificateData.completionDate)
    : new Date();
  doc.fontSize(12).fillColor('#374151').text(`Completion date: ${completionDate.toDateString()}`, {
    align: 'center'
  });

  doc.fontSize(10).fillColor('#6b7280').text(`Language: ${language}`, { align: 'center' });

  // QR code (bottom-right)
  const qrSize = 110;
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  doc.image(qrCodeBuffer, pageWidth - qrSize - 55, pageHeight - qrSize - 55, {
    width: qrSize,
    height: qrSize
  });
  doc.fontSize(8).fillColor('#6b7280').text('Verify', pageWidth - qrSize - 55, pageHeight - 55, {
    width: qrSize,
    align: 'center'
  });

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  const stat = fs.statSync(filepath);

  return {
    filepath,
    fileSize: stat.size,
    generationTimeMs: Date.now() - startedAt,
    qrCodeUrl: qrCodeDataUrl,
    qrCodeData: viewUrl
  };
}

module.exports = { generateCertificate };

