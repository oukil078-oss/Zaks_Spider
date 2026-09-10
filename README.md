# 🕷️ ZAK'S SPIDER — Cyber Recon, Pentest Arsenal & Neural Web

> **Autonomous Cyber Reconnaissance Spider, Weaponized Pentest Command Matrix & Interactive AI Second Brain Knowledge Mesh.**
> Designed for **100% out-of-the-box Vercel deployment** with zero configuration required.

---

## 🕸️ System Architecture & Features

### 1. ⚔️ Weaponized Pentest Command Matrix
- **60+ Comprehensive Payloads:** eJPTv2 & OSCP curated commands covering Recon & Network Scanning, Web Exploitation, Linux Privilege Escalation, Windows & Active Directory, Password Cracking, Network Pivoting, and Metasploit C2.
- **Real-Time Attack Parameter Injection:** Dynamically substitute `<TARGET_IP>`, `<PORT>`, `<WORDLIST>`, `<USERNAME>`, and `<ATTACKER_IP>` across the entire arsenal in real-time.
- **Option & Flag Explanations:** Deep breakdown of every CLI flag, timing profile, and expected terminal output.
- **Custom Payload Creator:** Save and persist custom commands into the database with one click.
- **Weave into Second Brain:** Convert any command into an indexed knowledge note with one click.

### 2. 🕷️ Arachnid Web Crawler & OSINT Spider
- **Multi-Vector Perimeter Reconnaissance:** Native Node.js scanning with DNS lookup, SSL certificate extraction, and crt.sh certificate transparency logs.
- **Subdomain Mesh:** Automatically enumerates subdomains with IP resolution and export options.
- **Email Harvester:** Scrapes personnel emails with automated Cloudflare email protection de-obfuscation.
- **Path & Robots Weaver:** Discovers sensitive endpoints (`.git`, `.env`, `/admin`, `/backup`) and parses `robots.txt` disallows.
- **Security Headers & SSL Audit:** Computes defensive security grades (A+ to F) evaluating HSTS, CSP, X-Frame-Options, and MIME protections.
- **Technology Stack Fingerprinter:** Identifies web servers, frontend frameworks, backend runtimes, and CDN/WAFs.
- **AI Threat Intelligence Briefing:** Synthesizes attack vectors and mitigation guidance.

### 3. 🧠 Neural Web (AI Second Brain)
- **The Neural Web Knowledge Graph:** Interactive 2D/3D HTML5 spiderweb canvas visualizer where targets, commands, notes, and CVEs form nodes connected by glowing silk threads with traveling electrical impulses.
- **Vault Studio:** Obsidian-compatible Markdown editor and viewer with frontmatter, tags, and `[[wikilinks]]`.
- **Widow-AI Assistant:** Embedded cybersecurity conversational intelligence directly linked to your Second Brain and reconnaissance data.

### 4. 🛰️ Global GEOINT & Sovereign 3D Viewshed Cockpit
- **Photorealistic 3D Earth Engine (CesiumJS):** High-resolution satellite photography (Esri World Imagery), OpenStreetMap 3D buildings, and Google Photorealistic 3D Tiles.
- **6,950+ Live Global CCTV Cameras:** Verified public municipality streams with calculated 3D viewshed coverage frustum pyramids, azimuth yaw/pitch, and blind-spot detection.
- **Real-Time Cockpit Ride-Along HUD:** Transparent avionics HUD with artificial horizon, pitch ladder ($\pm 20^\circ$), waterline boresight, dynamic flight path vector bird, and 40 NM TCAS radar sweep.
- **Multi-Perspective Angles:** Instantly switch between Pilot 1st-Person Cockpit, 3rd-Person Chase Cam, and Nadir Downward Reconnaissance.
- **Cyber-Physical IP Geolocation Gateway:** Enter any IPv4/IPv6 address to automatically geolocate coordinates, identify ISP/ASN, calculate distance to nearest physical optical sensor, and render correlation intercept vectors.
- **Boundary & Sector Highlights:** Polygon perimeters for all 58 Algerian Wilayas and global Nominatim boundaries with automatic camera dive animations.
- **Orbital Satellites & Subsea Fiber:** Real-time TLE orbital propagation (ISS, ALSAT-2B, ALCOMSAT-1, Sentinel, Starlink) and strategic Mediterranean subsea fiber-optic cables.

### 5. 🎨 Spider & Webs Cyber Theme
- Deep Obsidian & Dark Web Void (`#06090e`, `#0d1522`)
- Electric Spider-Silk Cyan (`#00f0ff`) & Neon Venom Green (`#10b981`)
- Black Widow Crimson (`#ef4444`) & Arachnid Violet (`#a855f7`)
- Interactive background spiderweb particle canvas reacting to operator cursor movement.

---

## ⚡ Out-of-the-Box Vercel Database

Zaks_Spider uses an **Adaptive Multi-Tier Database Engine**:
1. **Tier 1 (Instant Zero-Config):** Automatically synchronizes with browser `localStorage` and warm serverless memory. Works 100% out of the box with zero external database setup!
2. **Tier 2 (Vercel KV / Upstash Redis):** If `KV_REST_API_URL` and `KV_REST_API_TOKEN` are provided in Vercel environment variables, it automatically persists all notes and commands to KV storage.
3. **Tier 3 (Vercel Postgres / Neon):** Seamlessly hooks into `POSTGRES_URL` when linked.

---

## 🚀 Quickstart & Local Development

```bash
# 1. Navigate to project
cd c:\Users\Zakar\Documents\Web_Dev\Zaks_Spider

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:3000` to interact with Zaks_Spider.

---

## ☁️ Deploying to Vercel

Deploy instantly using your Vercel Personal Access Token:

```bash
# Deploy to preview
npx vercel --token <YOUR_VERCEL_TOKEN>

# Deploy to production
npx vercel --prod --token <YOUR_VERCEL_TOKEN>
```

Or connect the repository on [vercel.com](https://vercel.com):
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`

---

## 📜 License & Ethical Notice
Built for authorized security research, educational lab penetration testing (eJPT/OSCP), and proactive threat intelligence.
