// @ts-check
/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  debug: false,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'br', 'ar', 'de', 'es', 'fr', 'hi', 'hu', 'ja', 'ru', 'th',  'ko', 'pt', 'id', 'it', 'uk', 'zh', 'vi', 'au', 'gb', 'lt',  'cs', 'el', 'sv', 'da', 'fi', 'no', 'tr', 'pl', 'zhtw', 'bg',  'nl', 'sk', 'ro', 'lv', 'et', 'hr', 'sl', 'sr', 'he', 'fa', 'ur', 'bn', 'gu', 'ta', 'te', 'kn', 'ml']
,
  },
  defaultNS: 'common',
  ns: ['agent', 'common', 'constants', 'message'],
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  saveMissing: false,
};
