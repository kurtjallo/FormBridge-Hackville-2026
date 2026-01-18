'use client';

import { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePDFStore } from '@/store/pdfStore';
import { SelectionHelpButton } from './SelectionHelpButton';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useTranslation } from '@/i18n';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    pdfUrl: string;
    onFieldClick?: (fieldId: string) => void;
    onHelpRequest?: (data: { selectedText: string; page: number }) => void;
}

export function PDFViewer({ pdfUrl, onFieldClick, onHelpRequest }: PDFViewerProps) {
    const { t } = useTranslation();
    const {
        viewer,
        setCurrentPage,
        setTotalPages,
        setLoading,
        setError,
        zoomIn,
        zoomOut,
        setScale,
    } = usePDFStore();

    const [isXFA, setIsXFA] = useState(false);
    const [showHelpButton, setShowHelpButton] = useState(false);
    const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
    const [selectedText, setSelectedText] = useState('');

    // Handle text selection - show help button instead of auto-sending
    const handleMouseUp = useCallback(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim() || '';

        if (text.length >= 10) {
            const range = selection?.getRangeAt(0);
            const rect = range?.getBoundingClientRect();
            if (rect) {
                setSelectionRect(rect);
                setSelectedText(text);
                setShowHelpButton(true);
            }
        } else {
            setShowHelpButton(false);
        }
    }, []);

    // Handle help button click
    const handleHelpClick = useCallback((text: string) => {
        if (onHelpRequest) {
            onHelpRequest({ selectedText: text, page: viewer.currentPage });
        }
        setShowHelpButton(false);
    }, [viewer.currentPage, onHelpRequest]);

    // Click-away to dismiss help button
    useEffect(() => {
        const handleClickAway = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[aria-label="Get help with selected text"]')) {
                setShowHelpButton(false);
            }
        };
        document.addEventListener('mousedown', handleClickAway);
        return () => document.removeEventListener('mousedown', handleClickAway);
    }, []);

    const onDocumentLoadSuccess = useCallback(
        async (pdf: { numPages: number; _pdfInfo?: { isXFA?: boolean } }) => {
            setTotalPages(pdf.numPages);
            setLoading(false);
            setError(null);

            // Check for XFA form (not supported for editing)
            try {
                const isXFAForm = pdf._pdfInfo?.isXFA || false;
                setIsXFA(isXFAForm);
                if (isXFAForm) {
                    setError(t('pdf.xfa.limitedSupport'));
                }
            } catch {
                // Ignore XFA detection errors
            }
        },
        [setTotalPages, setLoading, setError, t]
    );

    const onDocumentLoadError = useCallback(
        (error: Error) => {
            setLoading(false);
            setError(t('pdf.error.failedToLoad', { message: error.message }));
        },
        [setLoading, setError, t]
    );

    const goToPrevPage = () => {
        if (viewer.currentPage > 1) {
            setCurrentPage(viewer.currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (viewer.currentPage < viewer.totalPages) {
            setCurrentPage(viewer.currentPage + 1);
        }
    };

    return (
        <div className="pdf-viewer flex flex-col h-full bg-gray-50">
            {/* Toolbar */}
            <div className="pdf-toolbar flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={viewer.currentPage <= 1}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium text-gray-700 transition-colors cursor-pointer"
                    >
                        {t('pdf.toolbar.prev')}
                    </button>
                    <span className="text-gray-600 text-sm min-w-[100px] text-center">
                        {t('pdf.toolbar.page', {
                            current: viewer.currentPage,
                            total: viewer.totalPages || '...'
                        })}
                    </span>
                    <button
                        onClick={goToNextPage}
                        disabled={viewer.currentPage >= viewer.totalPages}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium text-gray-700 transition-colors cursor-pointer"
                    >
                        {t('pdf.toolbar.next')}
                    </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={zoomOut}
                        disabled={viewer.scale <= 0.5}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium text-gray-700 transition-colors cursor-pointer"
                    >
                        −
                    </button>
                    <span className="text-gray-600 text-sm min-w-[60px] text-center">
                        {Math.round(viewer.scale * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        disabled={viewer.scale >= 3}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium text-gray-700 transition-colors cursor-pointer"
                    >
                        +
                    </button>
                    <button
                        onClick={() => setScale(1)}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700 transition-colors cursor-pointer ml-2"
                    >
                        {t('pdf.toolbar.reset')}
                    </button>
                </div>
            </div>

            {/* XFA Warning */}
            {isXFA && (
                <div className="bg-yellow-900/50 border-b border-yellow-700 px-4 py-2 text-yellow-200 text-sm">
                    {t('pdf.xfa.limitedNotice')}
                </div>
            )}

            {/* Error Display */}
            {viewer.error && !isXFA && (
                <div className="bg-red-900/50 border-b border-red-700 px-4 py-3 text-red-200">
                    <p className="font-medium">{t('pdf.error.title')}</p>
                    <p className="text-sm opacity-80">{viewer.error}</p>
                </div>
            )}

            {/* PDF Document */}
            <div
                className="flex-1 overflow-auto flex justify-center p-4 bg-gray-100"
                onMouseUp={handleMouseUp}
            >
                {viewer.isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                )}

                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                    }
                    className="pdf-document"
                >
                    <Page
                        pageNumber={viewer.currentPage}
                        scale={viewer.scale}
                        className="pdf-page shadow-2xl"
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                    />
                </Document>
            </div>

            {/* Floating Help Button for text selection */}
            <SelectionHelpButton
                selectedText={selectedText}
                selectionRect={selectionRect}
                isVisible={showHelpButton}
                onHelpClick={handleHelpClick}
            />
        </div>
    );
}

export default PDFViewer;
