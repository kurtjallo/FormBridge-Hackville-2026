/**
 * Chat System Exports
 *
 * This module exports all chat-related components, hooks, and utilities
 * for the context-aware customer support chatbot.
 */

// Components - re-export from parent directory
export { ChatWidget } from '../ChatWidget';
export type { ChatWidgetProps, ChatWidgetMessage } from '../ChatWidget';

export { GlobalChatWidget } from '../GlobalChatWidget';

// Re-export context
export { ChatProvider, useChatContext, withChatContext } from '@/context/ChatContext';
export type { ChatContextValue, ChatProviderProps } from '@/context/ChatContext';
