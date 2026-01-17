# Stack Research: PDF Form Interaction

**Domain:** PDF form interaction in web apps (viewing, form filling, text extraction, signatures)
**Researched:** 2026-01-17
**Confidence:** HIGH

## Executive Summary

For adding PDF capabilities to FormBridge (Next.js 14 + Express + TypeScript), the recommended stack combines:
- **react-pdf** for viewing (mature, well-maintained, PDF.js wrapper)
- **pdf-lib** for form filling and PDF modification (pure JS, no native deps)
- **unpdf** for text extraction (modern, serverless-optimized)
- **react-signature-canvas** for signature capture (lightweight, well-tested)

This stack is fully open-source (MIT/Apache), TypeScript-compatible, and works in both browser and Node.js environments.

---

## Recommended Stack

### Core Technologies (PDF-specific)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **react-pdf** | ^10.3.0 | PDF viewing in React | Most popular React PDF viewer (1M+ weekly downloads). Wraps Mozilla PDF.js. Active maintenance, v10 released Dec 2024 with major performance improvements. MIT license. Works with Next.js 14. |
| **pdf-lib** | ^1.17.1 | Form filling & PDF modification | Pure TypeScript, zero native dependencies. Works in browser, Node, Deno, React Native. Supports all form field types (text, checkbox, radio, dropdown). MIT license. |
| **unpdf** | latest | Text extraction for AI context | Modern alternative to deprecated pdf-parse. Serverless-optimized with bundled PDF.js 5.4.394. Zero dependencies. Works in edge environments. MIT license. |
| **react-signature-canvas** | ^1.1.0-alpha.2 | Signature capture | Lightweight wrapper around signature_pad. 383K weekly downloads. 100% test coverage. TypeScript types included. MIT license. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@pdf-lib/fontkit** | ^1.1.1 | Custom font embedding | Required when filling forms with non-Latin characters (French Canadian forms with accents). |
| **pdfjs-dist** | ^5.3.93 | Low-level PDF.js access | Only if react-pdf doesn't expose needed functionality. Bundled with react-pdf. |
| **@pdfme/generator** | ^5.5.0 | Template-based PDF generation | Only if you need to generate new PDFs from scratch with WYSIWYG templates. Not needed for v2.0 form filling. |
| **@pdfme/ui** | ^5.5.0 | Visual form builder | Only if you need drag-and-drop PDF template design. Consider for v3.0+. |

---

## Installation

```bash
# Core PDF stack for v2.0
npm install react-pdf pdf-lib unpdf react-signature-canvas

# TypeScript types (if not bundled)
npm install -D @types/react-signature-canvas

# For non-Latin font support (French Canadian)
npm install @pdf-lib/fontkit

# Frontend dependencies (in /frontend)
cd frontend && npm install react-pdf react-signature-canvas

# Backend dependencies (in /backend)
cd backend && npm install pdf-lib unpdf
```

### Next.js 14 Configuration Required

```javascript
// frontend/next.config.js
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};
```

```typescript
// When using react-pdf in Next.js, disable SSR
import dynamic from 'next/dynamic';
const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false });
```

---

## Detailed Recommendations

### PDF Viewing: react-pdf v10.3.0

**Why react-pdf over alternatives:**
- Most mature React wrapper for PDF.js (since 2017)
- v10 released Dec 2024 with ESM-only, smaller bundle (416kB -> 303kB)
- Active maintainer (wojtekmaj), consistent updates
- Built-in support for text selection, annotations, links
- PDF.js 5.3.93 bundled (latest stable)

**Key features for FormBridge:**
```typescript
import { Document, Page, pdfjs } from 'react-pdf';

// Required: Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Usage
<Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
  <Page pageNumber={pageNumber} />
</Document>
```

**Confidence: HIGH** - Official documentation verified, latest release confirmed Dec 2024.

### Form Filling: pdf-lib v1.17.1

**Why pdf-lib over alternatives:**
- Only mature library that modifies existing PDFs in pure JS
- Works identically in browser and Node.js
- All form field types supported: text, checkbox, radio, dropdown, button
- Can flatten forms (make non-editable) for final export
- No native dependencies = easy deployment

