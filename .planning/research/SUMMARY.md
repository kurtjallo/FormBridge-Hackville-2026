# Project Research Summary

**Project:** FormBridge v2.0 — PDF Form System
**Domain:** PDF form interaction with AI assistance for government forms
**Researched:** 2026-01-17
**Confidence:** MEDIUM-HIGH

## Executive Summary

FormBridge v2.0 transforms from structured TypeScript forms to a PDF-based system. The research confirms this is achievable with mature, open-source libraries: **react-pdf** for viewing, **pdf-lib** for form filling/export, **unpdf** for text extraction, and **react-signature-canvas** for signatures. All are MIT-licensed and work well with the existing Next.js + Express stack.

The key differentiator — **proactive AI explanations on field focus** — aligns with 2025/2026 "anticipatory UX" trends. Most PDF form tools focus on speed and automation; FormBridge's value is making forms *understandable* for users with limited English or low literacy. This requires extending the existing ChatPanel to watch for field focus events and auto-trigger explanations.

Critical pitfalls to avoid: **XFA forms are incompatible** with all JavaScript PDF libraries (must detect and reject on upload), **coordinate systems are inverted** between web and PDF (establish conversion utilities early), and **malicious PDF uploads** are a real security risk (validate and sanitize server-side). Testing with actual Ontario government forms early is essential.

---

## Key Findings

### Recommended Stack

The PDF stack integrates cleanly with the existing Next.js 14 + Express architecture. All libraries are pure JavaScript with no native dependencies.

**Core technologies:**
- **react-pdf** v10.3.0: PDF viewing in React — 1M+ weekly downloads, Dec 2024 release with 27% smaller bundle
- **pdf-lib** v1.17.1: PDF form filling and modification — pure TypeScript, works in browser and Node
- **unpdf**: Text extraction — modern replacement for deprecated pdf-parse, serverless-optimized
- **react-signature-canvas** v1.1.0: Signature capture — lightweight, 100% test coverage

**Note:** For French Canadian forms with accented characters, add **@pdf-lib/fontkit** for custom font embedding.

See: [STACK.md](./STACK.md) for full installation commands and alternatives.

### Expected Features

**Must have (table stakes):**
- PDF viewing with mobile pinch-zoom
- Form field detection for fillable PDFs
- Text, checkbox, and select field filling
- Autosave (extend existing 2-second debounce)
- Export filled PDF
- Clear error messages in plain language

**Should have (differentiators):**
- **Proactive AI on field focus** — THE key differentiator
- AI-suggested answers with auto-fill
- Category-based form navigation
- 6th grade reading level explanations

**Defer (v2.x+):**
- Signature pad (add when Legal category enabled)
- User PDF uploads (adds AI analysis complexity)
- OCR for scanned PDFs (accuracy too low for vulnerable users)
- Multi-language support

See: [FEATURES.md](./FEATURES.md) for full feature landscape and prioritization.

### Architecture Approach

The architecture splits responsibilities: **client-side for viewing** (PDF.js designed for browsers), **server-side for AI and export** (API key security, complex processing). A new `pdfStore.ts` manages PDF-specific state separately from the existing formStore.

**Major components:**
1. **PDFViewerContainer** — Renders PDF with react-pdf, orchestrates field overlays
2. **PDFFieldOverlay** — Positions HTML inputs over detected PDF form fields
3. **ChatPanel (extended)** — Watches `activeFieldId`, triggers proactive explanations
4. **PDFExportService** — Uses pdf-lib to fill fields and generate download

**Key insight:** pdf-lib fills fields programmatically, not interactively. Users won't see input in the PDF until export. Recommendation: overlay HTML inputs for real-time feedback, consolidate to pdf-lib on export.

See: [ARCHITECTURE.md](./ARCHITECTURE.md) for data flow diagrams and build order.

### Critical Pitfalls

1. **XFA Forms** — Many government forms use Adobe-proprietary XFA format. JavaScript libraries have zero support. Detect on upload, reject with clear message.

2. **Coordinate System Inversion** — PDF Y-origin is bottom-left (increases upward), web is top-left (increases downward). Signatures appear in wrong positions. Create conversion utilities from day one.

3. **Malicious PDF Uploads** — PDFs can contain JavaScript, XSS payloads, and malformed objects. Validate server-side, sanitize, never serve inline.

4. **Form Flattening Edge Cases** — pdf-lib `flatten()` fails on real-world government forms with missing page references. Test with actual Ontario forms, not just test PDFs.

5. **E-Signature vs Digital Signature** — Drawn signatures are just images (no tamper detection). Be explicit in UI about what the feature provides.

