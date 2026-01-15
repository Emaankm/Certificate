const Certificate = require('../models/Certificate');
const { generateShareUrl } = require('../config/socialMedia');
const logger = require('../utils/logger');

class SocialController {

  /**
   * Generate social media share URL
   * GET /api/social/share/:certificateId/:platform
   */
  async shareCertificate(req, res) {
    try {
      const { certificateId, platform } = req.params;

      const certificate = await Certificate.findByCertificateId(certificateId);

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Certificate not found'
          }
        });
      }

      const shareUrl = generateShareUrl(platform, {
        viewUrl: certificate.certificateDetails.viewUrl,
        courseTitle: certificate.courseInfo.courseTitle
      });

      if (!shareUrl) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PLATFORM',
            message: 'Unsupported or disabled social platform'
          }
        });
      }

      // Increase share count
      certificate.socialSharing.shareCount += 1;
      certificate.socialSharing.lastSharedAt = new Date();
      await certificate.save();

      logger.info(`Certificate shared: ${certificateId} on ${platform}`);

      res.json({
        success: true,
        data: {
          platform,
          shareUrl,
          totalShares: certificate.socialSharing.shareCount
        }
      });

    } catch (error) {
      logger.error('Social share error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SHARE_FAILED',
          message: 'Failed to generate share link'
        }
      });
    }
  }

  /**
   * Get social sharing stats
   * GET /api/social/stats/:certificateId
   */
  async getShareStats(req, res) {
    try {
      const { certificateId } = req.params;

      const certificate = await Certificate.findByCertificateId(certificateId);

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Certificate not found'
          }
        });
      }

      res.json({
        success: true,
        data: {
          certificateId,
          shareCount: certificate.socialSharing.shareCount,
          lastSharedAt: certificate.socialSharing.lastSharedAt
        }
      });

    } catch (error) {
      logger.error('Get share stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'STATS_FAILED',
          message: 'Failed to retrieve share stats'
        }
      });
    }
  }
}

module.exports = new SocialController();
