const crypto = require('crypto');

const generateCertificateId = () => {
  return `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

const generateBatchJobId = () => {
  return `BATCH-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

const generateAccessToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

module.exports = {
  generateCertificateId,
  generateBatchJobId,
  generateAccessToken
};
