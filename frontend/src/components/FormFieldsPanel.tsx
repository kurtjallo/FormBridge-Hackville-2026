'use client';

import { Download } from 'lucide-react';

export interface FormField {
    name: string;
    type: 'text' | 'checkbox' | 'select' | 'radio';
    value: string | boolean;
    options?: string[];
}

interface FormFieldsPanelProps {
    fields: FormField[];
    onFieldChange: (fieldName: string, value: string | boolean) => void;
    onSave: () => void;
}

export function FormFieldsPanel({ fields, onFieldChange, onSave }: FormFieldsPanelProps) {
    if (fields.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 text-gray-500">
                <p className="text-sm">No fillable fields detected in this PDF.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {fields.map((field) => (
                    <div key={field.name} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            {field.name.replace(/_/g, ' ')}
                        </label>
                        {field.type === 'checkbox' ? (
                            <input
                                type="checkbox"
                                checked={field.value === true || field.value === 'true'}
                                onChange={(e) => onFieldChange(field.name, e.target.checked)}
                                className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                            />
                        ) : field.type === 'select' && field.options ? (
                            <select
                                value={field.value as string}
                                onChange={(e) => onFieldChange(field.name, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                            >
                                <option value="">Select...</option>
                                {field.options.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={field.value as string}
                                onChange={(e) => onFieldChange(field.name, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                placeholder={`Enter ${field.name.replace(/_/g, ' ').toLowerCase()}`}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={onSave}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                    <Download className="w-4 h-4" />
                    Download Filled PDF
                </button>
            </div>
        </div>
    );
}
