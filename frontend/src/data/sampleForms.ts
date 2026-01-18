import { PDFFormMeta, FormCategory } from '@/types/pdf';

// Sample PDF forms for demo
// In production, these would come from the backend API
export const SAMPLE_PDF_FORMS: PDFFormMeta[] = [
    // Healthcare
    {
        id: 'ohip-registration',
        name: 'OHIP Registration',
        description: 'Registration for Ontario Health Coverage - apply for your Ontario Health Insurance Plan card.',
        category: 'healthcare',
        pdfUrl: 'http://localhost:5001/forms/OHIP/Registration for Ontario Health Coverage.pdf',
        estimatedTime: '10-15 minutes',
        difficulty: 'easy',
        tags: ['ohip', 'health', 'ontario', 'canada'],
        pageCount: 2,
    },
    {
        id: 'ohip-change',
        name: 'OHIP Change of Information',
        description: 'Update your personal information on your OHIP card - address, name, or other details.',
        category: 'healthcare',
        pdfUrl: 'http://localhost:5001/forms/OHIP/Change of Information.pdf',
        estimatedTime: '5-10 minutes',
        difficulty: 'easy',
        tags: ['ohip', 'health', 'ontario', 'update'],
        pageCount: 1,
    },

    // Finance
    {
        id: 't1-ontario',
        name: 'Ontario Tax (T1)',
        description: 'Ontario provincial tax return - file your provincial taxes as part of the T1 General.',
        category: 'finance',
        pdfUrl: 'http://localhost:5001/forms/CRA T1/Ontario Tax.pdf',
        estimatedTime: '30-45 minutes',
        difficulty: 'hard',
        tags: ['tax', 'canada', 'ontario', 't1', 'cra'],
        pageCount: 8,
    },

    // Employment (Placeholder - no PDFs available yet)
    {
        id: 'ip-assignment',
        name: 'IP Assignment Agreement',
        description: 'Intellectual Property assignment for employees - covers ownership of inventions, prior work disclosure, and work-for-hire clauses.',
        category: 'employment',
        pdfUrl: 'http://localhost:5001/forms/ip-assignment.pdf',
        estimatedTime: '10-15 minutes',
        difficulty: 'hard',
        tags: ['intellectual-property', 'employment', 'startup'],
        pageCount: 4,
    },
    {
        id: 'nda-mutual',
        name: 'Mutual NDA',
        description: 'Non-Disclosure Agreement for sharing confidential information between two parties.',
        category: 'employment',
        pdfUrl: 'http://localhost:5001/forms/nda.pdf',
        estimatedTime: '5-10 minutes',
        difficulty: 'medium',
        tags: ['confidentiality', 'legal', 'business'],
        pageCount: 3,
    },
    {
        id: 'employment-contract',
        name: 'Employment Contract',
        description: 'Standard employment agreement including compensation, benefits, and termination clauses.',
        category: 'employment',
        pdfUrl: 'http://localhost:5001/forms/employment-contract.pdf',
        estimatedTime: '15-20 minutes',
        difficulty: 'medium',
        tags: ['employment', 'contract', 'hr'],
        pageCount: 8,
    },

    // Legal
    {
        id: 'liability-waiver',
        name: 'Liability Waiver',
        description: 'General liability waiver and release of claims for activities and events.',
        category: 'legal',
        pdfUrl: 'http://localhost:5001/forms/liability-waiver.pdf',
        estimatedTime: '5 minutes',
        difficulty: 'easy',
        tags: ['waiver', 'liability', 'events'],
        pageCount: 2,
    },
    {
        id: 'power-of-attorney',
        name: 'Power of Attorney',
        description: 'Legal document granting authority to act on behalf of another person.',
        category: 'legal',
        pdfUrl: 'http://localhost:5001/forms/poa.pdf',
        estimatedTime: '15-20 minutes',
        difficulty: 'hard',
        tags: ['legal', 'authority', 'representation'],
        pageCount: 5,
    },

    // Government
    {
        id: 'ontario-works',
        name: 'Ontario Works Application',
        description: 'Social assistance application for Ontario residents in financial need.',
        category: 'government',
        pdfUrl: 'http://localhost:5001/forms/ontario-works.pdf',
        estimatedTime: '30-45 minutes',
        difficulty: 'hard',
        tags: ['social-assistance', 'ontario', 'benefits'],
        pageCount: 12,
    },

    // Healthcare
    {
        id: 'consent-form',
        name: 'Medical Consent Form',
        description: 'Informed consent for medical procedures and treatment.',
        category: 'healthcare',
        pdfUrl: '/forms/medical-consent.pdf',
        estimatedTime: '5-10 minutes',
        difficulty: 'easy',
        tags: ['medical', 'consent', 'healthcare'],
        pageCount: 2,
    },

    // Immigration
    {
        id: 'imm5257',
        name: 'IMM 5257 - Visitor Visa',
        description: 'Application for Temporary Resident Visa (TRV) to visit Canada.',
        category: 'immigration',
        pdfUrl: '/forms/imm5257.pdf',
        estimatedTime: '45-60 minutes',
        difficulty: 'hard',
        tags: ['visa', 'canada', 'travel'],
        pageCount: 6,
        isXFA: true, // Example XFA form
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
