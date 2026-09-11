import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Terminal, Activity, Fingerprint, Bug, 
  Globe, Shield, Flame, Radio, ArrowRight, CornerDownLeft, 
  Bot, X, Command
} from 'lucide-react';
import { MainHubId } from '../../types';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  hub: MainHubId;
  subCategory?: string;
  action?: () => void;
  icon: React.ReactNode;
  badge?: string;
  description: string;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHub: (hub: MainHubId, subCategory?: string) => void;
  onOpenAiSwarm?: (prompt?: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectHub,
  onOpenAiSwarm,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commandItems: CommandItem[] = useMemo(() => [
    // Primary Hubs
    {
      id: 'hub-soc',
      title: 'SOC & Telemetry Hub',
      category: 'Workspaces',
      hub: 'soc',
      subCategory: 'globe',
      icon: <Activity className="w-4 h-4 text-blue-400" />,
      badge: '177+ NATIONS',
      description: 'Switch to live 3D cyber attack mesh and threat stream.',
    },
    {
      id: 'hub-vuln',
      title: 'Threat Intel & KEV Catalog',
      category: 'Workspaces',
      hub: 'vuln-news',
      subCategory: 'zero-days',
      icon: <Bug className="w-4 h-4 text-amber-400" />,
      badge: 'CISA KEV',
      description: 'Review active zero-days, ransomware vectors, and NVD advisories.',
    },
    {
      id: 'hub-forensics',
      title: 'Forensics & Intelligence Dossier',
      category: 'Workspaces',
      hub: 'forensics',
      subCategory: 'username',
      icon: <Fingerprint className="w-4 h-4 text-purple-400" />,
      badge: '52 PLATFORMS',
      description: 'Investigate usernames, phone numbers, and entity correlation.',
    },
    {
      id: 'hub-geoint',
      title: 'Global GEOINT & 3D Viewshed Cockpit',
      category: 'Intelligence',
      hub: 'forensics',
      subCategory: 'gods-eye',
      icon: <Globe className="w-4 h-4 text-emerald-400" />,
      badge: '6,950+ CAMS',
      description: 'Photorealistic Cesium globe, IP geolocation, and verified CCTV viewsheds.',
    },
    {
      id: 'hub-pentest',
      title: 'Offensive Recon & Arsenal',
      category: 'Workspaces',
      hub: 'pentest',
      subCategory: 'ALL',
      icon: <Terminal className="w-4 h-4 text-slate-400" />,
      badge: '140+ TOOLS',
      description: 'Inspect penetration testing commands, SMB, AD, and network pivoting.',
    },
    // Direct Actions
    {
      id: 'action-ai-swarm',
      title: 'Launch Virtual SOC AI Cyber Swarm',
      category: 'Autonomous AI',
      hub: 'soc',
      icon: <Bot className="w-4 h-4 text-indigo-400" />,
      badge: '5 AGENTS',
      description: 'Multi-agent adversarial triage, threat actor attribution, and sigma rules.',
      action: () => onOpenAiSwarm?.('Audit global cyber attack trajectories and advise priority defense posture.'),
    },
    {
      id: 'action-cisa-kev',
      title: 'Audit CISA Known Exploited Vulnerabilities',
      category: 'Vulnerabilities',
      hub: 'vuln-news',
      subCategory: 'kev',
      icon: <Flame className="w-4 h-4 text-red-400" />,
      badge: 'KEV FILTER',
      description: 'Filter for actively exploited CVEs flagged by federal cybersecurity directives.',
    },
    {
      id: 'action-ids',
      title: 'Active IDS Anomaly Detector',
      category: 'Detection',
      hub: 'soc',
      subCategory: 'ids',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
      badge: 'REALTIME',
      description: 'Inspect live honeypot telemetry, SYN floods, and brute force signatures.',
    },
  ], [onOpenAiSwarm]);

  // Filter commands by search query
  const filteredItems = useMemo(() => {
    if (!search.trim()) return commandItems;
    const q = search.toLowerCase();
    return commandItems.filter(
      item => 
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    );
  }, [search, commandItems]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleExecute = (item: CommandItem) => {
    if (item.action) {
      item.action();
    } else {
      onSelectHub(item.hub, item.subCategory);
    }
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleExecute(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#0c121e] border border-slate-700/70 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3 bg-[#0f1726]">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type a command, CVE, workspace, or search target..."
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-sm font-sans"
          />
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            ESC
          </kbd>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching intelligence workflows or commands found for "{search}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleExecute(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-600/15 border border-blue-500/30 text-white' 
                      : 'hover:bg-slate-800/40 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-md bg-slate-900 border border-slate-800 ${isSelected ? 'text-blue-400 border-blue-500/40' : 'text-slate-400'}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{item.title}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-4 shrink-0">
                    <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-blue-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2 bg-[#090d16] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↵</kbd>
              Execute
            </span>
          </div>
          <span>SPIDER OMNIBAR v2.0</span>
        </div>
      </div>
    </div>
  );
};
