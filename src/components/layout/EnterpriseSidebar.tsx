// ==========================================
// ZAK'S SPIDER — ENTERPRISE DYNAMIC SIDEBAR
// Contextual tools & sub-tabs tailored for each of the 3 Primary Hubs
// ==========================================

import React from 'react';
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
  Layers,
  ChevronRight,
  ChevronLeft,
  Crosshair,
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
  // Navigation config per Hub
  const getNavItems = () => {
    switch (activeHub) {
      case 'pentest':
        return {
          title: 'PENTEST LAB MODULES',
          subtitle: 'Offensive & Defensive Matrix',
          badge: '116+ TOOLS',
          badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
          items: [
            {
              id: 'arsenal',
              label: 'Command Arsenal',
              description: '116+ Offensive & Defensive Tools',
              icon: Terminal,
              badge: '116',
              hotkey: 'Alt+1'
            },
            {
              id: 'crawler',
              label: 'Web Crawler Spider',
              description: 'Endpoint & Tech Discovery',
              icon: Bug,
              badge: 'RECON',
              hotkey: 'Alt+2'
            },
            {
              id: 'vuln-news',
              label: 'Vuln News & Attack Map',
              description: 'Live CVEs & 3D Attack Globe',
              icon: Newspaper,
              badge: 'REALTIME',
              hotkey: 'Alt+3'
            },
            {
              id: 'payloads',
              label: 'Payload & Shell Crafter',
              description: 'Reverse Shells & Encoders',
              icon: Zap,
              badge: 'NEW',
              hotkey: 'Alt+4'
            }
          ]
        };

      case 'forensics':
        return {
          title: 'DIGITAL FORENSICS MATRIX',
          subtitle: 'Deep OSINT Investigation',
          badge: '52 PLATFORMS',
          badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
          items: [
            {
              id: 'dossier',
              label: 'Case Dossier & Correlator',
              description: 'Audit Report & AI Correlation',
              icon: FileText,
              badge: 'GPT-6',
              hotkey: 'Alt+1'
            },
            {
              id: 'username',
              label: 'Username Footprint',
              description: 'Sherlock 52 Platform Probe',
              icon: Users,
              badge: '52',
              hotkey: 'Alt+2'
            },
            {
              id: 'name',
              label: 'Full Name & Alias Dorks',
              description: 'Permutations & Corporate Leads',
              icon: UserCheck,
              badge: 'PRO',
              hotkey: 'Alt+3'
            },
            {
              id: 'ip',
              label: 'IP Geolocation & Wilayas',
              description: '1,541 Communes & TopoJSON',
              icon: Globe,
              badge: '3D GIS',
              hotkey: 'Alt+4'
            },
            {
              id: 'phone',
              label: 'Telephony & Mobile OSINT',
              description: 'ITU-T E.164 & Carrier Lookup',
              icon: Phone,
              badge: 'CARRIER',
              hotkey: 'Alt+5'
            },
            {
              id: 'neural-web',
              label: 'Neural Web Knowledge Mesh',
              description: 'Radial 7-Cluster Target Constellation',
              icon: Network,
              badge: 'RADIAL',
              hotkey: 'Alt+6'
            }
          ]
        };

      case 'soc':
      default:
        return {
          title: 'SECURITY OPERATIONS CENTER',
          subtitle: 'Mission Defense & Telemetry',
          badge: 'DEFCON 1',
          badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
          items: [
            {
              id: 'overview',
              label: 'SOC Command Center',
              description: '3D Threat Radar & Telemetry',
              icon: ShieldAlert,
              badge: 'ACTIVE',
              hotkey: 'Alt+1'
            },
            {
              id: 'aerospace',
              label: 'Aerospace & Starlink HUD',
              description: 'SpaceX Telemetry & Ground Towers',
              icon: Satellite,
              badge: 'SATELLITE',
              hotkey: 'Alt+2'
            },
            {
              id: 'events',
              label: 'Live Events & Honeypot',
              description: 'Simulate Kali Nmap & Logs',
              icon: Activity,
              badge: 'IDS LOGS',
              hotkey: 'Alt+3'
            },
            {
              id: 'vectors',
              label: 'Vector Velocity Analytics',
              description: 'DDoS & Malware Histograms',
              icon: Radio,
              badge: 'TRAFFIC',
              hotkey: 'Alt+4'
            },
            {
              id: 'copilot',
              label: 'AI Threat Hunter Copilot',
              description: 'Interactive GPT-6 Astra Agent',
              icon: Bot,
              badge: 'AI SOC',
              hotkey: 'Alt+5'
            }
          ]
        };
    }
  };

  const navConfig = getNavItems();

  return (
    <aside
      className={`h-full bg-[#06090e]/95 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between transition-all duration-300 select-none z-30 ${
        isCollapsed ? 'w-16' : 'w-64 sm:w-72'
      }`}
    >
      {/* Top Header / Section Identifier */}
      <div className="p-3 border-b border-white/10">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                  {navConfig.title}
                </span>
              </div>
              <p className="text-[9px] font-mono text-zinc-500 mt-0.5">
                {navConfig.subtitle}
              </p>
            </div>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${navConfig.badgeColor}`}>
              {navConfig.badge}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className={`text-[9px] font-mono font-bold p-1 rounded border ${navConfig.badgeColor}`}>
              {activeHub.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {navConfig.items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSubTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs transition-all relative group ${
                isActive
                  ? 'bg-gradient-to-r from-white/10 to-transparent text-white border border-white/15 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {/* Left active marker strip */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r" />
              )}

              <div className={`p-1.5 rounded-lg border transition-colors ${
                isActive 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                  : 'bg-zinc-900 border-white/5 text-zinc-400 group-hover:text-zinc-200'
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${
                        isActive 
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                          : 'bg-black/40 text-zinc-500 border-white/5'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Collapse / Expand Toggle */}
      <div className="p-2 border-t border-white/10 flex items-center justify-between">
        {!isCollapsed && (
          <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 px-2">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>SECURE ENCLAVE</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors ml-auto"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
