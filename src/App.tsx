// ==========================================
// ZAK'S SPIDER — CYBERNETIC COMMAND DECK (App.tsx)
// Autonomous Cyber Recon, Pentest Arsenal & Neural Knowledge Web
// Powered by GPT-6 Astra, CISA KEV Radar & Operator Dossier
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { SpiderWebCanvas } from './components/canvas/SpiderWebCanvas';
import { SpiderHeader } from './components/layout/SpiderHeader';
import { PentestLabView } from './components/pentest/PentestLabView';
import { WebSpiderView } from './components/crawler/WebSpiderView';
import { SecondBrainView } from './components/brain/SecondBrainView';
import { VulnNewsView } from './components/news/VulnNewsView';
import { PentestBuddyView } from './components/copilot/PentestBuddyView';
import { OperatorProfileView } from './components/profile/OperatorProfileView';
import { ForensicsInvestigationView } from './components/forensics/ForensicsInvestigationView';
import { api } from './services/api';
import { 
  SpiderTabId, 
  BrainNoteItem, 
  PentestCommandItem, 
  ScrapedResult, 
  ThreatAnalysis,
  VulnNewsItem,
  ForensicCaseDossier,
  UsernameCheckResult,
  IpLookupResult,
  PhoneLookupResult
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SpiderTabId>('pentest');
  const [notes, setNotes] = useState<BrainNoteItem[]>([]);
  const [commands, setCommands] = useState<PentestCommandItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');

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

  // Keyboard Shortcuts: Alt+1 through Alt+7
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === '1') setActiveTab('pentest');
        else if (e.key === '2') setActiveTab('crawler');
        else if (e.key === '3') setActiveTab('forensics');
        else if (e.key === '4') setActiveTab('brain');
        else if (e.key === '5') setActiveTab('vuln-news');
        else if (e.key === '6') setActiveTab('copilot');
        else if (e.key === '7') setActiveTab('operator');
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
      links: ['eJPTv2 & OSCP Penetration Testing Methodology', 'Arachnid Web Crawler & Threat Intelligence Architecture'],
      wordCount: 190,
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

