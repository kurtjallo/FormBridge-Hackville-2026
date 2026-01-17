'use client';

import { useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { ProgressBar } from '@/components/ProgressBar';
import { FormSection } from '@/components/FormSection';
import { ChatPanel } from '@/components/ChatPanel';
import { ontarioWorksForm } from '@/data/ontarioWorksForm';
import { useFormStore } from '@/store/formStore';
import { saveSession } from '@/lib/api';

export default function FormPage() {
  const setActiveQuestion = useFormStore((state) => state.setActiveQuestion);
  const activeQuestionId = useFormStore((state) => state.activeQuestionId);
  const answers = useFormStore((state) => state.answers);
  const conversations = useFormStore((state) => state.conversations);
  const sessionId = useFormStore((state) => state.sessionId);
  const setSessionId = useFormStore((state) => state.setSessionId);
  const completedSections = useFormStore((state) => state.completedSections);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save session when answers change (debounced)
  const autoSave = useCallback(async () => {
    if (Object.keys(answers).length === 0) return;

    try {
      const result = await saveSession({
        sessionId: sessionId || undefined,
        answers,
        conversations,
        completedSections,
      });

      if (!sessionId && result.sessionId) {
        setSessionId(result.sessionId);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [answers, conversations, completedSections, sessionId, setSessionId]);

  useEffect(() => {
    // Debounce auto-save by 2 seconds
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(autoSave, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [answers, autoSave]);

  const handleHelpClick = (questionId: string) => {
    setActiveQuestion(questionId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ProgressBar sections={ontarioWorksForm.sections} />

      <main
        className={`max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 transition-all duration-300 ${
          activeQuestionId ? 'md:mr-[420px]' : ''
        } ${activeQuestionId ? 'hidden md:block' : ''}`}
      >
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {ontarioWorksForm.name}
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {ontarioWorksForm.description}
          </p>
          {sessionId && (
            <p className="text-xs text-gray-400 mt-2">
              Session: {sessionId.slice(0, 8)}... (auto-saved)
            </p>
          )}
        </div>

        {ontarioWorksForm.sections.map((section, index) => (
          <FormSection
            key={section.id}
            section={section}
            sectionNumber={index + 1}
            onHelpClick={handleHelpClick}
          />
        ))}
      </main>

      <ChatPanel />
    </div>
  );
}
