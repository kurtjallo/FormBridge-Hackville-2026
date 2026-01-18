import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown } from 'pdf-lib';

export interface FormField {
    name: string;
    type: 'text' | 'checkbox' | 'select' | 'radio';
    value: string | boolean;
    options?: string[];
}

export class PDFFormEditor {
    private doc: PDFDocument | null = null;
    private fields: FormField[] = [];

    async loadPDF(url: string): Promise<void> {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            this.doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            this.extractFields();
        } catch (error) {
            console.error('Failed to load PDF:', error);
            this.doc = null;
            this.fields = [];
        }
    }

    private extractFields(): void {
        if (!this.doc) {
            this.fields = [];
            return;
        }

        try {
            const form = this.doc.getForm();
            const pdfFields = form.getFields();

            this.fields = pdfFields.map((field) => {
                const name = field.getName();
                let type: FormField['type'] = 'text';
                let value: string | boolean = '';
                let options: string[] | undefined;

                if (field instanceof PDFTextField) {
                    type = 'text';
                    value = field.getText() || '';
                } else if (field instanceof PDFCheckBox) {
                    type = 'checkbox';
                    value = field.isChecked();
                } else if (field instanceof PDFDropdown) {
                    type = 'select';
                    value = field.getSelected()?.[0] || '';
                    options = field.getOptions();
                }

                return { name, type, value, options };
            });
        } catch (error) {
            console.warn('Could not extract form fields:', error);
            this.fields = [];
        }
    }

    getFields(): FormField[] {
        return this.fields;
    }

    async setFieldValue(fieldName: string, value: string | boolean): Promise<void> {
        if (!this.doc) return;

        try {
            const form = this.doc.getForm();
            const field = form.getField(fieldName);

            if (field instanceof PDFTextField && typeof value === 'string') {
                field.setText(value);
            } else if (field instanceof PDFCheckBox && typeof value === 'boolean') {
                if (value) {
                    field.check();
                } else {
                    field.uncheck();
                }
            } else if (field instanceof PDFDropdown && typeof value === 'string') {
                field.select(value);
            }

            // Update local fields array
            const fieldIndex = this.fields.findIndex(f => f.name === fieldName);
            if (fieldIndex >= 0) {
                this.fields[fieldIndex].value = value;
            }
        } catch (error) {
            console.warn(`Could not set field ${fieldName}:`, error);
        }
    }

    async save(): Promise<Blob> {
        if (!this.doc) {
            throw new Error('No PDF loaded');
        }

        const bytes = await this.doc.save();
        return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
    }
}
