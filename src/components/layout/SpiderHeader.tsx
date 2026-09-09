// ==========================================
// ZAK'S SPIDER — ENTERPRISE TRI-HUB HEADER
// Strictly 3 Primary Operations Hubs: PenTest Lab, Forensic Investigations, SOC Lab
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Fingerprint, 
  ShieldCheck, 
  Activity, 
  Radio, 
  Lock, 
  Cpu,
  Sparkles,
  Layers,
  Globe
} from 'lucide-react';
import type { MainHubId } from '../../types';

interface SpiderHeaderProps {
  activeHub: MainHubId;
  onSelectHub: (hub: MainHubId) => void;
  pentestCount?: number;
  forensicsCount?: number;
  socAlertsCount?: number;
}

export const SpiderHeader: React.FC<SpiderHeaderProps> = ({
  activeHub,
  onSelectHub,
  pentestCount = 116,
  forensicsCount = 52,
  socAlertsCount = 17,
}) => {
  const [timecode, setTimecode] = useState<string>('00:00:00 UTC');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimecode(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#06090e]/95 backdrop-blur-2xl transition-all shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Silicon Valley Cybersec Startup Brand */}
        <div className="flex items-center gap-3 select-none">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => onSelectHub('soc')}
            title="Zak's Spider Enterprise Cyber Matrix"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-amber-500/20 border border-white/20 flex items-center justify-center shadow-lg group-hover:border-cyan-400 transition-all">
              {/* Arachnid Insignia */}
              <svg 
                className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300"
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
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-wider text-white font-mono">
                ZAK'S SPIDER
              </span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold tracking-widest">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[9px] text-zinc-400 font-mono hidden sm:block">
              Silicon Valley Cyber Defense & Deep OSINT Intelligence Matrix
            </p>
          </div>
        </div>

        {/* Center: EXACTLY 3 Primary Operations Hubs (PenTest Lab, Forensic Investigations, SOC Lab) */}
        <nav className="flex items-center p-1 rounded-xl bg-[#0a101a] border border-white/10 shadow-inner">
          {/* 1. PenTest Lab */}
          <button
            onClick={() => onSelectHub('pentest')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeHub === 'pentest'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>PenTest Lab</span>
            <span className="text-[10px] px-1 rounded bg-black/40 text-amber-400 border border-amber-500/20 font-mono">
              {pentestCount}+
            </span>
          </button>

          {/* 2. Forensic Investigations */}
          <button
            onClick={() => onSelectHub('forensics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeHub === 'forensics'
                ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Fingerprint className="w-4 h-4 text-purple-400" />
            <span>Forensic Investigations</span>
            <span className="text-[10px] px-1 rounded bg-black/40 text-purple-400 border border-purple-500/20 font-mono">
              {forensicsCount}
            </span>
          </button>

          {/* 3. SOC Lab */}
          <button
            onClick={() => onSelectHub('soc')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeHub === 'soc'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span>SOC Lab</span>
            <span className="text-[10px] px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
              LIVE
            </span>
          </button>
        </nav>

        {/* Right: Defense Readiness HUD Telemetry */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0a101a] border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-zinc-300 font-bold">DEFCON 1</span>
            <span className="text-zinc-500">|</span>
            <span className="text-cyan-400">{timecode}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0a101a] border border-white/10 text-[10px] text-zinc-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>TLS 1.3 AES-256</span>
          </div>
        </div>
      </div>
    </header>
  );
};
