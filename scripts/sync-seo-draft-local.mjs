#!/usr/bin/env node
/**
 * Fallback: draft uit local-businesses.json (niet uit n8n Sheet-preview).
 * Na n8n Preview: gebruik fetch-seo-draft-from-n8n.mjs
 *
 *   node scripts/sync-seo-draft-local.mjs
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;

function run(script) {
  const r = spawnSync(node, [path.join(ROOT, 'scripts', script), '--draft'], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run('sync-index-seo.mjs');
run('sync-sitemap.mjs');

const base = 'http://localhost:5501';
console.log('\nOpen in test (Live Server poort 5501):');
console.log(`  ${base}/index.seo-draft.html`);
console.log(`  ${base}/index-el.seo-draft.html`);
console.log(`  ${base}/sitemap.seo-draft.xml`);
