'use client';

import { useCallback } from 'react';
import { usePDFStore } from '@/store/pdfStore';
import { PDFField } from '@/types/pdf';
import { TextField } from './fields/TextField';
import { CheckboxField } from './fields/CheckboxField';

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
    const { fieldValues, setFieldValue, activeFieldId, setActiveField } = usePDFStore();

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

                switch (field.type) {
                    case 'checkbox':
                        return <CheckboxField key={field.id} {...fieldProps} />;
                    case 'radio':
                        // Simplified: treat radio as checkbox for now
                        return <CheckboxField key={field.id} {...fieldProps} />;
                    default:
                        return <TextField key={field.id} {...fieldProps} />;
                }
            })}
        </div>
    );
}
