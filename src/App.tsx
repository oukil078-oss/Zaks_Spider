// ==========================================
// ZAK'S SPIDER — ENTERPRISE TRI-HUB COMMAND DECK (App.tsx)
// 3 Primary Operations Hubs: PenTest Lab, Forensic Investigations, SOC Lab
// Contextual Dynamic Sidebar, 3D Aerospace Globe, and Neural Knowledge Mesh
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { SpiderWebCanvas } from './components/canvas/SpiderWebCanvas';
import { SpiderHeader } from './components/layout/SpiderHeader';
import { EnterpriseSidebar } from './components/layout/EnterpriseSidebar';
import { SocCommandCenterView } from './components/soc/SocCommandCenterView';
import { AerospaceDefenseView } from './components/soc/AerospaceDefenseView';
import { PentestLabView } from './components/pentest/PentestLabView';
import { PayloadCrafterView } from './components/pentest/PayloadCrafterView';
import { WebSpiderView } from './components/crawler/WebSpiderView';
import { RadialBrainView } from './components/brain/RadialBrainView';
import { SecondBrainView } from './components/brain/SecondBrainView';
import { VulnNewsView } from './components/news/VulnNewsView';
import { PentestBuddyView } from './components/copilot/PentestBuddyView';
import { ForensicsInvestigationView } from './components/forensics/ForensicsInvestigationView';
import { api } from './services/api';
import { 
  MainHubId,
  PenTestSubTab,
  ForensicsSubTab,
  SocSubTab,
  BrainNoteItem, 
  PentestCommandItem, 
  ScrapedResult, 
  VulnNewsItem,
  ForensicCaseDossier,
  UsernameCheckResult,
  IpLookupResult,
  PhoneLookupResult,
  FullNameProfile,
  SocEvent
} from './types';

