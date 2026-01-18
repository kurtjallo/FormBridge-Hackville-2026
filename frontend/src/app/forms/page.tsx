'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CategorySelector } from '@/components/CategorySelector';
import { FormList } from '@/components/FormList';
import { FileUpload } from '@/components/FileUpload';
import { SAMPLE_PDF_FORMS } from '@/data/sampleForms';
import { usePDFStore } from '@/store/pdfStore';
import { PDFFormMeta, FormCategory } from '@/types/pdf';
import { listPDFForms } from '@/lib/api';

export default function FormsPage() {
    const router = useRouter();
    const { selectedCategory, setSelectedForm } = usePDFStore();
    const [showForms, setShowForms] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadedForms, setUploadedForms] = useState<PDFFormMeta[]>([]);
    const [isLoadingForms, setIsLoadingForms] = useState(true);

    // Fetch uploaded forms from API on mount
    const fetchUploadedForms = useCallback(async () => {
        try {
            const response = await listPDFForms();
            const apiForms: PDFFormMeta[] = response.forms.map(f => ({
                id: f.id,
                name: f.name,
                description: f.description,
                category: f.category as FormCategory,
                pdfUrl: f.pdfUrl,
                estimatedTime: f.estimatedTime,
                difficulty: f.difficulty,
                tags: f.tags,
                pageCount: f.pageCount,
                isXFA: f.isXFA,
            }));
            setUploadedForms(apiForms);
        } catch (error) {
            console.error('Failed to fetch forms:', error);
        } finally {
            setIsLoadingForms(false);
        }
    }, []);

    useEffect(() => {
        fetchUploadedForms();
    }, [fetchUploadedForms]);

    // Combine sample forms with uploaded forms (avoid duplicates by id)
    const allForms = [...SAMPLE_PDF_FORMS, ...uploadedForms.filter(
        uf => !SAMPLE_PDF_FORMS.some(sf => sf.id === uf.id)
    )];

    // Calculate form counts including uploaded forms
    const formCountByCategory: Record<FormCategory, number> = {
        employment: 0,
        legal: 0,
        finance: 0,
        government: 0,
        healthcare: 0,
        immigration: 0,
    };
    allForms.forEach(form => {
        if (form.category in formCountByCategory) {
            formCountByCategory[form.category]++;
        }
    });

    const handleCategorySelect = (category: FormCategory | null) => {
        setShowForms(category !== null);
    };

    const handleFormSelect = (form: PDFFormMeta) => {
        // Store form data in sessionStorage for formview page
        sessionStorage.setItem('selectedFormId', form.id);
        sessionStorage.setItem('selectedFormName', form.name);
        sessionStorage.setItem('selectedFormCode', form.id.toUpperCase());

        // Also update store
        setSelectedForm(form);

        // Navigate to formview
        router.push(`/formview`);
    };

    const handleUploadSuccess = (result: { id: string; name: string; pdfUrl: string }) => {
        setShowUpload(false);
        // Refresh the forms list
        fetchUploadedForms();
        // Navigate to the newly uploaded form
        router.push(`/forms/${result.id}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <FileUpload
                        onUploadSuccess={handleUploadSuccess}
                        onCancel={() => setShowUpload(false)}
                    />
                </div>
            )}

            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📋</span>
                            <div>
                                <h1 className="text-xl font-bold text-white">FormBridge</h1>
                                <p className="text-gray-400 text-sm">AI-powered form assistance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowUpload(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <span>⬆️</span>
                                Upload PDF
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="text-gray-400 hover:text-white text-sm"
                            >
                                ← Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Category Selector */}
                <section className="mb-12">
                    <CategorySelector
                        formCountByCategory={formCountByCategory}
                        onCategorySelect={handleCategorySelect}
                    />
                </section>

                {/* Form List (shows when category selected) */}
                {(showForms || selectedCategory) && (
                    <section className="mt-8 pt-8 border-t border-gray-800">
                        <FormList
                            forms={allForms}
                            category={selectedCategory}
                            onFormSelect={handleFormSelect}
                        />
                    </section>
                )}

                {/* All Forms (when no category selected) */}
                {!selectedCategory && (
                    <section className="mt-8 pt-8 border-t border-gray-800">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {isLoadingForms ? 'Loading forms...' : 'Or browse all forms'}
                            </h2>
                            <p className="text-gray-400">
                                Select a category above or browse our complete form library
                            </p>
                        </div>
                        <FormList
                            forms={allForms}
                            onFormSelect={handleFormSelect}
                        />
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 mt-12">
                <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-500 text-sm">
                    FormBridge — Making forms accessible with AI
                </div>
            </footer>
        </div>
    );
}
