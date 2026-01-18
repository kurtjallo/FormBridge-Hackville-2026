'use client';

import { useMemo, useCallback } from 'react';
import { HelpCircle } from 'lucide-react';

interface SelectionHelpButtonProps {
  selectedText: string;
  selectionRect: DOMRect | null;
  isVisible: boolean;
  onHelpClick: (text: string) => void;
}

export function SelectionHelpButton({
  selectedText,
  selectionRect,
  isVisible,
  onHelpClick,
}: SelectionHelpButtonProps) {
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
        bg-purple-900 hover:bg-black
        text-white text-sm font-medium
        rounded-lg shadow-lg
        animate-in fade-in zoom-in-95 duration-200
        cursor-pointer
      "
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      aria-label="Get help with selected text"
    >
      <HelpCircle className="w-4 h-4" />
      <span>Help</span>
    </button>
  );
}
