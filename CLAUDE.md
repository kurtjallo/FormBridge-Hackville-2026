# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FormBridge** - AI-powered web app helping users complete Canadian government forms (Ontario Works) by explaining everything in plain language at a 6th grade reading level.

## Commands

### Backend (`/backend`)
```bash
npm run dev      # Start dev server with hot reload (port 5001)
npm run build    # Compile TypeScript to dist/
npm start        # Run production build
```

### Frontend (`/frontend`)
```bash
npm run dev      # Start Next.js dev server (port 3000)
npm run build    # Production build
npm run lint     # ESLint
```

### Running Both
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5001
GEMINI_API_KEY=<required>
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/formbridge
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## User Flow

```
1. LANDING PAGE          → User selects form (Ontario Works, OSAP, etc.)
         ↓
2. ELIGIBILITY PRE-CHECK → 5 quick yes/no questions → "You likely qualify" or not
         ↓
3. DOCUMENT CHECKLIST    → "Gather these documents..." → User checks off what they have
         ↓
4. FORM VIEW (dual-panel) → Left: Form content | Right: AI chat panel
         ↓
5. EXPORT SUMMARY        → All answers in one place → Download/print for real form
```

### Form View (Dual-Panel Interface)

**Left Panel - Form:**
- Sections with all content types (definitions, instructions, questions, warnings)
- Each item has `[?]` help button
- Clicking `[?]` sends context to chat panel

**Right Panel - AI Chat:**
- Shows current help topic (e.g., "Help with: Benefit Unit")
- AI explains in plain language (6th grade level)
- User asks follow-ups
- AI suggests answers with `✓ Use: "suggested answer"` auto-fill button

## Architecture

### Data Flow
```
User fills form → Zustand store (localStorage) → Auto-save to MongoDB (2s debounce)
User clicks [?] → ChatPanel opens → POST /chat → Gemini API → AI response
AI suggests answer → User clicks → Form auto-fills
```

### Form Content Type System
The app handles 5 content types, not just questions. All extend `BaseItem` with `originalText`, `context`, `commonConfusions[]`:

| Type | Purpose | Extra Fields |
|------|---------|--------------|
| `QuestionItem` | Form input | `fieldId`, `fieldType`, `commonMistake` |
| `InstructionItem` | Guidance text | - |
| `DefinitionItem` | Term explanation | `term` |
| `WarningItem` | Alerts | `severity: info|caution|critical` |
| `LegalItem` | Legal text | `requiresAcknowledgment` |

### Backend Routes
| Endpoint | Purpose |
|----------|---------|
| `GET /forms` | List available forms |
| `GET /forms/:id` | Full form template |
| `POST /eligibility` | Pre-qualification check |
| `POST /explain` | Plain language explanation |
| `POST /chat` | Multi-turn AI conversation |
| `POST /validate` | Form consistency check |
| `GET/POST /session` | Session persistence |
| `GET /demo/session` | Load demo session (Maria Garcia persona) |
| `POST /demo/reset` | Reset demo to initial state |
| `GET /demo/personas` | List available demo personas |

### Frontend State (Zustand)
Store persists to localStorage as `formbridge-storage`:
- `answers` - Form field values
- `conversations` - Chat history per question
- `activeQuestionId` - Current question for chat panel
- `sessionId` - MongoDB session reference
- `validationErrors` - Field-level errors

### Key Files
- `backend/src/types/form.ts` - All TypeScript interfaces
- `backend/src/data/ontario-works.ts` - Full form template (7 sections, 50+ items)
- `backend/src/data/demo-session.ts` - Demo persona (Maria Garcia) with pre-filled data
- `backend/src/utils/validation.ts` - SIN/postal code validation, formatters
- `frontend/src/store/formStore.ts` - Zustand state management
- `frontend/src/lib/api.ts` - Backend API client

### Validation Utilities
Located in `backend/src/utils/validation.ts`:
- `isValidSIN(sin)` - Luhn algorithm validation for Canadian SIN
- `isOntarioPostalCode(code)` - Ontario prefixes: K, L, M, N, P
- `formatSIN(sin)` - Format as XXX-XXX-XXX
- `formatPostalCode(code)` - Format as A1A 1A1
- `validateField(fieldId, value)` - Field-level validation

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Port 5001 | macOS ControlCenter uses 5000 |
| Gemini 1.5 Flash | Fast response for interactive use |
| Per-question chat history | Context maintained when switching questions |
| 2-second debounce autosave | Balance responsiveness vs API load |
| String session IDs (UUID) | Easier frontend integration than ObjectId |

## Team Split (Backend)

**Person 1:** `types/`, `data/`, `routes/forms.ts`, `routes/eligibility.ts`
**Person 2:** `services/`, `routes/explain.ts`, `routes/chat.ts`

See `BACKEND-TASKS.md` for details.
