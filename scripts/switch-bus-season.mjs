#!/usr/bin/env node
/**
 * Bus-rooster winter ↔ zomer op de server/lokaal.
 *
 *   node scripts/switch-bus-season.mjs winter          → data/bus-schedule.json = winter
 *   node scripts/switch-bus-season.mjs summer          → data/bus-schedule.json = zomer (cutover)
 *   node scripts/switch-bus-season.mjs staging-summer  → alleen data/bus-schedule.staging.json (test)
 *   node scripts/switch-bus-season.mjs publish-all     → kopieer beide seizoenen naar data/
 *
 * Bron (in git): dev/bus-schedule.winter.json, dev/bus-schedule.summer.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cmd = String(process.argv[2] || '').toLowerCase();

const SEASON_SRC = {
  winter: path.join(root, 'dev', 'bus-schedule.winter.json'),
  summer: path.join(root, 'dev', 'bus-schedule.summer.json'),
};

const DATA = {
  active: path.join(root, 'data', 'bus-schedule.json'),
  staging: path.join(root, 'data', 'bus-schedule.staging.json'),
  winter: path.join(root, 'data', 'bus-schedule.winter.json'),
  summer: path.join(root, 'data', 'bus-schedule.summer.json'),
  meta: path.join(root, 'data', 'bus-schedule.meta.json'),
};

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(obj)}\n`, 'utf8');
}

function copySeason(seasonKey, destPath) {
  const src = SEASON_SRC[seasonKey];
  if (!fs.existsSync(src)) {
    console.error('Bron ontbreekt:', src);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(src, destPath);
  const env = readJson(src);
  console.log('OK:', destPath);
  console.log('  scheduleId:', env.scheduleId, '—', env.scheduleLabel || '');
  console.log('  rowCount:', env.rowCount ?? env.rows?.length);
}

function seasonMetaFromSrc(seasonKey) {
  const src = SEASON_SRC[seasonKey];
  if (!src || !fs.existsSync(src)) return null;
  const env = readJson(src);
  return {
    validFrom: env.validFrom ?? null,
    validUntil: env.validUntil ?? null,
  };
}

function writeMeta(activeScheduleId, activeFile) {
  const active = seasonMetaFromSrc(activeScheduleId) || {};
  const seasons = {};
  for (const key of Object.keys(SEASON_SRC)) {
    const m = seasonMetaFromSrc(key);
    if (m) seasons[key] = { validFrom: m.validFrom, validUntil: m.validUntil };
  }
  writeJson(DATA.meta, {
    activeScheduleId,
    activeFile: path.basename(activeFile),
    updatedAt: new Date().toISOString(),
    validFrom: active.validFrom ?? null,
    validUntil: active.validUntil ?? null,
    seasons,
    winterFile: 'bus-schedule.winter.json',
    summerFile: 'bus-schedule.summer.json',
    testSummerUrl: 'https://www.kalanera.gr/bus.html?busData=json&busSeason=summer',
    testStagingUrl: 'https://www.kalanera.gr/bus.html?busData=json&busStaging=1',
  });
  console.log('OK:', DATA.meta);
}

if (!cmd || cmd === 'help' || cmd === '--help') {
  console.log(`Gebruik: node scripts/switch-bus-season.mjs <winter|summer|staging-summer|publish-all>`);
  process.exit(cmd ? 0 : 1);
}

if (cmd === 'publish-all') {
  copySeason('winter', DATA.winter);
  copySeason('summer', DATA.summer);
  copySeason('summer', DATA.staging);
  const meta = fs.existsSync(DATA.meta) ? readJson(DATA.meta) : {};
  writeMeta(meta.activeScheduleId || 'winter', DATA.active);
  process.exit(0);
}

if (cmd === 'staging-summer') {
  copySeason('summer', DATA.staging);
  console.log('\nTest (geen impact op productie):');
  console.log('  ?busData=json&busStaging=1');
  console.log('  ?busData=json&busSeason=summer  (na publish-all op server)');
  process.exit(0);
}

if (cmd === 'winter' || cmd === 'summer') {
  copySeason(cmd, DATA.active);
  copySeason('winter', DATA.winter);
  copySeason('summer', DATA.summer);
  writeMeta(cmd, DATA.active);
  fs.copyFileSync(SEASON_SRC[cmd], path.join(root, 'dev', 'bus-schedule.json'));
  console.log('\nActief rooster:', cmd);
  if (cmd === 'summer') {
    console.log('Zomerrooster is nu live via data/bus-schedule.json');
  }
  process.exit(0);
}

console.error('Onbekend commando:', cmd);
console.error('Gebruik: winter | summer | staging-summer | publish-all');
process.exit(1);
