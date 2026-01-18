import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';
import { PDFField } from '@/types/pdf';

/**
 * Load a PDF document from URL
 */
export async function loadPDFDocument(url: string): Promise<{ doc: PDFDocument; bytes: Uint8Array }> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    return { doc, bytes };
}

/**
 * Extract form fields from a PDF document
 * Returns empty array if PDF structure cannot be parsed (graceful degradation)
 */
export function extractFormFields(doc: PDFDocument): PDFField[] {
    const result: PDFField[] = [];

    // Some PDFs have malformed page trees that pdf-lib cannot parse
    // (e.g., government forms with non-standard structures)
    let pages;
    try {
        pages = doc.getPages();
    } catch (err) {
        console.warn('Could not extract pages from PDF (malformed page tree). Form fields will not be available.', err);
        return result;
    }

    let form;
    let fields;
    try {
        form = doc.getForm();
        fields = form.getFields();
    } catch (err) {
        console.warn('Could not extract form from PDF. Form fields will not be available.', err);
        return result;
    }

    fields.forEach((field) => {
        try {
            const widgets = field.acroField.getWidgets();

            widgets.forEach((widget, widgetIndex) => {
                try {
                    const rect = widget.getRectangle();

                    // Safely get page reference - some widgets may not have it
                    let pageIndex = 0;
                    try {
                        const pageRef = widget.P();
                        if (pageRef) {
                            const foundIndex = pages.findIndex((p) => p.ref === pageRef);
                            if (foundIndex !== -1) pageIndex = foundIndex;
                        }
                    } catch {
                        // Page reference not available, default to first page
                        pageIndex = 0;
                    }

                    let fieldType: PDFField['type'] = 'text';
                    let options: string[] | undefined;
                    const fieldName = field.getName().toLowerCase();

                    // Check for signature fields first (by name pattern)
                    if (fieldName.includes('signature') || fieldName.includes('sign_') || fieldName.endsWith('_sign')) {
                        fieldType = 'signature';
                    } else if (field instanceof PDFTextField) {
                        fieldType = 'text';
                    } else if (field instanceof PDFCheckBox) {
                        fieldType = 'checkbox';
                    } else if (field instanceof PDFDropdown) {
                        fieldType = 'select';
                        options = field.getOptions();
                    } else if (field instanceof PDFRadioGroup) {
                        fieldType = 'radio';
                        options = field.getOptions();
                    }

                    result.push({
                        id: `${field.getName()}_${widgetIndex}`,
                        name: field.getName(),
                        type: fieldType,
                        page: pageIndex + 1, // 1-indexed for react-pdf
                        rect: {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height,
                        },
                        required: field.isRequired(),
                        options,
                    });
                } catch (widgetErr) {
                    console.warn(`Skipping widget ${widgetIndex} for field ${field.getName()}:`, widgetErr);
                }
            });
        } catch (fieldErr) {
            console.warn(`Skipping field ${field.getName()}:`, fieldErr);
        }
    });

    return result;
}

/**
 * Convert base64 data URL to Uint8Array
 */
