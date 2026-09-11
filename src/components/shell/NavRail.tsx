import React, { useState } from 'react';
import { 
  Terminal, Globe2, ShieldAlert, Bug, Crosshair, 
  Share2, Wifi, Database, Cpu, Radio, UserCheck, 
  MapPin, PhoneCall, FileText, Search, AtSign, Key,
  Flame, Layers, ShieldCheck, Activity, ChevronLeft, ChevronRight,
  Scissors, Lock, FileCode
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
  const [isExpanded, setIsExpanded] = useState(false);

  const getPipsForHub = () => {
    switch (activeHub) {
      case 'pentest':
        return [
          { id: 'ALL', label: 'All Arsenal', icon: <Terminal className="w-4 h-4" /> },
          { id: 'Recon & Scanning', label: 'Recon & Scanning', icon: <Crosshair className="w-4 h-4" /> },
          { id: 'Web Exploitation', label: 'Web Exploitation', icon: <Bug className="w-4 h-4" /> },
          { id: 'Active Directory & Windows', label: 'SMB & Active Directory', icon: <Database className="w-4 h-4" /> },
          { id: 'Privilege Escalation', label: 'Privilege Escalation', icon: <Cpu className="w-4 h-4" /> },
          { id: 'Network & Pivoting', label: 'Network & Pivoting', icon: <Share2 className="w-4 h-4" /> },
          { id: 'Password Cracking', label: 'Password Cracking', icon: <Key className="w-4 h-4" /> },
          { id: 'Metasploit & C2', label: 'Metasploit & C2', icon: <Radio className="w-4 h-4" /> },
        ];
      case 'forensics':
        return [
          { id: 'defanger', label: 'IOC Defanger', icon: <Scissors className="w-4 h-4 text-blue-400" /> },
          { id: 'evidence', label: 'Evidence Locker', icon: <Lock className="w-4 h-4 text-emerald-400" /> },
          { id: 'gods-eye', label: "Global GEOINT 3D", icon: <Globe2 className="w-4 h-4 text-cyan-400" /> },
          { id: 'username', label: 'Sherlock OSINT', icon: <Search className="w-4 h-4" /> },
          { id: 'name', label: 'Subject & Dorks', icon: <AtSign className="w-4 h-4" /> },
          { id: 'phone', label: 'Phone Forensics', icon: <PhoneCall className="w-4 h-4" /> },
          { id: 'gis', label: 'GIS & Wilayas', icon: <MapPin className="w-4 h-4" /> },
          { id: 'dossier', label: 'Intelligence Dossier', icon: <FileText className="w-4 h-4" /> },
        ];
      case 'vuln-news':
        return [
          { id: 'all', label: 'All Vulnerabilities', icon: <Bug className="w-4 h-4" /> },
          { id: 'zero-days', label: 'Active Zero-Days', icon: <Flame className="w-4 h-4 text-amber-400" /> },
          { id: 'ransomware', label: 'Ransomware Vectors', icon: <ShieldAlert className="w-4 h-4 text-red-400" /> },
          { id: 'classics', label: 'Historic Hall of Fame', icon: <Layers className="w-4 h-4" /> },
          { id: 'kev', label: 'CISA KEV Catalog', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
        ];
      case 'soc':
      default:
        return [
          { id: 'globe', label: '3D Attack Globe', icon: <Globe2 className="w-4 h-4" /> },
          { id: 'stream', label: 'Live Attacks Stream', icon: <ShieldAlert className="w-4 h-4" /> },
          { id: 'countries', label: 'Country Threat Mesh', icon: <Radio className="w-4 h-4" /> },
          { id: 'ids', label: 'IDS Anomaly Detector', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
          { id: 'parser', label: 'Raw Log Parser', icon: <FileCode className="w-4 h-4 text-blue-400" /> },
        ];
    }
  };

  const pips = getPipsForHub();

  const getHubTitle = () => {
    switch (activeHub) {
      case 'pentest': return 'ARSENAL';
      case 'forensics': return 'FORENSICS';
      case 'vuln-news': return 'INTEL';
      case 'soc': default: return 'TELEMETRY';
    }
  };

  return (
    <aside 
      className={`flex flex-col justify-between py-2 rounded-lg bg-[#0b101b] border border-slate-800/80 shrink-0 select-none transition-all duration-200 ${
        isExpanded ? 'w-48 px-2' : 'w-12 px-1'
      }`}
    >
      <div className="flex flex-col gap-2">
        {/* Header with expand/collapse toggle */}
        <div className={`flex items-center pb-2 border-b border-slate-800/80 ${isExpanded ? 'justify-between px-1' : 'justify-center'}`}>
          {isExpanded && (
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              {getHubTitle()}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Navigation' : 'Expand Navigation'}
            className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Dynamic Nav Pips */}
        <div className="flex flex-col gap-1">
          {pips.map((pip) => {
            const isActive = activeSubCategory === pip.id;
            return (
              <button
                key={pip.id}
                onClick={() => onSelectSubCategory(pip.id)}
                title={!isExpanded ? pip.label : undefined}
                className={`relative group flex items-center rounded-md text-xs transition-colors cursor-pointer ${
                  isExpanded ? 'px-2.5 py-2 gap-2.5 text-left' : 'w-9 h-9 mx-auto justify-center'
                } ${
                  isActive
                    ? 'bg-blue-600/15 border border-blue-500/40 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                  {pip.icon}
                </span>

                {isExpanded && (
                  <span className="truncate flex-1 font-sans text-xs">
                    {pip.label}
                  </span>
                )}

                {/* Subtle active pip indicator */}
                {isActive && !isExpanded && (
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3.5 bg-blue-500 rounded-r" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Indicator */}
      <div className={`pt-2 border-t border-slate-800/80 flex items-center ${isExpanded ? 'justify-between px-2 text-[10px] font-mono text-slate-500' : 'justify-center'}`}>
        {isExpanded ? (
          <>
            <span>NODE NOMINAL</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </>
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Telemetry Node Nominal" />
        )}
      </div>
    </aside>
  );
};
