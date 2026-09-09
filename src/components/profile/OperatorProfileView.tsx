// ==========================================
// ZAK'S SPIDER — OPERATOR DOSSIER & PROFILE
// Cybersecurity Student, Offensive Pentester & Software Architect
// Showcasing Flagship GitHub Projects (Zak_OS, Zaks_Spider, etc.)
// ==========================================

import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Award, 
  Code2, 
  Terminal, 
  Cpu, 
  Flame, 
  Layers, 
  ExternalLink, 
  Mail, 
  Sparkles, 
  Activity,
  Globe, 
  Database, 
  FolderGit2,
  Check,
  Copy,
  Network,
  Star,
  GitBranch,
  Shield,
  Laptop
} from 'lucide-react';
import { OperatorProject } from '../../types';

interface OperatorProfileViewProps {
  onWeaveProfileToBrain?: () => void;
  onOpenTab?: (tabId: any) => void;
}

const FLAGSHIP_PROJECTS: OperatorProject[] = [
  {
    id: 'zaks-spider',
    title: "Zak's Spider",
    description: 'Autonomous Cyber Reconnaissance Spider, Pentest Command Matrix & Neural Web AI Second Brain. Zero-config multi-tier database engine with Vercel serverless integration.',
    category: 'Cybersecurity',
    tags: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Vercel Serverless', 'OSINT', 'GPT-6 Astra'],
    githubUrl: 'https://github.com/oukil078/Zaks_Spider',
    liveUrl: 'https://zaks-spider.vercel.app',
    stars: 48,
    status: 'Production',
    highlights: [
      '60+ Curated eJPTv2 / OSCP attack and reconnaissance commands with real-time parameter injection',
      'Multi-vector perimeter OSINT: crt.sh subdomains, email harvester, sensitive path weaver, headers audit',
      'Interactive 3D/2D Neural Web knowledge graph with [[wikilinks]] Second Brain markdown vault',
      'Widow-AI Copilot powered by GPT-6 Astra and live CISA KEV vulnerability streaming',
    ],
  },
  {
    id: 'zak-os',
    title: 'Zak_OS',
    description: 'Autonomous Multi-Agent Operating System & Cyber Command Deck. High-density desktop environment featuring Jarvis Crew suite, IDE workspace, telemetry radar, and neural galaxy.',
    category: 'Autonomous AI',
    tags: ['React', 'TypeScript', 'Multi-Agent', 'Monaco Editor', 'Ollama API', 'WebGL', 'Obsidian Vault'],
    githubUrl: 'https://github.com/oukil078/Zak_OS',
    stars: 64,
    status: 'Production',
    highlights: [
      'Multi-agent autonomous crew orchestration with dynamic role delegation and live chat',
      'Embedded browser IDE with code execution and real-time syntax tree parsing',
      'Liquid Glass WebGL visual effects and neural galaxy constellation visualizer',
      'Deep Obsidian PKM integration with 115+ interconnected notes and Zettelkasten graph',
    ],
  },
  {
    id: 'dz-prime-academy',
    title: 'DzPrimeAcademy',
    description: 'High-performance interactive learning management portal and educational tech stack engineered for digital fluency, coding curriculums, and student progress tracking.',
    category: 'Education',
    tags: ['React', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Fullstack'],
    githubUrl: 'https://github.com/oukil078/DzPrimeAcademy',
    stars: 22,
    status: 'Maintained',
    highlights: [
      'Modern responsive learning workflows and automated assignment evaluation',
      'Role-based access control (RBAC) with secure student and educator portals',
      'Real-time classroom telemetry and multimedia interactive modules',
    ],
  },
  {
    id: 'his-future-talents-2026',
    title: 'His-Future-Talents-2026',
    description: 'Elite mentorship, portfolio showcase, and talent incubation platform for ambitious software developers and cybersecurity researchers.',
    category: 'Fullstack Web',
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'Framer Motion'],
    githubUrl: 'https://github.com/oukil078/His-Future-Talents-2026',
    stars: 18,
    status: 'Active Development',
    highlights: [
      'Curated talent directory with interactive career trajectories and milestone verification',
      'Cybersecurity and engineering skills benchmark testing engine',
    ],
  },
];

