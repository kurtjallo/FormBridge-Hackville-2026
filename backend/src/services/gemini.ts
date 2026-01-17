import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExplainRequest, ChatRequest, ChatMessage } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Ontario Works key facts for context injection
const OW_CONTEXT = {
  assetLimits: 'Single: $10,000 | Couple/Family: $15,000',
  exemptAssets: 'Primary home, one vehicle, RDSP, prepaid funerals',
  commonLaw: '3 months cohabitation (not 1 year like federal)',
  income: 'First $200 + 50% of remainder is exempt from earnings',
  basicNeeds: 'Single: ~$733/month | Couple: ~$1,136/month (2024 rates)',
};

function buildExplainPrompt(request: ExplainRequest): string {
  const parts: string[] = [];

  // Concise system instruction
  parts.push(`Role: Ontario Works form assistant.
Goal: Explain this so it is very easy for an immigrant or someone with low literacy to understand.
Language: Use very simple English (Grade 4 level). Avoid idioms and big words.
Format: 1) What it means 2) Example 3) What to enter
Style: Short, clear sentences. Very friendly and helpful.`);

  // Question details
  parts.push(`\nQ: "${request.originalText}"
Type: ${request.fieldType} | Required: ${request.required}`);

  // Add context only if provided
  if (request.context) {
    parts.push(`\nContext: ${request.context}`);
  }

  // Add common confusions as bullet points
  if (request.commonConfusions) {
    parts.push(`\n⚠️ Common mistakes:\n${request.commonConfusions}`);
  }

  // Add user-specific context for personalized response
  if (request.userContext) {
    parts.push(`\n👤 User's situation: ${request.userContext}`);
  }

  // Inject relevant Ontario Works facts based on question content
  const questionLower = request.originalText.toLowerCase();
  const relevantFacts: string[] = [];

  if (questionLower.includes('asset') || questionLower.includes('savings') || questionLower.includes('money')) {
    relevantFacts.push(`Asset limits: ${OW_CONTEXT.assetLimits}`);
    relevantFacts.push(`Exempt: ${OW_CONTEXT.exemptAssets}`);
  }
  if (questionLower.includes('common-law') || questionLower.includes('partner') || questionLower.includes('marital')) {
    relevantFacts.push(`Common-law in Ontario: ${OW_CONTEXT.commonLaw}`);
  }
  if (questionLower.includes('income') || questionLower.includes('earn') || questionLower.includes('work')) {
    relevantFacts.push(`Earnings exemption: ${OW_CONTEXT.income}`);
  }
  if (questionLower.includes('amount') || questionLower.includes('benefit') || questionLower.includes('receive')) {
    relevantFacts.push(`Basic amounts: ${OW_CONTEXT.basicNeeds}`);
  }

  if (relevantFacts.length > 0) {
    parts.push(`\n📋 Ontario Works facts:\n- ${relevantFacts.join('\n- ')}`);
  }

  parts.push(`\nExplain concisely:`);

  return parts.join('');
}

export async function explainQuestion(request: ExplainRequest): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
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

  // Concise system instruction
  parts.push(`Role: Ontario Works form assistant.
Goal: Talk to the user like a friendly helper. Make everything very easy to understand for someone who is learning English.
Language: Use Grade 3-4 English. Simple words only. Short sentences.
Format: Keep it short (2-3 sentences).
Task: Answer the question and if you know what they should write, suggest it.
If suggesting answer, end with:
SUGGESTED_ANSWER: [value]
CONFIDENCE: [low|medium|high]`);

  // Current question
  parts.push(`\n📝 Field: "${request.originalText}" (${request.fieldType})`);

  // Add context if provided
  if (request.context) {
    parts.push(`Context: ${request.context}`);
  }

  // Inject relevant Ontario Works facts based on question
  const questionLower = request.originalText.toLowerCase();
  const relevantFacts: string[] = [];

  if (questionLower.includes('asset') || questionLower.includes('savings')) {
    relevantFacts.push(`Assets: ${OW_CONTEXT.assetLimits} (exempt: ${OW_CONTEXT.exemptAssets})`);
  }
  if (questionLower.includes('common-law') || questionLower.includes('partner') || questionLower.includes('marital')) {
    relevantFacts.push(`Common-law: ${OW_CONTEXT.commonLaw}`);
  }
  if (questionLower.includes('income') || questionLower.includes('earn')) {
    relevantFacts.push(`Earnings: ${OW_CONTEXT.income}`);
  }

  if (relevantFacts.length > 0) {
    parts.push(`\n📋 Key facts: ${relevantFacts.join(' | ')}`);
  }

  // Add user's other answers for cross-reference context (only relevant ones)
  if (request.currentAnswers && Object.keys(request.currentAnswers).length > 0) {
    const relevantAnswers = Object.entries(request.currentAnswers)
      .filter(([key, value]) => value !== '' && value !== undefined)
      .slice(0, 5) // Limit to 5 most recent/relevant
      .map(([key, value]) => `${key}: ${value}`)
      .join(' | ');
    
    if (relevantAnswers) {
      parts.push(`\n👤 User info: ${relevantAnswers}`);
    }
  }

  // Conversation history (compact format)
  if (request.conversationHistory.length > 0) {
    const recentHistory = request.conversationHistory
      .slice(-4) // Keep last 4 messages for context
      .map((msg: ChatMessage) => `${msg.role === 'user' ? 'U' : 'A'}: ${msg.content}`)
      .join('\n');
    parts.push(`\n💬 Recent:\n${recentHistory}`);
  }

  // Current message
  parts.push(`\nU: ${request.userMessage}\n\nRespond:`);

  return parts.join('');
}

export async function chatAboutQuestion(request: ChatRequest): Promise<{
  message: string;
  suggestedAnswer?: string;
  confidence?: 'low' | 'medium' | 'high';
}> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
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
