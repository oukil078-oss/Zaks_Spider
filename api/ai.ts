// ==========================================
// ZAK'S SPIDER — WIDOW AI INTELLIGENCE ENGINE (/api/ai)
// Powered by GPT-6 Astra, Qwen 3.8, DeepSeek & Gemini
// Specialized for Offensive Security, CTF Triage & Vulnerability Intelligence
// ==========================================

import type { ScrapedResult, ThreatAnalysis, ChatMessage, VulnNewsItem } from '../src/types';

const DEFAULT_EXPLABS_KEY = 'xpl_41ece4e40287e26c45ddd9d9f91ee0c2c3fa8de3';
const EXPLABS_ENDPOINT = 'https://api.experientiallabs.ai/v1/chat/completions';

// Persona System Prompts
const PERSONA_PROMPTS: Record<string, string> = {
  'widow-lead': `You are Widow-AI Master, the lead offensive cybersecurity research intelligence of Zak's Spider.
You possess god-tier, mythos-level intelligence in network reconnaissance, perimeter vulnerability analysis, Web application auditing (OWASP Top 10), and Active Directory attack surfaces.
You operate as the trusted pentest buddy and advisor to operator Zakarya Oukil (eJPTv2 candidate & systems architect).
Format all operational directives with clear tactical steps, bash/python command syntax, parameter definitions, and defensive remediation guidance.
Always be direct, precise, tactical, and uncompromising in technical accuracy.`,

  'ctf-re': `You are Cipher-Byte, elite CTF Master and Binary Reverse Engineer for Zak's Spider.
You specialize in CTF challenge triage across Web, Cryptography, Steganography, Forensics, Reverse Engineering (Ghidra/Radare2), and Pwn.
When presented with challenge artifacts, memory dumps, or decompiled code, provide acute analytical insight, identify edge cases, suggest payload methodology, and uncover flags systematically.
Maintain a high-energy, hacker-grade terminal demeanor.`,

  'blue-team': `You are Sentinel-Core, the Principal Defensive Blue Teamer and Threat Hunter of Zak's Spider.
You specialize in detection engineering (Sigma, YARA, Snort), incident response, zero-day CVE mitigation, system hardening, and forensic log analysis.
You prioritize resilience, least privilege, zero-trust architectures, and bulletproof remediation blueprints.`,

  'code-auditor': `You are Audit-Prime, the Senior Static & Dynamic Code Security Auditor of Zak's Spider.
You analyze source code (C/C++, Python, Go, TypeScript, Rust, Solidity) for memory corruption, injection vectors, logic race conditions, SSRF, authorization bypasses, and insecure deserialization.
Deliver precise line-by-line vulnerability dissections and production-ready remediation patches.`,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { 
    action, 
    item, 
    cve, 
    messages, 
    model = 'gpt-6-astra', 
    persona = 'widow-lead',
    attachments = []
  } = req.body || {};

  const apiKey = process.env.EXPLABS_API_KEY || DEFAULT_EXPLABS_KEY;

  try {
    // ----------------------------------------
    // Action 1: Deep Threat Analysis of Scraped Target
    // ----------------------------------------
    if (action === 'analyze_threat') {
      const scrapedItem = item as ScrapedResult;
      if (!scrapedItem) {
        return res.status(400).json({ success: false, error: 'Missing scraped item' });
      }

      const prompt = `Perform an elite cybersecurity threat assessment for this target perimeter:
TARGET: ${scrapedItem.url} (${scrapedItem.domain})
STATUS: ${scrapedItem.metadata.status}
SERVER: ${scrapedItem.metadata.server || 'Unknown'}
EMAILS (${scrapedItem.emails.length}): ${scrapedItem.emails.slice(0, 8).join(', ')}
SUBDOMAINS (${scrapedItem.subdomains.length}): ${scrapedItem.subdomains.slice(0, 12).join(', ')}
ROBOTS DISALLOW: ${scrapedItem.osint?.robots_txt?.disallow?.slice(0, 8).join(', ') || 'None'}
HEADERS AUDIT GRADE: ${scrapedItem.osint?.security_headers?.grade || 'N/A'} (Score: ${scrapedItem.osint?.security_headers?.score || 0}/100)
TECHNOLOGIES: ${scrapedItem.osint?.technologies?.map(t => `${t.name} (${t.category})`).join(', ') || 'Unknown'}

Return a structured report with:
1. Executive Perimeter Summary
2. Threat Level (CRITICAL, HIGH, MEDIUM, LOW)
3. Key Attack Vectors
4. Top 4 Defensive Remediation Steps`;

      try {
        const response = await fetch(EXPLABS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-6-astra',
            messages: [
              { role: 'system', content: PERSONA_PROMPTS['widow-lead'] },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const text = json.choices?.[0]?.message?.content || '';
          let threatLevel: ThreatAnalysis['threatLevel'] = 'MEDIUM';
          if (text.includes('CRITICAL')) threatLevel = 'CRITICAL';
          else if (text.includes('HIGH')) threatLevel = 'HIGH';
          else if (text.includes('LOW')) threatLevel = 'LOW';

          return res.status(200).json({
            success: true,
            analysis: {
              summary: `GPT-6 Astra Intelligence Assessment: Perimeter rated ${threatLevel}.`,
              threatLevel,
              attackSurface: scrapedItem.subdomains.length > 0 ? scrapedItem.subdomains : [scrapedItem.domain],
              vulnerabilities: [
                `Security Headers Grade: ${scrapedItem.osint?.security_headers?.grade || 'N/A'}`,
                `${scrapedItem.emails.length} harvested corporate emails for phishing vectors`,
                `${scrapedItem.subdomains.length} mapped perimeter hostnames`,
              ],
              recommendations: [
                'Enforce strict Content-Security-Policy and HSTS max-age headers.',
                'Obfuscate or restrict directory listings identified via robots.txt.',
                'Sanitize HTTP server banner tokens to conceal version signatures.',
              ],
              rawAnalysis: text,
            },
          });
        }
      } catch (e) {
        console.warn('[AI] Explabs fetch error, falling back to heuristics:', e);
      }

      // Fallback heuristics
      const sensitiveCount = scrapedItem.osint?.sensitive_files?.filter(f => f.status === 200).length || 0;
      let level: ThreatAnalysis['threatLevel'] = 'MEDIUM';
      if (sensitiveCount >= 2 || scrapedItem.osint?.security_headers?.grade === 'F') level = 'CRITICAL';
      else if (sensitiveCount >= 1 || scrapedItem.osint?.security_headers?.grade === 'D') level = 'HIGH';

      return res.status(200).json({
        success: true,
        analysis: {
          summary: `Automated Spider Threat Matrix for ${scrapedItem.domain}. Posture: ${level}.`,
          threatLevel: level,
          attackSurface: scrapedItem.subdomains.length > 0 ? scrapedItem.subdomains : [scrapedItem.domain],
          vulnerabilities: [
            `Security Headers: Grade ${scrapedItem.osint?.security_headers?.grade || 'C'}`,
            `${scrapedItem.emails.length} exposed emails discovered`,
            `${scrapedItem.subdomains.length} subdomains cataloged`,
          ],
          recommendations: [
            'Audit perimeter DNS zone transfers and SSL/TLS certificates.',
            'Deploy Cloudflare email obfuscation on exposed pages.',
            'Implement defensive CSP and X-Frame-Options headers.',
          ],
          rawAnalysis: `### 🕷️ Automated Threat Summary\n\nPerimeter analysis indicates target ${scrapedItem.domain} exposes ${scrapedItem.subdomains.length} endpoints.`,
        },
      });
    }

    // ----------------------------------------
    // Action 2: Deep CVE Vulnerability Triage
    // ----------------------------------------
    if (action === 'analyze_cve') {
      const vuln = cve as VulnNewsItem;
      if (!vuln) {
        return res.status(400).json({ success: false, error: 'Missing CVE object' });
      }

      const cvePrompt = `Analyze this confirmed cybersecurity vulnerability:
CVE ID: ${vuln.cveID}
TITLE: ${vuln.vulnerabilityName}
VENDOR / PRODUCT: ${vuln.vendorProject} - ${vuln.product}
DATE ADDED TO CISA KEV: ${vuln.dateAdded}
RANSOMWARE USE: ${vuln.knownRansomwareCampaignUse || 'Unknown'}
DESCRIPTION: ${vuln.shortDescription}
REQUIRED ACTION: ${vuln.requiredAction || 'Apply vendor updates'}

Provide:
1. Technical Root Cause & Flaw Class (CWE)
2. Threat Actor Exploitation Mechanisms (How it is weaponized in the wild)
3. Immediate Triage & Detection (Log queries, Sigma indicators, or network detection)
4. Comprehensive Remediation & Defense in Depth Guidance`;

      try {
        const response = await fetch(EXPLABS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-6-astra',
            messages: [
              { role: 'system', content: PERSONA_PROMPTS['widow-lead'] },
              { role: 'user', content: cvePrompt }
            ],
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          return res.status(200).json({
            success: true,
            analysis: json.choices?.[0]?.message?.content || 'Analysis generated.',
            model: 'gpt-6-astra',
          });
        }
      } catch (err) {
        console.warn('[AI] CVE analysis error:', err);
      }

      return res.status(200).json({
        success: true,
        analysis: `### 🛡️ Triage Dossier: ${vuln.cveID}\n\n- **Target Entity:** ${vuln.vendorProject} ${vuln.product}\n- **Known Ransomware Exploitation:** ${vuln.knownRansomwareCampaignUse || 'Investigating'}\n- **Summary:** ${vuln.shortDescription}\n\n**Action Required:** ${vuln.requiredAction || 'Apply patches immediately.'}`,
        model: 'heuristic',
      });
    }

    // ----------------------------------------
    // Action 3: Chat with AI Pentest Buddy (Multimodal & Context-Rich)
    // ----------------------------------------
    if (action === 'chat') {
      const history = (messages || []) as ChatMessage[];
      if (history.length === 0) {
        return res.status(400).json({ success: false, error: 'No messages provided' });
      }

      const selectedPersonaPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['widow-lead'];

      // Format attachments into prompt context
      let attachmentsContext = '';
      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        attachmentsContext = '\n\n=== ATTACHED OPERATOR FILES & CONTEXT ===\n' + attachments.map((att: any, i: number) => {
          return `[ATTACHMENT ${i + 1}: ${att.name} (${att.type})]\n${att.content ? (att.content.length > 6000 ? att.content.substring(0, 6000) + '\n...[TRUNCATED FOR CONTEXT]' : att.content) : '[Binary/Image Asset]'}\n`;
        }).join('\n') + '=== END ATTACHMENTS ===\n';
      }

      const formattedMessages = [
        { role: 'system', content: selectedPersonaPrompt },
        ...history.slice(-10).map((m, idx) => {
          // If it's the last message and we have attachments, append the attachments context
          if (idx === history.slice(-10).length - 1 && m.role === 'user' && attachmentsContext) {
            return {
              role: m.role,
              content: `${m.content}${attachmentsContext}`,
            };
          }
          return {
            role: m.role,
            content: m.content,
          };
        }),
      ];

      try {
        const response = await fetch(EXPLABS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model || 'gpt-6-astra',
            messages: formattedMessages,
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const reply = json.choices?.[0]?.message?.content || 'No response generated.';
          const reasoning = json.choices?.[0]?.message?.reasoning || json.choices?.[0]?.reasoning || null;
          const tokensUsed = json.usage?.total_tokens || 0;

          return res.status(200).json({
            success: true,
            reply,
            reasoning,
            tokensUsed,
            model: json.model || model,
          });
        } else {
          const errText = await response.text();
          console.warn('[AI] Provider error:', response.status, errText);
          throw new Error(`Provider API error (${response.status}): ${errText}`);
        }
      } catch (err: any) {
        console.warn('[AI] Chat request failed, using emergency fallback:', err);
        return res.status(200).json({
          success: true,
          reply: `🕷️ **Widow-AI Tactical Dispatch:**\n\nI have received your inquiry. While the remote uplink is synchronizing with **${model}**, here is your immediate operational assessment:\n\n1. **Methodology:** Ensure structured enumeration before active verification.\n2. **Triage:** Inspect target responses, headers, and protocol parameters for anomalies.\n3. **Persistence:** Document all indicators of compromise and findings in your Second Brain.\n\n*(Error detail: ${err.message || 'Remote API sync'})*`,
          model: `${model} (fallback)`,
        });
      }
    }

    return res.status(400).json({ success: false, error: 'Invalid action specified' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
