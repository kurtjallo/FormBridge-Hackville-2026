import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FormState, ChatMessage } from '@/types';

const initialState = {
  answers: {},
  activeQuestionId: null,
  conversations: {},
  sessionId: null,
  completedSections: [],
  validationErrors: {},
  language: 'en' as const,
};

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      ...initialState,

      setAnswer: (fieldId: string, value: string | number | boolean) =>
        set((state) => ({
          answers: { ...state.answers, [fieldId]: value },
        })),

      setActiveQuestion: (id: string | null) =>
        set({ activeQuestionId: id }),

      addMessage: (questionId: string, message: ChatMessage) =>
        set((state) => ({
          conversations: {
            ...state.conversations,
            [questionId]: [...(state.conversations[questionId] || []), message],
          },
        })),

      setSessionId: (id: string) =>
        set({ sessionId: id }),

      markSectionComplete: (sectionId: string) =>
        set((state) => ({
          completedSections: state.completedSections.includes(sectionId)
            ? state.completedSections
            : [...state.completedSections, sectionId],
        })),

      setValidationError: (fieldId: string, error: string | null) =>
        set((state) => {
          if (error === null) {
            const { [fieldId]: _, ...rest } = state.validationErrors;
            return { validationErrors: rest };
          }
          return { validationErrors: { ...state.validationErrors, [fieldId]: error } };
        }),

      clearValidationErrors: () =>
        set({ validationErrors: {} }),

      setLanguage: (lang: 'en' | 'fr') =>
        set({ language: lang }),

      reset: () => set(initialState),
    }),
    {
      name: 'formbridge-storage',
      partialize: (state) => ({
        answers: state.answers,
        sessionId: state.sessionId,
        completedSections: state.completedSections,
        conversations: state.conversations,
        language: state.language,
      }),
    }
  )
);
