import React, { useState, useEffect, useRef } from 'react';
import { marked, Tokens } from 'marked';
import mermaid from 'mermaid';
import { 
  Terminal, Copy, Check, Zap, Sparkles, ShieldAlert, 
  AlertTriangle, Info, ZoomIn, ZoomOut, RotateCcw, 
  Code, Eye, Table as TableIcon, FileSpreadsheet,
  ChevronRight
} from 'lucide-react';

// Initialize Mermaid with Dark Cyberpunk Theme
if (typeof window !== 'undefined') {
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#040711',
        primaryColor: '#091c36',
        primaryTextColor: '#38bdf8',
        primaryBorderColor: '#00f0ff',
        lineColor: '#00f0ff',
        secondaryColor: '#06261f',
        tertiaryColor: '#1e0c38',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '11px',
      },
      securityLevel: 'loose',
    });
  } catch (e) {
    console.warn('Mermaid init warning:', e);
  }
}

interface CyberMarkdownRendererProps {
  content: string;
  msgId: string;
  onPivotToPentest?: (command: string) => void;
}

// ----------------------------------------------------
// 1. SMART CELL BADGE RENDERER
// ----------------------------------------------------
const renderCellContent = (text: string) => {
  const trimmed = text.trim();
  const upper = trimmed.toUpperCase();

  // Critical / High / Medium / Low / Safe Badges
  if (upper === 'CRITICAL' || upper.includes('CVSS 9.') || upper.includes('CVSS 10.')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.25)] animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        {trimmed}
      </span>
    );
  }
  if (upper === 'HIGH' || upper.includes('CVSS 7.') || upper.includes('CVSS 8.')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
        {trimmed}
      </span>
    );
  }
  if (upper === 'MEDIUM' || upper.includes('CVSS 4.') || upper.includes('CVSS 5.') || upper.includes('CVSS 6.')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {trimmed}
      </span>
    );
  }
  if (upper === 'LOW' || upper === 'INFO' || upper.includes('CVSS 1.') || upper.includes('CVSS 2.') || upper.includes('CVSS 3.')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        {trimmed}
      </span>
    );
  }
  if (upper === 'SUCCESS' || upper === 'BLOCKED' || upper === 'MITIGATED' || upper === 'CONTAINED' || upper === 'PATCHED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {trimmed}
      </span>
    );
  }
  if (upper === 'PENDING' || upper === 'IN PROGRESS' || upper === 'QUEUED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
        {trimmed}
      </span>
    );
  }

  // CVE pattern highlight
  if (/^CVE-\d{4}-\d+$/i.test(trimmed)) {
    return (
      <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-extrabold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
        {trimmed}
      </span>
    );
  }

  // Inline backtick code inside cell
  if (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 2) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-mono text-[10px]">
        {trimmed.slice(1, -1)}
      </code>
    );
  }

  return <span>{text}</span>;
};

