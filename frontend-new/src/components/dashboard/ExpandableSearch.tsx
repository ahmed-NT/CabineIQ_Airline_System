import { useState, useRef, useEffect } from 'react';
import { TbSearch, TbX } from 'react-icons/tb';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ExpandableSearch({
  value,
  onChange,
  placeholder = 'Filter flights...',
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const collapse = () => {
    setSearchOpen(false);
    onChange('');
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) collapse();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen]);

  const mutedBg = isDark ? 'bg-[#0a1e38]' : 'bg-gray-100';
  const mutedHover = isDark ? 'hover:bg-[#122a4a]' : 'hover:bg-gray-200/70';
  const inputText = isDark
    ? 'text-white placeholder:text-[#2a5080]'
    : 'text-gray-800 placeholder:text-gray-400';
  const iconMuted = isDark ? 'text-[#4a7aab]' : 'text-gray-400';

  if (searchOpen) {
    return (
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <div className={`flex items-center gap-1 ${mutedBg} rounded-lg px-2 py-1 flex-1 min-w-0`}>
          <TbSearch className={`w-3.5 h-3.5 ${iconMuted} shrink-0`} />
          <input
            ref={inputRef}
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`bg-transparent text-sm outline-none w-full min-w-0 ${inputText}`}
          />
        </div>
        <button
          onClick={collapse}
          className={`p-1 rounded ${mutedHover} ${iconMuted} hover:text-foreground shrink-0 transition-colors`}
        >
          <TbX className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setSearchOpen(true)}
      className={`p-2 rounded-lg ${mutedBg} ${mutedHover} ${iconMuted} shrink-0 transition-colors`}
    >
      <TbSearch className="w-4 h-4" />
    </button>
  );
}
