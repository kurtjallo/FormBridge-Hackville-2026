import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExplainRequest, ChatRequest, ChatMessage } from '../types';

// Lazy initialization to ensure env vars are loaded
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generate embedding vector for text using Gemini text-embedding-004
 * Returns a 768-dimension vector for semantic similarity search
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = getGenAI().getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Calculate cosine similarity between two embedding vectors
 * Returns a value between -1 and 1, where 1 means identical
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// RAG-based context - AI uses document context from the request instead of hardcoded facts

function buildExplainPrompt(request: ExplainRequest): string {
  const parts: string[] = [];
  const isFrench = request.language === 'fr';

  // Generic document/form assistant - works with ANY document type
  if (isFrench) {
    parts.push(`Role: Assistant pour documents et formulaires.
Goal: Expliquez ce texte pour qu'une personne immigrante ou ayant peu de littératie puisse comprendre facilement.
Language: Utilisez un français canadien très simple (niveau 4e année). Évitez les expressions compliquées et les mots difficiles. Utilisez le tutoiement.
Format: 1) Ce que ça veut dire en mots simples 2) Un exemple concret 3) Ce que tu dois faire ou écrire
Style: Phrases courtes et claires. Très amical et serviable.
Important: Basez votre réponse UNIQUEMENT sur le texte fourni. N'inventez pas d'informations.`);
  } else {
    parts.push(`Role: Document and form assistant.
Goal: Explain this text so it is very easy for an immigrant or someone with low literacy to understand.
Language: Use very simple English (Grade 4 level). Avoid idioms and big words.
Format: 1) What it means in simple words 2) A real example 3) What you need to do or write
Style: Short, clear sentences. Very friendly and helpful.
Important: Base your answer ONLY on the text provided. Do not make up information.`);
  }

  // The actual text to explain (this is the RAG context - the document content)
  parts.push(`\n📄 Text to explain: "${request.originalText}"`);

  // Field type info if it's a form field
  if (request.fieldType && request.fieldType !== 'text') {
    parts.push(`Type: ${request.fieldType}${request.required ? ' (Required)' : ''}`);
  }

  // Additional document context if provided (e.g., surrounding text, section info)
  if (request.context) {
    parts.push(`\n📋 Document context: ${request.context}`);
  }

  // Add common confusions as bullet points
  if (request.commonConfusions) {
    parts.push(`\n⚠️ Common mistakes to avoid:\n${request.commonConfusions}`);
  }

  // Add user-specific context for personalized response
  if (request.userContext) {
    parts.push(`\n👤 User's situation: ${request.userContext}`);
  }

  const explainLabel = isFrench ? 'Expliquez brièvement:' : 'Explain concisely:';
  parts.push(`\n${explainLabel}`);

  return parts.join('');
}

export async function explainQuestion(request: ExplainRequest): Promise<string> {
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      maxOutputTokens: 300,
      temperature: 0.3, // Lower temperature for consistent, factual responses
    }
  });

  const prompt = buildExplainPrompt(request);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function buildChatPrompt(request: ChatRequest): string {
  const parts: string[] = [];
  const isFrench = request.language === 'fr';

  // Generic document/form assistant - works with ANY document type
  if (isFrench) {
    parts.push(`Role: Assistant pour documents et formulaires.
Goal: Parlez à l'utilisateur comme un ami qui aide. Rendez tout facile à comprendre pour quelqu'un qui apprend le français.
Language: Utilisez un français canadien simple (niveau 3-4e année). Mots simples seulement. Phrases courtes. Utilisez le tutoiement.
Format: Gardez ça court (2-3 phrases).
Task: Répondez à la question en vous basant sur le texte du document fourni. Si vous savez quoi écrire, suggérez-le.
Important: Basez votre réponse UNIQUEMENT sur le texte fourni. N'inventez pas d'informations.
Si vous suggérez une réponse, terminez avec:
SUGGESTED_ANSWER: [valeur]
CONFIDENCE: [low|medium|high]`);
  } else {
    parts.push(`Role: Document and form assistant.
Goal: Talk to the user like a friendly helper. Make everything very easy to understand for someone who is learning English.
Language: Use Grade 3-4 English. Simple words only. Short sentences.
Format: Keep it short (2-3 sentences).
Task: Answer the question based on the document text provided. If you know what they should write, suggest it.
Important: Base your answer ONLY on the text provided. Do not make up information.
If suggesting answer, end with:
SUGGESTED_ANSWER: [value]
CONFIDENCE: [low|medium|high]`);
  }

  // The document text being discussed (RAG context)
  parts.push(`\n📄 Document text: "${request.originalText}"`);

  // Field type if it's a form field
  if (request.fieldType && request.fieldType !== 'text') {
    parts.push(`(Field type: ${request.fieldType})`);
  }

  // Additional document context if provided
  if (request.context) {
    parts.push(`\n📋 Document context: ${request.context}`);
  }

  // Add user's other answers for cross-reference context (only relevant ones)
  if (request.currentAnswers && Object.keys(request.currentAnswers).length > 0) {
    const relevantAnswers = Object.entries(request.currentAnswers)
      .filter(([key, value]) => value !== '' && value !== undefined)
      .slice(0, 5) // Limit to 5 most recent/relevant
      .map(([key, value]) => `${key}: ${value}`)
      .join(' | ');

    if (relevantAnswers) {
      const userInfoLabel = isFrench ? 'Info utilisateur' : 'User info';
      parts.push(`\n👤 ${userInfoLabel}: ${relevantAnswers}`);
    }
  }

  // Conversation history (compact format)
  if (request.conversationHistory.length > 0) {
    const recentHistory = request.conversationHistory
      .slice(-4) // Keep last 4 messages for context
      .map((msg: ChatMessage) => `${msg.role === 'user' ? 'U' : 'A'}: ${msg.content}`)
      .join('\n');
    const recentLabel = isFrench ? 'Récent' : 'Recent';
    parts.push(`\n💬 ${recentLabel}:\n${recentHistory}`);
  }

  // Current message
  const respondLabel = isFrench ? 'Répondez:' : 'Respond:';
  parts.push(`\nU: ${request.userMessage}\n\n${respondLabel}`);

  return parts.join('');
}

export async function chatAboutQuestion(request: ChatRequest): Promise<{
  message: string;
  suggestedAnswer?: string;
  confidence?: 'low' | 'medium' | 'high';
}> {
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      maxOutputTokens: 200,
      temperature: 0.4, // Slightly higher for conversational responses
    }
  });

  const prompt = buildChatPrompt(request);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Parse response for suggested answer
  const suggestedMatch = text.match(/SUGGESTED_ANSWER:\s*(.+?)(?:\n|$)/i);
  const confidenceMatch = text.match(/CONFIDENCE:\s*(low|medium|high)/i);

  // Clean the message by removing the metadata lines
  let cleanMessage = text
    .replace(/SUGGESTED_ANSWER:\s*.+?(?:\n|$)/gi, '')
    .replace(/CONFIDENCE:\s*(low|medium|high)/gi, '')
    .trim();

  return {
    message: cleanMessage,
    suggestedAnswer: suggestedMatch ? suggestedMatch[1].trim() : undefined,
    confidence: confidenceMatch
      ? (confidenceMatch[1].toLowerCase() as 'low' | 'medium' | 'high')
      : undefined,
  };
}
