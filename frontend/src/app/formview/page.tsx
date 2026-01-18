'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Send, MessageCircle, ChevronLeft, X } from 'lucide-react';
import { usePDFStore } from '@/store/pdfStore';
import { getFormById } from '@/data/sampleForms';
import { sendSupportMessage } from '@/lib/api';
import { useTranslation } from '@/i18n';
import { Logo } from '@/components/Logo';

// Helper to resolve PDF URLs
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
function resolvePdfUrl(url: string): string {
  if (url.startsWith('/api/')) {
    return `${API_URL}${url}`;
  }
  return url;
}

// Dynamic import for PDF Viewer
const PDFFormViewer = dynamic(() => import('@/components/PDFFormViewer').then(mod => mod.PDFFormViewer), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
    </div>
  ),
});

// Maple the Moose mascot component
function MapleMoose({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-md flex-shrink-0 border-2 border-white`}>
      <svg viewBox="0 0 100 100" className="w-3/4 h-3/4">
        {/* Antlers */}
        <path d="M25 35 L20 20 L25 25 L22 10 L28 22 L30 15 L32 25 L35 30" fill="#8B4513" stroke="#5D3A1A" strokeWidth="2"/>
        <path d="M75 35 L80 20 L75 25 L78 10 L72 22 L70 15 L68 25 L65 30" fill="#8B4513" stroke="#5D3A1A" strokeWidth="2"/>
        {/* Ears */}
        <ellipse cx="28" cy="42" rx="8" ry="6" fill="#D2691E"/>
        <ellipse cx="72" cy="42" rx="8" ry="6" fill="#D2691E"/>
        {/* Face */}
        <ellipse cx="50" cy="55" rx="25" ry="22" fill="#D2691E"/>
        {/* Muzzle */}
        <ellipse cx="50" cy="65" rx="12" ry="10" fill="#DEB887"/>
        {/* Nose */}
        <ellipse cx="50" cy="62" rx="6" ry="4" fill="#2C1810"/>
        {/* Eyes */}
        <circle cx="40" cy="50" r="4" fill="#2C1810"/>
        <circle cx="60" cy="50" r="4" fill="#2C1810"/>
        <circle cx="41" cy="49" r="1.5" fill="white"/>
        <circle cx="61" cy="49" r="1.5" fill="white"/>
        {/* Friendly smile */}
        <path d="M44 70 Q50 75 56 70" fill="none" stroke="#2C1810" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

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
  activeContext,
  onClose,
}: {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  activeContext: string | null;
  onClose?: () => void;
}) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header Info */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapleMoose className="w-8 h-8" />
            <span className="font-semibold text-gray-900">{t('formview.assistant.title')}</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
              aria-label={t('formview.assistant.closeAssistant')}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {t('formview.assistant.description')}
        </p>
        {activeContext && (
          <div className="mt-3 bg-purple-50 border border-purple-100 rounded-lg p-3">
            <p className="text-xs text-purple-900 font-medium mb-1">{t('formview.assistant.helpWith')}</p>
            <p className="text-sm text-purple-900 line-clamp-2">{activeContext}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MapleMoose className="w-16 h-16 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              {t('formview.assistant.emptyTitle')}
            </p>
            <p className="text-xs text-gray-500 mt-1">{t('formview.assistant.emptySubtitle')}</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {message.role === 'user' ? (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-900 text-white">
                  <span className="text-xs font-medium">{t('formview.assistant.userLabel')}</span>
                </div>
              ) : (
                <MapleMoose className="w-8 h-8" />
              )}
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${message.role === 'user'
                  ? 'bg-purple-900 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <MapleMoose className="w-8 h-8" />
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
            placeholder={t('formview.assistant.inputPlaceholder')}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 bg-purple-900 text-white rounded-full hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={t('formview.assistant.sendMessage')}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function FormViewPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [activeContext, setActiveContext] = useState<string | null>(null);


  // PDF Store
  const { selectedForm, setSelectedForm, setCurrentPage } = usePDFStore();
  const [formInfo, setFormInfo] = useState<{ name: string; code: string } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('http://localhost:5001/forms/Legal/Basic-Non-Disclosure-Agreement.pdf');

  // Load PDF logic
  useEffect(() => {
    setShowContent(true);
    setCurrentPage(1);

    const formName = sessionStorage.getItem('selectedFormName');
    const formCode = sessionStorage.getItem('selectedFormCode');
    const formId = sessionStorage.getItem('selectedFormId');
    const storedPdfUrl = sessionStorage.getItem('selectedFormPdfUrl');

    if (storedPdfUrl) {
      setPdfUrl(resolvePdfUrl(storedPdfUrl));
      if (formName && formCode) setFormInfo({ name: formName, code: formCode });
    } else if (formId) {
      const form = getFormById(formId);
      if (form) {
        setSelectedForm(form);
        setPdfUrl(resolvePdfUrl(form.pdfUrl));
        setFormInfo({ name: form.name, code: form.id.toUpperCase() });
      }
    } else if (formName && formCode) {
      setFormInfo({ name: formName, code: formCode });
    } else if (selectedForm) {
      setPdfUrl(resolvePdfUrl(selectedForm.pdfUrl));
      setFormInfo({ name: selectedForm.name, code: selectedForm.id.toUpperCase() });
    }
  }, [selectedForm, setSelectedForm, setCurrentPage]);


  const handleSendMessage = async (messageText: string) => {
    const userMessage: ChatMessage = { role: 'user', content: messageText, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({ role: msg.role, content: msg.content }));
      const additionalContext = activeContext
        ? `User is currently looking at: ${activeContext}. Form: ${formInfo?.name || 'PDF Form'}`
        : `User is viewing: ${formInfo?.name || 'PDF Form'}`;

      const response = await sendSupportMessage({
        message: messageText,
        conversationHistory,
        pagePath: '/formview',
        additionalContext,
      });

      const assistantMessage: ChatMessage = { role: 'assistant', content: response.message, timestamp: Date.now() };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage: ChatMessage = { role: 'assistant', content: t('formview.assistant.connectionError'), timestamp: Date.now() };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelectionHelp = useCallback(
    (selectedText: string) => {
      const displayText = selectedText.length > 200 ? selectedText.substring(0, 200) + '...' : selectedText;
      setActiveContext(displayText);
      setShowMobileSidebar(true);

      window.getSelection()?.removeAllRanges();
      const helpMessage = t('formview.assistant.helpRequest', { text: selectedText });
      handleSendMessage(helpMessage);
    },
    [t]
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  // Update session storage to go back to form-select step, not language
                  const saved = sessionStorage.getItem('formbridge_onboarding');
                  let data;
                  if (saved) {
                    try {
                      data = JSON.parse(saved);
                    } catch (e) {
                      console.error('Failed to parse session:', e);
                      data = {};
                    }
                  } else {
                    data = {};
                  }
                  // Always set currentStep to form-select and mark previous steps as completed
                  data.currentStep = 'form-select';
                  data.completedSteps = ['language', 'name', 'intro', 'review', 'category-select'];
                  // Preserve selectedCategory if not already set - try to get it from selectedForm
                  if (!data.selectedCategory && selectedForm) {
                    // Try to infer category from the form
                    const formId = sessionStorage.getItem('selectedFormId');
                    if (formId) {
                      // Default to legal if we can't determine
                      if (formId.includes('nda') || formId.includes('contract') || formId.includes('attorney')) {
                        data.selectedCategory = 'legal';
                      } else if (formId.includes('cra') || formId.includes('tax') || formId.includes('ontario-works') || formId.includes('gst')) {
                        data.selectedCategory = 'finance';
                      } else if (formId.includes('oinp') || formId.includes('immigration')) {
                        data.selectedCategory = 'immigration';
                      } else {
                        data.selectedCategory = 'legal'; // fallback
                      }
                    }
                  }
                  sessionStorage.setItem('formbridge_onboarding', JSON.stringify(data));
                  router.push('/select');
                }}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                aria-label={t('formview.header.back')}
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div className="h-5 w-px bg-gray-200 hidden sm:block" />
              <Logo size="lg" textClassName="font-bold text-xl text-gray-900 tracking-tight" />
            </div>

            <div className="text-sm text-gray-500 hidden sm:block font-medium">
              {formInfo ? `${formInfo.code} - ${formInfo.name}` : t('formview.header.viewerTitle')}
            </div>

            <div className="flex items-center gap-2">
              {selectedForm?.isXFA && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                  {t('pdf.xfa.badge')}
                </span>
              )}

              {/* Mobile Sidebar Toggle */}
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="lg:hidden p-2 bg-purple-900 hover:bg-black text-white rounded-lg transition-colors"
                aria-label={t('formview.assistant.openAssistant')}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 min-h-0 flex flex-col lg:flex-row transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>

        {/* Left Panel: PDF Viewer */}
        <div className="flex-1 min-h-0 flex flex-col relative">
          <PDFFormViewer
            pdfUrl={pdfUrl}
            onFieldClick={(fieldId) => {
              // Ask for help about this field
              setActiveContext(t('formview.assistant.contextPrefix', { fieldId }));
              setShowMobileSidebar(true);
            }}
            onHelpRequest={({ selectedText }) => {
              handleTextSelectionHelp(selectedText);
            }}
          />
        </div>

        {/* Right Panel: AI Assistant (Desktop) */}
        <div className="hidden lg:flex w-[400px] border-l border-gray-200 flex-col bg-white shadow-xl z-10">
          <AIAssistantPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            activeContext={activeContext}
          />
        </div>
      </main>

      {/* Mobile Drawer - AI Assistant */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMobileSidebar(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <AIAssistantPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              activeContext={activeContext}
              onClose={() => setShowMobileSidebar(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
