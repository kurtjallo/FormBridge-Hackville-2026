# Context-Aware Customer Support Chatbot

This document outlines the architecture and implementation of the context-aware customer support chatbot for FormBridge.

## Overview

The chatbot is designed to:
1. **Persist across all pages** - Available as a floating widget throughout the application
2. **Be context-aware** - Understands which page the user is on and what they're doing
3. **Use a knowledge base** - Derived from website content, form validation rules, and terminology
4. **Handle edge cases gracefully** - Admits when it doesn't know something

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   ChatWidget    │  │  ChatContext    │  │ usePageContext  │ │
│  │   (Component)   │  │   (Provider)    │  │     (Hook)      │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                    │           │
│           └────────────────────┼────────────────────┘           │
│                                │                                │
│  ┌─────────────────────────────┴─────────────────────────────┐ │
│  │                    Knowledge Base (Frontend)               │ │
│  │  - Terminology glossary                                    │ │
│  │  - Validation rules                                        │ │
│  │  - Navigation guides                                       │ │
│  │  - FAQs                                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                 /api/support-chat                           ││
│  │  - Receives user message + page context                     ││
│  │  - Queries knowledge base                                   ││
│  │  - Builds AI prompt with relevant context                   ││
│  │  - Handles unknown questions gracefully                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                │                                 │
│  ┌─────────────────────────────┴─────────────────────────────┐  │
│  │                 Knowledge Base (Backend)                   │  │
│  │  - Mirrors frontend knowledge                              │  │
│  │  - Provides search and retrieval                           │  │
│  │  - Builds AI context strings                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                │                                 │
│                                ▼                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Gemini AI API                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. ChatWidget (`frontend/src/components/ChatWidget.tsx`)

A reusable, self-contained chat widget component.

**Features:**
- Floating button that expands to full chat interface
- Minimizable and closable
- Mobile-responsive (full-screen on mobile, floating on desktop)
- Typing indicators and message animations
- Quick suggestion buttons
- Knowledge source attribution

**Props:**
```typescript
interface ChatWidgetProps {
  pagePath?: string;           // Current page for context
  welcomeMessage?: string;     // Custom welcome message
  position?: 'bottom-right' | 'bottom-left';
  initialOpen?: boolean;
  className?: string;
  onMessageSent?: (message: string) => void;
  apiEndpoint?: string;        // Defaults to /api/support-chat
  additionalContext?: string;  // Extra context for all requests
}
```

**Usage:**
```tsx
<ChatWidget 
  pagePath="/form/income"
  welcomeMessage="Hi! Need help with the income section?"
/>
```

### 2. Knowledge Base (`frontend/src/lib/knowledgeBase.ts`)

A client-side knowledge repository for instant lookups and fallback responses.

**Structure:**
```typescript
interface KnowledgeEntry {
  id: string;
  category: 'terminology' | 'validation' | 'navigation' | 'faq' | 'guide';
  title: string;
  content: string;
  keywords: string[];
  relatedEntries?: string[];
  pageContext?: string[];  // Which pages this is relevant to
}
```

**Categories:**
- **Terminology**: Definitions of jargon (e.g., "benefit unit", "common-law")
- **Validation**: Form field validation rules and explanations
- **Navigation**: Help with using the application
- **FAQ**: Common questions and answers
- **Guide**: Step-by-step instructions

**Key Methods:**
```typescript
// Search by query
knowledgeBase.search("common-law", 5)

// Get page-specific knowledge
knowledgeBase.getPageKnowledge("/form/income")

// Get validation rules
knowledgeBase.getValidationRules("postalCode")

// Build AI context
knowledgeBase.buildContextForAI("What is gross income?", "/form/income")
```

### 3. Page Context Hook (`frontend/src/hooks/usePageContext.ts`)

React hooks for retrieving contextual information about the current page.

**Hooks:**
- `usePageContext()` - Full page context including current section/question
- `useContextualHelp()` - Helper functions for field-specific help
- `useFormFieldContext()` - Context for a specific form field

**Example:**
```tsx
function MyComponent() {
  const { pageContext } = usePageContext({ activeQuestionId: 'income-1' });
  
  return (
    <div>
      <h1>{pageContext.title}</h1>
      <p>Relevant knowledge: {pageContext.relevantKnowledge.length} entries</p>
    </div>
  );
}
```

### 4. Chat Context Provider (`frontend/src/context/ChatContext.tsx`)

Global context for managing chat state across the application.

**Provides:**
- `isOpen` / `openChat` / `closeChat` / `toggleChat` - Widget visibility
- `pageContext` - Current page context
- `searchKnowledge(query)` - Search the knowledge base
- `getFieldHelp(fieldId)` - Get help for a specific form field
- `askAboutQuestion(questionId)` - Open chat with a pre-filled question
- `prefillMessage(message)` - Pre-fill the chat input

**Usage:**
```tsx
function HelpButton({ questionId }) {
  const { askAboutQuestion } = useChatContext();
  
  return (
    <button onClick={() => askAboutQuestion(questionId)}>
      Get Help
    </button>
  );
}
```

### 5. Backend Support Chat Route (`backend/src/routes/supportChat.ts`)

API endpoint that processes chat messages with knowledge context.

**Endpoints:**
- `POST /api/support-chat` - Main chat endpoint
- `GET /api/support-chat/knowledge?q=<query>` - Search knowledge base
- `GET /api/support-chat/knowledge/:id` - Get specific entry

