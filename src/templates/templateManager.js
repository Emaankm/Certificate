const english = require('./english');
const urdu = require('./urdu');
const arabic = require('./arabic');
const { getLanguage } = require('../config/languages');

/**
 * Returns the template object for a given language code
 * @param {String} code 
 * @returns {Object} {html, css, font, background, certificateOfCompletion}
 */
const getTemplate = (code = 'en') => {
  switch (code) {
    case 'ur':
      return urdu;
    case 'ar':
      return arabic;
    case 'en':
    default:
      return english;
  }
};

module.exports = { getTemplate };
