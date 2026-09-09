// ==========================================
// ZAK'S SPIDER — 2027 TOP BENTO METRICS ROW
// Matching wireframe media_1788987543371.png
// 3 High-density enterprise telemetry cards:
// 1. Attack Velocity & APS (Attacks per Second)
// 2. Monitored Attack Surface & Endpoints
// 3. Vulnerability & Zero-Day Radar (CISA KEV)
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Bug, 
  TrendingUp, 
  Radio, 
  Terminal, 
  Zap, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

interface BentoMetricsRowProps {
  pentestCount: number;
  activeAttacksCount: number;
  cveCount?: number;
  onOpenLiveThreats?: () => void;
  onOpenArsenal?: () => void;
  onOpenVulns?: () => void;
}

export const BentoMetricsRow: React.FC<BentoMetricsRowProps> = ({
  pentestCount,
  activeAttacksCount,
  cveCount = 1184,
  onOpenLiveThreats,
  onOpenArsenal,
  onOpenVulns,
}) => {
  // Real-time fluctuating attacks per second
  const [attacksPerSec, setAttacksPerSec] = useState<number>(2418);
  const [sparklineData, setSparklineData] = useState<number[]>([40, 55, 48, 62, 78, 71, 85, 92, 88, 95]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAttacksPerSec(prev => {
        const delta = Math.floor(Math.random() * 80) - 38;
        const nextVal = Math.max(1850, Math.min(3200, prev + delta));
        setSparklineData(curr => [...curr.slice(1), Math.round((nextVal / 3200) * 100)]);
        return nextVal;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 select-none">
      {/* ------------------------------------------------------------- */}
      {/* CARD 1: GLOBAL ATTACK VELOCITY & DEFENSE POSTURE              */}
      {/* ------------------------------------------------------------- */}
      <div 
        onClick={onOpenLiveThreats}
        className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#0c1322] via-[#090e18] to-[#070a12] border border-cyan-500/20 hover:border-cyan-400/50 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
              GLOBAL THREAT VELOCITY
            </span>
          </div>
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE FEED
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <div className="text-2xl lg:text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
              <span>{attacksPerSec.toLocaleString()}</span>
              <span className="text-xs font-mono font-normal text-cyan-400">APS</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
              Attacks / Sec • Peak: 3.4M/24h
            </p>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="w-24 h-8 flex items-end gap-1">
            {sparklineData.map((val, i) => (
              <div
                key={i}
                style={{ height: `${val}%` }}
                className="w-1.5 bg-gradient-to-t from-cyan-600/40 to-cyan-400 rounded-t-sm transition-all duration-500"
              />
            ))}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-zinc-400">
          <span className="text-zinc-500">Active APT Groups:</span>
          <span className="text-cyan-300 font-bold">APT29 • Lazarus • Volt Typhoon</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CARD 2: MONITORED ATTACK SURFACE & RECON ARSENAL               */}
      {/* ------------------------------------------------------------- */}
      <div 
        onClick={onOpenArsenal}
        className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#121024] via-[#0b0c1b] to-[#070a12] border border-purple-500/20 hover:border-purple-400/50 shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Terminal className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider text-purple-300 uppercase">
              PENTEST MATRIX & RECON
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
            {pentestCount > 0 ? `${pentestCount} TOOLS` : '116+ READY'}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <div className="text-2xl lg:text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
              <span>{pentestCount || 116}</span>
              <span className="text-xs font-mono font-normal text-purple-400">ARSENAL</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
              eJPTv2 / OSCP Auditing Commands Loaded
            </p>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% READY
            </span>
            <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
              Zero-Config Memory
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-zinc-400">
          <span className="text-zinc-500">Categories:</span>
          <span className="text-purple-300 font-bold">Web • AD • PrivEsc • Cloud • Shells</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CARD 3: ZERO-DAY & CISA KEV INTELLIGENCE                      */}
      {/* ------------------------------------------------------------- */}
      <div 
        onClick={onOpenVulns}
        className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#1a1012] via-[#100c11] to-[#070a12] border border-amber-500/20 hover:border-amber-400/50 shadow-lg hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider text-amber-300 uppercase">
              CISA KEV ZERO-DAY RADAR
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
            DEFCON 2
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <div className="text-2xl lg:text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
              <span>{cveCount.toLocaleString()}</span>
              <span className="text-xs font-mono font-normal text-amber-400">EXPLOITED</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
              Active In-The-Wild Threat Vectors
            </p>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[11px] font-mono font-bold text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> 9.8 CVSS CRITICAL
            </span>
            <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
              Ransomware Linked
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-zinc-400">
          <span className="text-zinc-500">Live Exploits:</span>
          <span className="text-amber-300 font-bold">CVE-2024-3400 • Log4Shell • Akira</span>
        </div>
      </div>
    </div>
  );
};
