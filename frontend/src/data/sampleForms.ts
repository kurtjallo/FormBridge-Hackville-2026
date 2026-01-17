import { PDFFormMeta, FormCategory } from '@/types/pdf';

// Sample PDF forms for demo
// In production, these would come from the backend API
export const SAMPLE_PDF_FORMS: PDFFormMeta[] = [
    // Employment
    {
        id: 'ip-assignment',
        name: 'IP Assignment Agreement',
        description: 'Intellectual Property assignment for employees - covers ownership of inventions, prior work disclosure, and work-for-hire clauses.',
        category: 'employment',
        pdfUrl: '/forms/ip-assignment.pdf',
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
        pdfUrl: '/forms/nda.pdf',
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
        pdfUrl: '/forms/employment-contract.pdf',
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
        pdfUrl: '/forms/liability-waiver.pdf',
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
        pdfUrl: '/forms/poa.pdf',
        estimatedTime: '15-20 minutes',
        difficulty: 'hard',
        tags: ['legal', 'authority', 'representation'],
        pageCount: 5,
    },

    // Finance
    {
        id: 't4-slip',
        name: 'T4 Statement of Remuneration',
        description: 'Canadian tax slip showing employment income and deductions for the tax year.',
        category: 'finance',
        pdfUrl: '/forms/t4.pdf',
        estimatedTime: '10 minutes',
        difficulty: 'medium',
        tags: ['tax', 'canada', 'income'],
        pageCount: 1,
    },
    {
        id: 't2200',
        name: 'T2200 Declaration of Conditions',
        description: 'Declaration for employees working from home to claim tax deductions.',
        category: 'finance',
        pdfUrl: '/forms/t2200.pdf',
        estimatedTime: '15 minutes',
        difficulty: 'medium',
        tags: ['tax', 'remote-work', 'deductions'],
        pageCount: 2,
    },

    // Government
    {
        id: 'ontario-works',
        name: 'Ontario Works Application',
        description: 'Social assistance application for Ontario residents in financial need.',
        category: 'government',
        pdfUrl: '/forms/ontario-works.pdf',
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
