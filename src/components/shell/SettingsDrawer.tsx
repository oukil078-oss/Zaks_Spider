import React, { useState, useEffect } from 'react';
import { Settings, X, Sliders, Shield, Bell, RefreshCw, Database, Key, Check, Trash2, Cpu } from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  // Settings state
  const [themeMode, setThemeMode] = useState<'slate' | 'high-contrast' | 'cyber'>('slate');
  const [audioAlerts, setAudioAlerts] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(15);
  const [logBufferSize, setLogBufferSize] = useState<number>(500);
  const [apiKeyStatus, setApiKeyStatus] = useState<string>('Free Neural Lanes Active');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

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

  const handleSave = () => {
    setSavedNotice('Settings successfully applied.');
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleResetCache = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('zaks_evidence_locker');
      localStorage.removeItem('zaks_firewall_blocks');
      setSavedNotice('Local operational cache cleared.');
      setTimeout(() => setSavedNotice(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm select-none animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#090e1a] border-l border-slate-700/80 shadow-2xl flex flex-col font-sans text-xs">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 bg-[#070b14] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Workstation Configuration
                </h2>
                <p className="text-[11px] text-slate-400">
                  Telemetry, Refresh Intervals & Storage
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

          {/* Body */}
          <div className="p-5 space-y-6 flex-1 overflow-y-auto">
            {savedNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{savedNotice}</span>
              </div>
            )}

            {/* Section 1: Appearance & UI Palette */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span>Theme & Color Profile</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setThemeMode('slate')}
                  className={`p-2.5 rounded-lg border text-center font-medium cursor-pointer transition-all ${
                    themeMode === 'slate'
                      ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                      : 'bg-[#070b14] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-slate-400 mx-auto mb-1.5" />
                  <span>Enterprise Slate</span>
                </button>

                <button
                  onClick={() => setThemeMode('high-contrast')}
                  className={`p-2.5 rounded-lg border text-center font-medium cursor-pointer transition-all ${
                    themeMode === 'high-contrast'
                      ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                      : 'bg-[#070b14] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-amber-400 mx-auto mb-1.5" />
                  <span>High Contrast</span>
                </button>

                <button
                  onClick={() => setThemeMode('cyber')}
                  className={`p-2.5 rounded-lg border text-center font-medium cursor-pointer transition-all ${
                    themeMode === 'cyber'
                      ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                      : 'bg-[#070b14] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-cyan-400 mx-auto mb-1.5" />
                  <span>Tactical Cyan</span>
                </button>
              </div>
            </div>

            {/* Section 2: Ingestion & Telemetry */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>Telemetry Ingestion & Buffers</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#070b14] border border-slate-800">
                  <div>
                    <div className="text-slate-200 font-medium">Auto-Refresh Interval</div>
                    <div className="text-[10px] text-slate-500">How often CTI and SOC feeds re-poll</div>
                  </div>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none"
                  >
                    <option value={5}>5 seconds</option>
                    <option value={15}>15 seconds (Default)</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>60 seconds</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#070b14] border border-slate-800">
                  <div>
                    <div className="text-slate-200 font-medium">SIEM Live Event Buffer</div>
                    <div className="text-[10px] text-slate-500">Max in-memory telemetry records</div>
                  </div>
                  <select
                    value={logBufferSize}
                    onChange={(e) => setLogBufferSize(Number(e.target.value))}
                    className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none"
                  >
                    <option value={100}>100 events</option>
                    <option value={500}>500 events (Default)</option>
                    <option value={1000}>1,000 events</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#070b14] border border-slate-800">
                  <div>
                    <div className="text-slate-200 font-medium">Audio Alert Signals</div>
                    <div className="text-[10px] text-slate-500">Audible chimes on Critical IDS events</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioAlerts}
                    onChange={(e) => setAudioAlerts(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Neural Gateway & API Keys */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>AI Neural Gateway Uplink</span>
              </div>

              <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Gateway Status:</span>
                  <span className="text-emerald-400 font-mono font-bold">ExperientialLabs Free 0$/M Active</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  Default neural model routing connects to DeepSeek V4.1 Flash and GPT-5.6 Luna without requiring personal billing.
                </div>
              </div>
            </div>

            {/* Section 4: Data & Local Storage */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Evidence Locker & Storage</span>
              </div>

              <button
                onClick={handleResetCache}
                className="w-full p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 hover:border-red-500/60 text-red-300 flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Local Evidence & Firewall Cache</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-[#070b14] flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
