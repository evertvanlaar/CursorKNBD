#!/usr/bin/env node
/**
 * Haal seo-draft bestanden op uit n8n (na Preview) → schrijf lokaal → Verkenner.
 *
 * Vereist: workflow actief + Webhook GET seo-draft-export + net Preview gedraaid.
 *
 *   node scripts/fetch-seo-draft-from-n8n.mjs
 *
 * URL override:
 *   set N8N_SEO_DRAFT_EXPORT_URL=https://n8n.vanlaar.cloud/webhook/seo-draft-export
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPORT_URL =
  process.env.N8N_SEO_DRAFT_EXPORT_URL || 'https://n8n.vanlaar.cloud/webhook/seo-draft-export';

const DRAFT_NAMES = ['index.seo-draft.html', 'index-el.seo-draft.html', 'sitemap.seo-draft.xml'];

async function main() {
  let res;
  try {
    res = await fetch(EXPORT_URL, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(60000),
    });
  } catch (e) {
    console.error(`Kan n8n niet bereiken (${EXPORT_URL}): ${e.message}`);
    process.exit(1);
  }

  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    console.error('Geen JSON van n8n:', text.slice(0, 300));
    process.exit(1);
  }

  const body = payload?.body ?? payload?.data ?? payload;
  if (!body?.ok || !body?.files) {
    console.error(body?.error ?? body?.message ?? 'Geen draft in n8n — run eerst Stap 1 Preview.');
    process.exit(1);
  }

  const written = [];
  for (const name of DRAFT_NAMES) {
    const content = body.files[name];
    if (content == null) {
      console.error(`Draft mist bestand: ${name}`);
      process.exit(1);
    }
    const outPath = path.join(ROOT, name);
    fs.writeFileSync(outPath, content, 'utf8');
    written.push(outPath);
    console.log(`Geschreven: ${outPath}`);
  }

  console.log('\nOpen in browser (Live Server poort 5501):');
  console.log('  http://localhost:5501/index.seo-draft.html');
  console.log('  http://localhost:5501/index-el.seo-draft.html');
  console.log('  http://localhost:5501/sitemap.seo-draft.xml');

  if (process.platform === 'win32' && written.length) {
    spawnSync('explorer.exe', [`/select,${written[0]}`], { stdio: 'ignore' });
  }
}

main();
