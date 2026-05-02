/**
 * Voegt dayOffset-ondersteuning toe aan Filter in bus-schedule-workflow.json.
 * Run: node n8n/patch-bus-filter-dayoffset.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, 'bus-schedule-workflow.json');

const j = JSON.parse(fs.readFileSync(file, 'utf8'));
const node = j.nodes.find((n) => n.name === 'Filter + Normalize + Sort (Athens)');
if (!node?.parameters?.functionCode) {
  throw new Error('Filter node niet gevonden');
}

let fc = node.parameters.functionCode;

const helpers = [
  "function athensCalendarYmdNow() {",
  "  return new Intl.DateTimeFormat('sv-SE', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());",
  '}',
  '',
  'function addDaysToGregorianYmd(ymdStr, deltaDays) {',
  '  const [y, m, d] = ymdStr.split("-").map(Number);',
  '  const x = new Date(Date.UTC(y, m - 1, d + deltaDays));',
  '  const ys = x.getUTCFullYear();',
  "  const ms = String(x.getUTCMonth() + 1).padStart(2, '0');",
  "  const ds = String(x.getUTCDate()).padStart(2, '0');",
  "  return ys + '-' + ms + '-' + ds;",
  '}',
  '',
  '/** 1 = maandag .. 7 = zondag (matcht matchesDays). */',
  'function weekdayNumFromGregorianYmd(ymdStr) {',
  "  const [y, m, d] = ymdStr.split('-').map(Number);",
  '  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();',
  '  return dow === 0 ? 7 : dow;',
  '}',
  '',
].join('\r\n');

const getQueryOld = [
  '  return {',
  "    from: (q.from || 'Kala Nera').toString(),",
  '    dir,',
  "    remaining: (q.remaining || '1').toString() !== '0',",
  '    minutesEarly: Number(q.minutesEarly ?? 10) || 10,',
  "    apiKey: (q.key || '').toString(),",
  '  };',
].join('\r\n');

const getQueryNew = [
  '  const dayOffRaw = Number(q.dayOffset ?? q.day ?? 0);',
  '  const dayOffset = Math.max(0, Math.min(6, Number.isFinite(dayOffRaw) ? Math.floor(dayOffRaw) : 0));',
  '  return {',
  "    from: (q.from || 'Kala Nera').toString(),",
  '    dir,',
  "    remaining: (q.remaining || '1').toString() !== '0',",
  '    minutesEarly: Number(q.minutesEarly ?? 10) || 10,',
  "    apiKey: (q.key || '').toString(),",
  '    dayOffset,',
  '  };',
].join('\r\n');

const tzHook = "const tz = 'Europe/Athens';\r\n\r\n";

const nowBlockOld =
  'const q = getQuery(items);\r\nconst now = athensNowParts();\r\nconst nowMin = parseHHMMToMinutes(now.hm);';

const nowBlockNew = [
  'const q = getQuery(items);',
  'const baseYmd = athensCalendarYmdNow();',
  'const targetYmd = addDaysToGregorianYmd(baseYmd, q.dayOffset);',
  'const clock = athensNowParts();',
  'const now = {',
  '  ymd: targetYmd,',
  '  hm: clock.hm,',
  '  todayNum: weekdayNumFromGregorianYmd(targetYmd),',
  '};',
  'const nowMin = parseHHMMToMinutes(now.hm);',
].join('\r\n');

const metaQueryOld = [
  '        query: {',
  '          from: q.from,',
  '          dir: q.dir,',
  '          remaining: q.remaining,',
  '          minutesEarly: q.minutesEarly,',
  '        },',
].join('\r\n');

const metaQueryNew = [
  '        query: {',
  '          from: q.from,',
  '          dir: q.dir,',
  '          remaining: q.remaining,',
  '          minutesEarly: q.minutesEarly,',
  '          dayOffset: q.dayOffset,',
  '        },',
].join('\r\n');

if (!fc.includes(tzHook)) {
  throw new Error('tz-hook niet gevonden');
}
if (!fc.includes(getQueryOld)) {
  throw new Error('getQuery return niet gevonden');
}
if (!fc.includes(nowBlockOld)) {
  throw new Error('now-block niet gevonden');
}
if (!fc.includes(metaQueryOld)) {
  throw new Error('meta.query niet gevonden');
}

if (fc.includes('athensCalendarYmdNow')) {
  console.log('Al ge-patcht, overslaan.');
  process.exit(0);
}

fc = fc.replace(tzHook, tzHook + helpers);
fc = fc.replace(getQueryOld, getQueryNew);
fc = fc.replace(nowBlockOld, nowBlockNew);
fc = fc.replace(metaQueryOld, metaQueryNew);

node.parameters.functionCode = fc;
fs.writeFileSync(file, JSON.stringify(j, null, 2), 'utf8');
console.log('OK:', file);
