"use client";

import { FileText } from 'lucide-react';
import { useTranslation } from '@/i18n';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('common.nav.brand')}</h1>
          <p className="text-sm text-gray-500">{t('forms.header.subtitle')}</p>
        </div>
      </div>
    </header>
  );
}
