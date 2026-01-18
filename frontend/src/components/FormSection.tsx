'use client';

import { useState } from 'react';
import { FormSection as FormSectionType } from '@/types';
import { FormQuestion } from './FormQuestion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface FormSectionProps {
  section: FormSectionType;
  sectionNumber: number;
  onHelpClick: (questionId: string) => void;
}

export function FormSection({ section, sectionNumber, onHelpClick }: FormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded">
              {t('forms.section.label', { number: sectionNumber })}
            </span>
            <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
          </div>
          {section.description && (
            <p className="text-sm text-gray-500 mt-1">{section.description}</p>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {section.questions.map((question) => (
            <FormQuestion
              key={question.id}
              question={question}
              onHelpClick={() => onHelpClick(question.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
