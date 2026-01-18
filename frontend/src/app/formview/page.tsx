'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Send, MessageCircle, ChevronLeft, X } from 'lucide-react';
import { usePDFStore } from '@/store/pdfStore';
import { getFormById } from '@/data/sampleForms';
import { sendSupportMessage } from '@/lib/api';
// Text selection is now handled directly in PDFViewer via onHelpRequest callback
import { StructuredHelpMessage } from '@/components/StructuredHelpMessage';

// Helper to resolve PDF URLs - handles both absolute and relative API paths
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
function resolvePdfUrl(url: string): string {
  if (url.startsWith('/api/')) {
    return `${API_URL}${url}`;
  }
  return url;
}

// Dynamic import to avoid SSR issues with react-pdf
const PDFViewer = dynamic(() => import('@/components/PDFViewer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  ),
});

// Chat message type
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  structured?: {
    interpretation: string;
    breakdown: string[];
    suggestedQuestions: string[];
  };
}

// AI Assistant Panel Component
function AIAssistantPanel({
  messages,
  onSendMessage,
  isLoading,
  onClose,
  activeContext,
}: {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onClose: () => void;
  activeContext: string | null;
}) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">AI ASSISTANT</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Click any highlighted text to get help understanding it.
        </p>
        {activeContext && (
          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium mb-1">Help with:</p>
            <p className="text-sm text-blue-900 line-clamp-2">{activeContext}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-600">Click any <span className="font-mono text-gray-500 bg-gray-100 px-1 rounded">[?]</span> button to get help</p>
            <p className="text-xs text-gray-500 mt-1">I&apos;ll explain everything in simple terms</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
              >
                <span className="text-xs font-medium">{message.role === 'user' ? 'You' : 'AI'}</span>
              </div>
              <div
                className={`max-w-[85%] ${message.role === 'user'
                  ? 'bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-md'
                  : 'bg-gray-100 rounded-2xl rounded-bl-md overflow-hidden'
                  }`}
              >
                {message.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                ) : message.structured ? (
                  <div className="px-4 py-3">
                    <StructuredHelpMessage
                      interpretation={message.structured.interpretation}
                      breakdown={message.structured.breakdown}
                      suggestedQuestions={message.structured.suggestedQuestions}
                      onQuestionClick={(question) => onSendMessage(question)}
                    />
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap px-4 py-2 text-gray-800">{message.content}</p>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-600 text-xs">AI</span>
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

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a question..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function FormViewPage() {
  const [showContent, setShowContent] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [activeContext, setActiveContext] = useState<string | null>(null);
  const [formInfo, setFormInfo] = useState<{ name: string; code: string } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('http://localhost:5001/forms/Legal/Basic-Non-Disclosure-Agreement.pdf');

  // PDF container ref for text selection
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Text selection hook with auto-trigger
  const handleAutoSelectionHelp = useCallback(
    (text: string) => {
      // Truncate very long selections for display
      const displayText = text.length > 200 ? text.substring(0, 200) + '...' : text;
      setActiveContext(displayText);

      // Create the help request message
      const helpMessage = `Can you help me understand this text from the form?\n\n"${text}"`;

      // Add user message immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content: helpMessage,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Clear the selection
      window.getSelection()?.removeAllRanges();

      // On mobile, open the chat panel
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setShowMobileChat(true);
      }

      // Call the API
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const additionalContext = `User selected text: "${displayText}". Form: ${formInfo?.name || 'PDF Form'}`;

      sendSupportMessage({
        message: helpMessage,
        conversationHistory,
        pagePath: '/formview',
        additionalContext,
      })
        .then((response) => {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: response.message,
            timestamp: Date.now(),
            structured: response.structured,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        })
        .catch((error) => {
          console.error('Chat API error:', error);
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: "I'm having trouble connecting right now. Please try again in a moment.",
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [messages, formInfo?.name]
  );

  // Text selection is now handled via onHelpRequest callback in PDFViewer

  // PDF store
  const { selectedForm, setSelectedForm, setCurrentPage } = usePDFStore();

  useEffect(() => {
    setShowContent(true);
    // Always start on page 1 when loading a new PDF
    setCurrentPage(1);

    // Try to get form info from session storage
    const formName = sessionStorage.getItem('selectedFormName');
    const formCode = sessionStorage.getItem('selectedFormCode');
    const formId = sessionStorage.getItem('selectedFormId');
    const storedPdfUrl = sessionStorage.getItem('selectedFormPdfUrl');

    // If we have a PDF URL stored directly, use it (most reliable)
    if (storedPdfUrl) {
      setPdfUrl(resolvePdfUrl(storedPdfUrl));
      if (formName && formCode) {
        setFormInfo({ name: formName, code: formCode });
      }
      return; // Exit early - we have what we need
    }

    // If we have a form ID, try to load it from sampleForms
    if (formId) {
      const form = getFormById(formId);
      if (form) {
        setSelectedForm(form);
        setPdfUrl(resolvePdfUrl(form.pdfUrl));
        setFormInfo({
          name: form.name,
          code: form.id.toUpperCase(),
        });
        return; // Exit early to use the selected form
      }
    }

    // Fallback to session storage values for display info only
    if (formName && formCode) {
      setFormInfo({ name: formName, code: formCode });
    }

    // If we already have a selected form in the store, use it
    if (selectedForm) {
      setPdfUrl(resolvePdfUrl(selectedForm.pdfUrl));
      setFormInfo({
        name: selectedForm.name,
        code: selectedForm.id.toUpperCase(),
      });
    }
  }, [selectedForm, setSelectedForm, setCurrentPage]);

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: messageText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Build conversation history for context
        const conversationHistory = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Build additional context from active field/form
        const additionalContext = activeContext
          ? `User is currently looking at: ${activeContext}. Form: ${formInfo?.name || 'PDF Form'}`
          : `User is viewing: ${formInfo?.name || 'PDF Form'}`;

        // Call the real Gemini-powered API
        const response = await sendSupportMessage({
          message: messageText,
          conversationHistory,
          pagePath: '/formview',
          additionalContext,
        });

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: Date.now(),
          structured: response.structured,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Chat API error:', error);
        // Fallback response on error
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment, or check that the backend server is running.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, activeContext, formInfo?.name]
  );

  const handleCloseChat = () => {
    setShowMobileChat(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/select"
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </Link>
              <div className="h-5 w-px bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                <span className="font-bold text-lg text-gray-900 tracking-tight">FormBridge</span>
              </div>
            </div>

            <div className="text-sm text-gray-500 hidden sm:block">
              {formInfo ? `${formInfo.code} - ${formInfo.name}` : 'PDF Form Viewer'}
            </div>

            <div className="flex items-center gap-2">
              {selectedForm?.isXFA && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                  XFA Form
                </span>
              )}
              <button
                onClick={() => setShowMobileChat(true)}
                className="lg:hidden p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                aria-label="Open AI assistant"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content - Dual Panel */}
      <main
        className={`flex-1 min-h-0 flex flex-col lg:flex-row transition-all duration-300 ease-out ${showContent ? 'opacity-100' : 'opacity-0'
          }`}
      >
        {/* Left Panel - PDF Viewer */}
        <div className="flex-1 min-h-0 flex flex-col">
          <PDFViewer
            ref={pdfContainerRef}
            pdfUrl={pdfUrl}
            onFieldClick={(fieldId) => {
              setActiveContext(`Form field: ${fieldId}`);
              if (window.innerWidth < 1024) {
                setShowMobileChat(true);
              }
            }}
            onHelpRequest={({ selectedText }) => {
              console.log('Help requested for:', selectedText);
              handleAutoSelectionHelp(selectedText);
            }}
          />
        </div>

        {/* Right Panel - AI Assistant (Desktop) */}
        <div className="hidden lg:flex w-96 min-h-0 border-l border-gray-200 flex-col bg-white">
          <AIAssistantPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onClose={handleCloseChat}
            activeContext={activeContext}
          />
        </div>
      </main>

      {/* Mobile Chat Panel */}
      {showMobileChat && (
        <div className="fixed inset-0 z-50 lg:hidden bg-white">
          <AIAssistantPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onClose={handleCloseChat}
            activeContext={activeContext}
          />
        </div>
      )}

    </div>
  );
}
