/**
 * Optional local helper: copy publishable notes from a real Obsidian vault
 * into ./content/incidents so the repo (and CI) never needs vault access.
 *
 * Usage: VAULT_SOURCE="/path/to/vault/subfolder" npm run sync
 *
 * Applies the same fail-closed guardrail as the build: only notes with
 * literal `publish: true` are copied.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const src = process.env.VAULT_SOURCE;
const dest = path.resolve('./content/incidents');

if (!src) {
  console.error('Set VAULT_SOURCE to your Obsidian vault folder. Nothing copied.');
  process.exit(1);
}

let copied = 0;
let skipped = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.')) walk(full);
      continue;
    }
    if (!entry.name.endsWith('.md')) continue;
    try {
      const { data } = matter(fs.readFileSync(full, 'utf-8'));
      if (data?.publish === true) {
        fs.copyFileSync(full, path.join(dest, entry.name));
        copied++;
        console.log(`copied: ${entry.name}`);
      } else {
        skipped++;
      }
    } catch {
      skipped++;
    }
  }
}

walk(src);
console.log(`Done. ${copied} copied, ${skipped} skipped (no publish: true).`);
