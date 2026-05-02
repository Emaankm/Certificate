const axios = require('axios');

const CERTIFICATE_SERVICE_URL = process.env.CERTIFICATE_SERVICE_URL;

/**
 * Generate certificate via external certificate microservice
 * Called after quiz completion or course completion
 */
async function generateCertificate(data) {
  try {
    console.log("📡 Sending request to Certificate Service...");
    console.log("➡️ URL:", `${CERTIFICATE_SERVICE_URL}/api/certificates/generate`);
    console.log("➡️ Payload:", {
      userId: data.userId,
      userName: data.userName,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      language: data.language || "en"
    });

    const response = await axios.post(
      `${CERTIFICATE_SERVICE_URL}/api/certificates/generate`,
      {
        userId: data.userId,
        userName: data.userName,
        courseId: data.courseId,
        courseTitle: data.courseTitle,
        language: data.language || "en"
      },
      {
        timeout: 15000 // prevent hanging request
      }
    );

    console.log("✅ Certificate service response received");
    console.log("📄 Response data:", response.data);

    if (!response || !response.data) {
      console.log("⚠️ Empty response received from certificate service");
      throw new Error("Empty response from certificate service");
    }

    return response.data;

  } catch (error) {
    console.error("❌ Certificate API failed");

    // 🔥 Detailed error logging (VERY IMPORTANT for debugging Render/microservices)
    if (error.response) {
      console.error("🔴 Status:", error.response.status);
      console.error("🔴 Response Data:", error.response.data);
    } else if (error.request) {
      console.error("🔴 No response received from service");
    } else {
      console.error("🔴 Error Message:", error.message);
    }

    return null; // don't break quiz flow
  }
}

module.exports = {
  generateCertificate
};