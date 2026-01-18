'use client';

import { useEffect } from 'react';
import { useFormStore } from '@/store/formStore';

export function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const language = useFormStore((state) => state.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <>{children}</>;
}
