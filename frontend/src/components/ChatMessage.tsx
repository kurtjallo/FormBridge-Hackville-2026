import { ChatMessage as ChatMessageType } from '@/types';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'text-white' : 'bg-gray-200'
        }`}
        style={isUser ? { backgroundColor: 'var(--highlight-primary)' } : undefined}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4 text-gray-600" />
        )}
      </div>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          isUser
            ? 'text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}
        style={isUser ? { backgroundColor: 'var(--highlight-primary)' } : undefined}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
