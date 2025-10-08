import React from 'react';

const YELLOW = '#F6B74A';

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative inline-flex items-center rounded-full transition-colors"
      style={{
        width: 44,
        height: 24,
        background: on ? YELLOW : '#3F3F46',
        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.25)',
      }}
      aria-pressed={on}
    >
      <span
        className="absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full transition-transform shadow"
        style={{
          background: 'linear-gradient(180deg,#FFFFFF,#EDEDED)',
          transform: on ? 'translateX(20px)' : 'translateX(0px)',
        }}
      />
    </button>
  );
}

export function GhostButton({
  children,
  disabled = true,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-8 px-3 rounded-[10px] text-[12px] font-semibold"
      style={{
        color: disabled ? '#9CA3AF' : '#E5E7EB',
        background: '#111111',
        border: '1px solid #2A2A2A',
        opacity: disabled ? 0.9 : 1,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}
