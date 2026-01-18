'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, MessageCircle, HelpCircle, ChevronLeft, X, AlertTriangle, Info, BookOpen, FileText, AlertCircle } from 'lucide-react';

// Content item types based on the form content type system
type ContentType = 'definition' | 'instruction' | 'question' | 'warning' | 'legal';
type WarningSeverity = 'info' | 'caution' | 'critical';

interface BaseItem {
  id: string;
  originalText: string;
  context: string;
  commonConfusions: string[];
}

interface DefinitionItem extends BaseItem {
  type: 'definition';
  term: string;
}

interface InstructionItem extends BaseItem {
  type: 'instruction';
}

interface QuestionItem extends BaseItem {
  type: 'question';
  fieldId: string;
  fieldType: 'text' | 'number' | 'select' | 'textarea' | 'checkbox';
  options?: string[];
  required?: boolean;
  commonMistake?: string;
}

interface WarningItem extends BaseItem {
  type: 'warning';
  severity: WarningSeverity;
}

interface LegalItem extends BaseItem {
  type: 'legal';
  requiresAcknowledgment: boolean;
}

type ContentItem = DefinitionItem | InstructionItem | QuestionItem | WarningItem | LegalItem;

interface FormSection {
  id: string;
  title: string;
  description?: string;
  items: ContentItem[];
}

// Sample form data for demonstration (Household Information section)
const sampleFormData: FormSection = {
  id: 'household-info',
  title: 'HOUSEHOLD INFORMATION',
  description: 'Information about people living in your household',
  items: [
    {
      id: 'def-benefit-unit',
      type: 'definition',
      term: 'Benefit Unit',
      originalText: 'Benefit unit means all persons who customarily purchase and prepare food together for home consumption',
      context: 'This is a key term that determines who is included in your application',
      commonConfusions: ['Roommates are not automatically part of benefit unit', 'People who buy their own food separately are not included'],
    },
    {
      id: 'inst-spouse',
      type: 'instruction',
      originalText: 'Include your spouse or same-sex partner even if they are temporarily absent',
      context: 'This ensures all household members are properly counted',
      commonConfusions: ['Temporary absence includes hospital stays, work travel'],
    },
    {
      id: 'q-benefit-members',
      type: 'question',
      fieldId: 'benefit_unit_members',
      fieldType: 'textarea',
      originalText: 'List all members of your benefit unit',
      context: 'Include names and relationships of everyone who shares food with you',
      commonConfusions: ['Include children under 18', 'Do not include roommates who buy their own food'],
      commonMistake: 'Forgetting to include children or temporarily absent family members',
    },
    {
      id: 'warn-false-info',
      type: 'warning',
      severity: 'critical',
      originalText: 'Providing false information is an offence under the Ontario Works Act',
      context: 'All information provided must be accurate and truthful',
      commonConfusions: [],
    },
  ],
};

// Chat message type
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Content type styling configuration
const contentTypeStyles: Record<ContentType, { bg: string; border: string; text: string; icon: React.ReactNode; label: string }> = {
  definition: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: <BookOpen className="w-4 h-4" />,
    label: 'DEFINITION',
  },
  instruction: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: <AlertTriangle className="w-4 h-4" />,
    label: 'INSTRUCTION',
  },
  question: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: <HelpCircle className="w-4 h-4" />,
    label: 'QUESTION',
  },
  warning: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'WARNING',
  },
  legal: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    icon: <FileText className="w-4 h-4" />,
    label: 'LEGAL',
  },
};

