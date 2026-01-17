# Architecture Research

**Domain:** PDF form interaction in Next.js/Express
**Researched:** 2026-01-17
**Confidence:** MEDIUM

## System Overview

```
+-----------------------------------------------------------------------------------+
|                              FRONTEND (Next.js 14)                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-------------------+     +-------------------+     +-------------------+        |
|  |   PDF Viewer      |     |   Chat Panel      |     |   Signature Pad   |        |
|  |   Component       |     |   (Existing)      |     |   Component       |        |
|  |                   |     |                   |     |                   |        |
|  | - PDF.js/react-   |     | - Proactive AI    |     | - Canvas-based    |        |
|  |   pdf rendering   |     | - Field-aware     |     | - Embed in PDF    |        |
|  | - Form field      |     |   context         |     |                   |        |
|  |   overlay         |     |                   |     |                   |        |
|  +--------+----------+     +--------+----------+     +--------+----------+        |
|           |                         |                         |                   |
|           +------------+------------+-------------------------+                   |
|                        |                                                          |
|           +------------v------------+                                             |
|           |    PDF State Store      |                                             |
|           |    (Zustand - extend)   |                                             |
|           |                         |                                             |
|           | - pdfDocument           |                                             |
|           | - detectedFields[]      |                                             |
|           | - fieldValues{}         |                                             |
|           | - activeFieldId         |                                             |
|           | - signatureData         |                                             |
|           +------------+------------+                                             |
|                        |                                                          |
+------------------------|---------------------------------------------------------+
                         | HTTP/REST
+------------------------|---------------------------------------------------------+
|                        v                  BACKEND (Express.js)                    |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-------------------+     +-------------------+     +-------------------+        |
|  |   PDF Upload      |     |   PDF Analysis    |     |   PDF Export      |        |
|  |   /api/pdf/upload |     |   /api/pdf/analyze|     |   /api/pdf/export |        |
|  |                   |     |                   |     |                   |        |
|  | - Multer          |     | - AI field        |     | - pdf-lib         |        |
|  | - File validation |     |   detection       |     | - Fill & flatten  |        |
|  | - Store to disk/  |     | - Gemini vision   |     | - Return buffer   |        |
|  |   memory          |     |                   |     |                   |        |
|  +--------+----------+     +--------+----------+     +--------+----------+        |
|           |                         |                         |                   |
|           +------------+------------+------------+------------+                   |
|                        |                         |                                |
|           +------------v------------+  +---------v-----------+                    |
|           |   PDF Service           |  |   AI Service        |                    |
|           |   (pdf-lib + pdfjs)     |  |   (Gemini - extend) |                    |
|           +-------------------------+  +---------------------+                    |
|                                                                                   |
+-----------------------------------------------------------------------------------+
                         |
+------------------------|---------------------------------------------------------+
|                        v                  STORAGE                                 |
+-----------------------------------------------------------------------------------+
|  +-------------------+     +-------------------+                                   |
|  |   MongoDB         |     |   File System     |                                   |
|  |   (Sessions)      |     |   (PDF uploads)   |                                   |
|  +-------------------+     +-------------------+                                   |
+-----------------------------------------------------------------------------------+
```

## Component Responsibilities

| Component | Responsibility | Implementation | Dependencies |
|-----------|---------------|----------------|--------------|
| **PDFViewerContainer** | Orchestrate PDF display + form overlays | React component with react-pdf or pdfjs-dist | Zustand store, Chat Panel |
| **PDFFieldOverlay** | Render interactive form fields on top of PDF canvas | React components positioned via field coordinates | PDFViewerContainer |
| **PDFFormField** | Individual field input (text, checkbox, select, signature) | Controlled React input components | PDFFieldOverlay, Zustand |
| **SignaturePad** | Capture handwritten signatures | Canvas-based (react-signature-canvas) | pdf-lib for embedding |
| **ChatPanel (Extended)** | Proactive AI help on field focus + existing chat | Extend existing ChatPanel.tsx | Field context from store |
| **usePDFStore** | Centralized PDF state management | Zustand store (new or extend formStore) | persist middleware |
| **PDFUploadHandler** | Accept user PDF uploads | Express route + Multer | File system storage |
| **PDFAnalysisService** | Detect form fields from PDF | Gemini Vision API + field extraction | Existing Gemini service |
| **PDFExportService** | Fill PDF and generate download | pdf-lib library | pdf-lib npm package |

