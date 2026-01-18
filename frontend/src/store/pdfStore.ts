import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PDFFormMeta, PDFViewerState, PDFField, FormCategory } from '@/types/pdf';

interface PDFStore {
    // Selected form
    selectedForm: PDFFormMeta | null;
    setSelectedForm: (form: PDFFormMeta | null) => void;

    // PDF viewer state
    viewer: PDFViewerState;
    setCurrentPage: (page: number) => void;
    setTotalPages: (pages: number) => void;
    setScale: (scale: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Detected fields (for Phase 6)
    fields: PDFField[];
    setFields: (fields: PDFField[]) => void;
    activeFieldId: string | null;
    setActiveField: (fieldId: string | null) => void;

    // Field values (user input)
    fieldValues: Record<string, string>;
    setFieldValue: (fieldId: string, value: string) => void;

    // Category filter
    selectedCategory: FormCategory | null;
    setSelectedCategory: (category: FormCategory | null) => void;

    // PDF bytes for export
    pdfBytes: Uint8Array | null;
    setPdfBytes: (bytes: Uint8Array | null) => void;

    // Page dimensions (for coordinate mapping)
    pageDimensions: { width: number; height: number };
    setPageDimensions: (dimensions: { width: number; height: number }) => void;

    // Clear field values
    clearFieldValues: () => void;

    // Reset
    reset: () => void;
}

const initialViewerState: PDFViewerState = {
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,
    isLoading: false,
    error: null,
};

export const usePDFStore = create<PDFStore>()(
    persist(
        (set, get) => ({
            // Selected form
            selectedForm: null,
            setSelectedForm: (form) => set({ selectedForm: form }),

            // Viewer state
            viewer: initialViewerState,
            setCurrentPage: (page) =>
                set((state) => ({
                    viewer: { ...state.viewer, currentPage: page },
                })),
            setTotalPages: (pages) =>
                set((state) => ({
                    viewer: { ...state.viewer, totalPages: pages },
                })),
            setScale: (scale) =>
                set((state) => ({
                    viewer: { ...state.viewer, scale: Math.max(0.5, Math.min(3, scale)) },
                })),
            zoomIn: () => {
                const currentScale = get().viewer.scale;
                set((state) => ({
                    viewer: { ...state.viewer, scale: Math.min(3, currentScale + 0.25) },
                }));
            },
            zoomOut: () => {
                const currentScale = get().viewer.scale;
                set((state) => ({
                    viewer: { ...state.viewer, scale: Math.max(0.5, currentScale - 0.25) },
                }));
            },
            setLoading: (loading) =>
                set((state) => ({
                    viewer: { ...state.viewer, isLoading: loading },
                })),
            setError: (error) =>
                set((state) => ({
                    viewer: { ...state.viewer, error },
                })),

            // Fields
            fields: [],
            setFields: (fields) => set({ fields }),
            activeFieldId: null,
            setActiveField: (fieldId) => set({ activeFieldId: fieldId }),

            // Field values
            fieldValues: {},
            setFieldValue: (fieldId, value) =>
                set((state) => ({
                    fieldValues: { ...state.fieldValues, [fieldId]: value },
                })),

            // Category
            selectedCategory: null,
            setSelectedCategory: (category) => set({ selectedCategory: category }),

            // PDF bytes for export
            pdfBytes: null,
            setPdfBytes: (bytes) => set({ pdfBytes: bytes }),

            // Page dimensions
            pageDimensions: { width: 612, height: 792 }, // Default letter size
            setPageDimensions: (dimensions) => set({ pageDimensions: dimensions }),

            // Clear field values
            clearFieldValues: () => set({ fieldValues: {} }),

            // Reset
            reset: () =>
                set({
                    selectedForm: null,
                    viewer: initialViewerState,
                    fields: [],
                    activeFieldId: null,
                    fieldValues: {},
                    selectedCategory: null,
                    pdfBytes: null,
                    pageDimensions: { width: 612, height: 792 },
                }),
        }),
        {
            name: 'formbridge-pdf-storage',
            partialize: (state) => ({
                fieldValues: state.fieldValues,
                selectedCategory: state.selectedCategory,
            }),
        }
    )
);