**Key features for FormBridge:**
```typescript
import { PDFDocument } from 'pdf-lib';

// Load existing PDF
const pdfDoc = await PDFDocument.load(existingPdfBytes);
const form = pdfDoc.getForm();

// Fill form fields
const nameField = form.getTextField('applicant_name');
nameField.setText('Maria Garcia');

// Get all field names (for mapping)
const fields = form.getFields();
fields.forEach(field => console.log(field.getName()));

// Export filled PDF
const pdfBytes = await pdfDoc.save();
```

**Limitations:**
- Last release Nov 2022 (stable, not abandoned - issues still addressed)
- Default Helvetica font only supports Latin alphabet
- Requires @pdf-lib/fontkit for French Canadian accented characters
- No UI components (programmatic only)

**Confidence: HIGH** - Official documentation verified, API stable since v1.17.

### Text Extraction: unpdf

**Why unpdf over alternatives:**
- Modern, actively maintained (vs deprecated pdf-parse)
- Serverless-optimized (works in Vercel, Netlify, AWS Lambda)
- Bundled PDF.js 5.4.394 (latest)
- Zero dependencies
- Maintained by UnJS team (same team as Nuxt, Nitro)

**Key features for FormBridge:**
```typescript
import { extractText, getDocumentProxy } from 'unpdf';

// Simple text extraction (for AI context)
const { text } = await extractText(pdfBuffer);

// Detailed extraction with page positions (for field mapping)
const pdf = await getDocumentProxy(pdfBuffer);
const page = await pdf.getPage(1);
const textContent = await page.getTextContent();
```

**Alternative: pdfjs-dist directly**
If unpdf doesn't meet needs, use pdfjs-dist (bundled with react-pdf) directly:
```typescript
import * as pdfjsLib from 'pdfjs-dist';
```

**Confidence: MEDIUM** - Library is newer (2023), but backed by reputable team (UnJS).

### Signature Capture: react-signature-canvas v1.1.0

**Why react-signature-canvas over alternatives:**
- Lightweight wrapper (~150 LoC) around battle-tested signature_pad
- 383K weekly downloads, actively maintained
- 100% test coverage
- TypeScript definitions included
- Simple API, returns canvas for easy integration with pdf-lib

**Key features for FormBridge:**
```typescript
import SignatureCanvas from 'react-signature-canvas';

// Capture signature
<SignatureCanvas
  ref={sigCanvas}
  canvasProps={{ className: 'signature-pad' }}
/>

// Get signature as PNG for embedding in PDF
const signatureDataUrl = sigCanvas.current.toDataURL('image/png');

// Embed in PDF using pdf-lib
const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
pdfDoc.getPage(0).drawImage(signatureImage, { x, y, width, height });
```

**Confidence: HIGH** - Widely used, simple wrapper, stable API.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **react-pdf** | @pdfme/ui | When you need WYSIWYG PDF template building (v3.0+) |
| **react-pdf** | PSPDFKit/Nutrient | Enterprise needs: annotation, redaction, compliance. Commercial license ($). |
| **react-pdf** | pdf.js-express | Commercial viewer with form filling UI. Not open source. |
| **pdf-lib** | pdfme | When generating PDFs from templates rather than filling existing forms |
| **pdf-lib** | hummus/muhammara | High-performance native (C++) needs. Doesn't work in browser. |
| **unpdf** | pdf-parse | Legacy projects. Note: unmaintained since 2021. |
| **unpdf** | pdf2json | When you need exact x,y coordinates of all text elements |
| **react-signature-canvas** | DocuSeal | Full e-signature workflow with legal compliance (AGPLv3 license) |
| **react-signature-canvas** | Nutrient SDK | Enterprise digital signatures with certificates (commercial) |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **pdf-parse** | Unmaintained since 2021, security concerns | unpdf |
| **hummus/muhammara** | Native C++ deps, doesn't work in browser, complex setup | pdf-lib |
| **jsPDF** | Generates new PDFs only, cannot modify existing PDFs or fill forms | pdf-lib |
| **PDFKit** | Generates new PDFs only, no form filling capability | pdf-lib |
| **@react-pdf/renderer** | Generates new PDFs from React components, not for viewing/filling | react-pdf + pdf-lib |
| **pdf-fill-form** | Native dependency (Poppler), GPL license, Node-only | pdf-lib |
| **pdffiller** | Wrapper around PDF Toolkit CLI, requires system installation | pdf-lib |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| react-pdf ^10.3.0 | React 16.8+, 17, 18, 19 | Next.js 14 requires webpack config for canvas |
| react-pdf ^10.3.0 | Node 18+ | Requires Promise.withResolvers (Node 22+) or polyfill |
| pdf-lib ^1.17.1 | Any JS runtime | Browser, Node, Deno, React Native |
| unpdf | Node 22+ recommended | For Node <22, may need Promise.withResolvers polyfill |
| react-signature-canvas ^1.1.0 | React 16.8+ | Works with Next.js, must render client-side |