export const OperatorProfileView: React.FC<OperatorProfileViewProps> = ({
  onWeaveProfileToBrain,
  onOpenTab,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeProjectCategory, setActiveProjectCategory] = useState<string>('all');

  const certifications = [
    { name: 'eJPTv2 (eLearnSecurity Junior Penetration Tester)', status: 'In Progress (88%)', issuer: 'INE Security', year: '2026', color: '#00f0ff' },
    { name: 'Fullstack Web & Systems Engineering', status: 'Active Practitioner', issuer: 'React / Node / TypeScript', year: '2025', color: '#3b82f6' },
    { name: 'Autonomous Multi-Agent AI Architecture', status: 'Specialist', issuer: 'GPT-6 Astra & Local LLMs', year: '2026', color: '#a855f7' },
    { name: 'Obsidian Second Brain PKM Mastery', status: 'Master Nucleus', issuer: '115+ Linked Notes', year: '2025', color: '#10b981' },
  ];

  const skillMatrix = [
    { 
      category: 'Offensive Cybersecurity & Pentesting', 
      skills: ['Nmap', 'Metasploit', 'Gobuster', 'FFUF', 'Hydra', 'SQLmap', 'Burp Suite', 'LinPEAS', 'WinPEAS', 'Wireshark', 'Chisel Pivoting', 'BloodHound', 'CrackMapExec'] 
    },
    { 
      category: 'Fullstack & Systems Engineering', 
      skills: ['TypeScript', 'React 18', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'Python (Asyncio)', 'Docker', 'Vercel Serverless', 'PostgreSQL', 'WebSockets', 'Git'] 
    },
    { 
      category: 'AI & Machine Intelligence', 
      skills: ['GPT-6 Astra', 'Qwen 3.8', 'DeepSeek V4', 'Claude 3.7', 'Multi-Agent Prompting', 'Autonomous Workflows', 'RAG & Vector Embeddings', 'Ollama Local API'] 
    },
    { 
      category: 'Knowledge Engineering & PKM', 
      skills: ['Obsidian Second Brain', 'Zettelkasten Method', 'Markdown Vaults', 'Mermaid.js Diagrams', 'KaTeX Math', 'Backlink Constellation Graphs'] 
    },
  ];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('oukil078@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const filteredProjects = activeProjectCategory === 'all' 
    ? FLAGSHIP_PROJECTS 
    : FLAGSHIP_PROJECTS.filter(p => p.category === activeProjectCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Hero Profile Bento Card */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-[#0c0f18] via-[#090d16] to-[#121824] p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Glow backdrop */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Title */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-emerald-400 p-0.5 shadow-spider-glow">
                <div className="w-full h-full rounded-3xl bg-[#06090e] flex items-center justify-center text-white font-mono font-black text-3xl tracking-tight">
                  ZO
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#06090e] border border-cyan-400 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-white tracking-tight font-mono">
                  Zakarya Oukil
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  OPERATOR / RESEARCHER
                </span>
              </div>
              <p className="text-xs sm:text-sm font-mono text-cyan-200/80">
                Offensive Pentester, Cybersecurity Student & Fullstack Multi-Agent Systems Architect
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-400 pt-1">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> eJPTv2 Candidate
                </span>
                <span>•</span>
                <span className="text-purple-400 flex items-center gap-1">
                  <Cpu className="w-4 h-4" /> Multi-Agent Architect
                </span>
                <span>•</span>
                <span>Algiers / Remote</span>
              </div>
            </div>
          </div>

          {/* Social Links & Bio CTA */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://github.com/oukil078"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-black/50 hover:bg-cyan-500 hover:text-black text-gray-300 border border-cyan-500/30 transition-all flex items-center gap-2 text-xs font-mono font-bold hover:scale-105"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>GitHub</span>
            </a>

            <button
              onClick={handleCopyEmail}
              className="px-4 py-2.5 rounded-2xl bg-black/50 hover:bg-cyan-500/20 text-gray-300 border border-white/10 hover:border-cyan-400 text-xs font-mono font-bold transition-all flex items-center gap-2"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>oukil078@gmail.com</span>
                </>
              )}
            </button>

            {onWeaveProfileToBrain && (
              <button
                onClick={onWeaveProfileToBrain}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-spider-glow transition-all hover:scale-105"
              >
                <Network className="w-4 h-4" />
                <span>Weave Dossier to Brain</span>
              </button>
            )}
          </div>
        </div>

        {/* Bio Narrative */}
        <div className="mt-8 pt-6 border-t border-cyan-500/15 text-xs sm:text-sm text-gray-300 leading-relaxed font-sans max-w-4xl">
          Passionate cybersecurity practitioner and software engineer specializing in offensive penetration testing methodologies (<strong>eJPTv2</strong>), high-concurrency systems, and local autonomous multi-agent operating systems. Creator of <strong className="text-cyan-400">Zak's Spider</strong>, <strong className="text-purple-400">Zak_OS</strong>, and an interconnected 115-note Obsidian Second Brain knowledge vault. Focused on bridging the gap between offensive security automation, vulnerability research, and human-in-the-loop AI intelligence.
        </div>
      </div>

      {/* Certifications & Milestones */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          Certifications & Learning Trajectory
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {certifications.map((cert) => (
            <div
              key={cert.name}
              className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <h3 className="font-bold text-xs text-white font-mono leading-tight">{cert.name}</h3>
                <p className="text-[11px] text-gray-500 font-mono mt-1">{cert.issuer} • {cert.year}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span 
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full text-black"
                  style={{ backgroundColor: cert.color }}
                >
                  {cert.status}
                </span>
                <ShieldCheck className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Skill Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillMatrix.map((item) => (
          <div
            key={item.category}
            className="p-6 rounded-3xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-xl space-y-3"
          >
            <h3 className="font-bold text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              {item.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-mono font-medium px-3 py-1.5 rounded-xl bg-black/40 text-gray-200 border border-white/5 hover:border-cyan-400/40 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Flagship Projects Showcase */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-cyan-400" />
            Flagship Engineering & Security Projects
          </h2>

          {/* Project Category Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
            {['all', 'Cybersecurity', 'Autonomous AI', 'Education'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveProjectCategory(cat)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeProjectCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Repos' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group p-6 rounded-3xl bg-[#090d16]/90 border border-cyan-500/20 hover:border-cyan-400/50 backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col justify-between gap-5 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Laptop className="w-4 h-4" />
                    </span>
                    <h3 className="font-mono font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                      {project.title}
                    </h3>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {project.status}
                  </span>
                </div>

                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  {project.description}
                </p>

                {/* Highlights */}
                <div className="space-y-1.5 pt-2">
                  {project.highlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-mono text-gray-400">
                      <span className="text-cyan-400 font-bold">›</span>
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2.5 py-0.5 rounded-lg bg-black/40 text-cyan-300/80 border border-cyan-500/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Project Links */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    {project.stars || 0}
                  </span>
                  <span>•</span>
                  <span>{project.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-black/50 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live App</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
