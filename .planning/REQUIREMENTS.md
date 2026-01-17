# Requirements: FormBridge

## v1 (MVP Demo) — COMPLETE

<details>
<summary>v1 Requirements (Phases 1-4) — All Complete</summary>

### Backend API

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| API-01 | Express server with CORS enabled for frontend communication | Must Have | ✓ |
| API-02 | POST /explain endpoint returns plain-language explanation for form questions | Must Have | ✓ |
| API-03 | POST /chat endpoint handles multi-turn conversation with history | Must Have | ✓ |
| API-04 | POST /validate endpoint checks form answers for consistency | Should Have | ✓ |
| API-05 | GET /session/:id loads existing session from MongoDB | Should Have | ✓ |
| API-06 | POST /session saves/creates session in MongoDB | Should Have | ✓ |

### Frontend Form

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FORM-01 | Form displays all 5 sections with questions and appropriate inputs | Must Have | ✓ |
| FORM-02 | Help button on each question opens chat panel with that question active | Must Have | ✓ |
| FORM-03 | Form inputs support text, number, select, textarea, checkbox types | Must Have | ✓ |
| FORM-04 | Progress bar shows section completion status | Should Have | ✓ |
| FORM-05 | Mobile responsive layout | Should Have | ✓ |

### Chat Panel

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| CHAT-01 | Chat panel shows current question context at top | Must Have | ✓ |
| CHAT-02 | Message list displays user/assistant messages with distinct styling | Must Have | ✓ |
| CHAT-03 | Text input with send button for user messages | Must Have | ✓ |
| CHAT-04 | Quick action buttons for common questions | Must Have | ✓ |
| CHAT-05 | Loading indicator during AI response | Must Have | ✓ |
| CHAT-06 | AI suggestion displayed as clickable button to auto-fill form | Must Have | ✓ |

### AI Integration

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| AI-01 | Gemini SDK integration for generating explanations | Must Have | ✓ |
| AI-02 | System prompts configured for 6th grade reading level responses | Must Have | ✓ |
| AI-03 | Conversation history maintained per question | Must Have | ✓ |
| AI-04 | Suggested answers include confidence level | Should Have | ✓ |

### Data & Validation

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| DATA-01 | Ontario Works form template with 5 sections and all questions | Must Have | ✓ |
| DATA-02 | Question metadata: originalText, fieldType, context, commonConfusions | Must Have | ✓ |
| DATA-03 | Canadian postal code validation (Ontario prefixes K, L, M, N, P) | Should Have | ✓ |
| DATA-04 | SIN validation with Luhn algorithm | Should Have | ✓ |

### State Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| STATE-01 | Zustand store for form answers | Must Have | ✓ |
| STATE-02 | Active question tracking for chat panel | Must Have | ✓ |
| STATE-03 | Conversation history per question in store | Must Have | ✓ |
| STATE-04 | Session ID tracking for persistence | Should Have | ✓ |

</details>

---

## v2 (PDF Form System) — CURRENT

### PDF Viewing & Upload

| ID | Requirement | Priority |
|----|-------------|----------|
| PDF-01 | PDF viewer component displays PDFs with zoom and page navigation | Must Have |
| PDF-02 | Category selection page with 5 categories (Social Assistance, Education, Healthcare, Housing, Legal) | Must Have |
| PDF-03 | Form listing within each category | Must Have |
| PDF-04 | XFA form detection with user-friendly rejection message | Must Have |
| PDF-05 | Malicious PDF validation on upload (server-side) | Must Have |

### Field Detection & AI

| ID | Requirement | Priority |
|----|-------------|----------|
| FIELD-01 | AcroForm field extraction for fillable PDFs | Must Have |
| FIELD-02 | PDF text extraction for AI context (unpdf) | Must Have |
| FIELD-03 | Click on PDF section triggers AI explanation in chat panel | Must Have |
| FIELD-04 | ChatPanel extended with activeFieldId awareness | Must Have |
| FIELD-05 | AI provides field-specific explanations at 6th grade level | Must Have |

### Form Filling

| ID | Requirement | Priority |
|----|-------------|----------|
| FILL-01 | PDFFieldOverlay positions HTML inputs over detected form fields | Must Have |
| FILL-02 | Text, checkbox, and select field inputs | Must Have |
| FILL-03 | Field values stored in pdfStore (Zustand) | Must Have |
| FILL-04 | Coordinate system conversion (PDF to web) | Must Have |
| FILL-05 | Autosave extends v1.0 pattern (2-second debounce) | Should Have |

### Export

| ID | Requirement | Priority |
|----|-------------|----------|
| EXPORT-01 | PDF export using pdf-lib fills form fields | Must Have |
| EXPORT-02 | Download filled PDF button | Must Have |
| EXPORT-03 | Form flattening with error handling | Should Have |

### Signatures

| ID | Requirement | Priority |
|----|-------------|----------|
| SIG-01 | Signature pad component (react-signature-canvas) | Should Have |
| SIG-02 | Signature embedding in exported PDF | Should Have |
| SIG-03 | Clear/redo signature functionality | Should Have |

### User Uploads (v2.x)

| ID | Requirement | Priority |
|----|-------------|----------|
| UPL-01 | User PDF upload flow | Nice to Have |
| UPL-02 | AI analysis of uploaded PDFs | Nice to Have |
| UPL-03 | Upload route with Multer | Nice to Have |

---

## v3 (Future)

| ID | Requirement | Priority |
|----|-------------|----------|
| V3-01 | OCR for scanned PDFs | Future |
| V3-02 | Multi-language support (French) | Future |
| V3-03 | Hover-based help tooltips | Future |
| V3-04 | Digital signatures with certificates | Future |

---

## Traceability

### v1 Requirements (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| API-01 through STATE-04 | Phases 1-4 | ✓ Complete |

### v2 Requirements

| Requirement | Phase | Status |
|-------------|-------|--------|
| PDF-01 | Phase 5 | Pending |
| PDF-02 | Phase 5 | Pending |
| PDF-03 | Phase 5 | Pending |
| PDF-04 | Phase 5 | Pending |
| PDF-05 | Phase 5 | Pending |
| FIELD-01 | Phase 6 | Pending |
| FIELD-02 | Phase 6 | Pending |
| FIELD-03 | Phase 6 | Pending |
| FIELD-04 | Phase 6 | Pending |
| FIELD-05 | Phase 6 | Pending |
| FILL-01 | Phase 7 | Pending |
| FILL-02 | Phase 7 | Pending |
| FILL-03 | Phase 7 | Pending |
| FILL-04 | Phase 7 | Pending |
| FILL-05 | Phase 7 | Pending |
| EXPORT-01 | Phase 7 | Pending |
| EXPORT-02 | Phase 7 | Pending |
| EXPORT-03 | Phase 7 | Pending |
| SIG-01 | Phase 8 | Pending |
| SIG-02 | Phase 8 | Pending |
| SIG-03 | Phase 8 | Pending |
| UPL-01 | Phase 8 | Pending |
| UPL-02 | Phase 8 | Pending |
| UPL-03 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 24 total (all complete)
- v2 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓
