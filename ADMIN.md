# failforward.dev — Admin Guide (`/admin`)

How the admin works, how to use it day-to-day, and how to modify the admin itself. Setup (OAuth worker) is in `MAINTENANCE.md` §7c — this doc assumes that's done.

---

## 1. How it works (mental model)

There is no admin server and no database. The admin is **two static files** shipped with the site:

```
public/admin/index.html   ← loads the Sveltia CMS app in your browser
public/admin/config.yml   ← defines every section, field, and template
```

When you open `failforward.dev/admin` and sign in with GitHub:

1. The CMS reads `config.yml` to know what content exists and what forms to draw.
2. It fetches the current files **directly from the GitHub repo** (not from the site).
3. When you press Save, it **commits the change to `main`** on your behalf.
4. The commit triggers the GitHub Action → guardrail test → build → deploy.
5. ~2 minutes later the change is live.

So: the admin is a friendly Git client wearing a CMS costume. Every edit is a commit under your GitHub account; `git log` is your audit trail; reverting a bad edit is `git revert`, or just edit again.

```
you → /admin form → commit to GitHub → Action (guardrail + build) → live site
```

Two consequences worth internalizing:

- **The admin edits the repo, not the live site.** If a build fails (it won't for admin edits — dropdowns prevent invalid values), the site simply stays on the previous version.
- **The admin and local editing coexist.** You can edit files in Obsidian/your editor and push, or use `/admin`, interchangeably. Pull before local edits if you've used the admin recently, or you'll get merge conflicts.

---

## 2. Day-to-day use

### Signing in
`failforward.dev/admin` → "Sign in with GitHub". Works from any browser, any machine — including your phone. Only GitHub accounts with write access to `HuggingBunny/failforward-dev` get in; there are no separate CMS accounts.

### Adding an incident (most common)
1. **Incidents & Post-Mortems → New entry.**
2. The form opens with the post-mortem template pre-filled: `## What happened`, `## Why it happened`, `## What was built so it can't recur`, lesson quote.
3. Fill in title, date, category, severity, one-sentence summary, tags.
4. **Publish toggle is OFF by default.** Leave it off to save a private draft to the repo; flip it on when it should go live.
5. Save. Check the Actions tab on GitHub if you want to watch the deploy.

### Editing projects / writing / labels
These live under **Site Sections**:
- **Projects page** — the card list. Reorder with drag handles; each card is link, status badge, title, summary, stack line.
- **Writing page** — both LinkedIn series. Flip a post's "Published on LinkedIn?" toggle when one goes live; change series status UPCOMING → LIVE when a series launches.
- **AI Warning Labels** — two lists: hazard labels (the pictogram definitions) and product label sets (the example products in the showcase). When adding a label set, its `labels` list must reference existing hazard-label IDs exactly.

### Unpublishing / deleting
- Incident: open it, flip Publish off, save. It vanishes from the site but the file stays in the repo (private).
- Full delete: the Delete button in the entry, or delete the file in the repo. Remember the git history still holds old versions — never put secrets in content, even drafts.

### If you edited locally at the same time
The admin commits to `main` directly. If your local clone is behind, `git pull` before pushing. Conflicts are ordinary git conflicts in markdown/JSON — resolve, commit, push.

---

## 3. Managing the admin itself

Everything below happens in `public/admin/config.yml`. Edit it like any file (locally or on GitHub), push, hard-refresh `/admin`.

### Anatomy of config.yml

```yaml
backend:            # where commits go (repo, branch, auth worker URL)
collections:        # the sections you see in the sidebar
  - name: incidents #   folder collection → one .md file per entry
    folder: content/incidents
    fields: [...]   #   the form = these fields, in order
  - name: site-data #   file collection → forms bound to specific files
    files:
      - file: src/data/projects.json
        fields: [...]
```

Two collection types in use:
- **Folder collection** (incidents): every entry is a new markdown file. Use for content that grows — more posts, more incidents.
- **File collection** (projects/writing/labels): the form edits one existing JSON file. Use for page data with fixed structure.

### Common changes

**Add a field to a section** — add one line to that collection's `fields`:
```yaml
- { name: impact, label: 'Business impact', widget: text, required: false }
```
For incidents, also add it to the schema in `src/lib/vault.ts` if the site should render it — otherwise it's stored in frontmatter but ignored (harmless).

**Change the incident template** — edit the `default:` block under the `body` field. That text is exactly what a new entry starts with.

**Add a dropdown option** (new category, new engagement type, new label domain) — add it to the `options:` list in config.yml **and** to the matching enum in `src/lib/vault.ts` (for incidents) — the build validates against the code, not the CMS, so the two lists must agree. Categories also feed the incident page filters automatically.

**Add a whole new section** (e.g. "Talks", "Certifications"):
1. Decide: growing content → folder collection with a new `content/<name>/` dir; page data → JSON file in `src/data/` + file collection.
2. Add the collection to config.yml with its fields.
3. Build the page/component that renders it (or ask Claude — this is a 10-minute job).

**Widget cheat sheet:** `string` (one line) · `text` (multi-line) · `markdown` (rich editor) · `boolean` (toggle) · `select` + `options` (dropdown) · `number` · `datetime` · `list` (repeatable items) · `object` (grouped sub-fields).

### Testing config changes safely
`config.yml` mistakes can't break the site — worst case `/admin` shows a config error and you fix the YAML. The site build doesn't read config.yml at all.

---

## 4. Security management

- **Access control = repo access.** To revoke access (lost laptop, etc.): GitHub → Settings → Applications → revoke the OAuth app's authorization, and/or rotate the OAuth app secret in the Cloudflare Worker.
- **Audit:** every admin edit is a commit authored by the GitHub account that made it. `git log --oneline content/ src/data/` shows the full history.
- **The worker stores nothing** — it only relays the OAuth handshake. The CMS token lives in your browser session.
- **Drafts are in the repo.** `publish: false` keeps content off the site, but the repo itself is where it lives — check whether the repo is public before drafting anything sensitive. If the repo is public, treat *all* admin content as public.
- Periodic: confirm you're the only collaborator on the repo, and that the OAuth app's callback URL still points at your worker.

---

## 5. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `/admin` loads but sign-in fails | Worker down, wrong `base_url`, or OAuth secret rotated | Check the worker URL in config.yml matches the deployed worker; check its env vars. |
| "Config error" screen | YAML typo in config.yml | The error names the line. Fix, push, refresh. |
| Saved but site didn't change | Deploy still running, or entry has Publish off | Check repo Actions tab; check the toggle. |
| Edit conflicts with local work | Admin committed while local clone was behind | `git pull`, resolve, push. |
| A label set renders without pictograms | `labels` list references a non-existent hazard-label ID | IDs must match the hazard label `id` fields exactly. |

---

*Related docs: `MAINTENANCE.md` (site upkeep, §7c admin setup) · `DEPLOY.md` (hosting + DNS) · `README.md` (overview).*
