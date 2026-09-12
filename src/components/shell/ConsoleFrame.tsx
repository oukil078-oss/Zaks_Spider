import React from 'react';

interface ConsoleFrameProps {
  children: React.ReactNode;
}

export const ConsoleFrame: React.FC<ConsoleFrameProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen bg-[#000000] text-neutral-100 flex flex-col overflow-hidden font-mono select-none antialiased">
      {/* Edge-to-edge workspace container */}
      <div className="relative flex-1 flex flex-col w-full h-full p-1.5 gap-1.5 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

