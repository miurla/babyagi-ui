// @ts-check
/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  debug: false,
  i18n: {
    defaultLocale: 'en',
    locales: [
      'br',
      'de',
      'es',
      'fr',
      'hi',
      'hu',
      'ja',
      'ru',
      'th',
      'en',
      'ko',
      'pt',
      'ar',
      'id',
      'it',
      'uk',
      'zh',
      'vi',
      'au',
      'gb',
      'lt',
      'cs',
      'el',
      'sv',
      'da',
      'fi',
      'no',
      'tr',
      'zh-tw',
      'bg',
    ],
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