---

## Architecture Integration

### Where Each Library Lives

```
FormBridge v2.0 Architecture
============================

Frontend (Next.js 14)
---------------------
- react-pdf: PDF viewing in dual-panel UI
- react-signature-canvas: Signature capture component
- pdf-lib (optional): Client-side form preview

Backend (Express)
-----------------
- pdf-lib: Server-side form filling, PDF generation
- unpdf: Text extraction for AI context (Gemini)
- @pdf-lib/fontkit: Non-Latin font embedding

Data Flow
---------
1. User uploads PDF -> Backend stores file
2. Backend extracts text (unpdf) -> Sends to Gemini for field detection
3. Frontend displays PDF (react-pdf) -> User sees form
4. User fills fields -> Zustand store (same as v1.0)
5. User signs -> react-signature-canvas captures
6. Export -> Backend fills PDF (pdf-lib) -> Returns filled PDF
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| pdf-lib maintenance stops | LOW | MEDIUM | Library is stable, community forks available, pdfme could replace |
| react-pdf breaking changes | LOW | LOW | Pin version, v10 API is stable |
| unpdf Node version requirement | MEDIUM | LOW | Use pdfjs-dist directly as fallback |
| French character support | MEDIUM | MEDIUM | Test @pdf-lib/fontkit early with Canadian forms |
| Large PDF performance | MEDIUM | MEDIUM | Implement pagination, lazy loading in react-pdf |

---

## Sources

### Primary Sources (HIGH confidence)
- [react-pdf GitHub - v10.3.0 release](https://github.com/wojtekmaj/react-pdf/releases) - Dec 2024
- [pdf-lib Official Documentation](https://pdf-lib.js.org/) - Verified API
- [pdf-lib GitHub - v1.17.1 release](https://github.com/Hopding/pdf-lib/releases) - Nov 2022
- [unpdf GitHub](https://github.com/unjs/unpdf) - Verified features
- [pdfme Official Docs](https://pdfme.com/docs/getting-started) - Verified v5.5.0
- [react-signature-canvas GitHub](https://github.com/agilgur5/react-signature-canvas) - Verified API

### Secondary Sources (MEDIUM confidence)
- [Strapi Blog - PDF Parsing Libraries 2025](https://strapi.io/blog/7-best-javascript-pdf-parsing-libraries-nodejs-2025)
- [ThemeSelection - React PDF Libraries 2025](https://themeselection.com/react-pdf-library-and-viewers/)
- [Nutrient Blog - PDF Form Filling Node.js](https://www.nutrient.io/blog/how-to-fill-pdf-form-in-nodejs/)
- [DocuSeal GitHub](https://github.com/docusealco/docuseal) - Verified open-source alternative

### Ecosystem Research (LOW confidence - verify before using)
- [DEV.to - Open Source PDF Libraries 2025](https://dev.to/ansonch/6-open-source-pdf-generation-and-modification-libraries-every-react-dev-should-know-in-2025-13g0)
- [Syncfusion Blog - JS PDF Viewers 2026](https://www.syncfusion.com/blogs/post/free-javascript-pdf-viewer-libraries)
