// ==========================================
// ZAK'S SPIDER — 2027 SILICON VALLEY NAVIGATION RAIL
// Inspired by media_1788987543371.png wireframe
// Sleek, compact vertical rail with glowing indicator pills & instant hotkeys
// ==========================================

import React, { useState } from 'react';
import { 
  Terminal, 
  Bug, 
  Newspaper, 
  Zap, 
  FileText, 
  Users, 
  UserCheck, 
  Globe, 
  Phone, 
  Network, 
  ShieldAlert, 
  Satellite, 
  Activity, 
  Bot, 
  ChevronRight,
  ChevronLeft,
  Lock,
  Radio
} from 'lucide-react';
import type { MainHubId, PenTestSubTab, ForensicsSubTab, SocSubTab } from '../../types';

interface EnterpriseSidebarProps {
  activeHub: MainHubId;
  activeSubTab: string;
  onSelectSubTab: (subTabId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const EnterpriseSidebar: React.FC<EnterpriseSidebarProps> = ({
  activeHub,
  activeSubTab,
  onSelectSubTab,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

  // Navigation config per Hub
  const getNavItems = () => {
    switch (activeHub) {
      case 'pentest':
        return {
          hubTitle: 'PENTEST LAB',
          hubTag: 'ARSENAL',
          themeColor: 'amber',
          items: [
            {
              id: 'arsenal',
              label: 'Command Matrix',
              subLabel: '116+ Exploits & Audits',
              icon: Terminal,
              badge: '116',
              hotkey: 'Alt+1'
            },
            {
              id: 'crawler',
              label: 'Recon Spider',
              subLabel: 'Endpoints & SSL Audit',
              icon: Bug,
              badge: 'SPIDER',
              hotkey: 'Alt+2'
            },
            {
              id: 'vuln-news',
              label: 'Vuln News & Threat Map',
              subLabel: 'Live Zero-Day Radar',
              icon: Newspaper,
              badge: 'LIVE',
              hotkey: 'Alt+3'
            },
            {
              id: 'payloads',
              label: 'Payload Crafter',
              subLabel: 'Reverse Shell Encoders',
              icon: Zap,
              badge: 'CRAFT',
              hotkey: 'Alt+4'
            }
          ]
        };

      case 'forensics':
        return {
          hubTitle: 'FORENSICS MATRIX',
          hubTag: 'OSINT',
          themeColor: 'purple',
          items: [
            {
              id: 'dossier',
              label: 'Intelligence Dossier',
              subLabel: 'AI Correlator & Report',
              icon: FileText,
              badge: 'GPT-6',
              hotkey: 'Alt+1'
            },
            {
              id: 'username',
              label: 'Sherlock Recon',
              subLabel: '52-Platform Scan',
              icon: Users,
              badge: '52',
              hotkey: 'Alt+2'
            },
            {
              id: 'name',
              label: 'Identity Permutations',
              subLabel: 'Corporate Dorks',
              icon: UserCheck,
              badge: 'PRO',
              hotkey: 'Alt+3'
            },
            {
              id: 'ip',
              label: 'Deep GIS Reticle',
              subLabel: '1,541 Communes & Wilayas',
              icon: Globe,
              badge: 'GIS 3D',
              hotkey: 'Alt+4'
            },
            {
              id: 'phone',
              label: 'Telephony OSINT',
              subLabel: 'Carrier & ITU-T E.164',
              icon: Phone,
              badge: 'TEL',
              hotkey: 'Alt+5'
            },
            {
              id: 'neural-web',
              label: 'Neural Second Brain',
              subLabel: '7-Cluster Constellation',
              icon: Network,
              badge: 'MESH',
              hotkey: 'Alt+6'
            }
          ]
        };

      case 'soc':
      default:
        return {
          hubTitle: 'SOC DEFENSE',
          hubTag: 'DEFCON 2',
          themeColor: 'cyan',
          items: [
            {
              id: 'overview',
              label: 'SOC Command Center',
              subLabel: '3D Radar & Worldwide Arcs',
              icon: ShieldAlert,
              badge: 'RADAR',
              hotkey: 'Alt+1'
            },
            {
              id: 'aerospace',
              label: 'Aerospace & Ground Towers',
              subLabel: 'Starlink Telemetry & Defense',
              icon: Satellite,
              badge: 'SAT',
              hotkey: 'Alt+2'
            },
            {
              id: 'events',
              label: 'SIEM Incident Logs',
              subLabel: 'Honeypot & Suricata Feed',
              icon: Activity,
              badge: 'LOGS',
              hotkey: 'Alt+3'
            },
            {
              id: 'vectors',
              label: 'Vector Velocity',
              subLabel: 'DDoS & Traffic Spectrum',
              icon: Radio,
              badge: 'NET',
              hotkey: 'Alt+4'
            },
            {
              id: 'copilot',
              label: 'AI SOC Copilot',
              subLabel: 'GPT-6 Astra Autonomous Agent',
              icon: Bot,
              badge: 'AI SOC',
              hotkey: 'Alt+5'
            }
          ]
        };
    }
  };

  const navConfig = getNavItems();

  const getGlowColor = (isActive: boolean) => {
    if (!isActive) return '';
    if (navConfig.themeColor === 'amber') return 'border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
    if (navConfig.themeColor === 'purple') return 'border-purple-500/40 bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]';
    return 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]';
  };

  const getPillColor = () => {
    if (navConfig.themeColor === 'amber') return 'bg-amber-400';
    if (navConfig.themeColor === 'purple') return 'bg-purple-400';
    return 'bg-cyan-400';
  };

  return (
    <aside
      className={`h-full flex flex-col justify-between select-none z-30 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      } bg-[#070b12]/95 backdrop-blur-2xl border-r border-white/10`}
    >
      {/* Top Rail Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className={`w-2 h-2 rounded-full ${getPillColor()} animate-pulse`} />
            <div className="truncate">
              <div className="text-[11px] font-mono font-bold text-white tracking-wider truncate">
                {navConfig.hubTitle}
              </div>
              <div className="text-[9px] font-mono text-zinc-400 truncate">
                {navConfig.hubTag}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center py-1">
            <div className={`w-2.5 h-2.5 rounded-full ${getPillColor()} animate-pulse shadow-sm`} />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
          title={isCollapsed ? 'Expand rail' : 'Collapse rail'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 py-3 px-2 space-y-1.5 overflow-y-auto">
        {navConfig.items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;

          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => onSelectSubTab(item.id)}
                onMouseEnter={() => setHoveredTabId(item.id)}
                onMouseLeave={() => setHoveredTabId(null)}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-mono transition-all duration-200 relative group ${
                  isActive
                    ? getGlowColor(true) + ' border font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              >
                {/* Active Indicator Pip */}
                {isActive && (
                  <span className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full ${getPillColor()}`} />
                )}

                <div className="flex items-center gap-2.5 truncate">
                  <span className={`p-1 rounded-lg ${isActive ? 'bg-white/10' : 'group-hover:bg-white/5'}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </span>
                  {!isCollapsed && (
                    <div className="text-left truncate">
                      <div className="truncate text-xs">{item.label}</div>
                      <div className="text-[9px] text-zinc-500 truncate">{item.subLabel}</div>
                    </div>
                  )}
                </div>

                {!isCollapsed && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                    isActive 
                      ? 'border-white/20 bg-white/10 text-white' 
                      : 'border-white/5 bg-white/[0.03] text-zinc-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Hover Tooltip when collapsed */}
              {isCollapsed && hoveredTabId === item.id && (
                <div className="absolute left-16 top-1/2 -translate-y-1/2 z-50 px-3 py-2 rounded-xl bg-[#0e1626] border border-white/15 shadow-2xl text-left pointer-events-none whitespace-nowrap min-w-[140px]">
                  <div className="text-xs font-mono font-bold text-white flex items-center justify-between gap-3">
                    <span>{item.label}</span>
                    <span className="text-[9px] text-zinc-400 font-normal">{item.hotkey}</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-0.5">{item.subLabel}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rail Bottom Footer: Operational Security Status */}
      <div className="p-3 border-t border-white/10">
        {!isCollapsed ? (
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span className="text-zinc-400">TLS 1.3 / AES-256</span>
            </div>
            <span className="text-emerald-400 font-bold">SECURE</span>
          </div>
        ) : (
          <div className="flex justify-center" title="TLS 1.3 Encrypted">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
