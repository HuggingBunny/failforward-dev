# failforward.dev — Project Context

## What This Is
Chad's developer portfolio and personal brand site at **failforward.dev**.
Purpose: attract senior security engineering roles and consulting contracts.
Positioning: Security Automation Engineer + AI risk governance.

## Repo & Deploy
- **Repo:** `github.com/HuggingBunny/failforward-dev`
- **Local:** `~/GitHub/failforward-dev/`
- **Stack:** Astro 5, static export, no client framework
- **Host:** GitHub Pages, built by GitHub Actions
- **Domain:** failforward.dev at Porkbun
- **Admin:** Sveltia CMS at /admin (git-based, not yet signed in)

## Safety Guardrail (DO NOT WEAKEN)
`src/lib/vault.ts` — only publishes markdown with `publish: true` (literal boolean).
`scripts/test-guardrail.mjs` runs in CI. Fail-closed. This is both safety and a talking point.

## Critical Design Rules
- **No em dashes anywhere.** Use commas, colons, periods, semicolons. "·" for title separators.
- Ice blue palette: cold navy-black, #6fb3d8 dark / #1d5a80 light accent
- Light + dark themes, each tuned separately
- JetBrains Mono for tags/badges/buttons; Inter for body
- No bracketed section numbers in UI (e.g. [05])
- Micro-interactions at 150ms, prefers-reduced-motion guard
- Honest status labels. Drafts say draft.

## Routes
| Path | Content |
|------|---------|
| `/` | Home: hero, AI Warning Labels, recent incidents |
| `/incidents/` | Post-mortem gallery with category filters |
| `/incidents/<slug>/` | Individual post-mortem (from content/incidents/*.md) |
| `/projects/` | Lab index with status badges |
| `/projects/shadow-ai-playbook/` | Shadow AI Governance Playbook v0.3 |
| `/writing/` | Two LinkedIn series |
| `/writing/<slug>/` | Individual post pages |
| `/hire` | Full-time + consult paths + mailto intake form |
| `/demos/api-governance.html` | API governance dashboard prototype |
| `/admin/` | Sveltia CMS |

## Content Sources
| Content | File | Edit via |
|---------|------|----------|
| Post-mortems | content/incidents/*.md | admin or markdown |
| Projects | src/data/projects.json | admin |
| Writing | src/data/writing.json | admin |
| AI Warning Labels | src/data/labels.json | admin |

## Known Gaps (Priority Order)
1. Four post-mortems are AI-invented — replace with real incidents before wide sharing
2. Admin OAuth worker not deployed — /admin can't sign in
3. Formspree endpoint not configured — intake uses mailto fallback
4. Series 02 posts 2-8 are UPCOMING cards (no bodies)
5. LinkedIn post hooks are AI summaries, not real published lines
6. OG image uses DejaVu instead of Inter/JetBrains Mono
7. Series 01 intro slug is auto-generated and ugly
8. Chad's Obsidian drafts still contain em dashes (vault not modified)

## Repo State (as of handoff)
- Build passes, 14 pages, guardrail test PASS, zero em dashes, no draft leakage
- Old placeholder files (index.html, oxide2.html, LICENSE) deleted but not committed
- New Astro source files are untracked — first commit + push pending
- Needs: GitHub token for push, DNS records applied, HTTPS enforced
