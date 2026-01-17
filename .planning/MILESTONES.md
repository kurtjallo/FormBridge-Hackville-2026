# Milestones

## v1.0 — Foundation (Completed)

**Shipped:** 2026-01-17

**What was built:**
- Backend API with Express.js + TypeScript
- Gemini AI integration for explanations and chat
- Frontend with Next.js 14 + Tailwind
- Dual-panel form view (form left, chat right)
- Per-question conversation history
- MongoDB session persistence with autosave
- Ontario Works form as structured TypeScript data
- Canadian validation (SIN, postal codes)
- Mobile responsive layout

**Key decisions:**
- Port 5001 (macOS uses 5000)
- Gemini 1.5 Flash for fast responses
- Zustand for state management
- 2-second debounce autosave

---

## v2.0 — PDF Form System (Current)

**Started:** 2026-01-17

**Goal:** Transform FormBridge from structured TypeScript forms to a PDF-based system where users interact with actual government PDFs, with proactive AI assistance.

**Target features:**
- Category-based form selection (Social Assistance, Education, Healthcare, Housing, Legal)
- PDF viewer with interactive form fields
- Proactive AI explanations on field focus
- Fill PDF form fields directly
- Signature support for legal documents (NDA)
- User PDF uploads with AI assistance
- Export filled PDF

**Architecture changes:**
- PDF viewing (pdf.js / react-pdf)
- PDF form filling + export (pdf-lib)
- PDF text extraction for AI context (pdf-parse)
- Signature pad component
- Category/form metadata structure
