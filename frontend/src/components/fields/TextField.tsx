'use client';

import { PDFField } from '@/types/pdf';

// Colorblind-aware color scheme for form fields
export interface FieldColorScheme {
    ring: string;
    bgActive: string;
    bgHover: string;
}

interface TextFieldProps {
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
    bgActive: 'rgba(124, 58, 237, 0.15)',
    bgHover: 'rgba(124, 58, 237, 0.1)',
};

export function TextField({ field, value, onChange, onFocus, isActive, style, colorScheme }: TextFieldProps) {
    const height = typeof style.height === 'number' ? style.height : 20;
    const fontSize = Math.max(10, height * 0.6);
    const colors = colorScheme || defaultColors;

    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            placeholder={field.name}
            maxLength={field.maxLength}
            className="bg-transparent border-0 outline-none text-black font-sans transition-colors"
            style={{
                ...style,
                fontSize: `${fontSize}px`,
                padding: '1px 2px',
                boxSizing: 'border-box',
                boxShadow: isActive ? `0 0 0 2px ${colors.ring}` : undefined,
                backgroundColor: isActive ? colors.bgActive : undefined,
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = colors.bgHover;
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        />
    );
}
