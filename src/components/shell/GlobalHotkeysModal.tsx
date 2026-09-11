import React, { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

interface GlobalHotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalHotkeysModal: React.FC<GlobalHotkeysModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const SHORTCUT_SECTIONS = [
    {
      title: 'Global Navigation & Workspaces',
      shortcuts: [
        { keys: ['Ctrl', 'K'], label: 'Global Omnibar & Quick Launcher' },
        { keys: ['Alt', '1'], label: 'Switch to SOC & Live Telemetry Hub' },
        { keys: ['Alt', '2'], label: 'Switch to Threat Intel & CISA KEV Hub' },
        { keys: ['Alt', '3'], label: 'Switch to DFIR Forensics & OSINT Hub' },
        { keys: ['Alt', '4'], label: 'Switch to Offensive Recon & PenTest Hub' },
        { keys: ['Alt', '5'], label: 'Switch to The Spider Recon & Link-Graph Suite' },
        { keys: ['Alt', 'S'], label: 'Toggle Autonomous AI Cyber Swarm & War Room' },
        { keys: ['Alt', 'G'], label: 'Open Global GEOINT 3D Viewshed & CCTV Network' },
      ],
    },
    {
      title: 'Operational Shortcuts & Controls',
      shortcuts: [
        { keys: ['?'], label: 'Toggle this Shortcuts & Hotkeys Reference' },
        { keys: ['Esc'], label: 'Dismiss active modal, drawer, or flyout' },
        { keys: ['Enter'], label: 'Execute active terminal query or prompt' },
        { keys: ['Ctrl', 'C'], label: 'Copy defanged IOC, hash, or Sigma rule' },
      ],
    },
    {
      title: 'Hub-Specific Workstation Hotkeys',
      shortcuts: [
        { keys: ['1-Click'], label: 'Block IP / Emit iptables drop rule in SOC' },
        { keys: ['1-Click'], label: 'Defang URL/IP into hxxp:// [.] in Forensics' },
        { keys: ['1-Click'], label: 'Generate Sigma/YARA Rule for active CVE' },
        { keys: ['1-Click'], label: 'Export NIST SP 800-61 Incident Dossier' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-2xl rounded-2xl bg-[#090e1a] border border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden font-sans text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#070b14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Keyboard Shortcuts & Hotkeys HUD
              </h2>
              <p className="text-[11px] text-slate-400">
                Tier-1 Security Workstation Rapid Navigation (Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">?</kbd> to toggle)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto font-sans">
          {SHORTCUT_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>{section.title}</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {section.shortcuts.map((sc, scIdx) => (
                  <div
                    key={scIdx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#070b14]/70 border border-slate-800/60 hover:border-slate-700 transition-colors"
                  >
                    <span className="text-slate-300 font-medium">{sc.label}</span>
                    <div className="flex items-center gap-1 shrink-0 font-mono">
                      {sc.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-200 shadow-sm">
                            {k}
                          </kbd>
                          {kIdx < sc.keys.length - 1 && (
                            <span className="text-slate-500 text-[10px]">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#070b14] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Enterprise SecOps Station // Zak's Spider</span>
          <span className="flex items-center gap-1 text-slate-400">
            Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] text-slate-300">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
