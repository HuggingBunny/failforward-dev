# failforward.dev — Admin & Maintenance Manual

Everything needed to run this site after launch. Written for a future you (or anyone you hand it to) who hasn't looked at the code in months.

---

## 1. What this site is (30-second version)

A static site. There is no server, no database, no CMS, no login. Content is written as Markdown files, compiled into plain HTML by Astro, and served from a CDN (Cloudflare Pages). To change the site you edit files and push to Git; the CDN rebuilds automatically.

- **Framework:** Astro 5 (static export)
- **Host:** GitHub Pages (built by GitHub Actions)
- **Repo:** `github.com/HuggingBunny/failforward-dev`
- **Registrar + DNS:** Porkbun
- **Domain:** failforward.dev
- **Local requirement:** Node 20+ and npm

---

## 2. First-time setup on a new machine

Run once:

```bash
cd "06 Career/failforward.dev"     # or wherever the repo lives
npm install
```

That pulls dependencies into `node_modules/` (not committed to Git). Then:

```bash
npm run dev        # live preview at http://localhost:4321
```

Leave it running while you edit — it reloads on save. `Ctrl+C` to stop.

---

## 3. The commands you'll actually use

| Command | What it does |
|---|---|
| `npm run dev` | Local preview, auto-reloads. Your day-to-day. |
| `npm run build` | Compiles the site into `dist/`. Run before deploying if testing locally. |
| `npm run preview` | Serves the built `dist/` exactly as production would. |
| `npm run test:guardrail` | Verifies the publish-safety filter still works. Run before every deploy. |
| `npm run sync` | (Optional) Pulls `publish: true` notes from an external vault. See §6. |

Rule of thumb: if a page looks right in `npm run dev`, it will look right in production.

---

## 4. How content flows (the mental model)

```
Markdown file in content/incidents/
        │
        ▼
publish: true ?  ──no──▶  ignored, never built  (the guardrail)
        │yes
        ▼
Astro build  ──▶  static HTML in dist/  ──▶  Cloudflare CDN  ──▶  visitor
```

The single most important rule of this site: **a post-mortem only appears if its frontmatter says `publish: true`.** Everything else is invisible. This is deliberate — it means you can keep drafts and private notes in the same folder without risk.

---

## 5. Adding or editing a post-mortem (most common task)

1. Create a new file in `content/incidents/`, e.g. `my-new-incident.md`.
2. Start it with this frontmatter block (all fields required except `tags`):

```markdown
---
publish: true
title: "Your Incident Title"
date: 2026-07-22
category: security
severity: sev2
summary: "One-sentence hook shown on cards and previews."
tags: [dlp, automation]
---

## What happened
...your markdown here...
```

3. Fill in the body with normal Markdown (`## headings`, `- lists`, `> quotes`, code blocks).
4. Save. Check it in `npm run dev`.
5. Commit and push (see §8).

### Allowed field values

| Field | Allowed values |
|---|---|
| `publish` | `true` (anything else = hidden) |
| `category` | `infrastructure`, `security`, `automation`, `process`, `ai-systems`, `career` |
| `severity` | `sev1`, `sev2`, `sev3`, `lesson` |
| `date` | `YYYY-MM-DD` |

If you use a `category` or `severity` outside these lists, **the build drops the note and logs why** — it won't silently break the site. To add a new category, edit the allowed list in `src/lib/vault.ts` (the `IncidentFrontmatter` schema).

### To unpublish something
Change `publish: true` to `publish: false` (or delete the line). It vanishes on the next build. No other cleanup needed.

---

## 6. Pulling notes from your real Obsidian/Zettlr vault (optional)

If you'd rather write in your main vault than in `content/incidents/`:

```bash
VAULT_SOURCE="/home/chad/Zettlr_Vault/Career/postmortems" npm run sync
```

This copies only the `publish: true` notes into `content/incidents/`. It never touches anything without the flag. You still commit + push afterward.

---

## 7. Editing the other pages

