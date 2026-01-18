import { PDFFormMeta, FormCategory } from '@/types/pdf';

// Sample PDF forms for demo - only includes actual PDFs in backend
// In production, these would come from the backend API
export const SAMPLE_PDF_FORMS: PDFFormMeta[] = [
    // Legal - Actual PDF: Basic-Non-Disclosure-Agreement.pdf
    {
        id: 'basic-nda',
        name: 'Basic Non-Disclosure Agreement',
        description: 'Standard NDA for protecting confidential information between parties. Includes confidentiality obligations, exclusions, and Ontario governing law.',
        category: 'legal',
        pdfUrl: 'http://localhost:5001/forms/Legal/Basic-Non-Disclosure-Agreement.pdf',
        estimatedTime: '10-15 minutes',
        difficulty: 'medium',
        tags: ['nda', 'confidentiality', 'legal', 'business'],
        pageCount: 3,
    },

    // Finance - Actual PDF: 5006-r-24e.pdf (CRA T1 Tax Form)
    {
        id: 'cra-t1-tax',
        name: 'CRA T1 General Income Tax Form',
        description: 'Canada Revenue Agency T1 General form for Ontario tax returns. File your personal income tax return with this official CRA form.',
        category: 'finance',
        pdfUrl: 'http://localhost:5001/forms/Finance/5006-r-24e.pdf',
        estimatedTime: '20-30 minutes',
        difficulty: 'hard',
        tags: ['tax', 'cra', 't1', 'ontario', 'income-tax'],
        pageCount: 4,
    },
];

// Helper to get form counts by category
export function getFormCountByCategory(): Record<FormCategory, number> {
    const counts: Record<FormCategory, number> = {
        employment: 0,
        legal: 0,
        finance: 0,
        government: 0,
        healthcare: 0,
        immigration: 0,
    };

    SAMPLE_PDF_FORMS.forEach((form) => {
        if (form.category in counts) {
            counts[form.category as keyof typeof counts]++;
        }
    });

    return counts;
}

// Get forms by category
export function getFormsByCategory(category: FormCategory): PDFFormMeta[] {
    return SAMPLE_PDF_FORMS.filter((form) => form.category === category);
}

// Get single form by ID
export function getFormById(id: string): PDFFormMeta | undefined {
    return SAMPLE_PDF_FORMS.find((form) => form.id === id);
}
