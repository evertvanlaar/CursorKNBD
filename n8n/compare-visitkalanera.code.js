// n8n Code node — Compare kalanera vs visitkalanera + shadow sheet candidates
// n8n raakt visitkalanera.gr NIET aan — alleen eigen JSON op kalanera.gr (snapshot via GitHub Actions).

const CONFIG = {
  kalaneraJsonUrl: 'https://kalanera.gr/data/local-businesses.json',
  visitSnapshotUrl: 'https://kalanera.gr/data/visitkalanera-sitemap.json',
  shadowSheetDocumentId: '1EPTu-cz2NYKJxlC6Ki14cyfQYiMFxg_i5gSgjw0IUvI',
  snapshotMaxAgeDays: 10,
  minKalaneraActive: 50,
  matchThreshold: 0.55,
  alertCoverageBelowPct: 25,
  reportDocPath: 'docs/kalanera-vs-visitkalanera-businesses.md',
  httpHeaders: { Accept: 'application/json' },
};

const ALIASES = {
  edem: 'edem', 'edem-tavern': 'edem', 'εδεμ': 'edem', 'εδεμ ταβερνα': 'edem',
  '1900': '1900', ainareti: 'ainareti',
  'hotel-agelis': 'agelis', 'hotel-rodia': 'rodia', 'hotel-pigasus': 'pegasus', irida: 'irida',
  'irida-house': 'irida', 'kala-nera-panorama': 'panorama', 'la-luna': 'la luna', 'la-luna-hotel': 'la luna',
  levantes: 'levantes', naftilos: 'naftilos', 'naftilos-coffee-bar': 'naftilos',
  'oceanis-water-sports-rentals': 'oceanis rentals pelion',
  'orange-garden': 'orange garden', pagaseon: 'pagaseon', 'pagaseon-studios': 'pagaseon',
  pandora: 'pandora', 'pandora-studios': 'pandora', serenity: 'serenity', 'serenity-studios': 'serenity',
  vasileiou: 'vasileiou', 'vasileiou-apartments': 'vasileiou',
  apostolis: 'apostolis barber', 'apostolis-fovos': 'apostolis barber',
  vardakeios: 'vardakis market', 'βαρδακειος': 'vardakis market', 'four-ways': 'four ways travel',
  kentavros: 'kentavros', kentauros: 'kentavros', 'market-cafe-kentauros': 'kentavros',
  'market-kentauros': 'kentavros', 'market κενταυρος': 'kentavros',
  dimoula: 'dimoula', 'xenodoxeio-dimoula': 'dimoula',
  iliachtides: 'iliachtides', hliaxtides: 'iliachtides', 'enikoiazomena-dwmatia-hliaxtides': 'iliachtides',
  platanofylla: 'platanofylla', 'platanofylla-studios-and-apartments': 'platanofylla',
  'pelion-esties': 'pelion esties', 'eirini-filippou': 'eirini filippou',
  'eirini-filippou-apartments': 'eirini filippou', fournos: 'fournos', 'φουρνος': 'fournos',
  'avgi-by-the-sea': 'pelion esties', 'avgibythesea': 'pelion esties',
};

