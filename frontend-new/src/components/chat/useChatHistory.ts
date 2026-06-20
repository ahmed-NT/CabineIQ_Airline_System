import { useCallback, useState } from 'react';
import { aiAPI } from '@/lib/api';
import type { ChatMessage } from '@/types';

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm CabineIQ's AI assistant. Ask me about flights, passengers, or seat availability.",
  timestamp: new Date(),
};

function makeId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const loadingId = makeId();
    const loadingMsg: ChatMessage = {
      id: loadingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true,
    };

    let historyForApi: { role: string; content: string }[] = [];

    setMessages((prev) => {
      historyForApi = prev
        .filter((m) => m.id !== 'welcome' && !m.loading)
        .map((m) => ({ role: m.role, content: m.content }));
      return [...prev, userMsg, loadingMsg];
    });
    setIsLoading(true);

    try {
      const res = await aiAPI.query(trimmed, historyForApi);
      const answer = res.data?.answer ?? "Sorry, I couldn't get a response.";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, content: answer, loading: false, timestamp: new Date() }
            : m,
        ),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                ...m,
                content:
                  "Sorry, I couldn't connect to the AI service. Please try again.",
                loading: false,
                timestamp: new Date(),
              }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearHistory = useCallback(() => {
    setMessages([WELCOME]);
  }, []);

  const hasUserMessages = messages.some((m) => m.role === 'user');

  return {
    messages,
    sendMessage,
    isLoading,
    clearHistory,
    hasUserMessages,
  };
}