## Recommended Project Structure

### Frontend
```
frontend/src/
├── components/
│   ├── pdf/                          # NEW: PDF-specific components
│   │   ├── PDFViewerContainer.tsx    # Main PDF viewer wrapper
│   │   ├── PDFFieldOverlay.tsx       # Positions fields over PDF
│   │   ├── PDFFormField.tsx          # Individual field input
│   │   ├── PDFTextField.tsx          # Text input field
│   │   ├── PDFCheckboxField.tsx      # Checkbox field
│   │   ├── PDFSelectField.tsx        # Dropdown field
│   │   ├── PDFSignatureField.tsx     # Signature capture
│   │   ├── PDFNavigation.tsx         # Page navigation controls
│   │   └── PDFToolbar.tsx            # Zoom, download, etc.
│   ├── ChatPanel.tsx                 # EXTEND: Add field-aware context
│   ├── FormSection.tsx               # KEEP: For non-PDF forms
│   └── ...existing components
├── hooks/
│   ├── usePDFViewer.ts               # NEW: PDF rendering logic
│   ├── usePDFFields.ts               # NEW: Field detection/sync
│   └── usePageContext.ts             # KEEP: Existing
├── store/
│   ├── formStore.ts                  # KEEP: Existing form state
│   └── pdfStore.ts                   # NEW: PDF-specific state
├── lib/
│   ├── api.ts                        # EXTEND: Add PDF endpoints
│   ├── pdfUtils.ts                   # NEW: PDF helper functions
│   └── fieldMapping.ts               # NEW: Map PDF fields to form types
└── types/
    ├── index.ts                      # EXTEND: Add PDF types
    └── pdf.ts                        # NEW: PDF-specific types
```

### Backend
```
backend/src/
├── routes/
│   ├── pdf.ts                        # NEW: PDF upload/analyze/export
│   └── ...existing routes
├── services/
│   ├── gemini.ts                     # EXTEND: Add vision analysis
│   ├── pdfService.ts                 # NEW: PDF processing logic
│   └── ...existing services
├── middleware/
│   ├── upload.ts                     # NEW: Multer configuration
│   └── cors.ts                       # KEEP: Existing
├── types/
│   ├── form.ts                       # EXTEND: Add PDF field types
│   └── pdf.ts                        # NEW: PDF-specific types
└── uploads/                          # NEW: Temporary PDF storage
```

## Data Flow

### PDF Loading Flow

```
User selects PDF  →  File input onChange  →  Upload to backend
        │
        ↓
Backend /api/pdf/upload  →  Multer processes  →  Save to uploads/
        │
        ↓
Return { pdfId, url }  →  Frontend stores in pdfStore
        │
        ↓
PDFViewerContainer fetches PDF  →  pdfjs-dist renders to canvas
        │
        ↓
PDFFieldOverlay positioned  →  Ready for AI analysis
```

### Field Detection Flow

```
User clicks "Analyze Form"  →  POST /api/pdf/analyze { pdfId }
        │
        ↓
Backend loads PDF  →  Extract pages as images  →  Send to Gemini Vision
        │
        ↓
Gemini returns field descriptions  →  Parse into PDFField[] structure
        │                                   │
        │                                   ├── { name, type, bbox, label, required }
        │                                   └── { ...for each detected field }
        ↓
Return fields to frontend  →  Store in pdfStore.detectedFields
        │
        ↓
PDFFieldOverlay renders  →  Position inputs using bbox coordinates
```

### AI Explanation Flow (Proactive)

```
User focuses on PDF field  →  onFocus event  →  pdfStore.setActiveFieldId(id)
        │
        ↓
ChatPanel detects activeFieldId change  →  Auto-trigger explanation
        │
        ↓
POST /api/chat {               →  Backend builds context:
  fieldId,                          "User is filling: {field.label}"
  fieldContext: field.label,        "Field type: {field.type}"
  pdfContext: nearby_text,          "Original PDF text: {context}"
  userMessage: null (proactive)
}
        │
        ↓
Gemini generates explanation  →  "This field asks for your..."
        │
        ↓
Display in ChatPanel  →  User can ask follow-ups or accept suggestion
```

