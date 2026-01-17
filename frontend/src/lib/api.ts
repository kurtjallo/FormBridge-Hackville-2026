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
