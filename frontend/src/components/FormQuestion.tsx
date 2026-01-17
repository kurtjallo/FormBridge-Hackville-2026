'use client';

import { useFormStore } from '@/store/formStore';
import { FormQuestion as FormQuestionType } from '@/types';
import { HelpCircle, AlertCircle } from 'lucide-react';
import { validateField } from '@/lib/validation';

interface FormQuestionProps {
  question: FormQuestionType;
  onHelpClick: () => void;
}

export function FormQuestion({ question, onHelpClick }: FormQuestionProps) {
  const answers = useFormStore((state) => state.answers);
  const setAnswer = useFormStore((state) => state.setAnswer);
  const validationErrors = useFormStore((state) => state.validationErrors);
  const setValidationError = useFormStore((state) => state.setValidationError);

  const value = answers[question.fieldId] ?? '';
  const error = validationErrors[question.fieldId];

  const handleChange = (newValue: string | number | boolean) => {
    setAnswer(question.fieldId, newValue);
    // Clear error on change
    if (error) {
      setValidationError(question.fieldId, null);
    }
  };

  const handleBlur = () => {
    if (typeof value === 'string') {
      const result = validateField(question.fieldId, value);
      if (!result.valid && result.message) {
        setValidationError(question.fieldId, result.message);
      }
    }
  };

  const inputClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
    error ? 'border-red-500 bg-red-50' : 'border-gray-300'
  }`;

  const renderInput = () => {
    switch (question.fieldType) {
      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`${inputClasses} bg-white`}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            rows={3}
            className={`${inputClasses} resize-none`}
            placeholder="Enter your response..."
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value as string}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : '')}
            onBlur={handleBlur}
            className={inputClasses}
            placeholder="Enter a number..."
            min={0}
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">{question.originalText}</span>
          </label>
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={inputClasses}
            placeholder="Enter your response..."
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        {question.fieldType !== 'checkbox' && (
          <label className="block text-gray-800 font-medium text-sm sm:text-base">
            {question.originalText}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <button
          onClick={onHelpClick}
          className="flex-shrink-0 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
          title="Get help with this question"
          aria-label="Get help with this question"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {renderInput()}

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
