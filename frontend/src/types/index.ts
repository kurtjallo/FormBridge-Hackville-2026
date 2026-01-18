// Form structure types
export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  sections: FormSection[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  questions: FormQuestion[];
}

export interface FormQuestion {
  id: string;
  fieldId: string;
  originalText: string;
  fieldType: 'text' | 'number' | 'select' | 'textarea' | 'checkbox';
  options?: string[];
  required: boolean;
  context: string;
  commonConfusions: string[];
  relatedQuestions: string[];
}

// Chat types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestedAnswer?: string;
  confidence?: 'low' | 'medium' | 'high';
  timestamp: number;
}

// Language type
export type Language = 'en' | 'fr';

// Store types
export interface FormState {
  // Form answers
  answers: Record<string, string | number | boolean>;
  setAnswer: (fieldId: string, value: string | number | boolean) => void;

  // Active question for chat
  activeQuestionId: string | null;
  setActiveQuestion: (id: string | null) => void;

  // Conversations per question
  conversations: Record<string, ChatMessage[]>;
  addMessage: (questionId: string, message: ChatMessage) => void;

  // Session management
  sessionId: string | null;
  setSessionId: (id: string) => void;

  // Progress tracking
  completedSections: string[];
  markSectionComplete: (sectionId: string) => void;

  // Validation state
  validationErrors: Record<string, string>;
  setValidationError: (fieldId: string, error: string | null) => void;
  clearValidationErrors: () => void;

  // Language preference
  language: Language;
  setLanguage: (lang: Language) => void;

  // Reset
  reset: () => void;
}
