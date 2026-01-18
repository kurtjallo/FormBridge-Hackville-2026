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

                    if (field instanceof PDFTextField) {
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
 * Fill form fields and export as new PDF bytes
 */
export async function fillAndExportPDF(
    originalBytes: Uint8Array,
    fieldValues: Record<string, string>
): Promise<Uint8Array> {
    const doc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
    const form = doc.getForm();

    Object.entries(fieldValues).forEach(([fieldId, value]) => {
        // Extract original field name (remove widget suffix like _0, _1)
        const fieldName = fieldId.replace(/_\d+$/, '');

        try {
            const field = form.getField(fieldName);

            if (field instanceof PDFTextField) {
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
    });

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
