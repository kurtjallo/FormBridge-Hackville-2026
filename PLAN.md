# FormBridge — Complete Implementation Plan (Revised)

## Project Overview

### What You're Building
A web app that helps users complete Canadian government forms by breaking down the ENTIRE form (questions, instructions, definitions, warnings, legal text) and explaining everything in plain language with conversational AI.

### The Problem
- 54% of adults read below 6th grade level
- Government forms have confusing questions, instructions, definitions, warnings, and legal text
- Users don't know if they qualify before starting
- Users don't know what documents they need
- Users make common mistakes that delay applications

### The Solution
- User selects a pre-built form (Ontario Works)
- Eligibility pre-check before starting
- "What You'll Need" document checklist
- Form displays ALL content types (not just questions)
- Help button [?] on EVERYTHING
- AI explains any text in plain language
- Conversational follow-up Q&A
- Auto-fill suggestions for questions
- Common mistake alerts
- Export summary when done

---

## Target Prizes

| Prize | How We Qualify |
|-------|----------------|
| Best Canadian Focus | Ontario Works form, SIN validation, Ontario postal codes, provincial policy rules |
| Best Use of Gemini API | Powers all explanations, chat, eligibility check, mistake detection |
| Best UX | Form selector, eligibility pre-check, document checklist, reading levels, progress bar |
| Top 3 Overall | Strong social impact, technical depth, polished experience |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Zustand | State management |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express.js | API server |
| TypeScript | Type safety |
| Gemini 1.5 Flash | AI explanations, chat, eligibility, mistake detection |
| MongoDB + Mongoose | Session persistence |

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. LANDING PAGE                                                    │
│     User sees list of available forms                               │
│     Selects: "Ontario Works Application"                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. ELIGIBILITY PRE-CHECK                                           │
│     5 quick yes/no questions                                        │
│     Result: "You likely qualify" or "You may not qualify because..."│
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. DOCUMENT CHECKLIST                                              │
│     "Before you start, gather these documents..."                   │
│     User checks off what they have                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. FORM VIEW                                                       │
│     Left: Form with ALL content (questions, definitions, warnings)  │
│     Right: AI chat panel                                            │
│     User clicks [?] on anything → AI explains                       │
│     User asks follow-ups → AI responds                              │
│     AI suggests answers → User clicks to auto-fill                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. EXPORT SUMMARY                                                  │
│     User sees all their answers in one place                        │
│     Can download/print to reference when filling real form          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Features

### Core Features (Must Have)
| Feature | Description |
|---------|-------------|
| Form selector | Choose from list of pre-built forms |
| Multi-content display | Shows questions, instructions, definitions, warnings, legal text |
| Help button on everything | [?] button on every text block |
| Plain language explanations | AI explains any text at 6th grade level |
| Conversational Q&A | Follow-up questions with context |
| Auto-fill suggestions | AI suggests answers, one-click to fill |
| Progress bar | Shows completion percentage and sections |
| Canadian validation | SIN (Luhn algorithm), Ontario postal codes |

### Enhanced Features (Should Have)
| Feature | Description |
|---------|-------------|
| Eligibility pre-check | Quick questions before starting to check if user qualifies |
| Document checklist | List of required documents before starting |
| Common mistake alerts | Warn user about frequent errors (gross vs net income) |
| Export summary | Download/print answers to reference for real form |

### Bonus Features (Nice to Have)
| Feature | Description |
|---------|-------------|
| Real example mode | Show concrete examples with real numbers |
| Reading level toggle | Simple / Standard / Detailed explanations |
| Photo document reader | Upload pay stub → AI finds the right number |

---

## Data Models

### Form Template
```typescript
interface FormTemplate {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  eligibilityQuestions: EligibilityQuestion[];
  requiredDocuments: RequiredDocument[];
  sections: FormSection[];
}

interface EligibilityQuestion {
  id: string;
  question: string;
  disqualifyIf: boolean;
  disqualifyMessage: string;
}

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  conditionalOn?: string;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  items: FormItem[];
}
```

