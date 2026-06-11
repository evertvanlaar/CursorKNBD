#!/usr/bin/env node
/**
 * Haal verse bus-rijen op en werk snapshots bij (dev/ + data/).
 *
 *   node scripts/refresh-bus-schedule-snapshot.mjs
 *
 * Bron 1 (aanbevolen): n8n preview /webhook/bus-schedule-json-preview
 * Bron 2 (bootstrap): alle richtingen × 7 dagen via bus-schedule-next (traag, eenmalig)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PREVIEW_URL = 'https://n8n.vanlaar.cloud/webhook/bus-schedule-json-preview';
const WEBHOOK_URL = 'https://n8n.vanlaar.cloud/webhook/bus-schedule-next';
const BUS_DIRS = [
  'volos', 'milies', 'argalasti', 'afissos',
  'vyzitsa', 'pinakates', 'neochori', 'siki', 'promiri', 'katigiorgis', 'milina', 'platanias', 'trikeri',
];
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = [
  path.join(root, 'dev', 'bus-schedule.json'),
  path.join(root, 'data', 'bus-schedule.json'),
];

function normalizeRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.rows)) return payload.rows;
  if (payload && Array.isArray(payload.data)) return payload.data;
  throw new Error('Onverwacht formaat (geen array of rows[])');
}

function rowKey(row) {
  const id = row.ID ?? row.id ?? row.Trip_ID ?? row.trip_id;
  if (id != null && id !== '') return `id:${id}`;
  const t = row.Time_KalaNera ?? row.departure ?? '';
  const d = row.Days ?? row.days ?? '';
  const ds = row.dirs_served ?? row.Destinations_Served ?? '';
  return `t:${t}|d:${d}|ds:${ds}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPreviewEnvelope() {
  const res = await fetch(PREVIEW_URL, { headers: { Accept: 'application/json' } });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, text: text.slice(0, 300) };
  }
  let payload;
  try {
    payload = JSON.parse(text.trim() || 'null');
  } catch (e) {
    return { ok: false, status: res.status, text: `JSON parse: ${e.message}` };
  }
  const rows = normalizeRows(payload);
  const envelope = (payload && typeof payload === 'object' && !Array.isArray(payload) && payload.rows)
    ? payload
    : {
        generatedAt: new Date().toISOString(),
        source: 'google-sheets',
        rowCount: rows.length,
        rows,
      };
  return { ok: true, envelope, rows };
}

async function fetchAllRowsViaWebhookBootstrap() {
  const seen = new Map();
  console.warn('Preview niet beschikbaar — bootstrap via bus-schedule-next (91 requests, even geduld)...');
  for (const dir of BUS_DIRS) {
    for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
      const url = `${WEBHOOK_URL}?from=Kala%20Nera&dir=${dir}&remaining=0&dayOffset=${dayOffset}`;
      try {
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) {
          console.warn(`  skip ${dir} day+${dayOffset}: HTTP ${res.status}`);
          continue;
        }
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data?.items || []);
        for (const row of items) {
          seen.set(rowKey(row), row);
        }
      } catch (e) {
        console.warn(`  skip ${dir} day+${dayOffset}:`, e.message);
      }
      await sleep(180);
    }
  }
  const rows = [...seen.values()];
  if (!rows.length) throw new Error('Bootstrap: geen rijen verzameld');
  return {
    generatedAt: new Date().toISOString(),
    source: 'webhook-bootstrap',
    rowCount: rows.length,
    rows,
  };
}

let envelope;
const preview = await fetchPreviewEnvelope();
if (preview.ok) {
  envelope = preview.envelope;
  console.log('Bron: preview webhook');
} else {
  console.warn('Preview webhook:', preview.status, preview.text);
  envelope = await fetchAllRowsViaWebhookBootstrap();
  console.log('Bron: webhook-bootstrap');
}

const json = JSON.stringify(envelope, null, 0) + '\n';
for (const dest of targets) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, json, 'utf8');
  console.log('Written:', dest);
}

console.log('Rows:', envelope.rowCount ?? envelope.rows?.length);
console.log('generatedAt:', envelope.generatedAt);
console.log('Test: bus-pagina?busData=json');
