# failforward.dev — Complete Deployment Checklist

> **Your first time deploying a static site? This walks you through every click, every command, every thing you type.**
> Target: `https://failforward.dev` live on the public internet.
> Build time: ~30–60 minutes (mostly waiting for DNS to propagate).

---

## Checklist Index

- [ ] **Phase 1:** Prerequisites
- [ ] **Phase 2:** Project files ready
- [ ] **Phase 3:** Push to GitHub
- [ ] **Phase 4:** Turn on GitHub Pages
- [ ] **Phase 5:** Point your domain (Porkbun DNS)
- [ ] **Phase 6:** Lock in custom domain + HTTPS
- [ ] **Phase 7:** Verify it's all working
- [ ] **Phase 8:** (Optional) Admin CMS login
- [ ] **Phase 9:** Day-to-day publishing

---

## Phase 1: Prerequisites

### What you need before starting

| Thing | Why | How to check you have it |
|-------|-----|--------------------------|
| A **GitHub account** | Hosts the repo and builds the site | Go to https://github.com and sign in. If you don't have one, create one (free). |
| A **Porkbun account** | You bought `failforward.dev` there; DNS records live here | Go to https://porkbun.com and sign in. |
| **Node.js** on your machine | Needed to build the site locally and install dependencies | Open a terminal and run: `node --version` — you should see `v20.x.x` or higher. If Node isn't installed, download it from https://nodejs.org (get the LTS version) and run the installer. |
| **Git** on your machine | Needed to push code to GitHub | In terminal: `git --version` — you should see a version number. If not, install it: `sudo apt install git` (Linux) or download from https://git-scm.com. |
| A **terminal** open at the project directory | Where you'll run commands | `cd /home/chad/GitHub/failforward-dev` — this should be where the site files live. |

### What you DON'T need

- A server — GitHub Pages serves the files for free.
- A database — there is no database.
- An API key — nothing costs money beyond the domain registration.
- Docker, Kubernetes, or any cloud account beyond GitHub.

---

## Phase 2: Project files ready

The site files are at `/home/chad/GitHub/failforward-dev/`. This is a standard Astro 5 project.

- [ ] **Verify the project builds locally**

Open a terminal and run:

```bash
cd /home/chad/GitHub/failforward-dev
npm run test:guardrail
```

You should see **`GUARDRAIL PASS`** printed. If you see anything else, stop and read the error message before proceeding.

- [ ] **Build the site locally (sanity check)**

```bash
npm run build
```

This should finish in ~2 seconds and print `✓ Complete!`. It creates a `dist/` folder with all the final HTML files — you don't need to do anything with this folder; it's just proof the site can be built.

- [ ] **(Optional) Preview the built site**

```bash
npm run preview
```

Open your browser to `http://localhost:4321`. You'll see the site as it will appear in production. Press `Ctrl+C` in the terminal to stop the preview.

---

## Phase 3: Push to GitHub

This is the first time the real Astro project (not the placeholder index.html) goes to the GitHub repo.

> **What's happening:** You're telling your local computer "save these files as a version" (commit), then "upload them to GitHub" (push). GitHub Actions will then build and deploy them automatically.

- [ ] **Stage all the new files**

```bash
cd /home/chad/GitHub/failforward-dev
git add .
```

This tells Git "track all the files in this folder." No output is normal.

- [ ] **Commit them**

```bash
git commit -m "Initial site deploy: Astro 5 static site with AI Warning Labels, post-mortems, writing"
```

This creates a saved version with a message describing what it is.

- [ ] **Push to GitHub**

```bash
git push origin main
```

You'll be prompted for your **GitHub username** and **password** (or a personal access token — see note below).

