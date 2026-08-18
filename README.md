# failforward.dev

Chad Longanecker: Security Automation Engineer, DLP, Attack Surface Management, and AI Risk Governance.

## Production Stack
- **Architecture**: Zero-dependency static build (Semantic HTML5, Vanilla CSS3, Vanilla JS ES6).
- **Backend / Intake**: Cloudflare Pages Function (`/functions/api/contact.js`) with honeypot bot mitigation and zero third-party trackers.
- **Hosting & CI**: GitHub Pages automated deployment via GitHub Actions.
- **DNS**: `failforward.dev` via Porkbun DNS.

## Local Preview & Development
```bash
# Python local static server
python3 -m http.server 8080

# Cloudflare Pages local function emulation
npx wrangler pages dev . --port 8788
```

## Documentation & Source of Truth
Vault documentation and master metrics live in Obsidian:
- Handoff & Architecture: `03 Career/failforward.dev/HANDOFF-summary.md`
- Master Telemetry & Experience: `03 Career/Resumes & CV/Master/Master/master-cv.md`
