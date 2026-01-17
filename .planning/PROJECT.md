# FormBridge

## What This Is

An AI-powered web application that helps users complete Canadian government forms by displaying actual PDFs with proactive AI assistance. When users interact with any form field, the AI automatically explains it in plain language at a 6th grade reading level. Supports both pre-loaded government forms and user uploads.

## Core Value

Make government forms accessible by explaining bureaucratic language in plain terms — the form itself shouldn't be a barrier when someone needs help.

## Current Milestone: v2.0 PDF Form System

**Goal:** Transform from structured TypeScript forms to a PDF-based system with proactive AI assistance, category navigation, and filled PDF export.

**Target features:**
- Category-based form selection (5 categories)
- PDF viewer with interactive form field detection
- Proactive AI explanations on field focus
- Direct PDF form filling
- Signature support for legal documents
- User PDF uploads with AI analysis
- Export filled PDF

## Requirements

### Validated

<!-- Shipped in v1.0 -->

- ✓ Backend API with Express + Gemini AI — v1.0
- ✓ Multi-turn conversation with context — v1.0
- ✓ Session persistence via MongoDB — v1.0
- ✓ Mobile responsive layout — v1.0
- ✓ Canadian validation (SIN, postal codes) — v1.0

### Active

**Core PDF System:**
- [ ] PDF viewer component with field detection
- [ ] Proactive AI trigger on field focus/click
- [ ] PDF form field filling
- [ ] Filled PDF export/download
- [ ] PDF text extraction for AI context

**Form Navigation:**
- [ ] Category selection page (Social Assistance, Education, Healthcare, Housing, Legal)
- [ ] Form list within each category
- [ ] User PDF upload flow
- [ ] Eligibility check (skip for uploads/legal docs)

**Signature Support:**
- [ ] Signature pad component
- [ ] Signature field detection in PDFs
- [ ] Signature embedding in exported PDF

**AI Integration:**
- [ ] AI analyzes uploaded PDFs
- [ ] Context-aware explanations from PDF content
- [ ] Suggest answers with auto-fill to PDF fields

### Out of Scope

- Actual form submission to government — demo only
- User authentication/accounts — session-based only
- Offline support — requires API for AI features
- Multi-language support — English only for MVP
- OCR for scanned/image PDFs — fillable PDFs only
- PDF creation from scratch — only filling existing forms

## Context

**Target Users:** People completing government forms who may have:
- Limited English proficiency
- Low literacy levels
- Confusion about government terminology
- Complex living situations that don't fit neat categories

**Form Categories:**

| Category | Example Forms | Notes |
|----------|---------------|-------|
| Social Assistance | Ontario Works, ODSP | Full form filling |
| Education | OSAP, grants | Full form filling |
| Healthcare | OHIP, drug benefits | Full form filling |
| Housing | Rent assistance | Full form filling |
| Legal | NDA, consent forms | Signature only |

**PDF Technical Approach:**
- Viewing: pdf.js or @react-pdf-viewer
- Form filling: pdf-lib
- Text extraction: pdf-parse
- Signature: react-signature-canvas or similar

## Constraints

- **Tech Stack**: Next.js 14 + Express.js + TypeScript + Tailwind
- **AI Provider**: Google Gemini via @google/generative-ai SDK
- **Database**: MongoDB with Mongoose
- **PDF Libraries**: pdf-lib (filling), pdf.js (viewing), pdf-parse (extraction)
- **Ports**: Frontend :3000, Backend :5001
- **Timeline**: Hackathon — core PDF flow first

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Gemini over OpenAI | Specified in requirements | ✓ Good |
| Zustand for state | Lightweight, simple API | ✓ Good |
| Port 5001 | macOS ControlCenter uses 5000 | ✓ Good |
| PDF-based forms | User wants real PDF interaction | — Pending |
| Proactive AI | Auto-explain on field focus | — Pending |
| pdf-lib for filling | Industry standard, well-maintained | — Pending |
| Category navigation | Organize forms by type | — Pending |
| AI-assisted uploads | Full AI support for user PDFs | — Pending |

---
*Last updated: 2026-01-17 after v2.0 milestone start*
