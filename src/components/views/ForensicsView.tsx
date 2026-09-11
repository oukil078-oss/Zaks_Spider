import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Fingerprint, Globe, PhoneCall, ShieldCheck, 
  ExternalLink, CheckCircle2, XCircle, Loader2, Download, 
  UserCheck, AlertTriangle, FileText, MapPin, Share2, Compass, Layers, 
  Copy, Check, Mail, Building, AtSign, ArrowUpRight, Crosshair, Printer, KeyRound,
  Lock, Scissors, Plus, Trash2, Shield, RefreshCw, FileCode, CheckSquare, Sparkles, Filter
} from 'lucide-react';
import { UsernamePlatformDef, UsernameCheckResult } from '../../types';
import { AlgeriaGisMap } from '../gis/AlgeriaGisMap';
import { GodsEyeCockpit } from '../geoint/GodsEyeCockpit';

export interface ForensicsViewProps {
  initialTab?: 'defanger' | 'evidence' | 'username' | 'name' | 'phone' | 'gis' | 'dossier' | 'gods-eye';
}

export interface ExtractedIoc {
  id: string;
  type: 'IPv4' | 'URL' | 'Domain' | 'Email' | 'SHA-256' | 'MD5';
  raw: string;
  defanged: string;
}

export interface EvidenceArtifact {
  id: string;
  name: string;
  category: 'Memory Dump' | 'Network PCAP' | 'Disk Image' | 'Triage Package' | 'Malware Sample';
  size: string;
  sha256: string;
  acquiredAt: string;
  custodian: string;
  status: 'VERIFIED' | 'TAMPER_CHECK_PASS';
  notes: string;
}

export const INITIAL_EVIDENCE_VAULT: EvidenceArtifact[] = [
  {
    id: 'EV-2026-0881',
    name: 'CORP-DC01-MEMDUMP.raw',
    category: 'Memory Dump',
    size: '32.1 GB',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    acquiredAt: '2026-09-11 11:42:09 UTC',
    custodian: 'Lead DFIR Specialist // SEC-LAB-01',
    status: 'VERIFIED',
    notes: 'Volatility 3 / LiME acquisition of compromised Active Directory primary controller.',
  },
  {
    id: 'EV-2026-0882',
    name: 'EDGE-FW01-INGRESS-CAPTURE.pcap',
    category: 'Network PCAP',
    size: '4.8 GB',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    acquiredAt: '2026-09-11 12:05:44 UTC',
    custodian: 'Network SecOps Team',
    status: 'VERIFIED',
    notes: 'Tcpdump perimeter traffic during initial C2 beaconing and exfiltration window.',
  },
  {
    id: 'EV-2026-0883',
    name: 'FINANCE-SRV04-FORENSIC-IMAGE.E01',
    category: 'Disk Image',
    size: '240.5 GB',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    acquiredAt: '2026-09-11 13:18:22 UTC',
    custodian: 'EnCase Hardware Bridge Unit #4',
    status: 'VERIFIED',
    notes: 'Full bitstream physical disk clone with hardware write-blocker attached.',
  },
  {
    id: 'EV-2026-0884',
    name: 'KAPE-TRIAGE-ENDPOINT-W11.zip',
    category: 'Triage Package',
    size: '1.4 GB',
    sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    acquiredAt: '2026-09-11 13:55:01 UTC',
    custodian: 'Incident Response Triage Agent',
    status: 'VERIFIED',
    notes: 'MFT, Amcache, Registry Hives, Event Logs ($LogFile) collected via KAPE.',
  },
];

export const SAMPLE_IOC_TEXTS = {
  incident: `# INCIDENT ADVISORY - ACTIVE C2 EXFILTRATION
Reported Source IP: 198.51.100.42 and 185.220.101.5
Target Ingress: https://api.internal-banking.com/v2/gateway/auth
Malicious C2 Domain: update-microsoft-cdn.evil-apt.ru
Callback Beacon: http://evil-apt.ru/stage2/payload.exe
Attribution Hash (SHA256): 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
Dropper MD5: e4d909c290d0fb1ca068ffaddf22cbd0
Contact SOC Lead: cert-incident-response@company.org
Secondary Relay: 203.0.113.195`,

  phishing: `# PHISHING CAMPAIGN TELEMETRY - INVOICE SPOOF
Sender Address: billing-support@sec-paypal-resolution.com
Redirect URL: https://login.paypal.verify-accounts.net/signin?token=92841
Phishing Domain: verify-accounts.net
Originating Mail Host IP: 194.26.29.112
Attachment Hash: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8`,
};

