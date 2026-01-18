'use client';

import { PDFField } from '@/types/pdf';
import { Check } from 'lucide-react';

interface CheckboxFieldProps {
    field: PDFField;
    value: string;
    onChange: (value: string) => void;
    onFocus: () => void;
    isActive: boolean;
    style: React.CSSProperties;
}

export function CheckboxField({ value, onChange, onFocus, isActive, style }: CheckboxFieldProps) {
    const checked = value === 'true' || value === '1' || value === 'Yes';

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
                className={`
                    w-full h-full border rounded
                    flex items-center justify-center
                    transition-colors
                    ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400 hover:border-blue-400'}
                    ${isActive ? 'ring-2 ring-blue-500' : ''}
                `}
            >
                {checked && <Check className="w-3/4 h-3/4 text-white" strokeWidth={3} />}
            </div>
        </div>
    );
}
