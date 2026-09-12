import React, { useState } from 'react';
import { 
  Skull, Fingerprint, Terminal, Globe2, ShieldAlert, Bug, Crosshair, 
  Share2, Wifi, Database, Cpu, Radio, UserCheck, 
  MapPin, PhoneCall, FileText, Search, AtSign, Key,
  Flame, Layers, ShieldCheck, Activity, ChevronLeft, ChevronRight,
  Scissors, Lock, FileCode, Camera
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
      case 'spider':
        return [
          { id: 'attack-surface', label: 'Attack Surface', icon: <Globe2 className="w-4 h-4 text-cyan-400" /> },
          { id: 'link-graph', label: 'Threat Link-Graph', icon: <Share2 className="w-4 h-4 text-indigo-400" /> },
          { id: 'identity', label: 'OSINT Identity', icon: <Fingerprint className="w-4 h-4 text-emerald-400" /> },
          { id: 'ransomware', label: 'Dark Web & Ransomware', icon: <Skull className="w-4 h-4 text-rose-400" /> },
        ];
      case 'pentest':
        return [
          { id: 'webrecon', label: 'Web Recon Station', icon: <Globe2 className="w-4 h-4 text-emerald-400" /> },
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
          { id: 'memory', label: 'Memory & Process Tree', icon: <Cpu className="w-4 h-4 text-purple-400" /> },
          { id: 'pcap', label: 'PCAP & JA3 Protocol', icon: <Wifi className="w-4 h-4 text-indigo-400" /> },
          { id: 'evtx', label: 'EVTX Threat Hunter', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
          { id: 'evidence', label: 'Evidence & Hasher', icon: <Lock className="w-4 h-4 text-emerald-400" /> },
          { id: 'exif', label: 'EXIF & Steg Inspector', icon: <Camera className="w-4 h-4 text-amber-400" /> },
          { id: 'defanger', label: 'IOC Defanger', icon: <Scissors className="w-4 h-4 text-blue-400" /> },
          { id: 'username', label: 'Sherlock OSINT', icon: <Search className="w-4 h-4 text-slate-300" /> },
          { id: 'gis', label: 'GIS & Wilayas', icon: <MapPin className="w-4 h-4 text-teal-400" /> },
          { id: 'dossier', label: 'Intelligence Dossier', icon: <FileText className="w-4 h-4 text-cyan-400" /> },
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
      className={`flex flex-col justify-between py-2 rounded-none bg-[#000000] border border-neutral-800 shrink-0 select-none font-mono transition-all duration-150 ${
        isExpanded ? 'w-48 px-2' : 'w-11 px-1'
      }`}
    >
      <div className="flex flex-col gap-2">
        {/* Header with expand/collapse toggle */}
        <div className={`flex items-center pb-2 border-b border-neutral-800 ${isExpanded ? 'justify-between px-1' : 'justify-center'}`}>
          {isExpanded && (
            <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase">
              {getHubTitle()}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Navigation' : 'Expand Navigation'}
            className="w-6 h-6 flex items-center justify-center rounded-none text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent hover:border-neutral-700 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Dynamic Nav Pips */}
        <div className="flex flex-col gap-0.5">
          {pips.map((pip) => {
            const isActive = activeSubCategory === pip.id;
            return (
              <button
                key={pip.id}
                onClick={() => onSelectSubCategory(pip.id)}
                title={!isExpanded ? pip.label : undefined}
                className={`relative group flex items-center rounded-none text-xs transition-colors cursor-pointer font-mono ${
                  isExpanded ? 'px-2 py-1.5 gap-2 text-left' : 'w-8 h-8 mx-auto justify-center'
                } ${
                  isActive
                    ? 'bg-neutral-900 border-l-2 border-cyan-400 text-cyan-300 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950 border-l-2 border-transparent'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-neutral-400'}>
                  {pip.icon}
                </span>

                {isExpanded && (
                  <span className="truncate flex-1 font-mono text-[11px]">
                    {pip.label}
                  </span>
                )}

                {/* Subtle active pip indicator */}
                {isActive && !isExpanded && (
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Indicator */}
      <div className={`pt-2 border-t border-neutral-800 flex items-center ${isExpanded ? 'justify-between px-1.5 text-[9px] font-mono text-neutral-500' : 'justify-center'}`}>
        {isExpanded ? (
          <>
            <span>NODE ONLINE</span>
            <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse" />
          </>
        ) : (
          <div className="w-1.5 h-1.5 rounded-none bg-emerald-400" title="Node Online" />
        )}
      </div>
    </aside>
  );
};
