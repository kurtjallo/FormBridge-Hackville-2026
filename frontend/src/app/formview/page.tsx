'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Send, MessageCircle, ChevronLeft, X } from 'lucide-react';
import { usePDFStore } from '@/store/pdfStore';
import { getFormById } from '@/data/sampleForms';

// Dynamic import to avoid SSR issues with react-pdf
const PDFViewer = dynamic(() => import('@/components/PDFViewer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  ),
});

// Chat message type
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
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
    <div className="h-full flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-white">AI ASSISTANT</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors lg:hidden"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-400">
          Click any highlighted text to get help understanding it.
        </p>
        {activeContext && (
          <div className="mt-3 bg-gray-800 border border-gray-700 rounded-lg p-3">
            <p className="text-xs text-blue-400 font-medium mb-1">Help with:</p>
            <p className="text-sm text-gray-300 line-clamp-2">{activeContext}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-700 mb-3" />
            <p className="text-sm text-gray-400">Click any <span className="font-mono text-gray-300">[?]</span> button to get help</p>
            <p className="text-xs text-gray-500 mt-1">I&apos;ll explain everything in simple terms</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                <span className="text-xs font-medium">{message.role === 'user' ? 'You' : 'AI'}</span>
              </div>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-800 text-gray-200 rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-300 text-xs">AI</span>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a question..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-800 disabled:cursor-not-allowed text-sm placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
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

  // PDF store
  const { selectedForm, setSelectedForm } = usePDFStore();

  // Get form info from session storage or use default
  const [formInfo, setFormInfo] = useState<{ name: string; code: string } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('/forms/ontario-works.pdf');

  useEffect(() => {
    setShowContent(true);

    // Try to get form info from session storage
    const formName = sessionStorage.getItem('selectedFormName');
    const formCode = sessionStorage.getItem('selectedFormCode');
    const formId = sessionStorage.getItem('selectedFormId');

    if (formName && formCode) {
      setFormInfo({ name: formName, code: formCode });
    }

    // If we have a form ID, try to load it
    if (formId) {
      const form = getFormById(formId);
      if (form) {
        setSelectedForm(form);
        setPdfUrl(form.pdfUrl);
      }
    }

    // If we already have a selected form in the store, use it
    if (selectedForm) {
      setPdfUrl(selectedForm.pdfUrl);
      setFormInfo({
        name: selectedForm.name,
        code: selectedForm.id.toUpperCase(),
      });
    }
  }, [selectedForm, setSelectedForm]);

  const handleSendMessage = async (messageText: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response (in production, this would call the API)
    setTimeout(() => {
      let responseContent = '';

      if (messageText.toLowerCase().includes('what') || messageText.toLowerCase().includes('explain')) {
        responseContent = `Let me explain this in simple terms:\n\nThis section of the form is asking for information about your situation. Take your time filling it out - you can always ask me for help with specific questions.\n\nWould you like me to explain any particular field?`;
      } else if (messageText.toLowerCase().includes('example')) {
        responseContent = `Here's an example:\n\nIf you're asked about your income, include:\n- Your job earnings\n- Any government benefits\n- Money from other sources\n\nWould you like more specific examples?`;
      } else if (messageText.toLowerCase().includes('help')) {
        responseContent = `I'm here to help! You can:\n\n1. Click on any form field to get an explanation\n2. Ask me what specific terms mean\n3. Request examples for any question\n\nWhat would you like help with?`;
      } else {
        responseContent = `I understand you're asking about this form. Let me help you understand it better.\n\nCould you tell me more specifically what you'd like to know? I can:\n- Explain terms in simple language\n- Give you examples\n- Help you figure out what to write`;
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleCloseChat = () => {
    setShowMobileChat(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/select"
                className="p-2 -ml-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div className="h-5 w-px bg-gray-700 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                <span className="font-bold text-lg text-white tracking-tight">FormBridge</span>
              </div>
            </div>

            <div className="text-sm text-gray-400 hidden sm:block">
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
        className={`flex-1 flex flex-col lg:flex-row transition-all duration-300 ease-out ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Left Panel - PDF Viewer */}
        <div className="flex-1 min-h-0 flex flex-col">
          <PDFViewer
            pdfUrl={pdfUrl}
            onFieldClick={(fieldId) => {
              setActiveContext(`Form field: ${fieldId}`);
              if (window.innerWidth < 1024) {
                setShowMobileChat(true);
              }
            }}
          />
        </div>

        {/* Right Panel - AI Assistant (Desktop) */}
        <div className="hidden lg:flex w-96 border-l border-gray-800 flex-col">
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
        <div className="fixed inset-0 z-50 lg:hidden bg-gray-900">
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
