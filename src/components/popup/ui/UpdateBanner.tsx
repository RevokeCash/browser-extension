import React, { useState } from 'react';

const YELLOW = '#F6B74A';

export default function UpdateBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null; // hide completely when closed

  return (
    <div className="px-3 mt-2">
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] bg-[#0E0E0E] border border-[#1E1E1E]">
        {/* Alert Badge */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#F6B74A] animate-pulse" />
          <span className="text-[11px] font-semibold text-[#F6B74A] uppercase tracking-wider">New Update</span>
        </div>

        {/* Action Button */}
        <button
          className="text-[11px] font-semibold px-3 py-1.5 rounded-[8px] text-black hover:opacity-90 transition-opacity"
          style={{ backgroundColor: YELLOW }}
        >
          What's New
        </button>

        <div className="flex-1" />

        {/* Close Button */}
        <button
          onClick={() => setVisible(false)}
          className="
            text-neutral-400 hover:text-neutral-200
            text-lg leading-none font-semibold
            flex items-center justify-center
            h-6 w-6
            transition-colors
          "
          aria-label="Close update banner"
        >
          ×
        </button>
      </div>
    </div>
  );
}
