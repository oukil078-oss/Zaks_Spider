import React from 'react';

interface ConsoleFrameProps {
  children: React.ReactNode;
}

export const ConsoleFrame: React.FC<ConsoleFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden select-none font-mono">
      {/* Outer ambient glow & matrix backdrop */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-[#030712] to-[#010409] -z-10" />
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] -z-10"
        style={{
          backgroundImage: `linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Main Beveled Console Shell matching wireframe */}
      <div className="relative w-full max-w-[1880px] h-[96vh] flex flex-col rounded-[2rem] border border-cyan-500/20 bg-[#060b14]/95 shadow-[0_0_60px_rgba(0,240,255,0.06),0_25px_50px_-12px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden">
        {/* Sleek outer bezel highlight strip */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

        {/* Tactical Corner Reticles */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500/40 rounded-br-sm pointer-events-none" />

        {/* Content container */}
        <div className="relative flex-1 flex flex-col w-full h-full p-3 sm:p-4 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};
