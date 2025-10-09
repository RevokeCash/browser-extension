import React, { useState } from 'react';

const YELLOW = '#F6B74A';

export default function UpdateBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null; // hide completely when closed

  return (
    <div className="px-3 mt-2">
      <div className="flex items-center gap-2 px-2.5 py-2 rounded-[10px] bg-[#0E0E0E] border border-[#1E1E1E]">
        <button
          className="text-[11px] font-semibold px-3 py-1 rounded-[8px] text-black"
          style={{ backgroundColor: YELLOW }}
        >
          What’s New
        </button>

        <span className="text-[11px] font-semibold px-3 py-1 rounded-[8px] bg-[#181818] border border-[#262626] text-[#F6B74A]">
          UPDATE
        </span>

        <div className="flex-1" />

        <button
          onClick={() => setVisible(false)} // 👈 close when clicked
          className="
            text-neutral-400 hover:text-neutral-200
            text-lg leading-none font-semibold
            flex items-center justify-center
            h-6 w-6
          "
          aria-label="Close update banner"
        >
          ×
        </button>
      </div>
    </div>
  );
}
