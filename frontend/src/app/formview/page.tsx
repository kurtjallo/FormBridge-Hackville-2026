'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Send, MessageCircle, ChevronLeft, X, FileText } from 'lucide-react';
import { usePDFStore } from '@/store/pdfStore';
import { getFormById } from '@/data/sampleForms';
import { sendSupportMessage } from '@/lib/api';
import { useTranslation } from '@/i18n';
import { SidebarTabs } from '@/components/SidebarTabs';
import { FormFieldsPanel } from '@/components/FormFieldsPanel';
import { PDFFormEditor, FormField } from '@/services/pdfFormEditor';

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
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  ),
});

// Chat Types
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
}: {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  activeContext: string | null;
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
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">{t('formview.assistant.title')}</h3>
        </div>
        <p className="text-sm text-gray-600">
          {t('formview.assistant.description')}
        </p>
        {activeContext && (
          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs text-blue-600 font-medium mb-1">{t('formview.assistant.helpWith')}</p>
            <p className="text-sm text-blue-900 line-clamp-2">{activeContext}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
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
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
              >
                <span className="text-xs font-medium">
                  {message.role === 'user' ? t('formview.assistant.userLabel') : t('formview.assistant.aiLabel')}
                </span>
              </div>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
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
            placeholder={t('formview.assistant.inputPlaceholder')}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
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
  const [showContent, setShowContent] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [activeContext, setActiveContext] = useState<string | null>(null);

  // Layout State
  const [activeTab, setActiveTab] = useState<'chat' | 'fields'>('chat');
  const [formFields, setFormFields] = useState<FormField[]>([]);

  // PDF Store
  const { selectedForm, setSelectedForm, setCurrentPage } = usePDFStore();
  const [formInfo, setFormInfo] = useState<{ name: string; code: string } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('http://localhost:5001/forms/Legal/Basic-Non-Disclosure-Agreement.pdf');

  // PDF Editor Ref
  const pdfEditorRef = useRef<PDFFormEditor | null>(null);
  if (!pdfEditorRef.current) {
    pdfEditorRef.current = new PDFFormEditor();
  }

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

  // Load fields when PDF URL changes
  useEffect(() => {
    const loadPDFForm = async () => {
      try {
        await pdfEditorRef.current!.loadPDF(pdfUrl);
        const fields = pdfEditorRef.current!.getFields();
        setFormFields(fields);
        // Clean fields if none
        if (fields.length === 0) {
          if (activeTab === 'fields') setActiveTab('chat');
        }
      } catch (error) {
        console.error('Failed to load PDF form:', error);
        setFormFields([]);
      }
    };
    loadPDFForm();
  }, [pdfUrl]);

  const handleFieldChange = async (fieldName: string, value: string | boolean) => {
    await pdfEditorRef.current!.setFieldValue(fieldName, value);
    setFormFields([...pdfEditorRef.current!.getFields()]);
  };

  const handleSavePDF = async () => {
    try {
      const blob = await pdfEditorRef.current!.save();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formInfo?.name || 'form'}_filled.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error saving PDF:", e);
      alert("Could not save the PDF. Please try again.");
    }
  };

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
      setActiveTab('chat'); // Switch to chat tab
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
              <Link
                href="/select"
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={t('formview.header.back')}
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </Link>
              <div className="h-5 w-px bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                <span className="font-bold text-lg text-gray-900 tracking-tight">{t('common.nav.brand')}</span>
              </div>
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
                className="lg:hidden p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors relative"
                aria-label="Open controls"
              >
                {activeTab === 'chat' ? <MessageCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
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
              // Switch to fill tab if it exists
              if (formFields.length > 0) {
                setActiveTab('fields');
                // Optionally scroll to field in panel if possible (future enhancement)
              } else {
                // Or ask for help about this field
                setActiveContext(t('formview.assistant.contextPrefix', { fieldId }));
                setActiveTab('chat');
              }
              setShowMobileSidebar(true);
            }}
            onHelpRequest={({ selectedText }) => {
              handleTextSelectionHelp(selectedText);
            }}
          />
        </div>

        {/* Right Panel: Unified Sidebar (Desktop) */}
        <div className="hidden lg:flex w-[400px] border-l border-gray-200 flex-col bg-white shadow-xl z-10">
          <SidebarTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasFields={formFields.length > 0}
          />

          <div className="flex-1 overflow-hidden relative">
            {/* We use absolute positioning to keep state alive or just conditional rendering */}
            {activeTab === 'chat' ? (
              <AIAssistantPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                activeContext={activeContext}
              />
            ) : (
              <FormFieldsPanel
                fields={formFields}
                onFieldChange={handleFieldChange}
                onSave={handleSavePDF}
              />
            )}
          </div>
        </div>
      </main>

      {/* Mobile Drawer (Unified) */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMobileSidebar(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="font-semibold text-gray-900">
                {activeTab === 'chat' ? t('common.tabs.chat') : t('common.tabs.fields')}
              </span>
              <button onClick={() => setShowMobileSidebar(false)} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <SidebarTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              hasFields={formFields.length > 0}
            />

            <div className="flex-1 overflow-hidden">
              {activeTab === 'chat' ? (
                <AIAssistantPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  activeContext={activeContext}
                />
              ) : (
                <FormFieldsPanel
                  fields={formFields}
                  onFieldChange={handleFieldChange}
                  onSave={handleSavePDF}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
