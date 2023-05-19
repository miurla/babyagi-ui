import { FC, useState, Fragment, useEffect } from 'react';
import { Cross1Icon, GearIcon } from '@radix-ui/react-icons';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import { UserSettings } from '@/types';
import { SETTINGS_KEY, THEME } from '@/utils/constants';
import { translate } from '../../utils/translate';
import { useTheme } from 'next-themes';
import { i18n } from 'next-i18next';
import { useRouter } from 'next/router';
import { availableLanguages } from '@/utils/languages';

export const SidebarSettings: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings | undefined>(undefined);
  const [language, setLanguage] = useState(i18n?.language);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    if (!settings) {
      return;
    }

    // get userSettings from localStorage
    const userSettings = localStorage.getItem(SETTINGS_KEY);
    // TODO: validate settings before saving

    if (userSettings) {
      // If there is already a value, parse it and merge the new value
      const parsedUserSettings = JSON.parse(userSettings);
      const mergedSettings = { ...parsedUserSettings, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(mergedSettings));
      return;
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  };

  const handleLanguage = (value: string) => {
    const { pathname, asPath, query } = router;
    router
      .push({ pathname, query }, asPath, {
        locale: value,
      })
      .catch(console.error);
  };

  useEffect(() => {
    const userSettings = localStorage.getItem(SETTINGS_KEY);
    if (userSettings) {
      const parsedUserSettings = JSON.parse(userSettings);
      setSettings(parsedUserSettings);
    }
  }, []);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DialogPrimitive.Trigger asChild>
        <div className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-3 text-white transition-colors duration-200 hover:bg-gray-500/10">
          <div>
            <GearIcon />
          </div>
          <div>{translate('SETTINGS')}</div>
        </div>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal forceMount>
        <Transition.Root show={isOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogPrimitive.Overlay
              forceMount
              className="fixed inset-0 z-20 bg-black/50"
            />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPrimitive.Content
              forceMount
              className={clsx(
                'fixed z-50',
                'w-[95vw] max-w-md rounded-lg p-8 md:w-full',
                'left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
                'bg-white dark:bg-neutral-800',
                'focus:outline-none focus-visible:ring focus-visible:ring-neutral-500 focus-visible:ring-opacity-75',
              )}
            >
              <DialogPrimitive.Title className="py-2 text-xl font-medium text-gray-900 dark:text-gray-100">
                {translate('SETTINGS')}
              </DialogPrimitive.Title>
              <hr className="dark:border-neutral-700" />
              <form className="mt-6 space-y-5">
                <fieldset className="flex flex-col items-start space-y-1">
                  <label
                    htmlFor="openAIApiKey"
                    className="text-xs font-medium text-gray-700 dark:text-gray-400"
                  >
                    {translate('OPENAI_API_KEY')}
                  </label>
                  <div className="inline-flex w-full items-center justify-center space-x-1">
                    <input
                      id="openAIApiKey"
                      type="text"
                      placeholder={translate('OPENAI_API_KEY')}
                      className={clsx(
                        'block w-full rounded p-2',
                        'text-sm text-gray-700 placeholder:text-gray-500 dark:text-gray-400 dark:placeholder:text-gray-600',
                        'border border-gray-200 focus-visible:border-transparent dark:border-neutral-700 dark:bg-neutral-800',
                        'focus:outline-none focus-visible:ring focus-visible:ring-neutral-500 focus-visible:ring-opacity-10',
                      )}
                      value={settings?.openAIApiKey ?? ''}
                      onChange={handleValueChange}
                    />
                    <DialogPrimitive.DialogClose asChild>
                      <button
                        className={clsx(
                          'inline-flex select-none justify-center rounded-md px-4 py-2 text-sm font-medium',
                          'bg-black text-white hover:bg-gray-800 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
                          'border border-transparent',
                          'focus:outline-none focus-visible:ring focus-visible:ring-neutral-500 focus-visible:ring-opacity-10',
                        )}
                        onClick={handleSave}
                      >
                        {translate('SAVE')}
                      </button>
                    </DialogPrimitive.DialogClose>
                  </div>
                  <label className="text-xs text-neutral-400">
                    👉 {translate('SET_OPENAI_API_KEY')}
                  </label>
                </fieldset>
                <fieldset className="flex flex-col items-start space-y-1">
                  <label
                    htmlFor="language"
                    className="text-xs font-medium text-gray-700 dark:text-gray-400"
                  >
                    {translate('LANGUAGE')}
                  </label>
                  <select
                    id="language"
                    className={clsx(
                      'block w-full rounded p-2',
                      'text-sm text-gray-700 placeholder:text-gray-500 dark:text-gray-400 dark:placeholder:text-gray-600',
                      'border border-gray-200 focus-visible:border-transparent dark:border-neutral-700 dark:bg-neutral-800',
                      'focus:outline-none focus-visible:ring focus-visible:ring-neutral-500 focus-visible:ring-opacity-10',
                    )}
                    value={language}
                    onChange={(event) => {
                      handleLanguage(event.target.value);
                      setLanguage(event.target.value);
                    }}
                  >
                    {availableLanguages.map((item, index) => (
                      <option key={index} value={item.code}>
                        {`${item.flag} ${item.name}`}
                      </option>
                    ))}
                  </select>
                </fieldset>
                <fieldset className="flex flex-col items-start space-y-1">
                  <label
                    htmlFor="theme"
                    className="text-xs font-medium text-gray-700 dark:text-gray-400"
                  >
                    {translate('THEME')}
                  </label>
                  <select
                    id="theme"
                    className={clsx(
                      'block w-full rounded p-2',
                      'text-sm text-gray-700 placeholder:text-gray-500 dark:text-gray-400 dark:placeholder:text-gray-600',
                      'border border-gray-200 focus-visible:border-transparent dark:border-neutral-700 dark:bg-neutral-800',
                      'focus:outline-none focus-visible:ring focus-visible:ring-neutral-500 focus-visible:ring-opacity-10',
                    )}
                    value={theme}
                    onChange={(event) => {
                      setTheme(event.target.value);
                    }}
                  >
                    {THEME.map((item, index) => (
                      <option key={index} value={item.id}>
                        {`${item.icon} ${item.name}`}
                      </option>
                    ))}
                  </select>
                </fieldset>
              </form>
              <DialogPrimitive.Close
                className={clsx(
                  'absolute right-3.5 top-3.5 inline-flex items-center justify-center rounded-full p-1',
                  'focus:outline-none focus-visible:ring focus-visible:ring-neutral-500 focus-visible:ring-opacity-75',
                )}
              >
                <Cross1Icon className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-400" />
              </DialogPrimitive.Close>
            </DialogPrimitive.Content>
          </Transition.Child>
        </Transition.Root>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
