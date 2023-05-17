import { i18n } from 'next-i18next';
import type nextI18NextConfig from '../../next-i18next.config.js';

export const translate = (
  key: string,
  text?: string | undefined | null,
  ns?: (typeof nextI18NextConfig.ns)[number] | undefined | null,
) => {
  const opts = !!ns ? { ns } : undefined;
  const defaultText = text ? text : key;
  return i18n?.t(key, defaultText, opts) ?? key;
};
