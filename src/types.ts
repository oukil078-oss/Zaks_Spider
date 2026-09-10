// ==========================================
// ZAK'S SPIDER — CORE SYSTEM DATA TYPES
// ==========================================

export type MainHubId = 'pentest' | 'forensics' | 'soc' | 'vuln-news';

export type PenTestSubTab = 'arsenal' | 'crawler' | 'vuln-news' | 'payloads';
export type ForensicsSubTab = 'username' | 'name' | 'phone' | 'gis' | 'dossier';
export type SocSubTab = 'overview' | 'aerospace' | 'events' | 'vectors' | 'copilot' | 'ids';
export type VulnNewsSubTab = 'all' | 'zero-days' | 'ransomware' | 'classics' | 'kev' | 'ai-triage';

export type SpiderTabId = 'soc' | 'forensics' | 'brain' | 'pentest' | 'crawler' | 'vuln-news' | 'copilot' | 'operator' | 'swarm';

// --- Pentest Lab & Commands Types ---
export interface CommandParameter {
  name: string;
  placeholder: string;
  defaultValue?: string;
  description?: string;
}

export interface CommandOptionHelp {
  flag: string;
  description: string;
  example?: string;
}

export interface PentestCommandItem {
  id: string;
  title: string;
  tool: string;
  category: 'Recon & Scanning' | 'Web Exploitation' | 'Privilege Escalation' | 'Active Directory & Windows' | 'Password Cracking' | 'Network & Pivoting' | 'Metasploit & C2' | 'Wireless & Radio' | 'Post-Exploitation';
  platform?: 'Linux' | 'Windows' | 'Cross-Platform';
  command: string;
  description: string;
  branch?: string;
  tags: string[];
  parameters: CommandParameter[];
  howToUse?: string;
  optionsHelp?: CommandOptionHelp[];
  expectedOutput?: string;
  isCustom?: boolean;
}

// --- Web Crawler & Recon Spider Types ---
export interface SubdomainDetail {
  subdomain: string;
  ip?: string;
  source?: string;
}

export interface SensitiveFileFinding {
  path: string;
  url: string;
  status: number;
  contentType?: string;
  size?: number;
  snippet?: string;
  source: 'robots.txt' | 'heuristic' | 'directory_listing' | 'sitemap';
  interesting: boolean;
  notes?: string;
}

export interface RobotsTxtData {
  disallow: string[];
  allow: string[];
  sitemaps: string[];
  raw?: string;
}

export interface SslCertInfo {
  cn?: string;
  sans?: string[];
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  serialNumber?: string;
}

