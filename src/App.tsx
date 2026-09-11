// ==========================================
// SPIDER — CYBER THREAT INTELLIGENCE & OPERATIONS WORKSTATION
// 4 Primary Hubs: SOC & Telemetry, Threat Intel & KEV, Forensics & OSINT, Offensive Recon
// ==========================================

import React, { useState, useEffect } from 'react';
import { ConsoleFrame } from './components/shell/ConsoleFrame';
import { TopBar } from './components/shell/TopBar';
import { NavRail } from './components/shell/NavRail';
import { CommandPaletteModal } from './components/shell/CommandPaletteModal';
import { GlobalHotkeysModal } from './components/shell/GlobalHotkeysModal';
import { SettingsDrawer } from './components/shell/SettingsDrawer';
import { SocView } from './components/views/SocView';
import { PentestView } from './components/views/PentestView';
import { ForensicsView } from './components/views/ForensicsView';
import { VulnNewsView } from './components/views/VulnNewsView';
import { SpiderConsoleView, SpiderTab } from './components/spider/SpiderConsoleView';
import { CyberAiSwarm } from './components/ai/CyberAiSwarm';
import { MainHubId, VulnNewsItem } from './types';

export const App: React.FC = () => {
  // Primary Operations Hub: 'soc' | 'vuln-news' | 'forensics' | 'pentest'
  const [activeHub, setActiveHub] = useState<MainHubId>('soc');

  // Active subcategory selection for NavRail
  const [activeSubCategory, setActiveSubCategory] = useState<string>('globe');

  // Virtual SOC Cyber AI Swarm state
  const [isAiSwarmOpen, setIsAiSwarmOpen] = useState(false);
  const [swarmPrompt, setSwarmPrompt] = useState<string | undefined>(undefined);
  const [swarmContext, setSwarmContext] = useState<string | undefined>(undefined);

  // Global Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Hotkeys HUD and Settings Drawer States
  const [isHotkeysOpen, setIsHotkeysOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Synchronize default subcategory when changing hubs
  const handleSelectHub = (hub: MainHubId, defaultSub?: string) => {
    setActiveHub(hub);
    if (defaultSub) {
      setActiveSubCategory(defaultSub);
    } else if (hub === 'spider') {
      setActiveSubCategory('attack-surface');
    } else if (hub === 'pentest') {
      setActiveSubCategory('ALL');
    } else if (hub === 'forensics') {
      setActiveSubCategory('username');
    } else if (hub === 'soc') {
      setActiveSubCategory('globe');
    } else if (hub === 'vuln-news') {
      setActiveSubCategory('all');
    }
  };

  const handleOpenSwarm = (initialPrompt?: string, cveContext?: VulnNewsItem) => {
    setSwarmPrompt(initialPrompt);
    if (cveContext) {
      setSwarmContext(`${cveContext.cveID}: ${cveContext.vulnerabilityName} (${cveContext.product})`);
    } else {
      setSwarmContext(undefined);
    }
    setIsAiSwarmOpen(true);
  };

  const handlePivotToPentest = (cmdOrTool: string) => {
    setActiveHub('pentest');
    setActiveSubCategory('ALL');
  };

  // Keyboard shortcuts (Ctrl+K = Omnibar, Alt+1 = SOC, Alt+2 = Vuln, Alt+3 = Forensics, Alt+4 = PenTest, Alt+S = AI)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K: Omnibar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      // ? or Shift + /: Toggle Hotkeys modal (when not inside an input/textarea)
      if (
        (e.key === '?' || (e.shiftKey && e.key === '/')) &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsHotkeysOpen(prev => !prev);
        return;
      }

      if (e.altKey) {
        if (e.key === '1') handleSelectHub('soc', 'globe');
        else if (e.key === '2') handleSelectHub('vuln-news', 'all');
        else if (e.key === '3') handleSelectHub('forensics', 'username');
        else if (e.key === '4') handleSelectHub('pentest', 'ALL');
        else if (e.key.toLowerCase() === 's') setIsAiSwarmOpen((prev) => !prev);
        else if (e.key.toLowerCase() === 'g') {
          setActiveHub('forensics');
          setActiveSubCategory('gods-eye');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ConsoleFrame>
      {/* 1. Executive Top Bar with Hub Switcher & Omnibar Trigger */}
      <TopBar
        activeHub={activeHub}
        onSelectHub={handleSelectHub}
        onOpenAiSwarm={() => handleOpenSwarm('Audit global cyber attack trajectories and advise priority defense posture.')}
        onOpenGodsEye={() => {
          setActiveHub('forensics');
          setActiveSubCategory('gods-eye');
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenHotkeys={() => setIsHotkeysOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Main Workbench Stage Layout (NavRail on Left + Full-Height Active View on Right) */}
      <div className="flex-1 w-full flex items-stretch gap-2.5 overflow-hidden">
        {/* Left Collapsible Navigation Rail */}
        <NavRail
          activeHub={activeHub}
          activeSubCategory={activeSubCategory}
          onSelectSubCategory={(cat) => setActiveSubCategory(cat)}
        />

        {/* Center Stage & Primary Viewport */}
        <main className="flex-1 h-full overflow-hidden flex flex-col bg-[#0b101b] border border-slate-800/80 rounded-lg">
          {activeHub === 'soc' && (
            <SocView
              activeSubSection={activeSubCategory}
              onOpenAiSwarm={(prompt) => handleOpenSwarm(prompt)}
            />
          )}
          {activeHub === 'spider' && (
              <SpiderConsoleView
                onPivotToSoc={(ip) => {
                  handleSelectHub('soc');
                }}
                onPivotToForensics={(target) => {
                  handleSelectHub('forensics');
                }}
                onPivotToSwarm={(prompt) => {
                  handleOpenSwarm(prompt);
                }}
                initialTab={
                  activeSubCategory === 'link-graph' ? 'LINK_GRAPH' :
                  activeSubCategory === 'identity' ? 'IDENTITY' :
                  activeSubCategory === 'ransomware' ? 'RANSOMWARE' :
                  'ATTACK_SURFACE'
                }
              />
            )}

            {activeHub === 'pentest' && (
            <PentestView initialCategory={activeSubCategory} />
          )}
          {activeHub === 'forensics' && (
            <ForensicsView initialTab={activeSubCategory as any} />
          )}
          {activeHub === 'vuln-news' && (
            <VulnNewsView
              activeSubSection={activeSubCategory}
              onPivotToPentest={handlePivotToPentest}
              onOpenAiSwarm={handleOpenSwarm}
            />
          )}
        </main>
      </div>

      {/* 3. Global Omnibar / Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectHub={handleSelectHub}
        onOpenAiSwarm={handleOpenSwarm}
      />

      {/* 4. Autonomous Multi-Agent AI Cyber Swarm Modal */}
      <CyberAiSwarm
        isOpen={isAiSwarmOpen}
        onClose={() => setIsAiSwarmOpen(false)}
        initialPrompt={swarmPrompt}
        contextPayload={swarmContext}
        onPivotToPentest={handlePivotToPentest}
      />

      {/* 5. Global Hotkeys HUD Modal */}
      <GlobalHotkeysModal
        isOpen={isHotkeysOpen}
        onClose={() => setIsHotkeysOpen(false)}
      />

      {/* 6. Workstation Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </ConsoleFrame>
  );
};

export default App;

