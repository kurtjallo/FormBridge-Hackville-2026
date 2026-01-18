import { ChatMessage, Language } from '@/types';
import { useFormStore } from '@/store/formStore';

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
  language?: Language;
}

export interface ChatResponse {
  message: string;
  suggestedAnswer?: string;
  confidence?: 'low' | 'medium' | 'high';
}

export async function chatWithAI(request: ChatRequest): Promise<ChatResponse> {
  const language = useFormStore.getState().language;
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...request, language }),
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

// PDF Forms API

export interface PDFFormMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  pdfUrl: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  pageCount?: number;
  isXFA?: boolean;
}

export interface ListFormsResponse {
  forms: PDFFormMeta[];
  total: number;
  limit: number;
  offset: number;
}

export interface CategoryCounts {
  employment: number;
  legal: number;
  finance: number;
  government: number;
  healthcare: number;
  immigration: number;
}

export async function listPDFForms(options?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ListFormsResponse> {
  const params = new URLSearchParams();
  if (options?.category) params.set('category', options.category);
  if (options?.search) params.set('search', options.search);
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.offset) params.set('offset', options.offset.toString());

  const response = await fetch(`${API_BASE}/pdf-forms?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to list forms');
  }

  return response.json();
}

export async function getPDFForm(id: string): Promise<PDFFormMeta> {
  const response = await fetch(`${API_BASE}/pdf-forms/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Form not found');
    }
    throw new Error('Failed to get form');
  }

  return response.json();
}

export async function getFormCategoryCounts(): Promise<CategoryCounts> {
  const response = await fetch(`${API_BASE}/pdf-forms/categories`);

  if (!response.ok) {
    throw new Error('Failed to get category counts');
  }

  const data = await response.json();
  return data.categories;
}

export async function uploadPDFForm(
  data: {
    pdfBase64: string;
    name: string;
    description: string;
    category: string;
    estimatedTime?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
  }
): Promise<{ id: string; name: string; pdfUrl: string }> {
  const response = await fetch(`${API_BASE}/pdf-forms/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to upload form');
  }

  return response.json();
}

export async function deletePDFForm(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/pdf-forms/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete form');
  }
}

// PDF Session API

export interface PDFSessionData {
  sessionId: string;
  formId: string;
  formName: string;
  category: string;
  fieldValues: Record<string, string>;
  lastPage: number;
  progress: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  chatHistory: Array<{
    fieldId?: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export async function createPDFSession(data: {
  formId: string;
  formName: string;
  category: string;
}): Promise<{ sessionId: string }> {
  const response = await fetch(`${API_BASE}/pdf-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create session');
  }

  return response.json();
}

export async function getPDFSession(sessionId: string): Promise<PDFSessionData> {
  const response = await fetch(`${API_BASE}/pdf-session/${sessionId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Session not found');
    }
    throw new Error('Failed to load session');
  }

  return response.json();
}

export async function updatePDFSession(
  sessionId: string,
  data: {
    fieldValues?: Record<string, string>;
    lastPage?: number;
    progress?: number;
    status?: 'in_progress' | 'completed' | 'abandoned';
  }
): Promise<PDFSessionData> {
  const response = await fetch(`${API_BASE}/pdf-session/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update session');
  }

  return response.json();
}

export async function addPDFSessionChat(
  sessionId: string,
  data: {
    fieldId?: string;
    role: 'user' | 'assistant';
    content: string;
  }
): Promise<PDFSessionData> {
  const response = await fetch(`${API_BASE}/pdf-session/${sessionId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to add chat message');
  }

  return response.json();
}

// RAG Search API

export interface RAGSearchResult {
  doc: {
    _id: string;
    category: string;
    title: string;
    content: string;
    keywords: string[];
    source?: string;
  };
  score: number;
}

export async function searchRAG(
  query: string,
  options?: { category?: string; formId?: string; limit?: number }
): Promise<RAGSearchResult[]> {
  const params = new URLSearchParams({ query });
  if (options?.category) params.set('category', options.category);
  if (options?.formId) params.set('formId', options.formId);
  if (options?.limit) params.set('limit', options.limit.toString());

  const response = await fetch(`${API_BASE}/rag/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to search knowledge base');
  }

  const data = await response.json();
  return data.results;
}