> **GitHub password note:** GitHub no longer accepts your account password in the terminal. You need a **personal access token (PAT)** instead. If you don't have one:
> 1. Go to https://github.com/settings/tokens
> 2. Click **"Generate new token (classic)"**
> 3. Give it a name like "failforward-deploy"
> 4. Under **scopes**, tick **`repo`** (full control of private repos — your repo is public, but this scope covers it)
> 5. Scroll down and click **"Generate token"**
> 6. Copy the token (starts with `ghp_...`) and paste it when the terminal asks for your password
> 7. **Save this token somewhere safe** — you'll need it every time you push

When the push finishes, you'll see output like:
```
Enumerating objects: ..., done.
Writing objects: ... (xx/xx), done.
Total xx (delta xx), reused xx (delta xx)
To https://github.com/HuggingBunny/failforward-dev.git
   oldhash..newhash  main -> main
```

- [ ] **Go check that the push triggered a build**

In your browser:
1. Go to https://github.com/HuggingBunny/failforward-dev
2. Click the **Actions** tab (near the top, between "Pull requests" and "Projects")
3. You should see a workflow called **"Deploy to GitHub Pages"** running (yellow dot) or finished (green check)
4. Click on it to watch the progress — it takes ~1-2 minutes

The workflow does:
1. Checkout the code
2. Install Node.js
3. Run `npm install`
4. Run `npm run test:guardrail` (safety check — must pass)
5. Run `npm run build`
6. Upload the built `dist/` folder to GitHub Pages

If any step fails, the **Actions** tab will show a red X and you can click into it to see what went wrong.

---

## Phase 4: Turn on GitHub Pages

The code is on GitHub, but GitHub doesn't know yet that it should serve it as a website. You need to flip one setting.

- [ ] **Open repo Settings**

1. Go to https://github.com/HuggingBunny/failforward-dev
2. Click the **Settings** tab (far right, near the top)

- [ ] **Find Pages settings**

1. In the left sidebar, scroll down and click **Pages** (under "Code and automation")

- [ ] **Set the build source to GitHub Actions**

1. Under **"Build and deployment"**, find **"Source"**
2. Click the dropdown — it probably says **"Deploy from a branch"**
3. Change it to **"GitHub Actions"**