### Form Filling Flow

```
User types in PDFFormField  →  onChange event  →  pdfStore.setFieldValue(id, value)
        │
        ↓
Zustand store updates  →  All subscribers notified
        │
        │   ┌─────────────────────────────────────────┐
        ├───→  PDFFormField re-renders with new value  │
        │   └─────────────────────────────────────────┘
        │   ┌─────────────────────────────────────────┐
        └───→  Auto-save debounce triggers (2s)        │
            └──────────────────┬──────────────────────┘
                               ↓
                    POST /api/session { ...pdfFieldValues }
```

### Export Flow

```
User clicks "Download Filled PDF"  →  POST /api/pdf/export
        │                                    │
        │                                    ↓
        │                           Backend receives:
        │                           { pdfId, fieldValues, signatureData }
        ↓
pdf-lib loads original PDF  →  For each field:
        │                         pdfDoc.getForm().getTextField(name).setText(value)
        │                         ...or checkbox, dropdown, signature
        ↓
If signatureData present  →  Embed signature image at signature field bbox
        │
        ↓
pdfDoc.save()  →  Return PDF bytes as buffer
        │
        ↓
Frontend receives blob  →  Create download link  →  User downloads PDF
```

## Client vs Server Responsibilities

| Operation | Where | Why |
|-----------|-------|-----|
| PDF rendering | **Client** | PDF.js designed for browser, avoids round-trips |
| Form field UI | **Client** | Immediate user interaction, no latency |
| Field change tracking | **Client** | Zustand for instant state updates |
| File upload | **Server** | Security, validation, size handling |
| AI field detection | **Server** | Gemini API key security, complex processing |
| AI explanations | **Server** | API key security, context building |
| PDF filling (export) | **Server** | pdf-lib works well server-side, return clean file |
| Signature capture | **Client** | Real-time canvas interaction |
| Signature embedding | **Server** | Part of PDF filling process |
| Session persistence | **Server** | MongoDB storage, cross-device access |

### Rationale

**Client-side PDF rendering:** PDF.js/react-pdf are specifically designed for browser rendering. Sending render requests to server would add latency and complexity. PDF.js handles the heavy lifting efficiently client-side with Web Workers.

**Server-side AI analysis:** Gemini API keys must stay server-side. Additionally, analyzing PDFs with vision requires sending full page images - doing this client-side would expose the API and add complexity.

**Server-side export:** pdf-lib works excellently server-side. The filled PDF can be streamed back efficiently. This also allows for validation before generating the final document.

## Integration Points

