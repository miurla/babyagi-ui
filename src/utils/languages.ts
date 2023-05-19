export type Language = {
  code: string;
  name: string;
  flag: string;
};

export const ENGLISH = { code: 'en', name: 'English', flag: '🇺🇸' };

export const availableLanguages: Language[] = [
  { code: 'br', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
];

export const languages: Language[] = availableLanguages.sort((a, b) =>
  a.name.localeCompare(b.name),
);

export const locales: string[] = availableLanguages.map((lang) => lang.code);

export const findLanguage = (nameOrLocale: string): Language => {
  const selectedLanguage = languages.find(
    (lang) =>
      lang.code === nameOrLocale ||
      lang.name === nameOrLocale.substring(4).trim(),
  );
  return selectedLanguage || ENGLISH;
};
