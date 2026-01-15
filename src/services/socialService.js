const { socialMedia, generateShareUrl } = require('../config/socialMedia');
const Certificate = require('../models/Certificate');

class SocialService {
  async getShareUrl(certificateId, platform) {
    const certificate = await Certificate.findByCertificateId(certificateId);
    if (!certificate) throw new Error('Certificate not found');
    return generateShareUrl(platform, { 
      certificateUrl: certificate.certificateDetails.viewUrl,
      courseTitle: certificate.courseInfo.courseTitle
    });
  }

  async incrementShare(certificateId, platform) {
    await Certificate.updateOne(
      { certificateId },
      { $inc: { [`socialSharing.shareCount`]: 1 } }
    );
  }
}

module.exports = new SocialService();
