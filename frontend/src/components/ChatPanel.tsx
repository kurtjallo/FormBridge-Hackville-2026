'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormStore } from '@/store/formStore';
import { usePDFStore } from '@/store/pdfStore';
import { ontarioWorksForm } from '@/data/ontarioWorksForm';
import { ChatMessage } from './ChatMessage';
import { QuickActions } from './QuickActions';
import { SuggestionButton } from './SuggestionButton';
import { chatWithAI } from '@/lib/api';
import { ChatMessage as ChatMessageType, FormQuestion } from '@/types';
import { X, Send, MessageCircle, ChevronLeft } from 'lucide-react';
import { useTranslation } from '@/i18n';

export function ChatPanel() {
  const { t } = useTranslation();
  const { colorblindMode } = usePDFStore();
  const activeQuestionId = useFormStore((state) => state.activeQuestionId);
  const setActiveQuestion = useFormStore((state) => state.setActiveQuestion);
  const conversations = useFormStore((state) => state.conversations);
  const addMessage = useFormStore((state) => state.addMessage);
  const answers = useFormStore((state) => state.answers);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [latestSuggestion, setLatestSuggestion] = useState<{
    answer: string;
    confidence?: 'low' | 'medium' | 'high';
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find the active question from form data
  const activeQuestion: FormQuestion | undefined = activeQuestionId
    ? ontarioWorksForm.sections
        .flatMap((s) => s.questions)
        .find((q) => q.id === activeQuestionId)
    : undefined;

  const messages = activeQuestionId ? conversations[activeQuestionId] || [] : [];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (activeQuestionId) {
      inputRef.current?.focus();
    }
  }, [activeQuestionId]);

  // Clear suggestion when question changes
  useEffect(() => {
    setLatestSuggestion(null);
  }, [activeQuestionId]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !activeQuestion || !activeQuestionId) return;

    // Add user message
    const userMessage: ChatMessageType = {
      role: 'user',
      content: messageText.trim(),
      timestamp: Date.now(),
    };
    addMessage(activeQuestionId, userMessage);
    setInputValue('');
    setIsLoading(true);
    setLatestSuggestion(null);

    try {
      // Prepare conversation history for API (exclude timestamps)
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await chatWithAI({
        questionId: activeQuestionId,
        originalText: activeQuestion.originalText,
        fieldType: activeQuestion.fieldType,
        context: activeQuestion.context,
        conversationHistory,
        userMessage: messageText.trim(),
        currentAnswers: answers as Record<string, string | number | boolean>,
      });

      // Add assistant message
      const assistantMessage: ChatMessageType = {
        role: 'assistant',
        content: response.message,
        suggestedAnswer: response.suggestedAnswer,
        confidence: response.confidence,
        timestamp: Date.now(),
      };
      addMessage(activeQuestionId, assistantMessage);

      // Update latest suggestion if present
      if (response.suggestedAnswer) {
        setLatestSuggestion({
          answer: response.suggestedAnswer,
          confidence: response.confidence,
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessageType = {
        role: 'assistant',
        content: t('chat.panel.connectionError'),
        timestamp: Date.now(),
      };
      addMessage(activeQuestionId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (message: string) => {
    sendMessage(message);
  };

  if (!activeQuestionId || !activeQuestion) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 md:inset-auto md:bottom-0 md:right-0 w-full md:w-[420px] h-full md:h-[600px] bg-white border-l border-t border-gray-200 shadow-xl flex flex-col z-50"
      data-colorblind-mode={colorblindMode !== 'none' ? colorblindMode : undefined}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 pt-safe">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveQuestion(null)}
              className="md:hidden p-1 hover:bg-gray-200 rounded-full transition-colors mr-2"
              aria-label={t('chat.panel.backToForm')}
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <MessageCircle 
              className="w-5 h-5" 
              style={{ color: 'var(--highlight-primary)' }}
            />
            <span className="font-medium text-gray-900">{t('chat.panel.title')}</span>
          </div>
          <button
            onClick={() => setActiveQuestion(null)}
            className="hidden md:block p-1 hover:bg-gray-200 rounded-full transition-colors"
            aria-label={t('chat.panel.closeChat')}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div 
          className="rounded-lg p-3 border"
          style={{ 
            backgroundColor: 'var(--highlight-bg)',
            borderColor: 'var(--highlight-border)'
          }}
        >
          <p 
            className="text-xs font-medium mb-1"
            style={{ color: 'var(--highlight-text)' }}
          >
            {t('chat.panel.currentQuestion')}
          </p>
          <p className="text-sm text-gray-800">{activeQuestion.originalText}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm">{t('chat.panel.emptyTitle')}</p>
            <p className="text-xs text-gray-400 mt-1">
              {t('chat.panel.emptySubtitle')}
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 text-xs">{t('chat.panel.aiLabel')}</span>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion button */}
      {latestSuggestion && (
        <div className="px-4 pb-2">
          <SuggestionButton
            fieldId={activeQuestion.fieldId}
            suggestion={latestSuggestion.answer}
            confidence={latestSuggestion.confidence}
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="px-4 pb-2">
        <QuickActions onAction={handleQuickAction} disabled={isLoading} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-4 pb-safe">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('chat.panel.inputPlaceholder')}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-base"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 text-white rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
            style={{ backgroundColor: !inputValue.trim() || isLoading ? undefined : 'var(--highlight-primary)' }}
            aria-label={t('chat.panel.sendMessage')}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
