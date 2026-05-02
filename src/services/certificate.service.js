const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Certificate = require('../models/certificate.model');

/* ---------------- CLOUDINARY CONFIG ---------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* ---------------- TEMPLATE ---------------- */
const certificateTemplate = (bgUrl, stampUrl, eduUrl, data) => `
<!DOCTYPE html>
<html>
<head>

<link rel="preload" as="image" href="${bgUrl}">
<link rel="preload" as="image" href="${stampUrl}">
<link rel="preload" as="image" href="${eduUrl}">

<style>
@page { size: A4 landscape; margin: 0; }

body {
  margin: 0;
  font-family: "Helvetica Neue", Arial, sans-serif;
  -webkit-print-color-adjust: exact;
}

.page {
  width: 297mm;
  height: 210mm;
  position: relative;
  background: white;
  overflow: hidden;
}

.border {
  position: absolute;
  inset: 12mm;
  border: 2px solid #d4af37;
}

.inner {
  position: absolute;
  inset: 18mm;
  border: 1px solid #e5e7eb;
}

.bg {
  position: absolute;
  inset: 0;
  background-image: url("${bgUrl}");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.07;
}

.content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 40mm;
}

.brand {
  font-size: 14px;
  letter-spacing: 6px;
  color: #6b7280;
  text-transform: uppercase;
}

.title {
  font-size: 44px;
  font-weight: 700;
  color: #111827;
  margin-top: 10px;
}

.subtitle {
  font-size: 15px;
  color: #6b7280;
  margin-top: 12px;
}

.name {
  font-size: 38px;
  font-weight: 700;
  color: #2563eb;
  margin: 18px 0;
  border-bottom: 2px solid #2563eb;
  display: inline-block;
  padding-bottom: 6px;
}

.course {
  font-size: 24px;
  font-style: italic;
  color: #16a34a;
  margin-top: 8px;
}

.details {
  margin-top: 18px;
  font-size: 13px;
  color: #4b5563;
}

.stamp {
  position: absolute;
  bottom: 25mm;
  left: 25mm;
}

.stamp img {
  width: 130px;
}

.signature {
  position: absolute;
  bottom: 28mm;
  right: 35mm;
  text-align: center;
}

.edu-logo {
  margin-bottom: 6px;
}

.edu-logo img {
  width: 150px;
  height: auto;
}

.line {
  width: 160px;
  border-top: 1px solid #111827;
  margin-bottom: 6px;
}
</style>
</head>

<body>
<div class="page">

  <div class="border"></div>
  <div class="inner"></div>
  <div class="bg"></div>

  <div class="content">

    <div class="brand">EDULEARN ACADEMY</div>

    <div class="title">Certificate of Completion</div>

    <div class="subtitle">This is to certify that</div>

    <div class="name">${data.userName}</div>

    <div class="subtitle">has successfully completed the course</div>

    <div class="course">${data.courseTitle}</div>

    <div class="details">
      Certificate ID: <b>${data.certificateId}</b><br/>
      Date: <b>${data.completionDate}</b>
    </div>

  </div>

  ${stampUrl ? `
  <div class="stamp">
    <img src="${stampUrl}" />
  </div>` : ""}

  <div class="signature">

    ${eduUrl ? `
    <div class="edu-logo">
      <img src="${eduUrl}" />
    </div>` : ""}

    <div class="line"></div>
    <div style="font-size:12px;color:#6b7280;">Authorized Signature</div>

  </div>

</div>
</body>
</html>
`;

/* ---------------- GENERATE CERTIFICATE ---------------- */
async function generateCertificate(data) {

  const normalizedData = {
    userId: data.userId || data.studentId,
    userName: data.userName || data.studentName,
    courseId: data.courseId,
    courseTitle: data.courseTitle
  };

  const tempDir = path.join(process.cwd(), "temp");
  fs.mkdirSync(tempDir, { recursive: true });

  const id = data.certificateId || Date.now().toString();

  const filePath = path.join(tempDir, `${id}.pdf`);
  const htmlPath = path.join(tempDir, `${id}.html`);

  /* ---------------- ENV IMAGES ---------------- */
  const bgUrl = process.env.BG_URL;
  const stampUrl = process.env.STAMP_URL;
  const eduUrl = process.env.EDU_URL;

  /* ---------------- HTML ---------------- */
  const html = certificateTemplate(bgUrl, stampUrl, eduUrl, {
    ...data,
    ...normalizedData,
    certificateId: id,
    completionDate: new Date().toLocaleDateString()
  });

  fs.writeFileSync(htmlPath, html);

  /* ---------------- PUPPETEER ---------------- */
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });

  const page = await browser.newPage();

  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
    waitUntil: "load"
  });

  /* 🔥 FINAL IMAGE LOAD FIX */
  await page.evaluate(async () => {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    const images = Array.from(document.images);

    await Promise.all(
      images.map(img => {
        if (img.complete && img.naturalHeight !== 0) return;

        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    await delay(1000);
  });

  await page.pdf({
    path: filePath,
    format: "A4",
    landscape: true,
    printBackground: true
  });

  await browser.close();

  fs.unlinkSync(htmlPath);

  /* ---------------- UPLOAD ---------------- */
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: "certificates"
  });

  fs.unlinkSync(filePath);

  /* ---------------- DB SAVE ---------------- */
  return await Certificate.create({
    userId: normalizedData.userId,
    userName: normalizedData.userName,
    courseId: normalizedData.courseId,
    courseTitle: normalizedData.courseTitle,
    language: data.language || "en",
    certificateUrl: result.secure_url,
    cloudinaryId: result.public_id
  });
}

module.exports = { generateCertificate };