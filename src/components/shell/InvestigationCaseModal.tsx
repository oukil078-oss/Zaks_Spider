import React, { useState, useEffect } from 'react';
import {
  Briefcase, ShieldAlert, Target, Globe, Pin,
  Copy, Check, Plus, Trash2, ArrowRight, ExternalLink,
  X, Save, FileText, Download, Zap
} from 'lucide-react';
import { MainHubId } from '../../types';

export interface InvestigationCase {
  id: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'ROUTINE';
  primaryTarget: string;
  targetType: 'IP' | 'DOMAIN' | 'HASH' | 'IDENTITY';
  analyst: string;
  notes: string;
  iocs: Array<{ type: string; value: string; addedAt: string }>;
  openedAt: string;
}

const DEFAULT_CASE: InvestigationCase = {
  id: 'CASE-2026-092',
  title: 'Perimeter Ingress & JNDI Reconnaissance',
  priority: 'CRITICAL',
  primaryTarget: '198.51.100.42',
  targetType: 'IP',
  analyst: 'Zak (Lead Incident Handler)',
  notes: 'High-volume probing detected targeting API search parameters and administrative endpoints. C2 correlation active.',
  iocs: [
    { type: 'IPv4', value: '198.51.100.42', addedAt: '14:23:10 UTC' },
    { type: 'Domain', value: 'internal-c2.corp-perimeter.org', addedAt: '14:24:05 UTC' },
    { type: 'SHA-256', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', addedAt: '14:26:18 UTC' }
  ],
  openedAt: new Date().toISOString()
};

interface InvestigationCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPivotToHub?: (hub: MainHubId, subCategory?: string) => void;
}

