import React from 'react';
import { 
  Shield, 
  Globe, 
  Terminal, 
  Cpu, 
  Network, 
  Zap, 
  Radio, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SpiderTabId } from '../../types';

interface SpiderHeaderProps {
  activeTab: SpiderTabId;
  onSelectTab: (tab: SpiderTabId) => void;
  targetCount?: number;
  noteCount?: number;
  commandCount?: number;
}

export const SpiderHeader: React.FC<SpiderHeaderProps> = ({
  activeTab,
  onSelectTab,
  targetCount = 1,
  noteCount = 3,
  commandCount = 12,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/15 bg-[#06090e]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Spider Insignia */}
        <div className="flex items-center gap-3 select-none">
          <div className="relative group cursor-pointer" onClick={() => onSelectTab('pentest')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center shadow-spider-glow group-hover:border-cyan-400 transition">
              {/* Custom Arachnid Cyber Icon */}
              <svg 
                className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.75" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3.5" />
                <path d="M12 2v6.5" />
                <path d="M12 15.5V22" />
                <path d="m4.93 4.93 4.6 4.6" />
                <path d="m14.47 14.47 4.6 4.6" />
                <path d="M2 12h6.5" />
                <path d="M15.5 12H22" />
                <path d="m4.93 19.07 4.6-4.6" />
                <path d="m14.47 9.53 4.6-4.6" />
              </svg>
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400 bg-clip-text text-transparent font-mono">
                ZAK'S SPIDER
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold tracking-wider">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono hidden sm:block">
              Arachnid Recon, Pentest Arsenal & Neural Web
            </p>
          </div>
        </div>

        {/* Center: Module Navigation Tabs */}
        <nav className="flex items-center p-1 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md">
          <button
            onClick={() => onSelectTab('pentest')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'pentest'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pentest Lab</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 font-mono hidden md:inline">
              {commandCount}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('crawler')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'crawler'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Web Crawler</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 font-mono hidden md:inline">
              OSINT
            </span>
          </button>

          <button
            onClick={() => onSelectTab('brain')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'brain'
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-purple-400" />
            <span>Neural Web</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/10 text-purple-400 font-mono hidden md:inline">
              {noteCount}
            </span>
          </button>
        </nav>

        {/* Right: Telemetry Indicators */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 border border-white/5 text-[11px] font-mono text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>RADAR: ONLINE</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>VERCEL</span>
          </div>
        </div>
      </div>
    </header>
  );
};
