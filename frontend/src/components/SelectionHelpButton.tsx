'use client';

import { useMemo, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { ColorblindMode } from '@/store/pdfStore';

// Color mappings for each colorblind mode
const colorblindColors: Record<ColorblindMode, { bg: string; hover: string }> = {
  none: { bg: '#7c3aed', hover: '#000000' },
  deuteranopia: { bg: '#0077bb', hover: '#005588' },
  protanopia: { bg: '#0077bb', hover: '#005588' },
  tritanopia: { bg: '#cc3399', hover: '#991166' },
};

interface SelectionHelpButtonProps {
  selectedText: string;
  selectionRect: DOMRect | null;
  isVisible: boolean;
  onHelpClick: (text: string) => void;
  colorblindMode?: ColorblindMode;
}

export function SelectionHelpButton({
  selectedText,
  selectionRect,
  isVisible,
  onHelpClick,
  colorblindMode = 'none',
}: SelectionHelpButtonProps) {
  const { t } = useTranslation();
  const colors = colorblindColors[colorblindMode];
  // Compute position directly from props
  const position = useMemo(() => {
    if (!isVisible || !selectionRect) {
      return null;
    }

    const buttonWidth = 80;
    const buttonHeight = 36;
    const padding = 8;

    let top = selectionRect.top - buttonHeight - padding;
    let left = selectionRect.right - buttonWidth / 2;

    // Only access window on client side
    if (typeof window === 'undefined') {
      return { top, left };
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // If button would be above viewport, place it below the selection
    if (top < padding) {
      top = selectionRect.bottom + padding;
    }

    // Keep button within horizontal bounds
    if (left < padding) {
      left = padding;
    } else if (left + buttonWidth > viewportWidth - padding) {
      left = viewportWidth - buttonWidth - padding;
    }

    // Keep button within vertical bounds
    if (top + buttonHeight > viewportHeight - padding) {
      top = viewportHeight - buttonHeight - padding;
    }

    return { top, left };
  }, [isVisible, selectionRect]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      window.getSelection()?.removeAllRanges();
      onHelpClick(selectedText);
    },
    [selectedText, onHelpClick]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      window.getSelection()?.removeAllRanges();
      onHelpClick(selectedText);
    },
    [selectedText, onHelpClick]
  );

  if (!isVisible || !position) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      className="
        fixed z-[100] flex items-center gap-1.5
        px-3 py-2
        text-white text-sm font-medium
        rounded-lg shadow-lg
        animate-in fade-in zoom-in-95 duration-200
        cursor-pointer
        transition-colors
        hover:opacity-90
      "
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        backgroundColor: colors.bg,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.hover)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.bg)}
      aria-label={t('pdf.colorblind.chatButtonLabel')}
    >
      <MessageCircle className="w-4 h-4" />
      <span>{t('pdf.colorblind.chatButton')}</span>
    </button>
  );
}
