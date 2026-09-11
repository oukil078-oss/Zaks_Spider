import React, { useState, useEffect } from 'react';
import {
  Globe, Share2, Users, Skull, Activity, ShieldCheck,
  ChevronRight, ArrowUpRight, Terminal, Cpu, Layers
} from 'lucide-react';
import { SpiderAttackSurfaceView } from './SpiderAttackSurfaceView';
import { SpiderLinkGraphView } from './SpiderLinkGraphView';
import { SpiderIdentityView } from './SpiderIdentityView';
import { SpiderRansomwareView } from './SpiderRansomwareView';

export type SpiderTab = 'ATTACK_SURFACE' | 'LINK_GRAPH' | 'IDENTITY' | 'RANSOMWARE';

interface SpiderConsoleViewProps {
  onPivotToSoc?: (target: string) => void;
  onPivotToForensics?: (target: string) => void;
  onPivotToSwarm?: (prompt: string) => void;
  initialTab?: SpiderTab;
}

export const SpiderConsoleView: React.FC<SpiderConsoleViewProps> = ({
  onPivotToSoc,
  onPivotToForensics,
  onPivotToSwarm,
  initialTab = 'ATTACK_SURFACE'
}) => {
  const [activeTab, setActiveTab] = useState<SpiderTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [pivotEntity, setPivotEntity] = useState<{ value: string; type?: string } | null>(null);

  const handlePivotToGraph = (entity: string, type?: string) => {
    setPivotEntity({ value: entity, type });
    setActiveTab('LINK_GRAPH');
  };

  const handlePivotToSurface = (domain: string) => {
    setPivotEntity({ value: domain });
    setActiveTab('ATTACK_SURFACE');
  };

  return (
    <div className="flex flex-col h-full bg-[#070b13] text-slate-200 overflow-hidden select-text">
      {/* Spider Command Bar / Sub-Navigation */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-[#090e1b] border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5 pr-4 border-r border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-500/50" />
            <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              THE SPIDER SUITE
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              v4.2.0
            </span>
          </div>

          {/* Module Tabs */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('ATTACK_SURFACE')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === 'ATTACK_SURFACE'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>[1] Attack Surface</span>
            </button>

            <button
              onClick={() => setActiveTab('LINK_GRAPH')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === 'LINK_GRAPH'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>[2] Threat Link-Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('IDENTITY')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === 'IDENTITY'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>[3] OSINT Identity</span>
            </button>

            <button
              onClick={() => setActiveTab('RANSOMWARE')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === 'RANSOMWARE'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Skull className="w-3.5 h-3.5" />
              <span>[4] Dark Web & Ransomware</span>
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px]">Passive CRT.sh: Online</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px]">DLS Tor Feed: 5 Blogs Active</span>
          </div>
        </div>
      </div>

      {/* Module View Body */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'ATTACK_SURFACE' && (
          <SpiderAttackSurfaceView
            onPivotToSoc={onPivotToSoc}
            onPivotToForensics={onPivotToForensics}
            onPivotToSwarm={onPivotToSwarm}
          />
        )}

        {activeTab === 'LINK_GRAPH' && (
          <SpiderLinkGraphView
            onPivotToSoc={onPivotToSoc}
            onPivotToForensics={onPivotToForensics}
            onPivotToSwarm={onPivotToSwarm}
            seedNodeId={pivotEntity?.value}
          />
        )}

        {activeTab === 'IDENTITY' && (
          <SpiderIdentityView
            onPivotToGraph={handlePivotToGraph}
            onPivotToSwarm={onPivotToSwarm}
            onPivotToForensics={onPivotToForensics}
          />
        )}

        {activeTab === 'RANSOMWARE' && (
          <SpiderRansomwareView
            onPivotToSoc={onPivotToSoc}
            onPivotToGraph={handlePivotToGraph}
            onPivotToSurface={handlePivotToSurface}
            onPivotToSwarm={onPivotToSwarm}
          />
        )}
      </div>
    </div>
  );
};
