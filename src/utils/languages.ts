export type Language = {
  code: string;
  name: string;
  flag: string;
};

export const ENGLISH = { code: 'en', name: 'English', flag: '🇺🇸' };

export const availableLanguages: Language[] = [
  ENGLISH,
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
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
