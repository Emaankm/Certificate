const axios = require('axios');

const CERTIFICATE_SERVICE_URL = process.env.CERTIFICATE_SERVICE_URL;

async function generateCertificate(data) {
  try {
    const response = await axios.post(
      `${CERTIFICATE_SERVICE_URL}/api/certificates/generate`,
      {
        userId: data.userId,
        userName: data.userName,
        courseId: data.courseId,
        courseTitle: data.courseTitle,
        language: data.language || "en"
      }
    );

    return response.data;

  } catch (error) {
    console.error("Certificate API failed:", error.message);
    return null; // don't break quiz flow
  }
}

module.exports = {
  generateCertificate
};