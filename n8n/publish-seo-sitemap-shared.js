/**
 * Gedeelde logica voor SEO + sitemap (n8n preview + go-live).
 * Wordt ingesloten door build-publish-seo-sitemap-workflow.mjs — niet direct in n8n plakken.
 */
const SITE_ORIGIN = 'https://www.kalanera.gr';

/** Zelfde repo als GitHub Push1 — index-bron voor preview (niet live site). */
const GITHUB = {
  owner: 'evertvanlaar',
  repo: 'VisualStudioCode',
  branch: 'main',
};

/** Live bestanden op GitHub Pages (alleen bij Go live). */
const LIVE_FILES = {
  indexEn: 'index.html',
  indexEl: 'index-el.html',
  sitemap: 'sitemap.xml',
};

/** Preview/draft — repo-root, andere naam dan live; test-URL’s werken met zelfde CSS/JS-paden. */
const DRAFT_FILES = {
  indexEn: 'index.seo-draft.html',
  indexEl: 'index-el.seo-draft.html',
  sitemap: 'sitemap.seo-draft.xml',
};

/** Lokaal testen — nooit naar GitHub/site (zie .gitignore). */
const LOCAL_TEST_ORIGIN = 'http://localhost:5501';

function localDraftTestUrls() {
  return {
    indexEn: `${LOCAL_TEST_ORIGIN}/${DRAFT_FILES.indexEn}`,
    indexEl: `${LOCAL_TEST_ORIGIN}/${DRAFT_FILES.indexEl}`,
    sitemap: `${LOCAL_TEST_ORIGIN}/${DRAFT_FILES.sitemap}`,
  };
}

/** @deprecated alias */
const REPO_FILES = LIVE_FILES;

const DRAFT_KEY = 'seoDraft';
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_ACTIVE_BUSINESSES = 50;

const MARKERS = [
  ['N8N_SCHEMA_START', 'N8N_SCHEMA_END'],
  ['N8N_SEO_START', 'N8N_SEO_END'],
];

const LOC_DICT = {
  'Kala Nera': 'Καλά Νερά',
  'Kato Gatzea': 'Κάτω Γατζέα',
  'Ano Gatzea': 'Άνω Γατζέα',
  Koropi: 'Κορώπη',
  Milies: 'Μηλιές',
  Vizitsa: 'Βυζίτσα',
  Afissos: 'Αφήσσος',
};

const categoryLabelEN = {
  Camp: 'Camping & Caravan site',
  Drink: 'Bar & Café',
  Eat: 'Restaurant & Taverna',
  Other: 'Local Business',
  Rent: 'Rental Service',
  Shop: 'Local Shop & Boutique',
  Sleep: 'Hotel & Accommodation',
  Travel: 'Travel Agency & Tours',
};

const categoryLabelEL = {
  Camp: 'Κάμπινγκ',
  Drink: 'Μπαρ & Καφετέρια',
  Eat: 'Εστιατόριο & Ταβέρνα',
  Other: 'Τοπική Επιχείρηση',
  Rent: 'Υπηρεσία Ενοικίασης',
  Shop: 'Τοπικό Κατάστημα',
  Sleep: 'Ξενοδοχείο & Διαμονή',
  Travel: 'Ταξιδιωτικό Γραφείο',
};

const CATEGORY_ORDER = ['Camp', 'Drink', 'Eat', 'Other', 'Rent', 'Shop', 'Sleep', 'Travel'];

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/wishlist.html', changefreq: 'monthly', priority: '0.5' },
  { path: '/index-el.html', changefreq: 'daily', priority: '1.0' },
  { path: '/install.html', changefreq: 'monthly', priority: '0.6' },
  { path: '/install-el.html', changefreq: 'monthly', priority: '0.6' },
  { path: '/wishlist-el.html', changefreq: 'monthly', priority: '0.5' },
  { path: '/bus.html', changefreq: 'monthly', priority: '0.5' },
  { path: '/bus-el.html', changefreq: 'monthly', priority: '0.5' },
  { path: '/t-form.html', changefreq: 'monthly', priority: '0.5' },
  { path: '/t-form-el.html', changefreq: 'monthly', priority: '0.5' },
  { path: '/info.html', changefreq: 'monthly', priority: '0.6' },
  { path: '/info-el.html', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy.html', changefreq: 'yearly', priority: '0.4' },
  { path: '/privacy-el.html', changefreq: 'yearly', priority: '0.4' },
  { path: '/events.html', changefreq: 'weekly', priority: '0.7' },
  { path: '/events-el.html', changefreq: 'weekly', priority: '0.7' },
  { path: '/flights.html', changefreq: 'monthly', priority: '0.6' },
  { path: '/flights-el.html', changefreq: 'monthly', priority: '0.6' },
  { path: '/useful-numbers.html', changefreq: 'monthly', priority: '0.5' },
  { path: '/useful-numbers-el.html', changefreq: 'monthly', priority: '0.5' },
];

