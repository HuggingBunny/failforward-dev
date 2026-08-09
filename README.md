# failforward.dev

Developer portfolio: engineering post-mortems, automated systems, AI risk governance. Astro static site fed by an Obsidian vault.

## Stack

Astro 5 (static export) · zero frameworks client-side · gray-matter + zod ingestion · GitHub Pages (Actions) · Porkbun DNS.

## Layout

```
├── astro.config.mjs
├── content/incidents/        # publishable notes (Obsidian-compatible md)
├── scripts/
│   ├── sync-vault.mjs        # copy publish:true notes from a real vault
│   └── test-guardrail.mjs    # CI test: publish filter fails closed
└── src/
    ├── components/
    │   ├── LabelShowcase.astro    # AI Warning Labels interactive gallery
    │   ├── HireCTA.astro          # contact modal
    │   └── TelemetryFooter.astro  # build time, commit SHA, posture
    ├── data/labels.ts        # label system dataset (GHS-derived)
    ├── layouts/Base.astro
    ├── lib/
    │   ├── vault.ts          # Obsidian ingestion engine + publish guardrail
    │   └── telemetry.ts
    ├── pages/
    │   ├── index.astro
    │   └── incidents/        # gallery + [slug] detail pages
    └── styles/global.css     # dark-mode-first theme
```

## Safety guardrail

Only notes whose YAML frontmatter contains the **literal boolean** `publish: true` are built. Missing key, `"true"` string, malformed YAML, no frontmatter → excluded, logged, fail-closed. Regression-tested by `npm run test:guardrail`.

## Commands

```bash
npm install
npm run dev              # localhost:4321
npm run build            # → dist/
npm run test:guardrail   # verify publish filter
VAULT_SOURCE="/path/to/vault" npm run sync   # pull publishable notes
```

See `DEPLOY.md` for GitHub Pages + Porkbun DNS setup.
