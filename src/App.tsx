// ==========================================
// ZAK'S SPIDER — 2027 SILICON VALLEY COMMAND CONSOLE (App.tsx)
// 4 Primary Operations Hubs: PenTest Lab, Forensic Investigations, SOC Lab, Vuln News
// Plus Multi-Agent Virtual SOC Cyber Swarm & Active IDS Sensor
// ==========================================

import React, { useState, useEffect } from 'react';
import { ConsoleFrame } from './components/shell/ConsoleFrame';
import { TopBar } from './components/shell/TopBar';
import { NavRail } from './components/shell/NavRail';
import { BentoTopRow } from './components/shell/BentoTopRow';
import { SocView } from './components/views/SocView';
import { PentestView } from './components/views/PentestView';
import { ForensicsView } from './components/views/ForensicsView';
import { VulnNewsView } from './components/views/VulnNewsView';
import { CyberAiSwarm } from './components/ai/CyberAiSwarm';
import { MainHubId, VulnNewsItem } from './types';

export const App: React.FC = () => {
  // Primary Operations Hub: 'pentest' | 'forensics' | 'soc' | 'vuln-news'
  const [activeHub, setActiveHub] = useState<MainHubId>('soc');

  // Active subcategory / pip selection for the NavRail
  const [activeSubCategory, setActiveSubCategory] = useState<string>('globe');

  // Virtual SOC Cyber AI Swarm state
  const [isAiSwarmOpen, setIsAiSwarmOpen] = useState(false);
  const [swarmPrompt, setSwarmPrompt] = useState<string | undefined>(undefined);
  const [swarmContext, setSwarmContext] = useState<string | undefined>(undefined);

  // Synchronize default subcategory when changing hubs
  const handleSelectHub = (hub: MainHubId) => {
    setActiveHub(hub);
    if (hub === 'pentest') setActiveSubCategory('ALL');
    else if (hub === 'forensics') setActiveSubCategory('username');
    else if (hub === 'soc') setActiveSubCategory('globe');
    else if (hub === 'vuln-news') setActiveSubCategory('all');
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

  // Keyboard shortcuts (Alt+1 = PenTest, Alt+2 = Forensics, Alt+3 = SOC, Alt+4 = Vuln News, Alt+S = AI Swarm)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === '1') handleSelectHub('pentest');
        else if (e.key === '2') handleSelectHub('forensics');
        else if (e.key === '3') handleSelectHub('soc');
        else if (e.key === '4') handleSelectHub('vuln-news');
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
      {/* 1. High-Tech Top Bar with all 4 Hubs + AI Swarm Launcher */}
      <TopBar
        activeHub={activeHub}
        onSelectHub={handleSelectHub}
        attackCountToday={48192}
        onOpenAiSwarm={() => handleOpenSwarm('Audit global cyber attack trajectories and advise priority defense posture.')}
        onOpenGodsEye={() => {
          setActiveHub('forensics');
          setActiveSubCategory('gods-eye');
        }}
      />

      {/* 2. Top Bento Row (3 Cards: APS Ticker, Surface, CISA KEV Radar) - Hidden in Global GEOINT for maximum screen real estate */}
      {!(activeHub === 'forensics' && activeSubCategory === 'gods-eye') && (
        <BentoTopRow
          totalAttacksCount={48192}
          onSelectCveCard={() => {
            setActiveHub('vuln-news');
            setActiveSubCategory('zero-days');
          }}
        />
      )}

      {/* 3. Main Stage Layout (NavRail on Left + Active Hub View on Right) */}
      <div className="flex-1 w-full flex items-stretch gap-3 overflow-hidden">
        {/* Left Vertical Rail matching wireframe */}
        <NavRail
          activeHub={activeHub}
          activeSubCategory={activeSubCategory}
          onSelectSubCategory={(cat) => setActiveSubCategory(cat)}
        />

        {/* Center Stage & Right Deck */}
        <main className="flex-1 h-full overflow-hidden flex flex-col">
          {activeHub === 'soc' && (
            <SocView
              activeSubSection={activeSubCategory}
              onOpenAiSwarm={(prompt) => handleOpenSwarm(prompt)}
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

      {/* 4. Autonomous Multi-Agent AI Cyber Swarm Modal */}
      <CyberAiSwarm
        isOpen={isAiSwarmOpen}
        onClose={() => setIsAiSwarmOpen(false)}
        initialPrompt={swarmPrompt}
        contextPayload={swarmContext}
        onPivotToPentest={handlePivotToPentest}
      />
    </ConsoleFrame>
  );
};

export default App;
