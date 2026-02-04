export const supportedLanguages = ['ja', 'en', 'cn'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export const defaultLanguage: SupportedLanguage = 'ja';

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return supportedLanguages.includes(lang as SupportedLanguage);
}

export function getLanguage(lang: string | undefined): SupportedLanguage {
  if (lang && isValidLanguage(lang)) {
    return lang;
  }
  return defaultLanguage;
}

async function loadTranslations(lang: SupportedLanguage): Promise<Record<string, any>> {
  const translations: Record<string, any> = {};

  const files = [
    'main',
    'header',
    'navbar',
    'footer',
    'player',
    'tool',
    'framework',
    'contributor',
    'policy',
    'player-reference',
    'tool-menu',
    'tool-usage',
    'slimetenpuzzle',
    'worldflipper'
  ];

  for (const file of files) {
    try {
      const module = await import(`./locales/${lang}/${file}.json`);
      translations[file.replace('-', '')] = module.default || module;
    } catch (e) {
      // File may not exist for all languages
    }
  }

  return translations;
}

export async function getTranslations(lang: string | undefined) {
  const validLang = getLanguage(lang);
  return await loadTranslations(validLang);
}

// Helper function for getting a specific translation with nested key support
export function t(translations: Record<string, any>, key: string): string {
  const parts = key.split('.');
  let result: any = translations;

  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof result === 'string' ? result : key;
}

// Language display names
export const languageNames: Record<SupportedLanguage, string> = {
  ja: '日本語',
  en: 'English',
  cn: '简体中文'
};
