/**
 * Guardrail regression test — run in CI before every deploy.
 * Verifies the publish filter fails closed for every hostile input shape.
 * Exit 1 on any failure.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'guardrail-'));

const fixtures = {
  'publish-true.md': `---\npublish: true\ntitle: OK\ndate: 2026-01-01\ncategory: security\nseverity: lesson\nsummary: should publish\n---\nbody`,
  'publish-false.md': `---\npublish: false\ntitle: NO\ndate: 2026-01-01\ncategory: security\nseverity: lesson\nsummary: x\n---\nSECRET-false`,
  'publish-string.md': `---\npublish: "true"\ntitle: NO\ndate: 2026-01-01\ncategory: security\nseverity: lesson\nsummary: x\n---\nSECRET-string`,
  'publish-missing.md': `---\ntitle: NO\ndate: 2026-01-01\ncategory: security\nseverity: lesson\nsummary: x\n---\nSECRET-missing`,
  'no-frontmatter.md': `just a note\nSECRET-nofm`,
  'malformed-yaml.md': `---\npublish: true\n  bad: [unclosed\n---\nSECRET-malformed`,
};

for (const [name, content] of Object.entries(fixtures)) {
  fs.writeFileSync(path.join(tmp, name), content);
}

// Run the loader against the fixture vault via a tiny harness.
const vaultModule = path.resolve('./src/lib/vault.ts');
const harness = `
import { loadIncidents } from '${vaultModule}';
const out = loadIncidents();
console.log('RESULT:' + JSON.stringify(out.map(i => i.slug)));
`;
fs.writeFileSync(path.join(tmp, 'harness.mts'), harness);

let stdout;
try {
  stdout = execSync(`npx tsx ${path.join(tmp, 'harness.mts')}`, {
    env: { ...process.env, VAULT_PATH: tmp },
    encoding: 'utf-8',
    cwd: process.cwd(),
  });
} catch (e) {
  // tsx may not be installed; fall back to astro's node loader is overkill —
  // instruct instead.
  console.error('Harness failed to run. Install tsx: npm i -D tsx');
  console.error(String(e.stdout ?? e));
  process.exit(1);
}

const published = JSON.parse(stdout.match(/RESULT:(.*)/)[1]);
const pass = published.length === 1 && published[0] === 'publish-true';

console.log(pass ? 'GUARDRAIL PASS' : `GUARDRAIL FAIL — published: ${published}`);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(pass ? 0 : 1);
