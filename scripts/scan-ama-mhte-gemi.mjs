import fs from 'fs';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const data = JSON.parse(fs.readFileSync('./data/local-businesses.json', 'utf8'));
const cats = new Set(['Sleep', 'Eat', 'Drink', 'Camp']);
const rows = data.rows.filter((r) => cats.has(r.Category));

const SOCIAL =
  /(facebook\.com|instagram\.com|tripadvisor\.|booking\.com|rentbyowner\.com|airbnb\.|maps\.google)/i;
const SKIP_LABEL = /^(instagram|facebook)$/i;

function normalizeUrl(w) {
  if (!w) return null;
  w = w.trim();
  if (SKIP_LABEL.test(w)) return null;
  if (SOCIAL.test(w)) return { url: w, social: true };
  if (!/^https?:\/\//i.test(w)) w = 'https://' + w;
  try {
    new URL(w);
    return { url: w, social: false };
  } catch {
    return null;
  }
}

function fetchText(url, redirects = 0) {
  return new Promise((resolve) => {
    if (redirects > 5) {
      return resolve({
        ok: false,
        status: 0,
        text: '',
        finalUrl: url,
        err: 'too many redirects',
      });
    }
    let u;
    try {
      u = new URL(url);
    } catch {
      return resolve({
        ok: false,
        status: 0,
        text: '',
        finalUrl: url,
        err: 'bad url',
      });
    }
    const lib = u.protocol === 'http:' ? http : https;
    const req = lib.request(
      u,
      {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; KalaNeraBot/1.0; +https://www.kalanera.gr)',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'el,en;q=0.9',
        },
        timeout: 15000,
      },
      (res) => {
        const loc = res.headers.location;
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && loc) {
          const next = new URL(loc, u).href;
          res.resume();
          return resolve(fetchText(next, redirects + 1));
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          let text = buf.toString('utf8');
          if (
            /charset\s*=\s*["']?iso-8859-7/i.test(text) ||
            /charset\s*=\s*["']?windows-1253/i.test(text)
          ) {
            try {
              text = new TextDecoder('windows-1253').decode(buf);
            } catch {
              /* keep utf8 */
            }
          }
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 400,
            status: res.statusCode,
            text,
            finalUrl: u.href,
            err: null,
          });
        });
      }
    );
    req.on('error', (e) =>
      resolve({
        ok: false,
        status: 0,
        text: '',
        finalUrl: url,
        err: e.message,
      })
    );
    req.on('timeout', () => {
      req.destroy();
      resolve({
        ok: false,
        status: 0,
        text: '',
        finalUrl: url,
        err: 'timeout',
      });
    });
    req.end();
  });
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
}

/** Map Greek lookalike letters to Latin so MHTE codes match reliably. */
function latinize(s) {
  const map = {
    Α: 'A',
    Β: 'B',
    Ε: 'E',
    Ζ: 'Z',
    Η: 'H',
    Ι: 'I',
    Κ: 'K',
    Μ: 'M',
    Ν: 'N',
    Ο: 'O',
    Ρ: 'P',
    Τ: 'T',
    Υ: 'Y',
    Χ: 'X',
    α: 'A',
    β: 'B',
    ε: 'E',
    ζ: 'Z',
    η: 'H',
    ι: 'I',
    κ: 'K',
    μ: 'M',
    ν: 'N',
    ο: 'O',
    ρ: 'P',
    τ: 'T',
    υ: 'Y',
    χ: 'X',
  };
  return s.replace(/[ΑΒΕΖΗΙΚΜΝΟΡΤΥΧαβεζηικμνορτυχ]/g, (ch) => map[ch] || ch);
}

function normalizeCode(code) {
  return latinize(code)
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '');
}

const MHTE_RE =
  /(?:M\s*\.?\s*H\s*\.?\s*T\s*\.?\s*E\s*\.?|Μ\s*\.?\s*Η\s*\.?\s*Τ\s*\.?\s*Ε\s*\.?|ΕΟΤ|E\.?O\.?T\.?|GNTO|G\.?N\.?T\.?O\.?|Special\s+Operating\s+(?:Signal|Sign)|Αριθμός\s+(?:Ειδικού\s+σήματος\s+Λειτουργίας|Μητρώου)|Μητρώο\s+Τουριστικών\s+Επιχειρήσεων|Operating\s+License|Licenced\s+by\s+GNTO|licence\s*n(?:umber|o)\.?|license\s*n(?:umber|o)\.?|CRN|C\.R\.N\.?)[\s:：\-–]*([0-9]{4}[A-ZΑ-Ω][0-9]{3}[A-ZΑ-Ω][0-9]{5,8}(?:-?[0-9])?)/gi;
const MHTE_CODE =
  /\b(0726[A-ZΑ-Ω0-9]{10,14}|0[0-9]{3}[A-ZΑ-Ω][0-9]{3}[A-ZΑ-Ω][0-9]{5,8}(?:-?[0-9])?)\b/gi;
const AMA_RE =
  /(?:\bAMA\b|\bΑΜΑ\b|\bΜΑΓ\b|Μ\s*\.?\s*Α\s*\.?|Αριθμός\s+Μητρώου\s+Ακινήτου|Registry\s+Number|Rental\s+Registry|Α\.?Μ\.?Α\.?)[\s:：\-–]*([0-9]{6,12})/gi;