### Form Items (All Content Types)
```typescript
type FormItem =
  | QuestionItem
  | InstructionItem
  | DefinitionItem
  | WarningItem
  | LegalItem;

interface BaseItem {
  id: string;
  originalText: string;
  context: string;
  commonConfusions?: string[];
}

interface QuestionItem extends BaseItem {
  type: "question";
  fieldId: string;
  fieldType: "text" | "number" | "select" | "textarea" | "checkbox";
  options?: string[];
  required: boolean;
  placeholder?: string;
  commonMistake?: {
    pattern: string;
    warning: string;
    suggestion: string;
  };
}

interface InstructionItem extends BaseItem {
  type: "instruction";
}

interface DefinitionItem extends BaseItem {
  type: "definition";
  term: string;
}

interface WarningItem extends BaseItem {
  type: "warning";
  severity: "info" | "caution" | "critical";
}

interface LegalItem extends BaseItem {
  type: "legal";
  requiresAcknowledgment: boolean;
}
```

### Session (MongoDB)
```typescript
interface Session {
  sessionId: string;
  formId: string;
  eligibilityAnswers: Record<string, boolean>;
  eligibilityPassed: boolean;
  documentChecklist: Record<string, boolean>;
  answers: Record<string, string | number | boolean>;
  conversations: Record<string, ChatMessage[]>;
  completedSections: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedAnswer?: string;
}
```

---

## API Specification

**Base URL:** `http://localhost:5000/api`

### Endpoints

#### 1. GET /forms
Get list of available forms.

**Response:**
```json
{
  "forms": [
    {
      "id": "ontario-works",
      "name": "Ontario Works Application",
      "description": "Social assistance for Ontario residents",
      "estimatedTime": "20-30 minutes"
    }
  ]
}
```

#### 2. GET /forms/:formId
Get full form template.

**Response:**
```json
{
  "form": {
    "id": "ontario-works",
    "name": "Ontario Works Application",
    "eligibilityQuestions": [...],
    "requiredDocuments": [...],
    "sections": [...]
  }
}
```

#### 3. POST /eligibility
Check eligibility based on quick questions.

**Request:**
```json
{
  "formId": "ontario-works",
  "answers": {
    "isOntarioResident": true,
    "isEligibleStatus": true,
    "hasFinancialNeed": true
  }
}
```

**Response:**
```json
{
  "eligible": true,
  "message": "Based on your answers, you likely qualify.",
  "warnings": ["You mentioned assets over $10,000. Some assets may be exempt."]
}
```

#### 4. POST /explain
Get plain language explanation for any form item.

**Request:**
```json
{
  "formId": "ontario-works",
  "itemId": "def-benefit-unit",
  "itemType": "definition"
}
```

**Response:**
```json
{
  "explanation": "This is asking: Who lives with you and shares meals?...",
  "itemId": "def-benefit-unit"
}
```

#### 5. POST /chat
Multi-turn conversation about a form item.

**Request:**
```json
{
  "formId": "ontario-works",
  "itemId": "q-household-members",
  "conversationHistory": [...],
  "userMessage": "Does my girlfriend count?",
  "currentAnswers": {...}
}
```

**Response:**
```json
{
  "message": "If your girlfriend has her own place and buys her own food...",
  "suggestedAnswer": "1 person (yourself only)",
  "confidence": "high"
}
```

#### 6. POST /validate
Validate form answers and check for common mistakes.

**Request:**
```json
{
  "formId": "ontario-works",
  "answers": {
    "gross_income": "1924",
    "household_size": "3",
    "household_members": "Me and my mom"
  }
}
```

**Response:**
```json
{
  "valid": false,
  "issues": [
    {
      "fieldId": "gross_income",
      "severity": "warning",
      "type": "common_mistake",
      "message": "$1,924 looks like net pay. Did you mean to enter gross pay?"
    },
    {
      "fieldId": "household_size",
      "severity": "error",
      "type": "inconsistency",
      "message": "You said 3 people but only listed 2 names."
    }
  ]
}
```