| Page | File to edit |
|---|---|
| Home hero + intro | `src/components/pages/HomeBody.astro` |
| Hire / Consult | `src/components/pages/HireBody.astro` |
| Projects list | `src/components/pages/ProjectsBody.astro` (edit the `projects` array) |
| Writing / LinkedIn series | `src/components/pages/WritingBody.astro` (edit `series01` / `series02` arrays) |
| Incidents list heading | `src/components/pages/IncidentsBody.astro` |
| Shadow AI playbook | `src/pages/projects/shadow-ai-playbook.astro` |
| Nav links + theme toggle | `src/layouts/Base.astro` |
| Footer | `src/components/TelemetryFooter.astro` |
| Colors / fonts / theme | `src/styles/global.css` (`:root` = dark, `:root[data-theme='light']` = light) |

### AI Warning Labels showcase
The label data lives in `src/data/labels.ts`. To add a label, add an object to the `LABELS` array; to add a product example, add to `LABEL_SETS`. The UI in `src/components/LabelShowcase.astro` renders whatever is in those arrays — no layout editing needed.

### The API Governance Dashboard
It's a single self-contained file at `public/demos/api-governance.html`. Edit it directly if needed. It's a design prototype with fake data — nothing wired to a backend.

---

## 7b. The consult intake form (secure collection)

The form on `/hire` has two modes, controlled by one constant in
`src/components/pages/HireBody.astro`:

```js
const FORM_ENDPOINT = '';
```

**Mode 1 — mailto fallback (current, works with zero setup).**
With the constant empty, "send intake" composes a structured email in the
visitor's own mail client, addressed to you. Nothing is transmitted to or
stored by any third party — the data goes straight from their mailbox to
yours. Downside: friction (they must have a mail client configured), and you
lose submissions from people who bail at that step.

**Mode 2 — hosted endpoint (recommended once live).**
1. Create a free account at formspree.io (or any compatible form backend).
2. Create a form, copy its endpoint URL (`https://formspree.io/f/XXXXXXXX`).
3. Paste it into `FORM_ENDPOINT`, commit, push.
4. In Formspree settings: set the notification address, enable reCAPTCHA-free
   spam filtering, and **restrict allowed domains to `failforward.dev`** so
   others can't POST spam through your endpoint.

Submissions then go over HTTPS to Formspree, which emails them to you and
holds them (encrypted at rest) in its dashboard. GDPR note: that makes
Formspree a data processor for the sender's name/email — their EU/DPA terms
cover this, and the form's privacy note should be updated from "not stored"
to "processed by Formspree" if you enable it. Rotate the endpoint if it ever
starts receiving spam floods.

**Built-in protections (both modes):** required-field validation, length
caps on every field, and a hidden honeypot field that silently rejects bots.
There is still no database and no analytics on the site itself.

## 7c. Admin CMS (`/admin`)

The site has a browser-based admin at **`failforward.dev/admin`** (Sveltia CMS,
git-based). It edits the repo directly — every save is a commit, every commit
auto-deploys. No database; the publish guardrail still applies to everything.

### Sections and templates

| Admin section | What it edits | Template |
|---|---|---|
| Incidents & Post-Mortems | `content/incidents/*.md` | New entries open with the post-mortem skeleton (What happened / Why / What was built) and **`publish: false` by default** — nothing goes live until you flip the toggle. |
| Projects page | `src/data/projects.json` | Card form: tag, status badge, title, summary, stack line. |
| Writing page | `src/data/writing.json` | Series + posts forms, featured-post paragraphs, LIVE/UPCOMING status. |
| AI Warning Labels | `src/data/labels.json` | Hazard-label form (GHS shape, hazard class, statements) and product label-set form (transparency panel, certs). |

Dropdowns enforce the allowed values (category, severity, shapes, ratings), so
the admin can't produce frontmatter the build would reject.

### One-time auth setup

GitHub Pages can't hold OAuth secrets, so login goes through a tiny free
Cloudflare Worker:

1. GitHub → Settings → Developer settings → **OAuth Apps → New OAuth App**.
   Homepage: `https://failforward.dev`. Callback URL: you'll get it in step 2.
2. Deploy https://github.com/sveltia/sveltia-cms-auth to your Cloudflare
   account (one-click "Deploy to Cloudflare Workers" button in that repo).
   Set its `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` env vars from step 1,
   and set the OAuth App's callback URL to `https://<worker-url>/callback`.
   Set `ALLOWED_DOMAINS` to `failforward.dev`.
