'use client';

import { FORM_CATEGORIES, FormCategory, FormCategoryInfo } from '@/types/pdf';
import { usePDFStore } from '@/store/pdfStore';

interface CategoryCardProps {
    category: FormCategoryInfo;
    isSelected: boolean;
    onClick: () => void;
    formCount: number;
}

function CategoryCard({ category, isSelected, onClick, formCount }: CategoryCardProps) {
    return (
        <button
            onClick={onClick}
            className={`
        group relative p-6 rounded-xl border-2 transition-all duration-200
        ${isSelected
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                }
      `}
        >
            <div className="flex items-start gap-4">
                <span className="text-4xl">{category.icon}</span>
                <div className="text-left">
                    <h3 className="font-semibold text-white text-lg">{category.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{category.description}</p>
                    <p className="text-gray-500 text-xs mt-2">
                        {formCount} {formCount === 1 ? 'form' : 'forms'} available
                    </p>
                </div>
            </div>

            {isSelected && (
                <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </span>
                </div>
            )}
        </button>
    );
}

interface CategorySelectorProps {
    formCountByCategory: Record<FormCategory, number>;
    onCategorySelect?: (category: FormCategory | null) => void;
}

export function CategorySelector({ formCountByCategory, onCategorySelect }: CategorySelectorProps) {
    const { selectedCategory, setSelectedCategory } = usePDFStore();

    const handleCategoryClick = (categoryId: FormCategory) => {
        const newSelection = selectedCategory === categoryId ? null : categoryId;
        setSelectedCategory(newSelection);
        onCategorySelect?.(newSelection);
    };

    return (
        <div className="category-selector">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Choose a Category</h2>
                <p className="text-gray-400 mt-1">Select a form category to get started</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FORM_CATEGORIES.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        isSelected={selectedCategory === category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        formCount={formCountByCategory[category.id] || 0}
                    />
                ))}
            </div>

            {selectedCategory && (
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => {
                            setSelectedCategory(null);
                            onCategorySelect?.(null);
                        }}
                        className="text-gray-400 hover:text-white text-sm underline"
                    >
                        Clear selection
                    </button>
                </div>
            )}
        </div>
    );
}

export default CategorySelector;
