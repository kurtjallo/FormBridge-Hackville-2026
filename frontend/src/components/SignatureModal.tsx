'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { X, Type, PenTool, Check } from 'lucide-react';
import { DrawSignature } from './fields/DrawSignature';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (signatureDataUrl: string) => void;
    fieldName?: string;
}

type TabType = 'type' | 'draw';

export function SignatureModal({ isOpen, onClose, onConfirm, fieldName }: SignatureModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('type');
    const [typedName, setTypedName] = useState('');
    const [drawnSignature, setDrawnSignature] = useState<string | null>(null);
    const typePreviewRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when switching to type tab
    useEffect(() => {
        if (isOpen && activeTab === 'type') {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, activeTab]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTypedName('');
            setDrawnSignature(null);
            setActiveTab('type');
        }
    }, [isOpen]);

    const handleConfirm = useCallback(async () => {
        console.log('[SignatureModal] handleConfirm called, activeTab:', activeTab);

        if (activeTab === 'type') {
            if (!typedName.trim() || !typePreviewRef.current) {
                console.log('[SignatureModal] Type tab - validation failed', { typedName: typedName.trim(), hasRef: !!typePreviewRef.current });
                return;
            }

            try {
                console.log('[SignatureModal] Capturing with html2canvas...');
                const canvas = await html2canvas(typePreviewRef.current, {
                    backgroundColor: 'transparent',
                    scale: 2,
                    logging: true, // Enable html2canvas logging for debugging
                });
                const dataUrl = canvas.toDataURL('image/png');
                console.log('[SignatureModal] Canvas captured, dataUrl length:', dataUrl.length);
                console.log('[SignatureModal] dataUrl preview:', dataUrl.substring(0, 100) + '...');
                onConfirm(dataUrl);
            } catch (err) {
                console.error('[SignatureModal] Failed to capture typed signature:', err);
            }
        } else {
            if (!drawnSignature) {
                console.log('[SignatureModal] Draw tab - no signature');
                return;
            }
            console.log('[SignatureModal] Draw tab - using drawnSignature, length:', drawnSignature.length);
            onConfirm(drawnSignature);
        }
    }, [activeTab, typedName, drawnSignature, onConfirm]);

    const isConfirmDisabled = activeTab === 'type' ? !typedName.trim() : !drawnSignature;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Add Your Signature</h2>
                        {fieldName && (
                            <p className="text-sm text-gray-500 mt-0.5">For: {fieldName}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('type')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'type'
                                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Type className="w-4 h-4" />
                        Type
                    </button>
                    <button
                        onClick={() => setActiveTab('draw')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'draw'
                                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <PenTool className="w-4 h-4" />
                        Draw
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'type' ? (
                        <div className="space-y-4">
                            {/* Signature Preview - using ONLY inline styles to avoid lab() colors that html2canvas can't parse */}
                            <div
                                ref={typePreviewRef}
                                style={{
                                    height: '96px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            >
                                {typedName ? (
                                    <span
                                        style={{
                                            fontFamily: "'Brush Script MT', 'Segoe Script', 'Bradley Hand', cursive",
                                            fontSize: '32px',
                                            letterSpacing: '1px',
                                            color: '#111827',
                                            userSelect: 'none',
                                            padding: '0 16px',
                                        }}
                                    >
                                        {typedName}
                                    </span>
                                ) : (
                                    <span style={{ color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>
                                        Your signature will appear here...
                                    </span>
                                )}
                            </div>

                            {/* Input */}
                            <input
                                ref={inputRef}
                                type="text"
                                value={typedName}
                                onChange={(e) => setTypedName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !isConfirmDisabled && handleConfirm()}
                                placeholder="Type your full name..."
                                maxLength={50}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-shadow"
                            />

                            <p className="text-xs text-gray-500 text-center">
                                By typing your name, you agree this represents your legal signature
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <DrawSignature
                                width={440}
                                height={150}
                                onSignatureChange={setDrawnSignature}
                            />
                            <p className="text-xs text-gray-500 text-center">
                                Use your mouse or finger to draw your signature
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                        className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Check className="w-4 h-4" />
                        Apply Signature
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SignatureModal;
