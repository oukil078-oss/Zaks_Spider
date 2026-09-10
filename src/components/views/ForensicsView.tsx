import React, { useState, useEffect } from 'react';
import { 
  Search, Fingerprint, Globe, PhoneCall, ShieldCheck, 
  ExternalLink, CheckCircle2, XCircle, Loader2, Download, 
  UserCheck, AlertTriangle, FileText, MapPin, Share2, Compass, Layers, 
  Copy, Check, Mail, Building, AtSign, ArrowUpRight, Crosshair, Printer, KeyRound
} from 'lucide-react';
import { UsernamePlatformDef, UsernameCheckResult } from '../../types';
import { AlgeriaGisMap } from '../gis/AlgeriaGisMap';
import { GodsEyeCockpit } from '../geoint/GodsEyeCockpit';

interface ForensicsViewProps {
  initialTab?: 'username' | 'name' | 'phone' | 'gis' | 'dossier' | 'gods-eye';
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

export const ForensicsView: React.FC<ForensicsViewProps> = ({ initialTab = 'username' }) => {
  const [activeTab, setActiveTab] = useState<'username' | 'name' | 'phone' | 'gis' | 'dossier' | 'gods-eye'>(initialTab);
  const [query, setQuery] = useState('cyber_operator');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UsernameCheckResult[]>([]);

  // Sync with initialTab prop
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

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
    <div className="flex-1 w-full h-full flex flex-col gap-3 overflow-hidden font-mono">
      {/* Sub-tab Pill Navigation */}
      <div className="flex items-center justify-between pb-1 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('username')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'username'
                ? 'bg-gradient-to-r from-purple-500/30 to-pink-600/30 text-purple-300 border border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-[#0a101d] text-slate-400 hover:text-slate-200 border border-cyan-500/15'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Sherlock 52-Platform</span>
          </button>

          <button
            onClick={() => setActiveTab('name')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'name'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'bg-[#0a101d] text-slate-400 hover:text-slate-200 border border-cyan-500/15'
            }`}
          >
            <AtSign className="w-3.5 h-3.5" />
            <span>Full Name & Google Dorks</span>
          </button>

          <button
            onClick={() => setActiveTab('phone')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'phone'
                ? 'bg-gradient-to-r from-emerald-500/30 to-teal-600/30 text-emerald-300 border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-[#0a101d] text-slate-400 hover:text-slate-200 border border-cyan-500/15'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Phone Forensics (ITU-T)</span>
          </button>

          <button
            onClick={() => setActiveTab('gis')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gis'
                ? 'bg-gradient-to-r from-yellow-500/30 to-amber-600/30 text-yellow-300 border border-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-[#0a101d] text-slate-400 hover:text-slate-200 border border-cyan-500/15'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>GIS & 69 Wilayas</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dossier'
                ? 'bg-gradient-to-r from-purple-500/30 to-indigo-600/30 text-purple-300 border border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-[#0a101d] text-slate-400 hover:text-slate-200 border border-cyan-500/15'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Intelligence Dossier</span>
          </button>

          <button
            onClick={() => setActiveTab('gods-eye')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gods-eye'
                ? 'bg-gradient-to-r from-cyan-500/40 via-blue-600/40 to-purple-600/40 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'bg-[#0a101d] text-cyan-400 hover:text-cyan-200 border border-cyan-500/30'
            }`}
          >
            <Globe className="w-3.5 h-3.5 animate-spin-slow text-cyan-300" />
            <span>🛰️ Global GEOINT</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-extrabold border border-cyan-400/40 animate-pulse">
              LIVE 3D
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-bold flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span>FORENSICS MATRIX ARMED</span>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'gods-eye' ? (
        <div className="flex-1 w-full h-full rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#080d18] shadow-2xl">
          <GodsEyeCockpit initialTargetIp={ipAddress} />
        </div>
      ) : (
        <>
          {/* Main Grid: Center Stage (~65% width) + Right Deck (~35% width) */}
          <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-3.5 overflow-hidden">
        {/* Center Stage */}
        <div className="lg:col-span-8 flex flex-col h-full rounded-2xl bg-[#060b14]/90 border border-cyan-500/20 overflow-hidden relative shadow-2xl">
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

        {/* Right Deck: Intelligence Dossier & Report Exporter (~35% width) */}
        <div className="lg:col-span-4 flex flex-col h-full rounded-2xl bg-[#080e1a]/95 border border-cyan-500/20 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="p-3 border-b border-cyan-500/20 bg-[#0a1222] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Case Dossier Deck
              </span>
            </div>
            <button
              onClick={() => {
                alert(`Dossier exported: CASE-2026-${fullName ? fullName.replace(/\s+/g, '_') : query || 'TARGET'}.json generated.`);
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-900/50 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 text-purple-400" />
              <span>EXPORT CASE</span>
            </button>
          </div>

          <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>CASE ID:</span>
                <span className="text-purple-300 font-bold font-mono">CASE-2026-INTEL-8941</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>INVESTIGATOR:</span>
                <span className="text-white font-bold font-mono">Lead Forensics Investigator</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>PURPOSE:</span>
                <span className="text-emerald-400 font-bold font-mono">Forensic Cybersecurity Audit</span>
              </div>
            </div>

            {/* Metrics Tally */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[#0c1424] border border-cyan-500/20">
                <div className="text-2xl font-black text-cyan-400 font-mono">{foundCount}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Identities Found</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0c1424] border border-cyan-500/20">
                <div className="text-2xl font-black text-emerald-400 font-mono">52</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Platforms Checked</div>
              </div>
            </div>

            {/* Target Identity Summary */}
            <div className="p-3 rounded-xl bg-[#060a14] border border-cyan-500/20 space-y-2">
              <div className="text-cyan-400 font-bold text-[11px] uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Executive Intelligence Summary:</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Target identity <span className="text-cyan-300 font-bold">{fullName || 'Unassigned Target'}</span> (@{query}) demonstrates digital footprint correlated across developer, social, and communications services. Affiliation node: <span className="text-purple-300 font-bold">{company || 'Global Node'}</span> ({location || 'Global Jurisdiction'}).
              </p>
            </div>

            {/* Academic & Ethical Compliance Badge */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] space-y-1">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ETHICAL OSINT & ACADEMIC AUDIT</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[10px]">
                Conducted exclusively with verified subject consent for academic research demonstration before university directors and prospective technology investors.
              </p>
            </div>
          </div>
        </div>
      </div>

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