function githubRawUrl(fileName) {
  return `https://raw.githubusercontent.com/${GITHUB.owner}/${GITHUB.repo}/${GITHUB.branch}/${fileName}`;
}

const slugFromName = (name) =>
  String(name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const jsonLdEmbed = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const absoluteAssetUrl = (photoField) => {
  const fallback = `${SITE_ORIGIN}/pix/nophoto.jpg`;
  const raw = String(photoField ?? '').trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw)) {
    if (/^https?:\/\/(www\.)?kalanera\.gr\b/i.test(raw)) {
      return raw.replace(/^https?:\/\/(www\.)?kalanera\.gr\b/i, SITE_ORIGIN);
    }
    return raw;
  }
  let assetPath = raw.replace(/^(\.\.\/)+/, '').replace(/^\/+/, '');
  if (!assetPath.startsWith('pix/')) {
    assetPath = assetPath.replace(/^pix\/?/, '');
    assetPath = `pix/${assetPath}`;
  }
  return `${SITE_ORIGIN}/${assetPath}`;
};

const telForLd = (p) => {
  const s = String(p ?? '').trim();
  if (!s || s === '-') return '';
  return s;
};

const locEn = (locRaw) => String(locRaw ?? 'Kala Nera').trim() || 'Kala Nera';
const locEl = (locRaw) => LOC_DICT[locEn(locRaw)] ?? locEn(locRaw);

function sheetStatus(row) {
  return String(row?.Status ?? row?.status ?? row?.STATUS ?? '').trim().toLowerCase();
}

function categoryRank(cat) {
  const key = String(cat ?? 'Other').trim() || 'Other';
  const idx = CATEGORY_ORDER.indexOf(key);
  return idx === -1 ? CATEGORY_ORDER.indexOf('Other') : idx;
}

function parseDatum(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (!m) return null;
  const [, day, month, year] = m;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function businessLastmod(biz) {
  return parseDatum(biz.Datum) || new Date().toISOString().slice(0, 10);
}

function markerPresent(html, tag) {
  return html.includes(`<!-- ${tag} -->`);
}

function assertMarkers(html, label) {
  const missing = [];
  for (const [start, end] of MARKERS) {
    if (!markerPresent(html, start)) missing.push(`${label}: ${start}`);
    if (!markerPresent(html, end)) missing.push(`${label}: ${end}`);
  }
  if (missing.length) {
    throw new Error(`HTML-markers ontbreken — ${missing.join(', ')}`);
  }
}

/** Voorkomt zichtbare \\n op de site (veelvoorkomende fout bij verkeerd escapen). */
function assertNoLiteralBackslashN(html, label) {
  if (/\\n/.test(html)) {
    throw new Error(`${label}: letterlijke \\\\n in output (zou zichtbaar op site)`);
  }
  if (/\\u003c/i.test(html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, ''))) {
    throw new Error(`${label}: verdachte \\\\u-escape buiten JSON-LD`);
  }
}

function assertJsonLd(html, label) {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (!m) throw new Error(`${label}: geen JSON-LD script gevonden na patch`);
  try {
    JSON.parse(m[1]);
  } catch (e) {
    throw new Error(`${label}: JSON-LD parse error — ${e.message}`);
  }
}

