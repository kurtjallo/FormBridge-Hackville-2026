# FormBridge Session Handoff

**Date:** 2026-01-17
**Project:** FormBridge - AI-powered government form assistance
**Current Milestone:** v2.0 PDF Form System
**Status:** Roadmap complete, ready to plan Phase 5

---

## Quick Start for New Session

```bash
# Read these files first (in order):
cat .planning/PROJECT.md      # Project vision and requirements
cat .planning/STATE.md        # Current position and decisions
cat .planning/ROADMAP.md      # Phase breakdown
cat .planning/API-CONTRACT-v2.md  # API coordination document

# Then run:
/gsd:plan-phase 5
```

---

## 1. Project Overview

### What FormBridge Does
AI-powered web app helping users complete Canadian government forms (Ontario Works, OSAP, etc.) by explaining everything in plain language at a 6th grade reading level.

### Core Value
**Make government forms accessible by explaining bureaucratic language in plain terms — the form itself shouldn't be a barrier when someone needs help.**

### Target Users
- Limited English proficiency
- Low literacy levels
- Confusion about government terminology
- Complex living situations that don't fit neat form categories

---

## 2. What's Built (v1.0) — COMPLETE

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand |
| Backend | Express.js, TypeScript |
| AI | Google Gemini 1.5 Flash |
| Database | MongoDB (sessions) |
| Ports | Frontend: 3000, Backend: 5001 |

### v1.0 Features (All Working)
- ✅ Dual-panel UI: Form on left, AI chat on right
- ✅ Ontario Works form with 5 sections, all question types
- ✅ Click [?] button → AI explains question in plain language
- ✅ Multi-turn conversation per question
- ✅ AI suggests answers → user clicks to auto-fill
- ✅ Canadian validation (SIN with Luhn, Ontario postal codes)
- ✅ Session persistence to MongoDB (2-second debounce autosave)
- ✅ Mobile responsive layout
- ✅ Demo persona (Maria Garcia) for testing

### Current Architecture (v1.0)
```
Frontend (Next.js)              Backend (Express)
┌─────────────────┐            ┌─────────────────┐
│ FormSection     │            │ POST /api/chat  │
│ FormQuestion    │───────────▶│ POST /api/explain│
│ ChatPanel       │            │ POST /api/session│
│ Zustand Store   │            │ Gemini Service  │
└─────────────────┘            └─────────────────┘
        │                              │
        ▼                              ▼
   localStorage                    MongoDB
```

### Key v1.0 Files
```
backend/
├── src/
│   ├── routes/
│   │   ├── chat.ts         # Multi-turn AI conversation
│   │   ├── explain.ts      # Plain language explanations
│   │   ├── session.ts      # Session persistence
│   │   ├── forms.ts        # Form listing (NOT used by frontend)
│   │   └── eligibility.ts  # Eligibility check (NOT used by frontend)
│   ├── services/
│   │   └── gemini.ts       # Gemini AI integration
│   ├── types/
│   │   └── form.ts         # All TypeScript interfaces
│   ├── data/
│   │   └── ontario-works.ts # Full form template (structured data)
│   └── utils/
│       └── validation.ts   # SIN/postal code validation

frontend/
├── src/
│   ├── app/
│   │   └── page.tsx        # Main form page
│   ├── components/
│   │   ├── FormSection.tsx
│   │   ├── FormQuestion.tsx
│   │   └── ChatPanel.tsx
│   ├── store/
│   │   └── formStore.ts    # Zustand state management
│   ├── lib/
│   │   └── api.ts          # Backend API client
│   └── data/
│       └── ontarioWorksForm.ts  # Form data (imported, NOT fetched)
```

---

## 3. What We're Building (v2.0) — IN PROGRESS

### The Big Change
**Transform from structured TypeScript forms to PDF-based forms.**

Instead of:
- Form data as TypeScript objects
- Custom form rendering
- Click [?] button for help

We're building:
- Display actual government PDF documents
- Users fill fields directly in the PDF
- Click/tap anywhere on PDF → AI explains that section
- Export filled PDF for submission

### User Flow (v2.0)
```
1. Landing Page      → "Get Started" button
        ↓
2. Category Select   → Social Assistance | Education | Healthcare | Housing | Legal
        ↓
3. Form Select       → List of forms in category (or upload your own)
        ↓
4. Eligibility Check → Quick yes/no questions (skip for Legal/uploads)
        ↓
5. PDF Form View     → Left: Interactive PDF | Right: AI chat panel
                       - Click any section → AI explains it
                       - Type into form fields → Auto-save
                       - Signature field for legal docs
        ↓
6. Export            → Download filled PDF
```

### Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| PDF Viewer | react-pdf v10.3.0 | Most mature, 1M+ downloads, Dec 2024 release |
| Form Filling | pdf-lib v1.17.1 | Pure TypeScript, works in browser and Node |
| Text Extraction | unpdf | Modern, serverless-optimized, replaces deprecated pdf-parse |
| Signatures | react-signature-canvas v1.1.0 | Lightweight, 100% test coverage |
| AI Trigger | Click (not hover) | Works on mobile, less noisy UX |
| State | Separate pdfStore.ts | PDF state is conceptually different from form state |
| Coordinates | Backend converts | Return web-ready coordinates, frontend doesn't need to flip |

### Critical Pitfalls to Avoid

1. **XFA Forms** — Adobe-proprietary format, JS libraries have ZERO support. Detect on upload, reject with clear message.

2. **Coordinate Inversion** — PDF Y-origin is bottom-left (increases upward), web is top-left (increases downward). Must convert.

3. **Malicious PDFs** — Can contain JavaScript, XSS payloads. Validate server-side, never serve inline.

4. **Form Flattening** — pdf-lib `flatten()` fails on some real-world government forms. Need error handling.

---

## 4. v2.0 Roadmap (4 Phases)

### Phase 5: PDF Foundation
**Goal:** Display PDFs with category-based navigation
**Requirements:** PDF-01 to PDF-05
**Success Criteria:**
1. User can select a category and see available forms
2. PDF displays in browser with zoom and page navigation
3. XFA forms are detected and show clear error message
4. PDF types and pdfStore established

**Plans:**
- 05-01: PDF types, pdfStore, react-pdf viewer setup
- 05-02: Category pages, form metadata, navigation

### Phase 6: Field Detection & AI
**Goal:** Detect form fields and trigger AI explanations on click
**Requirements:** FIELD-01 to FIELD-05
**Success Criteria:**
1. Fillable PDF fields are detected and highlighted
2. PDF text is extracted for AI context
3. Clicking a field triggers AI explanation in chat panel
4. AI explains field in plain language (6th grade level)

**Plans:**
- 06-01: PDF text extraction, AcroForm field detection
- 06-02: ChatPanel extension, proactive AI on field click

### Phase 7: Form Filling & Export
**Goal:** Users can fill PDF fields and download completed form
**Requirements:** FILL-01 to EXPORT-03
**Success Criteria:**
1. HTML inputs overlay PDF form fields accurately
2. User can type in text fields, check boxes, select options
3. Values save to pdfStore with autosave
4. User can download filled PDF

**Plans:**
- 07-01: PDFFieldOverlay, coordinate conversion, form inputs
- 07-02: pdf-lib export, download flow, form flattening

### Phase 8: Signatures & Uploads
**Goal:** Signature support and user PDF uploads
**Requirements:** SIG-01 to UPL-03
**Success Criteria:**
1. User can draw signature on signature pad
2. Signature embeds in exported PDF
3. User can upload their own PDF
4. AI can analyze uploaded PDFs

**Plans:**
- 08-01: Signature pad component, signature embedding
- 08-02: User upload flow, AI PDF analysis

---

## 5. API Contract (v2.0)

### New Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/categories` | List all 5 form categories |
| GET | `/api/categories/:id/forms` | List forms in a category |
| GET | `/api/pdf/:formId` | Serve pre-loaded PDF file |
| POST | `/api/pdf/upload` | Upload user's PDF |
| POST | `/api/pdf/:id/analyze` | Detect fields using Gemini Vision |
| POST | `/api/pdf/:id/export` | Export filled PDF with signatures |

### Extended Existing Endpoints

| Endpoint | New Fields |
|----------|------------|
| POST `/api/chat` | Add `pdfContext: { pdfId, formName, pageNumber, surroundingText }` |
| POST `/api/session` | Add `pdfState: { pdfId, currentPage, fieldValues, signatures }` |

### Key Types (to be shared)

```typescript
interface PDFField {
  id: string;
  name: string;
  type: 'text' | 'checkbox' | 'select' | 'date' | 'signature';
  label: string;
  page: number;
  bbox: { x: number; y: number; width: number; height: number };
  required: boolean;
  options?: string[];  // For select fields
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  formCount: number;
}

interface PDFFormInfo {
  id: string;
  name: string;
  description: string;
  pdfUrl: string;
  pageCount: number;
  hasEligibilityCheck: boolean;
  signatureRequired: boolean;
}
```

Full API contract: `.planning/API-CONTRACT-v2.md`

---

## 6. Research Findings Summary

### Stack Recommendations (HIGH confidence)
- **react-pdf v10.3.0** — Best React PDF viewer, Dec 2024 release
- **pdf-lib v1.17.1** — Only mature lib for modifying existing PDFs in JS
- **unpdf** — Modern text extraction, serverless-ready
- **react-signature-canvas v1.1.0** — Simple, well-tested signature capture
- **@pdf-lib/fontkit** — Needed for French Canadian characters (accents)