// Bekende profielen voor externe missers (Kala Nera)
const MISSER_PROFILES = {
  'eirini filippou': {
    Name: 'Eirini Filippou Apartments',
    Name_EL: 'Επιπλωμένα διαμερίσματα Ειρήνης Φιλίππου',
    Website: 'https://visitkalanera.gr/eirini-filippou-apartments/',
    Phone: '',
    Location: 'Kala Nera',
    Category: 'Sleep',
    Email: '',
    Summary_en_imp: 'Furnished apartments in the village centre, 60 metres from the beach, restaurants and shops. All units have equipped kitchen, TV, A/C, heating and balcony.',
    Summary_el_imp: 'Επιπλωμένα διαμερίσματα στο κέντρο του χωριού, 60 μέτρα από την παραλία. Όλα τα δωμάτια έχουν εξοπλισμένη κουζίνα, τηλεόραση, κλιματιστικό, καλοριφέρ και μπαλκόνι.',
  },
  iliachtides: {
    Name: 'Iliachtides Rooms',
    Name_EL: 'Ενοικιαζόμενα δωμάτια Ηλιαχτίδες',
    Website: 'https://visitkalanera.gr/enikoiazomena-dwmatia-hliaxtides/',
    Phone: '+30 24230 22164',
    Location: 'Kala Nera',
    Category: 'Sleep',
    Email: 'blana.hotels@gmail.com',
    Summary_en_imp: "Summer rooms on Pelion's main road, 500 m from Kala Nera beach. Double, triple and family rooms with kitchenette, private bathroom, A/C, WiFi and garden-view balcony. Parking, BBQ and small playground; pets welcome.",
    Summary_el_imp: 'Ενοικιαζόμενα δωμάτια στην κεντρική οδό του Πηλίου, 500 μ. από την παραλία των Καλών Νερών. Δίκλινα, τρίκλινα και οικογενειακά δωμάτια με κουζίνα, μπάνιο, A/C, WiFi και μπαλκόνι.',
  },
  'pelion esties': {
    Name: 'Avgi by the Sea',
    Name_EL: 'Αύγη by the Sea',
    Website: 'https://pelion-villas.com/en/villas/avgi-by-the-sea/',
    Phone: '+30 24230 23147',
    Location: 'Kala Nera',
    Category: 'Sleep',
    Email: 'info@pelion-villas.com',
    Summary_en_imp: 'Sea-front Pelion beach house on the water in Kala Nera. Fully equipped apartment with private terrace for couples or families; steps from tavernas, cafés and shops. Managed by Pelion Esties.',
    Summary_el_imp: 'Παραθαλάσσιο διαμέρισμα ακριβώς πάνω στο κύμα στα Καλά Νερά. Πλήρως εξοπλισμένο κατάλυμα με ιδιωτική βεράντα, ιδανικό για ζευγάρια ή οικογένειες.',
  },
  platanofylla: {
    Name: 'Platanofylla Studios',
    Name_EL: 'Platanofylla Studios & Apartments',
    Website: 'https://platanofylla.gr/',
    Phone: '+30 24230 22622',
    Location: 'Kala Nera',
    Category: 'Sleep',
    Email: 'info@platanofylla.gr',
    Summary_en_imp: "Guesthouse shaded by plane trees beside the sea at the end of Kala Nera's coastal road. Two-storey complex with 4–5 person apartments and 2–3 person studios.",
    Summary_el_imp: 'Ξενώνας με πλατάνια δίπλα στη θάλασσα στο τέρμα της παραλιακής οδού. Δίχωρα διαμερίσματα και στούντιο με κουζίνα, μπάνιο και μπαλκόνι.',
  },
  dimoula: {
    Name: 'Hotel Dimoula',
    Name_EL: 'Ξενοδοχείο Δημουλά',
    Website: 'https://visitkalanera.gr/xenodoxeio-dimoula/',
    Phone: '+30 24230 22245',
    Location: 'Kala Nera',
    Category: 'Sleep',
    Email: 'hdimoula@otenet.gr',
    Summary_en_imp: 'Family-run hotel, recently fully renovated. Quiet location near the beach and village centre; flower-filled courtyard offers shade on hot summer days.',
    Summary_el_imp: 'Οικογενειακό ξενοδοχείο, πρόσφατα ανακαινισμένο. Ήσυχη τοποθεσία κοντά στην παραλία και το κέντρο.',
  },
  kentavros: {
    Name: 'Market Kentauros',
    Name_EL: 'Μαρκετ – Καφέ Κένταυρος',
    Website: 'https://visitkalanera.gr/market-cafe-kentauros/',
    Phone: '+30 24230 22763',
    Location: 'Kala Nera',
    Category: 'Shop',
    Email: '',
    Summary_en_imp: 'Beach-side mini-market and café in Kala Nera, offering groceries and refreshments for locals and visitors.',
    Summary_el_imp: 'Μίνι-μάρκετ και καφέ στην παραλία των Καλών Νερών, με είδη παντοπωλείου και αναψυκτικά.',
  },
  fournos: {
    Name: 'Fouornos',
    Name_EL: 'Φούρνος',
    Website: 'https://visitkalanera.gr/%cf%86%ce%bf%cf%8d%cf%81%ce%bd%ce%bf%cf%82/',
    Phone: '',
    Location: 'Kala Nera',
    Category: 'Shop',
    Email: '',
    Summary_en_imp: 'Bakery listed on the external directory; contact details not published on visitkalanera.gr.',
    Summary_el_imp: 'Αρτοποιείο στον εξωτερικό κατάλογο· χωρίς στοιχεία επικοινωνίας στο visitkalanera.gr.',
  },
};

