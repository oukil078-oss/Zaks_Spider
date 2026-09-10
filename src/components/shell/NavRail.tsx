import React from 'react';
import { 
  Terminal, Globe2, ShieldAlert, Bug, Crosshair, 
  Share2, Wifi, Database, Cpu, Radio, UserCheck, 
  MapPin, PhoneCall, FileText, Search, AtSign, Key,
  Flame, Layers, ShieldCheck, Activity
} from 'lucide-react';
import { MainHubId } from '../../types';

interface NavRailProps {
  activeHub: MainHubId;
  activeSubCategory: string;
  onSelectSubCategory: (cat: string) => void;
}

export const NavRail: React.FC<NavRailProps> = ({
  activeHub,
  activeSubCategory,
  onSelectSubCategory,
}) => {
  // Navigation pips tailored per hub with direct sub-view binding
  const getPipsForHub = () => {
    switch (activeHub) {
      case 'pentest':
        return [
          { id: 'ALL', label: 'All 140+ Arsenal', icon: <Terminal className="w-4 h-4" /> },
          { id: 'Recon & Scanning', label: 'Recon & Scanning', icon: <Crosshair className="w-4 h-4" /> },
          { id: 'Web Exploitation', label: 'Web & WebDAV Exploitation', icon: <Bug className="w-4 h-4" /> },
          { id: 'Active Directory & Windows', label: 'SMB & Active Directory', icon: <Database className="w-4 h-4" /> },
          { id: 'Privilege Escalation', label: 'Privilege Escalation', icon: <Cpu className="w-4 h-4" /> },
          { id: 'Network & Pivoting', label: 'Network & Pivoting', icon: <Share2 className="w-4 h-4" /> },
          { id: 'Password Cracking', label: 'Password Cracking', icon: <Key className="w-4 h-4" /> },
          { id: 'Metasploit & C2', label: 'Metasploit & C2', icon: <Radio className="w-4 h-4" /> },
        ];
      case 'forensics':
        return [
          { id: 'gods-eye', label: "🛰️ Global GEOINT & Viewsheds", icon: <Globe2 className="w-4 h-4 text-cyan-400" /> },
          { id: 'username', label: 'Sherlock 52-Platform', icon: <Search className="w-4 h-4" /> },
          { id: 'name', label: 'Full Name & Google Dorks', icon: <AtSign className="w-4 h-4" /> },
          { id: 'phone', label: 'Phone Forensics (ITU-T)', icon: <PhoneCall className="w-4 h-4" /> },
          { id: 'gis', label: 'GIS Reticle & 69 Wilayas', icon: <MapPin className="w-4 h-4" /> },
          { id: 'dossier', label: 'Intelligence Dossier', icon: <FileText className="w-4 h-4" /> },
        ];
      case 'vuln-news':
        return [
          { id: 'all', label: 'All Zero-Days & Classics', icon: <Bug className="w-4 h-4" /> },
          { id: 'zero-days', label: '2024–2026 Active Zero-Days', icon: <Flame className="w-4 h-4" /> },
          { id: 'ransomware', label: 'Ransomware Exploited Only', icon: <ShieldAlert className="w-4 h-4" /> },
          { id: 'classics', label: 'Historic Hall of Fame (1999–2019)', icon: <Layers className="w-4 h-4" /> },
          { id: 'kev', label: 'Official CISA KEV Catalog', icon: <ShieldCheck className="w-4 h-4" /> },
        ];
      case 'soc':
      default:
        return [
          { id: 'globe', label: '3D Living Globe (177+ Nations)', icon: <Globe2 className="w-4 h-4" /> },
          { id: 'stream', label: 'Worldwide Attacks Stream', icon: <ShieldAlert className="w-4 h-4" /> },
          { id: 'countries', label: '177+ Country Threat Mesh', icon: <Radio className="w-4 h-4" /> },
          { id: 'ids', label: 'Active IDS Anomaly Detector', icon: <Activity className="w-4 h-4" /> },
        ];
    }
  };

  const pips = getPipsForHub();

  return (
    <aside className="w-14 flex flex-col items-center justify-between py-3 rounded-2xl bg-[#080d18]/90 border border-cyan-500/20 shadow-xl backdrop-blur-xl shrink-0 select-none">
      {/* Top Emblem */}
      <div className="flex flex-col items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-[#0c1424] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.2)] cursor-default"
          title="Zak's Spider Navigation Core"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-60" />
        </div>

        <div className="w-6 h-[1px] bg-cyan-500/20" />

        {/* Dynamic Nav Pips */}
        <div className="flex flex-col items-center gap-2">
          {pips.map((pip) => {
            const isActive = activeSubCategory === pip.id;
            return (
              <button
                key={pip.id}
                onClick={() => onSelectSubCategory(pip.id)}
                title={pip.label}
                className={`relative group w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-cyan-500/40 hover:bg-slate-800/60'
                }`}
              >
                {pip.icon}

                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-cyan-400 rounded-r shadow-[0_0_8px_#00f0ff]" />
                )}

                {/* Tooltip */}
                <div className="absolute left-14 px-2.5 py-1.5 rounded-lg bg-[#0c1424] border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-[0_0_20px_rgba(0,0,0,0.8)] z-50">
                  {pip.label}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0c1424] border-l border-b border-cyan-500/40 rotate-45" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Circle Badge matching wireframe */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-[1px] bg-cyan-500/20" />
        <div 
          className="relative group w-10 h-10 rounded-full bg-gradient-to-br from-emerald-950/80 to-slate-900 border-2 border-emerald-400/50 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(160,185,129,0.3)] hover:scale-105 transition-transform"
          title="Operator: Zak // Tier 5 Clearance"
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080d18] shadow-[0_0_6px_#10b981]" />

          <div className="absolute left-14 bottom-0 px-3 py-2 rounded-xl bg-[#0c1424] border border-emerald-500/40 text-[11px] font-mono text-emerald-300 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-[0_0_20px_rgba(0,0,0,0.8)] z-50">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              OPERATOR: ZAK
            </div>
            <div className="text-slate-400 text-[10px] mt-0.5">Tier 5 Clearance // Node: DZ-ALG</div>
            <div className="text-cyan-400 text-[10px] font-mono mt-0.5">Defensive Grid: ARMED</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
