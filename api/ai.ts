// ==========================================
// ZAK'S SPIDER — WIDOW AI REASONING ENGINE (/api/ai)
// Threat Analysis, Payload Generator & Second Brain Chat
// ==========================================

import type { ScrapedResult, ThreatAnalysis, ChatMessage } from '../src/types';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { action, item, messages, context } = req.body || {};

  try {
    // ----------------------------------------
    // Action 1: Deep Threat Analysis
    // ----------------------------------------
    if (action === 'analyze_threat') {
      const scrapedItem = item as ScrapedResult;
      if (!scrapedItem) {
        return res.status(400).json({ success: false, error: 'Missing scraped item' });
      }

      // Check for Gemini API Key or OpenAI API Key
      const geminiKey = process.env.GEMINI_API_KEY;
      const openAiKey = process.env.OPENAI_API_KEY;

      if (geminiKey) {
        try {
          const prompt = `You are Widow-AI, elite cybersecurity threat intelligence analyst for Zak's Spider.
Analyze this reconnaissance footprint:
TARGET: ${scrapedItem.url} (${scrapedItem.domain})
STATUS: ${scrapedItem.metadata.status}
SERVER: ${scrapedItem.metadata.server || 'Unknown'}
EMAILS (${scrapedItem.emails.length}): ${scrapedItem.emails.slice(0, 5).join(', ')}
SUBDOMAINS (${scrapedItem.subdomains.length}): ${scrapedItem.subdomains.slice(0, 8).join(', ')}
ROBOTS DISALLOW: ${scrapedItem.osint?.robots_txt?.disallow?.slice(0, 6).join(', ') || 'None'}
HEADERS AUDIT GRADE: ${scrapedItem.osint?.security_headers?.grade || 'N/A'}

Provide:
1. Threat Level: (CRITICAL, HIGH, MEDIUM, LOW, INFORMATIONAL)
2. Executive Perimeter Summary
3. Key Exploitation Attack Vectors
4. Top 4 Defensive Remediation Steps`;

          const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          });

          if (aiRes.ok) {
            const data = await aiRes.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            let threatLevel: ThreatAnalysis['threatLevel'] = 'MEDIUM';
            if (text.includes('CRITICAL')) threatLevel = 'CRITICAL';
            else if (text.includes('HIGH')) threatLevel = 'HIGH';
            else if (text.includes('LOW')) threatLevel = 'LOW';

            return res.status(200).json({
              success: true,
              analysis: {
                summary: `Evaluated by Gemini AI Engine: Perimeter posture rated ${threatLevel}.`,
                threatLevel,
                attackSurface: scrapedItem.subdomains.length > 0 ? scrapedItem.subdomains : [scrapedItem.domain],
                vulnerabilities: [
                  `Missing defensive security headers (Grade: ${scrapedItem.osint?.security_headers?.grade || 'N/A'})`,
                  `${scrapedItem.emails.length} exposed email addresses harvested`,
                  `${scrapedItem.subdomains.length} mapped subdomains expanding attack perimeter`,
                ],
                recommendations: [
                  'Implement strict Content-Security-Policy (CSP) headers.',
                  'Enforce TLS 1.3 and HSTS across all discovered subdomains.',
                  'Hide web server signature banners to impede automated reconnaissance.',
                ],
                rawAnalysis: text,
              },
            });
          }
        } catch (err) {
          console.warn('[AI] Gemini fallback error:', err);
        }
      }

      // Default Heuristic Threat Intelligence Engine
      const sensitiveCount = scrapedItem.osint?.sensitive_files?.filter(f => f.status === 200).length || 0;
      let level: ThreatAnalysis['threatLevel'] = 'MEDIUM';
      if (sensitiveCount >= 2 || scrapedItem.osint?.security_headers?.grade === 'F') level = 'CRITICAL';
      else if (sensitiveCount >= 1 || scrapedItem.osint?.security_headers?.grade === 'D') level = 'HIGH';

      return res.status(200).json({
        success: true,
        analysis: {
          summary: `Automated Arachnid Threat Matrix for ${scrapedItem.domain}. Posture: ${level}.`,
          threatLevel: level,
          attackSurface: scrapedItem.subdomains.length > 0 ? scrapedItem.subdomains : [scrapedItem.domain],
          vulnerabilities: [
            `Security Headers Grade: ${scrapedItem.osint?.security_headers?.grade || 'C'} (${scrapedItem.osint?.security_headers?.failCount || 0} failed checks)`,
            `${scrapedItem.emails.length} personnel email accounts mapped for phishing OSINT`,
            `${scrapedItem.subdomains.length} hostnames in attack surface`,
          ],
          recommendations: [
            'Audit robots.txt disallow directives to prevent sensitive endpoint enumeration.',
            'Deploy Cloudflare email protection obfuscation.',
            'Add Strict-Transport-Security: max-age=31536000; includeSubDomains.',
          ],
          rawAnalysis: `### 🕷️ Arachnid Perimeter Assessment\n\n- **Target:** ${scrapedItem.url}\n- **Host Type:** ${scrapedItem.osint?.is_ip ? 'Direct IP' : 'FQDN Domain'}\n- **Web Server:** \`${scrapedItem.metadata.server || 'Unknown'}\`\n- **Emails Found:** ${scrapedItem.emails.length}\n- **Discovered Subdomains:** ${scrapedItem.subdomains.length}\n\nAutomated analysis recommends focusing fuzzing on discovered subdomains and validating CORS / CSP policies.`,
        },
      });
    }

    // ----------------------------------------
    // Action 2: Second Brain Widow-AI Chat
    // ----------------------------------------
    if (action === 'chat') {
      const chatHistory = (messages || []) as ChatMessage[];
      const lastMessage = chatHistory[chatHistory.length - 1]?.content || '';

      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey) {
        try {
          const sysPrompt = `You are Widow-AI, the autonomous cybersecurity and reconnaissance assistant of Zak's Spider.
You assist with penetration testing, network discovery, web exploitation, and organizing the operator's Second Brain.
Be concise, tactical, and format code snippets in bash or python.`;

          const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { parts: [{ text: `${sysPrompt}\n\nOperator: ${lastMessage}` }] },
              ],
            }),
          });

          if (aiRes.ok) {
            const data = await aiRes.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return res.status(200).json({ success: true, reply });
          }
        } catch {}
      }

      // Offline Tactical Chat Fallback
      return res.status(200).json({
        success: true,
        reply: `🕷️ **Widow-AI Cyber Intelligence:**\n\nI have received your tactical query: "${lastMessage}".\n\n**Recommended Action Plan:**\n1. **Reconnaissance:** Run a full Nmap scan and Gobuster directory sweep against target.\n2. **Attack Surface:** Check discovered endpoints against known CVE databases.\n3. **Knowledge Base:** Use the Second Brain tab to weave notes with \`[[wikilinks]]\` for rapid correlation.`,
      });
    }

    return res.status(400).json({ success: false, error: 'Unknown action' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
