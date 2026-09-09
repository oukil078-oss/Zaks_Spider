// ==========================================
// ZAK'S SPIDER — 2027 SILICON VALLEY COMMAND CONSOLE (App.tsx)
// Ground-up clean-slate implementation matching wireframe & DeepAstro aesthetic
// 3 Primary Operations Hubs: PenTest Lab, Forensic Investigations, SOC Lab
// ==========================================

import React, { useState, useEffect } from 'react';
import { ConsoleFrame } from './components/shell/ConsoleFrame';
import { TopBar } from './components/shell/TopBar';
import { NavRail } from './components/shell/NavRail';
import { BentoTopRow } from './components/shell/BentoTopRow';
import { SocView } from './components/views/SocView';
import { PentestView } from './components/views/PentestView';
import { ForensicsView } from './components/views/ForensicsView';
import { MainHubId } from './types';

export const App: React.FC = () => {
  // Primary Operations Hub: 'pentest' | 'forensics' | 'soc'
  const [activeHub, setActiveHub] = useState<MainHubId>('soc');

  // Active subcategory / pip selection for the NavRail
  const [activeSubCategory, setActiveSubCategory] = useState<string>('ALL');

  // Synchronize default subcategory when changing hubs
  const handleSelectHub = (hub: MainHubId) => {
    setActiveHub(hub);
    if (hub === 'pentest') setActiveSubCategory('ALL');
    else if (hub === 'forensics') setActiveSubCategory('username');
    else if (hub === 'soc') setActiveSubCategory('globe');
  };

  // Keyboard shortcuts (Alt+1 = PenTest, Alt+2 = Forensics, Alt+3 = SOC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === '1') handleSelectHub('pentest');
        else if (e.key === '2') handleSelectHub('forensics');
        else if (e.key === '3') handleSelectHub('soc');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ConsoleFrame>
      {/* 1. High-Tech Top Bar matching wireframe */}
      <TopBar
        activeHub={activeHub}
        onSelectHub={handleSelectHub}
        attackCountToday={48192}
      />

      {/* 2. Top Bento Row (3 Cards: APS Ticker, Surface, CISA KEV Radar) */}
      <BentoTopRow
        totalAttacksCount={48192}
        onSelectCveCard={() => {
          setActiveHub('pentest');
          setActiveSubCategory('CISA KEV Zero-Days');
        }}
      />

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
          {activeHub === 'soc' && <SocView />}
          {activeHub === 'pentest' && <PentestView initialCategory={activeSubCategory} />}
          {activeHub === 'forensics' && <ForensicsView />}
        </main>
      </div>
    </ConsoleFrame>
  );
};

export default App;
