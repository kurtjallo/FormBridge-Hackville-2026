'use client';

import { useFormStore } from '@/store/formStore';
import { FormSection } from '@/types';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from '@/i18n';

interface ProgressBarProps {
  sections: FormSection[];
}

export function ProgressBar({ sections }: ProgressBarProps) {
  const { t } = useTranslation();
  const answers = useFormStore((state) => state.answers);

  // Calculate section completion based on answered required questions
  const sectionStatus = useMemo(() => {
    return sections.map((section) => {
      const requiredQuestions = section.questions.filter((q) => q.required);
      const answeredRequired = requiredQuestions.filter((q) => {
        const answer = answers[q.fieldId];
        if (answer === undefined || answer === null || answer === '') return false;
        if (typeof answer === 'boolean') return answer === true;
        return true;
      });

      const totalQuestions = section.questions.length;
      const answeredTotal = section.questions.filter((q) => {
        const answer = answers[q.fieldId];
        return answer !== undefined && answer !== null && answer !== '';
      }).length;

      return {
        id: section.id,
        complete: requiredQuestions.length > 0 && answeredRequired.length === requiredQuestions.length,
        progress: totalQuestions > 0 ? answeredTotal / totalQuestions : 0,
        answeredRequired: answeredRequired.length,
        totalRequired: requiredQuestions.length,
      };
    });
  }, [answers, sections]);

  const completedCount = sectionStatus.filter((s) => s.complete).length;
  const totalCount = sections.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {t('forms.progress.label', { completed: completedCount, total: totalCount })}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progressPercent)}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between">
          {sections.map((section, index) => {
            const status = sectionStatus[index];
            return (
              <div key={section.id} className="flex flex-col items-center group relative">
                {status.complete ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : status.progress > 0 ? (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <span
                  className={`text-xs mt-1 hidden sm:block ${
                    status.complete
                      ? 'text-green-600'
                      : status.progress > 0
                      ? 'text-yellow-600'
                      : 'text-gray-400'
                  }`}
                >
                  {index + 1}. {section.title.split(' ')[0]}
                </span>
                <span
                  className={`text-xs mt-1 sm:hidden ${
                    status.complete
                      ? 'text-green-600'
                      : status.progress > 0
                      ? 'text-yellow-600'
                      : 'text-gray-400'
                  }`}
                >
                  {index + 1}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    {section.title}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
