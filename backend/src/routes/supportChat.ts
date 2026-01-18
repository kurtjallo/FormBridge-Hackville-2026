import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  knowledgeBase,
  SupportChatRequest,
  SupportChatResponse,
} from '../services/knowledgeBase';
import { getRAGContext } from '../services/ragService';

const router = Router();

// Lazy initialization to ensure env vars are loaded after dotenv.config()
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

// System prompt for the support chatbot - category-agnostic
const SUPPORT_SYSTEM_PROMPT = `You are a helpful assistant for FormBridge, a platform that helps users understand and complete various documents and forms.

YOUR ROLE:
- Help users understand forms and documents by explaining content in plain language
- Explain terminology, jargon, and legal/technical terms
- Guide users through form completion and document understanding
- Answer questions using the provided document context and your general knowledge

DOCUMENT TYPES YOU MAY HELP WITH:
- Government forms (social services, benefits applications, permits)
- Legal documents (NDAs, contracts, agreements, waivers)
- Financial forms (tax documents, loan applications, insurance claims)
- Any other structured document the user is working with

STRICT FORMATTING RULES (FOLLOW THESE EXACTLY):
1.  **NO BOLD GREETINGS:** Never bold the introductory sentence. Start with normal text (e.g., "Hi there! I can help...").
2.  **CLEAN LISTS:** Use standard hyphens (-) for lists. Do NOT use asterisks (*) for bullets.
3.  **HEADERS:** Use bold keys for definitions (e.g., **Indemnification:** The promise to pay...).
4.  **SPACING:** You MUST put a blank line between every paragraph and list item. Large blocks of text are forbidden.
5.  **NO RAW ASTERISKS:** Never use independent asterisks. Only use them pairs for **bolding specific terms**.

RESPONSE GUIDELINES:
- **Be a Teacher:** Define terms simply.
- **Context Aware:** If the user provided document text, refer to it.
- **Limits:** If you don't know, admit it and suggest a professional.

EXAMPLE OF GOOD FORMAT:
"Here is what that section means:

**Term:** Definition of the term.

- **Point 1:** Explanation of point 1.

- **Point 2:** Explanation of point 2.

I hope that helps!"`;

// Additional prompt for text selection help requests
const SELECTION_HELP_PROMPT = `
WHEN THE USER ASKS ABOUT SELECTED/HIGHLIGHTED TEXT FROM A FORM:
You MUST respond using this EXACT structure with these markers:

INTERPRETATION: [One clear sentence explaining what this text is asking in plain, everyday language]

BREAKDOWN:
- [First key point about what to consider or include]
- [Second key point about what to exclude or watch out for]
- [Third key point if relevant, otherwise omit this line]

SUGGESTED_QUESTIONS:
- What does this mean?
- Who should I include?
- What if I'm not sure?

IMPORTANT RULES FOR SELECTION HELP:
- The INTERPRETATION line must be ONE sentence that transforms jargon into simple words
- BREAKDOWN should have 2-4 bullet points maximum, each starting with a hyphen
- SUGGESTED_QUESTIONS must always include exactly 3 questions, each on its own line with a hyphen
- Keep your total response under 200 words
- Do NOT add any text after SUGGESTED_QUESTIONS
`;

/**
 * Check if the message is a text selection help request
 */
function isSelectionHelpRequest(message: string, additionalContext?: string): boolean {
  return message.toLowerCase().includes('help me understand this text') ||
         message.toLowerCase().includes('help understanding') ||
         (additionalContext?.toLowerCase().includes('selected text') ?? false);
}

/**
 * Parse structured response from selection help
 */
interface StructuredSelectionResponse {
  interpretation: string;
  breakdown: string[];
  suggestedQuestions: string[];
}

function parseSelectionHelpResponse(text: string): StructuredSelectionResponse | null {
  // Check if response has structured format
  const hasInterpretation = text.includes('INTERPRETATION:');
  const hasBreakdown = text.includes('BREAKDOWN:');
  const hasSuggestions = text.includes('SUGGESTED_QUESTIONS:');

  if (!hasInterpretation || !hasBreakdown || !hasSuggestions) {
    return null; // Not a structured response
  }

  // Extract INTERPRETATION
  const interpretationMatch = text.match(/INTERPRETATION:\s*(.+?)(?=\n|BREAKDOWN:)/is);
  const interpretation = interpretationMatch ? interpretationMatch[1].trim() : '';

  // Extract BREAKDOWN bullet points
  const breakdownMatch = text.match(/BREAKDOWN:\s*([\s\S]+?)(?=SUGGESTED_QUESTIONS:)/i);
  const breakdownText = breakdownMatch ? breakdownMatch[1] : '';
  const breakdown = breakdownText
    .split(/\n/)
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(line => line.length > 0);

  // Extract SUGGESTED_QUESTIONS
  const suggestionsMatch = text.match(/SUGGESTED_QUESTIONS:\s*([\s\S]+?)$/i);
  const suggestionsText = suggestionsMatch ? suggestionsMatch[1] : '';
  const suggestedQuestions = suggestionsText
    .split(/\n/)
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(line => line.length > 0 && line.endsWith('?'))
    .slice(0, 3);

  // Fill default suggestions if parsing failed
  const defaults = ['What does this mean?', 'Who should I include?', 'What if I\'m not sure?'];
  while (suggestedQuestions.length < 3) {
    suggestedQuestions.push(defaults[suggestedQuestions.length]);
  }

  return {
    interpretation,
    breakdown,
    suggestedQuestions,
  };
}


