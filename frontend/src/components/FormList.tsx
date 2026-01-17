'use client';

import { PDFFormMeta, FormCategory } from '@/types/pdf';
import { usePDFStore } from '@/store/pdfStore';

interface FormCardProps {
    form: PDFFormMeta;
    onClick: () => void;
}

function FormCard({ form, onClick }: FormCardProps) {
    const difficultyColors = {
        easy: 'bg-green-500/20 text-green-400 border-green-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        hard: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
        <button
            onClick={onClick}
            className="group w-full text-left p-5 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800 transition-all duration-200"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">
                        {form.name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {form.description}
                    </p>
                </div>

                {form.isXFA && (
                    <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                        XFA
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3 mt-4">
                <span className={`px-2 py-1 text-xs rounded-full border ${difficultyColors[form.difficulty]}`}>
                    {form.difficulty}
                </span>
                <span className="text-gray-500 text-xs">
                    ⏱️ {form.estimatedTime}
                </span>
                {form.pageCount && (
                    <span className="text-gray-500 text-xs">
                        📄 {form.pageCount} pages
                    </span>
                )}
            </div>

            {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {form.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-gray-500 text-xs">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </button>
    );
}

interface FormListProps {
    forms: PDFFormMeta[];
    category?: FormCategory | null;
    onFormSelect: (form: PDFFormMeta) => void;
}

export function FormList({ forms, category, onFormSelect }: FormListProps) {
    const filteredForms = category
        ? forms.filter((f) => f.category === category)
        : forms;

    if (filteredForms.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-white mb-2">No forms available</h3>
                <p className="text-gray-400">
                    {category
                        ? 'No forms in this category yet. Check back soon!'
                        : 'Select a category to see available forms.'}
                </p>
            </div>
        );
    }

    return (
        <div className="form-list">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                    Available Forms
                    <span className="text-gray-500 font-normal ml-2">
                        ({filteredForms.length})
                    </span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredForms.map((form) => (
                    <FormCard
                        key={form.id}
                        form={form}
                        onClick={() => onFormSelect(form)}
                    />
                ))}
            </div>
        </div>
    );
}

export default FormList;
