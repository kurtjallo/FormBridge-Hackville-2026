'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChatWidget } from './ChatWidget';
import { useChatContext } from '@/context/ChatContext';

/**
 * GlobalChatWidget
 * 
 * A wrapper around ChatWidget that:
 * 1. Persists across all pages
 * 2. Automatically gets context from current page
 * 3. Integrates with the ChatContext provider
 */
export function GlobalChatWidget() {
  const pathname = usePathname();
  const { 
    isOpen, 
    openChat, 
    closeChat, 
    prefilledMessage, 
    clearPrefilledMessage 
  } = useChatContext();

  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server
  if (!mounted) {
    return null;
  }

  return (
    <ChatWidget
      pagePath={pathname}
      position="bottom-right"
      initialOpen={isOpen}
      apiEndpoint={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/support-chat`}
      onMessageSent={(message) => {
        // Analytics or logging can go here
        console.log('[Chat] Message sent:', message);
      }}
    />
  );
}
