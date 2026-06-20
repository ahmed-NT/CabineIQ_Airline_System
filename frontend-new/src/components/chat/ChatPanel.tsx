import { useEffect, useRef, useState } from 'react';
import { TbSend, TbX } from 'react-icons/tb';
import { useTheme } from '@/hooks/useTheme';
import { useChatHistory } from './useChatHistory';

const SUGGESTED_PROMPTS = [
  'How many delayed flights?',
  'Find passenger Ahmed Bennani',
  "What's the occupancy on AT200?",
  'Show me boarding flights',
];

interface ChatPanelProps {
  onClose: () => void;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-1 items-center h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const { isDark } = useTheme();
  const { messages, sendMessage, isLoading, hasUserMessages } = useChatHistory();
  const [input, setInput] = useState('');
  const [closing, setClosing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 280);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handlePrompt = async (prompt: string) => {
    setInput('');
    await sendMessage(prompt);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={handleClose}
      />
      <div
        className={`fixed right-0 top-0 bottom-0 w-[360px] z-50 flex flex-col border-l ${
          closing ? 'animate-slide-out-panel' : 'animate-slide-in-panel'
        } ${
          isDark
            ? 'bg-[#0a1e38] border-[#1a3050]'
            : 'bg-white border-gray-200 shadow-xl'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
            isDark ? 'border-[#1a3050]' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1A1A2E]'}`}>
              AI Copilot
            </span>
          </div>
          <button
            onClick={handleClose}
            className={isDark ? 'text-[#4a7aab] hover:text-white' : 'text-gray-400 hover:text-gray-600'}
          >
            <TbX className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {!hasUserMessages && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePrompt(prompt)}
                  disabled={isLoading}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                    isDark
                      ? 'border-[#1a3050] text-[#8aa8c8] hover:border-[#C41E3A] hover:text-white'
                      : 'border-gray-200 text-gray-500 hover:border-[#C41E3A] hover:text-[#C41E3A]'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#C41E3A] text-white'
                    : isDark
                      ? 'bg-[#0d2040] text-[#e2e8f0]'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.loading ? <LoadingDots /> : msg.content}
              </div>
              <span
                className={`text-[10px] mt-0.5 px-1 ${
                  isDark ? 'text-[#4a7aab]' : 'text-gray-400'
                }`}
              >
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className={`flex items-center gap-2 px-4 py-3 border-t flex-shrink-0 ${
            isDark ? 'border-[#1a3050]' : 'border-gray-200'
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            disabled={isLoading}
            className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none ${
              isDark
                ? 'bg-[#071628] border-[#1a3050] text-white placeholder:text-[#2a5080]'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
            }`}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-[#C41E3A] text-white flex items-center justify-center disabled:opacity-40 transition-opacity hover:bg-[#a01830]"
          >
            <TbSend className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
