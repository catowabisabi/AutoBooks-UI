import en from './en.json';
import zhTW from './zh-TW.json';

export const locales = ['en', 'zh-TW'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh-TW';

export const localeNames: Record<Locale, string> = {
  'en': 'English',
  'zh-TW': '繁體中文',
};

export const messages = {
  'en': en,
  'zh-TW': zhTW,
};

export function getMessages(locale: Locale) {
  return messages[locale] || messages[defaultLocale];
}
