import { SETTINGS_KEY } from './constants';
import { translate } from './translate';
import va from '@vercel/analytics';

export const showNotification = (
  title: string,
  options?: NotificationOptions,
) => {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notifications.');
    return;
  }

  const userSettings = localStorage.getItem(SETTINGS_KEY);
  if (!userSettings) {
    return;
  }

  const parsedSettings = JSON.parse(userSettings);
  if (!parsedSettings || !parsedSettings.notifications) {
    return;
  }

  new Notification(title, options);
};

export const taskCompletedNotification = (objective: string) => {
  const title = translate('NOTIFICATION_TITLE', 'constants');
  showNotification(title, {
    body: `🎯 ${objective}`,
    icon: '/images/complete.png',
  });
  va.track('Notification', { type: 'taskCompleted' });
};