export interface SecurityHeaderFinding {
  header: string;
  value?: string;
  status: 'pass' | 'fail' | 'warn';
  importance: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface SecurityHeadersAudit {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  passCount: number;
  failCount: number;
  findings: SecurityHeaderFinding[];
}

export interface DetectedTechnology {
  name: string;
  category: 'Web Server' | 'CMS' | 'Frontend' | 'Backend' | 'CDN / WAF' | 'Analytics' | 'Security / Captcha';
  version?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ThreatAnalysis {
  summary: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  attackSurface: string[];
  vulnerabilities: string[];
  recommendations: string[];
  rawAnalysis: string;
}

export interface OsintReconData {
  root_domain?: string;
  is_ip?: boolean;
  target_ip?: string;
  ssl_cert?: SslCertInfo;
  robots_txt?: RobotsTxtData;
  sensitive_files?: SensitiveFileFinding[];
  subdomains_detail?: SubdomainDetail[];
  security_headers?: SecurityHeadersAudit;
  technologies?: DetectedTechnology[];
  dns?: {
    a?: string[];
    mx?: { exchange: string; priority: number }[];
    txt?: string[];
    ns?: string[];
  };
  geo?: {
    country?: string;
    city?: string;
    isp?: string;
    org?: string;
    as?: string;
  };
}

export interface ScrapedResult {
  url: string;
  domain: string;
  metadata: {
    title: string;
    description: string;
    author: string;
    status: number;
    og?: Record<string, string>;
    server?: string;
    content_type?: string;
  };
  emails: string[];
  subdomains: string[];
  links: {
    internal: string[];
    external: string[];
    total_internal: number;
    total_external: number;
  };
  text: string;
  scraped_at: string;
  osint?: OsintReconData;
}

export interface CybersecNewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  cve_id?: string;
  description: string;
  published_date: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

// --- AI Second Brain Types ---
export interface NoteFrontmatter {
  title?: string;
  category?: string;
  tags?: string[];
  created?: string;
  updated?: string;
  tool?: string;
  target_ip?: string;
  severity?: string;
  [key: string]: any;
}

export interface BrainNoteItem {
  id: string;
  title: string;
  path: string;
  relativePath: string;
  category: string;
  tags: string[];
  created: string;
  updated: string;
  content: string;
  frontmatter: NoteFrontmatter;
  links: string[];
  wordCount: number;
}

export interface SpiderWebNode {
  id: string;
  label: string;
  category: 'core' | 'recon' | 'pentest' | 'target' | 'note' | 'cve';
  color: string;
  tier: number;
  tags: string[];
  path?: string;
  val: number;
  linkCount: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface SpiderWebLink {
  source: string;
  target: string;
  type: 'silk' | 'threat' | 'tag';
}

export interface SpiderWebData {
  nodes: SpiderWebNode[];
  links: SpiderWebLink[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  sources?: string[];
}

// --- Vuln News & CISA KEV Types ---
export interface VulnNewsItem {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction?: string;
  dueDate?: string;
  knownRansomwareCampaignUse?: 'Known' | 'Unknown';
  notes?: string;
  cwes?: string[];
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore?: number;
  exploitStatus?: 'In The Wild (KEV)' | 'Public PoC' | 'Active Scanning' | 'Under Investigation';
  sourceUrl?: string;
  historicEra?: '1999-2010' | '2014-2019' | '2020-2023' | '2024-2026';
  exploitDbId?: string;
  metasploitModule?: string;
  epssScore?: number;
  weaponized?: boolean;
  pentestToolRef?: string;
}

// --- Live Active IDS & Anomaly Sensor Types ---
export interface IdsTrafficEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  country: string;
  countryFlag: string;
  targetPort: number;
  targetEndpoint: string;
  eventType: string;
  signature: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  status: 'Blocked' | 'Inspected' | 'Alert';
  payloadSnippet?: string;
  attackPhase: 'Reconnaissance' | 'Initial Access' | 'Execution' | 'Credential Access' | 'Discovery';
  mitigationTip: string;
  mitreTechnique: string;
  isAnomaly?: boolean;
}

// --- Virtual SOC & Multi-Agent AI Cyber Swarm Types ---
export type CyberAiPersonaId = 'red-team' | 'dfir' | 'soc-lead' | 'reverse-eng' | 'ciso';

export interface CyberAiAgentPersona {
  id: CyberAiPersonaId;
  name: string;
  role: string;
  callsign: string;
  specialization: string;
  avatar: string;
  badgeColor: string;
  systemPrompt: string;
  description: string;
  examplePrompts: string[];
}

export interface CyberAgentMessage {
  id: string;
  personaId: CyberAiPersonaId | 'user' | 'system';
  senderName: string;
  role: string;
  text: string;
  timestamp: string;
  model?: string;
  quotaNote?: string;
  codeSnippet?: string;
  commandRef?: string;
  references?: string[];
}

// --- Copilot & AI Pentest Buddy Types ---
export interface CopilotAttachment {
  id: string;
  name: string;
  type: 'text' | 'pdf' | 'image' | 'code' | 'log';
  size: number;
  content: string; // Text content or Base64 data URL
  mimeType?: string;
}

export type CopilotPersonaId = 'widow-lead' | 'ctf-re' | 'blue-team' | 'code-auditor';

export interface CopilotPersona {
  id: CopilotPersonaId;
  name: string;
  badge: string;
  role: string;
  systemPrompt: string;
  description: string;
  color: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model: string;
  personaId?: CopilotPersonaId;
  attachments?: CopilotAttachment[];
  reasoning?: string;
  tokensUsed?: number;
}

export interface AiModelOption {
  id: string;
  name: string;
  tag: string;
  description: string;
  contextWindow: string;
  recommended?: boolean;
}

// --- Operator Profile & Portfolio Types ---
export interface OperatorProject {
  id: string;
  title: string;
  description: string;
  category: 'Autonomous AI' | 'Cybersecurity' | 'Fullstack Web' | 'Education';
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  stars?: number;
  status: 'Production' | 'Active Development' | 'Maintained';
  highlights: string[];
}

export interface OperatorCertification {
  name: string;
  status: string;
  issuer: string;
  year: string;
  color: string;
}

export interface OperatorSkillGroup {
  category: string;
  skills: string[];
}

export interface OperatorProfile {
  name: string;
  handle: string;
  title: string;
  role: string;
  location: string;
  bio: string;
  githubUrl: string;
  certifications: OperatorCertification[];
  skills: OperatorSkillGroup[];
  projects: OperatorProject[];
}

// ==========================================
// FORENSICS & OSINT INVESTIGATION MATRIX TYPES
// ==========================================

export type OsintCategory = 'Developer' | 'Social' | 'Media' | 'Gaming' | 'Portfolio';

export interface UsernamePlatformDef {
  id: string;
  name: string;
  category: OsintCategory;
  urlPattern: string; // e.g. https://github.com/{username}
  checkUrlPattern?: string; // Optional direct API or probe URL
  method?: 'GET' | 'HEAD' | 'JSON_API';
  expectedStatus?: number[]; // default [200]
  errorStatus?: number[]; // default [404]
  icon: string;
  description: string;
}

export type UsernameCheckStatus = 'checking' | 'found' | 'not_found' | 'rate_limited' | 'error';

export interface UsernameCheckResult {
  id: string;
  platform: string;
  category: OsintCategory;
  username: string;
  profileUrl: string;
  status: UsernameCheckStatus;
  httpStatus?: number;
  latencyMs?: number;
  icon: string;
  verifiedAt?: string;
  notes?: string;
}

export interface IpLookupResult {
  query: string;
  status: 'success' | 'fail';
  message?: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  reverse?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
  threatScore?: number;
  fetchedAt: string;
}

export interface PhonePivotLink {
  label: string;
  url: string;
  icon: string;
  description: string;
}

export interface PhoneLookupResult {
  rawInput: string;
  valid: boolean;
  formattedE164: string;
  formattedInternational: string;
  formattedNational: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  carrier?: string;
  lineType: 'Mobile' | 'Fixed Line' | 'VoIP' | 'Toll-Free' | 'Unknown';
  riskScore: 'Low' | 'Moderate' | 'High';
  riskReason?: string;
  timeZone?: string;
  pivotLinks: PhonePivotLink[];
  analyzedAt: string;
}

export interface ForensicCaseDossier {
  caseId: string;
  caseTitle: string;
  investigator: string;
  affiliation: string;
  createdAt: string;
  targetHandle?: string;
  targetIp?: string;
  targetPhone?: string;
  usernameFindings: UsernameCheckResult[];
  ipFindings?: IpLookupResult;
  phoneFindings?: PhoneLookupResult;
  executiveSummary?: string;
  aiPersonaAnalysis?: string;
  complianceConsent: boolean;
}

// ==========================================
// SOC COMMAND CENTER & INTRUSION DETECTION TYPES
// ==========================================

export type SocSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export interface SocEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  country: string;
  countryFlag: string;
  targetPort: number;
  targetEndpoint: string;
  eventType: string; // e.g. 'Nmap Service Fingerprint', 'SQL Injection Probe', 'Directory Traversal'
  signature: string; // e.g. 'Nmap Scripting Engine (NSE) Discovery', 'Burp Intruder Fuzzing'
  severity: SocSeverity;
  status: 'Blocked' | 'Inspected' | 'Alert';
  payloadSnippet?: string;
  attackPhase: 'Reconnaissance' | 'Initial Access' | 'Execution' | 'Credential Access' | 'Discovery';
  mitigationTip: string;
  mitreTechnique?: string; // e.g. 'T1595.002 - Active Scanning'
}

export interface ThreatArc {
  id: string;
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  color: string;
  sourceCity: string;
  targetCity: string;
  severity: SocSeverity;
}

export interface SocStats {
  securityScore: number;
  activeThreatsCount: number;
  packetsIn: number;
  packetsOut: number;
  bandwidthGbIn: number;
  bandwidthGbOut: number;
  threatsBlocked: number;
  protectedDevices: number;
  aiConfidence: {
    malware: number;
    anomaly: number;
    attribution: number;
  };
}

// ==========================================
// TARGET IDENTITY & RADIAL CONSTELLATION TYPES
// ==========================================

export interface TargetProfile {
  id: string;
  name: string;
  handle: string;
  role: string;
  category: 'High-Value Target' | 'Threat Actor' | 'Audited Asset' | 'Person of Interest';
  organization?: string;
  email?: string;
  phone?: string;
  ip?: string;
  location?: string;
  wilaya?: string;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  tags: string[];
  notesCount: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type RadialClusterCategory = 
  | 'social' 
  | 'developer' 
  | 'network' 
  | 'telephony' 
  | 'personal' 
  | 'vulnerabilities' 
  | 'notes';

export interface RadialLeafItem {
  id: string;
  clusterId: RadialClusterCategory;
  label: string;
  value: string;
  url?: string;
  status: 'verified' | 'unverified' | 'critical' | 'alert';
  strength: 'strong' | 'medium' | 'weak';
  metadata?: Record<string, any>;
}

export interface RadialClusterDef {
  id: RadialClusterCategory;
  title: string;
  color: string;
  ringIndex: number;
  icon: string;
  count: number;
  riskScore: number;
  leaves: RadialLeafItem[];
}

export interface FullNameProfile {
  fullName: string;
  firstName: string;
  lastName: string;
  knownAliases: string[];
  company?: string;
  location?: string;
  wilaya?: string;
  probableEmails: { email: string; pattern: string; confidence: number }[];
  searchDorks: { label: string; query: string; url: string }[];
}

// --- Aerospace & Defense Center Types (Inspired by Reference Image) ---
export interface SatelliteTelemetry {
  id: string;
  name: string;
  currentSpeed: number; // km/h
  targetSpeed: number; // km/h
  altitude: number; // km
  inclination: number; // deg
  signal: 'Strong' | 'Nominal' | 'Weak';
  frequency: string; // e.g. 45.5 MHz
  chanceOfFailure: number; // percentage (e.g. 94%)
  targetsDetected: number;
  collisionAlertEta: string; // e.g. 2h 30m 13s
  status: 'active' | 'warning' | 'standby';
  lat: number;
  lng: number;
}

export interface GroundTower {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Offline' | 'Degraded';
  loadPercent: number;
  devicesCount: number;
  coordinates: [number, number];
}

export interface ThreatWaveformPoint {
  time: string;
  value: number;
  city?: string;
  highlight?: boolean;
}

export interface GlobalCyberAttack {
  id: string;
  sourceCountry: string;
  sourceFlag: string;
  sourceCity?: string;
  sourceCoords: [number, number]; // [lat, lng]
  targetCountry: string;
  targetFlag: string;
  targetCity?: string;
  targetCoords: [number, number]; // [lat, lng]
  threatActor: string; // e.g. 'APT29 (Cozy Bear)', 'Lazarus Group', 'Volt Typhoon', 'LockBit 3.0'
  vector: string; // e.g. 'Zero-Day RCE', 'DDoS Volumetric', 'Supply-Chain Injection', 'BGP Hijacking'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  port?: number;
  status?: 'BLOCKED' | 'ISOLATED' | 'CONTAINED' | 'DETECTED' | 'MITIGATED';
  cve?: string;
  timestamp: string;
}


