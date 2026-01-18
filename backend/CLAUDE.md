# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with hot reload (port 5001)
npm run build    # Compile TypeScript to dist/
npm start        # Run production build
```

## Environment Variables

Required in `backend/.env`:
```
PORT=5001
GEMINI_API_KEY=<required>
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/formbridge
GCS_BUCKET_NAME=<for PDF storage>
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

## Architecture

### Route Structure

All routes are prefixed with `/api/`:

| Route | Purpose |
|-------|---------|
| `/api/forms` | Form templates listing and retrieval |
| `/api/eligibility` | Pre-qualification checks |
| `/api/explain` | Single-turn AI explanations |
| `/api/chat` | Multi-turn AI conversation with answer suggestions |
| `/api/session` | Legacy session persistence |
| `/api/validate` | Form answer validation |
| `/api/support-chat` | General support chat |
| `/api/demo` | Demo session with pre-filled personas |
| `/api/pdf-session` | PDF form sessions with field values and chat history |
| `/api/rag` | Knowledge base search for RAG context |
| `/api/pdf-forms` | PDF form upload, listing, and management (GCS storage) |

### AI Service (Gemini)

`src/services/gemini.ts` handles all Gemini API calls:

- **explainQuestion()** - Single explanation with Ontario Works context injection (Grade 4 level)
- **chatAboutQuestion()** - Multi-turn chat that parses `SUGGESTED_ANSWER:` and `CONFIDENCE:` from responses (Grade 3-4 level)
- **generateEmbedding()** - Creates 768-dimension vectors using `text-embedding-004` for RAG semantic search
- **cosineSimilarity()** - Calculates similarity between embedding vectors

The service auto-injects relevant Ontario Works facts (asset limits, common-law rules, income exemptions) based on question keywords.

### RAG Service

`src/services/ragService.ts` provides retrieval-augmented generation:

- **Vector search first**: Uses in-memory cosine similarity with Gemini embeddings (no Atlas Vector Search required)
- **Text search fallback**: Falls back to MongoDB text index if vector search fails
- Auto-seeds knowledge base on startup with employment, finance, and government docs
- `getRAGContext(query, category?, formId?)` returns formatted context for AI injection
- `addKnowledgeDoc()` creates docs with auto-generated embeddings
- `migrateEmbeddings()` backfills embeddings for docs that don't have them

### PDF Forms Service

`src/routes/pdfForms.ts` handles PDF form management with Google Cloud Storage:

- **Upload flow**: Base64 upload or signed URL for direct GCS upload
- **Storage**: PDFs stored in GCS under `forms/{category}/{uuid}.pdf`
- **Metadata**: MongoDB stores form metadata (name, category, tags, difficulty)
- Categories: `employment`, `legal`, `finance`, `government`, `healthcare`, `immigration`

### Session Models

Three models for persistence:

1. **Session** (`src/models/Session.ts`) - Legacy form sessions with `answers` map
2. **PDFSession** (`src/models/PDFSession.ts`) - PDF form sessions with field values and chat history
3. **PDFForm** (`src/models/PDFForm.ts`) - PDF form metadata with GCS URL reference

### Form Data

`src/data/ontario-works.ts` contains the full Ontario Works form template with 7 sections. Each section has items that can be:
- `QuestionItem` - Input fields with validation
- `InstructionItem` - Guidance text
- `DefinitionItem` - Term explanations
- `WarningItem` - Alerts with severity levels
- `LegalItem` - Legal text requiring acknowledgment

### Validation

`src/utils/validation.ts` provides Canadian-specific validation:
- `isValidSIN()` - Luhn algorithm for SIN numbers
- `isOntarioPostalCode()` - Validates K, L, M, N, P prefixes
- `formatSIN()` / `formatPostalCode()` - Formatting helpers

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Port 5001 | macOS ControlCenter uses 5000 |
| Gemini 1.5 Flash | Fast response for interactive use |
| String UUIDs for session IDs | Easier frontend integration than MongoDB ObjectId |
| MongoDB text search for RAG | Simple setup, no vector DB needed |
| Grade 3-4 prompts | Target audience includes low literacy and ESL users |
| GCS for PDF storage | Scalable, signed URLs for large files |
| 50MB body limit | Allows base64 PDF uploads |
