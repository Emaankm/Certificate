const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const qrCodeService = require('./qrCodeService');
const logger = require('../utils/logger');
const templateManager = require('../templates/templateManager');

class PDFGenerator {
  /**
   * Generate certificate PDF
   * @param {Object} certificateData
   * @param {String} language
   * @returns {Object} {filename, filepath, qrCodeUrl, qrCodeData, fileSize, generationTimeMs}
   */
  async generateCertificate(certificateData, language = 'en') {
    const startTime = Date.now();

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const filename = `${certificateData.certificateId}.pdf`;
    const filepath = path.join(__dirname, '../../storage/temp', filename);
    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    try {
      // Load template content
      const template = templateManager.getTemplate(language);

      // Background
      if (template.background) {
        doc.image(template.background, 0, 0, { width: doc.page.width, height: doc.page.height });
      }

      // Add certificate text
      doc.font(template.font).fontSize(36).fillColor('#2c3e50');
      doc.text(template.certificateOfCompletion, { align: 'center', valign: 'center' });
      doc.moveDown(1);
      doc.fontSize(28).text(certificateData.studentName, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(24).text(`Course: ${certificateData.courseTitle}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(18).text(`Date: ${certificateData.completionDate.toDateString()}`, { align: 'center' });

      // QR code
      const qrData = await qrCodeService.generateQRCode(certificateData.certificateId, certificateData.accessToken);
      doc.image(qrData.filepath, doc.page.width - 150, doc.page.height - 150, { width: 100 });

      doc.end();

      await new Promise(resolve => writeStream.on('finish', resolve));

      const fileSize = fs.statSync(filepath).size;

      return {
        filename,
        filepath,
        qrCodeUrl: qrData.url,
        qrCodeData: qrData.data,
        fileSize,
        generationTimeMs: Date.now() - startTime
      };

    } catch (error) {
      logger.error('PDF generation error:', error);
      throw error;
    }
  }
}

module.exports = new PDFGenerator();
