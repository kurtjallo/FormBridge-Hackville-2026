'use client';

import { useFormStore } from '@/store/formStore';

// Import all translation files statically
import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import frCommon from './locales/fr/common.json';
import frLanding from './locales/fr/landing.json';

type Locale = 'en' | 'fr';

type TranslationNamespace = 'common' | 'landing';

const translations: Record<Locale, Record<TranslationNamespace, Record<string, unknown>>> = {
  en: {
    common: enCommon,
    landing: enLanding,
  },
  fr: {
    common: frCommon,
    landing: frLanding,
  },
};

function getNestedValue(obj: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

export function useTranslation() {
  const language = useFormStore((state) => state.language);

  const t = (key: string, params?: Record<string, string>): string => {
    const [namespace, ...path] = key.split('.') as [TranslationNamespace, ...string[]];

    const namespaceTranslations = translations[language]?.[namespace];
    if (!namespaceTranslations) {
      console.warn(`Missing namespace: ${namespace} for language: ${language}`);
      return key;
    }

    const value = getNestedValue(namespaceTranslations as Record<string, unknown>, path);

    if (typeof value !== 'string') {
      // Fallback to English if translation missing
      const enNamespace = translations.en[namespace];
      const enValue = getNestedValue(enNamespace as Record<string, unknown>, path);
      if (typeof enValue === 'string') {
        if (language !== 'en') {
          console.warn(`Missing translation for key: ${key} in language: ${language}`);
        }
        return interpolate(enValue, params);
      }
      return key;
    }

    return interpolate(value, params);
  };

  return { t, language };
}

function interpolate(text: string, params?: Record<string, string>): string {
  if (!params) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] || `{{${key}}}`);
}