function norm(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0370-\u03ff\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeSlug(slug) {
  try { return decodeURIComponent(slug); } catch { return slug; }
}

function aliasKey(text) {
  const textL = String(text || '').toLowerCase();
  const n = norm(decodeSlug(textL));
  for (const [k, v] of Object.entries(ALIASES)) {
    if (textL.includes(k) || n.includes(k)) return v;
  }
  return n;
}

function scorePair(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) / Math.max(a.length, b.length);
  const ta = new Set(a.split(' '));
  const tb = new Set(b.split(' '));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / Math.max(ta.size, tb.size);
}

function sheetStatus(row) {
  return String(row?.Status ?? row?.status ?? row?.STATUS ?? '').trim().toLowerCase();
}

function normalizeRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.rows) return payload.rows;
  if (payload?.data) return payload.data;
  return [];
}

function getShadowRows() {
  try {
    return $('Read shadow Google Sheet').all().map((item) => item.json);
  } catch {
    return [];
  }
}

function dedupeVisitPages(pages) {
  const seen = new Map();
  const out = [];
  for (const p of pages) {
    const key = aliasKey(p.slug) || aliasKey(p.title) || p.normTitle || norm(p.title);
    if (!key) {
      out.push(p);
      continue;
    }
    if (!seen.has(key)) {
      seen.set(key, p);
      out.push(p);
    }
  }
  return out;
}

function knownRowKeys(rows) {
  const keys = new Set();
  for (const r of rows) {
    for (const part of [r.Name, r.Name_EL, r.Website]) {
      const k = aliasKey(part);
      if (k) keys.add(k);
      const n = norm(part);
      if (n) keys.add(n);
    }
  }
  return keys;
}

function isKnownBusiness(profile, knownKeys, kalaneraList) {
  const candidates = [profile.Name, profile.Name_EL].filter(Boolean);
  for (const c of candidates) {
    const ak = aliasKey(c);
    if (knownKeys.has(ak) || knownKeys.has(norm(c))) return true;
    for (const k of kalaneraList) {
      if (scorePair(ak, k.norm) >= 0.8 || scorePair(ak, k.normEl) >= 0.8) return true;
      if (scorePair(norm(c), k.norm) >= 0.8) return true;
    }
  }
  return false;
}