function replaceBetweenMarkers(source, startTag, endTag, newContent) {
  const start = `<!-- ${startTag} -->`;
  const end = `<!-- ${endTag} -->`;
  const startIdx = source.indexOf(start);
  const endIdx = source.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Markers ${startTag} / ${endTag} niet gevonden`);
  }
  return source.slice(0, startIdx + start.length) + '\n' + newContent + '\n' + source.slice(endIdx);
}

function applyBlocks(html, schemaScript, seoSection) {
  let out = replaceBetweenMarkers(html, 'N8N_SCHEMA_START', 'N8N_SCHEMA_END', schemaScript);
  out = replaceBetweenMarkers(out, 'N8N_SEO_START', 'N8N_SEO_END', seoSection);
  return out;
}

function validatePatchedHtml(html, label) {
  assertMarkers(html, label);
  assertNoLiteralBackslashN(html, label);
  assertJsonLd(html, label);
}

function staticUrlBlock({ path: pagePath, changefreq, priority }) {
  const loc = pagePath === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${pagePath}`;
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function businessUrlBlock(loc, lastmod) {
  return [
    '    <url>',
    `        <loc>${loc}</loc>`,
    `        <lastmod>${lastmod}</lastmod>`,
    '        <priority>0.8</priority>',
    '    </url>',
  ].join('\n');
}

function buildSeoBlocks(rows) {
  const itemListElement = [];
  const liFragmentsEN = [];
  const liFragmentsEL = [];
  let position = 0;

  for (const biz of rows) {
    position += 1;
    const nameEN = String(biz.Name ?? '').trim();
    const nameELDisplay = String(biz.Name_EL ?? biz.Name_el ?? '').trim() || nameEN;
    const slug = slugFromName(biz.Name);
    if (!nameEN || !slug) continue;

    const catKey = String(biz.Category ?? 'Other').trim() || 'Other';
    const fullCatEN = categoryLabelEN[catKey] ?? categoryLabelEN.Other;
    const fullCatEL = categoryLabelEL[catKey] ?? categoryLabelEL.Other;
    const locationEN = locEn(biz.Location);
    const locationEL = locEl(biz.Location);
    const tel = telForLd(biz.Phone);
    const pageEN = `${SITE_ORIGIN}/business/${slug}.html`;
    const pageEL = `${SITE_ORIGIN}/business/${slug}-el.html`;

    const lb = {
      '@type': 'LocalBusiness',
      name: nameEN,
      url: pageEN,
      image: absoluteAssetUrl(biz.PhotoURL),
      address: {
        '@type': 'PostalAddress',
        addressLocality: locationEN,
        addressRegion: 'Pelion',
        postalCode: '37010',
        addressCountry: 'GR',
      },
    };

    const altEl = String(biz.AlternateName_el ?? biz.AlternateName ?? '').trim();
    const useAlt =
      altEl && altEl !== nameEN ? altEl : nameELDisplay !== nameEN ? nameELDisplay : '';
    if (useAlt) lb.alternateName = useAlt;
    if (tel) lb.telephone = tel;

    itemListElement.push({ '@type': 'ListItem', position, item: lb });

    const phraseEN = `${escapeHtml(nameEN)} — ${fullCatEN} in ${escapeHtml(locationEN)}, Pelion.`;
    const phraseEL = `«${escapeHtml(nameELDisplay)}» · ${escapeHtml(fullCatEL)} · ${escapeHtml(locationEL)}, Πήλιο.`;

    liFragmentsEN.push(
      `<li><h3 style="display:inline; font-size:inherit; margin:0;"><a href="${escapeHtml(pageEN)}">${escapeHtml(nameEN)}</a></h3><span> - ${phraseEN}</span></li>`,
    );
    liFragmentsEL.push(
      `<li><h3 style="display:inline; font-size:inherit; margin:0;"><a href="${escapeHtml(pageEL)}">${escapeHtml(nameELDisplay)}</a></h3><span> — ${phraseEL}</span></li>`,
    );
  }

  const schemaScript = `<script type="application/ld+json">${jsonLdEmbed({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement,
  })}</script>`;

  const htmlSectionEN = `<section id="seo-directory" style="display:none;" aria-hidden="true"><h2>Local Businesses in Kala Nera</h2><ul>${liFragmentsEN.join('')}</ul></section>`;
  const htmlSectionEL = `<section id="seo-directory" style="display:none;" aria-hidden="true"><h2>Επιχειρήσεις στα Καλά Νερά</h2><ul>${liFragmentsEL.join('')}</ul></section>`;

  return { schemaScript, htmlSectionEN, htmlSectionEL, count: rows.length };
}

function buildSitemapXml(rows) {
  const slugs = rows
    .map((biz) => ({
      slug: slugFromName(biz.Name),
      lastmod: businessLastmod(biz),
      name: String(biz.Name ?? '').trim(),
    }))
    .filter((b) => b.slug && b.name)
    .sort((a, b) => a.slug.localeCompare(b.slug, 'en'));

  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...STATIC_PAGES.map((p) => staticUrlBlock(p)),
  ];

  for (const biz of slugs) {
    parts.push(businessUrlBlock(`${SITE_ORIGIN}/business/${biz.slug}.html`, biz.lastmod));
    parts.push(businessUrlBlock(`${SITE_ORIGIN}/business/${biz.slug}-el.html`, biz.lastmod));
  }

  parts.push('</urlset>', '');
  return { xml: parts.join('\n'), businessCount: slugs.length, urlCount: STATIC_PAGES.length + slugs.length * 2 };
}

