import React from 'react';

interface ConsoleFrameProps {
  children: React.ReactNode;
}

export const ConsoleFrame: React.FC<ConsoleFrameProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen bg-[#070b13] text-slate-100 flex flex-col overflow-hidden font-sans select-none antialiased">
      {/* Edge-to-edge workspace container */}
      <div className="relative flex-1 flex flex-col w-full h-full p-2.5 gap-2 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