// Content Item Component
function ContentItemCard({
  item,
  onHelpClick,
  isActive
}: {
  item: ContentItem;
  onHelpClick: (item: ContentItem) => void;
  isActive: boolean;
}) {
  const styles = contentTypeStyles[item.type];
  const [inputValue, setInputValue] = useState('');

  return (
    <div
      className={`rounded-xl border-2 transition-all duration-300 ${styles.border} ${styles.bg} ${
        isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
    >
      <div className="p-4">
        {/* Header with type badge and help button */}
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-2 ${styles.text}`}>
            {styles.icon}
            <span className="text-xs font-bold uppercase tracking-wider">{styles.label}</span>
          </div>
          <button
            onClick={() => onHelpClick(item)}
            className="p-1.5 rounded-lg hover:bg-white/50 transition-colors group"
            aria-label="Get help with this item"
          >
            <span className="text-gray-400 group-hover:text-gray-600 font-mono text-sm">[?]</span>
          </button>
        </div>

        {/* Content */}
        <p className="text-gray-800 text-sm leading-relaxed">
          {item.type === 'definition' && <span className="font-semibold">&quot;{item.term}&quot; - </span>}
          {item.originalText}
        </p>

        {/* Question input field */}
        {item.type === 'question' && (
          <div className="mt-4">
            {item.fieldType === 'textarea' ? (
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your answer..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none bg-white"
                rows={3}
              />
            ) : item.fieldType === 'checkbox' ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Yes, I confirm</span>
              </label>
            ) : (
              <input
                type={item.fieldType}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your answer..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// AI Assistant Panel Component
function AIAssistantPanel({
  activeItem,
  messages,
  onSendMessage,
  isLoading,
  onClose,
}: {
  activeItem: ContentItem | null;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel gets an active item
  useEffect(() => {
    if (activeItem) {
      inputRef.current?.focus();
    }
  }, [activeItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">AI ASSISTANT</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors md:hidden"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {activeItem ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium mb-1">Help with: {activeItem.type === 'definition' ? (activeItem as DefinitionItem).term : contentTypeStyles[activeItem.type].label}</p>
            <p className="text-sm text-gray-700 line-clamp-2">{activeItem.originalText}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Click any highlighted text to get help understanding it.</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !activeItem ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm">Click any <span className="font-mono text-gray-600">[?]</span> button to get help</p>
            <p className="text-xs text-gray-400 mt-1">I&apos;ll explain everything in simple terms</p>
          </div>
        ) : messages.length === 0 && activeItem ? (
          <div className="text-center text-gray-500 mt-4">
            <p className="text-sm">Ask me anything about this!</p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => onSendMessage('What does this mean?')}
                className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left"
              >
                What does this mean?
              </button>
              <button
                onClick={() => onSendMessage('Can you give me an example?')}
                className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left"
              >
                Can you give me an example?
              </button>
              <button
                onClick={() => onSendMessage('Does my situation apply?')}
                className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left"
              >
                Does my situation apply?
              </button>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <span className="text-xs font-medium">{message.role === 'user' ? 'You' : 'AI'}</span>
              </div>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
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
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
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
      <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a question..."
            disabled={isLoading || !activeItem}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || !activeItem}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
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
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Get form info from session storage
  const [formInfo, setFormInfo] = useState<{ name: string; code: string } | null>(null);

  useEffect(() => {
    setShowContent(true);
    // Get form info from session storage
    const formName = sessionStorage.getItem('selectedFormName');
    const formCode = sessionStorage.getItem('selectedFormCode');
    if (formName && formCode) {
      setFormInfo({ name: formName, code: formCode });
    }
  }, []);

  const handleHelpClick = (item: ContentItem) => {
    setActiveItem(item);
    setMessages([]); // Clear messages when switching items
    // On mobile, show the chat panel
    if (window.innerWidth < 768) {
      setShowMobileChat(true);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!activeItem) return;

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

      // Generate contextual response based on item type and user question
      if (messageText.toLowerCase().includes('what does this mean') || messageText.toLowerCase().includes('explain')) {
        if (activeItem.type === 'definition') {
          const defItem = activeItem as DefinitionItem;
          responseContent = `This is asking: Who lives with you AND shares meals?\n\nInclude:\n- Spouse/partner\n- Kids under 18\n\nDon't include:\n- Roommates who buy their own food`;
        } else if (activeItem.type === 'instruction') {
          responseContent = `This instruction means you should include your spouse or partner in your application, even if they're away temporarily (like for work, hospital stay, or visiting family).\n\nThey still count as part of your household.`;
        } else if (activeItem.type === 'question') {
          responseContent = `For this question, you need to list everyone who regularly eats meals with you and shares food expenses.\n\nTypically this includes:\n- Your spouse/partner\n- Your children\n- Any dependents\n\nDon't include roommates who buy and prepare their own food separately.`;
        } else if (activeItem.type === 'warning') {
          responseContent = `This is a serious reminder that all information you provide must be true and accurate.\n\nProviding false information could result in:\n- Loss of benefits\n- Having to pay money back\n- Legal consequences`;
        }
      } else if (messageText.toLowerCase().includes('example')) {
        if (activeItem.type === 'definition') {
          responseContent = `Example of a "Benefit Unit":\n\nMaria lives with her husband Carlos and their 2 children. They all eat dinner together and share groceries.\n\nMaria's benefit unit = Maria + Carlos + 2 children\n\nBut if Maria's brother also lives there but buys his own food and eats separately, he is NOT part of the benefit unit.`;
        } else {
          responseContent = `Here's an example:\n\nSarah's husband Tom is working in another city for 3 months. Even though he's away, she still includes him on her application because he's "temporarily absent" and will return.`;
        }
      } else if (messageText.toLowerCase().includes('situation') || messageText.toLowerCase().includes('apply')) {
        responseContent = `To help figure out if this applies to you, I'd need to know more about your specific situation.\n\nCan you tell me:\n- Who lives in your home?\n- Do you share meals and groceries with them?`;
      } else {
        responseContent = `I understand you're asking about "${activeItem.originalText.substring(0, 50)}..."\n\nCould you tell me more specifically what you'd like to know? I can:\n- Explain it in simpler terms\n- Give you an example\n- Help you figure out how it applies to you`;
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
    setActiveItem(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-200 selection:text-black">
      {/* Swiss Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#cfd1d4 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 sm:px-12 border-x border-dashed border-gray-200 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="py-6 border-b border-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/select"
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="font-bold text-xl tracking-tighter flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
              FormBridge
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {formInfo ? `${formInfo.code} - ${formInfo.name}` : 'Ontario Works Application'}
          </div>
        </nav>

        {/* Main content area */}
        <main
          className={`flex-1 py-8 transition-all duration-300 ease-out ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex gap-8">
            {/* Left Panel - Form Content */}
            <div className={`flex-1 ${showMobileChat ? 'hidden md:block' : ''}`}>
              {/* Section Header */}
              <div className="mb-6">
                <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Section 3
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter">
                  {sampleFormData.title}
                </h1>
                {sampleFormData.description && (
                  <p className="text-gray-600 mt-2">{sampleFormData.description}</p>
                )}
              </div>

              {/* Content Items */}
              <div className="space-y-4">
                {sampleFormData.items.map((item) => (
                  <ContentItemCard
                    key={item.id}
                    item={item}
                    onHelpClick={handleHelpClick}
                    isActive={activeItem?.id === item.id}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between items-center">
                <button className="px-5 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl transition-all duration-200">
                  Previous Section
                </button>
                <button className="px-6 py-3 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-600 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  Next Section
                </button>
              </div>
            </div>

            {/* Right Panel - AI Assistant (Desktop) */}
            <div className="hidden md:block w-[380px] flex-shrink-0">
              <div className="sticky top-8 h-[calc(100vh-8rem)]">
                <AIAssistantPanel
                  activeItem={activeItem}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  onClose={handleCloseChat}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Chat Panel */}
        {showMobileChat && (
          <div className="fixed inset-0 z-50 md:hidden bg-white">
            <AIAssistantPanel
              activeItem={activeItem}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onClose={handleCloseChat}
            />
          </div>
        )}

        {/* Mobile Chat FAB */}
        {!showMobileChat && activeItem && (
          <button
            onClick={() => setShowMobileChat(true)}
            className="fixed bottom-6 right-6 md:hidden p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
            aria-label="Open AI assistant"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}

        {/* Footer */}
        <footer className="py-6 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-center">
          <span>&copy; 2026 Hackville FormBridge</span>
          <div className="font-mono text-xs">
            Progress: <span className="text-green-600">Section 3 of 7</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
