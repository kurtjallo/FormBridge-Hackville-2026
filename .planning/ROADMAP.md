# Roadmap: FormBridge

## Milestones

- ✅ **v1.0 MVP** - Phases 1-4 (shipped 2026-01-17)
- 🚧 **v2.0 PDF Form System** - Phases 5-8 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-01-17</summary>

### Phase 1: Backend API
**Goal**: Working API that explains form questions and handles conversations
**Plans**: 2/2 complete

### Phase 2: Frontend Core
**Goal**: Interactive form with AI-powered help and auto-fill suggestions
**Plans**: 3/3 complete

### Phase 3: Polish & Persistence
**Goal**: Production-ready polish with validation, persistence, and responsiveness
**Plans**: 2/2 complete

### Phase 4: Backend Data & Forms API
**Goal**: TypeScript types, form data, and forms/eligibility routes
**Plans**: Complete

</details>

---

## 🚧 v2.0 PDF Form System (In Progress)

**Milestone Goal:** Transform FormBridge from structured TypeScript forms to a PDF-based system where users interact with actual government PDFs, with proactive AI assistance on field click.

- [ ] **Phase 5: PDF Foundation** - PDF viewer, categories, form navigation
- [ ] **Phase 6: Field Detection & AI** - Extract fields, proactive AI on click
- [ ] **Phase 7: Form Filling & Export** - Fill fields, export PDF
- [ ] **Phase 8: Signatures & Uploads** - Signature pad, user uploads

## Phase Details

### Phase 5: PDF Foundation
**Goal**: Display PDFs with category-based navigation
**Depends on**: Phase 4 (v1.0 complete)
**Requirements**: PDF-01, PDF-02, PDF-03, PDF-04, PDF-05
**Success Criteria** (what must be TRUE):
  1. User can select a category and see available forms
  2. PDF displays in browser with zoom and page navigation
  3. XFA forms are detected and show clear error message
  4. PDF types and pdfStore established
**Research flag**: Unlikely (standard patterns)
**Plans**: TBD

Plans:
- [ ] 05-01: PDF types, pdfStore, react-pdf viewer setup
- [ ] 05-02: Category pages, form metadata, navigation

### Phase 6: Field Detection & AI
**Goal**: Detect form fields and trigger AI explanations on click
**Depends on**: Phase 5
**Requirements**: FIELD-01, FIELD-02, FIELD-03, FIELD-04, FIELD-05
**Success Criteria** (what must be TRUE):
  1. Fillable PDF fields are detected and highlighted
  2. PDF text is extracted for AI context
  3. Clicking a field triggers AI explanation in chat panel
  4. AI explains field in plain language (6th grade level)
**Research flag**: Likely (Gemini Vision prompt engineering)
**Plans**: TBD

Plans:
- [ ] 06-01: PDF text extraction, AcroForm field detection
- [ ] 06-02: ChatPanel extension, proactive AI on field click

### Phase 7: Form Filling & Export
**Goal**: Users can fill PDF fields and download completed form
**Depends on**: Phase 6
**Requirements**: FILL-01, FILL-02, FILL-03, FILL-04, FILL-05, EXPORT-01, EXPORT-02, EXPORT-03
**Success Criteria** (what must be TRUE):
  1. HTML inputs overlay PDF form fields accurately
  2. User can type in text fields, check boxes, select options
  3. Values save to pdfStore with autosave
  4. User can download filled PDF
**Research flag**: Unlikely (standard React form patterns)
**Plans**: TBD

Plans:
- [ ] 07-01: PDFFieldOverlay, coordinate conversion, form inputs
- [ ] 07-02: pdf-lib export, download flow, form flattening

### Phase 8: Signatures & Uploads
**Goal**: Signature support and user PDF uploads
**Depends on**: Phase 7
**Requirements**: SIG-01, SIG-02, SIG-03, UPL-01, UPL-02, UPL-03
**Success Criteria** (what must be TRUE):
  1. User can draw signature on signature pad
  2. Signature embeds in exported PDF
  3. User can upload their own PDF
  4. AI can analyze uploaded PDFs
**Research flag**: Unlikely (react-signature-canvas well-documented)
**Plans**: TBD

Plans:
- [ ] 08-01: Signature pad component, signature embedding
- [ ] 08-02: User upload flow, AI PDF analysis

## Progress

**Execution Order:** 5 → 6 → 7 → 8

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Backend API | v1.0 | 2/2 | Complete | 2026-01-17 |
| 2. Frontend Core | v1.0 | 3/3 | Complete | 2026-01-17 |
| 3. Polish & Persistence | v1.0 | 2/2 | Complete | 2026-01-17 |
| 4. Backend Data | v1.0 | 1/1 | Complete | 2026-01-17 |
| 5. PDF Foundation | v2.0 | 0/2 | Not started | - |
| 6. Field Detection & AI | v2.0 | 0/2 | Not started | - |
| 7. Form Filling & Export | v2.0 | 0/2 | Not started | - |
| 8. Signatures & Uploads | v2.0 | 0/2 | Not started | - |