#### 7. POST /session
Save or create session.

**Request:**
```json
{
  "sessionId": "uuid or null",
  "formId": "ontario-works",
  "answers": {...},
  "conversations": {...}
}
```

**Response:**
```json
{
  "sessionId": "uuid"
}
```

#### 8. GET /session/:sessionId
Load existing session.

**Response:**
```json
{
  "session": {...}
}
```

---

## Frontend Pages & Components

### Pages
```
/                     → Landing page with form selector
/form/[formId]        → Main form view
/form/[formId]/eligibility    → Eligibility pre-check
/form/[formId]/checklist      → Document checklist
/form/[formId]/summary        → Export summary
```

### Components
```
components/
├── landing/
│   └── FormCard.tsx           # Form selection card
├── eligibility/
│   └── EligibilityCheck.tsx   # Yes/no eligibility questions
├── checklist/
│   └── DocumentChecklist.tsx  # Required documents list
├── form/
│   ├── FormSection.tsx        # Section container
│   ├── FormItem.tsx           # Routes to correct item type
│   ├── QuestionItem.tsx       # Question with input
│   ├── InstructionItem.tsx    # Instruction block
│   ├── DefinitionItem.tsx     # Definition block
│   ├── WarningItem.tsx        # Warning block
│   ├── LegalItem.tsx          # Legal text block
│   └── ProgressBar.tsx        # Progress indicator
├── chat/
│   ├── ChatPanel.tsx          # Main chat container
│   ├── ChatMessage.tsx        # Single message
│   ├── SuggestionButton.tsx   # Auto-fill suggestion
│   └── QuickQuestions.tsx     # Preset question buttons
├── validation/
│   └── MistakeAlert.tsx       # Common mistake warning
└── summary/
    └── ExportSummary.tsx      # Final answers summary
```

---

## Zustand Store

```typescript
interface FormStore {
  // Form data
  currentFormId: string | null;
  formTemplate: FormTemplate | null;
  setForm: (formId: string, template: FormTemplate) => void;

  // Eligibility
  eligibilityAnswers: Record<string, boolean>;
  eligibilityPassed: boolean;
  setEligibilityAnswer: (questionId: string, answer: boolean) => void;
  setEligibilityPassed: (passed: boolean) => void;

  // Document checklist
  documentChecklist: Record<string, boolean>;
  toggleDocument: (docId: string) => void;

  // Form answers
  answers: Record<string, string | number | boolean>;
  setAnswer: (fieldId: string, value: any) => void;

  // Active item for chat
  activeItemId: string | null;
  activeItemType: string | null;
  setActiveItem: (itemId: string | null, itemType: string | null) => void;

  // Conversations per item
  conversations: Record<string, ChatMessage[]>;
  addMessage: (itemId: string, message: ChatMessage) => void;
  clearConversation: (itemId: string) => void;

  // Progress
  completedSections: string[];
  markSectionComplete: (sectionId: string) => void;

  // Validation issues
  validationIssues: ValidationIssue[];
  setValidationIssues: (issues: ValidationIssue[]) => void;

  // Session
  sessionId: string | null;
  setSessionId: (id: string) => void;

  // Reset
  reset: () => void;
}
```

---

## Folder Structure

