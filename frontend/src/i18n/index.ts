'use client';

import { useFormStore } from '@/store/formStore';

// Import all translation files
import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enOnboarding from './locales/en/onboarding.json';
import enChat from './locales/en/chat.json';
import enForms from './locales/en/forms.json';
import enPdf from './locales/en/pdf.json';
import enFormView from './locales/en/formview.json';
import frCommon from './locales/fr/common.json';
import frLanding from './locales/fr/landing.json';
import frOnboarding from './locales/fr/onboarding.json';
import frChat from './locales/fr/chat.json';
import frForms from './locales/fr/forms.json';
import frPdf from './locales/fr/pdf.json';
import frFormView from './locales/fr/formview.json';

type Locale = 'en' | 'fr';
type TranslationNamespace = 'common' | 'landing' | 'onboarding' | 'chat' | 'forms' | 'pdf' | 'formview';

const translations: Record<Locale, Record<TranslationNamespace, Record<string, unknown>>> = {
  en: {
    common: enCommon,
    landing: enLanding,
    onboarding: enOnboarding,
    chat: enChat,
    forms: enForms,
    pdf: enPdf,
    formview: enFormView,
  },
  fr: {
    common: frCommon,
    landing: frLanding,
    onboarding: frOnboarding,
    chat: frChat,
    forms: frForms,
    pdf: frPdf,
    formview: frFormView,
  },
};

export function useTranslation() {
  const language = useFormStore((state) => state.language);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const [namespace, ...path] = key.split('.') as [TranslationNamespace, ...string[]];

    // Get the translation object for the current language and namespace
    const localeTranslations = translations[language]?.[namespace];
    if (!localeTranslations) {
      console.warn(`Missing namespace: ${namespace} for language: ${language}`);
      return key;
    }

    // Navigate to the nested value
    let value: unknown = localeTranslations;
    for (const segment of path) {
      if (value && typeof value === 'object' && segment in value) {
        value = (value as Record<string, unknown>)[segment];
      } else {
        // Fallback to English if key not found
        let fallbackValue: unknown = translations['en']?.[namespace];
        for (const seg of path) {
          if (fallbackValue && typeof fallbackValue === 'object' && seg in fallbackValue) {
            fallbackValue = (fallbackValue as Record<string, unknown>)[seg];
          } else {
            console.warn(`Missing translation: ${key}`);
            return key;
          }
        }
        value = fallbackValue;
        break;
      }
    }

    // Interpolate parameters if value is a string
    if (typeof value === 'string' && params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
        return params[paramKey]?.toString() || `{{${paramKey}}}`;
      });
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, language };
}
