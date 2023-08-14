// src/hooks/useApiKeyCheck.ts
import { SETTINGS_KEY } from '@/utils/constants';
import { UserSettings } from '@/types';
import { translate } from '../utils/translate';

export const useApiKeyCheck = () => {
  const checkApiKeySetting = () => {
    const useUserApiKey = process.env.NEXT_PUBLIC_USE_USER_API_KEY;
    if (useUserApiKey === 'false') {
      return false;
    }

    const userSettings = localStorage.getItem(SETTINGS_KEY);
    if (userSettings) {
      const { openAIApiKey } = JSON.parse(userSettings) as UserSettings;
      if (openAIApiKey && openAIApiKey?.length > 0) {
        return false;
      }
    }
    return true;
  };

  const checkAndAlertApiKeySetting = () => {
    if (checkApiKeySetting()) {
      alert(translate('ALERT_SET_UP_API_KEY', 'agent'));
      return true;
    }
    return false;
  };

  return { checkAndAlertApiKeySetting };
};
