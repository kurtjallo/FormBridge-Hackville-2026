'use client';

import { useFormStore } from '@/store/formStore';
import { Sparkles, Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/i18n';

interface SuggestionButtonProps {
  fieldId: string;
  suggestion: string;
  confidence?: 'low' | 'medium' | 'high';
}

export function SuggestionButton({ fieldId, suggestion, confidence }: SuggestionButtonProps) {
  const { t } = useTranslation();
  const setAnswer = useFormStore((state) => state.setAnswer);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setAnswer(fieldId, suggestion);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  const confidenceColors = {
    low: 'border-yellow-300 bg-yellow-50',
    medium: 'border-blue-300 bg-blue-50',
    high: 'border-green-300 bg-green-50',
  };

  const bgColor = confidence ? confidenceColors[confidence] : 'border-blue-300 bg-blue-50';

  return (
    <button
      onClick={handleApply}
      disabled={applied}
      className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg border-2 ${bgColor} hover:opacity-90 transition-all text-left`}
    >
      {applied ? (
        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
      ) : (
        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
      )}
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-0.5">
          {applied ? t('chat.suggestion.applied') : t('chat.suggestion.label')}
        </p>
        <p className="text-sm text-gray-800 font-medium">{suggestion}</p>
      </div>
    </button>
  );
}