function formatDatum() {
  const parts = new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Athens',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value || '';
  return `${get('day')}-${get('month')}-${get('year')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

function profileForVisitPage(v) {
  const key = aliasKey(v.slug) || aliasKey(v.title);
  if (MISSER_PROFILES[key]) return { ...MISSER_PROFILES[key] };
  return {
    Name: v.title,
    Name_EL: '',
    Website: v.url || '',
    Phone: '',
    Location: 'Kala Nera',
    Category: 'Other',
    Email: '',
    Summary_en_imp: `Discovered via external directory page: ${v.title}`,
    Summary_el_imp: `Εντοπίστηκε μέσω εξωτερικού καταλόγου: ${v.title}`,
  };
}

async function httpGetJson(url) {
  try {
    const data = await this.helpers.httpRequest({
      method: 'GET', url, headers: CONFIG.httpHeaders, json: true, timeout: 45000,
    });
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

function bestMatches(visitList, kalaneraList, threshold) {
  const pairs = [];
  for (let vi = 0; vi < visitList.length; vi++) {
    const v = visitList[vi];
    const vkeys = [aliasKey(v.slug), aliasKey(v.title), v.normTitle || norm(v.title)];
    for (let ki = 0; ki < kalaneraList.length; ki++) {
      const k = kalaneraList[ki];
      if (k.norm.includes('oceanis water sports') && v.slug.includes('oceanis')) continue;
      const kkeys = [k.norm, k.normEl, aliasKey(k.name)];
      let best = 0;
      for (const a of vkeys) for (const b of kkeys) best = Math.max(best, scorePair(a, b));
      if (best >= threshold) pairs.push({ sc: best, vi, ki, v, k });
    }
  }
  pairs.sort((a, b) => b.sc - a.sc);
  const usedV = new Set();
  const usedK = new Set();
  const matched = [];
  for (const p of pairs) {
    if (usedV.has(p.vi) || usedK.has(p.ki)) continue;
    matched.push({ ...p, how: p.sc >= 0.95 ? 'exact' : 'fuzzy' });
    usedV.add(p.vi);
    usedK.add(p.ki);
  }
  return { matched, usedV, usedK };
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toBodyHtml(lines) {
  const htmlLines = lines.map((line) => {
    if (!line) return '<br>';
    if (line.startsWith('===')) {
      const title = line.replace(/^=+\s*|\s*=+$/g, '');
      return `<h3 style="margin:16px 0 6px;font-size:15px">${escHtml(title)}</h3>`;
    }
    let color = '#1a1a1a';
    if (/^OK\b/.test(line) || /Status: OK/i.test(line)) color = '#0d7a3e';
    if (/^FAIL\b/.test(line) || /FETCH ERROR|ALERT/i.test(line)) color = '#b42318';
    if (/^WARN\b/.test(line)) color = '#b54708';
    return `<p style="margin:3px 0;color:${color}">${escHtml(line)}</p>`;
  }).join('\n');
  return `<!DOCTYPE html><html><body style="font-family:system-ui,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.45;color:#1a1a1a;max-width:48em;padding:8px 4px">${htmlLines}</body></html>`;
}

const shadowRows = getShadowRows();
const shadowKnownKeys = knownRowKeys(shadowRows);

const issues = [];
const kRes = await httpGetJson.call(this, CONFIG.kalaneraJsonUrl);
const vRes = await httpGetJson.call(this, CONFIG.visitSnapshotUrl);

if (!kRes.ok) issues.push(`kalanera JSON fetch mislukt: ${kRes.error}`);

let visitFetchFailed = false;
let visitDeduped = [];
let snapshotGeneratedAt = null;
let sitemapLastmod = null;

if (!vRes.ok) {
  visitFetchFailed = true;
  issues.push(`FAIL  visit-snapshot niet beschikbaar op kalanera.gr: ${vRes.error}`);
  issues.push('WARN  Deploy data/visitkalanera-sitemap.json of wacht op GitHub Actions (maandag 06:00 UTC)');
} else {
  snapshotGeneratedAt = vRes.data?.generatedAt || null;
  sitemapLastmod = vRes.data?.sitemapLastmod || null;
  visitDeduped = Array.isArray(vRes.data?.pages) ? vRes.data.pages : [];
  if (!visitDeduped.length) {
    visitFetchFailed = true;
    issues.push('FAIL  visit-snapshot bevat geen pagina\'s');
  } else if (snapshotGeneratedAt) {
    const ageDays = (Date.now() - Date.parse(snapshotGeneratedAt)) / 86400000;
    if (ageDays > CONFIG.snapshotMaxAgeDays) {
      issues.push(`WARN  Snapshot ${Math.round(ageDays)} dagen oud (max ${CONFIG.snapshotMaxAgeDays})`);
    }
  }
}

const kalanera = [];
if (kRes.ok) {
  for (const r of normalizeRows(kRes.data)) {
    const st = sheetStatus(r);
    if (st && st !== 'active') continue;
    kalanera.push({
      name: String(r.Name || '').trim(),
      nameEl: String(r.Name_EL || '').trim(),
      category: String(r.Category || '').trim(),
      location: String(r.Location || '').trim(),
      norm: norm(r.Name),
      normEl: norm(r.Name_EL),
    });
  }
}

const kalaneraKnownKeys = knownRowKeys(kalanera.map((k) => ({ Name: k.name, Name_EL: k.nameEl })));
const allKnownKeys = new Set([...shadowKnownKeys, ...kalaneraKnownKeys]);

let matched = [];
let onlyKalanera = kalanera;
let onlyVisit = visitDeduped;
let partial = [];

if (kRes.ok && !visitFetchFailed) {
  const bm = bestMatches(visitDeduped, kalanera, CONFIG.matchThreshold);
  matched = bm.matched;
  onlyVisit = dedupeVisitPages(visitDeduped.filter((_, i) => !bm.usedV.has(i)));
  onlyKalanera = kalanera.filter((_, i) => !bm.usedK.has(i));
  const matchedNorms = new Set(matched.map((m) => m.k.norm));
  for (const k of kalanera) {
    if (k.norm.includes('oceanis water sports') && !matchedNorms.has(k.norm)) {
      const v = visitDeduped.find((x) => x.slug.includes('oceanis'));
      if (v) partial.push({ k, v });
    }
  }
  onlyKalanera = onlyKalanera.filter((k) => !partial.some((p) => p.k.norm === k.norm));
}

const sheetCandidates = [];
const sheetSkipped = [];

if (!visitFetchFailed) {
  for (const v of onlyVisit) {
    const profile = profileForVisitPage(v);
    if (isKnownBusiness(profile, allKnownKeys, kalanera)) {
      sheetSkipped.push(profile.Name);
      continue;
    }
    const rowKey = aliasKey(profile.Name);
    if (sheetCandidates.some((c) => aliasKey(c.Name) === rowKey)) continue;

    sheetCandidates.push({
      Name: profile.Name,
      Name_EL: profile.Name_EL || '',
      Website: profile.Website || v.url || '',
      Phone: profile.Phone || '',
      Location: profile.Location || 'Kala Nera',
      Category: profile.Category || 'Other',
      Email: profile.Email || '',
      Status: 'Shadow',
      PhotoURL: '',
      Datum: formatDatum(),
      siteOK: '',
      Lastcheck: '',
      Summary_en_imp: profile.Summary_en_imp || '',
      Summary_el_imp: profile.Summary_el_imp || '',
      _source: 'visitkalanera-compare',
      _visitSlug: v.slug,
    });
    allKnownKeys.add(rowKey);
    allKnownKeys.add(norm(profile.Name));
  }
}

if (kalanera.length < CONFIG.minKalaneraActive) {
  issues.push(`kalanera Active te laag: ${kalanera.length} (min ${CONFIG.minKalaneraActive})`);
}

const coveragePct = kalanera.length ? Math.round((matched.length / kalanera.length) * 100) : 0;
if (!visitFetchFailed && coveragePct < CONFIG.alertCoverageBelowPct) {
  issues.push(`Dekking externe site ${coveragePct}% (drempel ${CONFIG.alertCoverageBelowPct}%)`);
}

const ok = issues.length === 0;
const generatedAt = kRes.ok && kRes.data && !Array.isArray(kRes.data) ? (kRes.data.generatedAt || null) : null;

const lines = [
  'Bedrijvenvergelijking — kalanera.gids vs externe directory',
  `Gegenereerd (UTC): ${new Date().toISOString()}`,
  generatedAt ? `kalanera JSON generatedAt: ${generatedAt}` : '',
  snapshotGeneratedAt ? `visit snapshot generatedAt: ${snapshotGeneratedAt}` : '',
  sitemapLastmod ? `visit sitemap lastmod: ${sitemapLastmod}` : '',
  'visit bron: kalanera.gr snapshot (geen directe fetch naar externe site)',
  '',
  '=== Samenvatting ===',
  `kalanera.gr actief: ${kalanera.length}`,
  `externe directory URL's: ${visitDeduped.length}`,
  `Overlap (match): ${matched.length}`,
  `Alleen kalanera.gr: ${onlyKalanera.length}`,
  `Alleen externe directory (uniek): ${onlyVisit.length}`,
  partial.length ? `Gedeeltelijke overlap (Oceanis): ${partial.length}` : '',
  visitFetchFailed ? 'Dekking: n.v.t. (snapshot ontbreekt)' : `Dekking: ${coveragePct}%`,
  '',
  visitFetchFailed ? 'Status: FETCH ERROR' : (ok ? 'Status: OK' : 'Status: AANDACHTSPUNTEN'),
];

