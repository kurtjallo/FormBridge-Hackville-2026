// PDF Form Types for Phase 5: PDF Foundation

// Form categories for navigation (only categories with actual PDFs)
export type FormCategory =
    | 'legal'
    | 'finance';

export interface FormCategoryInfo {
    id: FormCategory;
    name: string;
    description: string;
    icon: string; // emoji or icon name
}

// PDF Form metadata
export interface PDFFormMeta {
    id: string;
    name: string;
    description: string;
    category: FormCategory;
    pdfUrl: string; // GCS URL or local path
    estimatedTime: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    pageCount?: number;
    isXFA?: boolean; // XFA forms need special handling
}

// PDF viewer state
export interface PDFViewerState {
    currentPage: number;
    totalPages: number;
    scale: number;
    isLoading: boolean;
    error: string | null;
}

// PDF field detection (for Phase 6)
export interface PDFField {
    id: string;
    name: string;
    type: 'text' | 'checkbox' | 'radio' | 'select' | 'signature';
    page: number;
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    value?: string;
    required?: boolean;
}

// Form categories data (only categories with actual PDFs)
export const FORM_CATEGORIES: FormCategoryInfo[] = [
    {
        id: 'legal',
        name: 'Legal',
        description: 'Non-disclosure agreements, contracts',
        icon: '⚖️',
    },
    {
        id: 'finance',
        name: 'Finance & Tax',
        description: 'CRA tax forms, T1 returns',
        icon: '💰',
    },
];
