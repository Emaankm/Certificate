const fs = require('fs');
const path = require('path');
const { getLanguage } = require('../config/languages');

const template = {
  language: 'en',
  font: 'Helvetica',
  certificateOfCompletion: 'CERTIFICATE OF COMPLETION',
  background: path.join(__dirname, '../../public/assets/certificate-bg-en.png'), // optional background
  html: fs.readFileSync(path.join(__dirname, 'certificate.html'), 'utf-8'),
  css: fs.readFileSync(path.join(__dirname, 'certificate.css'), 'utf-8')
};

module.exports = template;