3. In `public/admin/config.yml`, uncomment `base_url:` and set it to the
   worker URL. Commit, push.
4. Open `failforward.dev/admin` → "Sign in with GitHub". Only accounts with
   **write access to the repo** can log in — that's you. There are no CMS
   users to manage; GitHub repo permissions are the access control.

Until you do this setup, `/admin` loads but can't sign in — the site itself
is unaffected.

**Full admin manual — how it works, daily use, modifying sections/templates,
security, troubleshooting — is in `ADMIN.md`.**

### Security properties

- Access = GitHub repo write access. Revoke by revoking repo access or the
  OAuth app. Audit trail = git history (every admin edit is a commit).
- The worker only proxies the OAuth handshake; it stores nothing.
- New incidents default to `publish: false` — fail-closed, same as the build.

## 8. Publishing changes (deploy)

```bash
git add .
git commit -m "Add incident: <name>"   # short description of what changed
git push
```

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which runs the guardrail test, builds, and deploys to GitHub Pages automatically (~1–2 min). No manual deploy step. Watch it in the repo's **Actions** tab; check the live site after it goes green.

The workflow runs `npm run test:guardrail` **before** building, so if the publish-safety filter ever breaks, the deploy **fails instead of leaking a draft**. See `DEPLOY.md` for the full GitHub Pages + Porkbun DNS setup.

---

## 9. Monthly / periodic checks (5 minutes)

- [ ] `npm run test:guardrail` passes (should print `GUARDRAIL PASS`).
- [ ] `npm install` occasionally, to pick up security patches in dependencies.
- [ ] Spot-check the live site loads and the theme toggle works.
- [ ] Confirm the footer shows a recent build timestamp and commit SHA (proves deploys are working).
- [ ] TLS auto-renews via GitHub Pages. Check the domain registration expiry at **Porkbun** once a year (turn on auto-renew there).

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| A post-mortem won't show up | Missing/false `publish`, or invalid `category`/`severity` | Run `npm run build` and read the `[vault] EXCLUDED …` log line — it tells you exactly why. |
| Build fails after editing frontmatter | YAML typo (bad indentation, missing quote) | Check the file named in the error; fix the frontmatter block. |
| Everything looks unstyled locally | Opened `dist/index.html` directly via `file://` | Use `npm run dev` or `npm run preview` instead — root-relative links need a server. |
| Deploy didn't update the live site | Push didn't reach the deploy branch | Check `git push` succeeded and Cloudflare is watching that branch. |
| Colors look wrong in one theme | Edited a variable in the wrong block | Dark values live in `:root`, light in `:root[data-theme='light']` in `global.css`. |
| `npm` command not found | Node not installed | Install Node 20+ (`node --version` to check). |

---

## 11. Safety rules (do not skip)

1. **Never remove the `publish: true` check** in `src/lib/vault.ts`. It is the only thing keeping private notes off the public internet.
2. **Keep the guardrail test in the deploy pipeline** (§8). It's cheap insurance.
3. **Assume anything you commit to `content/` could become public** — even a `publish: false` file lives in the Git history. Don't put real secrets, credentials, or genuinely sensitive personal data in this repo at all.
4. The site has no analytics, cookies, or trackers by design. Keep it that way unless you make a deliberate decision otherwise.

---

## 12. Where things are (map)

```
failforward.dev/
├── content/incidents/        ← your post-mortems (Markdown)
├── public/demos/             ← standalone HTML demos (API dashboard)
├── src/
│   ├── components/           ← reusable UI + page bodies
│   ├── data/labels.ts        ← AI Warning Labels dataset
│   ├── layouts/              ← page shell (nav, footer, theme)
│   ├── lib/vault.ts          ← ingestion engine + publish guardrail
│   ├── pages/                ← routes (each file = a URL)
│   └── styles/global.css     ← theme + all styling
├── scripts/                  ← sync + guardrail test
├── DEPLOY.md                 ← one-time Cloudflare setup
├── README.md                 ← project overview
└── MAINTENANCE.md            ← this file
```

That's the whole system. Edit Markdown, run `dev` to check, `git push` to publish.