```
formbridge/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                      # Landing page
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   └── form/
│   │   │       └── [formId]/
│   │   │           ├── page.tsx              # Main form view
│   │   │           ├── eligibility/
│   │   │           │   └── page.tsx
│   │   │           ├── checklist/
│   │   │           │   └── page.tsx
│   │   │           └── summary/
│   │   │               └── page.tsx
│   │   ├── components/
│   │   │   ├── landing/
│   │   │   ├── eligibility/
│   │   │   ├── checklist/
│   │   │   ├── form/
│   │   │   ├── chat/
│   │   │   ├── validation/
│   │   │   └── summary/
│   │   ├── lib/
│   │   │   ├── api.ts                        # API client
│   │   │   └── validation.ts                 # Canadian validation
│   │   ├── store/
│   │   │   └── formStore.ts
│   │   └── types/
│   │       └── form.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   └── .env.local
│
├── backend/
│   ├── src/
│   │   ├── index.ts                          # Express server
│   │   ├── routes/
│   │   │   ├── forms.ts                      # GET /forms, GET /forms/:id
│   │   │   ├── eligibility.ts                # POST /eligibility
│   │   │   ├── explain.ts                    # POST /explain
│   │   │   ├── chat.ts                       # POST /chat
│   │   │   ├── validate.ts                   # POST /validate
│   │   │   └── session.ts                    # GET/POST /session
│   │   ├── services/
│   │   │   ├── gemini.ts                     # Gemini API wrapper
│   │   │   └── promptBuilder.ts              # Build prompts for different item types
│   │   ├── data/
│   │   │   └── ontario-works.ts              # Pre-built form template
│   │   ├── models/
│   │   │   └── session.ts                    # Mongoose session model
│   │   └── utils/
│   │       └── validation.ts                 # Canadian validation
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## Build Timeline

### Pre-Hackathon (2-3 hours)
| Task | Time |
|------|------|
| Create accounts (Gemini, MongoDB) | 15 min |
| Set up empty Next.js + Express projects | 30 min |
| Research Ontario Works form, write form data file | 1.5 hr |
| Test Gemini API connection | 15 min |

### Phase 1: Foundation (Hours 1-4)
| Hour | Task | Deliverable |
|------|------|-------------|
| 1 | Backend: Express setup, routes skeleton | Server runs, routes return 200 |
| 2 | Backend: Form data file with all content types | GET /forms returns form |
| 3 | Frontend: Landing page with form selector | User can click on form |
| 4 | Frontend: Basic form view displaying all items | See questions, definitions, warnings |

### Phase 2: Core AI Features (Hours 5-10)
| Hour | Task | Deliverable |
|------|------|-------------|
| 5 | Backend: Gemini setup + prompt builder | Prompts ready for each item type |
| 6 | Backend: /explain endpoint | Returns explanation for any item |
| 7 | Frontend: ChatPanel + help button [?] | Click [?] → see explanation |
| 8 | Backend: /chat endpoint with history | Multi-turn conversation works |
| 9 | Frontend: Chat UI with messages | Full chat experience |
| 10 | Frontend: Suggestion extraction + auto-fill | Click suggestion → form fills |

### Phase 3: Enhanced Features (Hours 11-16)
| Hour | Task | Deliverable |
|------|------|-------------|
| 11 | Frontend: Eligibility pre-check page | User answers 5 questions |
| 12 | Backend: /eligibility endpoint | Returns eligible/not eligible |
| 13 | Frontend: Document checklist page | User sees required docs |
| 14 | Backend: /validate endpoint | Catches common mistakes |
| 15 | Frontend: Validation alerts | User sees mistake warnings |
| 16 | Frontend: Progress bar + section navigation | Visual progress |

### Phase 4: Polish & Extras (Hours 17-20)
| Hour | Task | Deliverable |
|------|------|-------------|
| 17 | Frontend: Export summary page | User can see/print answers |
| 18 | Frontend: Canadian validation (SIN, postal) | Real-time validation |
| 19 | UI polish: Loading states, animations, mobile | Looks professional |
| 20 | Testing, bug fixes, deploy to Vercel | Production ready |

### Phase 5: Demo Prep (Hours 21-22)
| Hour | Task | Deliverable |
|------|------|-------------|
| 21 | Create cached fallbacks, test demo flow | Demo-proof |
| 22 | Rehearse demo 3+ times | Ready to present |

---

## Ontario Works Form Data (Example)

```typescript
export const ontarioWorksForm: FormTemplate = {
  id: "ontario-works",
  name: "Ontario Works Application",
  description: "Social assistance for Ontario residents in financial need",
  estimatedTime: "20-30 minutes",

  eligibilityQuestions: [
    {
      id: "eq-1",
      question: "Do you currently live in Ontario?",
      disqualifyIf: false,
      disqualifyMessage: "Ontario Works is only available to Ontario residents."
    },
    {
      id: "eq-2",
      question: "Are you a Canadian citizen, permanent resident, or refugee claimant?",
      disqualifyIf: false,
      disqualifyMessage: "You must have eligible immigration status."
    },
    {
      id: "eq-3",
      question: "Are you in financial need? (Unable to cover basic living costs)",
      disqualifyIf: false,
      disqualifyMessage: "Ontario Works is for people in financial need."
    },
    {
      id: "eq-4",
      question: "Do you have liquid assets over $10,000 (single) or $15,000 (couple)?",
      disqualifyIf: true,
      disqualifyMessage: "Your assets may exceed the limit, but some assets are exempt. You may still qualify."
    }
  ],

  requiredDocuments: [
    {
      id: "doc-1",
      name: "Government-issued ID",
      description: "Driver's license, passport, or PR card",
      required: true
    },
    {
      id: "doc-2",
      name: "Proof of address",
      description: "Utility bill, lease agreement, or bank statement",
      required: true
    },
    {
      id: "doc-3",
      name: "Social Insurance Number (SIN)",
      description: "Your 9-digit SIN",
      required: true
    },
    {
      id: "doc-4",
      name: "Recent pay stubs",
      description: "Last 2 months of pay stubs",
      required: false,
      conditionalOn: "If you are currently employed"
    }
  ],

  sections: [
    {
      id: "section-household",
      title: "Household Information",
      description: "Tell us about who lives with you",
      items: [
        {
          type: "definition",
          id: "def-benefit-unit",
          term: "Benefit Unit",
          originalText: "Benefit unit means all persons who customarily purchase and prepare food together for home consumption.",
          context: "Ontario defines a benefit unit as people who live together AND share food expenses/meals. This is different from just 'roommates' or 'people at your address'.",
          commonConfusions: [
            "Roommates who buy food separately are NOT in your benefit unit",
            "A partner you've lived with for 3+ months IS in your benefit unit (Ontario's common-law rule)"
          ]
        },
        {
          type: "instruction",
          id: "inst-include-spouse",
          originalText: "Include your spouse or same-sex partner, even if they are temporarily absent from the home.",
          context: "If you're married or common-law (living together 3+ months), you MUST include your partner even if they're away temporarily (hospital, work trip, etc.).",
          commonConfusions: [
            "Separated but still living together - you must include them",
            "Partner in hospital - still include them"
          ]
        },
        {
          type: "question",
          id: "q-household-members",
          fieldId: "household_members",
          originalText: "List all members of your benefit unit, including yourself. Provide full legal name, date of birth, and relationship to you.",
          fieldType: "textarea",
          required: true,
          context: "List everyone who lives with you AND shares meals/food expenses. Include yourself first, then spouse/partner, then children.",
          commonConfusions: [
            "Adult children (18+) not in school - they apply separately",
            "Roommates who buy their own food - don't include them"
          ],
          commonMistake: {
            pattern: "only listed one person but household size > 1",
            warning: "You indicated a household size greater than 1, but only listed yourself.",
            suggestion: "Add the other members of your household."
          }
        },
        {
          type: "warning",
          id: "warn-false-info",
          originalText: "Providing false or incomplete information is an offence under the Ontario Works Act, 1997 and may result in prosecution.",
          context: "This is a legal warning. It means: Be honest and complete. If you lie or hide information, you could face legal consequences and have to repay benefits.",
          severity: "critical"
        }
      ]
    },
    {
      id: "section-income",
      title: "Income Information",
      description: "Tell us about your income sources",
      items: [
        {
          type: "instruction",
          id: "inst-gross-income",
          originalText: "Report gross income (before deductions). Include all sources of employment income.",
          context: "GROSS income is your pay BEFORE taxes, CPP, and EI are taken out. Look at your pay stub - it's the bigger number at the top, not your take-home pay.",
          commonConfusions: [
            "Net pay (take-home) vs Gross pay - use GROSS",
            "Where to find it on pay stub - usually labeled 'Gross Pay' or 'Total Earnings'"
          ]
        },
        {
          type: "question",
          id: "q-gross-income",
          fieldId: "gross_income",
          originalText: "What is your total gross monthly employment income?",
          fieldType: "number",
          required: true,
          placeholder: "Enter amount in dollars",
          context: "Enter your GROSS (before tax) monthly income from all jobs. If paid bi-weekly, multiply by 2.17 to get monthly amount.",
          commonConfusions: [
            "Gross vs net - use the BIGGER number (before deductions)",
            "Bi-weekly to monthly - multiply by 2.17, not 2"
          ],
          commonMistake: {
            pattern: "amount looks like net pay (typically 70-80% of gross)",
            warning: "This looks like it might be your net (take-home) pay. Did you mean to enter your gross pay?",
            suggestion: "Gross pay is usually 20-30% higher than net pay."
          }
        },
        {
          type: "definition",
          id: "def-self-employment",
          term: "Self-Employment Income",
          originalText: "Self-employment income includes income from operating a business, freelance work, or gig economy work such as Uber, DoorDash, or Etsy sales.",
          context: "If you make money outside of a regular job - freelancing, driving Uber, selling on Etsy, doing odd jobs for cash - that's self-employment income.",
          commonConfusions: [
            "Driving Uber once or twice - yes, still counts",
            "Selling old stuff on Facebook Marketplace - occasional sales don't count, but regular selling does",
            "Cash jobs (babysitting, lawn care) - yes, counts as self-employment"
          ]
        },
        {
          type: "question",
          id: "q-self-employment",
          fieldId: "self_employment_income",
          originalText: "Do you have any self-employment, gig work, or freelance income?",
          fieldType: "select",
          options: ["No", "Yes"],
          required: true,
          context: "Answer Yes if you earn ANY money outside of a regular employee job.",
          commonConfusions: [
            "Even occasional gig work counts",
            "Cash payments still need to be reported"
          ]
        }
      ]
    }
  ]
};
```

---

## AI Prompt Templates

### Explain Prompt (for any item type)
```
You are a helpful assistant explaining a Canadian government form to someone who may have difficulty with complex language.

