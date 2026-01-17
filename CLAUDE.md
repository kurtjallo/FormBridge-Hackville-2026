# CLAUDE.md - Project Context

## Project Overview

**FormBridge** - An AI-powered web app that helps users complete Canadian government forms (starting with Ontario Works) by explaining everything in plain language.

**Core Problem:** 54% of adults read below 6th grade level, but government forms are written at 12th grade level with confusing jargon.

**Solution:** Break down the ENTIRE form (questions, instructions, definitions, warnings, legal text) and explain everything with conversational AI.

## Tech Stack

### Backend (`/backend`)
- **Express.js** with TypeScript
- **Gemini 1.5 Flash** for AI explanations and chat
- **MongoDB + Mongoose** for session persistence
- Port: 5001 (macOS uses 5000)

### Frontend (`/frontend`)
- **Next.js 16** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Lucide React** for icons

## Quick Commands

```bash
# Backend
cd backend && npm run dev    # Starts on port 5001

# Frontend
cd frontend && npm run dev   # Starts on port 3000
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
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## Project Structure

```
formbridge/
├── backend/
│   └── src/
│       ├── index.ts              # Express server entry
│       ├── routes/
│       │   ├── forms.ts          # GET /forms, GET /forms/:formId
│       │   ├── eligibility.ts    # POST /eligibility - check qualification
│       │   ├── chat.ts           # POST /chat - AI conversation
│       │   ├── explain.ts        # POST /explain - plain language explanations
│       │   ├── session.ts        # GET/POST /session - persistence
│       │   └── validate.ts       # POST /validate - form validation
│       ├── models/
│       │   └── session.ts        # Mongoose session schema
│       ├── types/
│       │   └── form.ts           # TypeScript interfaces for forms
│       ├── data/
│       │   └── ontario-works.ts  # Full Ontario Works form template
│       └── services/             # Gemini wrapper, prompt builder
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Main form page
│       │   └── layout.tsx        # Root layout
│       ├── components/
│       │   ├── FormSection.tsx   # Collapsible form sections
│       │   ├── FormQuestion.tsx  # Question with help button
│       │   ├── ChatPanel.tsx     # AI chat sidebar
│       │   └── ProgressBar.tsx   # Section completion tracker
│       ├── store/
│       │   └── formStore.ts      # Zustand state
│       ├── lib/
│       │   ├── api.ts            # Backend API client
│       │   └── validation.ts     # SIN, postal code validation
│       └── data/
│           └── ontario-works.ts  # Form template with questions
│
├── .planning/                    # GSD planning files
├── PLAN.md                       # Complete implementation plan
├── BACKEND-TASKS.md              # Backend task split for team
└── CLAUDE.md                     # This file
```

## Current State (Phase 4)

**Completed Phases:**
1. Backend API - Express + Gemini endpoints
2. Frontend Core - Form display + chat panel
3. Polish & Persistence - Validation, progress, mobile

**Phase 4: Backend Data & Forms API**

Person 1 (Data & Forms) - COMPLETE:
- [x] `types/form.ts` - TypeScript interfaces (FormTemplate, FormItem, EligibilityQuestion, etc.)
- [x] `data/ontario-works.ts` - Full form with 6 sections, 5 eligibility questions, 8 documents
- [x] `routes/forms.ts` - GET /forms, GET /forms/:formId
- [x] `routes/eligibility.ts` - POST /eligibility

Person 2 (AI & Services) - TODO:
- [ ] `services/gemini.ts` - Gemini API wrapper
- [ ] `services/promptBuilder.ts` - Prompts for each item type
- [ ] Refactor `/explain` to use new services

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Port 5001 | macOS ControlCenter uses 5000 |
| Gemini 1.5 Flash | Fast response times for interactive use |
| 6th grade reading level | Accessibility for target users |
| Zustand over Redux | Simple, no boilerplate |
| Per-question chat history | Maintains context when switching |
| 2-second debounce autosave | Balance responsiveness vs API load |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /forms | List available forms |
| GET | /forms/:formId | Get full form template |
| POST | /explain | Plain language explanation |
| POST | /chat | Multi-turn conversation |
| POST | /eligibility | Check if user qualifies |
| POST | /validate | Check form consistency |
| GET | /session/:id | Load session |
| POST | /session | Save session |

## Team Split (Backend)

**Person 1 (Data & Forms):** types/, data/, routes/forms.ts, routes/eligibility.ts
**Person 2 (AI & Services):** services/, routes/explain.ts, chat.ts updates

See `BACKEND-TASKS.md` for details.

## Form Content Types

The app handles multiple content types, not just questions:
- **QuestionItem** - Form field with input
- **InstructionItem** - Guidance text
- **DefinitionItem** - Term explanation
- **WarningItem** - Caution/critical alerts
- **LegalItem** - Legal text requiring acknowledgment

Each item has: `originalText`, `context`, `commonConfusions[]`

## Target Prizes

1. **Best Canadian Focus** - Ontario Works, SIN validation, Ontario postal codes
2. **Best Use of Gemini API** - Explanations, chat, eligibility, mistake detection
3. **Best UX** - Form selector, eligibility pre-check, progress bar
