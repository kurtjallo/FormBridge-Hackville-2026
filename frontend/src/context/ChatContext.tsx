'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useFormStore } from '@/store/formStore';
import { usePageContext, CurrentPageContext } from '@/hooks/usePageContext';
import { knowledgeBase, KnowledgeEntry } from '@/lib/knowledgeBase';

// ============================================
// TYPES
// ============================================

export interface ChatContextValue {
  /** Whether the chat widget is open */
  isOpen: boolean;
  /** Open the chat widget */
  openChat: () => void;
  /** Close the chat widget */
  closeChat: () => void;
  /** Toggle the chat widget */
  toggleChat: () => void;
  /** Current page context */
  pageContext: CurrentPageContext;
  /** Search the knowledge base */
  searchKnowledge: (query: string) => KnowledgeEntry[];
  /** Get help for a specific field */
  getFieldHelp: (fieldId: string) => string | undefined;
  /** Trigger help for a specific question */
  askAboutQuestion: (questionId: string) => void;
  /** Pre-fill a message in the chat */
  prefillMessage: (message: string) => void;
  /** Current prefilled message (consumed by widget) */
  prefilledMessage: string | null;
  /** Clear the prefilled message */
  clearPrefilledMessage: () => void;
}

// ============================================
// CONTEXT
// ============================================

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const pathname = usePathname();
  const activeQuestionId = useFormStore((state) => state.activeQuestionId);
  
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [prefilledMessage, setPrefilledMessage] = useState<string | null>(null);

  // Get page context using our hook
  const pageContext = usePageContext({ activeQuestionId });

  // Actions
  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const searchKnowledge = useCallback((query: string): KnowledgeEntry[] => {
    return knowledgeBase.search(query, 5);
  }, []);

  const getFieldHelp = useCallback((fieldId: string): string | undefined => {
    // Search form data for the field
    const { ontarioWorksForm } = require('@/data/ontarioWorksForm');
    for (const section of ontarioWorksForm.sections) {
      const question = section.questions.find((q: any) => q.fieldId === fieldId);
      if (question) {
        return question.context;
      }
    }
    return undefined;
  }, []);

  const askAboutQuestion = useCallback((questionId: string) => {
    // Find the question
    const { ontarioWorksForm } = require('@/data/ontarioWorksForm');
    for (const section of ontarioWorksForm.sections) {
      const question = section.questions.find((q: any) => q.id === questionId);
      if (question) {
        setPrefilledMessage(`Can you explain this question: "${question.originalText}"`);
        setIsOpen(true);
        break;
      }
    }
  }, []);

  const prefillMessage = useCallback((message: string) => {
    setPrefilledMessage(message);
    setIsOpen(true);
  }, []);

  const clearPrefilledMessage = useCallback(() => {
    setPrefilledMessage(null);
  }, []);

  const value: ChatContextValue = {
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    pageContext,
    searchKnowledge,
    getFieldHelp,
    askAboutQuestion,
    prefillMessage,
    prefilledMessage,
    clearPrefilledMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

// ============================================
// HOC FOR EASY INTEGRATION
// ============================================

export function withChatContext<P extends object>(
  Component: React.ComponentType<P & { chatContext: ChatContextValue }>
) {
  return function WrappedComponent(props: P) {
    const chatContext = useChatContext();
    return <Component {...props} chatContext={chatContext} />;
  };
}