> **Why GitHub Actions?** There are two ways to deploy to GitHub Pages: (a) the simple way where GitHub just takes whatever files are in a specific branch, or (b) the Actions way where a workflow script controls the exact build process. Our site uses Astro, which needs to be compiled (you can't just serve the raw source files), so we need the Actions route. The workflow file is already written at `.github/workflows/deploy.yml`.

4. That's it — no need to select a branch or folder. The setting saves automatically.

- [ ] **Verify the build completes**

Go back to the **Actions** tab. You should see a new run (or the previous one finishing). Wait for the green checkmark.

> **If there's a red X**, click on the failed run, scroll through the logs, and find the error. Common issues:
> - The guardrail test found a problem with a content file
> - A file has invalid YAML frontmatter
> - Node.js version incompatibility
> 
> Fix the issue locally, then `git add .`, `git commit -m "fix: ..."`, `git push` again.

- [ ] **Find your temporary URL**

Once the Actions run is green:
1. Go back to **Settings → Pages**
2. At the top, you'll see: **"Your site is live at https://huggingbunny.github.io/failforward-dev/"**
3. Click that link — the site should load (no custom domain yet, just the GitHub URL)

---

## Phase 5: Point your domain at GitHub (Porkbun DNS)

Right now the site is at a long GitHub URL. You want it at `failforward.dev`. For that, you tell Porkbun "when someone types failforward.dev, send them to GitHub's servers."

> **What's happening:** When you type a domain in your browser, your computer asks the global DNS system "where does this domain point?" DNS records are the answers. You're adding records that say "failforward.dev → GitHub's IP addresses."

- [ ] **Log into Porkbun**

1. Go to https://porkbun.com
2. Click **"Login"** (top right)
3. Enter your credentials

- [ ] **Find your domain's DNS settings**

1. After logging in, click **"Domain Management"** in the top menu
2. Find `failforward.dev` in the list and click it
3. Click the **"DNS / Edit records"** button (or tab)

You'll see a list of existing DNS records. There might be some default parking records — that's fine, you'll replace them.

- [ ] **Delete any existing parking A records**

Look for any existing **A records** with `@` or blank host. These are placeholder records from Porkbun. Click the red **Delete** button (trash icon) next to each one.

> **What's an A record?** It maps a domain name to an IP address. GitHub Pages has four specific IP addresses you need to point to. The old ones are Porkbun's parking servers.

- [ ] **Add four A records for the apex domain**

Click **"Add a Record"** (or the green + button). For each one:

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| A | leave blank | `185.199.108.153` | Default (600) |
| A | leave blank | `185.199.109.153` | Default (600) |
| A | leave blank | `185.199.110.153` | Default (600) |
| A | leave blank | `185.199.111.153` | Default (600) |

> **"Apex domain"** = the bare domain without "www" — just `failforward.dev`. The blank Host means "this applies to the root domain itself."
> 
> **Why four IPs?** GitHub provides four IP addresses for redundancy and load balancing. If one goes down, traffic routes to the others. You add all four.
> 
> **TTL:** "Time To Live" — how long other DNS servers should cache this information before checking again. 600 seconds (10 minutes) is fine. You can leave it at the default.

- [ ] **(Optional) Add AAAA records for IPv6**

If you want the site to work over IPv6 (the newer internet protocol), add these four:

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| AAAA | leave blank | `2606:50c0:8000::153` | Default |
| AAAA | leave blank | `2606:50c0:8001::153` | Default |
| AAAA | leave blank | `2606:50c0:8002::153` | Default |
| AAAA | leave blank | `2606:50c0:8003::153` | Default |

These are optional — the site will work fine with just the A records. IPv6 is not required.

- [ ] **Add a CNAME record for www**

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| CNAME | `www` | `huggingbunny.github.io` | Default |

> **What's a CNAME record?** It maps a subdomain to another domain name. `www.failforward.dev` is a subdomain. This record says "when someone visits www.failforward.dev, send them to huggingbunny.github.io" (which is your GitHub Pages URL). GitHub then knows to serve your site.

- [ ] **Double-check your records**

When you're done, your DNS records should look like this (with possibly a few Porkbun defaults like NS records and SOA — leave those alone):

| Type | Host | Answer |
|------|------|--------|
| A | (blank) | 185.199.108.153 |
| A | (blank) | 185.199.109.153 |
| A | (blank) | 185.199.110.153 |
| A | (blank) | 185.199.111.153 |
| CNAME | www | huggingbunny.github.io |

Scroll to the bottom and click **"Save Changes"** if there's a save button. Porkbun usually saves automatically.

- [ ] **Wait for DNS to propagate**

DNS changes aren't instant. They spread across the internet gradually. This usually takes:
- A few minutes to an hour in most cases
- Up to 24-48 hours in rare cases (usually with older registrars, not Porkbun)

You can check if DNS has propagated by going to a site like https://dnschecker.org and typing `failforward.dev` — it will show you whether the A records point to GitHub's IPs from various locations around the world.

**While you wait, move to Phase 6.** You can complete the next step even before DNS fully propagates.

---

## Phase 6: Lock in custom domain + HTTPS

Now you tell GitHub "this site should respond to failforward.dev." DNS just needs to be heading in the right direction — it doesn't have to be fully propagated yet.

- [ ] **Set custom domain in GitHub Pages**

1. Go back to https://github.com/HuggingBunny/failforward-dev → **Settings → Pages**
2. Under **"Custom domain"**, type `failforward.dev`
3. Click **"Save"**

> **What this does:** It tells GitHub "when someone visits failforward.dev, serve this repo's content." It also automatically creates a CNAME file in your repo (notice `public/CNAME` already exists — it says `failforward.dev`, which is a manual way to do the same thing). Having both is fine.

- [ ] **Wait for the DNS check**

After saving, GitHub will try to verify that DNS is pointing to them. Next to the custom domain field, you'll see:
- **"DNS check in progress"** (orange/yellow) — waiting
- **"DNS check successful"** (green checkmark) — DNS has propagated enough
- **"DNS check failed — domain not configured"** (red X) — DNS hasn't propagated yet

> **If it fails:** This is normal! DNS can take time. Wait 15-30 minutes and try again. You can also just proceed to the next step and come back to check later. The Enforce HTTPS toggle won't work until the DNS check passes, but that's fine — you can enable it later.

- [ ] **Enable Enforce HTTPS**

Once the DNS check passes (green check), a checkbox appears: **"Enforce HTTPS"**. Tick it.

> **What this does:** Forces all visitors to use `https://` instead of `http://`. The connection between the visitor's browser and GitHub's CDN is encrypted. GitHub automatically issues a free TLS/SSL certificate from Let's Encrypt for `failforward.dev`. This can take a few minutes to an hour to issue — the checkbox might be grayed out saying "Certificate not yet issued." Check back after a while.

---

## Phase 7: Verify everything

- [ ] **Visit https://failforward.dev in your browser**

If DNS has propagated and the certificate is issued, you should see the site.

- [ ] **Visit https://www.failforward.dev**

This should redirect to `failforward.dev` (GitHub handles this automatically when you set the custom domain).

- [ ] **Visit https://huggingbunny.github.io/failforward-dev/**

This should redirect to `failforward.dev`. GitHub automatically redirects the old GitHub URL to your custom domain.

- [ ] **Check the footer**

Scroll to the bottom of any page. The footer should show a recent build timestamp and commit hash — proof the deployment is working.

- [ ] **Test a few pages**

| Page | Expected | How to test |
|------|----------|-------------|
| `https://failforward.dev/` | Home page with hero, AI Warning Labels, recent incidents | Just load it |
| `https://failforward.dev/incidents/` | Gallery of post-mortems with category filters | Click "Incidents" in the nav |
| `https://failforward.dev/projects/` | Project cards with status badges | Click "Projects" |
| `https://failforward.dev/writing/` | LinkedIn series listing | Click "Writing" |
| `https://failforward.dev/hire` | Consult intake form | Click "Hire" |
| `https://failforward.dev/demos/api-governance.html` | Interactive API dashboard | Direct URL |

- [ ] **Test theme toggle**

In the top navigation bar, click the sun/moon icon. The site should switch between dark and light mode. The preference should persist if you reload the page.

---

## Phase 8: (Optional) Admin CMS — Login setup

The site has a browser-based editor at `https://failforward.dev/admin`. It loads now, but **you can't sign in yet** because it needs a Cloudflare Worker to handle the OAuth handshake (GitHub Pages can't hold secrets). If you don't use the admin, you can skip this — you can always edit files on your computer and push.

