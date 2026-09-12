// ==========================================
// ZAK'S SPIDER — CRAWLER SERVERLESS FUNCTION (/api/crawl)
// Vercel Serverless Function: Multi-vector Reconnaissance
// ==========================================

import dns from 'dns';
import net from 'net';
import type { 
  ScrapedResult, 
  OsintReconData, 
  SecurityHeadersAudit, 
  DetectedTechnology, 
  SensitiveFileFinding
} from '../src/types';

// Allow self-signed certificates for local labs & private pentests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Check if a hostname is local, loopback, or private RFC1918
function isLocalOrInternal(h: string): boolean {
  const lower = h.toLowerCase();
  if (lower === 'localhost' || lower.endsWith('.localhost') || lower.endsWith('.local') || lower.endsWith('.internal') || lower.endsWith('.test')) {
    return true;
  }
  if (net.isIP(lower)) {
    if (lower.startsWith('127.') || lower.startsWith('10.') || lower.startsWith('192.168.') || lower === '::1') {
      return true;
    }
    const match = lower.match(/^172\.(\d+)\./);
    if (match) {
      const octet = parseInt(match[1], 10);
      if (octet >= 16 && octet <= 31) return true;
    }
  }
  return false;
}

// Decode HTML entities
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&commat;/gi, '@')
    .replace(/&period;/gi, '.')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&');
}

