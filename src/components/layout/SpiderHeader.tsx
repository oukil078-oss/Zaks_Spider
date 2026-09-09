// ==========================================
// ZAK'S SPIDER — HIGH-TECH CYBER HUD HEADER
// Telemetry Indicators, Multi-Vector Navigation & Live Status
// ==========================================

import React from 'react';
import { 
  Terminal, 
  Globe, 
  Network, 
  ShieldAlert, 
  Bot, 
  User, 
  Zap, 
  Cpu, 
  Radio, 
  Sparkles,
  Shield,
  Search,
  Fingerprint
} from 'lucide-react';
import { SpiderTabId } from '../../types';

interface SpiderHeaderProps {
  activeTab: SpiderTabId;
  onSelectTab: (tab: SpiderTabId) => void;
  targetCount?: number;
  noteCount?: number;
  commandCount?: number;
  vulnCount?: number;
}

export const SpiderHeader: React.FC<SpiderHeaderProps> = ({
  activeTab,
  onSelectTab,
  targetCount = 1,
  noteCount = 3,
  commandCount = 65,
  vulnCount = 120,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#06090e]/90 backdrop-blur-2xl transition-all shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand / Cyber Spider Insignia */}
        <div className="flex items-center gap-3 select-none">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => onSelectTab('pentest')}
            title="Zak's Spider Master Cyber Matrix"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/25 via-purple-500/20 to-emerald-500/25 border border-cyan-500/40 flex items-center justify-center shadow-spider-glow group-hover:border-cyan-400 group-hover:scale-105 transition duration-300">
              {/* Arachnid SVG Insignia */}
              <svg 
                className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform duration-300"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.8" 
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
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400 bg-clip-text text-transparent font-mono">
                ZAK'S SPIDER
              </span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold tracking-wider">
                v2.0 PRO
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono hidden sm:block">
              Cyber Recon, Pentest Arsenal & Neural Knowledge Web
            </p>
          </div>
        </div>

        {/* Center: Module Navigation Tabs */}
        <nav className="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md overflow-x-auto max-w-full">
          {/* 1. Pentest Lab */}
          <button
            onClick={() => onSelectTab('pentest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'pentest'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pentest Lab</span>
          </button>

          {/* 2. Web Crawler */}
          <button
            onClick={() => onSelectTab('crawler')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'crawler'
                ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Web Crawler</span>
          </button>

          {/* 3. Forensics & OSINT Matrix */}
          <button
            onClick={() => onSelectTab('forensics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'forensics'
                ? 'bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-indigo-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : 'text-gray-400 hover:text-cyan-300 hover:bg-white/5'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
            <span>Investigate</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              50+ OSINT
            </span>
          </button>

          {/* 4. Neural Web */}
          <button
            onClick={() => onSelectTab('brain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'brain'
                ? 'bg-gradient-to-r from-purple-500/25 to-pink-500/25 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-purple-400" />
            <span>Neural Web</span>
          </button>

          {/* 4. Vuln News (LIVE) */}
          <button
            onClick={() => onSelectTab('vuln-news')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'vuln-news'
                ? 'bg-gradient-to-r from-red-500/25 to-rose-500/25 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-gray-400 hover:text-red-300 hover:bg-white/5'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Vuln News</span>
          </button>

          {/* 5. AI Pentest Buddy */}
          <button
            onClick={() => onSelectTab('copilot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'copilot'
                ? 'bg-gradient-to-r from-cyan-500/25 via-purple-500/25 to-blue-500/25 text-white border border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'text-gray-400 hover:text-cyan-300 hover:bg-white/5'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Buddy</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30 hidden lg:inline">
              ASTRA
            </span>
          </button>

          {/* 6. Operator Profile */}
          <button
            onClick={() => onSelectTab('operator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'operator'
                ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-gray-400 hover:text-amber-200 hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Operator</span>
          </button>
        </nav>

        {/* Right: Telemetry Indicators */}
        <div className="hidden xl:flex items-center gap-2">
          {/* Active Model Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-cyan-500/20 text-[11px] font-mono text-cyan-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>GPT-6 ASTRA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          {/* Security Perimeter Status */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/40 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>ENCRYPTED</span>
          </div>
        </div>
      </div>
    </header>
  );
};