To set up the admin login:

- [ ] **Create a GitHub OAuth App**

1. Go to https://github.com/settings/developers
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"**
4. Fill in:
   - **Application name:** `failforward-dev CMS`
   - **Homepage URL:** `https://failforward.dev`
   - **Authorization callback URL:** You'll get this in the next step — leave it blank for now, or put a placeholder
5. Click **"Register application"**
6. You'll get a **Client ID** and a **Client Secret**. Copy both (save them somewhere — the secret is only shown once).

- [ ] **Deploy the Sveltia CMS Auth Worker**

1. Go to https://github.com/sveltia/sveltia-cms-auth
2. Click the **"Deploy to Cloudflare Workers"** button — it's a one-click deploy
3. You'll need a **Cloudflare account** (free — sign up at https://cloudflare.com if you don't have one)
4. During setup, set these environment variables:
   - `GITHUB_CLIENT_ID` = the Client ID from step above
   - `GITHUB_CLIENT_SECRET` = the Client Secret from step above
   - `ALLOWED_DOMAINS` = `failforward.dev`
5. After deploying, the worker will have a URL like `https://sveltia-cms-auth-xxxxx.workers.dev`
6. Go back to your GitHub OAuth App settings and set the **Authorization callback URL** to `https://sveltia-cms-auth-xxxxx.workers.dev/callback`

