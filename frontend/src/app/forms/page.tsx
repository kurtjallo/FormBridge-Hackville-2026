'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CategorySelector } from '@/components/CategorySelector';
import { FormList } from '@/components/FormList';
import { SAMPLE_PDF_FORMS, getFormCountByCategory } from '@/data/sampleForms';
import { usePDFStore } from '@/store/pdfStore';
import { PDFFormMeta, FormCategory } from '@/types/pdf';

export default function FormsPage() {
    const router = useRouter();
    const { selectedCategory, setSelectedForm } = usePDFStore();
    const [showForms, setShowForms] = useState(false);

    const formCountByCategory = getFormCountByCategory();

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

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
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
                        <button
                            onClick={() => router.push('/')}
                            className="text-gray-400 hover:text-white text-sm"
                        >
                            ← Back to Home
                        </button>
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
                            forms={SAMPLE_PDF_FORMS}
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
                                Or browse all forms
                            </h2>
                            <p className="text-gray-400">
                                Select a category above or browse our complete form library
                            </p>
                        </div>
                        <FormList
                            forms={SAMPLE_PDF_FORMS}
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