// ----------------------------------------------------
// 2. CYBER TABLE COMPONENT
// ----------------------------------------------------
const CyberTable: React.FC<{ token: Tokens.Table }> = ({ token }) => {
  const [copied, setCopied] = useState(false);

  const copyAsMarkdown = () => {
    const headers = token.header.map((h) => h.text).join(' | ');
    const divider = token.header.map(() => '---').join(' | ');
    const rows = token.rows.map((r) => r.map((c) => c.text).join(' | ')).join('\n');
    const md = `| ${headers} |\n| ${divider} |\n${rows.split('\n').map((row) => `| ${row} |`).join('\n')}`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[#060b18] overflow-hidden my-4 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
      {/* Table Header Bar */}
      <div className="px-3.5 py-2 bg-[#091226] border-b border-cyan-500/25 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 text-cyan-300 font-extrabold uppercase tracking-wider">
          <TableIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>Security Assessment Matrix</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {token.rows.length} Rows × {token.header.length} Cols
          </span>
        </div>
        <button
          onClick={copyAsMarkdown}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Copy Table as Markdown"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied MD</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-3 h-3 text-slate-400" />
              <span>Copy Table</span>
            </>
          )}
        </button>
      </div>

      {/* Responsive Table Scroll Container */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-slate-900">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0b162f] border-b border-cyan-500/30">
              {token.header.map((col, idx) => (
                <th
                  key={idx}
                  className="py-2.5 px-3.5 text-[11px] font-black uppercase tracking-wider text-cyan-200 select-none"
                  style={{ textAlign: col.align || 'left' }}
                >
                  {col.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[11px]">
            {token.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`transition-colors hover:bg-cyan-500/10 ${
                  rowIdx % 2 === 0 ? 'bg-[#050914]' : 'bg-[#080e22]'
                }`}
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="py-2.5 px-3.5 text-slate-300 leading-snug whitespace-nowrap"
                    style={{ textAlign: cell.align || token.header[cellIdx]?.align || 'left' }}
                  >
                    {renderCellContent(cell.text)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. MERMAID ROADMAP & CHART COMPONENT
// ----------------------------------------------------
const MermaidViewer: React.FC<{ code: string; id: string }> = ({ code, id }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showRaw, setShowRaw] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanId = `mermaid-${id.replace(/[^a-zA-Z0-9_-]/g, '')}-${Math.floor(Math.random() * 10000)}`;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const renderChart = async () => {
      try {
        const cleanCode = code
          .trim()
          .replace(/^```mermaid\s*/i, '')
          .replace(/```$/, '')
          .trim();

        const { svg: renderedSvg } = await mermaid.render(cleanId, cleanCode);
        if (isMounted) {
          setSvg(renderedSvg);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('[Mermaid Render Error]:', err);
          setError(err.message || 'Diagram syntax could not be rendered');
          setIsLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [code, cleanId]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine chart title type
  let chartTypeBadge = 'TACTICAL ROADMAP';
  const lower = code.toLowerCase();
  if (lower.includes('flowchart') || lower.includes('graph')) chartTypeBadge = 'ATTACK FLOWCHART';
  else if (lower.includes('timeline')) chartTypeBadge = 'INCIDENT TIMELINE';
  else if (lower.includes('sequencediagram')) chartTypeBadge = 'PROTOCOL SEQUENCE';
  else if (lower.includes('pie')) chartTypeBadge = 'METRIC DISTRIBUTION';
  else if (lower.includes('gantt')) chartTypeBadge = 'PENTEST SCHEDULE';

  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-[#050914] overflow-hidden my-4 shadow-[0_4px_30px_rgba(16,185,129,0.15)]">
      {/* Header Bar */}
      <div className="px-3.5 py-2 bg-[#071320] border-b border-emerald-500/30 flex items-center justify-between text-[11px] gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-emerald-300 font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{chartTypeBadge}</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Interactive Visual
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          {!showRaw && !error && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/60 rounded-lg px-1 py-0.5 text-[10px]">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
                className="p-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="font-mono px-1 text-slate-300">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
                className="p-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:text-cyan-400 text-slate-400 transition-colors cursor-pointer border-l border-slate-700/60 ml-0.5 pl-1"
                title="Reset Zoom"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Toggle Raw Source */}
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
            title="Toggle Raw Code / Visual Chart"
          >
            {showRaw ? <Eye className="w-3 h-3" /> : <Code className="w-3 h-3" />}
            <span>{showRaw ? 'Visual' : 'Source'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={copyCode}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
            title="Copy Diagram Code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-4 bg-[#030610] overflow-x-auto flex items-center justify-center min-h-[160px] relative scrollbar-thin scrollbar-thumb-emerald-500/20">
        {isLoading && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs py-8 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Synthesizing vector roadmap visualization...</span>
          </div>
        )}

        {showRaw ? (
          <pre className="w-full p-3 font-mono text-[11px] text-emerald-300 bg-[#060a14] rounded-xl overflow-x-auto border border-emerald-500/20">
            {code}
          </pre>
        ) : error ? (
          <div className="w-full text-center py-4 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Visual rendering preview: view raw definition</span>
            </div>
            <pre className="p-3 font-mono text-[11px] text-slate-300 bg-[#060a14] rounded-xl overflow-x-auto text-left border border-white/5">
              {code}
            </pre>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="transition-transform duration-200 origin-center flex items-center justify-center max-w-full"
            style={{ transform: `scale(${zoomLevel})` }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 4. CALLOUT ALERT COMPONENT
// ----------------------------------------------------
const CyberCallout: React.FC<{ text: string }> = ({ text }) => {
  const isCritical = text.includes('[!CRITICAL]') || text.includes('[!CAUTION]');
  const isWarning = text.includes('[!WARNING]');
  const isImportant = text.includes('[!IMPORTANT]');
  const isTip = text.includes('[!TIP]');

  let borderStyle = 'border-cyan-500/40 bg-cyan-950/20 text-cyan-200';
  let icon = <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />;
  let label = 'NOTE';

  if (isCritical) {
    borderStyle = 'border-red-500/50 bg-red-950/25 text-red-200';
    icon = <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />;
    label = 'CRITICAL ALERT';
  } else if (isWarning) {
    borderStyle = 'border-orange-500/50 bg-orange-950/25 text-orange-200';
    icon = <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />;
    label = 'WARNING';
  } else if (isImportant) {
    borderStyle = 'border-purple-500/50 bg-purple-950/25 text-purple-200';
    icon = <Zap className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />;
    label = 'IMPORTANT';
  } else if (isTip) {
    borderStyle = 'border-emerald-500/50 bg-emerald-950/25 text-emerald-200';
    icon = <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
    label = 'PRO TIP';
  }

  const cleanText = text
    .replace(/^>\s*\[!(NOTE|WARNING|CRITICAL|CAUTION|IMPORTANT|TIP)\]\s*/i, '')
    .replace(/^>\s*/gm, '');

  return (
    <div className={`rounded-xl border p-3.5 my-3 flex items-start gap-3 shadow-md ${borderStyle}`}>
      {icon}
      <div className="flex-1 min-w-0 text-xs leading-relaxed">
        <div className="font-extrabold tracking-wider uppercase text-[10px] mb-1 opacity-90">
          {label}
        </div>
        <div className="whitespace-pre-line text-slate-200 font-sans">{cleanText}</div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 5. MAIN CYBER MARKDOWN PARSER & RENDERER
// ----------------------------------------------------
export const CyberMarkdownRenderer: React.FC<CyberMarkdownRendererProps> = ({
  content,
  msgId,
  onPivotToPentest,
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<string | null>(null);

  const copyCodeBlock = (code: string, codeId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(codeId);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Lex text into tokens using marked
  let tokens: any[] = [];
  try {
    tokens = marked.lexer(content);
  } catch {
    // Fallback if marked fails
    return <div className="whitespace-pre-line text-slate-200 leading-relaxed font-mono text-xs">{content}</div>;
  }

  return (
    <div className="space-y-3 font-mono text-xs leading-relaxed">
      {tokens.map((token, index) => {
        const key = `${msgId}-tok-${index}`;

        // ----------------------------------------------------
        // A. TABLES
        // ----------------------------------------------------
        if (token.type === 'table') {
          return <CyberTable key={key} token={token} />;
        }

        // ----------------------------------------------------
        // B. CODE BLOCKS (MERMAID OR BASH/PENTEST COMMANDS)
        // ----------------------------------------------------
        if (token.type === 'code') {
          const lang = (token.lang || '').toLowerCase().trim();
          const code = token.text;

          // Mermaid Diagram Check
          if (
            lang === 'mermaid' ||
            code.trim().startsWith('flowchart') ||
            code.trim().startsWith('graph ') ||
            code.trim().startsWith('timeline') ||
            code.trim().startsWith('sequenceDiagram') ||
            code.trim().startsWith('pie ') ||
            code.trim().startsWith('stateDiagram')
          ) {
            return <MermaidViewer key={key} code={code} id={key} />;
          }

          // Executable Bash / Terminal PenTest Commands
          const codeId = `${msgId}-code-${index}`;
          const isCommand =
            ['bash', 'sh', 'shell', 'zsh', 'terminal', ''].includes(lang) &&
            (code.includes('nmap') ||
              code.includes('davtest') ||
              code.includes('cadaver') ||
              code.includes('impacket') ||
              code.includes('curl') ||
              code.includes('sqlmap') ||
              code.includes('gobuster') ||
              code.includes('hydra') ||
              code.includes('iptables') ||
              code.includes('volatility') ||
              code.includes('msfconsole') ||
              code.includes('hashcat') ||
              code.includes('john') ||
              code.includes('ffuf'));

          return (
            <div key={key} className="rounded-xl border border-cyan-500/30 bg-[#050913] overflow-hidden my-2.5 shadow-md">
              <div className="px-3 py-1.5 bg-[#080f22] border-b border-cyan-500/20 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
                  <Terminal className="w-3 h-3" />
                  <span>{lang || 'SHELL DIRECTIVE'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isCommand && onPivotToPentest && (
                    <button
                      onClick={() => onPivotToPentest(code.split('\n')[0].replace(/^sudo\s+/, ''))}
                      className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Send command directly to PenTest Lab Terminal"
                    >
                      <Zap className="w-2.5 h-2.5 text-cyan-300 fill-cyan-300" />
                      <span>Pivot to PenTest</span>
                    </button>
                  )}
                  <button
                    onClick={() => copyCodeBlock(code, codeId)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedCodeIdx === codeId ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="p-3 text-[11px] leading-relaxed text-emerald-300/95 overflow-x-auto selection:bg-cyan-500/30 font-mono">
                {code}
              </pre>
            </div>
          );
        }

        // ----------------------------------------------------
        // C. HEADINGS
        // ----------------------------------------------------
        if (token.type === 'heading') {
          const depth = token.depth;
          const text = token.text;

          if (depth === 1 || depth === 2) {
            return (
              <div key={key} className="pt-3 pb-1 border-b border-cyan-500/25 my-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-cyan-300 via-white to-slate-300 bg-clip-text">
                    {text}
                  </h2>
                </div>
              </div>
            );
          }

          if (depth === 3) {
            return (
              <div key={key} className="pt-2 my-1 flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <h3 className="text-xs font-black uppercase tracking-wide text-cyan-300">
                  {text}
                </h3>
              </div>
            );
          }

          return (
            <h4 key={key} className="text-xs font-bold text-slate-200 my-1">
              {text}
            </h4>
          );
        }

        // ----------------------------------------------------
        // D. BLOCKQUOTES & CALLOUT ALERTS
        // ----------------------------------------------------
        if (token.type === 'blockquote') {
          return <CyberCallout key={key} text={token.text} />;
        }

        // ----------------------------------------------------
        // E. LISTS
        // ----------------------------------------------------
        if (token.type === 'list') {
          return (
            <ul key={key} className="space-y-1.5 my-2 pl-2">
              {token.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2 text-slate-200">
                  {token.ordered ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0 mt-0.5">
                      {itemIdx + 1}
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_5px_#00f0ff]" />
                  )}
                  <span className="flex-1 leading-relaxed">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        // ----------------------------------------------------
        // F. HORIZONTAL RULE
        // ----------------------------------------------------
        if (token.type === 'hr') {
          return <hr key={key} className="border-t border-cyan-500/20 my-3" />;
        }

        // ----------------------------------------------------
        // G. STANDARD PARAGRAPHS & FORMATTED TEXT
        // ----------------------------------------------------
        return (
          <div
            key={key}
            className="text-slate-200 leading-relaxed font-sans text-xs whitespace-pre-line"
            dangerouslySetInnerHTML={{
              __html: marked.parseInline(token.raw || (token as any).text || ''),
            }}
          />
        );
      })}
    </div>
  );
};
export default CyberMarkdownRenderer;
