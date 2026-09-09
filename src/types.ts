// ==========================================
// ZAK'S SPIDER — CORE SYSTEM DATA TYPES
// ==========================================

export type SpiderTabId = 'pentest' | 'crawler' | 'brain' | 'vuln-news' | 'copilot' | 'operator';

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