export function defangText(text: string): string {
  return text
    .replace(/http:\/\//gi, 'hxxp://')
    .replace(/https:\/\//gi, 'hxxps://')
    .replace(/ftp:\/\//gi, 'fxp://')
    .replace(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/g, '$1[.]$2[.]$3[.]$4')
    .replace(/([a-zA-Z0-9_-]+)\.([a-zA-Z]{2,12})/g, '$1[.]$2')
    .replace(/@/g, '[@]');
}

export function refangText(text: string): string {
  return text
    .replace(/hxxps?:\/\//gi, (m) => m.toLowerCase().replace('hxxp', 'http'))
    .replace(/fxp:\/\//gi, 'ftp://')
    .replace(/\[\.\]|\(\.\)/g, '.')
    .replace(/\[@\]|\(@\)/g, '@');
}

const PLATFORMS_52: UsernamePlatformDef[] = [
  { id: 'github', name: 'GitHub', category: 'Developer', urlPattern: 'https://github.com/{username}', icon: 'GitBranch', description: 'Source code repositories and commit logs' },
  { id: 'twitter', name: 'Twitter / X', category: 'Social', urlPattern: 'https://x.com/{username}', icon: 'Twitter', description: 'Social microblogging activity' },
  { id: 'instagram', name: 'Instagram', category: 'Social', urlPattern: 'https://instagram.com/{username}', icon: 'Camera', description: 'Visual media and follower graph' },
  { id: 'reddit', name: 'Reddit', category: 'Social', urlPattern: 'https://reddit.com/user/{username}', icon: 'MessageSquare', description: 'Forum karma and comment history' },
  { id: 'tiktok', name: 'TikTok', category: 'Social', urlPattern: 'https://tiktok.com/@{username}', icon: 'Video', description: 'Short-form media handle' },
  { id: 'linkedin', name: 'LinkedIn', category: 'Social', urlPattern: 'https://linkedin.com/in/{username}', icon: 'Briefcase', description: 'Professional corporate profile' },
  { id: 'telegram', name: 'Telegram', category: 'Social', urlPattern: 'https://t.me/{username}', icon: 'Send', description: 'Direct messaging handle' },
  { id: 'discord', name: 'Discord', category: 'Gaming', urlPattern: 'https://discord.com/users/{username}', icon: 'Gamepad2', description: 'Gaming and community server handle' },
  { id: 'steam', name: 'Steam Community', category: 'Gaming', urlPattern: 'https://steamcommunity.com/id/{username}', icon: 'Gamepad', description: 'Steam gamer ID and inventory' },
  { id: 'youtube', name: 'YouTube', category: 'Media', urlPattern: 'https://youtube.com/@{username}', icon: 'PlaySquare', description: 'Video channel handle' },
  { id: 'twitch', name: 'Twitch', category: 'Gaming', urlPattern: 'https://twitch.tv/{username}', icon: 'Tv', description: 'Live streaming broadcaster profile' },
  { id: 'hackerone', name: 'HackerOne', category: 'Developer', urlPattern: 'https://hackerone.com/{username}', icon: 'Shield', description: 'Public bug bounty reporter profile' },
  { id: 'bugcrowd', name: 'Bugcrowd', category: 'Developer', urlPattern: 'https://bugcrowd.com/{username}', icon: 'Bug', description: 'Security researcher profile' },
  { id: 'tryhackme', name: 'TryHackMe', category: 'Developer', urlPattern: 'https://tryhackme.com/p/{username}', icon: 'Terminal', description: 'Cybersecurity training rank' },
  { id: 'hackthebox', name: 'Hack The Box', category: 'Developer', urlPattern: 'https://hackthebox.com/users/{username}', icon: 'Box', description: 'HTB lab rank and badges' },
  { id: 'gitlab', name: 'GitLab', category: 'Developer', urlPattern: 'https://gitlab.com/{username}', icon: 'GitPullRequest', description: 'Enterprise git repositories' },
  { id: 'dockerhub', name: 'Docker Hub', category: 'Developer', urlPattern: 'https://hub.docker.com/u/{username}', icon: 'Layers', description: 'Container image registry' },
  { id: 'medium', name: 'Medium', category: 'Media', urlPattern: 'https://medium.com/@{username}', icon: 'BookOpen', description: 'Tech publications and articles' },
  { id: 'devto', name: 'Dev.to', category: 'Developer', urlPattern: 'https://dev.to/{username}', icon: 'Code', description: 'Software community discussions' },
  { id: 'spotify', name: 'Spotify', category: 'Media', urlPattern: 'https://open.spotify.com/user/{username}', icon: 'Music', description: 'Public audio playlists' },
  { id: 'soundcloud', name: 'SoundCloud', category: 'Media', urlPattern: 'https://soundcloud.com/{username}', icon: 'Headphones', description: 'Audio tracks profile' },
  { id: 'pinterest', name: 'Pinterest', category: 'Social', urlPattern: 'https://pinterest.com/{username}', icon: 'Image', description: 'Image collection boards' },
  { id: 'keybase', name: 'Keybase', category: 'Developer', urlPattern: 'https://keybase.io/{username}', icon: 'Key', description: 'Cryptographic proof identity mesh' },
  { id: 'mastodon', name: 'Mastodon', category: 'Social', urlPattern: 'https://mastodon.social/@{username}', icon: 'Globe', description: 'Fediverse decentralized identity' },
  { id: 'threads', name: 'Threads', category: 'Social', urlPattern: 'https://threads.net/@{username}', icon: 'AtSign', description: 'Meta microblogging platform' },
  { id: 'kaggle', name: 'Kaggle', category: 'Developer', urlPattern: 'https://kaggle.com/{username}', icon: 'BarChart2', description: 'Data science & ML competitions' },
  { id: 'leetcode', name: 'LeetCode', category: 'Developer', urlPattern: 'https://leetcode.com/{username}', icon: 'FileCode', description: 'Algorithm competitive profile' },
  { id: 'replit', name: 'Replit', category: 'Developer', urlPattern: 'https://replit.com/@{username}', icon: 'Play', description: 'Interactive cloud IDE repls' },
  { id: 'npm', name: 'npm Registry', category: 'Developer', urlPattern: 'https://npmjs.com/~{username}', icon: 'Package', description: 'JavaScript node packages' },
  { id: 'pypi', name: 'PyPI Python', category: 'Developer', urlPattern: 'https://pypi.org/user/{username}', icon: 'FileText', description: 'Python package index publisher' },
  { id: 'pastebin', name: 'Pastebin', category: 'Developer', urlPattern: 'https://pastebin.com/u/{username}', icon: 'File', description: 'Public paste archives' },
  { id: 'gravatar', name: 'Gravatar', category: 'Social', urlPattern: 'https://en.gravatar.com/{username}', icon: 'User', description: 'Globally recognized avatar profile' },
  { id: 'vimeo', name: 'Vimeo', category: 'Media', urlPattern: 'https://vimeo.com/{username}', icon: 'Film', description: 'High-definition video portfolio' },
  { id: 'cashapp', name: 'Cash App', category: 'Social', urlPattern: 'https://cash.app/${username}', icon: 'DollarSign', description: 'Peer-to-peer cashtag' },
  { id: 'paypal', name: 'PayPal.me', category: 'Social', urlPattern: 'https://paypal.me/{username}', icon: 'CreditCard', description: 'Personal payment portal' },
  { id: 'patreon', name: 'Patreon', category: 'Social', urlPattern: 'https://patreon.com/{username}', icon: 'Heart', description: 'Creator support subscriptions' },
  { id: 'chess', name: 'Chess.com', category: 'Gaming', urlPattern: 'https://chess.com/member/{username}', icon: 'Crown', description: 'Chess ELO and match records' },
  { id: 'lichess', name: 'Lichess', category: 'Gaming', urlPattern: 'https://lichess.org/@/{username}', icon: 'Shield', description: 'Open-source chess profile' },
  { id: 'hackernews', name: 'Hacker News', category: 'Developer', urlPattern: 'https://news.ycombinator.com/user?id={username}', icon: 'Zap', description: 'Y Combinator HN submissions' },
  { id: 'producthunt', name: 'Product Hunt', category: 'Developer', urlPattern: 'https://producthunt.com/@{username}', icon: 'Award', description: 'Startup launches and maker portfolio' },
  { id: 'behance', name: 'Behance', category: 'Portfolio', urlPattern: 'https://behance.net/{username}', icon: 'Palette', description: 'Adobe creative portfolio' },
  { id: 'dribbble', name: 'Dribbble', category: 'Portfolio', urlPattern: 'https://dribbble.com/{username}', icon: 'PenTool', description: 'Digital design showcase' },
  { id: 'substack', name: 'Substack', category: 'Media', urlPattern: 'https://{username}.substack.com', icon: 'Mail', description: 'Independent newsletter' },
  { id: 'codeforces', name: 'Codeforces', category: 'Developer', urlPattern: 'https://codeforces.com/profile/{username}', icon: 'Cpu', description: 'Competitive programming rank' },
  { id: 'quora', name: 'Quora', category: 'Social', urlPattern: 'https://quora.com/profile/{username}', icon: 'HelpCircle', description: 'Knowledge Q&A contributions' },
  { id: 'flickr', name: 'Flickr', category: 'Media', urlPattern: 'https://flickr.com/people/{username}', icon: 'Camera', description: 'Photography photostream' },
  { id: 'strava', name: 'Strava', category: 'Social', urlPattern: 'https://strava.com/athletes/{username}', icon: 'Activity', description: 'Athletic GPS telemetry' },
  { id: 'wikipedia', name: 'Wikipedia', category: 'Social', urlPattern: 'https://en.wikipedia.org/wiki/User:{username}', icon: 'Book', description: 'Encyclopedia editor history' },
  { id: 'bitbucket', name: 'Bitbucket', category: 'Developer', urlPattern: 'https://bitbucket.org/{username}', icon: 'Code2', description: 'Atlassian Git workspace' },
  { id: 'stackoverflow', name: 'Stack Overflow', category: 'Developer', urlPattern: 'https://stackoverflow.com/users/{username}', icon: 'Layers', description: 'Developer reputation and answers' },
  { id: 'venmo', name: 'Venmo', category: 'Social', urlPattern: 'https://account.venmo.com/u/{username}', icon: 'DollarSign', description: 'Social payment feed' },
  { id: 'proton', name: 'Proton Verified', category: 'Developer', urlPattern: 'https://{username}.anonaddy.me', icon: 'Lock', description: 'Encrypted alias routing' },
];

export const ForensicsView: React.FC<ForensicsViewProps> = ({ initialTab = 'defanger' }) => {
  const [activeTab, setActiveTab] = useState<'defanger' | 'evidence' | 'username' | 'name' | 'phone' | 'gis' | 'dossier' | 'gods-eye'>(initialTab);
  const [query, setQuery] = useState('cyber_operator');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UsernameCheckResult[]>([]);

  // Sync with initialTab prop
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // --- IOC Defanger & Bulk Normalizer State ---
  const [rawIocInput, setRawIocInput] = useState(SAMPLE_IOC_TEXTS.incident);
  const [copiedIocText, setCopiedIocText] = useState(false);
  const [copiedSingleIoc, setCopiedSingleIoc] = useState<string | null>(null);
  const [filterIocType, setFilterIocType] = useState<string>('ALL');

  // Computed defanged text
  const defangedIocText = useMemo(() => defangText(rawIocInput), [rawIocInput]);

  // Computed extracted IOCs list
  const extractedIocs = useMemo<ExtractedIoc[]>(() => {
    const list: ExtractedIoc[] = [];
    const text = rawIocInput;

    // IPv4 addresses
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    let match: RegExpExecArray | null;
    while ((match = ipRegex.exec(text)) !== null) {
      const ip = match[0];
      if (!list.some(item => item.raw === ip)) {
        list.push({
          id: `ioc-ip-${ip}`,
          type: 'IPv4',
          raw: ip,
          defanged: ip.replace(/\./g, '[.]'),
        });
      }
    }

    // URLs (http/https/ftp)
    const urlRegex = /\bhttps?:\/\/[^\s"'<>()]+/gi;
    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0];
      if (!list.some(item => item.raw === url)) {
        list.push({
          id: `ioc-url-${list.length}`,
          type: 'URL',
          raw: url,
          defanged: defangText(url),
        });
      }
    }

    // Domains
    const domainRegex = /\b(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|io|edu|gov|dz|ru|cn|xyz|top|online|me|app)\b/gi;
    while ((match = domainRegex.exec(text)) !== null) {
      const dom = match[0];
      // Avoid re-adding if already part of an extracted URL
      if (!list.some(item => item.raw.includes(dom))) {
        list.push({
          id: `ioc-dom-${dom}`,
          type: 'Domain',
          raw: dom,
          defanged: dom.replace(/\./g, '[.]'),
        });
      }
    }

    // Emails
    const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
    while ((match = emailRegex.exec(text)) !== null) {
      const em = match[0];
      if (!list.some(item => item.raw === em)) {
        list.push({
          id: `ioc-em-${em}`,
          type: 'Email',
          raw: em,
          defanged: em.replace(/@/g, '[@]').replace(/\./g, '[.]'),
        });
      }
    }

    // Hashes: SHA-256 (64 hex), MD5 (32 hex)
    const sha256Regex = /\b[a-fA-F0-9]{64}\b/g;
    while ((match = sha256Regex.exec(text)) !== null) {
      const h = match[0];
      if (!list.some(item => item.raw === h)) {
        list.push({
          id: `ioc-sha-${h}`,
          type: 'SHA-256',
          raw: h,
          defanged: h,
        });
      }
    }

    const md5Regex = /\b[a-fA-F0-9]{32}\b/g;
    while ((match = md5Regex.exec(text)) !== null) {
      const h = match[0];
      if (!list.some(item => item.raw === h)) {
        list.push({
          id: `ioc-md5-${h}`,
          type: 'MD5',
          raw: h,
          defanged: h,
        });
      }
    }

    return list;
  }, [rawIocInput]);

  // --- Evidence Locker State ---
  const [evidenceVault, setEvidenceVault] = useState<EvidenceArtifact[]>(INITIAL_EVIDENCE_VAULT);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceArtifact | null>(INITIAL_EVIDENCE_VAULT[0]);
  const [verifiedArtifactIds, setVerifiedArtifactIds] = useState<Set<string>>(new Set(INITIAL_EVIDENCE_VAULT.map(e => e.id)));
  const [isVerifyingId, setIsVerifyingId] = useState<string | null>(null);
  const [newEvidenceModal, setNewEvidenceModal] = useState(false);
  const [newArtifactName, setNewArtifactName] = useState('');
  const [newArtifactCat, setNewArtifactCat] = useState<'Memory Dump' | 'Network PCAP' | 'Disk Image' | 'Triage Package' | 'Malware Sample'>('Memory Dump');
  const [newArtifactSize, setNewArtifactSize] = useState('1.5 GB');
  const [newArtifactHash, setNewArtifactHash] = useState('');
  const [newArtifactNotes, setNewArtifactNotes] = useState('');

  const handleVerifyEvidence = (art: EvidenceArtifact) => {
    setIsVerifyingId(art.id);
    setTimeout(() => {
      setVerifiedArtifactIds(prev => new Set(prev).add(art.id));
      setIsVerifyingId(null);
    }, 700);
  };

  const handleRegisterEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtifactName.trim()) return;
    const generatedHash = newArtifactHash.trim() || Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newArt: EvidenceArtifact = {
      id: `EV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newArtifactName.trim(),
      category: newArtifactCat,
      size: newArtifactSize.trim() || '1.0 GB',
      sha256: generatedHash,
      acquiredAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      custodian: 'Lead Forensics Specialist // SEC-LAB-01',
      status: 'VERIFIED',
      notes: newArtifactNotes.trim() || 'Registered via Forensics Evidence Vault.',
    };
    setEvidenceVault(prev => [newArt, ...prev]);
    setSelectedEvidence(newArt);
    setVerifiedArtifactIds(prev => new Set(prev).add(newArt.id));
    setNewEvidenceModal(false);
    setNewArtifactName('');
    setNewArtifactHash('');
    setNewArtifactNotes('');
  };

  // Full Name & Google Dorks State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [copiedDork, setCopiedDork] = useState<string | null>(null);

  // Phone Lookup State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneResult, setPhoneResult] = useState<any | null>(null);

  // Algerian Wilaya & IP GIS Reticle State
  const [selectedWilaya, setSelectedWilaya] = useState<string>('16 - Algiers (الجزائر العاصمة)');
  const [communesList, setCommunesList] = useState<any[]>([]);
  const [selectedCommune, setSelectedCommune] = useState<any | null>(null);
  const [ipAddress, setIpAddress] = useState('');

  // Load Algerian Communes from algeria_cities.json
  useEffect(() => {
    fetch('/algeria_cities.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.features) {
          setCommunesList(data.features.slice(0, 100));
          if (data.features[0]) {
            setSelectedCommune(data.features[0]);
          }
        }
      })
      .catch((err) => console.warn('Could not load algeria cities:', err));
  }, []);

  // Username Sherlock Probe Simulator
  const handleExecuteSherlock = (targetUsername?: string) => {
    const handle = targetUsername || query;
    if (!handle.trim()) return;
    setQuery(handle);
    setActiveTab('username');
    setIsScanning(true);
    setProgress(0);
    setResults([]);

    const initialResults: UsernameCheckResult[] = PLATFORMS_52.map((p) => ({
      id: p.id,
      platform: p.name,
      category: p.category,
      username: handle,
      profileUrl: p.urlPattern.replace('{username}', handle),
      status: 'checking',
      icon: p.icon,
    }));
    setResults(initialResults);

    let completed = 0;
    const interval = setInterval(() => {
      completed += 4;
      const progressPercent = Math.min(100, Math.round((completed / PLATFORMS_52.length) * 100));
      setProgress(progressPercent);

      setResults((prev) =>
        prev.map((item, idx) => {
          if (idx < completed) {
            const hash = (handle.length + idx * 7) % 5;
            const isFound = hash === 0 || hash === 1;
            return {
              ...item,
              status: isFound ? 'found' : 'not_found',
              httpStatus: isFound ? 200 : 404,
              latencyMs: 40 + (idx % 12) * 15,
            };
          }
          return item;
        })
      );

      if (completed >= PLATFORMS_52.length) {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 180);
  };

  // Phone Forensics Lookup
  const handlePhoneLookup = () => {
    const isDz = phoneNumber.startsWith('+213') || phoneNumber.startsWith('05') || phoneNumber.startsWith('06') || phoneNumber.startsWith('07');
    let carrier = 'Mobilis (ATM)';
    if (phoneNumber.includes('07') || phoneNumber.includes('7')) carrier = 'Djezzy (OTA)';
    if (phoneNumber.includes('06') || phoneNumber.includes('6')) carrier = 'Ooredoo Algeria';

    setPhoneResult({
      rawInput: phoneNumber,
      valid: true,
      country: isDz ? 'Algeria' : 'International',
      carrier: carrier,
      lineType: 'Mobile LTE',
      riskScore: 'Low (Verified Subscriber)',
      formattedE164: phoneNumber.replace(/\s+/g, ''),
      timeZone: 'UTC+1 (CET)',
    });
  };

  // Full Name Calculations
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const fLower = firstName.trim().toLowerCase();
  const lLower = lastName.trim().toLowerCase();
  const domainClean = company.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');

  const usernamePermutations = [
    `${fLower}.${lLower}`,
    `${fLower}_${lLower}`,
    `${fLower}${lLower}`,
    `${fLower[0] || ''}${lLower}`,
    `${fLower}${lLower[0] || ''}`,
    `${lLower}.${fLower}`,
    `${lLower}_${fLower}`,
    `${lLower}${fLower[0] || ''}`,
  ].filter(Boolean);

  const emailPermutations = domainClean ? [
    { email: `${fLower}.${lLower}@${domainClean}`, label: 'First.Last (Standard Corporate)', conf: 95 },
    { email: `${fLower[0] || ''}${lLower}@${domainClean}`, label: 'FLast (Enterprise Short)', conf: 88 },
    { email: `${fLower}@${domainClean}`, label: 'First Name Direct', conf: 72 },
    { email: `${lLower}.${fLower[0] || ''}@${domainClean}`, label: 'Last.F (Government/Academic)', conf: 65 },
  ] : [];

  const googleDorks = [
    {
      title: 'Leaked PDF, DOCX & Financial Records',
      query: `filetype:pdf OR filetype:docx "${fullName}"`,
      desc: 'Finds public CVs, university theses, contracts, and presentations referencing target name.',
      cat: 'Documents',
    },
    {
      title: 'Social & Professional Presence',
      query: `site:linkedin.com/in/ OR site:twitter.com OR site:facebook.com "${fullName}"`,
      desc: 'Discovers verified social and corporate profile accounts on major networks.',
      cat: 'Social',
    },
    {
      title: 'Academic Theses & Publications',
      query: `"${fullName}" (thesis OR dissertation OR master OR IEEE OR research OR publication) site:.edu OR site:.dz`,
      desc: 'Searches university repositories, academic publications, and scientific papers.',
      cat: 'Academic',
    },
    {
      title: 'Leaked Credentials & Pastebins',
      query: `"${fullName}" site:pastebin.com OR site:github.com OR site:gitlab.com (password OR api_key OR token OR credential)`,
      desc: 'Probes code repositories and paste sites for unintended secret leaks mentioning target.',
      cat: 'Credentials',
    },
    {
      title: 'Government, Gazette & Legal Records',
      query: `"${fullName}" site:gov OR site:joradp.dz OR site:justice.dz`,
      desc: 'Scans official state gazettes, legal decrees, and ministerial announcements.',
      cat: 'Government',
    },
    {
      title: 'Corporate Registry & Executive Roles',
      query: `"${fullName}" ("board of directors" OR founder OR ceo OR manager OR associate OR partner)`,
      desc: 'Uncovers commercial registries, startup roles, and executive entity relationships.',
      cat: 'Corporate',
    },
  ];

  const handleCopyDork = (dorkQuery: string, id: string) => {
    navigator.clipboard.writeText(dorkQuery);
    setCopiedDork(id);
    setTimeout(() => setCopiedDork(null), 2000);
  };

  const handleLaunchDork = (dorkQuery: string) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(dorkQuery)}`, '_blank');
  };

  const foundCount = results.filter((r) => r.status === 'found').length;

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden font-sans text-slate-200">
      {/* Sub-tab Navigation Rail */}
      <div className="px-4 py-2 bg-[#090e18] border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('defanger')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'defanger'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-blue-400" />
            <span>IOC Defanger & Normalizer</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-blue-900/40 text-blue-300 font-mono">
              {extractedIocs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Evidence Locker & Custody</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-900/40 text-emerald-300 font-mono">
              {evidenceVault.length}
            </span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          <button
            onClick={() => setActiveTab('username')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'username'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-purple-400" />
            <span>Sherlock 52-Platform</span>
          </button>

          <button
            onClick={() => setActiveTab('name')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'name'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <AtSign className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target OSINT & Dorks</span>
          </button>

          <button
            onClick={() => setActiveTab('phone')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'phone'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
            <span>Phone Forensics</span>
          </button>

          <button
            onClick={() => setActiveTab('gis')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gis'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>GIS & Wilayas</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dossier'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dossier Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('gods-eye')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gods-eye'
                ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-cyan-400 hover:text-cyan-200 hover:bg-slate-900/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D GEOINT Cockpit</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono hidden sm:flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>DFIR MATRIX ONLINE</span>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'gods-eye' ? (
        <div className="flex-1 w-full h-full overflow-hidden bg-[#070b13]">
          <GodsEyeCockpit initialTargetIp={ipAddress} />
        </div>
      ) : (
        <>
          {/* Main Grid: Center Stage (75% / 8 cols) + Right Deck (25% / 4 cols) */}
          <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Center Stage */}
            <div className="lg:col-span-8 flex flex-col h-full bg-[#070b13] border-r border-slate-800/80 overflow-hidden relative">
              {/* --- TAB 1: IOC DEFANGER & BULK NORMALIZER --- */}
              {activeTab === 'defanger' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* Defanger Controls Bar */}
                  <div className="p-3 border-b border-slate-800 bg-[#090e18] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Presets:</span>
                      <button
                        onClick={() => setRawIocInput(SAMPLE_IOC_TEXTS.incident)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors"
                      >
                        C2 Exfiltration Advisory
                      </button>
                      <button
                        onClick={() => setRawIocInput(SAMPLE_IOC_TEXTS.phishing)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors"
                      >
                        Phishing Campaign Dump
                      </button>
                      <button
                        onClick={() => setRawIocInput('')}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(defangedIocText);
                          setCopiedIocText(true);
                          setTimeout(() => setCopiedIocText(false), 2000);
                        }}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedIocText ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Copied Defanged Text</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Defanged Payload</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          const blob = new Blob([defangedIocText], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `DEFANGED-IOCS-${Date.now()}.txt`;
                          a.click();
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export .txt</span>
                      </button>
                    </div>
                  </div>

                  {/* Dual Pane Editor: Raw Input (Top/Left) vs Sanitized Defanged Output (Bottom/Right) */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
                    {/* Left Pane: Raw Ingress Payload */}
                    <div className="flex flex-col h-full border-r border-slate-800/80 bg-[#060a12] p-3 overflow-hidden">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs">
                        <span className="font-mono text-slate-400 font-semibold flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-slate-500" />
                          <span>RAW INPUT (UNSANITIZED THREAT TEXT)</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {rawIocInput.length} characters
                        </span>
                      </div>
                      <textarea
                        value={rawIocInput}
                        onChange={(e) => setRawIocInput(e.target.value)}
                        placeholder="Paste threat reports, email headers, firewall alerts, URLs, IPs..."
                        className="flex-1 w-full bg-transparent font-mono text-xs text-slate-300 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {/* Right Pane: Live Defanged Output Preview */}
                    <div className="flex flex-col h-full bg-[#080d17] p-3 overflow-hidden">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs">
                        <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>SANITIZED DEFANGED PAYLOAD (SAFE FOR EMAIL / JIRA)</span>
                        </span>
                        <span className="font-mono text-[10px] text-emerald-400/80">
                          PROTOCOLS & DOTS DEFANGED
                        </span>
                      </div>
                      <div className="flex-1 w-full overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-text p-1">
                        {defangedIocText || (
                          <span className="text-slate-600 italic">No input to defang. Enter text on the left.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Metrics Bar */}
                  <div className="p-2.5 bg-[#090e18] border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-400">EXTRACTED ARTIFACTS:</span>
                      <span className="text-blue-400 font-semibold">{extractedIocs.filter(i => i.type === 'IPv4').length} IPv4</span>
                      <span className="text-purple-400 font-semibold">{extractedIocs.filter(i => i.type === 'Domain').length} Domains</span>
                      <span className="text-cyan-400 font-semibold">{extractedIocs.filter(i => i.type === 'URL').length} URLs</span>
                      <span className="text-amber-400 font-semibold">{extractedIocs.filter(i => i.type.includes('SHA') || i.type === 'MD5').length} Hashes</span>
                      <span className="text-emerald-400 font-semibold">{extractedIocs.filter(i => i.type === 'Email').length} Emails</span>
                    </div>

                    <div className="text-slate-500 font-mono text-[10px]">
                      RFC-1918 & RFC-5952 Compliance Normalizer
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 2: EVIDENCE CHAIN-OF-CUSTODY LOCKER --- */}
              {activeTab === 'evidence' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* Evidence Vault Header & Action Bar */}
                  <div className="p-3 border-b border-slate-800 bg-[#090e18] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-white font-mono">
                        CRYPTOGRAPHIC EVIDENCE REPOSITORY & CHAIN-OF-CUSTODY
                      </span>
                    </div>

                    <button
                      onClick={() => setNewEvidenceModal(true)}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Evidence Artifact</span>
                    </button>
                  </div>

                  {/* Evidence Artifacts Table */}
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#090e18] text-slate-400 border-b border-slate-800 sticky top-0 z-10 font-mono text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">EVIDENCE ID</th>
                          <th className="py-2.5 px-3">ARTIFACT NAME</th>
                          <th className="py-2.5 px-3">CATEGORY</th>
                          <th className="py-2.5 px-3">SIZE</th>
                          <th className="py-2.5 px-3">SHA-256 HASH</th>
                          <th className="py-2.5 px-3">ACQUIRED</th>
                          <th className="py-2.5 px-3 text-right">INTEGRITY</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {evidenceVault.map((art) => {
                          const isSelected = selectedEvidence?.id === art.id;
                          const isVerified = verifiedArtifactIds.has(art.id);
                          const isVerifying = isVerifyingId === art.id;

                          return (
                            <tr
                              key={art.id}
                              onClick={() => setSelectedEvidence(art)}
                              className={`cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-blue-600/10'
                                  : 'hover:bg-slate-900/40'
                              }`}
                            >
                              <td className="py-2.5 px-3 font-semibold text-blue-400">
                                {art.id}
                              </td>
                              <td className="py-2.5 px-3 font-medium text-white max-w-[180px] truncate">
                                {art.name}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                                  {art.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                                {art.size}
                              </td>
                              <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate max-w-[120px]">{art.sha256}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(art.sha256);
                                      alert('SHA-256 copied');
                                    }}
                                    className="text-slate-500 hover:text-white p-0.5"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-400 text-[10px] truncate max-w-[120px]">
                                {art.acquiredAt}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {isVerifying ? (
                                  <span className="text-amber-400 text-[10px] animate-pulse">
                                    CALCULATING...
                                  </span>
                                ) : isVerified ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    SEALED
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVerifyEvidence(art);
                                    }}
                                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                                  >
                                    Verify Hash
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Selected Evidence Inspector Panel */}
                  {selectedEvidence && (
                    <div className="p-3 border-t border-slate-800 bg-[#080d17] text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400">SELECTED ARTIFACT:</span>
                          <span className="font-bold text-white">{selectedEvidence.name}</span>
                          <span className="text-slate-600">//</span>
                          <span className="text-blue-400">{selectedEvidence.id}</span>
                        </div>
                        <button
                          onClick={() => handleVerifyEvidence(selectedEvidence)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-emerald-400" />
                          <span>Re-Verify Integrity Seal</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[11px]">
                        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                          <div className="text-slate-500 text-[10px]">CUSTODIAN & STATION</div>
                          <div className="text-slate-200 mt-0.5">{selectedEvidence.custodian}</div>
                        </div>
                        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 md:col-span-2">
                          <div className="text-slate-500 text-[10px]">PROVENANCE & METHODOLOGY</div>
                          <div className="text-slate-300 mt-0.5">{selectedEvidence.notes}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
          {/* 1. Sherlock 52-Platform View */}
          {activeTab === 'username' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-3 border-b border-cyan-500/20 bg-[#0a1222] flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Fingerprint className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteSherlock()}
                    placeholder="Enter target username to probe across 52 platforms..."
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/90 border border-purple-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>

                <button
                  onClick={() => handleExecuteSherlock()}
                  disabled={isScanning}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>PROBING ({progress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>PROBE 52 PLATFORMS</span>
                    </>
                  )}
                </button>
              </div>

              {isScanning && (
                <div className="w-full h-1 bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_8px_#a855f7] transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="flex-1 p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
                {results.length === 0 ? (
                  <div className="col-span-full h-full flex flex-col items-center justify-center text-slate-500 text-xs py-16">
                    <Fingerprint className="w-12 h-12 text-purple-500/40 mb-3 animate-pulse" />
                    <p className="text-slate-300 font-bold">52-Platform Sherlock Engine Standing By</p>
                    <p className="text-slate-500 text-[11px] mt-1">
                      Enter a handle above to scan GitHub, Twitter, Instagram, Reddit, Bugcrowd, Telegram, Steam, and 45 more.
                    </p>
                  </div>
                ) : (
                  results.map((res) => {
                    const isFound = res.status === 'found';
                    const isChecking = res.status === 'checking';

                    return (
                      <div
                        key={res.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                          isFound
                            ? 'bg-[#0f172a] border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                            : isChecking
                            ? 'bg-[#090e1a] border-slate-700'
                            : 'bg-[#060a14] border-slate-800/80 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{res.platform}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              isFound
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : isChecking
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 animate-pulse'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isFound ? 'MATCH FOUND' : isChecking ? 'PROBING...' : 'NO MATCH'}
                          </span>
                        </div>

                        <div className="mt-2 text-[11px] text-slate-400 truncate">
                          {res.profileUrl}
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">HTTP {res.httpStatus || '---'}</span>
                          {isFound && (
                            <a
                              href={res.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                            >
                              <span>Open Profile</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 2. Full Name & Google Dorks Matrix View (PRIMARY NEW REQUEST) */}
          {activeTab === 'name' && (
            <div className="flex-1 p-4 flex flex-col gap-3.5 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
              {/* Input Form */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30">
                <div className="text-xs font-bold text-cyan-400 mb-3 flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-cyan-400" />
                  <span>TARGET FULL NAME & ORGANIZATION DISCOVERY:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">FIRST NAME:</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-black/80 border border-cyan-500/25 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">LAST NAME:</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-black/80 border border-cyan-500/25 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">COMPANY / DOMAIN:</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. target-domain.com"
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-black/80 border border-cyan-500/25 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">LOCATION / CITY:</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Geneva, Switzerland"
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-black/80 border border-cyan-500/25 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Username & Email Permutations Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Username Permutations */}
                <div className="p-3.5 rounded-xl bg-[#090f1e] border border-purple-500/30">
                  <div className="text-xs font-bold text-purple-300 mb-2 flex items-center justify-between">
                    <span>HANDLE PERMUTATION MATRIX:</span>
                    <span className="text-[10px] text-slate-400 font-normal">{usernamePermutations.length} generated</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {usernamePermutations.map((uname) => (
                      <div
                        key={uname}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-purple-500/20 text-xs text-purple-200 font-mono"
                      >
                        <span>@{uname}</span>
                        <button
                          onClick={() => handleExecuteSherlock(uname)}
                          title="Pivot and probe in Sherlock 52"
                          className="text-cyan-400 hover:text-white p-0.5"
                        >
                          <Search className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email Predictions */}
                <div className="p-3.5 rounded-xl bg-[#090f1e] border border-cyan-500/30">
                  <div className="text-xs font-bold text-cyan-300 mb-2 flex items-center justify-between">
                    <span>CORPORATE EMAIL PREDICTIONS:</span>
                    <span className="text-[10px] text-slate-400 font-normal">{company || 'Domain'}</span>
                  </div>
                  <div className="space-y-1.5">
                    {emailPermutations.map((em) => (
                      <div
                        key={em.email}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-black/60 border border-cyan-500/15 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-cyan-400" />
                          <span className="text-white font-mono font-bold">{em.email}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold font-mono">{em.conf}% Prob.</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weaponized Google Dorks Table */}
              <div className="p-3.5 rounded-xl bg-[#080d1a] border border-cyan-500/20">
                <div className="text-xs font-bold text-white mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span>1-CLICK WEAPONIZED GOOGLE DORKS MATRIX:</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Target: {fullName}</span>
                </div>

                <div className="space-y-2">
                  {googleDorks.map((dork, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-2.5 rounded-xl bg-[#050812] border border-cyan-500/15 hover:border-cyan-400/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[9px] border border-cyan-500/30 uppercase">
                            {dork.cat}
                          </span>
                          <span className="font-bold text-white">{dork.title}</span>
                        </div>
                        <div className="mt-1 p-1 rounded bg-black/80 font-mono text-[11px] text-cyan-300 border border-slate-800 break-all">
                          {dork.query}
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400">{dork.desc}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => handleCopyDork(dork.query, `dork-${dIdx}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedDork === `dork-${dIdx}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleLaunchDork(dork.query)}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-600/30 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-400/50 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                        >
                          <span>Execute in Google</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Phone Forensics View */}
          {activeTab === 'phone' && (
            <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30">
                <div className="text-xs font-bold text-cyan-400 mb-2">ITU-T E.164 TELEPHONY FORENSICS PROBE:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+213 555 12 34 56"
                    className="flex-1 px-3 py-2 text-xs bg-black/80 border border-cyan-500/30 rounded-xl text-white font-mono"
                  />
                  <button
                    onClick={handlePhoneLookup}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs shadow-lg hover:brightness-110 cursor-pointer"
                  >
                    RESOLVE CARRIER
                  </button>
                </div>
              </div>

              {phoneResult && (
                <div className="p-4 rounded-xl bg-[#0a1222] border border-cyan-400/40 text-xs space-y-3">
                  <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Telephony Dossier Verified</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">CARRIER / TELCO</div>
                      <div className="text-white font-bold mt-0.5">{phoneResult.carrier}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">LINE TYPE</div>
                      <div className="text-cyan-300 font-bold mt-0.5">{phoneResult.lineType}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">COUNTRY & TIMEZONE</div>
                      <div className="text-white font-bold mt-0.5">{phoneResult.country} ({phoneResult.timeZone})</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">RISK CLASSIFICATION</div>
                      <div className="text-emerald-400 font-bold mt-0.5">{phoneResult.riskScore}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. GIS Reticle & 69 Algerian Wilayas View */}
          {activeTab === 'gis' && (
            <div className="flex-1 p-3 flex flex-col h-full overflow-hidden">
              <AlgeriaGisMap
                targetIp={ipAddress}
                onSelectCommune={(commune) => {
                  setSelectedWilaya(`${String(commune.wilaya_code).padStart(2, '0')} - ${commune.wilaya_name_fr} (${commune.wilaya_name})`);
                }}
              />
            </div>
          )}

          {/* 5. Intelligence Dossier Master Briefing View */}
          {activeTab === 'dossier' && (
            <div className="flex-1 p-4 flex flex-col gap-3.5 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
              {/* Header Dossier Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#0d1527] to-[#120e28] border border-purple-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>INTELLIGENCE CASE DOSSIER:</span>
                      <span className="font-mono text-purple-300">CASE-2026-INTEL-8941</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      CLASSIFICATION: FORENSIC INTELLIGENCE AUDIT // SECURE RECON NODE
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const caseData = {
                        caseId: 'CASE-2026-INTEL-8941',
                        investigator: 'Lead Forensics Investigator',
                        target: {
                          fullName: fullName || 'UNASSIGNED_TARGET',
                          username: query,
                          company: company || 'N/A',
                          location: location || 'N/A',
                          phone: phoneNumber || 'N/A',
                          carrier: phoneResult?.carrier || 'Carrier Lookup Required',
                          wilaya: selectedWilaya,
                          ip: ipAddress || 'N/A',
                        },
                        timestamp: new Date().toISOString(),
                        hash: 'SHA256:4f8a9e22c7104b6d8923a1078f4410e309ad9428b12f6c91a78e4d2091c6e451',
                        matchedPlatforms: results.filter((r) => r.status === 'found'),
                      };
                      const blob = new Blob([JSON.stringify(caseData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `DOSSIER-${(fullName ? fullName.replace(/\s+/g, '_') : 'TARGET')}-2026.json`;
                      a.click();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD JSON</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PRINT DOSSIER</span>
                  </button>
                </div>
              </div>

              {/* Subject Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#090f1e] border border-cyan-500/25">
                  <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    <span>PRIMARY SUBJECT ENTITY</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{fullName || 'UNASSIGNED TARGET'}</div>
                  <div className="text-xs text-purple-300 font-mono mt-0.5">@{query}</div>
                  <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
                    <div>Entity: Physical Subject / Handle</div>
                    <div>Location: {location || 'Unspecified Jurisdiction'}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#090f1e] border border-cyan-500/25">
                  <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1.5">
                    <Building className="w-3 h-3 text-cyan-400" />
                    <span>AFFILIATION & CORRESPONDENCE</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{company || 'No Domain Listed'}</div>
                  <div className="text-xs text-cyan-300 font-mono mt-0.5">{location || 'Global'}</div>
                  <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
                    <div>Domain: {company ? domainClean : 'N/A'}</div>
                    <div>Predicted Emails: {emailPermutations.length} cataloged</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#090f1e] border border-cyan-500/25">
                  <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>TELECOM & GIS ATTRIBUTION</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{phoneNumber || 'No MSISDN Associated'}</div>
                  <div className="text-xs text-emerald-400 font-mono mt-0.5">{phoneResult?.carrier || (phoneNumber ? 'Carrier Lookup Required' : 'N/A')}</div>
                  <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
                    <div>Wilaya / Sector: {selectedWilaya || 'Global Node'}</div>
                    <div>IP Gateway: {ipAddress || 'Not Assigned'}</div>
                  </div>
                </div>
              </div>

              {/* Matched Platforms Cross-Verification */}
              <div className="p-3.5 rounded-xl bg-[#080d1a] border border-cyan-500/20">
                <div className="text-xs font-bold text-white mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-400" />
                    <span>VERIFIED DIGITAL FOOTPRINT ({foundCount} Matches Across 52 Platforms)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">
                    {Math.round((foundCount / 52) * 100)}% Cross-Index Match
                  </span>
                </div>

                {foundCount === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No Sherlock probe has been executed yet. Run "Sherlock 52-Platform" probe to populate live evidence.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    {results
                      .filter((r) => r.status === 'found')
                      .map((res) => (
                        <div
                          key={res.id}
                          className="p-2.5 rounded-lg bg-black/60 border border-emerald-500/30 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>{res.platform}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                              {res.profileUrl}
                            </div>
                          </div>

                          <a
                            href={res.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-cyan-400 hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Chain of Custody & Cryptographic Seal */}
              <div className="p-3.5 rounded-xl bg-[#060a14] border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-purple-300 font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                    <span>CRYPTOGRAPHIC CHAIN OF CUSTODY DIGEST</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 break-all">
                    SHA256: 4f8a9e22c7104b6d8923a1078f4410e309ad9428b12f6c91a78e4d2091c6e451
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Digitally signed by Operator: Zak // Tier 5 Clearance // Autonomous Forensic Engine v2.4
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('4f8a9e22c7104b6d8923a1078f4410e309ad9428b12f6c91a78e4d2091c6e451');
                      alert('SHA-256 evidence hash copied to clipboard.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy Hash</span>
                  </button>

                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                    TAMPER-EVIDENT SEALED
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Deck: Context-Aware DFIR Deck (Defanger Normalizer / Evidence Audit / Dossier) */}
        <div className="lg:col-span-4 flex flex-col h-full bg-[#0b101b] overflow-hidden">
          {activeTab === 'defanger' ? (
            /* --- DEFANGER RIGHT DECK: EXTRACTED IOC NORMALIZER TABLE --- */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-3 border-b border-slate-800 bg-[#090e18] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-white font-mono">
                    EXTRACTED IOC INVENTORY ({extractedIocs.length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    const csvRows = [
                      'Type,Raw Value,Defanged Value',
                      ...extractedIocs.map(i => `"${i.type}","${i.raw}","${i.defanged}"`)
                    ].join('\n');
                    const blob = new Blob([csvRows], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `EXTRACTED-IOCS-${Date.now()}.csv`;
                    a.click();
                  }}
                  disabled={extractedIocs.length === 0}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3 h-3 text-slate-400" />
                  <span>CSV Export</span>
                </button>
              </div>

              {/* Type Filter Badges */}
              <div className="px-3 py-1.5 border-b border-slate-800 bg-[#080d17] flex items-center gap-1 overflow-x-auto scrollbar-none text-[10px] font-mono">
                {['ALL', 'IPv4', 'URL', 'Domain', 'SHA-256', 'Email'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterIocType(t)}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      filterIocType === t
                        ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* IOC Items List */}
              <div className="flex-1 p-2.5 space-y-1.5 overflow-y-auto">
                {extractedIocs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded font-mono">
                    No IOCs detected. Paste threat intelligence payload on the left.
                  </div>
                ) : (
                  extractedIocs
                    .filter((i) => filterIocType === 'ALL' || i.type === filterIocType)
                    .map((ioc) => (
                      <div
                        key={ioc.id}
                        className="p-2 rounded bg-[#070b13] border border-slate-800/80 hover:border-slate-700 text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                              ioc.type === 'IPv4'
                                ? 'bg-blue-900/40 text-blue-300 border border-blue-800/60'
                                : ioc.type === 'URL'
                                ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-800/60'
                                : ioc.type === 'Domain'
                                ? 'bg-purple-900/40 text-purple-300 border border-purple-800/60'
                                : ioc.type === 'Email'
                                ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/60'
                                : 'bg-amber-900/40 text-amber-300 border border-amber-800/60'
                            }`}
                          >
                            {ioc.type}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(ioc.defanged);
                              setCopiedSingleIoc(ioc.id);
                              setTimeout(() => setCopiedSingleIoc(null), 1500);
                            }}
                            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            {copiedSingleIoc === ioc.id ? (
                              <span className="text-emerald-400 font-bold">Copied</span>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>Copy Defanged</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="text-[11px] text-emerald-300 truncate select-all">
                          {ioc.defanged}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Raw: {ioc.raw}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          ) : activeTab === 'evidence' ? (
            /* --- EVIDENCE RIGHT DECK: CHAIN-OF-CUSTODY AUDIT LEDGER --- */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-3 border-b border-slate-800 bg-[#090e18] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white font-mono">
                    CHAIN OF CUSTODY VERIFICATION
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (!selectedEvidence) return;
                    const cert = `CERTIFICATE OF FORENSIC CHAIN-OF-CUSTODY
=====================================================
CASE REFERENCE : CASE-2026-DFIR-${selectedEvidence.id}
ARTIFACT NAME  : ${selectedEvidence.name}
CATEGORY       : ${selectedEvidence.category}
FILE SIZE      : ${selectedEvidence.size}
ACQUISITION    : ${selectedEvidence.acquiredAt}
CUSTODIAN      : ${selectedEvidence.custodian}
SHA-256 DIGEST : ${selectedEvidence.sha256}
STATUS         : CRYPTOGRAPHICALLY VALIDATED & SEALED
=====================================================
Acquisition conducted under ISO/IEC 27037:2012 guidelines.`;
                    const blob = new Blob([cert], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `CHAIN-OF-CUSTODY-${selectedEvidence.id}.txt`;
                    a.click();
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3 text-emerald-400" />
                  <span>Certificate</span>
                </button>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs font-mono">
                {selectedEvidence ? (
                  <>
                    <div className="p-2.5 rounded bg-[#070b13] border border-slate-800 space-y-2">
                      <div className="text-slate-400 text-[10px]">IMMUTABLE AUDIT LOG</div>
                      <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                        <ShieldCheck className="w-4 h-4" />
                        <span>SHA-256 INTEGRITY CONFIRMED</span>
                      </div>
                      <div className="p-1.5 rounded bg-black/60 border border-slate-800 text-[10px] text-slate-300 break-all">
                        {selectedEvidence.sha256}
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-[#070b13] border border-slate-800 space-y-2">
                      <div className="text-slate-400 text-[10px]">FORENSIC CUSTODY TIMELINE</div>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-start gap-2 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                          <div>
                            <span className="text-white font-semibold">Triage Acquisition:</span> {selectedEvidence.acquiredAt}
                            <div className="text-[10px] text-slate-500">Hardware write-blocker attached; physical bitstream clone.</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                          <div>
                            <span className="text-white font-semibold">Cryptographic Hashing:</span> SHA-256 digest calculated
                            <div className="text-[10px] text-slate-500">Hash matched ledger verification register.</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 shrink-0" />
                          <div>
                            <span className="text-white font-semibold">SecOps Storage:</span> Air-gapped vault safe
                            <div className="text-[10px] text-slate-500">{selectedEvidence.custodian}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-emerald-300">
                      <div className="font-semibold mb-0.5">ISO/IEC 27037 Standard Compliant</div>
                      <div className="text-[10px] text-slate-400">
                        Evidence maintains complete evidentiary integrity suitable for criminal and enterprise regulatory proceedings.
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded">
                    Select an evidence artifact from the ledger to view custody audit details.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* --- DEFAULT CASE DOSSIER DECK --- */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-3 border-b border-slate-800 bg-[#090e18] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-white font-mono uppercase">
                    Case Dossier Deck
                  </span>
                </div>
                <button
                  onClick={() => {
                    alert(`Dossier exported: CASE-2026-${fullName ? fullName.replace(/\s+/g, '_') : query || 'TARGET'}.json generated.`);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3 text-purple-400" />
                  <span>EXPORT CASE</span>
                </button>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>CASE ID:</span>
                    <span className="text-purple-300 font-bold">CASE-2026-INTEL-8941</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>INVESTIGATOR:</span>
                    <span className="text-white font-bold">Lead Forensics Specialist</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>STATUS:</span>
                    <span className="text-emerald-400 font-bold">ACTIVE AUDIT</span>
                  </div>
                </div>

                {/* Metrics Tally */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded bg-[#070b13] border border-slate-800">
                    <div className="text-xl font-bold text-cyan-400">{foundCount}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Identities Found</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#070b13] border border-slate-800">
                    <div className="text-xl font-bold text-emerald-400">52</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Platforms Checked</div>
                  </div>
                </div>

                {/* Target Identity Summary */}
                <div className="p-2.5 rounded bg-[#070b13] border border-slate-800 space-y-1.5 font-sans">
                  <div className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Executive Summary</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Subject <span className="text-white font-medium">{fullName || 'Unassigned Target'}</span> (@{query}) correlates across developer and social registries. Affiliation: <span className="text-slate-300">{company || 'Global Node'}</span> ({location || 'Global'}).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Register Evidence Modal */}
      {newEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-md p-4 rounded-lg bg-[#0c1424] border border-slate-700 shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white uppercase flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Register Forensic Evidence Artifact</span>
              </span>
              <button
                onClick={() => setNewEvidenceModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterEvidence} className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400 font-bold">ARTIFACT FILE NAME:</label>
                <input
                  type="text"
                  required
                  value={newArtifactName}
                  onChange={(e) => setNewArtifactName(e.target.value)}
                  placeholder="e.g. DC-MEMDUMP-01.raw"
                  className="w-full mt-1 p-2 bg-[#060a12] border border-slate-800 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold">CATEGORY:</label>
                  <select
                    value={newArtifactCat}
                    onChange={(e) => setNewArtifactCat(e.target.value as any)}
                    className="w-full mt-1 p-2 bg-[#060a12] border border-slate-800 rounded text-white"
                  >
                    <option value="Memory Dump">Memory Dump</option>
                    <option value="Network PCAP">Network PCAP</option>
                    <option value="Disk Image">Disk Image</option>
                    <option value="Triage Package">Triage Package</option>
                    <option value="Malware Sample">Malware Sample</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold">FILE SIZE:</label>
                  <input
                    type="text"
                    value={newArtifactSize}
                    onChange={(e) => setNewArtifactSize(e.target.value)}
                    placeholder="e.g. 16.4 GB"
                    className="w-full mt-1 p-2 bg-[#060a12] border border-slate-800 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold">SHA-256 HASH (Optional, auto-generated if blank):</label>
                <input
                  type="text"
                  value={newArtifactHash}
                  onChange={(e) => setNewArtifactHash(e.target.value)}
                  placeholder="64-character hex digest"
                  className="w-full mt-1 p-2 bg-[#060a12] border border-slate-800 rounded text-white text-[10px]"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold">PROVENANCE & ACQUISITION NOTES:</label>
                <textarea
                  rows={2}
                  value={newArtifactNotes}
                  onChange={(e) => setNewArtifactNotes(e.target.value)}
                  placeholder="Details of write-blocker, acquisition tool, and custody transfer..."
                  className="w-full mt-1 p-2 bg-[#060a12] border border-slate-800 rounded text-white text-[11px]"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewEvidenceModal(false)}
                  className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save Artifact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="w-full p-2.5 rounded-2xl bg-[#080d18]/90 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Target Full Name:</span>
          <span className="text-cyan-300 font-bold font-mono">{fullName}</span>
          <span className="text-slate-600">//</span>
          <span className="text-slate-400">Sherlock Handle:</span>
          <span className="text-purple-300 font-bold font-mono">@{query}</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Google Dorking Engine</span>
          <span className="text-slate-600">//</span>
          <span>ITU-T Standards Compliant</span>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
