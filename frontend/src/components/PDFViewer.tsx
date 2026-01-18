'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePDFStore } from '@/store/pdfStore';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    pdfUrl: string;
    onFieldClick?: (fieldId: string) => void;
}

export function PDFViewer({ pdfUrl, onFieldClick }: PDFViewerProps) {
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
                    setError('This is an XFA form which has limited editing support. Some features may not work correctly.');
                }
            } catch {
                // Ignore XFA detection errors
            }
        },
        [setTotalPages, setLoading, setError]
    );

    const onDocumentLoadError = useCallback(
        (error: Error) => {
            setLoading(false);
            setError(`Failed to load PDF: ${error.message}`);
        },
        [setLoading, setError]
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
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium text-gray-700 transition-colors"
                    >
                        ← Prev
                    </button>
                    <span className="text-gray-600 text-sm min-w-[100px] text-center">
                        Page {viewer.currentPage} of {viewer.totalPages || '...'}
                    </span>
                    <button
                        onClick={goToNextPage}
                        disabled={viewer.currentPage >= viewer.totalPages}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium text-gray-700 transition-colors"
                    >
                        Next →
                    </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={zoomOut}
                        disabled={viewer.scale <= 0.5}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium text-gray-700 transition-colors"
                    >
                        −
                    </button>
                    <span className="text-gray-600 text-sm min-w-[60px] text-center">
                        {Math.round(viewer.scale * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        disabled={viewer.scale >= 3}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium text-gray-700 transition-colors"
                    >
                        +
                    </button>
                    <button
                        onClick={() => setScale(1)}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700 transition-colors ml-2"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* XFA Warning */}
            {isXFA && (
                <div className="bg-yellow-900/50 border-b border-yellow-700 px-4 py-2 text-yellow-200 text-sm">
                    ⚠️ This is an XFA form. Some interactive features may be limited.
                </div>
            )}

            {/* Error Display */}
            {viewer.error && !isXFA && (
                <div className="bg-red-900/50 border-b border-red-700 px-4 py-3 text-red-200">
                    <p className="font-medium">Error loading PDF</p>
                    <p className="text-sm opacity-80">{viewer.error}</p>
                </div>
            )}

            {/* PDF Document */}
            <div className="flex-1 overflow-auto flex justify-center p-4 bg-gray-100">
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
        </div>
    );
}

export default PDFViewer;
