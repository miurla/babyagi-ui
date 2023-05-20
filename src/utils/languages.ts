export type Language = {
  code: string;
  name: string;
  flag: string;
};

export const ENGLISH = { code: 'en', name: 'English', flag: '🇺🇸' };

export const availableLanguages: Language[] = [
  { code: 'br', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ENGLISH,
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'au', name: 'Australian', flag: '🇦🇺' },
  { code: 'gb', name: 'British', flag: '🇬🇧' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'el', name: 'Ελληλαηλοή', flag: '🇬🇷' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'tr', name: 'TÜRKİSH', flag: '🇹🇷' },
  { code: 'zh-tw', name: '中文(台灣)', flag: '🇹🇼' },
  { code: 'bg', name: 'бълежи', flag: '🇧🇬' },
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
