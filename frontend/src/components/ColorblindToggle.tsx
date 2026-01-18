'use client';

import { useState, useRef, useEffect } from 'react';
import { Eye, ChevronDown, Check } from 'lucide-react';
import { usePDFStore, ColorblindMode } from '@/store/pdfStore';
import { useTranslation } from '@/i18n';

interface ColorblindOption {
  value: ColorblindMode;
  labelKey: string;
  descriptionKey: string;
}

const colorblindOptions: ColorblindOption[] = [
  {
    value: 'none',
    labelKey: 'pdf.colorblind.options.none.label',
    descriptionKey: 'pdf.colorblind.options.none.description',
  },
  {
    value: 'deuteranopia',
    labelKey: 'pdf.colorblind.options.deuteranopia.label',
    descriptionKey: 'pdf.colorblind.options.deuteranopia.description',
  },
  {
    value: 'protanopia',
    labelKey: 'pdf.colorblind.options.protanopia.label',
    descriptionKey: 'pdf.colorblind.options.protanopia.description',
  },
  {
    value: 'tritanopia',
    labelKey: 'pdf.colorblind.options.tritanopia.label',
    descriptionKey: 'pdf.colorblind.options.tritanopia.description',
  },
];

export function ColorblindToggle() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { colorblindMode, setColorblindMode } = usePDFStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const currentOption = colorblindOptions.find((opt) => opt.value === colorblindMode) || colorblindOptions[0];
  const isActive = colorblindMode !== 'none';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer
          ${isActive
            ? 'bg-purple-100 text-purple-900 border border-purple-300 hover:bg-purple-200'
            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }
        `}
        aria-label={t('pdf.colorblind.toggleLabel')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Eye className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">{t('pdf.colorblind.title')}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
          role="listbox"
          aria-label={t('pdf.colorblind.selectLabel')}
        >
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">{t('pdf.colorblind.menuTitle')}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{t('pdf.colorblind.menuDescription')}</p>
          </div>

          <div className="py-1">
            {colorblindOptions.map((option) => {
              const isSelected = colorblindMode === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setColorblindMode(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-3 text-left flex items-start gap-3 transition-colors cursor-pointer
                    ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'}
                  `}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div
                    className={`
                      mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}
                    `}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{t(option.labelKey)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t(option.descriptionKey)}</div>
                    {option.value !== 'none' && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">{t('pdf.colorblind.previewLabel')}</span>
                        <div
                          className={`h-4 w-12 rounded colorblind-highlight-preview-${option.value}`}
                          aria-label={t('pdf.colorblind.colorPreview')}
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              <Eye className="w-3 h-3 inline-block mr-1" aria-hidden="true" />
              {t('pdf.colorblind.accessibilityNote')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
