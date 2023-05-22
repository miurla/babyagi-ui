import { i18n } from 'next-i18next';

type Namespace = 'common' | 'agent' | 'constants' | 'message';

export const translate = (
  key: string,
  ns?: Namespace | null,
  text?: string | undefined | null,
) => {
  const opts = !!ns ? { ns } : undefined;
  const defaultText = text ? text : key;
  return i18n?.t(key, defaultText, opts) ?? key;
};