ITEM TYPE: {itemType}
ORIGINAL TEXT: "{originalText}"

CONTEXT (what this means):
{context}

COMMON CONFUSIONS:
{commonConfusions}

YOUR TASK:
Explain this in plain, simple English that a 6th grader could understand.
- Use short sentences (under 15 words)
- Give a concrete example if helpful
- Don't use jargon or legal terms
- Be warm and encouraging

If this is a DEFINITION: Explain what the term means in everyday words.
If this is an INSTRUCTION: Explain what the user needs to do.
If this is a WARNING: Explain what could happen and how to avoid problems.
If this is a QUESTION: Explain what information they need to provide.
```

### Chat Prompt
```
You are helping someone fill out an Ontario Works (social assistance) application.

CURRENT ITEM: {itemType}
ORIGINAL TEXT: "{originalText}"

CONTEXT:
{context}

USER'S OTHER ANSWERS:
{currentAnswers}

CONVERSATION SO FAR:
{conversationHistory}

USER'S NEW MESSAGE: "{userMessage}"

YOUR TASK:
1. Answer their question helpfully
2. If this is a QUESTION item and you're confident, suggest an answer:
   "Based on what you told me, you should enter: [ANSWER]"
3. If you need more info, ask ONE short clarifying question
4. Keep your response SHORT (2-3 sentences)
5. Be warm and encouraging

