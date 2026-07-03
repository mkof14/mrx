import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../services/apiClient';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ts?: string;
  groundingLinks?: { title: string; uri: string }[];
}

interface ChatHistoryContextValue {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  appendExchange: (userText: string, assistantText: string) => void;
  replaceMessages: (next: ChatMessage[]) => void;
  saveMessages: (next: ChatMessage[]) => void;
  historyForApi: () => ChatMessage[];
}

const ChatHistoryContext = createContext<ChatHistoryContextValue | null>(null);

export function ChatHistoryProvider({
  initialMessages = [],
  greeting,
  children
}: {
  initialMessages?: ChatMessage[];
  greeting: string;
  children: React.ReactNode;
}) {
  const seeded =
    initialMessages.length > 0
      ? initialMessages
      : [{ role: 'assistant' as const, content: greeting, ts: new Date().toISOString() }];

  const [messages, setMessages] = useState<ChatMessage[]>(seeded);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
      hydrated.current = true;
    }
  }, [initialMessages]);

  const persist = useCallback((next: ChatMessage[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.data.saveChatMessages(next).catch(() => undefined);
    }, 600);
  }, []);

  const replaceMessages = useCallback(
    (next: ChatMessage[]) => {
      setMessages(next);
      persist(next);
    },
    [persist]
  );

  const appendExchange = useCallback(
    (userText: string, assistantText: string) => {
      setMessages((prev) => {
        const next = [
          ...prev,
          { role: 'user' as const, content: userText, ts: new Date().toISOString() },
          { role: 'assistant' as const, content: assistantText, ts: new Date().toISOString() }
        ];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const saveMessages = useCallback(
    (next: ChatMessage[]) => {
      setMessages(next);
      persist(next);
    },
    [persist]
  );

  const historyForApi = useCallback(
    () => messages.filter((m) => m.content.trim()).slice(-14),
    [messages]
  );

  return (
    <ChatHistoryContext.Provider value={{ messages, setMessages, appendExchange, replaceMessages, saveMessages, historyForApi }}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const ctx = useContext(ChatHistoryContext);
  if (!ctx) throw new Error('useChatHistory must be used within ChatHistoryProvider');
  return ctx;
}

export function useOptionalChatHistory() {
  return useContext(ChatHistoryContext);
}