**Request:**
```json
{
  "message": "What is a benefit unit?",
  "conversationHistory": [...],
  "pagePath": "/form/household",
  "knowledgeContext": "...",
  "additionalContext": "..."
}
```

**Response:**
```json
{
  "message": "A benefit unit is the group of people who receive Ontario Works together...",
  "suggestions": ["Tell me about common-law", "What are asset limits?"],
  "knowledgeUsed": ["term-benefit-unit", "term-common-law"],
  "confidence": "high"
}
```

## Context Retrieval Logic

### 1. Page Detection
```typescript
// Automatic via Next.js usePathname()
const pathname = usePathname(); // e.g., "/form/income"

// Maps to page context
const pageCtx = knowledgeBase.getPageContext(pathname);
// Returns: { title: "Income Section", description: "...", relevantKnowledge: [...] }
```

### 2. Query Processing
```typescript
// User asks: "What does gross income mean?"

// Step 1: Search knowledge base
const results = knowledgeBase.search("gross income");
// Returns: [{ id: "term-gross-income", ... }]

// Step 2: Get page-specific knowledge
const pageKnowledge = knowledgeBase.getPageKnowledge("/form/income");
// Returns: [{ id: "term-earnings-exemption", ... }]

// Step 3: Build AI context
const context = knowledgeBase.buildContextForAI("gross income", "/form/income");
// Returns: "📍 Current Page: Income Section\n📚 Relevant Knowledge:\n..."
```

### 3. AI Prompt Construction
```
System: You are a helpful customer support assistant for FormBridge...

📍 USER LOCATION: /form/income

📚 KNOWLEDGE BASE CONTEXT:
[TERMINOLOGY] Gross Income:
Gross income means your total earnings BEFORE any deductions...

[TERMINOLOGY] Earnings Exemption:
If you work while on Ontario Works, not all your income is counted...

💬 CONVERSATION HISTORY:
User: What does gross income mean?
```

## Edge Case Handling

### When the Bot Doesn't Know

The system gracefully handles questions outside its knowledge base:

1. **Detection**: The knowledge base search returns no results or low-confidence matches
2. **Response**: One of several friendly fallback messages is returned:
   - "I don't have specific information about that..."
   - "That's outside my area of expertise..."
   - "I'm not certain about that specific question..."
3. **Suggestions**: The bot offers alternative topics it CAN help with
4. **Escalation**: Recommends contacting Ontario Works directly for case-specific questions

```typescript
// In supportChat.ts
if (confidence === 'unknown') {
  const fallbackResponse: SupportChatResponse = {
    message: knowledgeBase.getUnknownResponse(),
    suggestions: generateSuggestions(message, pagePath),
    confidence: 'unknown',
  };
  res.json(fallbackResponse);
  return;
}
```

### Offline/Error Handling

The ChatWidget includes local fallback when the API is unavailable:

```typescript
try {
  const response = await fetch(apiEndpoint, { ... });
  // Handle API response
} catch (error) {
  // Fallback to local knowledge base
  const localResponse = generateLocalResponse(messageText);
  setMessages(prev => [...prev, localResponse]);
}
```

## Files Created

### Frontend
- `src/components/ChatWidget.tsx` - Reusable chat widget component
- `src/components/GlobalChatWidget.tsx` - App-wide chat wrapper
- `src/components/chat/index.ts` - Chat module exports
- `src/lib/knowledgeBase.ts` - Frontend knowledge base
- `src/hooks/usePageContext.ts` - Page context hooks
- `src/context/ChatContext.tsx` - Global chat state provider

### Backend
- `src/services/knowledgeBase.ts` - Backend knowledge base
- `src/routes/supportChat.ts` - Support chat API routes

### Modified
- `src/app/layout.tsx` - Added ChatProvider and GlobalChatWidget
- `src/index.ts` - Added support-chat route
- `src/lib/api.ts` - Added support chat API functions

## Usage Examples

### Basic Integration (Already Done)
The chat widget is already integrated into the root layout and available on all pages.

### Triggering Chat from a Help Button
```tsx
import { useChatContext } from '@/context/ChatContext';

function FormQuestion({ question }) {
  const { askAboutQuestion } = useChatContext();

  return (
    <div>
      <label>{question.originalText}</label>
      <button onClick={() => askAboutQuestion(question.id)}>
        Need help?
      </button>
    </div>
  );
}
```

### Pre-filling a Question
```tsx
import { useChatContext } from '@/context/ChatContext';

function CommonTermLink({ term }) {
  const { prefillMessage } = useChatContext();

  return (
    <button onClick={() => prefillMessage(`What does "${term}" mean?`)}>
      {term}
    </button>
  );
}
```

### Adding New Knowledge

To add new knowledge entries, update the arrays in:
- `frontend/src/lib/knowledgeBase.ts`
- `backend/src/services/knowledgeBase.ts`

```typescript
// Example: Adding a new terminology entry
{
  id: 'term-new-concept',
  category: 'terminology',
  title: 'New Concept',
  content: 'Explanation of the new concept...',
  keywords: ['new', 'concept', 'keywords'],
  pageContext: ['/form/relevant-section'],
}
```

## Testing

Test the chatbot by:
1. Opening the chat widget on different pages
2. Asking questions about known topics (eligibility, terminology)
3. Asking questions outside the knowledge base
4. Testing when the API is down (should fall back to local KB)
5. Testing on mobile (full-screen mode)