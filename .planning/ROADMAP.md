# Roadmap: FormBridge

## Overview

Build an AI-powered Ontario Works form assistant in three phases: backend API with Gemini integration, frontend form with chat panel, then polish with validation and persistence. Demo-critical features first.

## Phases

- [x] **Phase 1: Backend API** - Express server with Gemini-powered /explain and /chat endpoints
- [ ] **Phase 2: Frontend Core** - Next.js form display with interactive chat panel and auto-fill
- [ ] **Phase 3: Polish & Persistence** - Validation, progress bar, session persistence, mobile responsive

## Phase Details

### Phase 1: Backend API
**Goal**: Working API that explains form questions and handles conversations
**Depends on**: Nothing (first phase)
**Requirements**: API-01, API-02, API-03, AI-01, AI-02
**Success Criteria** (what must be TRUE):
  1. GET request to server returns response (server running)
  2. POST /explain with questionId returns plain-language explanation
  3. POST /chat with conversation history returns contextual response
  4. Gemini API successfully generates responses
**Plans**: 2 plans

Plans:
- [x] 01-01: Express server setup with TypeScript, CORS, environment config
- [x] 01-02: Gemini integration with /explain and /chat endpoints

### Phase 2: Frontend Core
**Goal**: Interactive form with AI-powered help and auto-fill suggestions
**Depends on**: Phase 1
**Requirements**: FORM-01, FORM-02, FORM-03, CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, AI-03, DATA-01, DATA-02, STATE-01, STATE-02, STATE-03
**Success Criteria** (what must be TRUE):
  1. Form displays all 5 Ontario Works sections with appropriate inputs
  2. Clicking help button opens chat panel with question context
  3. User can ask follow-up questions and receive AI responses
  4. AI suggestion button auto-fills the corresponding form field
**Plans**: 3 plans

Plans:
- [x] 02-01: Next.js setup with Tailwind, Zustand store, form data
- [x] 02-02: Form components (FormSection, FormQuestion, ProgressBar)
- [ ] 02-03: Chat panel with API integration and auto-fill

### Phase 3: Polish & Persistence
**Goal**: Production-ready polish with validation, persistence, and responsiveness
**Depends on**: Phase 2
**Requirements**: API-04, API-05, API-06, FORM-04, FORM-05, AI-04, DATA-03, DATA-04, STATE-04
**Success Criteria** (what must be TRUE):
  1. Progress bar updates as sections are completed
  2. Canadian postal codes and SINs are validated
  3. Session persists across browser refresh (MongoDB)
  4. Layout works on mobile devices
**Plans**: 2 plans

Plans:
- [ ] 03-01: MongoDB session persistence and /validate endpoint
- [ ] 03-02: Progress bar, Canadian validation, mobile responsive

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Backend API | 2/2 | Complete | 2026-01-17 |
| 2. Frontend Core | 2/3 | In progress | - |
| 3. Polish & Persistence | 0/2 | Not started | - |