/**
 * Build the chat prompt with knowledge context
 */
function buildSupportChatPrompt(request: SupportChatRequest, ragContext?: string, isSelectionHelp?: boolean): string {
  const parts: string[] = [SUPPORT_SYSTEM_PROMPT];

  // Add selection help prompt if this is a text selection request
  if (isSelectionHelp) {
    parts.push(SELECTION_HELP_PROMPT);
  }

  // Add page context
  if (request.pagePath) {
    parts.push(`\n📍 USER LOCATION: ${request.pagePath}`);
  }

  // Add form-scoped RAG context (highest priority - from ingested PDF)
  if (ragContext) {
    parts.push(`\n📄 DOCUMENT CONTEXT (from the form being viewed):\n${ragContext}`);
  }

  // Add general knowledge base context
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
function determineConfidence(query: string): 'high' | 'medium' | 'low' {
  const results = knowledgeBase.search(query, 3);

  // No RAG results - return 'low' to allow LLM to use general knowledge
  if (results.length === 0) return 'low';

  // Check if we have a strong match (legal, financial, or government terminology)
  const hasStrongMatch = results.some(r =>
    r.category === 'legal' || r.category === 'financial' || r.category === 'government'
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
          suggestions.push(`Tell me about ${related.title.toLowerCase()} `);
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
      formId,
    } = req.body as SupportChatRequest;

    // Validate required fields
    if (!message || typeof message !== 'string') {
      res.status(400).json({
        error: 'Missing required field: message',
      });
      return;
    }

    // Get form-scoped RAG context if formId is provided
    let ragContext = '';
    if (formId) {
      try {
        ragContext = await getRAGContext(message, undefined, formId);
        if (ragContext) {
          console.log(`RAG context retrieved for form ${formId}`);
        }
      } catch (ragError) {
        console.warn(`RAG lookup failed for form ${formId}:`, ragError);
        // Continue without RAG context - will use general knowledge
      }
    }

    // Determine confidence before generating response
    const confidence = determineConfidence(message);

    // Check if this is a text selection help request
    const selectionHelp = isSelectionHelpRequest(message, additionalContext);

    // Build prompt with knowledge context
    const prompt = buildSupportChatPrompt({
      message,
      conversationHistory,
      pagePath,
      knowledgeContext,
      additionalContext,
      formId,
    }, ragContext, selectionHelp);

    // Generate AI response
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
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

    // Try to parse structured response if this was a selection help request
    const structuredResponse = selectionHelp ? parseSelectionHelpResponse(responseText) : null;

    // Generate follow-up suggestions (use parsed ones if available)
    const suggestions = structuredResponse
      ? structuredResponse.suggestedQuestions
      : generateSuggestions(message, pagePath);

    // Build a clean message for display
    const displayMessage = structuredResponse
      ? `${structuredResponse.interpretation}\n\n${structuredResponse.breakdown.map(b => `- ${b}`).join('\n')}`
      : responseText;

    const response: SupportChatResponse = {
      message: displayMessage,
      suggestions,
      knowledgeUsed,
      confidence,
      structured: structuredResponse ? {
        interpretation: structuredResponse.interpretation,
        breakdown: structuredResponse.breakdown,
        suggestedQuestions: structuredResponse.suggestedQuestions,
      } : undefined,
    };

    res.json(response);
  } catch (error: unknown) {
    console.error('Error in /support-chat:', error);

    // Determine error message based on error type
    let userMessage = "I'm having some technical difficulties right now. Please try again in a moment, or contact Ontario Works directly for urgent questions.";

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      userMessage = "I'm currently experiencing high demand. Please try again in a few moments.";
    } else if (errorMessage.includes('403') || errorMessage.includes('API Key')) {
      userMessage = "There's a configuration issue with the AI service. Please contact support.";
    } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      userMessage = "The AI service is temporarily unavailable. Please try again later.";
    }

    // Provide a graceful error response
    res.status(500).json({
      message: userMessage,
      confidence: 'low',
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
