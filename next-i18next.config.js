// @ts-check
/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  debug: false,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hu', 'ja'],
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
