'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, MessageCircle, Minimize2, Maximize2, HelpCircle, Sparkles } from 'lucide-react';
import { knowledgeBase, KnowledgeEntry } from '@/lib/knowledgeBase';
import { useTranslation } from '@/i18n';

// ============================================
// TYPES
// ============================================

export interface ChatWidgetMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  suggestions?: string[];
  knowledgeUsed?: string[];  // IDs of knowledge entries used
}

export interface ChatWidgetProps {
  /** Current page path for context awareness */
  pagePath?: string;
  /** Custom welcome message */
  welcomeMessage?: string;
  /** Position of the widget */
  position?: 'bottom-right' | 'bottom-left';
  /** Initial open state */
  initialOpen?: boolean;
  /** Custom CSS class for the widget */
  className?: string;
  /** Callback when a message is sent */
  onMessageSent?: (message: string) => void;
  /** API endpoint for chat (defaults to /api/support-chat) */
  apiEndpoint?: string;
  /** Additional context to include in all requests */
  additionalContext?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ChatWidget({
  pagePath = '/',
  welcomeMessage,
  position = 'bottom-right',
  initialOpen = false,
  className = '',
  onMessageSent,
  apiEndpoint = '/api/support-chat',
  additionalContext,
}: ChatWidgetProps) {
  const { t } = useTranslation();

  const fallbackResponses = [
    t('chat.widget.fallbackResponses.one'),
    t('chat.widget.fallbackResponses.two'),
    t('chat.widget.fallbackResponses.three'),
  ];

  const quickSuggestions = [
    t('chat.widget.quickSuggestions.documents'),
    t('chat.widget.quickSuggestions.eligibility'),
    t('chat.widget.quickSuggestions.timeline'),
    t('chat.widget.quickSuggestions.commonLaw'),
  ];

  const unknownSuggestions = [
    t('chat.widget.unknownSuggestions.eligibility'),
    t('chat.widget.unknownSuggestions.assetLimits'),
    t('chat.widget.unknownSuggestions.benefitUnit'),
  ];

  const baseWelcomeMessage = welcomeMessage || t('chat.widget.welcomeMessage');

  // State
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatWidgetMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Clear unread count when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const pageKnowledge = knowledgeBase.getPageKnowledge(pagePath);
      const pageContext = knowledgeBase.getPageContext(pagePath);
      
      let contextualWelcome = baseWelcomeMessage;
      if (pageContext && pageContext.title !== 'Home') {
        contextualWelcome = t('chat.widget.contextualWelcome', {
          title: pageContext.title,
          description: pageContext.description,
        });
      }

      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: contextualWelcome,
        timestamp: Date.now(),
        suggestions: quickSuggestions,
        knowledgeUsed: pageKnowledge.map(k => k.id).slice(0, 3),
      }]);
    }
  }, [isOpen, messages.length, pagePath, baseWelcomeMessage, quickSuggestions, t]);

  /**
   * Determine if the bot should admit it doesn't know
   */
  const shouldAdmitUnknown = useCallback((query: string): boolean => {
    const results = knowledgeBase.search(query, 3);
    // If no relevant results found, or scores are too low
    return results.length === 0;
  }, []);

  /**
   * Get a fallback response for unknown questions
   */
  const getFallbackResponse = useCallback((): string => {
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }, [fallbackResponses]);

  /**
   * Generate local response using knowledge base (fallback if API fails)
   */
  const generateLocalResponse = useCallback((query: string): ChatWidgetMessage => {
    const queryLower = query.toLowerCase();
    
    // Check for navigation help
    if (queryLower.includes('where') || queryLower.includes('find') || queryLower.includes('how do i')) {
      const navGuides = knowledgeBase.getByCategory('navigation');
      const relevant = navGuides.find(g => 
        g.keywords.some(k => queryLower.includes(k))
      );
      if (relevant) {
        return {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: relevant.content,
          timestamp: Date.now(),
          knowledgeUsed: [relevant.id],
        };
      }
    }

    // Search knowledge base
    const results = knowledgeBase.search(query, 3);
    
    if (results.length === 0) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getFallbackResponse(),
        timestamp: Date.now(),
        suggestions: unknownSuggestions,
      };
    }

    // Build response from knowledge
    const topResult = results[0];
    let content = topResult.content;

    // Add related information if available
    if (results.length > 1 && results[1].category === topResult.category) {
      content += `\n\n${t('chat.widget.relatedLabel')} ${results[1].title} - ${results[1].content.slice(0, 100)}...`;
    }

    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
      knowledgeUsed: results.map(r => r.id),
      suggestions: results[0].relatedEntries?.slice(0, 2).map(id => {
        const entry = knowledgeBase.getEntry(id);
        return entry ? t('chat.widget.tellMeAbout', { topic: entry.title.toLowerCase() }) : '';
      }).filter(Boolean),
    };
  }, [getFallbackResponse, t, unknownSuggestions]);

  /**
   * Send message to AI backend
   */
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatWidgetMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowSuggestions(false);
    setIsLoading(true);
    onMessageSent?.(messageText.trim());

    try {
      // Build context from knowledge base
      const kbContext = knowledgeBase.buildContextForAI(messageText, pagePath);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText.trim(),
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
          pagePath,
          knowledgeContext: kbContext,
          additionalContext,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      const assistantMessage: ChatWidgetMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
        suggestions: data.suggestions,
        knowledgeUsed: data.knowledgeUsed,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Chat API error:', error);
      // Fallback to local knowledge base response
      const localResponse = generateLocalResponse(messageText);
      setMessages(prev => [...prev, localResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const positionClasses = position === 'bottom-right' 
    ? 'right-4 md:right-6' 
    : 'left-4 md:left-6';

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 md:bottom-6 ${positionClasses} z-50 
          bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 
          shadow-lg hover:shadow-xl transition-all duration-200
          flex items-center gap-2 group ${className}`}
        aria-label={t('chat.widget.openAssistant')}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-200 whitespace-nowrap">
          {t('chat.widget.needHelp')}
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
            rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 md:bottom-6 ${positionClasses} z-50 ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 
            shadow-lg flex items-center gap-2 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{t('chat.widget.chatLabel')}</span>
          <Maximize2 className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 
              flex items-center justify-center ml-1">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Full chat widget
  return (
    <div 
      className={`fixed bottom-0 ${position === 'bottom-right' ? 'right-0' : 'left-0'} 
        md:bottom-6 ${positionClasses} z-50 
        w-full md:w-[400px] h-[100dvh] md:h-[550px] md:max-h-[80vh]
        bg-white md:rounded-2xl shadow-2xl flex flex-col overflow-hidden
        border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">{t('chat.widget.assistantTitle')}</h3>
              <p className="text-xs text-blue-100">{t('chat.widget.assistantSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors hidden md:block"
              aria-label={t('chat.widget.minimizeChat')}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label={t('chat.widget.closeChat')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Knowledge source indicator */}
              {message.knowledgeUsed && message.knowledgeUsed.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200/50">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    {t('chat.widget.basedOn')} {message.knowledgeUsed.map(id => {
                      const entry = knowledgeBase.getEntry(id);
                      return entry?.title;
                    }).filter(Boolean).slice(0, 2).join(', ')}
                  </p>
                </div>
              )}

              {/* Inline suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 
                        px-3 py-1.5 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                  style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                  style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                  style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions (shown initially) */}
      {showSuggestions && messages.length <= 1 && (
        <div className="px-4 py-2 bg-white border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">{t('chat.widget.quickQuestions')}</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 
                  px-3 py-1.5 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form 
        onSubmit={handleSubmit} 
        className="px-4 py-3 bg-white border-t border-gray-200"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('chat.widget.inputPlaceholder')}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-full 
              focus:ring-2 focus:ring-blue-500 focus:bg-white
              disabled:bg-gray-200 text-sm transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 bg-blue-600 text-white rounded-full 
              hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed 
              transition-colors flex items-center justify-center"
            aria-label={t('chat.widget.sendMessage')}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
