'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { usePDFStore } from '@/store/pdfStore';
import { getFormById } from '@/data/sampleForms';
import { getPDFForm } from '@/lib/api';
import { PDFFormMeta, FormCategory } from '@/types/pdf';

// Dynamic import to avoid SSR issues with react-pdf
const PDFViewer = dynamic(() => import('@/components/PDFViewer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  ),
});

export default function FormViewPage() {
    const params = useParams();
    const router = useRouter();
    const formId = params.id as string;
    const [isLoadingForm, setIsLoadingForm] = useState(false);

    const { selectedForm, setSelectedForm, setLoading } = usePDFStore();

    useEffect(() => {
        async function loadForm() {
            // If form already selected in store, use it
            if (selectedForm?.id === formId) {
                setLoading(true);
                return;
            }

            // Try to load from sample forms first
            const sampleForm = getFormById(formId);
            if (sampleForm) {
                setSelectedForm(sampleForm);
                setLoading(true);
                return;
            }

            // Try to fetch from API (for uploaded forms)
            setIsLoadingForm(true);
            try {
                const apiForm = await getPDFForm(formId);
                const form: PDFFormMeta = {
                    id: apiForm.id,
                    name: apiForm.name,
                    description: apiForm.description,
                    category: apiForm.category as FormCategory,
                    pdfUrl: apiForm.pdfUrl,
                    estimatedTime: apiForm.estimatedTime,
                    difficulty: apiForm.difficulty,
                    tags: apiForm.tags,
                    pageCount: apiForm.pageCount,
                    isXFA: apiForm.isXFA,
                };
                setSelectedForm(form);
                setLoading(true);
            } catch (error) {
                console.error('Failed to load form:', error);
                router.push('/forms');
            } finally {
                setIsLoadingForm(false);
            }
        }

        if (formId) {
            loadForm();
        }
    }, [formId, selectedForm, setSelectedForm, setLoading, router]);

    if (!selectedForm || isLoadingForm) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20">
                <div className="px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/forms')}
                                className="text-gray-400 hover:text-white text-sm flex items-center gap-2"
                            >
                                ← Back
                            </button>
                            <div className="h-6 w-px bg-gray-700" />
                            <div>
                                <h1 className="text-lg font-semibold text-white">
                                    {selectedForm.name}
                                </h1>
                                <p className="text-gray-400 text-xs">
                                    {selectedForm.category} • {selectedForm.estimatedTime}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {selectedForm.isXFA && (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                                    ⚠️ XFA Form
                                </span>
                            )}
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                                Get AI Help
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* PDF Viewer */}
            <main className="flex-1 flex">
                {/* PDF Panel */}
                <div className="flex-1">
                    <PDFViewer
                        pdfUrl={selectedForm.pdfUrl}
                    />
                </div>

                {/* Chat Panel Placeholder (for Phase 6) */}
                <div className="w-96 border-l border-gray-800 bg-gray-900 hidden lg:block">
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="font-semibold text-white">AI Assistant</h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Click on any form field to get help
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                        <span className="text-4xl mb-4">🤖</span>
                        <p className="text-gray-400 text-sm">
                            Select a field in the PDF to get a plain-language explanation
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                            Coming in Phase 6
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