if (!visitFetchFailed) {
  lines.push('');
  lines.push('=== Shadow Google Sheet ===');
  lines.push(`Nieuw toe te voegen: ${sheetCandidates.length}`);
  if (sheetCandidates.length) {
    for (const c of sheetCandidates) lines.push(`  + ${c.Name} (${c.Category})`);
  }
  if (sheetSkipped.length) {
    lines.push(`Overgeslagen (al in sheet/kalanera): ${sheetSkipped.length}`);
    for (const s of sheetSkipped) lines.push(`  = ${s}`);
  }
}

if (issues.length) {
  lines.push('');
  issues.forEach((msg) => lines.push(msg.startsWith('FAIL') || msg.startsWith('WARN') ? msg : `WARN  ${msg}`));
}

if (!visitFetchFailed) {
  lines.push('');
  lines.push(`=== Overlap (${matched.length}) ===`);
  for (const m of matched.sort((a, b) => a.k.category.localeCompare(b.k.category) || a.k.name.localeCompare(b.k.name))) {
    lines.push(`OK    ${m.k.name} (${m.k.category}) ↔ ${m.v.title}`);
  }

  if (partial.length) {
    lines.push('');
    lines.push('=== Gedeeltelijke overlap ===');
    const oceanisMatch = matched.find((m) => m.k.norm.includes('oceanis rentals'));
    if (oceanisMatch) lines.push(`OK    ${oceanisMatch.k.name} ↔ ${oceanisMatch.v.title}`);
    for (const p of partial) lines.push(`WARN  ${p.k.name} — geen aparte externe pagina`);
  }

  lines.push('');
  lines.push(`=== Alleen op kalanera.gr (${onlyKalanera.length}) ===`);
  let prevCat = null;
  for (const k of onlyKalanera.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))) {
    if (k.category !== prevCat) {
      lines.push(`— ${k.category} —`);
      prevCat = k.category;
    }
    const el = k.nameEl ? ` (${k.nameEl})` : '';
    lines.push(`  ${k.name}${el} — ${k.location}`);
  }

  lines.push('');
  lines.push(`=== Alleen op externe directory (${onlyVisit.length}) ===`);
  for (const v of onlyVisit.sort((a, b) => a.title.localeCompare(b.title))) {
    lines.push(`  ${v.title}`);
  }
}