See: [PITFALLS.md](./PITFALLS.md) for full pitfall catalog and "Looks Done But Isn't" checklist.

---

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: PDF Foundation & Upload

**Rationale:** Must establish PDF viewing and upload before any other features. Coordinate system and XFA detection are critical early decisions that affect all subsequent work.

**Delivers:**
- PDF types and Zustand store
- Basic PDF viewer component
- Upload route with Multer
- XFA detection and rejection
- Malicious PDF validation

**Addresses:** Table stakes (viewing, upload)
**Avoids:** XFA compatibility pitfall, security vulnerabilities

### Phase 2: Form Categories & Navigation

**Rationale:** Before users interact with PDFs, they need to find them. Category structure is low-risk and provides clear user flow.

**Delivers:**
- Category selection page (5 categories)
- Form listing within categories
- Pre-loaded government PDF storage
- Form metadata structure

**Addresses:** Category-based navigation feature
**Uses:** Existing Next.js routing patterns

### Phase 3: Field Detection & AI Integration

**Rationale:** Field detection must complete before interactive form filling. This phase connects the PDF viewer to the existing Gemini AI infrastructure.

**Delivers:**
- PDF text extraction with unpdf
- Gemini Vision for field detection (flat PDFs)
- AcroForm field extraction (fillable PDFs)
- Proactive AI explanations on field focus
- Extended ChatPanel with field awareness

**Addresses:** Proactive AI differentiator
**Uses:** unpdf, existing Gemini service
**Implements:** AI explanation flow from architecture

### Phase 4: Form Filling & Interaction

**Rationale:** With fields detected, build the interactive filling experience. Depends on Phase 3's field detection.

**Delivers:**
- PDFFieldOverlay component
- Text, checkbox, select field inputs
- Field value state management
- Coordinate system conversion
- Autosave extension from v1.0

**Addresses:** Form filling table stakes
**Avoids:** Coordinate inversion pitfall

### Phase 5: Export & Signatures

**Rationale:** Export is the final step in user flow. Signatures are deferred slightly as they're primarily for Legal category.

**Delivers:**
- PDF export with pdf-lib
- Form flattening (with error handling)
- Signature pad component
- Signature embedding in export
- Download flow

**Addresses:** Export table stakes, signature differentiator
**Avoids:** Flatten failures pitfall

### Phase 6: Polish & User Uploads

**Rationale:** User uploads add significant complexity (AI analysis of unknown PDFs). Defer to after core flow works.

**Delivers:**
- User PDF upload flow
- AI analysis of uploaded PDFs
- Visual progress indicator
- Mobile optimization
- Accessibility audit

**Addresses:** User upload feature
**Avoids:** Performance traps, accessibility pitfalls

---

### Phase Ordering Rationale

- **Phases 1-2 first:** Foundation and navigation establish the skeleton before complex PDF interaction
- **Phase 3 before 4:** Field detection must complete before fields can be positioned and filled
- **Phase 5 after 4:** Export depends on form filling being functional
- **Phase 6 last:** User uploads are high-complexity and not required for core government form flow

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 3 (Field Detection):** Gemini Vision prompt engineering for government forms; accuracy unknown
- **Phase 5 (Export):** pdf-lib flattening behavior with real Ontario forms needs testing

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Standard file upload patterns, well-documented
- **Phase 2:** Standard Next.js routing and static data
- **Phase 4:** Standard React form patterns

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official docs verified, Dec 2024 releases confirmed |
| Features | MEDIUM | UX patterns verified but FormBridge-specific implementation untested |
| Architecture | MEDIUM | Based on established patterns but integration untested |
| Pitfalls | HIGH | Multiple authoritative sources, real GitHub issues |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Actual Ontario Works PDF:** Need to test with real form to verify AcroForm vs XFA, field detection accuracy
- **Field overlay positioning:** How accurate is bbox across different screen sizes and zoom levels?
- **Gemini Vision accuracy:** How well does it detect form fields in government layouts specifically?
- **French Canadian fonts:** Test @pdf-lib/fontkit with accented characters early

---

## Sources

### Primary (HIGH confidence)
- react-pdf v10.3.0 release notes (Dec 2024)
- pdf-lib official documentation
- OWASP File Upload Cheat Sheet
- PDF Association signature vulnerability research

### Secondary (MEDIUM confidence)
- Nutrient/PSPDFKit performance guides
- Community blog posts on PDF form patterns (2025)
- Stack Overflow discussions on coordinate systems

### Tertiary (LOW confidence — validate during implementation)
- Specific government form requirements (need to verify with Ontario Works)
- AI field detection accuracy claims

---
*Research completed: 2026-01-17*
*Ready for roadmap: yes*
