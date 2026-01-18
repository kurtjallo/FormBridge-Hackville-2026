'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { usePDFStore } from '@/store/pdfStore';
import { getFormById } from '@/data/sampleForms';
import { useTranslation } from '@/i18n';

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
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const formId = params.id as string;

    const { selectedForm, setSelectedForm, setLoading, viewer } = usePDFStore();

    useEffect(() => {
        // If no form selected, try to load from ID
        if (!selectedForm && formId) {
            const form = getFormById(formId);
            if (form) {
                setSelectedForm(form);
            } else {
                // Form not found, redirect to forms page
                router.push('/forms');
            }
        }
        setLoading(true);
    }, [formId, selectedForm, setSelectedForm, setLoading, router]);

    if (!selectedForm) {
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
                                {t('formview.formsDetail.back')}
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
                                    {t('formview.formsDetail.xfaBadge')}
                                </span>
                            )}
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                                {t('formview.formsDetail.getAiHelp')}
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
                        <h2 className="font-semibold text-white">{t('formview.formsDetail.assistantTitle')}</h2>
                        <p className="text-gray-400 text-sm mt-1">
                            {t('formview.formsDetail.assistantSubtitle')}
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                        <span className="text-4xl mb-4">🤖</span>
                        <p className="text-gray-400 text-sm">
                            {t('formview.formsDetail.emptyTitle')}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                            {t('formview.formsDetail.emptyBadge')}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