lines.push('');
lines.push(`Repo-doc: ${CONFIG.reportDocPath}`);

let subject;
if (visitFetchFailed) {
  subject = '[kalanera] Directory-vergelijking — snapshot ontbreekt';
} else if (sheetCandidates.length > 0) {
  subject = `[kalanera] Directory-vergelijking — ${sheetCandidates.length} nieuw in shadow sheet`;
} else if (!ok) {
  subject = `[kalanera] Directory-vergelijking — ${matched.length}/${kalanera.length} (${coveragePct}%)`;
} else {
  subject = `[kalanera] Directory-vergelijking — ${matched.length}/${kalanera.length} overlap (${coveragePct}%)`;
}

const body = lines.filter(Boolean).join('\n');

return [{
  json: {
    ok,
    alert: !ok || sheetCandidates.length > 0,
    fetchFailed: visitFetchFailed,
    visitSource: 'kalanera-snapshot',
    kalaneraActive: kalanera.length,
    visitPages: visitDeduped.length,
    matched: matched.length,
    onlyKalanera: onlyKalanera.length,
    onlyVisit: onlyVisit.length,
    coveragePct: visitFetchFailed ? null : coveragePct,
    snapshotGeneratedAt,
    sitemapLastmod,
    generatedAt,
    issues,
    sheetCandidates,
    sheetSkipped,
    sheetCandidatesCount: sheetCandidates.length,
    shadowSheetDocumentId: CONFIG.shadowSheetDocumentId,
    subject,
    body,
    bodyHtml: toBodyHtml(lines.filter(Boolean)),
  },
}];
