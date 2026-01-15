const { getLanguage } = require('../config/languages');

class TranslationService {
  getTranslations(languageCode = 'en') {
    const lang = getLanguage(languageCode);
    return lang.translations;
  }
}

module.exports = new TranslationService();