| Boundary | Communication | Notes |
|----------|---------------|-------|
| PDFViewer → ChatPanel | Zustand store (activeFieldId) | ChatPanel watches for field focus changes |
| ChatPanel → PDFFormField | Zustand store (setFieldValue) | AI suggestions auto-fill via store |
| PDFViewerContainer → Backend | REST API (/api/pdf/*) | Upload, analyze, export |
| Gemini Service → PDFAnalysis | Internal service call | Extend existing gemini.ts |
| PDFStore → LocalStorage | Zustand persist middleware | Session continuity |
| PDFStore → MongoDB | REST API (/api/session) | Cross-device persistence |
| Signature component → PDF export | Include in export payload | Base64 image data |

### Extending Existing Integration

The current architecture uses:
- `activeQuestionId` in formStore for ChatPanel context
- `conversations` keyed by questionId for chat history

For PDF integration:
- Add `activeFieldId` in pdfStore (or extend formStore)
- Add `pdfConversations` keyed by fieldId
- ChatPanel checks both `activeQuestionId` AND `activeFieldId`
- Proactive mode triggers when `activeFieldId` changes

## Build Order

Based on dependencies, build in this order:

### Phase 1: Foundation (No external dependencies)

1. **PDF Types** (`frontend/src/types/pdf.ts`, `backend/src/types/pdf.ts`)
   - Define PDFField, PDFDocument, DetectedField interfaces first
   - Everything else depends on these types
   - *Why first:* Type-driven development ensures consistency

2. **Zustand PDF Store** (`frontend/src/store/pdfStore.ts`)
   - State container for PDF document, fields, values
   - *Why second:* Components need state to operate
   - *Depends on:* Types

3. **Basic PDF Viewer** (`frontend/src/components/pdf/PDFViewerContainer.tsx`)
   - Render PDF from URL using pdfjs-dist
   - Just display, no interactivity yet
   - *Why third:* Proves PDF rendering works before adding complexity
   - *Depends on:* Store for PDF URL state

### Phase 2: Upload & Storage

4. **Backend Upload Route** (`backend/src/routes/pdf.ts` + `backend/src/middleware/upload.ts`)
   - Multer configuration for PDF uploads
   - Store to filesystem, return URL
   - *Why fourth:* Need PDFs to work with
   - *Depends on:* None from our new code

5. **Frontend Upload Component**
   - File input, call API, store result
   - *Depends on:* Upload route, PDF store

### Phase 3: Field Detection

6. **Gemini Vision Extension** (`backend/src/services/gemini.ts`)
   - Add method for image analysis
   - Prompt engineering for form field detection
   - *Depends on:* Existing Gemini service

7. **PDF Analysis Service** (`backend/src/services/pdfService.ts`)
   - Extract PDF pages as images
   - Call Gemini for analysis
   - Parse response into PDFField[]
   - *Depends on:* Gemini extension

8. **Field Overlay Component** (`frontend/src/components/pdf/PDFFieldOverlay.tsx`)
   - Position form inputs over PDF canvas
   - Use bounding box coordinates from analysis
   - *Depends on:* Viewer, Store with detected fields

### Phase 4: AI Integration

9. **Proactive Chat Extension** (extend `ChatPanel.tsx`)
   - Watch for activeFieldId changes
   - Auto-trigger explanations on field focus
   - *Depends on:* Store, existing chat infrastructure

10. **Field-aware Context** (extend `/api/chat` route)
    - Build richer context for PDF fields
    - Include field type, nearby text, form purpose
    - *Depends on:* Existing chat route

### Phase 5: Form Filling & Export

11. **Interactive Form Fields** (`PDFFormField.tsx` variants)
    - Text, checkbox, select, date inputs
    - Connect to store, handle validation
    - *Depends on:* Overlay, Store

12. **Signature Component** (`PDFSignatureField.tsx`)
    - Canvas-based signature capture
    - Store as base64 in pdfStore
    - *Depends on:* Form fields pattern established

13. **PDF Export Service** (`backend/src/services/pdfService.ts` addition)
    - Use pdf-lib to fill form fields
    - Embed signatures
    - Return filled PDF buffer
    - *Depends on:* All field types implemented

14. **Export Route & Frontend** (`/api/pdf/export`)
    - Trigger export, handle download
    - *Depends on:* Export service

## Key Architecture Decisions

### Decision 1: Separate pdfStore vs Extend formStore

**Recommendation:** Create separate `pdfStore.ts`

**Rationale:**
- PDF state is conceptually different from static form state
- Existing formStore is optimized for the current form structure
- Separation allows independent evolution
- Can still share persistence mechanism

```typescript
// pdfStore.ts
interface PDFState {
  pdfDocument: { id: string; url: string } | null;
  detectedFields: PDFField[];
  fieldValues: Record<string, string | boolean>;
  activeFieldId: string | null;
  signatureData: Record<string, string>; // fieldId -> base64

  setPDFDocument: (doc: { id: string; url: string }) => void;
  setDetectedFields: (fields: PDFField[]) => void;
  setFieldValue: (fieldId: string, value: string | boolean) => void;
  setActiveFieldId: (id: string | null) => void;
  setSignatureData: (fieldId: string, data: string) => void;
  reset: () => void;
}
```

### Decision 2: PDF Rendering Library

**Recommendation:** Use `react-pdf` (wrapper around pdfjs-dist)

**Rationale:**
- React-native API with hooks
- Well-maintained, large community
- Simpler than raw pdfjs-dist
- Handles worker setup automatically
- Good TypeScript support

**Alternative considered:** Raw pdfjs-dist for more control - use if react-pdf proves limiting.

### Decision 3: Form Field Detection Approach

**Recommendation:** AI Vision (Gemini) for non-AcroForm PDFs, direct extraction for AcroForms

**Rationale:**
- Many government forms are flat PDFs (no embedded form fields)
- AI vision can detect fields from visual layout
- For PDFs with AcroForm fields, extract directly using pdfjs-dist
- Hybrid approach covers both cases

```typescript
// Field detection strategy
async function detectFields(pdfId: string): Promise<PDFField[]> {
  const pdf = await loadPDF(pdfId);

  // First, try AcroForm extraction
  const acroFields = await extractAcroFormFields(pdf);
  if (acroFields.length > 0) {
    return acroFields; // Use native fields
  }

  // Fallback to AI vision detection
  return await analyzeWithGemini(pdf);
}
```

### Decision 4: Signature Implementation

**Recommendation:** `react-signature-canvas` for capture, pdf-lib for embedding

**Rationale:**
- react-signature-canvas is battle-tested
- Returns data URL easily stored
- pdf-lib can embed images at specific coordinates
- No need for expensive commercial signature SDK

## Potential Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| PDF.js memory with large PDFs | Browser crashes | Implement page virtualization, load 1-3 pages |
| Field position drift on zoom | Misaligned inputs | Recalculate positions on scale change |
| CORS issues with PDF loading | PDF won't display | Serve from same origin or configure CORS |
| Gemini rate limits | Analysis fails | Queue requests, cache results |
| XFA forms (not AcroForm) | Fields not detected | Detect XFA and warn user |
| File size limits | Upload fails | Configure Multer limits, provide feedback |
| Mobile signature accuracy | Poor signatures | Detect touch, adjust canvas size |

## Sources

### PDF Viewing
- [React PDF Viewer Guide 2025](https://www.nutrient.io/blog/how-to-build-a-reactjs-pdf-viewer-with-react-pdf/)
- [Top 6 PDF Viewers for React.js Developers in 2025](https://medium.com/@ansonch/top-6-pdf-viewers-for-react-js-developers-in-2025-d429fae7b84e)
- [react-pdf-viewer.dev](https://react-pdf-viewer.dev/docs/basic-usage/)

### Form Field Detection
- [Apryse Auto-detect PDF Form Fields](https://apryse.com/blog/auto-detect-pdf-form-fields-with-smart-data-extraction)
- [Nutrient Extract Form Data](https://www.nutrient.io/guides/web/forms/extract-form-data/)
- [7 PDF Parsing Libraries for Node.js](https://strapi.io/blog/7-best-javascript-pdf-parsing-libraries-nodejs-2025)

### PDF Form Filling
- [pdf-lib.js.org](https://pdf-lib.js.org/)
- [pdf-lib GitHub](https://github.com/Hopding/pdf-lib)
- [Nutrient Web SDK Forms](https://www.nutrient.io/guides/web/forms/)

### Digital Signatures
- [Nutrient React PDF Signature](https://www.nutrient.io/guides/web/signatures/react/)
- [Apryse Digital Signatures React](https://apryse.com/blog/integrate-digital-signatures-react-applications)

### File Upload
- [Multer in Node.js](https://betterstack.com/community/guides/scaling-nodejs/multer-in-nodejs/)
- [Express Multer Middleware](https://expressjs.com/en/resources/middleware/multer.html)

### Client vs Server Architecture
- [Nutrient: JavaScript PDF generation](https://www.nutrient.io/blog/generate-pdfs-from-javascript/)
- [TextControl: Server-side PDF generation](https://www.textcontrol.com/blog/2021/12/30/generating-pdf-documents-in-the-browser/)

### State Management
- [Zustand Architecture Patterns at Scale](https://brainhub.eu/library/zustand-architecture-patterns-at-scale)
- [Zustand Persisting Store Data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)

### Panel Layouts
- [react-resizable-panels GitHub](https://github.com/bvaughn/react-resizable-panels)
- [Syncfusion: Two PDF Viewers Side by Side](https://support.syncfusion.com/kb/article/21072/how-to-display-two-pdf-viewer-side-by-side-in-a-react-application)
