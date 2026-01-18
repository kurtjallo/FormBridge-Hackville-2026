'use client';

import { useState, useEffect } from 'react';
import { PDFField } from '@/types/pdf';
import { Pen, RotateCcw } from 'lucide-react';
import { SignatureModal } from '../SignatureModal';

interface SignatureFieldProps {
    field: PDFField;
    value: string;
    onChange: (value: string) => void;
    onFocus: () => void;
    isActive: boolean;
    style: React.CSSProperties;
}

export function SignatureField({ field, value, onChange, onFocus, isActive, style }: SignatureFieldProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [signatureImage, setSignatureImage] = useState<string | null>(null);

    const height = typeof style.height === 'number' ? style.height : 50;

    // Load existing signature from value
    useEffect(() => {
        if (value && value.startsWith('data:image')) {
            setSignatureImage(value);
        }
    }, [value]);

    const handleOpenModal = () => {
        onFocus();
        setIsModalOpen(true);
    };

    const handleConfirm = (dataUrl: string) => {
        setSignatureImage(dataUrl);
        onChange(dataUrl);
        setIsModalOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSignatureImage(null);
        onChange('');
    };

    // If we have a signature, show it
    if (signatureImage) {
        return (
            <>
                <div
                    onClick={handleOpenModal}
                    className={`
                        cursor-pointer group relative
                        ${isActive ? 'ring-2 ring-purple-500' : ''}
                        hover:ring-2 hover:ring-purple-300
                        transition-all rounded bg-white/80
                    `}
                    style={{
                        ...style,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                    title="Click to change signature"
                >
                    <img
                        src={signatureImage}
                        alt="Signature"
                        className="max-w-full max-h-full object-contain"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-2">
                        <button
                            onClick={handleClear}
                            className="opacity-0 group-hover:opacity-100 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all"
                            title="Clear signature"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                    </div>
                </div>

                <SignatureModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirm}
                    fieldName={field.name}
                />
            </>
        );
    }

    // Empty state - show sign button
    return (
        <>
            <button
                onClick={handleOpenModal}
                onFocus={onFocus}
                className={`
                    bg-purple-50/90 border-2 border-dashed
                    ${isActive ? 'border-purple-500 bg-purple-100/90' : 'border-purple-300'}
                    hover:border-purple-500 hover:bg-purple-100/90
                    transition-all rounded
                    flex items-center justify-center gap-2
                    text-purple-600 text-sm font-medium
                    shadow-sm hover:shadow
                `}
                style={{
                    ...style,
                    cursor: 'pointer',
                    minHeight: Math.max(height, 40),
                }}
            >
                <Pen className="w-4 h-4" />
                <span>Click to sign</span>
            </button>

            <SignatureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                fieldName={field.name}
            />
        </>
    );
}

export default SignatureField;