### Architecture Pattern
- **Client-side:** PDF viewing (react-pdf), form field UI, signature capture
- **Server-side:** AI field detection, text extraction, PDF export, signature embedding

### Form Categories
| Category | Examples | Notes |
|----------|----------|-------|
| Social Assistance | Ontario Works, ODSP | Full form filling |
| Education | OSAP, grants | Full form filling |
| Healthcare | OHIP, drug benefits | Full form filling |
| Housing | Rent assistance | Full form filling |
| Legal | NDA, consent forms | Signature only |

Full research: `.planning/research/` (SUMMARY.md, STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md)

---

## 7. Open Questions (Need Decisions)

1. **PDF Storage Location**
   - Pre-loaded PDFs: `/backend/public/pdfs/` or cloud storage?
   - User uploads: Temp filesystem or MongoDB GridFS?
   - **Recommendation for hackathon:** Filesystem for both (simple)

2. **Field Detection Strategy**
   - AcroForm extraction first, Gemini Vision as fallback?
   - Or Gemini Vision for everything?
   - **Recommendation:** AcroForm first (faster, more accurate for fillable PDFs)

3. **Type Sharing**
   - Currently frontend has duplicate type definitions
   - Create shared package or just copy?
   - **Recommendation for hackathon:** Copy types (faster than shared package setup)

4. **Sample PDFs**
   - Need actual Ontario Works PDF to test
   - Verify if it's AcroForm or XFA
   - **Action:** Find and download real government PDF for testing

---

## 8. GSD Configuration

```json
{
  "mode": "yolo",           // Auto-approve everything
  "depth": "quick",         // 3-5 phases (we have 4)
  "parallelization": {
    "enabled": true,
    "plan_level": true,     // Run plans in parallel
    "max_concurrent_agents": 3
  }
}
```

---

## 9. File Structure Summary

```
.planning/
├── PROJECT.md           # Project vision, requirements, constraints
├── STATE.md             # Current position, decisions, velocity
├── ROADMAP.md           # All phases (v1.0 + v2.0)
├── REQUIREMENTS.md      # All requirements with traceability
├── MILESTONES.md        # v1.0 completed, v2.0 current
├── API-CONTRACT-v2.md   # API coordination document
├── HANDOFF.md           # This file
├── config.json          # GSD configuration
├── research/            # v2.0 research documents
│   ├── SUMMARY.md       # Executive summary with roadmap implications
│   ├── STACK.md         # Technology recommendations
│   ├── FEATURES.md      # Feature landscape
│   ├── ARCHITECTURE.md  # Component diagram and data flows
│   └── PITFALLS.md      # Critical mistakes to avoid
└── phases/
    ├── 01-backend-api/      # v1.0 (complete)
    ├── 02-frontend-core/    # v1.0 (complete)
    ├── 03-polish-persistence/ # v1.0 (complete)
    ├── 04-backend-data/     # v1.0 (complete)
    ├── 05-pdf-foundation/   # v2.0 (not started)
    ├── 06-field-detection-ai/ # v2.0 (not started)
    ├── 07-form-filling-export/ # v2.0 (not started)
    └── 08-signatures-uploads/ # v2.0 (not started)
```

---

## 10. Environment Setup

### Backend (.env)
```
PORT=5001
GEMINI_API_KEY=<required>
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/formbridge
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Run Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## 11. Next Steps

### Immediate (Phase 5)
1. Run `/gsd:plan-phase 5` to create detailed plan
2. Install PDF libraries: `npm install react-pdf pdf-lib unpdf`
3. Create PDF types and pdfStore
4. Build basic PDF viewer
5. Create category pages

### Before Phase 6
- Get actual Ontario Works PDF for testing
- Verify if it's AcroForm (fillable) or XFA (not supported)
- Test react-pdf with the real PDF

### Before Phase 7
- Test pdf-lib filling with real form fields
- Establish coordinate conversion utilities

---

## 12. Key Commands

```bash
# Check project status
/gsd:progress

# Plan next phase
/gsd:plan-phase 5

# Execute a plan
/gsd:execute-plan .planning/phases/05-pdf-foundation/05-01-PLAN.md

# If stuck on a bug
/gsd:debug

# Add an idea without interrupting
/gsd:add-todo "idea description"
```

---

## 13. Git State

**Current branch:** `feature/forms`
**Main branch:** `main`

**Recent commits:**
```
76dd72a docs: create v2.0 roadmap (4 phases, 24 requirements)
05fbcb2 docs: research PDF form ecosystem for v2.0
1a1c906 docs: start milestone v2.0 PDF Form System
442cb3b feat: add validation utilities and types
```

**Working tree:** Clean

---

*Handoff created: 2026-01-17*
*Ready for: /gsd:plan-phase 5*
