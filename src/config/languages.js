const languages = {
  en: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    font: 'Helvetica',
    translations: {
      certificateOfCompletion: 'CERTIFICATE OF COMPLETION',
      thisIsToCertify: 'This is to certify that',
      hasSuccessfullyCompleted: 'has successfully completed the course',
      completionDate: 'Completion Date',
      certificateId: 'Certificate ID',
      authorizedSignature: 'Authorized Signature',
      dateIssued: 'Date Issued',
      verifyAt: 'Verify at',
      scanQRCode: 'Scan QR code to verify'
    }
  },

  ur: {
    code: 'ur',
    name: 'Urdu',
    direction: 'rtl',
    font: 'NotoNaskhArabic',
    translations: {
      certificateOfCompletion: 'تکمیل کا سرٹیفکیٹ',
      thisIsToCertify: 'یہ تصدیق کرتا ہے کہ',
      hasSuccessfullyCompleted: 'نے کامیابی سے کورس مکمل کیا',
      completionDate: 'تکمیل کی تاریخ',
      certificateId: 'سرٹیفکیٹ نمبر',
      authorizedSignature: 'مجاز دستخط',
      dateIssued: 'جاری کرنے کی تاریخ',
      verifyAt: 'تصدیق کریں',
      scanQRCode: 'تصدیق کے لیے QR کوڈ اسکین کریں'
    }
  },

  ar: {
    code: 'ar',
    name: 'Arabic',
    direction: 'rtl',
    font: 'NotoNaskhArabic',
    translations: {
      certificateOfCompletion: 'شهادة إتمام',
      thisIsToCertify: 'هذا يشهد أن',
      hasSuccessfullyCompleted: 'قد أكمل بنجاح الدورة',
      completionDate: 'تاريخ الإكمال',
      certificateId: 'رقم الشهادة',
      authorizedSignature: 'التوقيع المعتمد',
      dateIssued: 'تاريخ الإصدار',
      verifyAt: 'التحقق في',
      scanQRCode: 'امسح رمز QR للتحقق'
    }
  }
};

/**
 * Get language configuration
 */
const getLanguage = (code = 'en') => {
  return languages[code] || languages.en;
};

/**
 * List supported languages
 */
const getSupportedLanguages = () => {
  return Object.values(languages).map(lang => ({
    code: lang.code,
    name: lang.name,
    direction: lang.direction
  }));
};

module.exports = {
  languages,
  getLanguage,
  getSupportedLanguages
};
