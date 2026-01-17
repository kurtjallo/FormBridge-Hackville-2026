# API Contract: FormBridge v2.0 PDF System

**Purpose:** Coordinate frontend and backend development for v2.0 PDF Form System.

**Status:** Draft - Review before implementation

---

## Current v1.0 Endpoints (Keep)

| Method | Endpoint | Purpose | Used by Frontend? |
|--------|----------|---------|-------------------|
| POST | `/api/chat` | Multi-turn AI conversation | ✓ Yes |
| POST | `/api/explain` | Plain language explanation | ✓ Yes |
| POST | `/api/session` | Save session | ✓ Yes |
| GET | `/api/session/:id` | Load session | ✓ Yes |
| POST | `/api/validate` | Validate answers | ✓ Yes |
| GET | `/api/forms` | List forms | ✗ Not used |
| GET | `/api/forms/:formId` | Get form template | ✗ Not used |
| POST | `/api/eligibility` | Check eligibility | ✗ Not used |

---

## New v2.0 Endpoints

### 1. Categories & Forms

#### `GET /api/categories`
List all form categories.

**Response:**
```json
{
  "categories": [
    {
      "id": "social-assistance",
      "name": "Social Assistance",
      "description": "Ontario Works, ODSP, and other support programs",
      "icon": "hand-helping",
      "formCount": 3
    },
    {
      "id": "education",
      "name": "Education",
      "description": "OSAP, grants, and student aid",
      "icon": "graduation-cap",
      "formCount": 2
    },
    {
      "id": "healthcare",
      "name": "Healthcare",
      "description": "OHIP, drug benefits, and health coverage",
      "icon": "heart-pulse",
      "formCount": 2
    },
    {
      "id": "housing",
      "name": "Housing",
      "description": "Rent assistance and housing support",
      "icon": "home",
      "formCount": 1
    },
    {
      "id": "legal",
      "name": "Legal",
      "description": "NDAs, consent forms, and legal documents",
      "icon": "file-signature",
      "formCount": 2
    }
  ]
}
```

#### `GET /api/categories/:categoryId/forms`
List forms within a category.

**Response:**
```json
{
  "categoryId": "social-assistance",
  "categoryName": "Social Assistance",
  "forms": [
    {
      "id": "ontario-works-2024",
      "name": "Ontario Works Application",
      "description": "Apply for financial and employment assistance",
      "pdfUrl": "/pdfs/ontario-works-2024.pdf",
      "pageCount": 8,
      "hasEligibilityCheck": true,
      "signatureRequired": false
    }
  ]
}
```

---

### 2. PDF Operations

#### `GET /api/pdf/:formId`
Get PDF file for a pre-loaded form.

**Response:** Binary PDF file with headers:
```
Content-Type: application/pdf
Content-Disposition: inline; filename="ontario-works-2024.pdf"
```

#### `POST /api/pdf/upload`
Upload a user's PDF file.

**Request:** `multipart/form-data`
```
file: <PDF file>
```

**Response:**
```json
{
  "pdfId": "uuid-here",
  "filename": "my-document.pdf",
  "pageCount": 3,
  "isXFA": false,
  "hasAcroForm": true,
  "fieldCount": 12,
  "signatureFields": 1
}
```

**Errors:**
- `400` - Invalid file type or corrupted PDF
- `400` - XFA form detected (not supported)
- `413` - File too large (max 10MB)

#### `POST /api/pdf/:pdfId/analyze`
Analyze PDF for field detection (for non-AcroForm PDFs).

**Request:**
```json
{
  "useVision": true  // Use Gemini Vision for flat PDFs
}
```

**Response:**
```json
{
  "pdfId": "uuid-here",
  "fields": [
    {
      "id": "field-1",
      "name": "applicant_name",
      "type": "text",
      "label": "Full Legal Name",
      "page": 1,
      "bbox": { "x": 100, "y": 200, "width": 300, "height": 24 },
      "required": true
    },
    {
      "id": "field-2",
      "name": "signature",
      "type": "signature",
      "label": "Applicant Signature",
      "page": 3,
      "bbox": { "x": 100, "y": 600, "width": 200, "height": 50 },
      "required": true
    }
  ],
  "textContent": "Extracted text for AI context..."
}
```

#### `POST /api/pdf/:pdfId/export`
Export filled PDF.

**Request:**
```json
{
  "fieldValues": {
    "applicant_name": "Maria Garcia",
    "date_of_birth": "1985-03-15",
    "employed": true
  },
  "signatures": {
    "signature": "data:image/png;base64,..."
  },
  "flatten": true
}
```

