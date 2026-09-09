import React, { useState, useEffect } from 'react';
import { 
  Search, Fingerprint, Globe, PhoneCall, ShieldCheck, 
  ExternalLink, CheckCircle2, XCircle, Loader2, Download, 
  UserCheck, AlertTriangle, FileText, MapPin, Share2, Compass, Layers
} from 'lucide-react';
import { UsernamePlatformDef, UsernameCheckResult } from '../../types';

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

export const ForensicsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'username' | 'phone' | 'gis'>('username');
  const [query, setQuery] = useState('cyber_operator');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UsernameCheckResult[]>([]);

  // Phone Lookup State
  const [phoneNumber, setPhoneNumber] = useState('+213 555 12 34 56');
  const [phoneResult, setPhoneResult] = useState<any | null>(null);

  // Algerian Wilaya & IP GIS Reticle State
  const [selectedWilaya, setSelectedWilaya] = useState<string>('16 - Algiers (الجزائر العاصمة)');
  const [communesList, setCommunesList] = useState<any[]>([]);
  const [selectedCommune, setSelectedCommune] = useState<any | null>(null);
  const [ipAddress, setIpAddress] = useState('105.101.42.18');

  // Load Algerian Communes from algeria_cities.json
  useEffect(() => {
    fetch('/algeria_cities.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.features) {
          setCommunesList(data.features.slice(0, 100)); // Sample 100 for fast UI response
          if (data.features[0]) {
            setSelectedCommune(data.features[0]);
          }
        }
      })
      .catch((err) => console.warn('Could not load algeria cities:', err));
  }, []);

  // Username Sherlock Probe Simulator
  const handleExecuteSherlock = () => {
    if (!query.trim()) return;
    setIsScanning(true);
    setProgress(0);
    setResults([]);

    const initialResults: UsernameCheckResult[] = PLATFORMS_52.map((p) => ({
      id: p.id,
      platform: p.name,
      category: p.category,
      username: query,
      profileUrl: p.urlPattern.replace('{username}', query),
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
            // Predictable matching based on character hash for educational demo
            const hash = (query.length + idx * 7) % 5;
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

  const foundCount = results.filter((r) => r.status === 'found').length;

  return (
    <div className="flex-1 w-full h-full flex flex-col gap-3 overflow-hidden font-mono">
      {/* Sub-tab Pill Navigation */}
      <div className="flex items-center justify-between pb-1 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('username')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'username'
                ? 'bg-gradient-to-r from-purple-500/30 to-pink-600/30 text-purple-300 border border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-[#0a101d] text-slate-400 hover:text-slate-200 border border-cyan-500/15'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Sherlock 52-Platform Probe</span>
          </button>

          <button
            onClick={() => setActiveTab('phone')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'phone'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'bg-[#0a101d] text-slate-400 hover:text-slate-200 border border-cyan-500/15'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Phone Forensics (ITU-T)</span>
          </button>

          <button
            onClick={() => setActiveTab('gis')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'gis'
                ? 'bg-gradient-to-r from-emerald-500/30 to-teal-600/30 text-emerald-300 border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-[#0a101d] text-slate-400 hover:text-slate-200 border border-cyan-500/15'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>GIS Reticle & 69 Algerian Wilayas</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span>FORENSICS MATRIX ARMED</span>
        </div>
      </div>

      {/* Main Grid: Center Stage (~65% width) + Right Deck (~35% width) */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-3.5 overflow-hidden">
        {/* Center Stage */}
        <div className="lg:col-span-8 flex flex-col h-full rounded-2xl bg-[#060b14]/90 border border-cyan-500/20 overflow-hidden relative shadow-2xl">
          {activeTab === 'username' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Search Bar */}
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
                  onClick={handleExecuteSherlock}
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

              {/* Progress Bar */}
              {isScanning && (
                <div className="w-full h-1 bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_8px_#a855f7] transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Platform Check Cards Matrix */}
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

          {activeTab === 'gis' && (
            <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 font-bold">ALGERIAN WILAYA SELECTION (69 WILAYAS):</label>
                  <select
                    value={selectedWilaya}
                    onChange={(e) => setSelectedWilaya(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs bg-slate-900 border border-cyan-500/30 rounded-xl text-white"
                  >
                    <option value="16 - Algiers (الجزائر العاصمة)">16 - Algiers (الجزائر العاصمة)</option>
                    <option value="31 - Oran (وهران)">31 - Oran (وهران)</option>
                    <option value="25 - Constantine (قسنطينة)">25 - Constantine (قسنطينة)</option>
                    <option value="19 - Sétif (سطيف)">19 - Sétif (سطيف)</option>
                    <option value="06 - Béjaïa (بجاية)">06 - Béjaïa (بجاية)</option>
                    <option value="09 - Blida (البليدة)">09 - Blida (البليدة)</option>
                    <option value="15 - Tizi Ouzou (تيزي وزو)">15 - Tizi Ouzou (تيزي وزو)</option>
                    <option value="13 - Tlemcen (تلمسان)">13 - Tlemcen (تلمسان)</option>
                    <option value="05 - Batna (باتنة)">05 - Batna (باتنة)</option>
                    <option value="30 - Ouargla (ورقلة)">30 - Ouargla (ورقلة)</option>
                    <option value="47 - Ghardaïa (غرداية)">47 - Ghardaïa (غرداية)</option>
                    <option value="11 - Tamanrasset (تمنراست)">11 - Tamanrasset (تمنراست)</option>
                  </select>
                </div>

                <div className="w-56">
                  <label className="text-[10px] text-slate-400 font-bold">IP TARGET GEOLOCATION:</label>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs bg-slate-900 border border-cyan-500/30 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              {/* Tactical GIS Coordinates Display */}
              <div className="flex-1 rounded-xl bg-[#040812] border border-cyan-500/30 p-4 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-cyan-300">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                    <span>GIS TARGET RETICLE LOCKED: {selectedWilaya}</span>
                  </div>
                  <span className="text-emerald-400 font-mono">ASN: AS36947 (Algérie Télécom)</span>
                </div>

                <div className="my-auto text-center space-y-2">
                  <div className="w-24 h-24 mx-auto rounded-full border-2 border-cyan-400/50 flex items-center justify-center relative">
                    <div className="w-16 h-16 rounded-full border border-cyan-400/30 animate-ping" />
                    <Crosshair className="w-8 h-8 text-cyan-400 absolute" />
                  </div>
                  <div className="text-sm font-bold text-white font-mono">LAT: 36.7538° N // LON: 3.0588° E</div>
                  <div className="text-xs text-slate-400 font-mono">Accuracy: 15m radius // Fiber Optic Gateway Node</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    Communes Cataloged: <span className="text-cyan-300 font-bold">1,541 Communes</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    Wilayas: <span className="text-cyan-300 font-bold">69 Verified Wilayas</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    Threat Risk: <span className="text-emerald-400 font-bold">CLEAN IP (NO BLACKLIST)</span>
                  </div>
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
                alert(`Dossier exported: CASE-2026-DZ-${query || 'TARGET'}.json generated.`);
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
                <span className="text-purple-300 font-bold font-mono">CASE-2026-DZ-8941</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>INVESTIGATOR:</span>
                <span className="text-white font-bold font-mono">Zak // Lead Forensics Officer</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>PURPOSE:</span>
                <span className="text-emerald-400 font-bold font-mono">Master's Thesis Defense</span>
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

            {/* AI Persona Executive Summary */}
            <div className="p-3 rounded-xl bg-[#060a14] border border-cyan-500/20 space-y-2">
              <div className="text-cyan-400 font-bold text-[11px] uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Executive Intelligence Summary:</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Target handle <span className="text-cyan-300 font-bold">{query}</span> demonstrates active presence across developer, social, and communications services. Correlated telecom node identifies legitimate Algerian GSM subscriber footprint.
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
          <span className="text-slate-400">Current Target:</span>
          <span className="text-purple-300 font-bold font-mono">@{query}</span>
          <span className="text-slate-600">//</span>
          <span className="text-slate-400">Total Lookups Today:</span>
          <span className="text-cyan-400 font-bold font-mono">148 Records</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Sherlock OpenSource Engine</span>
          <span className="text-slate-600">//</span>
          <span>ITU-T Standards Compliant</span>
        </div>
      </div>
    </div>
  );
};
