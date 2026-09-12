import React, { useState, useEffect } from 'react';
import { 
  Shield, Terminal, Fingerprint, Activity, Clock, 
  Search, Bot, Globe, Radio, CheckCircle2, ChevronRight, Bug,
  HelpCircle, Settings, Briefcase
} from 'lucide-react';
import { MainHubId } from '../../types';
import { InvestigationCaseModal } from './InvestigationCaseModal';

interface TopBarProps {
  activeHub: MainHubId;
  onSelectHub: (hub: MainHubId) => void;
  attackCountToday?: number;
  onOpenAiSwarm?: () => void;
  onOpenGodsEye?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenHotkeys?: () => void;
  onOpenSettings?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  activeHub, 
  onSelectHub, 
  attackCountToday,
  onOpenAiSwarm,
  onOpenGodsEye,
  onOpenCommandPalette,
  onOpenHotkeys,
  onOpenSettings,
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

  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [pinnedTarget, setPinnedTarget] = useState('198.51.100.42');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('spider_active_investigation_case');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.primaryTarget) setPinnedTarget(parsed.primaryTarget);
      }
    } catch (e) {}
  }, [isCaseModalOpen]);

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
      id: 'spider',
      label: 'The Spider Suite',
      icon: <Globe className="w-3.5 h-3.5 text-cyan-400" />,
      badge: 'RECON & GRAPH',
    },
    {
      id: 'pentest',
      label: 'Offensive Recon',
      icon: <Terminal className="w-3.5 h-3.5" />,
      badge: 'ARSENAL',
    },
  ];

  return (
    <header className="w-full flex items-center justify-between px-3 py-1.5 bg-[#000000] border border-neutral-800 rounded-none shrink-0 gap-3 select-none font-mono">
      {/* Left: Brand Identity & Active Status */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-none bg-neutral-950 border border-neutral-700 text-cyan-400">
            <Shield className="w-4 h-4 text-cyan-400 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-wider text-neutral-100 uppercase">
                Spider SecOps
              </span>
              <span className="px-1 py-0.2 text-[9px] font-mono rounded-none bg-neutral-900 text-neutral-400 border border-neutral-700">
                PROD
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse" />
              <span>FEEDS NOMINAL</span>
            </div>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-neutral-800 hidden sm:block" />

        {/* Global Omnibar Trigger Button */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-none bg-neutral-950 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-neutral-200 transition-colors text-xs cursor-pointer w-60 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-400 font-mono text-[11px]">Omni search...</span>
          </div>
          <kbd className="flex items-center text-[9px] font-mono bg-neutral-900 px-1 py-0.2 rounded-none border border-neutral-700 text-neutral-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Center: Clean Straight Terminal Workspace Navigation */}
      <nav className="flex items-center gap-0.5 bg-neutral-950 p-0.5 rounded-none border border-neutral-800">
        {hubs.map((hub) => {
          const isActive = activeHub === hub.id;
          return (
            <button
              key={hub.id}
              onClick={() => onSelectHub(hub.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono transition-all cursor-pointer rounded-none ${
                isActive
                  ? 'bg-neutral-800 text-cyan-300 font-semibold border-b-2 border-cyan-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border-b-2 border-transparent'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : 'text-neutral-500'}>
                {hub.icon}
              </span>
              <span>{hub.label}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded-none font-mono hidden lg:inline ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                    : 'bg-neutral-900 text-neutral-500'
                }`}
              >
                {hub.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Right: Operational Launchers & UTC Time */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Global GEOINT 3D Cockpit Toggle */}
        {onOpenGodsEye && (
          <button
            onClick={onOpenGodsEye}
            title="Open Global GEOINT 3D Viewshed & Live Camera Network"
            className="flex items-center gap-1.5 px-2 py-1 rounded-none bg-neutral-950 border border-neutral-700 hover:border-emerald-500 text-neutral-200 hover:text-white text-xs font-mono transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Global GEOINT</span>
            <span className="text-[9px] font-mono px-1 rounded-none bg-neutral-900 text-emerald-400 border border-neutral-700">
              6.9k+
            </span>
          </button>
        )}

        {/* Autonomous AI Swarm Launcher */}
        {onOpenAiSwarm && (
          <button
            onClick={onOpenAiSwarm}
            title="Launch Multi-Agent SOC Threat Swarm"
            className="flex items-center gap-1.5 px-2 py-1 rounded-none bg-neutral-950 border border-neutral-700 hover:border-cyan-500 text-neutral-200 hover:text-white text-xs font-mono transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">AI Swarm</span>
            <span className="text-[9px] font-mono px-1 rounded-none bg-neutral-900 text-cyan-400 border border-neutral-700">
              ACTIVE
            </span>
          </button>
        )}

        {/* Active Investigation Case Session Pin */}
        <button
          onClick={() => setIsCaseModalOpen(true)}
          title="Active Investigation Case Session & Target Pin"
          className="flex items-center gap-1.5 px-2 py-1 rounded-none bg-neutral-950 border border-cyan-500/50 hover:border-cyan-400 text-neutral-200 hover:text-white text-xs font-mono transition-colors cursor-pointer"
        >
          <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline text-neutral-400">PIN:</span>
          <span className="text-[9px] font-mono px-1 rounded-none bg-neutral-900 text-cyan-300 border border-neutral-700 max-w-[100px] truncate">
            {pinnedTarget}
          </span>
        </button>

        {/* UTC Clock Capsule */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-none bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[11px]">
          <Clock className="w-3 h-3 text-neutral-500" />
          <span>{currentTime || 'SYNCING...'}</span>
        </div>

        {/* Global Hotkeys HUD Button */}
        {onOpenHotkeys && (
          <button
            onClick={onOpenHotkeys}
            title="Keyboard Shortcuts & Hotkeys Reference (?)"
            className="p-1 rounded-none bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Workstation Settings Drawer Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title="Workstation Preferences & Ingestion Settings"
            className="p-1 rounded-none bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active Investigation Case Session Modal */}
      <InvestigationCaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onPivotToHub={onSelectHub}
      />
    </header>
  );
};

