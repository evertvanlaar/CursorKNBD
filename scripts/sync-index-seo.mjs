#!/usr/bin/env node
/**
 * Vul index.html / index-el.html SEO-blokken vanuit data/local-businesses.json.
 * Zelfde output als n8n/generate-index-seo-blocks.js (geen handmatig plakken meer).
 *
 * Markers:
 *   N8N_SCHEMA_START/END  — in index.html én index-el.html (zelfde ItemList)
 *   N8N_SEO_START/END     — EN in index.html, EL in index-el.html
 *
 * Gebruik:
 *   node scripts/sync-index-seo.mjs
 *   node scripts/sync-index-seo.mjs --check
 *   node scripts/sync-index-seo.mjs --draft   # lokaal test (localhost:5501)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { slugFromName } from './sync-sitemap.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_PATH = path.join(ROOT, 'data', 'local-businesses.json');
const BUSINESS_DIR = path.join(ROOT, 'business');
const INDEX_EN = path.join(ROOT, 'index.html');
const INDEX_EL = path.join(ROOT, 'index-el.html');
const SITE_ORIGIN = 'https://www.kalanera.gr';

const checkOnly = process.argv.includes('--check');
const draftMode = process.argv.includes('--draft');
const INDEX_EN_OUT = draftMode ? path.join(ROOT, 'index.seo-draft.html') : INDEX_EN;
const INDEX_EL_OUT = draftMode ? path.join(ROOT, 'index-el.seo-draft.html') : INDEX_EL;

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

function categoryRank(cat) {
  const key = String(cat ?? 'Other').trim() || 'Other';
  const idx = CATEGORY_ORDER.indexOf(key);
  return idx === -1 ? CATEGORY_ORDER.indexOf('Other') : idx;
}

function loadActiveBusinesses() {
  const businesses = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const active = businesses.filter((b) => String(b.Status ?? '').trim().toLowerCase() === 'active');
  const warnings = [];
  const included = [];

  for (const biz of active) {
    const name = String(biz.Name ?? '').trim();
    if (!name) continue;

    const slug = slugFromName(name);
    if (!slug) continue;

    const enPath = path.join(BUSINESS_DIR, `${slug}.html`);
    const elPath = path.join(BUSINESS_DIR, `${slug}-el.html`);
    if (!fs.existsSync(enPath) || !fs.existsSync(elPath)) {
      warnings.push(`overgeslagen (geen EN+EL HTML): ${name}`);
      continue;
    }

    included.push(biz);
  }

  included.sort((a, b) => {
    const byCat = categoryRank(a.Category) - categoryRank(b.Category);
    if (byCat !== 0) return byCat;
    return String(a.Name).localeCompare(String(b.Name), 'en');
  });

  return { included, warnings };
}

function buildBlocks(rows) {
  const itemListElement = [];
  const liFragmentsEN = [];
  const liFragmentsEL = [];

  let position = 0;
  for (const biz of rows) {
    position += 1;
    const nameEN = String(biz.Name ?? '').trim();
    const nameELDisplay = String(biz.Name_EL ?? biz.Name_el ?? '').trim() || nameEN;
    const slug = slugFromName(biz.Name);

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

function replaceBetweenMarkers(source, startTag, endTag, newContent) {
  const start = `<!-- ${startTag} -->`;
  const end = `<!-- ${endTag} -->`;
  const startIdx = source.indexOf(start);
  const endIdx = source.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Markers ${startTag} / ${endTag} niet gevonden`);
  }
  return `${source.slice(0, startIdx + start.length)}\n${newContent}\n${source.slice(endIdx)}`;
}

function applyBlocks(filePath, schemaScript, seoSection) {
  let html = fs.readFileSync(filePath, 'utf8');
  html = replaceBetweenMarkers(html, 'N8N_SCHEMA_START', 'N8N_SCHEMA_END', schemaScript);
  html = replaceBetweenMarkers(html, 'N8N_SEO_START', 'N8N_SEO_END', seoSection);
  return html;
}

const { included, warnings } = loadActiveBusinesses();
const { schemaScript, htmlSectionEN, htmlSectionEL, count } = buildBlocks(included);

const nextIndexEn = applyBlocks(INDEX_EN, schemaScript, htmlSectionEN);
const nextIndexEl = applyBlocks(INDEX_EL, schemaScript, htmlSectionEL);

if (warnings.length) {
  console.warn('Waarschuwingen:');
  for (const w of warnings) console.warn(`  - ${w}`);
}

console.log(`Index SEO: ${count} bedrijven → schema + verborgen lijst (EN/EL)`);

if (checkOnly) {
  const curEn = fs.readFileSync(INDEX_EN_OUT, 'utf8');
  const curEl = fs.readFileSync(INDEX_EL_OUT, 'utf8');
  if (curEn === nextIndexEn && curEl === nextIndexEl) {
    console.log(`OK — ${path.basename(INDEX_EN_OUT)} / ${path.basename(INDEX_EL_OUT)} zijn up-to-date`);
    process.exit(0);
  }
  console.error(
    `index SEO-blokken verouderd — run: node scripts/sync-index-seo.mjs${draftMode ? ' --draft' : ''}`,
  );
  process.exit(1);
}

fs.writeFileSync(INDEX_EN_OUT, nextIndexEn, 'utf8');
fs.writeFileSync(INDEX_EL_OUT, nextIndexEl, 'utf8');
console.log(`Geschreven: ${INDEX_EN_OUT}`);
console.log(`Geschreven: ${INDEX_EL_OUT}`);
