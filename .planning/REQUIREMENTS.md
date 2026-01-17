# Requirements: FormBridge

## v1 (MVP Demo)

### Backend API

| ID | Requirement | Priority |
|----|-------------|----------|
| API-01 | Express server with CORS enabled for frontend communication | Must Have |
| API-02 | POST /explain endpoint returns plain-language explanation for form questions | Must Have |
| API-03 | POST /chat endpoint handles multi-turn conversation with history | Must Have |
| API-04 | POST /validate endpoint checks form answers for consistency | Should Have |
| API-05 | GET /session/:id loads existing session from MongoDB | Should Have |
| API-06 | POST /session saves/creates session in MongoDB | Should Have |

### Frontend Form

| ID | Requirement | Priority |
|----|-------------|----------|
| FORM-01 | Form displays all 5 sections with questions and appropriate inputs | Must Have |
| FORM-02 | Help button on each question opens chat panel with that question active | Must Have |
| FORM-03 | Form inputs support text, number, select, textarea, checkbox types | Must Have |
| FORM-04 | Progress bar shows section completion status | Should Have |
| FORM-05 | Mobile responsive layout | Should Have |

### Chat Panel

| ID | Requirement | Priority |
|----|-------------|----------|
| CHAT-01 | Chat panel shows current question context at top | Must Have |
| CHAT-02 | Message list displays user/assistant messages with distinct styling | Must Have |
| CHAT-03 | Text input with send button for user messages | Must Have |
| CHAT-04 | Quick action buttons: "What does this mean?", "Give me an example", "Does my situation apply?" | Must Have |
| CHAT-05 | Loading indicator (animated dots) during AI response | Must Have |
| CHAT-06 | AI suggestion displayed as clickable button to auto-fill form | Must Have |

### AI Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-01 | Gemini SDK integration for generating explanations | Must Have |
| AI-02 | System prompts configured for 6th grade reading level responses | Must Have |
| AI-03 | Conversation history maintained per question | Must Have |
| AI-04 | Suggested answers include confidence level | Should Have |

### Data & Validation

| ID | Requirement | Priority |
|----|-------------|----------|
| DATA-01 | Ontario Works form template with 5 sections and all questions | Must Have |
| DATA-02 | Question metadata: originalText, fieldType, context, commonConfusions | Must Have |
| DATA-03 | Canadian postal code validation (Ontario prefixes K, L, M, N, P) | Should Have |
| DATA-04 | SIN validation with Luhn algorithm | Should Have |

### State Management

| ID | Requirement | Priority |
|----|-------------|----------|
| STATE-01 | Zustand store for form answers | Must Have |
| STATE-02 | Active question tracking for chat panel | Must Have |
| STATE-03 | Conversation history per question in store | Must Have |
| STATE-04 | Session ID tracking for persistence | Should Have |

## v2 (Future)

| ID | Requirement | Priority |
|----|-------------|----------|
| V2-01 | Consistency validation (AI checks contradictions across answers) | Nice to Have |
| V2-02 | Export/print completed form | Nice to Have |
| V2-03 | Multi-language support | Future |
| V2-04 | Multiple form types | Future |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| API-01 | Phase 1 | Pending |
| API-02 | Phase 1 | Pending |
| API-03 | Phase 1 | Pending |
| API-04 | Phase 3 | Pending |
| API-05 | Phase 3 | Pending |
| API-06 | Phase 3 | Pending |
| FORM-01 | Phase 2 | Pending |
| FORM-02 | Phase 2 | Pending |
| FORM-03 | Phase 2 | Pending |
| FORM-04 | Phase 3 | Pending |
| FORM-05 | Phase 3 | Pending |
| CHAT-01 | Phase 2 | Pending |
| CHAT-02 | Phase 2 | Pending |
| CHAT-03 | Phase 2 | Pending |
| CHAT-04 | Phase 2 | Pending |
| CHAT-05 | Phase 2 | Pending |
| CHAT-06 | Phase 2 | Pending |
| AI-01 | Phase 1 | Pending |
| AI-02 | Phase 1 | Pending |
| AI-03 | Phase 2 | Pending |
| AI-04 | Phase 3 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 3 | Pending |
| DATA-04 | Phase 3 | Pending |
| STATE-01 | Phase 2 | Pending |
| STATE-02 | Phase 2 | Pending |
| STATE-03 | Phase 2 | Pending |
| STATE-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓
