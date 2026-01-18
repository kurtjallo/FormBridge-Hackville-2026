'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface TextSelectionState {
  selectedText: string;
  selectionRect: DOMRect | null;
  isSelecting: boolean;
}

interface UseTextSelectionOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  minLength?: number;
  debounceMs?: number;
  onSelectionComplete?: (text: string, rect: DOMRect) => void;
}

export function useTextSelection({
  containerRef,
  minLength = 3,
  debounceMs = 200,
  onSelectionComplete,
}: UseTextSelectionOptions): TextSelectionState {
  const [state, setState] = useState<TextSelectionState>({
    selectedText: '',
    selectionRect: null,
    isSelecting: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousSelectionRef = useRef<string>('');
  const hasTriggeredRef = useRef<boolean>(false);

  const handleSelectionChange = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed) {
        setState({
          selectedText: '',
          selectionRect: null,
          isSelecting: false,
        });
        previousSelectionRef.current = '';
        hasTriggeredRef.current = false;
        return;
      }

      const selectedText = selection.toString().trim();

      const container = containerRef.current;
      if (!container) return;

      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;

      // Verify selection is within the PDF container
      const isWithinContainer =
        container.contains(commonAncestor) ||
        (commonAncestor.nodeType === Node.TEXT_NODE &&
          container.contains(commonAncestor.parentNode));

      if (!isWithinContainer || selectedText.length < minLength) {
        setState({
          selectedText: '',
          selectionRect: null,
          isSelecting: false,
        });
        previousSelectionRef.current = '';
        hasTriggeredRef.current = false;
        return;
      }

      const rect = range.getBoundingClientRect();

      setState({
        selectedText,
        selectionRect: rect,
        isSelecting: true,
      });

      // Check if selection is stable (same as previous) and hasn't been triggered yet
      if (
        onSelectionComplete &&
        selectedText === previousSelectionRef.current &&
        !hasTriggeredRef.current
      ) {
        hasTriggeredRef.current = true;
        onSelectionComplete(selectedText, rect);
      }

      previousSelectionRef.current = selectedText;
    }, debounceMs);
  }, [containerRef, minLength, debounceMs, onSelectionComplete]);

  const handleMouseDown = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isSelecting: false,
    }));
    // Reset tracking on new selection start
    previousSelectionRef.current = '';
    hasTriggeredRef.current = false;
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleSelectionChange, handleMouseDown]);

  return state;
}
