import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown } from 'pdf-lib';

export interface FormField {
    name: string;
    type: 'text' | 'checkbox' | 'dropdown' | 'radio';
    value: string | boolean;
    required?: boolean;
    options?: string[]; // For dropdowns
}

export class PDFFormEditor {
    private pdfDoc: PDFDocument | null = null;
    private formFields: FormField[] = [];

    reset(): void {
        this.pdfDoc = null;
        this.formFields = [];
    }

    async loadPDF(pdfUrl: string): Promise<void> {
        this.reset();
        const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
        this.pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
        await this.extractFormFields();
    }

    private async extractFormFields(): Promise<void> {
        if (!this.pdfDoc) return;

        const form = this.pdfDoc.getForm();
        const fields = form.getFields();

        this.formFields = fields.map(field => {
            const name = field.getName();

            if (field instanceof PDFTextField) {
                return {
                    name,
                    type: 'text' as const,
                    value: field.getText() || '',
                    required: field.isRequired?.() || false,
                };
            } else if (field instanceof PDFCheckBox) {
                return {
                    name,
                    type: 'checkbox' as const,
                    value: field.isChecked(),
                    required: false,
                };
            } else if (field instanceof PDFDropdown) {
                return {
                    name,
                    type: 'dropdown' as const,
                    value: field.getSelected()?.[0] || '',
                    options: field.getOptions(),
                    required: false,
                };
            }

            return {
                name,
                type: 'text' as const,
                value: '',
            };
        });
    }

    getFields(): FormField[] {
        return this.formFields;
    }

    async setFieldValue(fieldName: string, value: string | boolean): Promise<void> {
        if (!this.pdfDoc) return;

        try {
            const form = this.pdfDoc.getForm();
            const field = form.getField(fieldName);

            if (field instanceof PDFTextField) {
                field.setText(value as string);
            } else if (field instanceof PDFCheckBox) {
                if (value) {
                    field.check();
                } else {
                    field.uncheck();
                }
            } else if (field instanceof PDFDropdown) {
                field.select(value as string);
            }

            // Update local state
            const fieldIndex = this.formFields.findIndex(f => f.name === fieldName);
            if (fieldIndex !== -1) {
                this.formFields[fieldIndex].value = value;
            }
        } catch (e) {
            console.error(`Error setting field ${fieldName}:`, e);
        }
    }

    async save(): Promise<Blob> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        const pdfBytes = await this.pdfDoc.save();
        return new Blob([pdfBytes as any], { type: 'application/pdf' });
    }
}
