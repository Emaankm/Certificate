const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary configuration
 * Uses environment variables for secure credentials
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload generated PDF to Cloudinary
 * @param {string} pdfPath - Local path of generated PDF
 */
async function uploadPDF(pdfPath) {
  try {
    console.log("📤 Uploading PDF to Cloudinary...");
    console.log("📁 File Path:", pdfPath);

    const result = await cloudinary.uploader.upload(pdfPath, {
      resource_type: "raw",   // required for PDFs
      folder: "certificates",
      type: "upload"
    });

    console.log("✅ PDF uploaded successfully");
    console.log("🔗 URL:", result.secure_url);

    return {
      certificateUrl: result.secure_url,
      cloudinaryId: result.public_id
    };

  } catch (error) {
    console.error("❌ Cloudinary upload failed:");
    console.error(error.message);

    if (error.response?.data) {
      console.error("🔴 Cloudinary Response:", error.response.data);
    }

    throw error; // important so caller knows upload failed
  }
}

/**
 * Delete PDF from Cloudinary using public_id
 * @param {string} cloudinaryId
 */
async function deletePDF(cloudinaryId) {
  try {
    if (!cloudinaryId) {
      console.log("⚠️ No Cloudinary ID provided for deletion");
      return;
    }

    console.log("🗑️ Deleting PDF from Cloudinary...");
    console.log("🆔 ID:", cloudinaryId);

    await cloudinary.uploader.destroy(cloudinaryId, {
      resource_type: 'raw'
    });

    console.log("✅ PDF deleted from Cloudinary");

  } catch (error) {
    console.error("❌ Cloudinary delete failed:");
    console.error(error.message);
  }
}

module.exports = {
  uploadPDF,
  deletePDF
};