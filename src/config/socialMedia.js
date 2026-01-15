const socialMedia = {
  linkedin: {
    enabled: true,
    shareUrl: 'https://www.linkedin.com/sharing/share-offsite/',
    params: {
      url: '{certificateUrl}'
    }
  },

  twitter: {
    enabled: true,
    shareUrl: 'https://twitter.com/intent/tweet',
    params: {
      url: '{certificateUrl}',
      text: 'I just earned a certificate in {courseTitle} from {platformName}! 🎓',
      hashtags: 'elearning,certificate,achievement'
    }
  },

  facebook: {
    enabled: true,
    shareUrl: 'https://www.facebook.com/sharer/sharer.php',
    params: {
      u: '{certificateUrl}'
    }
  },

  whatsapp: {
    enabled: true,
    shareUrl: 'https://wa.me/',
    params: {
      text: 'Check out my certificate: {certificateUrl}'
    }
  }
};

/**
 * Generate social media share URL
 */
const generateShareUrl = (platform, certificateData) => {
  const config = socialMedia[platform];

  if (!config || !config.enabled) {
    return null;
  }

  const params = new URLSearchParams();

  Object.entries(config.params).forEach(([key, template]) => {
    let value = template
      .replace('{certificateUrl}', certificateData.viewUrl)
      .replace('{courseTitle}', certificateData.courseTitle)
      .replace(
        '{platformName}',
        process.env.PLATFORM_NAME || 'Learning Platform'
      );

    params.append(key, value);
  });

  return `${config.shareUrl}?${params.toString()}`;
};

module.exports = {
  socialMedia,
  generateShareUrl
};