export const InvestigationCaseModal: React.FC<InvestigationCaseModalProps> = ({
  isOpen,
  onClose,
  onPivotToHub
}) => {
  const [activeCase, setActiveCase] = useState<InvestigationCase>(() => {
    try {
      const saved = localStorage.getItem('spider_active_investigation_case');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CASE;
  });

  const [newIocType, setNewIocType] = useState('IPv4');
  const [newIocValue, setNewIocValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveBanner, setSaveBanner] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('spider_active_investigation_case', JSON.stringify(activeCase));
    } catch (e) {}
  }, [activeCase]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddIoc = () => {
    if (!newIocValue.trim()) return;
    const item = {
      type: newIocType,
      value: newIocValue.trim(),
      addedAt: new Date().toLocaleTimeString() + ' UTC'
    };
    setActiveCase(prev => ({
      ...prev,
      iocs: [...prev.iocs, item]
    }));
    setNewIocValue('');
  };

  const handleRemoveIoc = (index: number) => {
    setActiveCase(prev => ({
      ...prev,
      iocs: prev.iocs.filter((_, i) => i !== index)
    }));
  };

  const handleExportDossier = () => {
    const md = `# Active Cyber Investigation Dossier
**Case ID**: ${activeCase.id}
**Title**: ${activeCase.title}
**Priority**: ${activeCase.priority}
**Lead Analyst**: ${activeCase.analyst}
**Primary Target**: ${activeCase.primaryTarget} (${activeCase.targetType})
**Generated**: ${new Date().toUTCString()}

## Executive Summary & Scope
${activeCase.notes}

## Correlated Indicators of Compromise (IOCs)
| Type | Value | Time Added |
|---|---|---|
${activeCase.iocs.map(i => `| ${i.type} | \`${i.value}\` | ${i.addedAt} |`).join('\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-${activeCase.id.toLowerCase()}-dossier.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-text">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0b101b] border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#0e1626] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-800 flex items-center justify-center text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Active Investigation Case Session
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800 font-bold">
                  PERSISTENT PIN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Global operational case context synchronized across SOC, Threat Intel, Forensics, Spider, and Offensive Recon.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Case Identity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Investigation Case ID
              </label>
              <input
                type="text"
                value={activeCase.id}
                onChange={(e) => setActiveCase(p => ({ ...p, id: e.target.value }))}
                className="w-full p-2 rounded-lg bg-[#070b13] border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Severity / Triage Priority
              </label>
              <select
                value={activeCase.priority}
                onChange={(e) => setActiveCase(p => ({ ...p, priority: e.target.value as any }))}
                className="w-full p-2 rounded-lg bg-[#070b13] border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="CRITICAL">CRITICAL (Tier-1 Containment)</option>
                <option value="HIGH">HIGH (Adversary Engagement)</option>
                <option value="ELEVATED">ELEVATED (Probing / Recon)</option>
                <option value="ROUTINE">ROUTINE (Standard Audit)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Incident Title
              </label>
              <input
                type="text"
                value={activeCase.title}
                onChange={(e) => setActiveCase(p => ({ ...p, title: e.target.value }))}
                className="w-full p-2 rounded-lg bg-[#070b13] border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Primary Target (IP, Domain, or Hostname)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={activeCase.primaryTarget}
                  onChange={(e) => setActiveCase(p => ({ ...p, primaryTarget: e.target.value }))}
                  className="flex-1 p-2 rounded-lg bg-[#070b13] border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500 text-xs font-bold"
                />
                <button
                  onClick={() => copyToClipboard(activeCase.primaryTarget, 'tgt')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  {copiedKey === 'tgt' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick-Pivot Actions Bar */}
          <div className="p-3 rounded-xl bg-[#080d18] border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>1-Click Operational Pivots on "{activeCase.primaryTarget}"</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
              <button
                onClick={() => {
                  onPivotToHub?.('pentest', 'webrecon');
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-cyan-300 hover:text-white transition text-center cursor-pointer"
              >
                DNS & Headers
              </button>

              <button
                onClick={() => {
                  onPivotToHub?.('spider', 'attack-surface');
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-emerald-300 hover:text-white transition text-center cursor-pointer"
              >
                Attack Surface
              </button>

              <button
                onClick={() => {
                  onPivotToHub?.('spider', 'link-graph');
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-purple-300 hover:text-white transition text-center cursor-pointer"
              >
                Link Graph
              </button>

              <button
                onClick={() => {
                  onPivotToHub?.('soc', 'globe');
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-red-300 hover:text-white transition text-center cursor-pointer"
              >
                SOC Ingress
              </button>
            </div>
          </div>

          {/* Correlated IOCs Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-slate-400 uppercase font-bold">
                Pinned Indicators of Compromise ({activeCase.iocs.length})
              </label>
              <button
                onClick={handleExportDossier}
                className="text-[10px] text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Export Markdown Dossier</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-[#080d18] border border-slate-800 space-y-2">
              {/* Add IOC bar */}
              <div className="flex items-center space-x-2">
                <select
                  value={newIocType}
                  onChange={(e) => setNewIocType(e.target.value)}
                  className="w-24 p-1.5 rounded-lg bg-[#070b13] border border-slate-800 text-white font-mono text-[11px]"
                >
                  <option value="IPv4">IPv4</option>
                  <option value="Domain">Domain</option>
                  <option value="SHA-256">SHA-256</option>
                  <option value="CVE">CVE</option>
                  <option value="URL">URL</option>
                </select>
                <input
                  type="text"
                  value={newIocValue}
                  onChange={(e) => setNewIocValue(e.target.value)}
                  placeholder="Paste IOC value..."
                  className="flex-1 p-1.5 rounded-lg bg-[#070b13] border border-slate-800 text-white font-mono text-[11px] focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIoc()}
                />
                <button
                  onClick={handleAddIoc}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Pin</span>
                </button>
              </div>

              {/* Pinned list */}
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {activeCase.iocs.map((ioc, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded bg-[#0b101b] border border-slate-800 flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-blue-400 border border-slate-800">
                        {ioc.type}
                      </span>
                      <span className="text-slate-300 font-mono truncate">{ioc.value}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                      <button
                        onClick={() => copyToClipboard(ioc.value, `ioc-${idx}`)}
                        className="text-slate-500 hover:text-white"
                      >
                        {copiedKey === `ioc-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleRemoveIoc(idx)}
                        className="text-slate-600 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#080d18] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Auto-Saved to Workstation LocalStorage</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
          >
            Close & Keep Pinned
          </button>
        </div>
      </div>
    </div>
  );
};
