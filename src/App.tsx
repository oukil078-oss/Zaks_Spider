import React, { useState, useEffect, useCallback } from 'react';
import { SpiderWebCanvas } from './components/canvas/SpiderWebCanvas';
import { SpiderHeader } from './components/layout/SpiderHeader';
import { PentestLabView } from './components/pentest/PentestLabView';
import { WebSpiderView } from './components/crawler/WebSpiderView';
import { SecondBrainView } from './components/brain/SecondBrainView';
import { api } from './services/api';
import { 
  SpiderTabId, 
  BrainNoteItem, 
  PentestCommandItem, 
  ScrapedResult, 
  ThreatAnalysis 
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SpiderTabId>('pentest');
  const [notes, setNotes] = useState<BrainNoteItem[]>([]);
  const [commands, setCommands] = useState<PentestCommandItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Trigger Notification Toast
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Load Initial Data
  const loadData = useCallback(async () => {
    try {
      const [loadedNotes, loadedCommands] = await Promise.all([
        api.getNotes(),
        api.getCommands(),
      ]);
      setNotes(loadedNotes);
      setCommands(loadedCommands);
      if (loadedNotes.length > 0 && !selectedNoteId) {
        setSelectedNoteId(loadedNotes[0].id);
      }
    } catch (e) {
      console.error('[App] Failed to load data:', e);
    }
  }, [selectedNoteId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keyboard Shortcuts: Alt+1, Alt+2, Alt+3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '1') setActiveTab('pentest');
      if (e.altKey && e.key === '2') setActiveTab('crawler');
      if (e.altKey && e.key === '3') setActiveTab('brain');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save Note Handler
  const handleSaveNote = async (note: BrainNoteItem) => {
    await api.saveNote(note);
    await loadData();
    showToast(`✓ Note "${note.title}" weaved into Second Brain`);
  };

  // Delete Note Handler
  const handleDeleteNote = async (id: string) => {
    await api.deleteNote(id);
    await loadData();
    showToast('✓ Note deleted from Second Brain');
  };

  // Save New Pentest Command Handler
  const handleSaveNewCommand = async (cmd: PentestCommandItem) => {
    await api.saveCustomCommand(cmd);
    await loadData();
    showToast(`✓ Custom payload "${cmd.title}" saved to arsenal`);
  };

  // Weave Command into Second Brain Note
  const handleWeaveCommandToBrain = async (cmd: PentestCommandItem) => {
    const noteTitle = `${cmd.tool.toUpperCase()} — ${cmd.title}`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '');
    const newNote: BrainNoteItem = {
      id: `cmd-note-${Date.now()}`,
      title: noteTitle,
      path: `Commands/${cleanTitle}.md`,
      relativePath: `Commands/${cleanTitle}.md`,
      category: 'Pentest Arsenal',
      tags: ['command', cmd.tool, ...(cmd.tags || [])],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'Pentest Arsenal',
        tool: cmd.tool,
        platform: cmd.platform || 'Cross-Platform',
      },
      links: ['eJPTv2 & OSCP Penetration Testing Methodology'],
      wordCount: 180,
      content: `# 🕷️ ${noteTitle}

## ⚡ Command Syntax
\`\`\`bash
${cmd.command}
\`\`\`

## 📝 Operational Directive
${cmd.description}

### Platform & Category
- **Category:** ${cmd.category}
- **Platform:** ${cmd.platform || 'Cross-Platform'}
- **Tool:** \`${cmd.tool}\`
`,
    };

    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveTab('brain');
    showToast(`🕸️ Command "${cmd.title}" weaved into Neural Web!`);
  };

  // Weave Scraped Target Result into Second Brain Note
  const handleWeaveScrapedResultToBrain = async (result: ScrapedResult, analysis?: ThreatAnalysis) => {
    const noteTitle = `Target Recon — ${result.domain.toUpperCase()}`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '');
    const subList = result.subdomains.slice(0, 15).map(s => `- \`${s}\``).join('\n');
    const emailList = result.emails.slice(0, 10).map(e => `- \`${e}\``).join('\n') || '- None harvested';

    const newNote: BrainNoteItem = {
      id: `target-note-${Date.now()}`,
      title: noteTitle,
      path: `Targets/${cleanTitle}.md`,
      relativePath: `Targets/${cleanTitle}.md`,
      category: 'Target Recon',
      tags: ['target', 'recon', 'osint', result.domain],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'Target Recon',
        target_ip: result.osint?.target_ip,
        threat_level: analysis?.threatLevel || 'EVALUATED',
      },
      links: ['Arachnid Web Crawler & Threat Intelligence Architecture'],
      wordCount: 320,
      content: `# 🕷️ Target Reconnaissance Dossier: ${result.domain}

- **URL:** \`${result.url}\`
- **Host IP:** \`${result.osint?.target_ip || 'Resolved'}\`
- **Web Server:** \`${result.metadata.server || 'Unknown'}\`
- **Security Headers Grade:** \`${result.osint?.security_headers?.grade || 'N/A'}\`
- **Estimated Threat Level:** \`${analysis?.threatLevel || 'INFORMATIONAL'}\`

---

## 🌐 Discovered Subdomains (${result.subdomains.length})
${subList}

## ✉️ Harvested Personnel Emails (${result.emails.length})
${emailList}

## 🛡️ AI Threat Assessment
${analysis?.rawAnalysis || 'Automated perimeter profile captured.'}
`,
    };

    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveTab('brain');
    showToast(`🕸️ Target ${result.domain} weaved into Second Brain!`);
  };

  return (
    <div className="relative min-h-screen bg-[#06090e] text-gray-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col">
      {/* Interactive Spiderweb Particle Canvas in Background */}
      <SpiderWebCanvas intensity={1.1} />

      {/* Cyber Header Navigation */}
      <SpiderHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        commandCount={commands.length}
        noteCount={notes.length}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-cyan-950/90 border border-cyan-400/40 text-cyan-200 text-xs font-mono shadow-2xl backdrop-blur-md animate-bounce">
          <span>{notification}</span>
        </div>
      )}

      {/* Main Module Content */}
      <main className="relative z-10 flex-1 pb-16">
        {activeTab === 'pentest' && (
          <PentestLabView
            commands={commands}
            onSaveNewCommand={handleSaveNewCommand}
            onWeaveCommandToBrain={handleWeaveCommandToBrain}
          />
        )}

        {activeTab === 'crawler' && (
          <WebSpiderView
            onWeaveScrapedResultToBrain={handleWeaveScrapedResultToBrain}
          />
        )}

        {activeTab === 'brain' && (
          <SecondBrainView
            notes={notes}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            selectedNoteId={selectedNoteId}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/15 bg-black/60 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">ZAK'S SPIDER</span>
            <span>•</span>
            <span>Cyber Recon, Pentest Arsenal & Neural Web</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-400">● VERCEL SERVERLESS READY</span>
            <span>•</span>
            <span className="text-purple-400">● ADAPTIVE DATABASE ENGINE</span>
            <span>•</span>
            <span className="text-cyan-400">● ZERO CONFIG OUT-OF-THE-BOX</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