// Comprehensive multi-source email harvester
function harvestEmailsFromText(text: string): string[] {
  const emailSet = new Set<string>();

  // 1. Direct regex on raw content
  const rawMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  rawMatches.forEach(e => emailSet.add(e.toLowerCase().trim()));

  // 2. Mailto attributes (with URI decoding)
  const mailtoMatches = text.matchAll(/href=["']mailto:([^"'\s?#]+)/gi);
  for (const m of mailtoMatches) {
    try {
      const decodedMail = decodeURIComponent(m[1]).toLowerCase().trim();
      if (decodedMail.includes('@')) emailSet.add(decodedMail);
    } catch {
      const rawMail = m[1].toLowerCase().trim();
      if (rawMail.includes('@')) emailSet.add(rawMail);
    }
  }

  // 3. Decoded HTML entities
  const decoded = decodeHtmlEntities(text);
  const decodedMatches = decoded.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  decodedMatches.forEach(e => emailSet.add(e.toLowerCase().trim()));

  // 4. Cloudflare email protection XOR decoding
  const cfMatches = [
    ...text.matchAll(/data-cfemail=["']([a-f0-9]+)["']/gi),
    ...text.matchAll(/\/cdn-cgi\/l\/email-protection#([a-f0-9]+)/gi),
  ];
  for (const m of cfMatches) {
    try {
      const hex = m[1];
      const k = parseInt(hex.substring(0, 2), 16);
      let dec = '';
      for (let i = 2; i < hex.length; i += 2) {
        dec += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ k);
      }
      if (dec.includes('@')) emailSet.add(dec.toLowerCase().trim());
    } catch {}
  }

  // 5. Obfuscated patterns like user [at] domain [dot] com
  const obfMatches = decoded.matchAll(/([a-zA-Z0-9._%+-]+)\s*(?:\[at\]|\(at\)|\s+at\s+)\s*([a-zA-Z0-9.-]+)\s*(?:\[dot\]|\(dot\)|\.|\s+dot\s+)\s*([a-zA-Z]{2,})/gi);
  for (const o of obfMatches) {
    const reconstructed = `${o[1]}@${o[2]}.${o[3]}`.toLowerCase().trim();
    if (reconstructed.includes('@')) emailSet.add(reconstructed);
  }

  return Array.from(emailSet).filter(e => {
    return !e.match(/\.(png|jpg|jpeg|gif|svg|webp|css|js|ico|woff|woff2|ttf|map)$/i);
  });
}

// 45+ High-Priority Pentest Probes Wordlist
interface ProbeTarget {
  path: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  note: string;
  validator: (status: number, text: string, headers: Record<string, string>, rootLen: number, rootTitle: string) => { valid: boolean; evidence?: string };
}

const HIGH_PRIORITY_PROBES: ProbeTarget[] = [
  // 1. Version Control (Git & SVN)
  {
    path: '/.git/HEAD',
    category: 'GIT_REPOSITORY',
    severity: 'CRITICAL',
    note: 'Exposed Git repository metadata',
    validator: (s, t) => {
      if (t.includes('ref: refs/') || (s === 200 && /^[a-f0-9]{40}\b/m.test(t.trim()))) {
        return { valid: true, evidence: `Git HEAD commit pointer exposed: "${t.slice(0, 80).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/.git/config',
    category: 'GIT_REPOSITORY',
    severity: 'CRITICAL',
    note: 'Exposed Git configuration & remote repository URLs',
    validator: (s, t) => {
      if (s === 200 && (t.includes('[core]') || t.includes('repositoryformatversion') || t.includes('[remote "origin"]'))) {
        return { valid: true, evidence: `Git repository configuration exposed: "${t.slice(0, 100).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/.gitignore',
    category: 'GIT_REPOSITORY',
    severity: 'MEDIUM',
    note: 'Exposed .gitignore reveals internal directory structure',
    validator: (s, t, h, rootLen) => {
      if (s === 200 && Math.abs(t.length - rootLen) > 30 && (t.includes('node_modules') || t.includes('.env') || t.includes('dist') || t.includes('*.log'))) {
        return { valid: true, evidence: `Git exclusion rules exposed: "${t.slice(0, 80).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/.svn/entries',
    category: 'SVN_REPOSITORY',
    severity: 'HIGH',
    note: 'Exposed SVN working copy metadata',
    validator: (s, t) => {
      if (s === 200 && (t.includes('svn:') || t.includes('dir\n') || /^\d+\s*$/m.test(t.slice(0, 20)))) {
        return { valid: true, evidence: 'Exposed SVN repository entries file' };
      }
      return { valid: false };
    }
  },

  // 2. Environment & Secrets
  {
    path: '/.env',
    category: 'ENV_FILE',
    severity: 'CRITICAL',
    note: 'Production environment variables and secret tokens',
    validator: (s, t, h, rootLen, rootTitle) => {
      if (s === 200 && !t.includes(rootTitle) && (/^[A-Za-z0-9_]{2,}\s*=\s*.+/m.test(t) || /(SECRET|KEY|PASSWORD|PASS|TOKEN|DATABASE|PORT=|DB_|URL=|NODE_ENV|JWT|ADMIN)/i.test(t))) {
        return { valid: true, evidence: `Plaintext environment variables exposed: "${t.slice(0, 100).replace(/\r?\n/g, ' ').trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/.env.local',
    category: 'ENV_FILE',
    severity: 'CRITICAL',
    note: 'Local environment configuration file',
    validator: (s, t, h, rootLen, rootTitle) => {
      if (s === 200 && !t.includes(rootTitle) && (/^[A-Za-z0-9_]{2,}\s*=\s*.+/m.test(t) || /(SECRET|KEY|PASSWORD|PASS|TOKEN|DATABASE|PORT=|DB_|URL=|JWT)/i.test(t))) {
        return { valid: true, evidence: `Local environment variables exposed: "${t.slice(0, 100).replace(/\r?\n/g, ' ').trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/.env.production',
    category: 'ENV_FILE',
    severity: 'CRITICAL',
    note: 'Production environment configuration file',
    validator: (s, t, h, rootLen, rootTitle) => {
      if (s === 200 && !t.includes(rootTitle) && (/^[A-Za-z0-9_]{2,}\s*=\s*.+/m.test(t) || /(SECRET|KEY|PASSWORD|TOKEN|DATABASE|DB_|URL=)/i.test(t))) {
        return { valid: true, evidence: `Production secrets exposed: "${t.slice(0, 100).replace(/\r?\n/g, ' ').trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/.env.backup',
    category: 'ENV_FILE',
    severity: 'CRITICAL',
    note: 'Backup environment variables file',
    validator: (s, t, h, rootLen, rootTitle) => {
      if (s === 200 && !t.includes(rootTitle) && (/^[A-Za-z0-9_]{2,}\s*=\s*.+/m.test(t) || /(SECRET|KEY|PASSWORD|TOKEN|DB_)/i.test(t))) {
        return { valid: true, evidence: `Backup environment variables exposed: "${t.slice(0, 100).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/.env.example',
    category: 'ENV_FILE',
    severity: 'MEDIUM',
    note: 'Example environment configuration schema',
    validator: (s, t, h, rootLen, rootTitle) => {
      if (s === 200 && !t.includes(rootTitle) && /^[A-Za-z0-9_]{2,}\s*=\s*.+/m.test(t)) {
        return { valid: true, evidence: `Environment schema exposed: "${t.slice(0, 80).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/config.env',
    category: 'ENV_FILE',
    severity: 'CRITICAL',
    note: 'Configuration environment file',
    validator: (s, t, h, rootLen, rootTitle) => {
      if (s === 200 && !t.includes(rootTitle) && /^[A-Za-z0-9_]{2,}\s*=\s*.+/m.test(t)) {
        return { valid: true, evidence: `Configuration environment variables: "${t.slice(0, 80).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/app.env',
    category: 'ENV_FILE',
    severity: 'CRITICAL',
    note: 'Application environment file',
    validator: (s, t, h, rootLen, rootTitle) => {
      if (s === 200 && !t.includes(rootTitle) && /^[A-Za-z0-9_]{2,}\s*=\s*.+/m.test(t)) {
        return { valid: true, evidence: `App environment exposed: "${t.slice(0, 80).trim()}"` };
      }
      return { valid: false };
    }
  },

  // 3. Database Dumps & Backups
  {
    path: '/backup.sql',
    category: 'DATABASE_DUMP',
    severity: 'CRITICAL',
    note: 'Plaintext SQL database dump file',
    validator: (s, t) => {
      if (s === 200 && (t.includes('CREATE TABLE') || t.includes('INSERT INTO') || t.includes('MySQL dump') || t.includes('PostgreSQL database dump'))) {
        return { valid: true, evidence: `Database SQL dump exposed: "${t.slice(0, 100).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/dump.sql',
    category: 'DATABASE_DUMP',
    severity: 'CRITICAL',
    note: 'Database schema and data dump file',
    validator: (s, t) => {
      if (s === 200 && (t.includes('CREATE TABLE') || t.includes('INSERT INTO') || t.includes('MySQL dump'))) {
        return { valid: true, evidence: `Database SQL dump exposed: "${t.slice(0, 100).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/database.sql',
    category: 'DATABASE_DUMP',
    severity: 'CRITICAL',
    note: 'Complete database export file',
    validator: (s, t) => {
      if (s === 200 && (t.includes('CREATE TABLE') || t.includes('INSERT INTO') || t.includes('MySQL dump'))) {
        return { valid: true, evidence: `Database SQL export exposed: "${t.slice(0, 100).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/db.sql',
    category: 'DATABASE_DUMP',
    severity: 'CRITICAL',
    note: 'Database dump file',
    validator: (s, t) => {
      if (s === 200 && (t.includes('CREATE TABLE') || t.includes('INSERT INTO') || t.includes('MySQL dump'))) {
        return { valid: true, evidence: `Database SQL dump exposed: "${t.slice(0, 100).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/users.sql',
    category: 'DATABASE_DUMP',
    severity: 'CRITICAL',
    note: 'User table database export',
    validator: (s, t) => {
      if (s === 200 && (t.includes('CREATE TABLE') || t.includes('INSERT INTO') || t.includes('users'))) {
        return { valid: true, evidence: `User table export exposed: "${t.slice(0, 100).trim()}"` };
      }
      return { valid: false };
    }
  },

  // 4. Server Configuration & Diagnostics
  {
    path: '/phpinfo.php',
    category: 'INFO_DISCLOSURE',
    severity: 'HIGH',
    note: 'Exposes complete PHP environment & server module configuration',
    validator: (s, t) => {
      if (s === 200 && (t.includes('PHP Version') || t.includes('phpinfo()') || t.includes('Configuration File (php.ini)'))) {
        return { valid: true, evidence: 'Public phpinfo() diagnostic page exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/info.php',
    category: 'INFO_DISCLOSURE',
    severity: 'HIGH',
    note: 'PHP diagnostic information disclosure',
    validator: (s, t) => {
      if (s === 200 && (t.includes('PHP Version') || t.includes('phpinfo()'))) {
        return { valid: true, evidence: 'Public phpinfo() diagnostic page exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/server-status',
    category: 'INFO_DISCLOSURE',
    severity: 'HIGH',
    note: 'Apache HTTP Server status page',
    validator: (s, t) => {
      if (s === 200 && (t.includes('Apache Server Status') || t.includes('Server Version: Apache'))) {
        return { valid: true, evidence: 'Apache mod_status live connection monitor exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/actuator/health',
    category: 'SPRING_ACTUATOR',
    severity: 'MEDIUM',
    note: 'Spring Boot actuator health endpoint',
    validator: (s, t) => {
      if (s === 200 && (t.includes('"status":"UP"') || t.includes('"components":'))) {
        return { valid: true, evidence: 'Spring Boot actuator health telemetry exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/actuator/env',
    category: 'SPRING_ACTUATOR',
    severity: 'CRITICAL',
    note: 'Spring Boot actuator environment properties',
    validator: (s, t) => {
      if (s === 200 && (t.includes('"propertySources"') || t.includes('"activeProfiles"'))) {
        return { valid: true, evidence: 'Spring Boot actuator environment secrets exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/actuator',
    category: 'SPRING_ACTUATOR',
    severity: 'HIGH',
    note: 'Spring Boot management actuator root',
    validator: (s, t) => {
      if (s === 200 && t.includes('_links') && t.includes('actuator')) {
        return { valid: true, evidence: 'Spring Boot management actuator endpoints exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/docker-compose.yml',
    category: 'DOCKER_CONFIG',
    severity: 'HIGH',
    note: 'Docker container orchestration & service architecture',
    validator: (s, t) => {
      if (s === 200 && (t.includes('version:') || t.includes('services:')) && t.includes('image:')) {
        return { valid: true, evidence: `Docker compose file exposed: "${t.slice(0, 100).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/Dockerfile',
    category: 'DOCKER_CONFIG',
    severity: 'MEDIUM',
    note: 'Container build instructions',
    validator: (s, t) => {
      if (s === 200 && (/^FROM\s+[a-zA-Z0-9]/m.test(t) || t.includes('WORKDIR') || t.includes('ENTRYPOINT'))) {
        return { valid: true, evidence: `Dockerfile exposed: "${t.slice(0, 80).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/web.config',
    category: 'SERVER_CONFIG',
    severity: 'HIGH',
    note: 'IIS server configuration',
    validator: (s, t) => {
      if (s === 200 && (t.includes('<configuration>') || t.includes('<system.webServer>'))) {
        return { valid: true, evidence: 'IIS web.config XML exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/.htaccess',
    category: 'SERVER_CONFIG',
    severity: 'HIGH',
    note: 'Apache distributed configuration',
    validator: (s, t) => {
      if (s === 200 && (t.includes('RewriteEngine') || t.includes('RewriteRule') || t.includes('AuthType'))) {
        return { valid: true, evidence: 'Apache .htaccess configuration exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/.htpasswd',
    category: 'SERVER_CONFIG',
    severity: 'CRITICAL',
    note: 'Apache HTTP basic authentication password hashes',
    validator: (s, t) => {
      if (s === 200 && /^[a-zA-Z0-9_-]+:\$[a-zA-Z0-9./]+/m.test(t)) {
        return { valid: true, evidence: 'Apache .htpasswd credential hashes exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/config.json',
    category: 'CONFIG_FILE',
    severity: 'HIGH',
    note: 'JSON configuration file',
    validator: (s, t) => {
      if (s === 200 && t.trim().startsWith('{') && (t.includes('database') || t.includes('api') || t.includes('host') || t.includes('port'))) {
        return { valid: true, evidence: `JSON configuration exposed: "${t.slice(0, 80).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/config.php.bak',
    category: 'CONFIG_BACKUP',
    severity: 'CRITICAL',
    note: 'PHP database credentials backup',
    validator: (s, t) => {
      if (s === 200 && (t.includes('<?php') || t.includes('DB_PASSWORD') || t.includes('database'))) {
        return { valid: true, evidence: 'Database config backup exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/wp-config.php.bak',
    category: 'CONFIG_BACKUP',
    severity: 'CRITICAL',
    note: 'WordPress database credentials backup',
    validator: (s, t) => {
      if (s === 200 && (t.includes('DB_PASSWORD') || t.includes('DB_NAME') || t.includes('wp-config'))) {
        return { valid: true, evidence: 'WordPress wp-config.php.bak credentials exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/.DS_Store',
    category: 'DS_STORE',
    severity: 'MEDIUM',
    note: 'macOS folder structure and file enumeration metadata',
    validator: (s, t) => {
      if (s === 200 && (t.includes('Bud1') || /^\x00\x00\x00\x01Bud1/.test(t) || t.length > 30)) {
        return { valid: true, evidence: 'macOS .DS_Store file hierarchy metadata exposed' };
      }
      return { valid: false };
    }
  },

  // 5. APIs & Documentation
  {
    path: '/swagger.json',
    category: 'API_DOCS',
    severity: 'MEDIUM',
    note: 'Swagger / OpenAPI 2.0 API schema specification',
    validator: (s, t) => {
      if (s === 200 && (t.includes('"swagger":') || t.includes('"paths":'))) {
        return { valid: true, evidence: 'Public Swagger REST API schema specification exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/openapi.json',
    category: 'API_DOCS',
    severity: 'MEDIUM',
    note: 'OpenAPI 3.0 REST API schema specification',
    validator: (s, t) => {
      if (s === 200 && (t.includes('"openapi":') || t.includes('"paths":'))) {
        return { valid: true, evidence: 'Public OpenAPI 3.0 API schema specification exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/api-docs',
    category: 'API_DOCS',
    severity: 'MEDIUM',
    note: 'Interactive REST API documentation route',
    validator: (s, t) => {
      if (s === 200 && (t.includes('swagger') || t.includes('api-docs') || t.includes('redoc'))) {
        return { valid: true, evidence: 'Public API documentation dashboard exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/swagger-ui.html',
    category: 'API_DOCS',
    severity: 'MEDIUM',
    note: 'Interactive Swagger UI dashboard',
    validator: (s, t) => {
      if (s === 200 && (t.includes('swagger-ui') || t.includes('Swagger UI'))) {
        return { valid: true, evidence: 'Interactive Swagger UI dashboard exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/graphql',
    category: 'GRAPHQL_SCHEMA',
    severity: 'HIGH',
    note: 'GraphQL endpoint with schema introspection query support',
    validator: (s, t) => {
      if ((s === 200 || s === 400) && (t.includes('__schema') || t.includes('GraphQL') || t.includes('Must provide query string') || t.includes('query execution failed'))) {
        return { valid: true, evidence: 'Public GraphQL endpoint with introspection available' };
      }
      return { valid: false };
    }
  },
  {
    path: '/api/graphql',
    category: 'GRAPHQL_SCHEMA',
    severity: 'HIGH',
    note: 'Secondary GraphQL API endpoint',
    validator: (s, t) => {
      if ((s === 200 || s === 400) && (t.includes('__schema') || t.includes('GraphQL') || t.includes('Must provide query string'))) {
        return { valid: true, evidence: 'Public GraphQL API endpoint exposed' };
      }
      return { valid: false };
    }
  },

  // 6. Public Metadata & Recon
  {
    path: '/robots.txt',
    category: 'ROBOTS_DISALLOW',
    severity: 'INFO',
    note: 'Web crawler access control policy',
    validator: (s, t) => {
      if (s === 200 && (t.includes('User-agent:') || t.includes('Disallow:') || t.includes('Allow:'))) {
        const disallows = (t.match(/Disallow:\s*([^\r\n#]+)/gi) || []).length;
        return { valid: true, evidence: `Cataloged ${disallows} disallowed paths` };
      }
      return { valid: false };
    }
  },
  {
    path: '/sitemap.xml',
    category: 'SITEMAP_INDEX',
    severity: 'INFO',
    note: 'Search engine route index',
    validator: (s, t) => {
      if (s === 200 && (t.includes('<urlset') || t.includes('<sitemapindex') || t.includes('<loc>'))) {
        return { valid: true, evidence: 'Public XML sitemap route index exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/.well-known/security.txt',
    category: 'SECURITY_TXT',
    severity: 'INFO',
    note: 'RFC 9116 security contact disclosure',
    validator: (s, t) => {
      if (s === 200 && (t.includes('Contact:') || t.includes('Expires:') || t.includes('Preferred-Languages:'))) {
        return { valid: true, evidence: 'RFC 9116 security disclosure published with contact info' };
      }
      return { valid: false };
    }
  },

  // 7. Sensitive Files & CTF Vectors
  {
    path: '/secret.txt',
    category: 'INFO_DISCLOSURE',
    severity: 'HIGH',
    note: 'Sensitive text file disclosure',
    validator: (s, t, h, rootLen, rootTitle) => {
      if (s === 200 && !t.includes(rootTitle) && t.trim().length > 0) {
        return { valid: true, evidence: `Sensitive text file: "${t.slice(0, 80).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/flag.txt',
    category: 'CTF_FLAG',
    severity: 'CRITICAL',
    note: 'CTF challenge flag file',
    validator: (s, t, h, rootLen, rootTitle) => {
      if (s === 200 && !t.includes(rootTitle) && t.trim().length > 0) {
        return { valid: true, evidence: `Flag exposed: "${t.slice(0, 80).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/passwords.txt',
    category: 'CREDENTIALS',
    severity: 'CRITICAL',
    note: 'Plaintext passwords file',
    validator: (s, t, h, rootLen, rootTitle) => {
      if (s === 200 && !t.includes(rootTitle) && t.trim().length > 0) {
        return { valid: true, evidence: `Password list exposed: "${t.slice(0, 80).trim()}"` };
      }
      return { valid: false };
    }
  },
  {
    path: '/id_rsa',
    category: 'SSH_KEY',
    severity: 'CRITICAL',
    note: 'Exposed SSH private key',
    validator: (s, t) => {
      if (s === 200 && (t.includes('BEGIN RSA PRIVATE KEY') || t.includes('BEGIN OPENSSH PRIVATE KEY'))) {
        return { valid: true, evidence: 'Unencrypted SSH private key exposed' };
      }
      return { valid: false };
    }
  },
  {
    path: '/admin/',
    category: 'ADMIN_PANEL',
    severity: 'MEDIUM',
    note: 'Administrative portal login or management console',
    validator: (s, t) => {
      if (s === 200 && (t.includes('admin') || t.includes('login') || t.includes('password') || t.includes('dashboard'))) {
        return { valid: true, evidence: 'Administrative portal accessible' };
      }
      return { valid: false };
    }
  },
];

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing target URL' });
  }

  try {
    let clean = url.trim();

    // Preserve protocol if specified, otherwise infer
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      const isLikelyHttp = /^(localhost|127\.|192\.168\.|10\.|0\.0\.0\.0)(:\d+)?/i.test(clean) ||
        /:(80|8080|8888|3000|5000|8000|5173|4200|8008)(\/|$)/.test(clean);
      clean = isLikelyHttp ? 'http://' + clean : 'https://' + clean;
    }

    let parsed: URL;
    try {
      parsed = new URL(clean);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid URL format' });
    }

    const host = parsed.hostname.toLowerCase();
    const isLocal = isLocalOrInternal(host);
    const isIp = net.isIP(host) !== 0;
    const rootDomain = (isLocal || isIp) ? host : host.split('.').slice(-2).join('.');

    // 1. DNS Resolution (instant lookup for local/IPs, parallel race for public domains)
    const dnsRecords: OsintReconData['dns'] = {};
    let hostmasterEmail = '';
    let resolvedTargetIp = isIp ? host : 'Unknown';

    if (isLocal || isIp) {
      try {
        const lookupAddr = await new Promise<string>((resolve) => {
          dns.lookup(host, (err, address) => resolve(err ? (isIp ? host : '127.0.0.1') : address));
        });
        resolvedTargetIp = lookupAddr;
        dnsRecords.a = [lookupAddr];
      } catch {
        resolvedTargetIp = isIp ? host : '127.0.0.1';
        dnsRecords.a = [resolvedTargetIp];
      }
    } else {
      // Public domain parallel DNS queries with strict 1500ms timeout
      const dnsRace = (fn: (cb: (err: any, res: any) => void) => void, ms = 1500) => {
        return Promise.race([
          new Promise<any>((resolve) => fn((err, res) => resolve(err ? [] : res))),
          new Promise<any>((resolve) => setTimeout(() => resolve([]), ms))
        ]);
      };

      try {
        const [aRecs, mxRecs, txtRecs, nsRecs, soaRec] = await Promise.all([
          dnsRace(cb => dns.resolve4(host, cb)),
          dnsRace(cb => dns.resolveMx(host, cb)),
          dnsRace(cb => dns.resolveTxt(host, cb)),
          dnsRace(cb => dns.resolveNs(host, cb)),
          dnsRace(cb => dns.resolveSoa(rootDomain, cb)),
        ]);

        dnsRecords.a = Array.isArray(aRecs) ? aRecs : [];
        if (dnsRecords.a.length > 0) resolvedTargetIp = dnsRecords.a[0];
        dnsRecords.mx = Array.isArray(mxRecs) ? mxRecs : [];
        dnsRecords.txt = Array.isArray(txtRecs) ? txtRecs.flat() : [];
        dnsRecords.ns = Array.isArray(nsRecs) ? nsRecs : [];

        if (soaRec && typeof soaRec === 'object' && soaRec.hostmaster) {
          const hm = String(soaRec.hostmaster).replace(/\./, '@');
          if (hm.includes('@') && !hm.endsWith('.')) {
            hostmasterEmail = hm;
          }
        }
      } catch {}
    }

    // 2. Fetch main root page with fast HTTPS <-> HTTP fallback
    let html = '';
    let status = 200;
    let serverBanner = '';
    let contentType = '';
    let responseHeaders: Record<string, string> = {};
    let activeOrigin = parsed.origin;

    const fetchPage = async (targetUrl: string, timeoutMs = 3500) => {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 ZaksSpider/2.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
      });

      const hdrs: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        hdrs[key.toLowerCase()] = val;
      });

      const body = await response.text();
      return {
        status: response.status,
        headers: hdrs,
        body,
        finalUrl: response.url || targetUrl,
        server: hdrs['server'] || '',
        contentType: hdrs['content-type'] || '',
      };
    };

    try {
      const pageResult = await fetchPage(clean);
      status = pageResult.status;
      serverBanner = pageResult.server;
      contentType = pageResult.contentType;
      responseHeaders = pageResult.headers;
      html = pageResult.body;
      activeOrigin = new URL(pageResult.finalUrl).origin;
    } catch (err: any) {
      // Instant fallback to alternate protocol
      const alternate = clean.startsWith('https://') 
        ? clean.replace(/^https:\/\//, 'http://')
        : clean.replace(/^http:\/\//, 'https://');

      try {
        const fallbackResult = await fetchPage(alternate);
        status = fallbackResult.status;
        serverBanner = fallbackResult.server;
        contentType = fallbackResult.contentType;
        responseHeaders = fallbackResult.headers;
        html = fallbackResult.body;
        activeOrigin = new URL(fallbackResult.finalUrl).origin;
        clean = alternate;
      } catch (fbErr: any) {
        html = `Fetch failed: ${err.message}; Fallback failed: ${fbErr.message}`;
      }
    }

    // 3. Extract title and description
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : `${host} - Endpoint`;
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : 'No meta description detected.';
    const rootLen = html.length;

    // 4. Multi-Source Email Harvesting
    const emailSet = new Set<string>();
    harvestEmailsFromText(html).forEach(e => emailSet.add(e));
    if (hostmasterEmail) emailSet.add(hostmasterEmail.toLowerCase());

    // 5. Extract links & routes from HTML
    const internalLinks = new Set<string>();
    const externalLinks = new Set<string>();
    const hrefMatches = html.matchAll(/href=["']([^"'#\s]+)["']/gi);
    for (const m of hrefMatches) {
      const link = m[1].trim();
      if (link.startsWith('http://') || link.startsWith('https://')) {
        try {
          const u = new URL(link);
          if (u.hostname.includes(rootDomain) || u.hostname === host) {
            internalLinks.add(link);
          } else {
            externalLinks.add(link);
          }
        } catch {}
      } else if (link.startsWith('/')) {
        internalLinks.add(`${activeOrigin}${link}`);
      }
    }

    // Deep Crawl for secondary contact pages (e.g. /contact, /about)
    const secondaryRoutesToCheck = ['/contact', '/contact-us', '/about', '/about-us', '/team', '/support'];
    for (const secRoute of secondaryRoutesToCheck) {
      try {
        const secRes = await fetchPage(`${activeOrigin}${secRoute}`, 2000);
        if (secRes.status === 200 && secRes.body) {
          harvestEmailsFromText(secRes.body).forEach(e => emailSet.add(e));
        }
      } catch {}
    }

    // 6. Subdomain discovery via crt.sh (for public domains)
    const subdomains = new Set<string>();
    if (!isLocal && !isIp) {
      subdomains.add(`www.${rootDomain}`);
      subdomains.add(`api.${rootDomain}`);
      subdomains.add(`mail.${rootDomain}`);
      try {
        const crtRes = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(rootDomain)}&output=json`, {
          signal: AbortSignal.timeout(3500),
        });
        if (crtRes.ok) {
          const entries = (await crtRes.json()) as any[];
          for (const e of entries.slice(0, 50)) {
            const nameVal = e.name_value || '';
            const names = nameVal.split('\n');
            for (const n of names) {
              const cleanedSub = n.replace(/^\*\./, '').toLowerCase().trim();
              if (cleanedSub.endsWith(rootDomain) && !cleanedSub.includes('*')) {
                subdomains.add(cleanedSub);
              }
            }
          }
        }
      } catch {}
    }

    // 7. Robots.txt and sensitive paths probe
    const sensitiveFiles: SensitiveFileFinding[] = [];
    const robotsTxtData = { disallow: [] as string[], allow: [] as string[], sitemaps: [] as string[] };

    // Probe A: /robots.txt
    try {
      const robotsRes = await fetch(`${activeOrigin}/robots.txt`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ZaksSpider/2.0' },
        signal: AbortSignal.timeout(2500)
      });
      if (robotsRes.ok) {
        const robText = await robotsRes.text();
        const disallows = (robText.match(/Disallow:\s*([^\r\n#]+)/gi) || []).map(l => l.replace(/Disallow:\s*/i, '').trim()).filter(Boolean);
        const allows = (robText.match(/Allow:\s*([^\r\n#]+)/gi) || []).map(l => l.replace(/Allow:\s*/i, '').trim()).filter(Boolean);
        const sitemaps = (robText.match(/Sitemap:\s*([^\r\n#]+)/gi) || []).map(l => l.replace(/Sitemap:\s*/i, '').trim()).filter(Boolean);

        robotsTxtData.disallow = disallows;
        robotsTxtData.allow = allows;
        robotsTxtData.sitemaps = sitemaps;

        // Extract emails in robots comments
        harvestEmailsFromText(robText).forEach(e => emailSet.add(e));

        sensitiveFiles.push({
          path: '/robots.txt',
          url: `${activeOrigin}/robots.txt`,
          status: robotsRes.status,
          source: 'robots.txt',
          interesting: disallows.length > 0,
          notes: `Exposes ${disallows.length} disallow paths and ${sitemaps.length} sitemaps`,
        });
      }
    } catch {}

    // Probe B: /.well-known/security.txt
    try {
      const secRes = await fetch(`${activeOrigin}/.well-known/security.txt`, { signal: AbortSignal.timeout(2500) });
      if (secRes.ok) {
        const secText = await secRes.text();
        const secEmails = harvestEmailsFromText(secText);
        secEmails.forEach(e => emailSet.add(e));

        sensitiveFiles.push({
          path: '/.well-known/security.txt',
          url: `${activeOrigin}/.well-known/security.txt`,
          status: secRes.status,
          source: 'heuristic',
          interesting: true,
          notes: `RFC 9116 security disclosure published with ${secEmails.length} contacts`,
        });
      }
    } catch {}

    // Probe C: Concurrent 45+ Sensitive File Wordlist Probing
    const probeBatchSize = 6;
    for (let i = 0; i < HIGH_PRIORITY_PROBES.length; i += probeBatchSize) {
      const batch = HIGH_PRIORITY_PROBES.slice(i, i + probeBatchSize);
      await Promise.all(
        batch.map(async (probe) => {
          // Avoid duplicate check if robots or security already added
          if (probe.path === '/robots.txt' || probe.path === '/.well-known/security.txt') return;

          try {
            const probeRes = await fetch(`${activeOrigin}${probe.path}`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ZaksSpider/2.0' },
              signal: AbortSignal.timeout(2000),
            });

            const probeText = await probeRes.text();
            const hdrs: Record<string, string> = {};
            probeRes.headers.forEach((v, k) => { hdrs[k.toLowerCase()] = v; });

            // Extract any emails discovered inside probe bodies (e.g. database dumps, env configs)
            if (probeRes.status === 200 && probeText.length > 0) {
              harvestEmailsFromText(probeText).forEach(e => emailSet.add(e));
            }

            // Check 403 Forbidden (confirms protected existence on disk)
            if (probeRes.status === 403 || probeRes.status === 401) {
              if (probe.category === 'GIT_REPOSITORY' || probe.category === 'ENV_FILE' || probe.category === 'ADMIN_PANEL' || probe.category === 'SERVER_CONFIG') {
                sensitiveFiles.push({
                  path: probe.path,
                  url: `${activeOrigin}${probe.path}`,
                  status: probeRes.status,
                  source: 'heuristic',
                  interesting: true,
                  notes: `HTTP ${probeRes.status} Forbidden: Protected sensitive asset exists on server`,
                });
              }
              return;
            }

            // Run validator
            const checkResult = probe.validator(probeRes.status, probeText, hdrs, rootLen, title);
            if (checkResult.valid) {
              sensitiveFiles.push({
                path: probe.path,
                url: `${activeOrigin}${probe.path}`,
                status: probeRes.status,
                source: 'heuristic',
                interesting: true,
                notes: checkResult.evidence || probe.note,
              });
            }
          } catch {}
        })
      );
    }

    // 8. Security Headers Audit
    const securityAudit = auditSecurityHeaders(responseHeaders);

    // 9. Detected Technologies
    const technologies = detectTechnologies(responseHeaders, html);

    const result: ScrapedResult = {
      url: clean,
      domain: host,
      metadata: {
        title,
        description,
        author: 'Arachnid Recon Agent',
        status,
        server: serverBanner,
        content_type: contentType,
      },
      emails: Array.from(emailSet).sort(),
      subdomains: Array.from(subdomains).sort(),
      links: {
        internal: Array.from(internalLinks).slice(0, 100),
        external: Array.from(externalLinks).slice(0, 50),
        total_internal: internalLinks.size,
        total_external: externalLinks.size,
      },
      text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4000),
      scraped_at: new Date().toISOString(),
      osint: {
        root_domain: rootDomain,
        is_ip: isIp,
        target_ip: resolvedTargetIp,
        dns: dnsRecords,
        robots_txt: robotsTxtData,
        sensitive_files: sensitiveFiles,
        security_headers: securityAudit,
        technologies,
      },
    };

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

function auditSecurityHeaders(headers: Record<string, string>): SecurityHeadersAudit {
  const findings: SecurityHeadersAudit['findings'] = [];
  let passCount = 0;
  let failCount = 0;

  // HSTS
  if (headers['strict-transport-security']) {
    passCount++;
    findings.push({
      header: 'Strict-Transport-Security',
      value: headers['strict-transport-security'],
      status: 'pass',
      importance: 'critical',
      description: 'HSTS is enforced, preventing SSL-stripping man-in-the-middle attacks.',
      recommendation: 'Maintain configuration.',
    });
  } else {
    failCount++;
    findings.push({
      header: 'Strict-Transport-Security',
      status: 'fail',
      importance: 'critical',
      description: 'Missing HSTS header allows users to connect via unencrypted HTTP.',
      recommendation: 'Add Strict-Transport-Security: max-age=31536000; includeSubDomains.',
    });
  }

  // Content-Security-Policy
  if (headers['content-security-policy']) {
    passCount++;
    findings.push({
      header: 'Content-Security-Policy',
      value: headers['content-security-policy'].substring(0, 80) + '...',
      status: 'pass',
      importance: 'high',
      description: 'CSP mitigates Cross-Site Scripting (XSS) and data injection.',
      recommendation: 'Ensure unsafe-inline is restricted.',
    });
  } else {
    failCount++;
    findings.push({
      header: 'Content-Security-Policy',
      status: 'fail',
      importance: 'high',
      description: 'Missing CSP leaves endpoints vulnerable to reflected and stored XSS.',
      recommendation: 'Define a strict CSP policy.',
    });
  }

  // X-Frame-Options
  if (headers['x-frame-options']) {
    passCount++;
    findings.push({
      header: 'X-Frame-Options',
      value: headers['x-frame-options'],
      status: 'pass',
      importance: 'medium',
      description: 'Mitigates UI redressing and Clickjacking attacks.',
      recommendation: 'Consider frame-ancestors in CSP.',
    });
  } else {
    failCount++;
    findings.push({
      header: 'X-Frame-Options',
      status: 'fail',
      importance: 'medium',
      description: 'Missing X-Frame-Options allows page embedding in malicious iframes.',
      recommendation: 'Set X-Frame-Options to DENY or SAMEORIGIN.',
    });
  }

  // X-Content-Type-Options
  if (headers['x-content-type-options']) {
    passCount++;
    findings.push({
      header: 'X-Content-Type-Options',
      value: headers['x-content-type-options'],
      status: 'pass',
      importance: 'medium',
      description: 'Prevents browser MIME-sniffing away from declared content-type.',
      recommendation: 'Keep nosniff configured.',
    });
  } else {
    failCount++;
    findings.push({
      header: 'X-Content-Type-Options',
      status: 'fail',
      importance: 'medium',
      description: 'MIME sniffing can lead to executable script execution from uploaded media.',
      recommendation: 'Set X-Content-Type-Options: nosniff.',
    });
  }

  // Referrer-Policy
  if (headers['referrer-policy']) {
    passCount++;
    findings.push({
      header: 'Referrer-Policy',
      value: headers['referrer-policy'],
      status: 'pass',
      importance: 'low',
      description: 'Controls referrer information sent in outbound requests.',
      recommendation: 'Maintain strict-origin-when-cross-origin.',
    });
  } else {
    failCount++;
    findings.push({
      header: 'Referrer-Policy',
      status: 'fail',
      importance: 'low',
      description: 'Missing Referrer-Policy may leak sensitive query parameters in URL headers.',
      recommendation: 'Set Referrer-Policy: strict-origin-when-cross-origin.',
    });
  }

  // Permissions-Policy
  if (headers['permissions-policy']) {
    passCount++;
    findings.push({
      header: 'Permissions-Policy',
      value: headers['permissions-policy'],
      status: 'pass',
      importance: 'low',
      description: 'Restricts access to browser APIs like geolocation, camera, and microphone.',
      recommendation: 'Maintain configuration.',
    });
  } else {
    failCount++;
    findings.push({
      header: 'Permissions-Policy',
      status: 'fail',
      importance: 'low',
      description: 'Missing Permissions-Policy allows iframes to request sensitive browser features.',
      recommendation: 'Define explicit Permissions-Policy (camera=(), microphone=(), geolocation=()).',
    });
  }

  const score = Math.round((passCount / (passCount + failCount || 1)) * 100);
  let grade: SecurityHeadersAudit['grade'] = 'F';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else if (score >= 35) grade = 'D';

  return { grade, score, passCount, failCount, findings };
}

function detectTechnologies(headers: Record<string, string>, html: string): DetectedTechnology[] {
  const techs: DetectedTechnology[] = [];
  const server = (headers['server'] || '').toLowerCase();
  const xPowered = (headers['x-powered-by'] || '').toLowerCase();
  const via = (headers['via'] || '').toLowerCase();
  const lowerHtml = html.toLowerCase();

  // Web Servers
  if (server.includes('nginx')) techs.push({ name: 'Nginx', category: 'Web Server', confidence: 'high' });
  if (server.includes('apache')) techs.push({ name: 'Apache HTTP Server', category: 'Web Server', confidence: 'high' });
  if (server.includes('caddy')) techs.push({ name: 'Caddy Server', category: 'Web Server', confidence: 'high' });
  if (server.includes('iis') || server.includes('microsoft-iis')) techs.push({ name: 'Microsoft IIS', category: 'Web Server', confidence: 'high' });
  if (server.includes('litespeed')) techs.push({ name: 'LiteSpeed', category: 'Web Server', confidence: 'high' });

  // CDNs / Reverse Proxies
  if (server.includes('cloudflare') || headers['cf-ray']) techs.push({ name: 'Cloudflare', category: 'CDN / WAF', confidence: 'high' });
  if (via.includes('cloudfront') || headers['x-amz-cf-id']) techs.push({ name: 'Amazon CloudFront', category: 'CDN / WAF', confidence: 'high' });
  if (server.includes('akamai') || headers['x-akamai-transformed']) techs.push({ name: 'Akamai', category: 'CDN / WAF', confidence: 'high' });
  if (via.includes('fastly') || headers['x-fastly-request-id']) techs.push({ name: 'Fastly', category: 'CDN / WAF', confidence: 'high' });

  // Backend Frameworks & Runtimes
  if (xPowered.includes('express')) techs.push({ name: 'Express.js', category: 'Backend', confidence: 'high' });
  if (xPowered.includes('php') || lowerHtml.includes('.php')) techs.push({ name: 'PHP', category: 'Backend', confidence: 'high' });
  if (xPowered.includes('asp.net') || headers['x-aspnet-version']) techs.push({ name: 'ASP.NET', category: 'Backend', confidence: 'high' });
  if (headers['x-generator']?.toLowerCase().includes('drupal')) techs.push({ name: 'Drupal CMS', category: 'CMS', confidence: 'high' });

  // Frontend & UI
  if (lowerHtml.includes('react') || lowerHtml.includes('_next') || lowerHtml.includes('__next_data__')) {
    techs.push({ name: 'React / Next.js', category: 'Frontend', confidence: 'high' });
  }
  if (lowerHtml.includes('vue') || lowerHtml.includes('__nuxt')) {
    techs.push({ name: 'Vue / Nuxt.js', category: 'Frontend', confidence: 'high' });
  }
  if (lowerHtml.includes('wp-content') || lowerHtml.includes('wp-includes')) {
    techs.push({ name: 'WordPress', category: 'CMS', confidence: 'high' });
  }
  if (lowerHtml.includes('tailwind') || lowerHtml.includes('tailwindcss')) {
    techs.push({ name: 'Tailwind CSS', category: 'Frontend', confidence: 'medium' });
  }
  if (lowerHtml.includes('bootstrap') || lowerHtml.includes('bootstrap.min.css')) {
    techs.push({ name: 'Bootstrap', category: 'Frontend', confidence: 'medium' });
  }
  if (lowerHtml.includes('jquery') || lowerHtml.includes('jquery.min.js')) {
    techs.push({ name: 'jQuery', category: 'Frontend', confidence: 'medium' });
  }

  return techs;
}