${cmd.howToUse ? `### Execution Notes\n${cmd.howToUse}\n` : ''}
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

  // Weave CVE & Triage into Second Brain Note
  const handleWeaveCveToBrain = async (cve: VulnNewsItem, analysis?: string) => {
    const noteTitle = `Vulnerability — ${cve.cveID} (${cve.product})`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '');

    const newNote: BrainNoteItem = {
      id: `cve-note-${Date.now()}`,
      title: noteTitle,
      path: `Vulnerabilities/${cleanTitle}.md`,
      relativePath: `Vulnerabilities/${cleanTitle}.md`,
      category: 'Vulnerabilities',
      tags: ['cve', 'zero-day', cve.severity?.toLowerCase() || 'high', cve.vendorProject.toLowerCase()],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'Vulnerabilities',
        cve_id: cve.cveID,
        severity: cve.severity || 'CRITICAL',
        vendor: cve.vendorProject,
        product: cve.product,
        ransomware_linked: cve.knownRansomwareCampaignUse || 'Unknown',
      },
      links: ['eJPTv2 & OSCP Penetration Testing Methodology'],
      wordCount: 280,
      content: `# 🚨 ${cve.cveID}: ${cve.vulnerabilityName}

- **Vendor / Project:** \`${cve.vendorProject}\`
- **Target Product:** \`${cve.product}\`
- **Severity Level:** \`${cve.severity || 'CRITICAL'}\` (CVSS: \`${cve.cvssScore || 9.8}\`)
- **Date Added to CISA KEV:** \`${cve.dateAdded}\`
- **Known Ransomware Exploitation:** \`${cve.knownRansomwareCampaignUse || 'Unknown'}\`

---

## 📌 Vulnerability Synopsis
${cve.shortDescription}

## ⚡ Required Remediation Action
${cve.requiredAction || 'Apply latest vendor security updates immediately.'}

---

## 🧠 AI Threat Triage Analysis
${analysis || 'No detailed analysis attached.'}
`,
    };

    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveTab('brain');
    showToast(`🕸️ Vulnerability ${cve.cveID} weaved into Second Brain!`);
  };

  // Route to Copilot with initial prompt
  const handleSendToCopilot = (prompt: string) => {
    setCopilotInitialPrompt(prompt);
    setActiveTab('copilot');
  };

  // Weave Chat transcript into Second Brain Note
  const handleWeaveChatToBrain = async (title: string, markdownContent: string) => {
    const cleanTitle = title.replace(/[\\/:*?"<>|]/g, '');
    const newNote: BrainNoteItem = {
      id: `chat-note-${Date.now()}`,
      title: title,
      path: `ChatLogs/${cleanTitle}.md`,
      relativePath: `ChatLogs/${cleanTitle}.md`,
      category: 'AI Copilot Sessions',
      tags: ['ai-copilot', 'chat', 'intelligence'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: title,
        category: 'AI Copilot Sessions',
      },
      links: ['eJPTv2 & OSCP Penetration Testing Methodology'],
      wordCount: markdownContent.split(/\s+/).length,
      content: markdownContent,
    };

    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveTab('brain');
    showToast('🕸️ Copilot conversation session weaved into Second Brain!');
  };

  // Weave Operator Profile to Second Brain
  const handleWeaveProfileToBrain = async () => {
    const noteTitle = 'Operator Dossier — Zakarya Oukil';
    const newNote: BrainNoteItem = {
      id: 'operator-dossier-root',
      title: noteTitle,
      path: 'Operator/Zakarya_Oukil_Dossier.md',
      relativePath: 'Operator/Zakarya_Oukil_Dossier.md',
      category: 'Operator Dossier',
      tags: ['operator', 'bio', 'ejptv2', 'portfolio'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        title: noteTitle,
        category: 'Operator Dossier',
        operator: 'Zakarya Oukil',
        handle: 'oukil078',
        role: 'Offensive Pentester & Fullstack Architect',
      },
      links: ['eJPTv2 & OSCP Penetration Testing Methodology', 'Arachnid Web Crawler & Threat Intelligence Architecture'],
      wordCount: 420,
      content: `# 👤 Operator Master Dossier: Zakarya Oukil

## 🛡️ Profile & Specialization
- **Title:** Offensive Pentester, Cybersecurity Student & Fullstack Multi-Agent Architect
- **Certification Roadmap:** eJPTv2 Candidate (INE Security, 2026 - 88% Progress)
- **Flagship Architectures:** \`Zak_OS\`, \`Zaks_Spider\`, \`DzPrimeAcademy\`
- **GitHub:** [https://github.com/oukil078](https://github.com/oukil078)
- **Contact:** \`oukil078@gmail.com\`

## ⚔️ Technical Arsenal
- **Offensive Security:** Nmap, Metasploit, Gobuster, FFUF, SQLmap, Burp Suite, LinPEAS, WinPEAS, Wireshark, Chisel SOCKS5 Pivoting
- **Fullstack & Systems:** TypeScript, React 18, Vite, Tailwind CSS, Node.js, Express, Python (Asyncio), Docker, Vercel Serverless
- **AI Intelligence:** GPT-6 Astra, Qwen 3.8, DeepSeek V4 Flash, Multi-Agent Prompting & Autonomous Crews
`,
    };

    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveTab('brain');
    showToast('🕸️ Operator Dossier weaved into Neural Web!');
  };

  // Weave Consolidated Case Dossier to Second Brain
  const handleWeaveDossierToBrain = async (dossier: ForensicCaseDossier, report: string) => {
    const noteTitle = `OSINT Case Dossier: ${dossier.caseId} (${dossier.targetHandle || 'Multi-Vector'})`;
    const cleanTitle = noteTitle.replace(/[\\/:*?"<>|]/g, '');
    const newNote: BrainNoteItem = {
      id: `case-dossier-${Date.now()}`,
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
      links: ['Arachnid Web Crawler & Threat Intelligence Architecture', 'eJPTv2 & OSCP Penetration Testing Methodology'],
      wordCount: report.split(/\s+/).length,
      content: `# 🛡️ ${noteTitle}\n\n${report}`,
    };
    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveTab('brain');
    showToast(`🕸️ Forensic Dossier ${dossier.caseId} weaved into Neural Web!`);
  };

  // Weave Single Username Finding to Second Brain
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
    setActiveTab('brain');
    showToast(`🕸️ Profile @${item.username} on ${item.platform} weaved into Brain!`);
  };

  // Weave IP Finding to Second Brain
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
      content: `# 🌐 ${noteTitle}\n\n- **Target IP / Host:** \`${ip.query}\`\n- **Location:** ${ip.city}, ${ip.regionName}, ${ip.country} (${ip.lat}, ${ip.lon})\n- **Autonomous System (ASN):** ${ip.as}\n- **ISP:** ${ip.isp}\n- **Reverse DNS:** \`${ip.reverse || ip.query}\`\n- **Threat Score:** ${ip.threatScore || 10}/100\n- **Proxy / VPN:** ${ip.proxy ? 'YES' : 'NO'}\n- **Datacenter / Hosting:** ${ip.hosting ? 'YES' : 'NO'}`,
    };
    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveTab('brain');
    showToast(`🕸️ IP Intel for ${ip.query} weaved into Brain!`);
  };

  // Weave Phone Finding to Second Brain
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
        lineType: phone.lineType,
      },
      links: ['Arachnid Web Crawler & Threat Intelligence Architecture'],
      wordCount: 130,
      content: `# 📱 ${noteTitle}\n\n- **E.164 Number:** \`${phone.formattedE164}\`\n- **International Notation:** \`${phone.formattedInternational}\`\n- **Country:** ${phone.countryFlag} ${phone.countryName} (${phone.countryCode})\n- **Line Type:** ${phone.lineType}\n- **Carrier:** ${phone.carrier || 'Standard Operator'}\n- **Risk Evaluation:** ${phone.riskScore} (${phone.riskReason || 'ITU-T compliant'})\n\n### OSINT Pivots\n${phone.pivotLinks.map(p => `- [${p.label}](${p.url}): ${p.description}`).join('\n')}`,
    };
    await api.saveNote(newNote);
    await loadData();
    setSelectedNoteId(newNote.id);
    setActiveTab('brain');
    showToast(`🕸️ Phone Record ${phone.formattedE164} weaved into Brain!`);
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
        {/* 1. Pentest Lab */}
        {activeTab === 'pentest' && (
          <PentestLabView
            commands={commands}
            onSaveNewCommand={handleSaveNewCommand}
            onWeaveCommandToBrain={handleWeaveCommandToBrain}
          />
        )}

        {/* 2. Web Crawler */}
        {activeTab === 'crawler' && (
          <WebSpiderView
            onWeaveScrapedResultToBrain={handleWeaveScrapedResultToBrain}
          />
        )}

        {/* 3. Forensics & OSINT Investigation Matrix */}
        {activeTab === 'forensics' && (
          <ForensicsInvestigationView
            onWeaveDossierToBrain={handleWeaveDossierToBrain}
            onWeaveUsernameResultToBrain={handleWeaveUsernameFindingToBrain}
            onWeaveIpResultToBrain={handleWeaveIpFindingToBrain}
            onWeavePhoneResultToBrain={handleWeavePhoneFindingToBrain}
          />
        )}

        {/* 3. Neural Web */}
        {activeTab === 'brain' && (
          <SecondBrainView
            notes={notes}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            selectedNoteId={selectedNoteId}
          />
        )}

        {/* 4. Vuln News (LIVE KEV) */}
        {activeTab === 'vuln-news' && (
          <VulnNewsView
            onWeaveCveToBrain={handleWeaveCveToBrain}
            onSendToCopilot={handleSendToCopilot}
          />
        )}

        {/* 5. AI Pentest Buddy */}
        {activeTab === 'copilot' && (
          <PentestBuddyView
            onWeaveChatToBrain={handleWeaveChatToBrain}
            initialPrompt={copilotInitialPrompt}
          />
        )}

        {/* 6. Operator Profile */}
        {activeTab === 'operator' && (
          <OperatorProfileView
            onWeaveProfileToBrain={handleWeaveProfileToBrain}
            onOpenTab={setActiveTab}
          />
        )}
      </main>

      {/* Professional Tactical Footer */}
      <footer className="relative z-10 border-t border-cyan-500/15 bg-black/70 backdrop-blur-xl py-3.5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold tracking-wider">ZAK'S SPIDER</span>
            <span>•</span>
            <span className="text-gray-400">Cyber Recon, Pentest Arsenal & Neural Web</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ACTIVE CORE: GPT-6-ASTRA
            </span>
            <span>•</span>
            <span className="text-cyan-400">CIPHER: TLS 1.3 AES-256</span>
            <span>•</span>
            <span className="text-purple-400">OPERATOR: ZAKARYA OUKIL</span>
            <span>•</span>
            <span className="text-gray-400">GRID: ONLINE (24ms)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
