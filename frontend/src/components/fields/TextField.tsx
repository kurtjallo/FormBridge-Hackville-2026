'use client';

import { PDFField } from '@/types/pdf';

interface TextFieldProps {
    field: PDFField;
    value: string;
    onChange: (value: string) => void;
    onFocus: () => void;
    isActive: boolean;
    style: React.CSSProperties;
}

export function TextField({ field, value, onChange, onFocus, isActive, style }: TextFieldProps) {
    const height = typeof style.height === 'number' ? style.height : 20;
    const fontSize = Math.max(10, height * 0.6);

    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            placeholder={field.name}
            maxLength={field.maxLength}
            className={`
                bg-transparent border-0 outline-none
                text-black font-sans
                ${isActive ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'hover:bg-yellow-100/30'}
                focus:bg-blue-50/50
                transition-colors
            `}
            style={{
                ...style,
                fontSize: `${fontSize}px`,
                padding: '1px 2px',
                boxSizing: 'border-box',
            }}
        />
    );
}