async function fetchText(ctx, url) {
  return await ctx.helpers.httpRequest({
    method: 'GET',
    url,
    encoding: 'utf8',
    returnFullResponse: false,
    timeout: 60000,
    headers: {
      Accept: 'text/html,application/xml,text/plain,*/*',
      'User-Agent': 'kalanera-n8n-seo-publish/2.0',
    },
  });
}

async function fetchIndexHtml(ctx, fileName) {
  const githubUrl = githubRawUrl(fileName);
  try {
    const text = await fetchText(ctx, githubUrl);
    if (text && String(text).length > 500) {
      return { source: 'github', url: githubUrl, html: String(text) };
    }
  } catch {
    /* fallback live */
  }
  const liveUrl = `${SITE_ORIGIN}/${fileName}`;
  const text = await fetchText(ctx, liveUrl);
  return { source: 'live', url: liveUrl, html: String(text) };
}

function loadActiveRows(inputItems) {
  const allRows = inputItems.map((i) => i.json).filter(Boolean);
  const active = allRows.filter((r) => sheetStatus(r) === 'active');
  active.sort((a, b) => {
    const byCat = categoryRank(a.Category) - categoryRank(b.Category);
    if (byCat !== 0) return byCat;
    return String(a.Name).localeCompare(String(b.Name), 'en');
  });
  if (!active.length) {
    throw new Error('Geen Active rijen in Sheet — controleer Status-kolom');
  }
  if (active.length < MIN_ACTIVE_BUSINESSES) {
    throw new Error(`Slechts ${active.length} Active rijen (min ${MIN_ACTIVE_BUSINESSES}) — abort`);
  }
  return active;
}

function toFileItem(fileName, htmlContent, meta, extra = {}) {
  return {
    json: {
      fileName,
      htmlContent,
      byteSize: Buffer.byteLength(htmlContent, 'utf8'),
      ...meta,
      ...extra,
    },
  };
}

function toDraftFileItem(role, htmlContent, meta) {
  return toFileItem(DRAFT_FILES[role], htmlContent, meta, {
    liveFileName: LIVE_FILES[role],
    phase: 'preview',
  });
}

function toLiveFileItem(role, htmlContent, meta) {
  return toFileItem(LIVE_FILES[role], htmlContent, meta, { phase: 'live' });
}

async function buildPatchedBundle(ctx, active) {
  const { schemaScript, htmlSectionEN, htmlSectionEL, count: seoCount } = buildSeoBlocks(active);
  const { xml: sitemapXml, businessCount, urlCount } = buildSitemapXml(active);

  const [enSrc, elSrc] = await Promise.all([
    fetchIndexHtml(ctx, LIVE_FILES.indexEn),
    fetchIndexHtml(ctx, LIVE_FILES.indexEl),
  ]);

  assertMarkers(enSrc.html, 'index.html (vóór patch)');
  assertMarkers(elSrc.html, 'index-el.html (vóór patch)');

  const patchedIndexEn = applyBlocks(enSrc.html, schemaScript, htmlSectionEN);
  const patchedIndexEl = applyBlocks(elSrc.html, schemaScript, htmlSectionEL);

  validatePatchedHtml(patchedIndexEn, 'index.html');
  validatePatchedHtml(patchedIndexEl, 'index-el.html');

  if (/\\n/.test(sitemapXml)) {
    throw new Error('sitemap.xml: letterlijke \\\\n in output');
  }

  const liveFiles = {
    [LIVE_FILES.indexEn]: patchedIndexEn,
    [LIVE_FILES.indexEl]: patchedIndexEl,
    [LIVE_FILES.sitemap]: sitemapXml,
  };

  const draftFiles = {
    [DRAFT_FILES.indexEn]: patchedIndexEn,
    [DRAFT_FILES.indexEl]: patchedIndexEl,
    [DRAFT_FILES.sitemap]: sitemapXml,
  };

  return {
    liveFiles,
    draftFiles,
    meta: {
      seoBusinessCount: seoCount,
      sitemapBusinessCount: businessCount,
      sitemapUrlCount: urlCount,
      indexSources: { en: enSrc.source, el: elSrc.source },
      draftFileNames: Object.values(DRAFT_FILES),
      liveFileNames: Object.values(LIVE_FILES),
      testUrls: localDraftTestUrls(),
    },
  };
}