RULES:
- You're not a lawyer - don't guarantee outcomes
- If unsure about Ontario Works rules, say so
- Be specific to Ontario (e.g., common-law is 3 months here)
```

### Eligibility Check Prompt
```
You are checking if someone likely qualifies for Ontario Works based on their answers.

ELIGIBILITY ANSWERS:
{answers}

ONTARIO WORKS BASIC REQUIREMENTS:
- Must live in Ontario
- Must be Canadian citizen, permanent resident, or refugee claimant
- Must be in financial need
- Asset limits: $10,000 (single), $15,000 (couple) - some exemptions apply

Based on their answers, respond with:
1. Whether they LIKELY qualify, MAY qualify, or likely DON'T qualify
2. A brief explanation
3. Any warnings or things to note

Be encouraging but honest. When in doubt, suggest they apply anyway.
```

---

## Demo Script (3 Minutes)

| Time | What You Show | What You Say |
|------|---------------|--------------|
| 0:00-0:20 | Landing page | "54% of adults read below 6th grade level. Government forms are written at 12th grade level. FormBridge breaks down the ENTIRE form." |
| 0:20-0:35 | Click Ontario Works | "User selects the form they need help with." |
| 0:35-0:55 | Eligibility check | "Before wasting time, we check if they likely qualify. 5 quick questions." |
| 0:55-1:10 | Document checklist | "We tell them what documents to gather before starting." |
| 1:10-1:30 | Form view with all content types | "The form shows EVERYTHING - questions, definitions, warnings. Not just questions. Every piece of confusing text has a help button." |
| 1:30-2:00 | Click help on definition | "What's a 'benefit unit'? Click help. AI explains in plain English." |
| 2:00-2:25 | Ask follow-up + get suggestion | "User asks: 'Does my girlfriend count?' AI knows Ontario's 3-month common-law rule. Suggests an answer." |
| 2:25-2:40 | Click auto-fill | "One click. Form fills in." |
| 2:40-2:50 | Show validation warning | "AI catches common mistakes - like entering net pay instead of gross." |
| 2:50-3:00 | Closing | "Government benefits exist to help people. FormBridge makes sure the forms don't get in the way." |

---

## Pre-Hackathon Checklist

### Accounts
- [ ] Google AI Studio — Get Gemini API key
- [ ] MongoDB Atlas — Get connection string
- [ ] Vercel — Link GitHub account

### Setup
- [ ] Create Next.js project with TypeScript + Tailwind
- [ ] Create Express project with TypeScript
- [ ] Test Gemini API works
- [ ] Test MongoDB connection works

### Form Data (Most Important!)
- [ ] Download real Ontario Works PDF
- [ ] Pick 2-3 sections with confusing content
- [ ] Write the form data file with all item types
- [ ] Include eligibility questions and document list

---

## Success Criteria

### Minimum Viable Demo
- [ ] Landing page with form selector
- [ ] Form displays all content types (questions, definitions, instructions, warnings)
- [ ] Help button [?] on every item
- [ ] AI explains any item in plain language
- [ ] Chat with follow-up questions
- [ ] Auto-fill suggestions for questions

### Impressive Demo
- [ ] Eligibility pre-check
- [ ] Document checklist
- [ ] Common mistake alerts
- [ ] Progress bar
- [ ] Canadian validation (SIN, postal code)

### Prize-Winning Demo
- [ ] Polished UI
- [ ] Mobile responsive
- [ ] Export summary
- [ ] Confident delivery
- [ ] Good answers to judge questions

---

## Final Advice

1. **Form data file is critical** — Spend time before hackathon getting this right
2. **Build the demo path first** — Landing → Eligibility → Form → Help → Chat → Suggestion
3. **Content types differentiate you** — "We explain EVERYTHING, not just questions"
4. **Canadian angle wins prize** — Emphasize Ontario rules, SIN validation, provincial focus
5. **Practice the demo** — 3 minutes is short, every second counts

---

**Build in order. Demo the happy path. Ship it.**
