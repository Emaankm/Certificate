const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadPDF(pdfPath) {
    const result = await cloudinary.uploader.upload(pdfPath, {
        resource_type: "raw",
        folder: "certificates",
        type: "upload",
        access_mode: "public"
      });

  return {
    certificateUrl: result.secure_url,
    cloudinaryId: result.public_id
  };
}

async function deletePDF(cloudinaryId) {
  if (!cloudinaryId) return;
  await cloudinary.uploader.destroy(cloudinaryId, { resource_type: 'raw' });
}

module.exports = {
  uploadPDF,
  deletePDF
};