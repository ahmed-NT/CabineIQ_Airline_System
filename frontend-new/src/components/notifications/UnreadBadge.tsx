interface UnreadBadgeProps {
  count: number;
}

export default function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#C41E3A] text-white text-[9px] font-bold flex items-center justify-center leading-none">
      {count > 9 ? '9+' : count}
    </span>
  );
}
