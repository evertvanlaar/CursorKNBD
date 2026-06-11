#!/usr/bin/env node
/**
 * Kopieer dev/bus-schedule.json → data/bus-schedule.json
 * voor lokaal testen van ?busData=json.
 *
 * Verse Sheet-data:
 *   node scripts/refresh-bus-schedule-snapshot.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'dev', 'bus-schedule.json');
const dest = path.join(root, 'data', 'bus-schedule.json');

if (!fs.existsSync(src)) {
  console.error('Bron ontbreekt:', src);
  console.error('Eerst: node scripts/refresh-bus-schedule-snapshot.mjs');
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
const stat = fs.statSync(dest);
console.log('OK:', dest);
console.log('Bytes:', stat.size);
console.log('Test: open bus-pagina met ?busData=json op je local server.');