**Response:** Binary PDF file with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="ontario-works-filled.pdf"
```

---

### 3. Extended Chat for PDF Context

#### `POST /api/chat` (Extended)
Existing chat endpoint extended with PDF field context.

**Request (new fields):**
```json
{
  "questionId": "field-1",
  "originalText": "Full Legal Name",
  "fieldType": "text",
  "context": "This field asks for your complete name as it appears on legal documents",
  "conversationHistory": [],
  "userMessage": "What should I put here?",

  // NEW: PDF-specific context
  "pdfContext": {
    "pdfId": "uuid-here",
    "formName": "Ontario Works Application",
    "pageNumber": 1,
    "surroundingText": "Section 1: Personal Information\nPlease provide your full legal name..."
  }
}
```

**Response:** Same as v1.0
```json
{
  "message": "This field is asking for your complete legal name...",
  "suggestedAnswer": "Enter your full name as it appears on your ID",
  "confidence": "high"
}
```

---

### 4. Session Updates for PDF

#### `POST /api/session` (Extended)
Existing session endpoint extended with PDF state.

**Request (new fields):**
```json
{
  "sessionId": "uuid",
  "answers": {},
  "conversations": {},

  // NEW: PDF-specific state
  "pdfState": {
    "pdfId": "uuid-here",
    "currentPage": 1,
    "fieldValues": {
      "applicant_name": "Maria Garcia"
    },
    "signatures": {
      "signature": "data:image/png;base64,..."
    }
  }
}
```

---

## Shared Types (Backend → Frontend)

These types should be defined in backend and imported by frontend.

```typescript
// PDF Types
interface PDFFormInfo {
  id: string;
  name: string;
  description: string;
  pdfUrl: string;
  pageCount: number;
  hasEligibilityCheck: boolean;
  signatureRequired: boolean;
}

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

interface PDFAnalysisResult {
  pdfId: string;
  fields: PDFField[];
  textContent: string;
  isXFA: boolean;
  hasAcroForm: boolean;
}

interface PDFExportRequest {
  fieldValues: Record<string, string | boolean | number>;
  signatures?: Record<string, string>;  // field name → base64 PNG
  flatten?: boolean;
}

// Category Types
interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  formCount: number;
}
```

---

## Frontend API Client Updates

Add to `frontend/src/lib/api.ts`:

```typescript
// Categories
export async function getCategories(): Promise<Category[]>
export async function getCategoryForms(categoryId: string): Promise<PDFFormInfo[]>

// PDF Operations
export async function uploadPDF(file: File): Promise<PDFAnalysisResult>
export async function analyzePDF(pdfId: string): Promise<PDFAnalysisResult>
export async function exportPDF(pdfId: string, data: PDFExportRequest): Promise<Blob>
export function getPDFUrl(formId: string): string  // Returns URL for react-pdf
```

---

## Implementation Order

### Phase 5 (PDF Foundation)
1. **Backend:** `GET /api/categories`, `GET /api/categories/:id/forms`, `GET /api/pdf/:formId`
2. **Frontend:** Category pages, form listing, PDF viewer with react-pdf

### Phase 6 (Field Detection & AI)
1. **Backend:** `POST /api/pdf/upload`, `POST /api/pdf/:id/analyze`
2. **Backend:** Extend `POST /api/chat` with pdfContext
3. **Frontend:** Field detection display, ChatPanel extension

### Phase 7 (Form Filling & Export)
1. **Backend:** `POST /api/pdf/:id/export`
2. **Backend:** Extend `POST /api/session` with pdfState
3. **Frontend:** PDFFieldOverlay, form inputs, export button

### Phase 8 (Signatures & Uploads)
1. **Backend:** Signature embedding in export
2. **Frontend:** Signature pad component, upload flow

---

## Questions to Resolve

1. **PDF Storage:** Where to store pre-loaded PDFs? (`/backend/public/pdfs/` or separate storage?)

2. **Upload Storage:** Where to store user uploads? (Filesystem with cleanup? MongoDB GridFS?)

3. **Coordinate System:** Who converts coordinates — frontend or backend? (Recommendation: backend returns web coordinates)

4. **Field Detection:** Use Gemini Vision for all PDFs, or only non-AcroForm? (Recommendation: AcroForm first, Vision fallback)

---

*Last updated: 2026-01-17*
*Status: Draft - needs team review*