- [ ] **Update the CMS config**

1. Open `/home/chad/GitHub/failforward-dev/public/admin/config.yml`
2. Find the line that references `base_url:` — it's probably commented out with a `#`
3. Uncomment it and set: `base_url: https://sveltia-cms-auth-xxxxx.workers.dev`
4. Save the file
5. Commit and push:
   ```bash
   cd /home/chad/GitHub/failforward-dev
   git add .
   git commit -m "Enable CMS auth worker"
   git push
   ```

- [ ] **Test the admin login**

1. Go to `https://failforward.dev/admin`
2. Click **"Sign in with GitHub"**
3. Authorize the app
4. You should now see the CMS dashboard — four sections: Incidents, Projects, Writing, AI Warning Labels

---

## Phase 9: Day-to-day publishing

Once everything is deployed, this is your normal workflow.

### To add a new post-mortem (most common action)

```bash
cd /home/chad/GitHub/failforward-dev
# Create a new file in content/incidents/
# Start with the frontmatter template below
```

Required frontmatter:
```yaml
---
publish: true
title: "Your Title"
date: 2026-07-25
category: security        # one of: infrastructure, security, automation, process, ai-systems, career
severity: sev2            # one of: sev1, sev2, sev3, lesson
summary: "One-sentence hook."
tags: [tag1, tag2]
---
```

```bash
npm run dev              # preview at http://localhost:4321
# Check it looks right, then:
git add .
git commit -m "Add incident: Your Title"
git push
```

### To edit anything else

Edit the file in `/home/chad/GitHub/failforward-dev/` (see MAINTENANCE.md for which file controls what), then commit and push.

### After every push

1. Wait ~1-2 minutes
2. Go to https://github.com/HuggingBunny/failforward-dev/actions and check the workflow passes
3. Check https://failforward.dev to verify

---

## Quick Reference

| Task | Command / Action |
|------|-----------------|
| Live preview | `npm run dev` (in project directory) |
| Test safety filter | `npm run test:guardrail` |
| Build locally | `npm run build` |
| Publish changes | `git add .` → `git commit -m "message"` → `git push` |
| Check deploy status | https://github.com/HuggingBunny/failforward-dev/actions |
| Live site | https://failforward.dev |
| Repo | https://github.com/HuggingBunny/failforward-dev |
| DNS settings | Porkbun → Domain Management → failforward.dev → DNS |
| Pages settings | GitHub → Repo → Settings → Pages |

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| `git push` asks for password but won't accept it | GitHub requires a personal access token, not your password | Generate a PAT at https://github.com/settings/tokens |
| Actions run shows red X | Guardrail test failed or build error | Click the failed run, read the logs, fix the issue locally, push again |
| Site loads at GitHub URL but not at failforward.dev | DNS hasn't propagated or custom domain not set | Wait, check DNS at dnschecker.org |
| `failforward.dev` loads but shows "There isn't a GitHub Pages site here" | Custom domain not properly configured | Check Settings → Pages → Custom domain field is filled |
| `https://failforward.dev` shows insecure (http:// works) | "Enforce HTTPS" not yet ticked, or certificate not issued | Wait for certificate (up to 1 hour), then tick Enforce HTTPS |
| `/admin` loads but can't sign in | OAuth worker not deployed | Complete Phase 8 steps |
| Post-mortem doesn't appear on site | `publish:` is not `true`, or invalid category/severity | Run `npm run build` and check the `[vault] EXCLUDED …` log line |
| `npm run dev` shows unstyled page | Opened the file directly (file://) instead of using the dev server | Use `http://localhost:4321` (the URL the dev server tells you) |
