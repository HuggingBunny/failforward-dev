/**
 * Obsidian vault ingestion engine.
 *
 * SAFETY GUARDRAIL (non-negotiable):
 *   A note is published ONLY if its YAML frontmatter contains the literal
 *   boolean `publish: true`. Anything else, missing key, `publish: "true"`
 *   (string), `publish: yes`, malformed YAML, no frontmatter, is EXCLUDED.
 *   Fail closed, always.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const IncidentFrontmatter = z.object({
  publish: z.literal(true), // strict boolean true, the guardrail
  title: z.string().min(1),
  date: z.coerce.date(),
  category: z.enum([
    'infrastructure',
    'security',
    'automation',
    'process',
    'ai-systems',
    'career',
  ]),
  severity: z.enum(['sev1', 'sev2', 'sev3', 'lesson']).default('lesson'),
  summary: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export type Incident = {
  slug: string;
  html: string;
  sourcePath: string;
} & z.infer<typeof IncidentFrontmatter>;

// ---------------------------------------------------------------------------
// Vault reading
// ---------------------------------------------------------------------------

const VAULT_PATH = process.env.VAULT_PATH ?? path.resolve('./content/incidents');

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Never descend into Obsidian internals or hidden dirs
      if (entry.name.startsWith('.') || entry.name === 'node_modules') return [];
      return walk(full);
    }
    return entry.isFile() && entry.name.endsWith('.md') ? [full] : [];
  });
}

/** Convert Obsidian syntax to portable markdown. */
function normalizeObsidian(md: string): string {
  return (
    md
      // ![[embed]], strip embeds entirely (may reference unpublished notes)
      .replace(/!\[\[[^\]]+\]\]/g, '')
      // [[target|alias]] → alias (plain text; internal links must not leak)
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
      // [[target]] → target
      .replace(/\[\[([^\]]+)\]\]/g, '$1')
      // %%comments%%, Obsidian comments never ship
      .replace(/%%[\s\S]*?%%/g, '')
      // #tag lines used as Obsidian tags (leave markdown headings intact)
      .replace(/(^|\s)#[\w/-]+(?=\s|$)/gm, '$1')
  );
}

function slugify(filePath: string): string {
  return path
    .basename(filePath, '.md')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Load all publishable incidents from the vault.
 * Silently skips anything that fails the guardrail; logs a one-line audit
 * trail at build time so exclusions are visible in CI output.
 */
export function loadIncidents(): Incident[] {
  const files = walk(VAULT_PATH);
  const incidents: Incident[] = [];

  for (const file of files) {
    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(fs.readFileSync(file, 'utf-8'));
    } catch {
      console.log(`[vault] EXCLUDED (unparseable frontmatter): ${file}`);
      continue;
    }

    // Guardrail check BEFORE schema validation, so the audit log is explicit.
    if (parsed.data?.publish !== true) {
      console.log(`[vault] EXCLUDED (publish !== true): ${file}`);
      continue;
    }

    const result = IncidentFrontmatter.safeParse(parsed.data);
    if (!result.success) {
      console.log(
        `[vault] EXCLUDED (invalid frontmatter): ${file}, ${result.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ')}`
      );
      continue;
    }

    incidents.push({
      ...result.data,
      slug: slugify(file),
      html: marked.parse(normalizeObsidian(parsed.content), { async: false }),
      sourcePath: path.relative(VAULT_PATH, file),
    });
    console.log(`[vault] PUBLISHED: ${file}`);
  }

  // Newest first
  return incidents.sort((a, b) => b.date.getTime() - a.date.getTime());
}
