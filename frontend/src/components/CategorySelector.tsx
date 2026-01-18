'use client';

import { FORM_CATEGORIES, FormCategory, FormCategoryInfo } from '@/types/pdf';
import { usePDFStore } from '@/store/pdfStore';
import { useTranslation } from '@/i18n';

interface CategoryCardProps {
    category: FormCategoryInfo;
    isSelected: boolean;
    onClick: () => void;
    formCount: number;
}

function CategoryCard({ category, isSelected, onClick, formCount }: CategoryCardProps) {
    const { t } = useTranslation();
    const translatedName = t(`pdf.categories.${category.id}.name`);
    const translatedDescription = t(`pdf.categories.${category.id}.description`);
    const name = translatedName === `pdf.categories.${category.id}.name` ? category.name : translatedName;
    const description = translatedDescription === `pdf.categories.${category.id}.description` ? category.description : translatedDescription;

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
                    <h3 className="font-semibold text-white text-lg">{name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{description}</p>
                    <p className="text-gray-500 text-xs mt-2">
                        {formCount === 1
                            ? t('pdf.categorySelector.formCount', { count: formCount })
                            : t('pdf.categorySelector.formCountPlural', { count: formCount })}
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

// Only show Legal and Finance categories (the ones with actual PDFs)
const VISIBLE_CATEGORIES: FormCategory[] = ['legal', 'finance'];

interface CategorySelectorProps {
    formCountByCategory: Record<FormCategory, number>;
    onCategorySelect?: (category: FormCategory | null) => void;
    onUploadClick?: () => void;
}

export function CategorySelector({ formCountByCategory, onCategorySelect, onUploadClick }: CategorySelectorProps) {
    const { selectedCategory, setSelectedCategory } = usePDFStore();
    const { t } = useTranslation();

    const handleCategoryClick = (categoryId: FormCategory) => {
        const newSelection = selectedCategory === categoryId ? null : categoryId;
        setSelectedCategory(newSelection);
        onCategorySelect?.(newSelection);
    };

    const visibleCategoryData = FORM_CATEGORIES.filter(cat => VISIBLE_CATEGORIES.includes(cat.id));

    return (
        <div className="category-selector">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">{t('pdf.categorySelector.title')}</h2>
                <p className="text-gray-400 mt-1">{t('pdf.categorySelector.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleCategoryData.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        isSelected={selectedCategory === category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        formCount={formCountByCategory[category.id] || 0}
                    />
                ))}
            </div>

            {/* Upload Button - Below the grid */}
            {onUploadClick && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={onUploadClick}
                        className="
                            flex items-center gap-3 px-6 py-4
                            bg-gray-800/50 border-2 border-dashed border-gray-600
                            hover:border-blue-500 hover:bg-blue-600/10
                            rounded-xl transition-all duration-200
                            text-gray-300 hover:text-white
                        "
                    >
                        <span className="text-2xl">📤</span>
                        <div className="text-left">
                            <span className="font-semibold">{t('pdf.categorySelector.uploadTitle')}</span>
                            <p className="text-gray-500 text-sm">{t('pdf.categorySelector.uploadSubtitle')}</p>
                        </div>
                    </button>
                </div>
            )}

            {selectedCategory && (
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => {
                            setSelectedCategory(null);
                            onCategorySelect?.(null);
                        }}
                        className="text-gray-400 hover:text-white text-sm underline"
                    >
                        {t('pdf.categorySelector.clearSelection')}
                    </button>
                </div>
            )}
        </div>
    );
}

export default CategorySelector;
