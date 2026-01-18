'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePDFStore } from '@/store/pdfStore';
import { FieldOverlay } from './FieldOverlay';
import { SelectionHelpButton } from './SelectionHelpButton';
import {
    loadPDFDocument,
    extractFormFields,
    fillAndExportPDF,
    downloadPDF,
} from '@/lib/pdfService';
import { Download, Loader2, Check, X } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { SignatureModal } from './SignatureModal';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFFormViewerProps {
    pdfUrl: string;
    onFieldClick?: (fieldId: string) => void;
    onHelpRequest?: (data: { selectedText: string; page: number }) => void;
}

export function PDFFormViewer({ pdfUrl, onFieldClick, onHelpRequest }: PDFFormViewerProps) {
    const { t } = useTranslation();
    const pageContainerRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isXFA, setIsXFA] = useState(false);

    // Selection help button state
    const [showHelpButton, setShowHelpButton] = useState(false);
    const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
    const [selectedText, setSelectedText] = useState('');

    // Signature modal state (for intercepted annotation clicks)
    const [signatureModalOpen, setSignatureModalOpen] = useState(false);
    const [signatureFieldId, setSignatureFieldId] = useState<string | null>(null);
    const [capturedSignature, setCapturedSignature] = useState<string | null>(null); // For visual preview

    const {
        viewer,
        fields,
        setFields,
        fieldValues,
        pdfBytes,
        setPdfBytes,
        pageDimensions,
        setPageDimensions,
        setCurrentPage,
        setTotalPages,
        setLoading,
        setError,
        zoomIn,
        zoomOut,
        setScale,
        clearFieldValues,
        setActiveField,
    } = usePDFStore();

    // Track previous URL to detect changes
    const prevPdfUrlRef = useRef<string | null>(null);

    // Load PDF and extract fields when pdfUrl changes
    useEffect(() => {
        async function initPDF() {
            try {
                // Reset state when switching PDFs
                if (prevPdfUrlRef.current !== null && prevPdfUrlRef.current !== pdfUrl) {
                    console.log('Switching PDF, clearing old fields...');
                    setFields([]);
                    clearFieldValues();
                    setActiveField(null);
                    setCurrentPage(1);
                }
                prevPdfUrlRef.current = pdfUrl;

                setLoading(true);
                setError(null);

                const { doc, bytes } = await loadPDFDocument(pdfUrl);
                setPdfBytes(bytes);

                // Check for XFA form
                const isXFAForm = (doc as unknown as { isXFA?: boolean }).isXFA || false;
                setIsXFA(isXFAForm);

                if (!isXFAForm) {
                    const extractedFields = extractFormFields(doc);
                    setFields(extractedFields);
                    console.log(`Extracted ${extractedFields.length} fields from PDF`);
                } else {
                    setFields([]);
                    console.log('XFA form detected, no fillable fields extracted');
                }

                // Get page dimensions from first page
                // Some PDFs have malformed page trees that pdf-lib cannot parse
                // In that case, use default dimensions and let react-pdf handle display
                try {
                    const firstPage = doc.getPage(0);
                    const { width, height } = firstPage.getSize();
                    setPageDimensions({ width, height });
                    setTotalPages(doc.getPageCount());
                } catch (pageErr) {
                    console.warn('Could not read page dimensions from PDF (malformed page tree). Using defaults.', pageErr);
                    // Use standard US Letter dimensions as fallback
                    setPageDimensions({ width: 612, height: 792 });
                    // Total pages will be set by react-pdf's onDocumentLoadSuccess
                }
                setLoading(false);
            } catch (err) {
                console.error('Failed to load PDF:', err);
                setError(`Failed to load PDF: ${err}`);
                setLoading(false);
            }
        }

        initPDF();
    }, [pdfUrl, setPdfBytes, setFields, setPageDimensions, setTotalPages, setLoading, setError, clearFieldValues, setActiveField, setCurrentPage]);

    // Handle text selection for help button
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
    const handleHelpClick = useCallback(
        (text: string) => {
            if (onHelpRequest) {
                onHelpRequest({ selectedText: text, page: viewer.currentPage });
            }
            setShowHelpButton(false);
        },
        [viewer.currentPage, onHelpRequest]
    );

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

    // Intercept clicks on PDF annotation links (e.g., esign URLs)
    useEffect(() => {
        const container = pageContainerRef.current;
        if (!container) return;

        const handleAnnotationClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link) {
                const href = link.getAttribute('href') || '';

                // Check if this is an external esign/signature URL
                const isEsignUrl = /esign|docusign|hellosign|adobesign|sign.*pdf|pdf.*sign/i.test(href);
                const isExternalUrl = href.startsWith('http') || href.startsWith('//');

                if (isEsignUrl || (isExternalUrl && href.includes('sign'))) {
                    e.preventDefault();
                    e.stopPropagation();

                    console.log('Intercepted esign URL:', href);

                    // Find a signature field or create a temporary one
                    const signatureField = fields.find(f => f.type === 'signature');
                    if (signatureField) {
                        setSignatureFieldId(signatureField.id);
                    } else {
                        // Use a generic field ID for annotation-triggered signatures
                        setSignatureFieldId('annotation_signature_' + Date.now());
                    }
                    setSignatureModalOpen(true);
                    return;
                }
            }
        };

        // Capture phase to intercept before default handling
        container.addEventListener('click', handleAnnotationClick, true);
        return () => container.removeEventListener('click', handleAnnotationClick, true);
    }, [fields]);

    // Handle signature from modal (for intercepted annotations)
    const handleSignatureConfirm = useCallback((dataUrl: string) => {
        console.log('[Signature] handleSignatureConfirm called');
        console.log('[Signature] signatureFieldId:', signatureFieldId);
        console.log('[Signature] dataUrl length:', dataUrl?.length);
        console.log('[Signature] dataUrl starts with data:image:', dataUrl?.startsWith('data:image'));

        if (signatureFieldId) {
            // Store the signature in field values
            const { setFieldValue } = usePDFStore.getState();
            setFieldValue(signatureFieldId, dataUrl);
            console.log('[Signature] Stored in fieldValues with key:', signatureFieldId);

            // If this is an annotation signature (no real field), show preview
            if (signatureFieldId.startsWith('annotation_signature_')) {
                console.log('[Signature] Setting capturedSignature for preview');
                setCapturedSignature(dataUrl);
            }
        }
        setSignatureModalOpen(false);
        setSignatureFieldId(null);
    }, [signatureFieldId]);

    // Handle PDF export
    const handleExport = useCallback(async () => {
        if (!pdfBytes) return;

        setIsExporting(true);
        try {
            const filledBytes = await fillAndExportPDF(pdfBytes, fieldValues);
            const filename = `filled-form-${Date.now()}.pdf`;
            downloadPDF(filledBytes, filename);
        } catch (err) {
            console.error('Export failed:', err);
            setError('Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    }, [pdfBytes, fieldValues, setError]);

    const onDocumentLoadSuccess = useCallback(
        (pdf: { numPages: number; _pdfInfo?: { isXFA?: boolean } }) => {
            setTotalPages(pdf.numPages);
            setLoading(false);

            // Check for XFA form
            const isXFAForm = pdf._pdfInfo?.isXFA || false;
            setIsXFA(isXFAForm);
            if (isXFAForm) {
                setError(t('pdf.xfa.limitedSupport'));
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

    const filledFieldCount = Object.keys(fieldValues).filter((k) => fieldValues[k]).length;
    const totalFieldCount = fields.length;

    return (
        <div className="pdf-form-viewer flex flex-col h-full bg-gray-50">
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
                            total: viewer.totalPages || '...',
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

                {/* Export Button */}
                <div className="flex items-center gap-3">
                    {totalFieldCount > 0 && (
                        <span className="text-sm text-gray-500">
                            {filledFieldCount}/{totalFieldCount} fields
                        </span>
                    )}
                    <button
                        onClick={handleExport}
                        disabled={isExporting || !pdfBytes}
                        className="flex items-center gap-2 px-4 py-1.5 bg-purple-900 text-white rounded-md hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors cursor-pointer"
                    >
                        {isExporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Download
                    </button>
                </div>
            </div>

            {/* Captured Signature Preview (for annotation-intercepted signatures) */}
            {capturedSignature && (
                <div className="bg-green-50 border-b border-green-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-800">Signature captured!</p>
                            <p className="text-xs text-green-600">It will be embedded when you download the PDF</p>
                        </div>
                        <div className="ml-4 bg-white border border-green-200 rounded-lg p-2 h-12 flex items-center">
                            <img
                                src={capturedSignature}
                                alt="Your signature"
                                className="h-full w-auto max-w-[200px] object-contain"
                                style={{ minWidth: '50px' }}
                                onLoad={() => console.log('[Signature Preview] Image loaded successfully')}
                                onError={(e) => console.error('[Signature Preview] Image failed to load:', e)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setCapturedSignature(null)}
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                        title="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

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

            {/* PDF Document with Field Overlay */}
            <div
                className="flex-1 overflow-auto flex justify-center p-4 bg-gray-100"
                onMouseUp={handleMouseUp}
            >
                {viewer.isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                )}

                <div className="relative" ref={pageContainerRef}>
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
                            renderForms={true}
                        />
                    </Document>

                    {/* Editable Field Overlay */}
                    <FieldOverlay
                        fields={fields}
                        currentPage={viewer.currentPage}
                        scale={viewer.scale}
                        pageHeight={pageDimensions.height}
                        onFieldClick={onFieldClick}
                    />
                </div>
            </div>

            {/* Selection Help Button */}
            <SelectionHelpButton
                selectedText={selectedText}
                selectionRect={selectionRect}
                isVisible={showHelpButton}
                onHelpClick={handleHelpClick}
            />

            {/* Signature Modal (for intercepted annotation clicks) */}
            <SignatureModal
                isOpen={signatureModalOpen}
                onClose={() => {
                    setSignatureModalOpen(false);
                    setSignatureFieldId(null);
                }}
                onConfirm={handleSignatureConfirm}
                fieldName={signatureFieldId?.replace(/_/g, ' ') || 'Signature'}
            />
        </div>
    );
}

export default PDFFormViewer;
