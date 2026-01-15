const fs = require('fs');
const path = require('path');

const template = {
  language: 'ar',
  font: 'NotoNaskhArabic',
  certificateOfCompletion: 'شهادة إتمام',
  background: path.join(__dirname, '../../public/assets/certificate-bg-ar.png'),
  html: fs.readFileSync(path.join(__dirname, 'certificate.html'), 'utf-8'),
  css: fs.readFileSync(path.join(__dirname, 'certificate.css'), 'utf-8')
};

module.exports = template;
