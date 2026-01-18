import { PDFFormMeta, FormCategory } from '@/types/pdf';

// Sample PDF forms for demo
// In production, these would come from the backend API
export const SAMPLE_PDF_FORMS: PDFFormMeta[] = [
    // Legal (Priority for demo)
    {
        id: 'basic-nda',
        name: 'Basic Non-Disclosure Agreement',
        description: 'Standard NDA for sharing confidential information between two parties. Includes confidentiality obligations, exclusions, and Ontario governing law.',
        category: 'legal',
        pdfUrl: 'http://localhost:5001/forms/Legal/Basic-Non-Disclosure-Agreement.pdf',
        estimatedTime: '10-15 minutes',
        difficulty: 'medium',
        tags: ['nda', 'confidentiality', 'legal', 'business'],
        pageCount: 3,
    },

    // Finance
    {
        id: 'cra-5006',
        name: 'CRA Form 5006 - Statement of Employment Expenses',
        description: 'Canada Revenue Agency form for claiming employment-related expenses. Used by employees to calculate deductible expenses for tax purposes.',
        category: 'finance',
        pdfUrl: 'http://localhost:5001/forms/Finance/5006-r-24e.pdf',
        estimatedTime: '15-20 minutes',
        difficulty: 'medium',
        tags: ['tax', 'cra', 'employment-expenses', 'canada'],
        pageCount: 4,
    },

    // Government
    {
        id: 'business-license',
        name: 'Business License Application',
        description: 'Application to obtain or renew a business license. Includes business information, owner details, and required declarations.',
        category: 'government',
        pdfUrl: 'http://localhost:5001/forms/Government/Business-License-Application.pdf',
        estimatedTime: '15-20 minutes',
        difficulty: 'medium',
        tags: ['business', 'license', 'government', 'application'],
        pageCount: 3,
    },
    {
        id: 'vendor-registration',
        name: 'Vendor Registration Form',
        description: 'Register as an approved vendor for government or corporate procurement. Includes banking information and business certifications.',
        category: 'government',
        pdfUrl: 'http://localhost:5001/forms/Government/Vendor-Registration-Form.pdf',
        estimatedTime: '10-15 minutes',
        difficulty: 'easy',
        tags: ['vendor', 'procurement', 'government', 'registration'],
        pageCount: 2,
    },

    // Healthcare
    {
        id: 'medical-consent',
        name: 'Medical Consent Form',
        description: 'Informed consent for medical procedures and treatment. Includes patient acknowledgments, allergies, and PHIPA compliance.',
        category: 'healthcare',
        pdfUrl: 'http://localhost:5001/forms/Healthcare/Medical-Consent-Form.pdf',
        estimatedTime: '5-10 minutes',
        difficulty: 'easy',
        tags: ['medical', 'consent', 'healthcare', 'phipa'],
        pageCount: 2,
    },
    {
        id: 'patient-release',
        name: 'Patient Information Release',
        description: 'Authorization for release of personal health information under PHIPA. Specify records to release and recipient details.',
        category: 'healthcare',
        pdfUrl: 'http://localhost:5001/forms/Healthcare/Patient-Information-Release.pdf',
        estimatedTime: '5-10 minutes',
        difficulty: 'easy',
        tags: ['health-records', 'privacy', 'phipa', 'authorization'],
        pageCount: 2,
    },

    // Immigration
    {
        id: 'oinp-application',
        name: 'Ontario Immigration Nominee Program',
        description: 'Application for the Ontario Immigrant Nominee Program (OINP). For skilled workers and entrepreneurs seeking permanent residence in Ontario.',
        category: 'immigration',
        pdfUrl: 'http://localhost:5001/forms/Immigration/on00596e-immigration-nominee-program.pdf',
        estimatedTime: '30-45 minutes',
        difficulty: 'hard',
        tags: ['oinp', 'immigration', 'ontario', 'permanent-residence'],
        pageCount: 8,
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
        counts[form.category]++;
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
