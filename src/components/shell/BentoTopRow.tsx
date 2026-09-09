import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Bug, TrendingUp, AlertTriangle, ArrowUpRight, Zap } from 'lucide-react';
import { CISA_KEV_CATALOG } from '../../data/cveIntelligence';

interface BentoTopRowProps {
  totalAttacksCount?: number;
  onSelectCveCard?: () => void;
}

export const BentoTopRow: React.FC<BentoTopRowProps> = ({
  totalAttacksCount = 48192,
  onSelectCveCard,
}) => {
  const [aps, setAps] = useState(1482);
  const [sparkPoints, setSparkPoints] = useState<number[]>([45, 52, 58, 64, 48, 70, 65, 82, 75, 90, 85, 95]);
  const [activeCveIndex, setActiveCveIndex] = useState(0);

  // APS ticker fluctuation & sparkline evolution
  useEffect(() => {
    const timer = setInterval(() => {
      const delta = Math.floor(Math.random() * 31) - 15;
      setAps((prev) => Math.max(1200, Math.min(2200, prev + delta)));

      setSparkPoints((prev) => {
        const nextVal = Math.max(30, Math.min(100, (prev[prev.length - 1] || 70) + (Math.random() * 20 - 10)));
        return [...prev.slice(1), Math.round(nextVal)];
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // CVE rotating ticker
  useEffect(() => {
    const cveTimer = setInterval(() => {
      setActiveCveIndex((prev) => (prev + 1) % CISA_KEV_CATALOG.length);
    }, 4000);
    return () => clearInterval(cveTimer);
  }, []);

  const currentCve = CISA_KEV_CATALOG[activeCveIndex];

  // Generate SVG path from spark points
  const width = 120;
  const height = 36;
  const maxVal = Math.max(...sparkPoints, 100);
  const minVal = Math.min(...sparkPoints, 0);
  const range = maxVal - minVal || 1;

  const pathD = sparkPoints.reduce((acc, val, i) => {
    const x = (i / (sparkPoints.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 6) - 3;
    return `${acc} ${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
  }, '');

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 my-3">
      {/* Card 1: Attack Velocity */}
      <div className="relative flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#070d18] border border-cyan-500/20 shadow-lg backdrop-blur-md overflow-hidden group hover:border-cyan-500/40 transition-all">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Attack Velocity (APS)</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" /> +14.8%
          </span>
        </div>

        <div className="flex items-end justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]">
                {aps.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">APS</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Peak: 3,492 APS // Volumetric DDoS & Exploits
            </p>
          </div>

          {/* Real-time mini sparkline */}
          <div className="w-28 h-9">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="cyanSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={pathD}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Docked bottom badge matching wireframe */}
        <div className="mt-3 pt-2 border-t border-cyan-500/10 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            REAL-TIME DEEPASTRO SENSORS
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Total Today: {totalAttacksCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Card 2: Monitored Attack Surface */}
      <div className="relative flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#070d18] border border-cyan-500/20 shadow-lg backdrop-blur-md overflow-hidden group hover:border-cyan-500/40 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Monitored Attack Surface</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-full">
            HEALTH 99.98%
          </span>
        </div>

        <div className="flex items-end justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                1,842
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">ASSETS</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              42 Honeypots // Ingress: 18.4 Gbps
            </p>
          </div>

          {/* Shield Score Gauge Pill */}
          <div className="flex flex-col items-end">
            <div className="text-lg font-black font-mono text-emerald-400">98/100</div>
            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div className="w-[98%] h-full bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981]" />
            </div>
          </div>
        </div>

        {/* Docked bottom badge matching wireframe */}
        <div className="mt-3 pt-2 border-t border-cyan-500/10 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            PERIMETER SHIELD ARMED
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Filtered: 99.4% Attacks
          </span>
        </div>
      </div>

      {/* Card 3: Zero-Day Radar (CISA KEV) */}
      <div 
        onClick={onSelectCveCard}
        className="relative flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#070d18] border border-cyan-500/20 shadow-lg backdrop-blur-md overflow-hidden group hover:border-purple-500/50 transition-all cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
            <Bug className="w-4 h-4 text-purple-400 animate-spin-slow" />
            <span>Zero-Day Threat Radar (KEV)</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3 text-purple-400" /> CISA KEV SYNC
          </span>
        </div>

        <div className="flex items-end justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                {CISA_KEV_CATALOG.length}
              </span>
              <span className="text-xs font-mono text-purple-400 font-semibold">ACTIVE ZERO-DAYS</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 mt-1 flex items-center gap-1.5 truncate max-w-[280px]">
              <span className="font-bold text-red-400 shrink-0">{currentCve?.cveID}:</span>
              <span className="truncate text-slate-400">{currentCve?.product} ({currentCve?.vulnerabilityName})</span>
            </div>
          </div>

          <div className="px-2 py-1 rounded bg-red-950/50 border border-red-500/40 text-red-400 text-xs font-mono font-bold shrink-0">
            CVSS {currentCve?.cvssScore || '10.0'}
          </div>
        </div>

        {/* Docked bottom badge matching wireframe */}
        <div className="mt-3 pt-2 border-t border-cyan-500/10 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 text-[10px] font-mono text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            EXPLOITED IN THE WILD
          </div>
          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 text-purple-300 group-hover:underline">
            View KEV Catalog <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
