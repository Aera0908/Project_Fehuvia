import React from 'react';

export default function DemoDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div
        className="hidden md:block fixed bottom-2 right-2 z-50 max-w-32 rounded-full border border-white/10 bg-black/15 px-2 py-1 text-[7px] leading-tight tracking-[0.14em] text-white/25 backdrop-blur-sm pointer-events-none select-none sm:max-w-40"
        aria-hidden="true"
      >
        Demo only. Placeholder content remains.
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-48 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[9px] leading-tight tracking-[0.18em] text-white/35 backdrop-blur-md pointer-events-none select-none sm:max-w-56"
      aria-hidden="true"
    >
      Frontend demo only. Some information are placeholder only and not yet reflected or implemented.
    </div>
  );
}