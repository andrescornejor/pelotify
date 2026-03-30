'use client';

export const SectionDivider = () => (
  <div className="flex items-center gap-6 py-12 opacity-20 select-none">
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    <div className="flex items-center gap-1.5">
      <div className="w-1 h-1 rounded-full bg-primary/30" />
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(44,252,125,0.3)]" />
      <div className="w-1 h-1 rounded-full bg-primary/30" />
    </div>
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
  </div>
);