const AMA_CODE = /\b(0000[0-9]{7,8})\b/g;
const GEMI_RE =
  /(?:\bGEMI\b|\bΓΕΜΗ\b|G\s*\.?\s*E\s*\.?\s*MI\s*\.?|Γ\s*\.?\s*Ε\s*\.?\s*Μ\s*\.?\s*Η\s*\.?)[\s:：\-–]*([0-9]{8,14})/gi;

function extractNumbers(text) {
  const found = { mhte: new Set(), ama: new Set(), gemi: new Set() };
  const plain = latinize(stripHtml(text));
  let m;
  MHTE_RE.lastIndex = 0;
  while ((m = MHTE_RE.exec(plain))) {
    const code = normalizeCode(m[1] || '');
    if (code.length >= 12) found.mhte.add(code);
  }
  MHTE_CODE.lastIndex = 0;
  while ((m = MHTE_CODE.exec(plain))) {
    const code = normalizeCode(m[1]);
    if (code.length >= 12) found.mhte.add(code);
  }
  AMA_RE.lastIndex = 0;
  while ((m = AMA_RE.exec(plain))) found.ama.add(m[1]);
  AMA_CODE.lastIndex = 0;
  while ((m = AMA_CODE.exec(plain))) found.ama.add(m[1]);
  GEMI_RE.lastIndex = 0;
  while ((m = GEMI_RE.exec(plain))) found.gemi.add(m[1]);
  return found;
}

function candidatePages(base) {
  const u = new URL(base);
  const origin = u.origin;
  const paths = [
    '/',
    '/imprint/',
    '/imprint',
    '/impressum/',
    '/impressum',
    '/privacy/',
    '/privacy-policy/',
    '/privacy-policy',
    '/legal/',
    '/contact/',
    '/contact',
    '/about/',
    '/el/',
    '/en/',
  ];
  const set = new Set([base]);
  for (const p of paths) set.add(origin + p);
  return [...set];
}

async function scanBusiness(biz) {
  const norm = normalizeUrl(biz.website);
  const result = {
    name: biz.name.trim(),
    nameEl: biz.nameEl || '',
    category: biz.category,
    location: biz.location,
    website: biz.website || '',
    scannedUrl: null,
    status: 'pending',
    mhte: [],
    ama: [],
    gemi: [],
    notes: [],
    sources: [],
  };
  if (!norm) {
    result.status = 'no-website';
    result.notes.push('Geen bruikbare website-URL in de sheet');
    return result;
  }
  if (norm.social) {
    result.status = 'social-only';
    result.scannedUrl = norm.url;
    result.notes.push(
      'Alleen social media / booking platform — geen footer-scan'
    );
    return result;
  }
  result.scannedUrl = norm.url;
  const pages = candidatePages(norm.url);
  const all = { mhte: new Set(), ama: new Set(), gemi: new Set() };
  let anyOk = false;
  let imprintChecked = false;
  for (const page of pages) {
    const res = await fetchText(page);
    if (!res.ok || !res.text) continue;
    anyOk = true;
    const found = extractNumbers(res.text);
    for (const x of found.mhte) all.mhte.add(x);
    for (const x of found.ama) all.ama.add(x);
    for (const x of found.gemi) all.gemi.add(x);
    if (found.mhte.size || found.ama.size || found.gemi.size) {
      result.sources.push(res.finalUrl || page);
    }
    if (/imprint|impressum|privacy|legal/i.test(page)) imprintChecked = true;
    if (
      (all.mhte.size || all.ama.size || all.gemi.size) &&
      imprintChecked
    ) {
      break;
    }
  }
  result.mhte = [...all.mhte];
  result.ama = [...all.ama];
  result.gemi = [...all.gemi];
  if (!anyOk) {
    result.status = 'fetch-failed';
    result.notes.push('Website niet bereikbaar of geen HTML');
  } else if (result.mhte.length || result.ama.length || result.gemi.length) {
    result.status = 'found';
  } else {
    result.status = 'not-found';
    result.notes.push(
      'Pagina bereikbaar, geen MA/MHTE/GEMI herkend in footer/common pages'
    );
  }
  return result;
}

const list = rows.map((r) => ({
  name: r.Name,
  nameEl: r.Name_EL || '',
  category: r.Category,
  location: r.Location || '',
  website: (r.Website || '').trim(),
}));

console.error('Scanning', list.length, 'businesses...');
const results = [];
for (let i = 0; i < list.length; i++) {
  const b = list[i];
  process.stderr.write(`[${i + 1}/${list.length}] ${b.name} ... `);
  const r = await scanBusiness(b);
  const codes = [...r.mhte, ...r.ama, ...r.gemi].join(',');
  console.error(r.status + (codes ? ' ' + codes : ''));
  results.push(r);
}

fs.mkdirSync('./data', { recursive: true });
fs.writeFileSync(
  './data/ama-mhte-gemi-scan-raw.json',
  JSON.stringify(results, null, 2)
);
console.log('Wrote raw json, count', results.length);