function dataUrlToBytes(dataUrl: string): Uint8Array {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * Fill form fields and export as new PDF bytes
 * Supports signature images (data URLs are embedded as images)
 */
export async function fillAndExportPDF(
    originalBytes: Uint8Array,
    fieldValues: Record<string, string>
): Promise<Uint8Array> {
    const doc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
    const form = doc.getForm();
    const pages = doc.getPages();

    // Process each field value
    for (const [fieldId, value] of Object.entries(fieldValues)) {
        // Handle annotation-triggered signatures (no corresponding PDF form field)
        // These have fieldIds like "annotation_signature_1737216000000"
        if (fieldId.startsWith('annotation_signature_') && value.startsWith('data:image')) {
            try {
                const imageBytes = dataUrlToBytes(value);
                const image = await doc.embedPng(imageBytes);

                // Place signature at bottom of first page (common signature location)
                // Use a reasonable default position: 72pt from left, 100pt from bottom
                const page = pages[0];
                const { width: pageWidth } = page.getSize();

                // Scale signature to reasonable size (max 200pt wide, maintain aspect ratio)
                const maxWidth = 200;
                const maxHeight = 60;
                const imageAspect = image.width / image.height;

                let drawWidth = maxWidth;
                let drawHeight = maxWidth / imageAspect;

                if (drawHeight > maxHeight) {
                    drawHeight = maxHeight;
                    drawWidth = maxHeight * imageAspect;
                }

                // Center horizontally, place near bottom
                const x = (pageWidth - drawWidth) / 2;
                const y = 100; // 100pt from bottom of page

                page.drawImage(image, {
                    x,
                    y,
                    width: drawWidth,
                    height: drawHeight,
                });

                console.log(`Embedded annotation signature at (${x}, ${y}), size: ${drawWidth}x${drawHeight}`);
            } catch (e) {
                console.warn(`Could not embed annotation signature:`, e);
            }
            continue; // Skip normal field processing
        }

        // Extract original field name (remove widget suffix like _0, _1)
        const fieldName = fieldId.replace(/_\d+$/, '');

        try {
            const field = form.getField(fieldName);

            // Handle signature images (data URLs)
            if (value.startsWith('data:image')) {
                // Get field widget to find position
                const widgets = field.acroField.getWidgets();
                if (widgets.length > 0) {
                    const widget = widgets[0];
                    const rect = widget.getRectangle();

                    // Find the page for this widget
                    let pageIndex = 0;
                    try {
                        const pageRef = widget.P();
                        if (pageRef) {
                            const foundIndex = pages.findIndex((p) => p.ref === pageRef);
                            if (foundIndex !== -1) pageIndex = foundIndex;
                        }
                    } catch {
                        pageIndex = 0;
                    }

                    const page = pages[pageIndex];
                    const imageBytes = dataUrlToBytes(value);

                    // Embed the image (PNG format from html2canvas)
                    const image = await doc.embedPng(imageBytes);

                    // Calculate image dimensions to fit within field bounds
                    const imageAspect = image.width / image.height;
                    const fieldAspect = rect.width / rect.height;

                    let drawWidth = rect.width;
                    let drawHeight = rect.height;

                    if (imageAspect > fieldAspect) {
                        // Image is wider - fit to width
                        drawHeight = rect.width / imageAspect;
                    } else {
                        // Image is taller - fit to height
                        drawWidth = rect.height * imageAspect;
                    }

                    // Center the image in the field
                    const xOffset = (rect.width - drawWidth) / 2;
                    const yOffset = (rect.height - drawHeight) / 2;

                    // Draw the image
                    page.drawImage(image, {
                        x: rect.x + xOffset,
                        y: rect.y + yOffset,
                        width: drawWidth,
                        height: drawHeight,
                    });

                    // Hide the original form field (optional: flatten it)
                    if (field instanceof PDFTextField) {
                        field.setText(''); // Clear text so image shows through
                    }
                }
            } else if (field instanceof PDFTextField) {
                field.setText(value);
            } else if (field instanceof PDFCheckBox) {
                if (value === 'true' || value === '1' || value === 'Yes') {
                    field.check();
                } else {
                    field.uncheck();
                }
            } else if (field instanceof PDFDropdown) {
                field.select(value);
            } else if (field instanceof PDFRadioGroup) {
                field.select(value);
            }
        } catch (e) {
            console.warn(`Could not fill field ${fieldName}:`, e);
        }
    }

    return await doc.save();
}

/**
 * Trigger browser download of PDF bytes
 */
export function downloadPDF(bytes: Uint8Array, filename: string): void {
    const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Get page dimensions from PDF document
 */
export function getPageDimensions(doc: PDFDocument, pageIndex: number): { width: number; height: number } {
    const page = doc.getPage(pageIndex);
    const { width, height } = page.getSize();
    return { width, height };
}
