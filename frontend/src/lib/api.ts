import { ChatMessage } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface ChatRequest {
  questionId: string;
  originalText: string;
  fieldType: string;
  context?: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userMessage: string;
  currentAnswers?: Record<string, string | number | boolean>;
}

export interface ChatResponse {
  message: string;
  suggestedAnswer?: string;
  confidence?: 'low' | 'medium' | 'high';
}

export async function chatWithAI(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Session API

export interface SessionData {
  sessionId: string;
  answers: Record<string, string | number | boolean>;
  conversations: Record<string, ChatMessage[]>;
  completedSections: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveSessionRequest {
  sessionId?: string;
  answers: Record<string, string | number | boolean>;
  conversations?: Record<string, ChatMessage[]>;
  completedSections?: string[];
}

export async function saveSession(data: SaveSessionRequest): Promise<{ sessionId: string }> {
  const response = await fetch(`${API_URL}/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

export async function loadSession(sessionId: string): Promise<SessionData> {
  const response = await fetch(`${API_URL}/session/${sessionId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Session not found');
    }
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Validation API

export interface ValidationIssue {
  fieldId: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface ValidateResponse {
  valid: boolean;
  issues: ValidationIssue[];
}

export async function validateForm(answers: Record<string, string | number | boolean>): Promise<ValidateResponse> {
  const response = await fetch(`${API_URL}/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}
