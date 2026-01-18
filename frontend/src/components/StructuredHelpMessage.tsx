'use client';

import { HelpCircle, ChevronRight } from 'lucide-react';

interface StructuredHelpMessageProps {
  interpretation: string;
  breakdown: string[];
  suggestedQuestions: string[];
  onQuestionClick: (question: string) => void;
}

export function StructuredHelpMessage({
  interpretation,
  breakdown,
  suggestedQuestions,
  onQuestionClick,
}: StructuredHelpMessageProps) {
  return (
    <div className="space-y-4">
      {/* Interpretation - prominent display */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-blue-600 font-medium mb-1">This is asking:</p>
            <p className="text-sm text-blue-900 font-medium">{interpretation}</p>
          </div>
        </div>
      </div>

      {/* Breakdown - bullet points */}
      {breakdown.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium">Key points:</p>
          <ul className="space-y-1.5">
            {breakdown.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Questions - clickable buttons */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">Ask a follow-up:</p>
        <div className="flex flex-col gap-1.5">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => onQuestionClick(question)}
              className="
                flex items-center justify-between
                px-3 py-2
                bg-gray-50 hover:bg-gray-100
                border border-gray-200 hover:border-gray-300
                rounded-lg
                text-sm text-gray-700 hover:text-gray-900
                transition-colors
                text-left
              "
            >
              <span>{question}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
