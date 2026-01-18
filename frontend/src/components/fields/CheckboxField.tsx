'use client';

import { PDFField } from '@/types/pdf';
import { Check } from 'lucide-react';

// Colorblind-aware color scheme for form fields
export interface FieldColorScheme {
    ring: string;
    bgActive: string;
    bgHover: string;
}

interface CheckboxFieldProps {
    field: PDFField;
    value: string;
    onChange: (value: string) => void;
    onFocus: () => void;
    isActive: boolean;
    style: React.CSSProperties;
    colorScheme?: FieldColorScheme;
}

// Default colors (purple theme)
const defaultColors: FieldColorScheme = {
    ring: '#7c3aed',
    bgActive: '#7c3aed',
    bgHover: 'rgba(124, 58, 237, 0.3)',
};

export function CheckboxField({ value, onChange, onFocus, isActive, style, colorScheme }: CheckboxFieldProps) {
    const checked = value === 'true' || value === '1' || value === 'Yes';
    const colors = colorScheme || defaultColors;

    const handleClick = () => {
        onFocus();
        onChange(checked ? '' : 'true');
    };

    return (
        <div
            style={style}
            className="flex items-center justify-center cursor-pointer"
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
            tabIndex={0}
            role="checkbox"
            aria-checked={checked}
        >
            <div
                className="w-full h-full border rounded flex items-center justify-center transition-colors"
                style={{
                    backgroundColor: checked ? colors.bgActive : 'white',
                    borderColor: checked ? colors.bgActive : '#9ca3af',
                    boxShadow: isActive ? `0 0 0 2px ${colors.ring}` : undefined,
                }}
                onMouseEnter={(e) => {
                    if (!checked) {
                        e.currentTarget.style.borderColor = colors.ring;
                    }
                }}
                onMouseLeave={(e) => {
                    if (!checked) {
                        e.currentTarget.style.borderColor = '#9ca3af';
                    }
                }}
            >
                {checked && <Check className="w-3/4 h-3/4 text-white" strokeWidth={3} />}
            </div>
        </div>
    );
}
