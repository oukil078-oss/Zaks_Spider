import React, { useState, useEffect, useMemo } from 'react';
import { 
  Terminal, ShieldAlert, ShieldCheck, Activity, Globe2, 
  Layers, FileCode, Bot, Shield, ExternalLink, RefreshCw 
} from 'lucide-react';
import { SiemLogWorkbench, ParsedSiemEvent } from '../soc/SiemLogWorkbench';
import { MitreAttackMatrix } from '../soc/MitreAttackMatrix';
import { SoarContainmentPlaybook } from '../soc/SoarContainmentPlaybook';
import { IdsAnomalyMonitor } from '../soc/IdsAnomalyMonitor';
import { IocEnricherDrawer } from '../soc/IocEnricherDrawer';
import { FirewallRuleExporterModal } from '../soc/FirewallRuleExporterModal';
import { Globe3D } from '../globe/Globe3D';
import { GlobalCyberAttack } from '../../types';
import { GLOBAL_THREAT_SEEDS } from '../../data/threatFeed';

interface SocViewProps {
  activeSubSection?: string;
  onOpenAiSwarm?: (initialPrompt?: string) => void;
}

export const SocView: React.FC<SocViewProps> = ({
  activeSubSection = 'siem',
  onOpenAiSwarm,
}) => {
  const [activeTab, setActiveTab] = useState<'siem' | 'mitre' | 'soar' | 'ids' | 'globe'>('siem');

  // Shared Telemetry State
  const [parsedEvents, setParsedEvents] = useState<ParsedSiemEvent[]>([]);
  const [activeTechniqueIds, setActiveTechniqueIds] = useState<string[]>([
    'T1190', 'T1083', 'T1110', 'T1505.003', 'T1548.003', 'T1595'
  ]);

  // IOC Enricher Drawer State
  const [enricherOpen, setEnricherOpen] = useState<boolean>(false);
  const [enricherIp, setEnricherIp] = useState<string | null>(null);

  // Containment Playbook State
  const [containmentTarget, setContainmentTarget] = useState<{
    ip: string;
    port?: number;
    reason: string;
  }>({
    ip: '198.51.100.42',
    port: 443,
    reason: 'CVE-2021-44228 Log4j JNDI Exploit Ingress',
  });

  // Firewall Rule Exporter Modal State
  const [firewallModalOpen, setFirewallModalOpen] = useState(false);
  const [firewallTargetIp, setFirewallTargetIp] = useState('198.51.100.42');
  const [firewallTargetPort, setFirewallTargetPort] = useState<number | undefined>(443);
  const [firewallThreatContext, setFirewallThreatContext] = useState<string>('Perimeter Attack Ingress');

  // Globe Attack Telemetry
  const [globeAttacks, setGlobeAttacks] = useState<GlobalCyberAttack[]>(() => {
    return GLOBAL_THREAT_SEEDS.slice(0, 15).map((seed, idx) => ({
      ...seed,
      id: `atk-${Date.now()}-${idx}`,
      timestamp: new Date(Date.now() - idx * 60000).toLocaleTimeString(),
    }));
  });

  // Sync NavRail subcategory
  useEffect(() => {
    if (activeSubSection === 'siem') setActiveTab('siem');
    else if (activeSubSection === 'mitre') setActiveTab('mitre');
    else if (activeSubSection === 'soar') setActiveTab('soar');
    else if (activeSubSection === 'ids') setActiveTab('ids');
    else if (activeSubSection === 'globe') setActiveTab('globe');
  }, [activeSubSection]);

  // Handle Log Ingestion & ATT&CK Dynamic Sync
  const handleEventsParsed = (events: ParsedSiemEvent[]) => {
    setParsedEvents(events);
    const techSet = new Set<string>();
    events.forEach(e => {
      if (e.mitreTechniqueId) {
        techSet.add(e.mitreTechniqueId);
        if (e.mitreTechniqueId.includes('.')) {
          techSet.add(e.mitreTechniqueId.split('.')[0]);
        }
      }
    });
    if (techSet.size > 0) {
      setActiveTechniqueIds(Array.from(techSet));
    }
  };

  // Open IOC Enricher
  const handleSelectIpForEnrichment = (ip: string) => {
    setEnricherIp(ip);
    setEnricherOpen(true);
  };

  // Open Containment Playbook
  const handleSelectForContainment = (ip: string, port?: number, reason?: string) => {
    setContainmentTarget({
      ip,
      port,
      reason: reason || 'SOC Telemetry Anomaly Ingress',
    });
    setActiveTab('soar');
  };

  // Open Firewall Exporter Modal
  const handleOpenFirewallExporter = (ip: string, port?: number, context?: string) => {
    setFirewallTargetIp(ip);
    setFirewallTargetPort(port);
    setFirewallThreatContext(context || 'Hostile Perimeter Ingress');
    setFirewallModalOpen(true);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-[#000000] font-mono text-neutral-200">
      {/* 1. Master Top Bar: View Mode Switcher + Global SOC Stats */}
      <div className="px-3 py-2 bg-[#0a0a0a] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* View Mode Navigation Tabs */}
        <div className="flex items-center border border-neutral-800">
          <button
            onClick={() => setActiveTab('siem')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'siem'
                ? 'bg-neutral-800 text-white border-b-2 border-cyan-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>SIEM WORKBENCH</span>
          </button>

          <button
            onClick={() => setActiveTab('mitre')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mitre'
                ? 'bg-neutral-800 text-white border-b-2 border-rose-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>ATT&CK MATRIX</span>
            <span className="text-[10px] px-1 py-0.2 bg-rose-950 border border-rose-800 text-rose-300">
              {activeTechniqueIds.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('soar')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'soar'
                ? 'bg-neutral-800 text-white border-b-2 border-emerald-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SOAR PLAYBOOKS</span>
          </button>

          <button
            onClick={() => setActiveTab('ids')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ids'
                ? 'bg-neutral-800 text-white border-b-2 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>IDS SENSORS</span>
          </button>

          <button
            onClick={() => setActiveTab('globe')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'globe'
                ? 'bg-neutral-800 text-white border-b-2 border-indigo-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>3D GEO-HEATMAP</span>
          </button>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenFirewallExporter(containmentTarget.ip, containmentTarget.port, containmentTarget.reason)}
            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>Firewall Exporter</span>
          </button>

          {onOpenAiSwarm && (
            <button
              onClick={() => onOpenAiSwarm(`Perform Tier-3 SOC Root Cause Analysis on current telemetry events (${parsedEvents.length} events, active technique: ${containmentTarget.reason})`)}
              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-cyan-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Triage Swarm</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Primary Workspace Body */}
      <div className="flex-1 w-full overflow-hidden flex flex-col bg-[#000000]">
        {activeTab === 'siem' && (
          <SiemLogWorkbench
            onSelectIpForEnrichment={handleSelectIpForEnrichment}
            onSelectForContainment={handleSelectForContainment}
            onEventsParsed={handleEventsParsed}
          />
        )}

        {activeTab === 'mitre' && (
          <MitreAttackMatrix
            activeTechniqueIds={activeTechniqueIds}
            onSelectTechnique={(techId) => {
              // Can filter SIEM workbench if desired
            }}
          />
        )}

        {activeTab === 'soar' && (
          <SoarContainmentPlaybook
            defaultIp={containmentTarget.ip}
            defaultPort={containmentTarget.port}
            defaultReason={containmentTarget.reason}
            onOpenFirewallModal={handleOpenFirewallExporter}
          />
        )}

        {activeTab === 'ids' && (
          <IdsAnomalyMonitor
            onSelectIpForEnrichment={handleSelectIpForEnrichment}
            onSelectForContainment={handleSelectForContainment}
          />
        )}

        {activeTab === 'globe' && (
          <div className="flex-1 w-full h-full relative bg-[#050505] flex flex-col overflow-hidden">
            <div className="p-2 bg-[#0a0a0a] border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-none bg-indigo-500" />
                <span className="font-bold text-white uppercase">3D GEOGRAPHIC INGRESS VISUALIZATION KIOSK</span>
              </div>
              <span className="text-[11px] text-neutral-500">
                Visual display for tactical briefing screens
              </span>
            </div>

            <div className="flex-1 w-full h-full relative">
              <Globe3D
                attacks={globeAttacks}
                selectedAttack={null}
                onSelectAttack={(atk) => {
                  handleSelectIpForEnrichment(atk.sourceCity || '198.51.100.42');
                }}
                focusCoords={null}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Live IOC Threat Intelligence Enricher Drawer */}
      <IocEnricherDrawer
        ip={enricherIp}
        isOpen={enricherOpen}
        onClose={() => setEnricherOpen(false)}
        onOpenContainment={(ip, port, reason) => {
          handleSelectForContainment(ip, port, reason);
        }}
      />

      {/* 4. Production Firewall Rule Exporter Modal */}
      <FirewallRuleExporterModal
        isOpen={firewallModalOpen}
        onClose={() => setFirewallModalOpen(false)}
        defaultIp={firewallTargetIp}
        defaultPort={firewallTargetPort}
        threatContext={firewallThreatContext}
      />
    </div>
  );
};
