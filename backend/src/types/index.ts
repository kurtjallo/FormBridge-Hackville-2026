export type Language = 'en' | 'fr';

export interface ExplainRequest {
  questionId: string;
  originalText: string;
  fieldType: string;
  required: boolean;
  context?: string;
  commonConfusions?: string;
  userContext?: string;
  language?: Language;
}

export interface ExplainResponse {
  explanation: string;
  questionId: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  questionId: string;
  originalText: string;
  fieldType: string;
  context?: string;
  conversationHistory: ChatMessage[];
  userMessage: string;
  currentAnswers?: Record<string, string>;
  language?: Language;
}

export interface ChatResponse {
  message: string;
  suggestedAnswer?: string;
  confidence?: 'low' | 'medium' | 'high';
}

export interface QuestionData {
  id: string;
  originalText: string;
  fieldType: string;
  required: boolean;
  context?: string;
  commonConfusions?: string;
}

export interface SessionData {
  sessionId: string;
  answers: Record<string, string | number | boolean>;
  conversations: Record<string, ChatMessage[]>;
  completedSections: string[];
}

export interface SaveSessionRequest {
  sessionId?: string;
  answers: Record<string, string | number | boolean>;
  conversations?: Record<string, ChatMessage[]>;
  completedSections?: string[];
}

export interface SaveSessionResponse {
  sessionId: string;
  message: string;
}

export interface ValidateRequest {
  answers: Record<string, string | number | boolean>;
}

export interface ValidationIssue {
  fieldId: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface ValidateResponse {
  valid: boolean;
  issues: ValidationIssue[];
}
