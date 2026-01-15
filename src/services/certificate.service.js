require('dotenv').config();
const Certificate = require('../models/certificate.model');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const generateCertificate = async (data) => {
  try {
    const { userId, userName, courseId, courseTitle, language = 'en' } = data;

    console.log('📝 Starting certificate generation for:', userName);

    // Ensure storage folder exists
    const storageDir = path.join(process.cwd(), process.env.LOCAL_STORAGE_PATH || 'storage/certificates');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    // PDF file path
    const pdfFileName = `${Date.now()}-${userId}.pdf`;
    const pdfPath = path.join(storageDir, pdfFileName);
    const verificationUrl = `${process.env.BASE_URL}/verify/${pdfFileName}`;

    console.log('📄 PDF will be saved to:', pdfPath);

    // Convert background image to base64
    const bgImagePath = path.join(process.cwd(), 'public', 'assets', 'Edu-Learn-01.png');
    let bgImageBase64 = '';
    if (fs.existsSync(bgImagePath)) {
      const imageBuffer = fs.readFileSync(bgImagePath);
      bgImageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
      console.log('✅ Background image loaded');
    } else {
      console.warn('⚠️ Background image not found');
    }

    // Convert golden seal to base64
    const sealImagePath = path.join(process.cwd(), 'public', 'assets', 'png-clipart-official-seal-of-excellence-logo-seal-gold-sticker-paper-academic-certificate-seal-food-animals.png');
    let sealBase64 = '';
    if (fs.existsSync(sealImagePath)) {
      const sealBuffer = fs.readFileSync(sealImagePath);
      sealBase64 = `data:image/png;base64,${sealBuffer.toString('base64')}`;
      console.log('✅ Golden seal loaded');
    } else {
      console.warn('⚠️ Golden seal not found');
    }

    const completionDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Beautiful HTML template
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate of Completion</title>
  <style>
    @page { 
      size: A4 landscape; 
      margin: 0; 
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body { 
      margin: 0; 
      padding: 0;
      font-family: 'Garamond', 'Georgia', serif;
      background: #f8f9fa;
    }
    
    .certificate {
      position: relative;
      width: 297mm;
      height: 210mm;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border: 20px solid #1a3a52;
      box-shadow: inset 0 0 0 8px #d4af37, inset 0 0 0 10px #1a3a52;
      overflow: hidden;
    }
    
    /* Decorative corners */
    .certificate::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 30px;
      right: 30px;
      bottom: 30px;
      border: 2px solid #d4af37;
      pointer-events: none;
      z-index: 2;
    }
    
    /* Background watermark */
    .bg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 500px;
      background-image: url("${bgImageBase64}");
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      opacity: 0.08;
      z-index: 1;
    }
    
    .content {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 50px 120px 50px 120px;
      z-index: 2;
    }
    
    .main-title {
      font-size: 42px;
      color: #1a3a52;
      font-weight: bold;
      margin: 0 0 20px 0;
      text-transform: uppercase;
      letter-spacing: 6px;
      border-bottom: 4px double #d4af37;
      padding-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.05);
    }
    
    .subtitle {
      font-size: 18px;
      color: #555;
      margin: 8px 0;
      font-style: italic;
      letter-spacing: 1px;
    }
    
    .student-name {
      font-size: 38px;
      color: #1a3a52;
      font-weight: bold;
      margin: 15px 0;
      padding: 10px 35px;
      border-bottom: 3px solid #1a3a52;
      letter-spacing: 2px;
      text-transform: capitalize;
      position: relative;
    }
    
    .student-name::before,
    .student-name::after {
      content: '❖';
      position: absolute;
      color: #d4af37;
      font-size: 20px;
    }
    
    .student-name::before {
      left: 0;
    }
    
    .student-name::after {
      right: 0;
    }
    
    .course-title {
      font-size: 26px;
      color: #2c5f7e;
      font-weight: 600;
      margin: 15px 0 20px 0;
      letter-spacing: 1px;
      line-height: 1.3;
    }
    
    .details {
      margin: 20px 0;
      font-size: 15px;
      color: #666;
      display: flex;
      gap: 35px;
      justify-content: center;
    }
    
    .details .detail-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .details .label {
      font-size: 13px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    
    .details .value {
      font-size: 15px;
      color: #1a3a52;
      font-weight: bold;
    }
    
    .signatures {
      display: flex;
      justify-content: space-around;
      width: 100%;
      max-width: 600px;
      margin-top: 25px;
      gap: 80px;
    }
    
    .signature-box {
      flex: 1;
      text-align: center;
    }
    
    .signature-line {
      border: none;
      border-top: 2px solid #1a3a52;
      margin: 0 0 6px 0;
      width: 100%;
    }
    
    .signature-label {
      font-size: 12px;
      color: #666;
      font-style: italic;
      letter-spacing: 0.5px;
    }
    
    /* Golden Seal - blended with background */
    .seal {
      position: absolute;
      bottom: 55px;
      left: 70px;
      width: 120px;
      height: 120px;
      z-index: 3;
      opacity: 0.85;
      filter: drop-shadow(1px 1px 3px rgba(0,0,0,0.15));
      mix-blend-mode: multiply;
    }
    
    /* Decorative elements */
    .ornament {
      color: #d4af37;
      font-size: 20px;
      margin: 6px 0;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="bg"></div>
    
    <div class="content">
      <h1 class="main-title">CERTIFICATE OF COMPLETION</h1>
      
      <div class="ornament">❖ ❖ ❖</div>
      
      <p class="subtitle">This is to certify that</p>
      
      <h2 class="student-name">${userName}</h2>
      
      <p class="subtitle">has successfully completed the course</p>
      
      <h3 class="course-title">"${courseTitle}"</h3>
      
      <div class="ornament">✦</div>
      
      <div class="details">
        <div class="detail-item">
          <span class="label">Completion Date</span>
          <span class="value">${completionDate}</span>
        </div>
        <div class="detail-item">
          <span class="label">Certificate ID</span>
          <span class="value">${pdfFileName.split('.')[0]}</span>
        </div>
      </div>
      
      <div class="signatures">
        <div class="signature-box">
          <div class="signature-line"></div>
          <p class="signature-label">Authorized Signature</p>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <p class="signature-label">Date of Issue</p>
        </div>
      </div>
    </div>
    
    ${sealBase64 ? `<img src="${sealBase64}" alt="Official Seal" class="seal">` : ''}
  </div>
</body>
</html>
    `;

    console.log('🚀 Launching Puppeteer...');
    
    // Generate PDF
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    await page.pdf({ 
      path: pdfPath, 
      format: 'A4', 
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    });
    
    await browser.close();

    console.log('✅ PDF generated successfully at:', pdfPath);

    // Verify PDF was created
    if (!fs.existsSync(pdfPath)) {
      throw new Error('PDF file was not created successfully');
    }

    // Save certificate info in DB
    console.log('💾 Saving to database...');
    
    const certificate = await Certificate.create({
      userId,
      userName,
      courseId,
      courseTitle,
      language,
      pdfPath,
      verificationUrl
    });
    
    console.log('✅ Certificate saved to DB with ID:', certificate._id);

    return certificate;
    
  } catch (error) {
    console.error('❌ Error in generateCertificate:', error.message);
    console.error(error.stack);
    throw error;
  }
};

const getCertificateById = async (certificateId) => {
  try {
    const certificate = await Certificate.findById(certificateId);
    return certificate;
  } catch (error) {
    console.error('❌ Error in getCertificateById:', error.message);
    throw error;
  }
};

module.exports = {
  generateCertificate,
  getCertificateById
};