export const App: React.FC = () => {
  // 1. Primary Operations Hub: 'pentest' | 'forensics' | 'soc'
  const [activeHub, setActiveHub] = useState<MainHubId>('soc');

  // 2. Sub-Tabs per Hub
  const [pentestSubTab, setPentestSubTab] = useState<PenTestSubTab>('arsenal');
  const [forensicsSubTab, setForensicsSubTab] = useState<ForensicsSubTab>('dossier');
  const [socSubTab, setSocSubTab] = useState<SocSubTab>('overview');

  // 3. UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [brainMode, setBrainMode] = useState<'radial' | 'vault'>('radial');
  const [notes, setNotes] = useState<BrainNoteItem[]>([]);
  const [commands, setCommands] = useState<PentestCommandItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');

  // Notification Toast Helper
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

  // Global Keyboard Shortcuts (Alt+1 = PenTest, Alt+2 = Forensics, Alt+3 = SOC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === '1') setActiveHub('pentest');
        else if (e.key === '2') setActiveHub('forensics');
        else if (e.key === '3') setActiveHub('soc');
      }
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

  // Save New Pentest Command
  const handleSaveNewCommand = async (cmd: PentestCommandItem) => {
    await api.saveCommand(cmd);
    await loadData();
    showToast(`✓ Tool "${cmd.title}" added to Arsenal`);
  };

  // Weave Pentest Command to Brain
  const handleWeaveCommandToBrain = async (cmd: PentestCommandItem) => {
    const noteTitle = `Playbook: ${cmd.title} (${cmd.tool})`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '');
    const newNote: BrainNoteItem = {
      id: `cmd-${Date.now()}`,
      title: noteTitle,
      path: `Commands/${cleanTitle}.md`,
      relativePath: `Commands/${cleanTitle}.md`,
      category: 'Commands',
      tags: ['command', cmd.category.toLowerCase(), cmd.tool.toLowerCase(), ...(cmd.tags || [])],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'Commands',
        tool: cmd.tool,
        command: cmd.command,
        branch: cmd.branch,
      },
      links: ['eJPTv2 & OSCP Penetration Testing Methodology'],
      wordCount: 120,
      content: `# 🛠️ ${noteTitle}\n\n- **Tool:** \`${cmd.tool}\`\n- **Category:** ${cmd.category}\n- **Command Template:**\n\`\`\`bash\n${cmd.command}\n\`\`\`\n\n### Description\n${cmd.description}\n\n${cmd.howToUse ? `### Practical Usage\n${cmd.howToUse}\n` : ''}`,
    };
    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveHub('forensics');
    setForensicsSubTab('neural-web');
    showToast(`🕸️ Playbook "${cmd.title}" weaved into Brain!`);
  };

  // Weave Web Spider Result to Brain
  const handleWeaveSpiderResultToBrain = async (result: ScrapedResult) => {
    const noteTitle = `Recon Dossier: ${result.targetUrl}`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '').replace(/https?:\/\//, '');
    const newNote: BrainNoteItem = {
      id: `spider-${Date.now()}`,
      title: noteTitle,
      path: `Recon/${cleanTitle}.md`,
      relativePath: `Recon/${cleanTitle}.md`,
      category: 'Recon & Target Intelligence',
      tags: ['recon', 'spider', 'web-audit'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'Recon & Target Intelligence',
        targetUrl: result.targetUrl,
        securityScore: result.securityScore || 0,
      },
      links: ['Arachnid Web Crawler & Threat Intelligence Architecture'],
      wordCount: 200,
      content: `# 🕷️ ${noteTitle}\n\n- **Target URL:** ${result.targetUrl}\n- **HTTP Status:** ${result.httpStatus}\n- **Security Posture Score:** ${result.securityScore || 70}/100\n\n### Discovered Subdomains\n${(result.subdomains || []).map(s => `- \`${s}\``).join('\n') || '_None_'}\n\n### Discovered Endpoints\n${(result.internalLinks || []).slice(0, 15).map(l => `- [${l}](${l})`).join('\n') || '_None_'}`,
    };
    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveHub('forensics');
    setForensicsSubTab('neural-web');
    showToast(`🕸️ Recon for ${result.targetUrl} weaved into Brain!`);
  };

  // Weave Vulnerability KEV to Brain
  const handleWeaveCveToBrain = async (cve: VulnNewsItem, analysis?: string) => {
    const noteTitle = `CVE Exploit Advisory: ${cve.cveID} — ${cve.vulnerabilityName}`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '');
    const newNote: BrainNoteItem = {
      id: `cve-${Date.now()}`,
      title: noteTitle,
      path: `Vulnerabilities/${cleanTitle}.md`,
      relativePath: `Vulnerabilities/${cleanTitle}.md`,
      category: 'Vulnerabilities & Exploits',
      tags: ['cve', 'zero-day', cve.severity.toLowerCase(), cve.vendorProject.toLowerCase()],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'Vulnerabilities & Exploits',
        cveID: cve.cveID,
        vendor: cve.vendorProject,
        product: cve.product,
        severity: cve.severity,
      },
      links: ['eJPTv2 & OSCP Penetration Testing Methodology'],
      wordCount: 150,
      content: `# 🚨 ${noteTitle}\n\n- **CVE ID:** \`${cve.cveID}\`\n- **Severity:** **${cve.severity}**\n- **Vendor / Product:** ${cve.vendorProject} / ${cve.product}\n- **Ransomware Campaign Linked:** ${cve.knownRansomwareCampaignUse === 'Known' ? '⚠️ YES' : 'NO'}\n\n### Vulnerability Summary\n${cve.shortDescription}\n\n${analysis ? `### AI Threat Analysis\n${analysis}\n` : ''}`,
    };
    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveHub('forensics');
    setForensicsSubTab('neural-web');
    showToast(`🕸️ Advisory for ${cve.cveID} weaved into Brain!`);
  };

  // Weave Forensic Case Dossier to Brain
  const handleWeaveDossierToBrain = async (dossier: ForensicCaseDossier, report: string) => {
    const noteTitle = `Forensic Case Dossier: ${dossier.caseId} — ${dossier.targetHandle || 'Target'}`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '');
    const newNote: BrainNoteItem = {
      id: `dossier-${Date.now()}`,
      title: noteTitle,
      path: `Forensics/${cleanTitle}.md`,
      relativePath: `Forensics/${cleanTitle}.md`,
      category: 'Forensics & OSINT',
      tags: ['osint', 'forensics', 'case-dossier', dossier.targetHandle || 'target'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'Forensics & OSINT',
        caseId: dossier.caseId,
        investigator: dossier.investigator,
        targetHandle: dossier.targetHandle,
        targetIp: dossier.targetIp,
        targetPhone: dossier.targetPhone,
      },
      links: ['Arachnid Web Crawler & Threat Intelligence Architecture'],
      wordCount: report.split(/\s+/).length,
      content: `# 🛡️ ${noteTitle}\n\n${report}`,
    };
    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveHub('forensics');
    setForensicsSubTab('neural-web');
    showToast(`🕸️ Forensic Dossier ${dossier.caseId} weaved into Neural Web!`);
  };

  // Weave Username Result to Brain
  const handleWeaveUsernameFindingToBrain = async (item: UsernameCheckResult) => {
    const noteTitle = `OSINT Profile: ${item.platform} — @${item.username}`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '');
    const newNote: BrainNoteItem = {
      id: `osint-user-${Date.now()}`,
      title: noteTitle,
      path: `Forensics/Profiles/${cleanTitle}.md`,
      relativePath: `Forensics/Profiles/${cleanTitle}.md`,
      category: 'Forensics & OSINT',
      tags: ['osint', 'username', item.platform.toLowerCase(), item.category.toLowerCase()],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'Forensics & OSINT',
        platform: item.platform,
        profileUrl: item.profileUrl,
        verifiedStatus: item.status,
      },
      links: ['Arachnid Web Crawler & Threat Intelligence Architecture'],
      wordCount: 120,
      content: `# 👤 ${noteTitle}\n\n- **Platform:** ${item.platform}\n- **Category:** ${item.category}\n- **Profile URL:** [${item.profileUrl}](${item.profileUrl})\n- **Verification Status:** ${item.status.toUpperCase()}\n- **Latency:** ${item.latencyMs || 0}ms\n\n${item.notes ? `### Metadata Notes\n${item.notes}\n` : ''}`,
    };
    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveHub('forensics');
    setForensicsSubTab('neural-web');
    showToast(`🕸️ Profile @${item.username} on ${item.platform} weaved into Brain!`);
  };

  // Weave IP Result to Brain
  const handleWeaveIpFindingToBrain = async (ip: IpLookupResult) => {
    const noteTitle = `IP Telemetry Dossier: ${ip.query} (${ip.city}, ${ip.countryCode})`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '');
    const newNote: BrainNoteItem = {
      id: `osint-ip-${Date.now()}`,
      title: noteTitle,
      path: `Forensics/IPs/${cleanTitle}.md`,
      relativePath: `Forensics/IPs/${cleanTitle}.md`,
      category: 'Forensics & OSINT',
      tags: ['osint', 'ip-intelligence', ip.countryCode.toLowerCase()],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'Forensics & OSINT',
        query: ip.query,
        city: ip.city,
        country: ip.country,
        asn: ip.as,
        threatScore: ip.threatScore || 0,
      },
      links: ['Arachnid Web Crawler & Threat Intelligence Architecture'],
      wordCount: 160,
      content: `# 🌐 ${noteTitle}\n\n- **Target IP / Host:** \`${ip.query}\`\n- **Location:** ${ip.city}, ${ip.regionName}, ${ip.country} (${ip.lat}, ${ip.lon})\n- **Autonomous System (ASN):** ${ip.as}\n- **ISP:** ${ip.isp}\n- **Reverse DNS:** \`${ip.reverse || ip.query}\`\n- **Threat Score:** ${ip.threatScore || 10}/100`,
    };
    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveHub('forensics');
    setForensicsSubTab('neural-web');
    showToast(`🕸️ IP Intel for ${ip.query} weaved into Brain!`);
  };

  // Weave Phone Result to Brain
  const handleWeavePhoneFindingToBrain = async (phone: PhoneLookupResult) => {
    const noteTitle = `Telephony Record: ${phone.formattedE164} (${phone.countryName})`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '');
    const newNote: BrainNoteItem = {
      id: `osint-phone-${Date.now()}`,
      title: noteTitle,
      path: `Forensics/Telephony/${cleanTitle}.md`,
      relativePath: `Forensics/Telephony/${cleanTitle}.md`,
      category: 'Forensics & OSINT',
      tags: ['osint', 'phone', phone.countryCode.replace('+', '')],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'Forensics & OSINT',
        e164: phone.formattedE164,
        country: phone.countryName,
        carrier: phone.carrierName,
        lineType: phone.lineType,
      },
      links: ['Arachnid Web Crawler & Threat Intelligence Architecture'],
      wordCount: 140,
      content: `# 📱 ${noteTitle}\n\n- **E.164 Standard:** \`${phone.formattedE164}\`\n- **Country / Flag:** ${phone.countryFlag} ${phone.countryName}\n- **Carrier:** ${phone.carrierName}\n- **Line Type:** ${phone.lineType}\n- **Risk Score:** ${phone.riskScore}/100`,
    };
    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveHub('forensics');
    setForensicsSubTab('neural-web');
    showToast(`🕸️ Telephony record ${phone.formattedE164} weaved into Brain!`);
  };

  // Weave Identity Profile to Brain
  const handleWeaveIdentityToBrain = async (profile: FullNameProfile) => {
    const noteTitle = `Identity Matrix: ${profile.fullName} (${profile.company || 'Profile'})`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '');
    const newNote: BrainNoteItem = {
      id: `identity-${Date.now()}`,
      title: noteTitle,
      path: `Forensics/Identities/${cleanTitle}.md`,
      relativePath: `Forensics/Identities/${cleanTitle}.md`,
      category: 'Forensics & OSINT',
      tags: ['osint', 'identity', 'attribution'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'Forensics & OSINT',
        targetName: profile.fullName,
        company: profile.company,
        location: profile.location,
      },
      links: ['Arachnid Web Crawler & Threat Intelligence Architecture'],
      wordCount: 150,
      content: `# 👤 ${noteTitle}\n\n- **Target Name:** ${profile.fullName}\n- **Organization:** ${profile.company || 'Unknown'}\n- **Jurisdiction:** ${profile.location || 'Unknown'}\n\n### Permutations & Aliases\n${profile.knownAliases.map(a => `- \`@${a}\``).join('\n')}\n\n### Probable Emails\n${profile.probableEmails.map(e => `- \`${e.email}\` (${e.confidence}% confidence)`).join('\n')}`,
    };
    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveHub('forensics');
    setForensicsSubTab('neural-web');
    showToast(`🕸️ Identity Matrix for ${profile.fullName} weaved into Brain!`);
  };

  // Weave SOC Event to Brain
  const handleWeaveSocEventToBrain = async (evt: SocEvent) => {
    const noteTitle = `Security Incident: [${evt.severity.toUpperCase()}] ${evt.signature} (${evt.sourceIP})`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '');
    const newNote: BrainNoteItem = {
      id: `incident-${Date.now()}`,
      title: noteTitle,
      path: `SOC/Incidents/${cleanTitle}.md`,
      relativePath: `SOC/Incidents/${cleanTitle}.md`,
      category: 'SOC & Telemetry',
      tags: ['soc', 'honeypot', 'incident', evt.severity.toLowerCase()],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'SOC & Telemetry',
        incidentId: evt.id,
        sourceIP: evt.sourceIP,
        severity: evt.severity,
        targetPort: evt.targetPort,
        actionTaken: evt.actionTaken,
      },
      links: ['Arachnid Web Crawler & Threat Intelligence Architecture'],
      wordCount: 180,
      content: `# 🚨 ${noteTitle}\n\n- **Timestamp:** ${evt.timestamp}\n- **Source IP / Host:** \`${evt.sourceIP}\` (${evt.country})\n- **Target Port / Path:** Port ${evt.targetPort} (\`${evt.requestPath || '/'}\`)\n- **Protocol:** ${evt.protocol}\n- **Action Taken:** \`${evt.actionTaken.toUpperCase()}\`\n- **MITRE ATT&CK Technique:** \`${evt.mitreTechnique || 'T1595 Reconnaissance'}\`\n\n### Tactical Mitigation\n\`\`\`bash\n${evt.tacticalPlaybook || `iptables -A INPUT -s ${evt.sourceIP} -j DROP`}\n\`\`\``,
    };
    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveHub('forensics');
    setForensicsSubTab('neural-web');
    showToast(`🕸️ Incident ${evt.id} weaved into Brain!`);
  };

  const handleSendToCopilot = (prompt: string) => {
    setCopilotInitialPrompt(prompt);
    setActiveHub('soc');
    setSocSubTab('copilot');
  };

  return (
    <div className="relative min-h-screen bg-[#06090e] text-gray-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col">
      {/* Spiderweb Background Particles */}
      <SpiderWebCanvas intensity={0.9} />

      {/* Tri-Hub Top Header (EXACTLY 3 MAIN TABS: PenTest Lab, Forensic Investigations, SOC Lab) */}
      <SpiderHeader
        activeHub={activeHub}
        onSelectHub={setActiveHub}
        pentestCount={commands.length}
        forensicsCount={52}
        socAlertsCount={17}
      />

      {/* Main Workspace Body with Contextual Sidebar */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Contextual Dynamic Sidebar */}
        <EnterpriseSidebar
          activeHub={activeHub}
          activeSubTab={
            activeHub === 'pentest' ? pentestSubTab :
            activeHub === 'forensics' ? forensicsSubTab :
            socSubTab
          }
          onSelectSubTab={(tabId) => {
            if (activeHub === 'pentest') setPentestSubTab(tabId as PenTestSubTab);
            else if (activeHub === 'forensics') setForensicsSubTab(tabId as ForensicsSubTab);
            else setSocSubTab(tabId as SocSubTab);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />

        {/* Content View Router */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* ======================================================== */}
          {/* 1. PENTEST LAB HUB                                       */}
          {/* ======================================================== */}
          {activeHub === 'pentest' && (
            <div className="animate-fadeIn">
              {pentestSubTab === 'arsenal' && (
                <PentestLabView
                  commands={commands}
                  onSaveNewCommand={handleSaveNewCommand}
                  onWeaveCommandToBrain={handleWeaveCommandToBrain}
                />
              )}
              {pentestSubTab === 'crawler' && (
                <WebSpiderView
                  onWeaveScrapedResultToBrain={handleWeaveSpiderResultToBrain}
                />
              )}
              {pentestSubTab === 'vuln-news' && (
                <VulnNewsView
                  onWeaveCveToBrain={handleWeaveCveToBrain}
                  onSendToCopilot={handleSendToCopilot}
                />
              )}
              {pentestSubTab === 'payloads' && (
                <PayloadCrafterView />
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. FORENSIC INVESTIGATIONS HUB                           */}
          {/* ======================================================== */}
          {activeHub === 'forensics' && (
            <div className="animate-fadeIn">
              {forensicsSubTab === 'neural-web' ? (
                <div className="space-y-4">
                  <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0a101a] border border-white/10">
                      <button
                        onClick={() => setBrainMode('radial')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                          brainMode === 'radial'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        🕸️ Radial Constellation (7 Clusters)
                      </button>
                      <button
                        onClick={() => setBrainMode('vault')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                          brainMode === 'vault'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        📄 Document Knowledge Vault ({notes.length})
                      </button>
                    </div>
                  </div>

                  {brainMode === 'radial' ? (
                    <RadialBrainView
                      notes={notes}
                      onSaveNote={handleSaveNote}
                      onDeleteNote={handleDeleteNote}
                    />
                  ) : (
                    <SecondBrainView
                      notes={notes}
                      onSaveNote={handleSaveNote}
                      onDeleteNote={handleDeleteNote}
                      selectedNoteId={selectedNoteId}
                    />
                  )}
                </div>
              ) : (
                <ForensicsInvestigationView
                  activeSubTab={forensicsSubTab}
                  onSelectSubTab={setForensicsSubTab}
                  onWeaveDossierToBrain={handleWeaveDossierToBrain}
                  onWeaveUsernameResultToBrain={handleWeaveUsernameFindingToBrain}
                  onWeaveIpResultToBrain={handleWeaveIpFindingToBrain}
                  onWeavePhoneResultToBrain={handleWeavePhoneFindingToBrain}
                  onWeaveProfileToBrain={handleWeaveIdentityToBrain}
                />
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. SOC LAB HUB                                           */}
          {/* ======================================================== */}
          {activeHub === 'soc' && (
            <div className="animate-fadeIn">
              {socSubTab === 'overview' && (
                <SocCommandCenterView
                  onWeaveEventToBrain={handleWeaveSocEventToBrain}
                />
              )}
              {socSubTab === 'aerospace' && (
                <AerospaceDefenseView />
              )}
              {socSubTab === 'events' && (
                <SocCommandCenterView
                  onWeaveEventToBrain={handleWeaveSocEventToBrain}
                />
              )}
              {socSubTab === 'vectors' && (
                <SocCommandCenterView
                  onWeaveEventToBrain={handleWeaveSocEventToBrain}
                />
              )}
              {socSubTab === 'copilot' && (
                <PentestBuddyView
                  initialPrompt={copilotInitialPrompt}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0a101a] border border-cyan-500/40 text-cyan-200 text-xs font-mono shadow-2xl backdrop-blur-md animate-bounce">
          <span>{notification}</span>
        </div>
      )}

      {/* Professional Tactical Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#06090e]/95 backdrop-blur-xl py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold tracking-wider">ZAK'S SPIDER ENTERPRISE</span>
            <span>•</span>
            <span className="text-zinc-400">Silicon Valley Cybersec Startup Architecture</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              CORE: GPT-6-ASTRA
            </span>
            <span>•</span>
            <span className="text-amber-400">GIS: 1,541 WILAYAS LOADED</span>
            <span>•</span>
            <span className="text-purple-400">OPERATOR: ZAKARYA OUKIL</span>
            <span>•</span>
            <span className="text-cyan-400">STATUS: DEFCON 1</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
