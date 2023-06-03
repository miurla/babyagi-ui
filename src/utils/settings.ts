import { UserSettings } from '@/types';
import { SETTINGS_KEY } from './constants';

export const getUserApiKey = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const item = localStorage.getItem(SETTINGS_KEY);
  if (!item) {
    return undefined;
  }

  const settings = JSON.parse(item) as UserSettings;
  const openAIApiKey = settings?.openAIApiKey ?? undefined;

  return openAIApiKey;
};

export const setEnabledGPT4 = (enabled: boolean) => {
  const item = localStorage.getItem(SETTINGS_KEY);
  if (!item) {
    return;
  }

  const settings = JSON.parse(item) as UserSettings;
  settings.enabledGPT4 = enabled;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
