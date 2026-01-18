import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  knowledgeBase, 
  SupportChatRequest, 
  SupportChatResponse,
  UNKNOWN_RESPONSES 
} from '../services/knowledgeBase';

const router = Router();

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

// System prompt for the support chatbot
const SUPPORT_SYSTEM_PROMPT = `You are a helpful customer support assistant for FormBridge, an Ontario Works application helper.

YOUR ROLE:
- Help users fill out forms by explaining questions in plain language
- Explain government terminology and jargon
- Guide users through the application process
- Answer FAQs about Ontario Works eligibility and process

RESPONSE GUIDELINES:
1. Keep responses concise (2-3 sentences when possible)
2. Use simple language (grade 6 reading level)
3. Be warm, supportive, and non-judgmental
4. If you're not sure about something, say so honestly
5. For case-specific questions, recommend contacting a caseworker

WHEN YOU DON'T KNOW:
- Admit when something is outside your knowledge
- Suggest contacting Ontario Works directly for case-specific questions
- Offer to help with something else you CAN answer

FORMAT:
- Use bullet points for lists
- Bold important terms or numbers
- Keep paragraphs short`;

// Language display names for the prompt
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'French',
};

/**
 * Build the chat prompt with knowledge context
 */
function buildSupportChatPrompt(request: SupportChatRequest & { language?: string }): string {
  const parts: string[] = [SUPPORT_SYSTEM_PROMPT];

  // Add language instruction
  if (request.language && request.language !== 'en') {
    const languageName = LANGUAGE_NAMES[request.language] || request.language;
    parts.push(`\n🌐 LANGUAGE: Respond in ${languageName}.`);
  }

  // Add page context
  if (request.pagePath) {
    parts.push(`\n📍 USER LOCATION: ${request.pagePath}`);
  }

  // Add knowledge base context
  const kbContext = knowledgeBase.buildPromptContext(request.message, request.pagePath);
  if (kbContext) {
    parts.push(`\n${kbContext}`);
  }

  // Add any additional context provided by frontend
  if (request.knowledgeContext) {
    parts.push(`\n📖 ADDITIONAL CONTEXT:\n${request.knowledgeContext}`);
  }

  // Add conversation history
  if (request.conversationHistory && request.conversationHistory.length > 0) {
    parts.push('\n💬 CONVERSATION HISTORY:');
    request.conversationHistory.slice(-6).forEach(msg => {
      parts.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`);
    });
  }

  // Add current message
  parts.push(`\nUser: ${request.message}`);
  parts.push('\nAssistant:');

  return parts.join('\n');
}

/**
 * Determine confidence level based on knowledge match
 */
function determineConfidence(query: string): 'high' | 'medium' | 'low' | 'unknown' {
  const results = knowledgeBase.search(query, 3);
  
  if (results.length === 0) return 'unknown';
  
  // Check if we have a strong match (terminology or FAQ)
  const hasStrongMatch = results.some(r => 
    r.category === 'terminology' || r.category === 'faq'
  );
  
  if (hasStrongMatch && results.length >= 2) return 'high';
  if (hasStrongMatch || results.length >= 2) return 'medium';
  return 'low';
}

/**
 * Generate suggestions based on context
 */
function generateSuggestions(query: string, pagePath: string): string[] {
  const suggestions: string[] = [];
  
  // Get related knowledge entries
  const results = knowledgeBase.search(query, 3);
  
  // Add suggestions based on related entries
  results.forEach(entry => {
    if (entry.relatedEntries) {
      entry.relatedEntries.forEach(relId => {
        const related = knowledgeBase.getEntry(relId);
        if (related && suggestions.length < 3) {
          suggestions.push(`Tell me about ${related.title.toLowerCase()}`);
        }
      });
    }
  });

  // Add page-specific suggestions
  if (pagePath.includes('form')) {
    if (!suggestions.includes('How do I save my progress?')) {
      suggestions.push('How do I save my progress?');
    }
  }

  // Add general suggestions if needed
  const generalSuggestions = [
    'What documents do I need?',
    'Am I eligible for Ontario Works?',
    'How long does the process take?',
  ];

  while (suggestions.length < 3 && generalSuggestions.length > 0) {
    const suggestion = generalSuggestions.shift()!;
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  }

  return suggestions.slice(0, 3);
}

/**
 * POST /api/support-chat
 * 
 * Main endpoint for the context-aware support chatbot
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      message,
      conversationHistory = [],
      pagePath = '/',
      knowledgeContext,
      additionalContext,
      language = 'en',
    } = req.body as SupportChatRequest & { language?: string };

    // Validate required fields
    if (!message || typeof message !== 'string') {
      res.status(400).json({
        error: 'Missing required field: message',
      });
      return;
    }

    // Determine confidence before generating response
    const confidence = determineConfidence(message);
    
    // If we have no knowledge, provide a graceful fallback
    if (confidence === 'unknown') {
      const fallbackResponse: SupportChatResponse = {
        message: knowledgeBase.getUnknownResponse(),
        suggestions: generateSuggestions(message, pagePath),
        confidence: 'unknown',
      };
      res.json(fallbackResponse);
      return;
    }

    // Build prompt with knowledge context
    const prompt = buildSupportChatPrompt({
      message,
      conversationHistory,
      pagePath,
      knowledgeContext,
      additionalContext,
      language,
    });

    // Generate AI response
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.4,
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Get knowledge entries used
    const searchResults = knowledgeBase.search(message, 3);
    const knowledgeUsed = searchResults.map(r => r.id);

    // Generate follow-up suggestions
    const suggestions = generateSuggestions(message, pagePath);

    const response: SupportChatResponse = {
      message: responseText,
      suggestions,
      knowledgeUsed,
      confidence,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in /support-chat:', error);
    
    // Provide a graceful error response
    res.status(500).json({
      message: "I'm having some technical difficulties right now. Please try again in a moment, or contact Ontario Works directly for urgent questions.",
      confidence: 'unknown',
      suggestions: ['What documents do I need?', 'Am I eligible?'],
    });
  }
});

/**
 * GET /api/support-chat/knowledge
 * 
 * Endpoint to search the knowledge base directly
 */
router.get('/knowledge', (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!query) {
      res.status(400).json({ error: 'Missing query parameter: q' });
      return;
    }

    const results = knowledgeBase.search(query, limit);
    
    res.json({
      query,
      count: results.length,
      results: results.map(r => ({
        id: r.id,
        category: r.category,
        title: r.title,
        content: r.content,
      })),
    });
  } catch (error) {
    console.error('Error in /support-chat/knowledge:', error);
    res.status(500).json({ error: 'Failed to search knowledge base' });
  }
});

/**
 * GET /api/support-chat/knowledge/:id
 * 
 * Get a specific knowledge entry by ID
 */
router.get('/knowledge/:id', (req: Request, res: Response) => {
  try {
    const entry = knowledgeBase.getEntry(req.params.id);
    
    if (!entry) {
      res.status(404).json({ error: 'Knowledge entry not found' });
      return;
    }

    res.json(entry);
  } catch (error) {
    console.error('Error in /support-chat/knowledge/:id:', error);
    res.status(500).json({ error: 'Failed to get knowledge entry' });
  }
});

export { router as supportChatRouter };
