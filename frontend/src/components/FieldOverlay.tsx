'use client';

import { useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { usePDFStore, ColorblindMode } from '@/store/pdfStore';
import { PDFField } from '@/types/pdf';
import { TextField } from './fields/TextField';
import { CheckboxField } from './fields/CheckboxField';
import { SignatureField } from './fields/SignatureField';
import { useTranslation } from '@/i18n';

// Color mappings for each colorblind mode (for Chat button)
const colorblindColors: Record<ColorblindMode, { bg: string; hover: string }> = {
    none: { bg: '#7c3aed', hover: '#000000' },
    deuteranopia: { bg: '#0077bb', hover: '#005588' },
    protanopia: { bg: '#0077bb', hover: '#005588' },
    tritanopia: { bg: '#cc3399', hover: '#991166' },
};

// Color scheme for form fields (ring, background colors)
const fieldColorSchemes: Record<ColorblindMode, { ring: string; bgActive: string; bgHover: string }> = {
    none: {
        ring: '#7c3aed',
        bgActive: 'rgba(124, 58, 237, 0.15)',
        bgHover: 'rgba(124, 58, 237, 0.1)',
    },
    deuteranopia: {
        ring: '#0077bb',
        bgActive: 'rgba(0, 119, 187, 0.2)',
        bgHover: 'rgba(0, 119, 187, 0.1)',
    },
    protanopia: {
        ring: '#0077bb',
        bgActive: 'rgba(0, 119, 187, 0.2)',
        bgHover: 'rgba(0, 119, 187, 0.1)',
    },
    tritanopia: {
        ring: '#cc3399',
        bgActive: 'rgba(204, 51, 153, 0.18)',
        bgHover: 'rgba(204, 51, 153, 0.1)',
    },
};

interface FieldOverlayProps {
    fields: PDFField[];
    currentPage: number;
    scale: number;
    pageHeight: number;
    onFieldClick?: (fieldId: string) => void;
}

export function FieldOverlay({
    fields,
    currentPage,
    scale,
    pageHeight,
    onFieldClick,
}: FieldOverlayProps) {
    const { t } = useTranslation();
    const { fieldValues, setFieldValue, activeFieldId, setActiveField, colorblindMode } = usePDFStore();
    const colors = colorblindColors[colorblindMode];
    const fieldColorScheme = fieldColorSchemes[colorblindMode];

    // Filter fields for current page
    const pageFields = fields.filter((f) => f.page === currentPage);

    const calculatePosition = useCallback(
        (field: PDFField) => {
            // Convert PDF coordinates (bottom-left origin) to CSS (top-left origin)
            const pdfTopY = pageHeight - field.rect.y - field.rect.height;

            return {
                left: field.rect.x * scale,
                top: pdfTopY * scale,
                width: field.rect.width * scale,
                height: field.rect.height * scale,
            };
        },
        [scale, pageHeight]
    );

    const handleFieldChange = useCallback(
        (fieldId: string, value: string) => {
            setFieldValue(fieldId, value);
        },
        [setFieldValue]
    );

    const handleFieldFocus = useCallback(
        (fieldId: string) => {
            setActiveField(fieldId);
            onFieldClick?.(fieldId);
        },
        [setActiveField, onFieldClick]
    );

    if (pageFields.length === 0) {
        return null;
    }

    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
        >
            {pageFields.map((field) => {
                const pos = calculatePosition(field);
                const isActive = activeFieldId === field.id;

                const fieldProps = {
                    field,
                    value: fieldValues[field.id] || '',
                    onChange: (value: string) => handleFieldChange(field.id, value),
                    onFocus: () => handleFieldFocus(field.id),
                    isActive,
                    style: {
                        position: 'absolute' as const,
                        left: `${pos.left}px`,
                        top: `${pos.top}px`,
                        width: `${pos.width}px`,
                        height: `${pos.height}px`,
                        pointerEvents: 'auto' as const,
                    },
                };

                return (
                    <div key={field.id}>
                        {/* Render the field component */}
                        {field.type === 'checkbox' || field.type === 'radio' ? (
                            <CheckboxField {...fieldProps} colorScheme={fieldColorScheme} />
                        ) : field.type === 'signature' ? (
                            <SignatureField {...fieldProps} colorScheme={fieldColorScheme} />
                        ) : (
                            <TextField {...fieldProps} colorScheme={fieldColorScheme} />
                        )}

                        {/* Chat label that appears next to active field */}
                        {isActive && (
                            <button
                                onClick={() => onFieldClick?.(field.id)}
                                className="
                                    flex items-center gap-1.5
                                    px-2.5 py-1.5
                                    text-white text-xs font-medium
                                    rounded-md shadow-lg
                                    cursor-pointer
                                    transition-colors
                                    animate-in fade-in zoom-in-95 duration-200
                                    hover:opacity-90
                                "
                                style={{
                                    position: 'absolute',
                                    left: `${pos.left + pos.width + 8}px`,
                                    top: `${pos.top + (pos.height / 2) - 14}px`,
                                    backgroundColor: colors.bg,
                                    pointerEvents: 'auto',
                                    zIndex: 50,
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.hover)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.bg)}
                                aria-label={t('pdf.colorblind.chatButtonLabel')}
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{t('pdf.colorblind.chatButton')}</span>
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
