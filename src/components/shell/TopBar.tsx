import React, { useState, useEffect } from 'react';
import { Shield, Terminal, Fingerprint, Activity, Radio, Clock, Bell, Volume2, VolumeX, Flame, Bug, Bot, Globe } from 'lucide-react';
import { MainHubId } from '../../types';

interface TopBarProps {
  activeHub: MainHubId;
  onSelectHub: (hub: MainHubId) => void;
  attackCountToday?: number;
  onOpenAiSwarm?: () => void;
  onOpenGodsEye?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  activeHub, 
  onSelectHub, 
  attackCountToday = 48192,
  onOpenAiSwarm,
  onOpenGodsEye,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [audioMuted, setAudioMuted] = useState(true);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const hubs: { id: MainHubId; label: string; icon: React.ReactNode; badge: string; color: string }[] = [
    {
      id: 'pentest',
      label: 'PenTest Lab',
      icon: <Terminal className="w-4 h-4" />,
      badge: '140+ ARSENAL',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'forensics',
      label: 'Forensic Investigations',
      icon: <Fingerprint className="w-4 h-4" />,
      badge: '52 PLATFORMS',
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'soc',
      label: 'SOC Lab',
      icon: <Activity className="w-4 h-4" />,
      badge: '177+ COUNTRIES',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'vuln-news',
      label: 'Vuln News',
      icon: <Bug className="w-4 h-4" />,
      badge: 'CVE RADAR',
      color: 'from-amber-500 to-red-600',
    },
  ];

  return (
    <header className="w-full flex items-center justify-between pb-3 border-b border-cyan-500/15 gap-4">
      {/* Left Capsule: Brand & Classification */}
      <div className="flex items-center gap-3 bg-[#0a101d]/90 border border-cyan-500/20 px-4 py-2 rounded-2xl shadow-inner backdrop-blur-md">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          <Shield className="w-4 h-4 text-black stroke-[2.5]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-widest text-white uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
              Zak's Spider
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              v4.9.2
            </span>
          </div>
          <p className="text-[9px] tracking-wider text-slate-400 uppercase flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Classified // Cyber Recon Matrix
          </p>
        </div>
      </div>

      {/* Center: The 3 Primary Hubs */}
      <nav className="flex items-center p-1.5 rounded-2xl bg-[#080d18]/95 border border-cyan-500/20 shadow-[0_0_25px_rgba(0,0,0,0.6)] backdrop-blur-xl gap-2">
        {hubs.map((hub) => {
          const isActive = activeHub === hub.id;
          return (
            <button
              key={hub.id}
              onClick={() => onSelectHub(hub.id)}
              className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <span className={`${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'text-slate-400'}`}>
                {hub.icon}
              </span>
              <span>{hub.label}</span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                  isActive
                    ? 'bg-cyan-400 text-black font-extrabold shadow-[0_0_8px_rgba(0,240,255,0.6)]'
                    : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                }`}
              >
                {hub.badge}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_#00f0ff]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Capsule: AI Cyber Swarm, DEFCON 1, UTC Clock & Telemetry Indicators */}
      <div className="flex items-center gap-2.5">
        {/* Global GEOINT Sovereign 3D Cockpit Launcher */}
        {onOpenGodsEye && (
          <button
            onClick={onOpenGodsEye}
            title="Launch Global GEOINT Sovereign 3D Cockpit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/60 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Global GEOINT</span>
            <span className="px-1 py-0.2 rounded bg-cyan-500 text-black text-[9px] font-black">3D</span>
          </button>
        )}

        {/* Virtual SOC AI Swarm Launcher Button */}
        {onOpenAiSwarm && (
          <button
            onClick={onOpenAiSwarm}
            title="Launch Virtual SOC AI Cyber Swarm"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-cyan-500/30 border border-cyan-400/60 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">AI Swarm</span>
            <span className="px-1 py-0.2 rounded bg-purple-500 text-white text-[9px] font-black">5</span>
          </button>
        )}

        {/* DEFCON 1 Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-bold font-mono">
          <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>DEFCON 1</span>
          <span className="text-[10px] text-red-300/70 border-l border-red-500/30 pl-2">
            ACTIVE SURGE
          </span>
        </div>

        {/* Live Clock & Audio Mute Capsule matching wireframe */}
        <div className="flex items-center gap-2.5 bg-[#0a101d]/90 border border-cyan-500/20 px-3.5 py-2 rounded-2xl shadow-inner font-mono text-xs text-slate-300 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span className="text-[11px] tracking-wider">{currentTime || 'SYNCING UTC...'}</span>
          </div>

          <div className="w-[1px] h-4 bg-cyan-500/20 mx-1" />

          {/* Audio toggle button */}
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            title={audioMuted ? 'Telemetry Audio Muted' : 'Telemetry Audio Live'}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 border border-slate-700/60 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Live stream status dot */}
          <div className="relative flex items-center justify-center w-3 h-3" title="Worldwide Cyber Attack Pipeline Online">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute" />
          </div>
        </div>
      </div>
    </header>
  );
};
