import React, { useState, useEffect } from 'react';
import { 
  Shield, Terminal, Fingerprint, Activity, Clock, 
  Search, Bot, Globe, Radio, CheckCircle2, ChevronRight, Bug
} from 'lucide-react';
import { MainHubId } from '../../types';

interface TopBarProps {
  activeHub: MainHubId;
  onSelectHub: (hub: MainHubId) => void;
  attackCountToday?: number;
  onOpenAiSwarm?: () => void;
  onOpenGodsEye?: () => void;
  onOpenCommandPalette?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  activeHub, 
  onSelectHub, 
  attackCountToday,
  onOpenAiSwarm,
  onOpenGodsEye,
  onOpenCommandPalette,
}) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const hubs: { id: MainHubId; label: string; icon: React.ReactNode; badge: string }[] = [
    {
      id: 'soc',
      label: 'SOC & Telemetry',
      icon: <Activity className="w-3.5 h-3.5" />,
      badge: 'LIVE MESH',
    },
    {
      id: 'vuln-news',
      label: 'Threat Intel & KEV',
      icon: <Bug className="w-3.5 h-3.5" />,
      badge: 'CISA KEV',
    },
    {
      id: 'forensics',
      label: 'Forensics & OSINT',
      icon: <Fingerprint className="w-3.5 h-3.5" />,
      badge: 'DOSSIER',
    },
    {
      id: 'pentest',
      label: 'Offensive Recon',
      icon: <Terminal className="w-3.5 h-3.5" />,
      badge: 'ARSENAL',
    },
  ];

  return (
    <header className="w-full flex items-center justify-between px-3 py-2 bg-[#0b101b] border border-slate-800/80 rounded-lg shrink-0 gap-3 select-none">
      {/* Left: Brand Identity & Active Status */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-900 border border-slate-700/70 text-blue-400">
            <Shield className="w-4 h-4 text-blue-400 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-slate-100 uppercase">
                Spider SecOps
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                PROD
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>FEEDS NOMINAL</span>
            </div>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

        {/* Global Omnibar Trigger Button */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#080d17] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-xs cursor-pointer w-64 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400 font-sans">Quick search or command...</span>
          </div>
          <kbd className="flex items-center text-[10px] font-mono bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700 text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Center: Clean Enterprise Workspace Navigation */}
      <nav className="flex items-center gap-1 bg-[#070b13] p-1 rounded-md border border-slate-800/80">
        {hubs.map((hub) => {
          const isActive = activeHub === hub.id;
          return (
            <button
              key={hub.id}
              onClick={() => onSelectHub(hub.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <span className={isActive ? 'text-blue-400' : 'text-slate-500'}>
                {hub.icon}
              </span>
              <span>{hub.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono hidden lg:inline ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-900 text-slate-500'
                }`}
              >
                {hub.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Right: Operational Launchers & UTC Time */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Global GEOINT 3D Cockpit Toggle */}
        {onOpenGodsEye && (
          <button
            onClick={onOpenGodsEye}
            title="Open Global GEOINT 3D Viewshed & Live Camera Network"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0e1626] border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Global GEOINT</span>
            <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
              6.9k+
            </span>
          </button>
        )}

        {/* Autonomous AI Swarm Launcher */}
        {onOpenAiSwarm && (
          <button
            onClick={onOpenAiSwarm}
            title="Launch Multi-Agent SOC Threat Swarm"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0e1626] border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xl:inline">AI Swarm</span>
            <span className="text-[10px] font-mono px-1 rounded bg-blue-950 text-blue-400 border border-blue-800/60">
              Active
            </span>
          </button>
        )}

        {/* UTC Clock Capsule */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 font-mono text-[11px]">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{currentTime || 'SYNCING...'}</span>
        </div>
      </div>
    </header>
  );
};

