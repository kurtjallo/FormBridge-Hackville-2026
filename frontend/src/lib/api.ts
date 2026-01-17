import { ChatMessage } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const API_BASE = `${API_URL}/api`;

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
  const response = await fetch(`${API_BASE}/chat`, {
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
  const response = await fetch(`${API_BASE}/session`, {
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
  const response = await fetch(`${API_BASE}/session/${sessionId}`);

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
  const response = await fetch(`${API_BASE}/validate`, {
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

// Support Chat API (Context-aware chatbot)

export interface SupportChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  pagePath: string;
  knowledgeContext?: string;
  additionalContext?: string;
}

export interface SupportChatResponse {
  message: string;
  suggestions?: string[];
  knowledgeUsed?: string[];
  confidence: 'high' | 'medium' | 'low' | 'unknown';
}

export async function sendSupportMessage(request: SupportChatRequest): Promise<SupportChatResponse> {
  const response = await fetch(`${API_BASE}/support-chat`, {
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

export interface KnowledgeSearchResult {
  id: string;
  category: string;
  title: string;
  content: string;
}

export async function searchKnowledge(query: string, limit: number = 5): Promise<KnowledgeSearchResult[]> {
  const response = await fetch(
    `${API_BASE}/support-chat/knowledge?q=${encodeURIComponent(query)}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to search knowledge base');
  }

  const data = await response.json();
  return data.results;
}
