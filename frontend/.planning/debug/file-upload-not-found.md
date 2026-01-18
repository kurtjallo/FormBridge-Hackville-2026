---
status: verifying
trigger: "File upload returns 'not found' error in UI when uploading PDF files"
created: 2026-01-17T00:00:00Z
updated: 2026-01-17T00:18:00Z
---

## Current Focus

hypothesis: CONFIRMED - Frontend api.ts uploadPDFForm() sent to wrong endpoint and used wrong format
test: Applied fix, TypeScript compiles clean
expecting: Upload will now reach /api/pdf-forms/upload with correct JSON body
next_action: User to test upload in browser

## Symptoms

expected: Process PDF form - file should be parsed/processed and form data extracted
actual: Error message in UI shows "not found" when uploading any file (preferably PDF)
errors: "not found" displayed in frontend UI. No error logs in backend.
reproduction: Upload any file through the upload feature
started: Never worked - new feature being tested for first time

## Eliminated

- hypothesis: GCS credentials missing in pdfForms.ts
  evidence: Fix was applied (keyFilename added) but issue persists; issue is earlier in flow
  timestamp: 2026-01-17T00:05:00Z

## Evidence

- timestamp: 2026-01-17T00:01:00Z
  checked: backend/src/index.ts route registration
  found: Both uploadRouter at /api/upload AND pdfFormsRouter at /api/pdf-forms are registered (lines 54-55)
  implication: Routes are registered; issue not route registration

- timestamp: 2026-01-17T00:11:00Z
  checked: frontend/src/lib/api.ts uploadPDFForm function (lines 251-277)
  found: Function signature is (file: File, metadata: {...}) but creates FormData and sends to /api/upload
  implication: Function expects File object and sends multipart/form-data

- timestamp: 2026-01-17T00:12:00Z
  checked: frontend/src/components/FileUpload.tsx (lines 100-111)
  found: Calls uploadPDFForm({ pdfBase64: base64, name: ... }) - passes single object with pdfBase64
  implication: MISMATCH - FileUpload passes wrong arguments to uploadPDFForm()

- timestamp: 2026-01-17T00:13:00Z
  checked: backend/src/routes/upload.ts (lines 42-90)
  found: Expects FormData with 'pdf' field, uses multer to parse file
  implication: Backend /api/upload expects multipart file upload

- timestamp: 2026-01-17T00:14:00Z
  checked: backend/src/routes/pdfForms.ts (lines 162-209)
  found: POST /api/pdf-forms/upload expects JSON body with pdfBase64 field
  implication: THIS is what FileUpload.tsx is trying to call but api.ts routes elsewhere

- timestamp: 2026-01-17T00:17:00Z
  checked: TypeScript compilation after fix
  found: npx tsc --noEmit succeeded with no errors
  implication: Fix is type-safe and compiles correctly

## Resolution

root_cause: Three-way mismatch in upload flow:
1. FileUpload.tsx calls uploadPDFForm({ pdfBase64, name, ... }) as single object
2. api.ts uploadPDFForm() expected (file: File, metadata) and sent FormData to /api/upload
3. Backend /api/pdf-forms/upload expects JSON with pdfBase64

The function signature in api.ts didn't match how FileUpload.tsx called it, AND sent to wrong endpoint.
Request went to /api/upload which returned 404 because FormData didn't match expected format.

fix: Updated api.ts uploadPDFForm() to:
1. Accept object with pdfBase64 (matching FileUpload.tsx call)
2. Send JSON to /api/pdf-forms/upload (matching pdfForms.ts handler)
3. Added Content-Type: application/json header

verification: TypeScript compiles clean. Awaiting user browser test.
files_changed: [frontend/src/lib/api.ts]
