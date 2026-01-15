const fs = require('fs');
const path = require('path');

const template = {
  language: 'ur',
  font: 'NotoNaskhArabic', // make sure font is loaded
  certificateOfCompletion: 'تکمیل کا سرٹیفکیٹ',
  background: path.join(__dirname, '../../public/assets/certificate-bg-ur.png'),
  html: fs.readFileSync(path.join(__dirname, 'certificate.html'), 'utf-8'),
  css: fs.readFileSync(path.join(__dirname, 'certificate.css'), 'utf-8')
};

module.exports = template;
