#!/usr/bin/env node
/**
 * Genereer sitemap.xml op basis van:
 *   - vaste sitestructuur (STATIC_PAGES)
 *   - actieve bedrijven in data/local-businesses.json
 *   - aanwezige business/{slug}.html en business/{slug}-el.html
 *
 * Slug-logica: zelfde als n8n-business-page-template.js / generate-index-seo-blocks.js
 *
 * Gebruik:
 *   node scripts/sync-sitemap.mjs          # schrijf sitemap.xml
 *   node scripts/sync-sitemap.mjs --check  # exit 1 als sitemap.xml afwijkt (CI)
 *   node scripts/sync-sitemap.mjs --draft  # lokaal test (localhost:5501)
 *
 * Optioneel in GitHub Actions of na n8n business-page deploy draaien.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const JSON_PATH = path.join(ROOT, 'data', 'local-businesses.json');
const BUSINESS_DIR = path.join(ROOT, 'business');
const SITE_ORIGIN = 'https://www.kalanera.gr';

const checkOnly = process.argv.includes('--check');
const draftMode = process.argv.includes('--draft');
const SITEMAP_OUT = draftMode ? path.join(ROOT, 'sitemap.seo-draft.xml') : SITEMAP_PATH;

/** @type {{ path: string, changefreq: string, priority: string }[]} */
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

/** Zelfde slug-logica als n8n-business-page-template.js */
export function slugFromName(name) {
  return String(name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Sheet-kolom Datum → YYYY-MM-DD */
function parseDatum(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (!m) return null;
  const [, day, month, year] = m;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function fileLastmod(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return new Date(fs.statSync(filePath).mtime).toISOString().slice(0, 10);
}

function businessLastmod(biz, slug) {
  const candidates = [
    parseDatum(biz.Datum),
    fileLastmod(path.join(BUSINESS_DIR, `${slug}.html`)),
    fileLastmod(path.join(BUSINESS_DIR, `${slug}-el.html`)),
  ].filter(Boolean);
  if (!candidates.length) {
    return new Date().toISOString().slice(0, 10);
  }
  return candidates.sort().at(-1);
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

function normalizeBusinessRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.rows)) return payload.rows;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
}

function loadBusinessRows() {
  if (!fs.existsSync(JSON_PATH)) {
    throw new Error(`Missing ${path.relative(ROOT, JSON_PATH)} — run scripts/refresh-local-businesses-snapshot.mjs or seed from dev/`);
  }
  const payload = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  return normalizeBusinessRows(payload);
}

function buildSitemap() {
  const businesses = loadBusinessRows();
  const active = businesses.filter((b) => String(b.Status ?? '').trim().toLowerCase() === 'active');

  const warnings = [];
  /** @type {{ slug: string, lastmod: string, name: string }[]} */
  const included = [];

  for (const biz of active) {
    const name = String(biz.Name ?? '').trim();
    if (!name) continue;

    const slug = slugFromName(name);
    if (!slug) {
      warnings.push(`skip: lege slug voor "${name}"`);
      continue;
    }

    const enPath = path.join(BUSINESS_DIR, `${slug}.html`);
    const elPath = path.join(BUSINESS_DIR, `${slug}-el.html`);
    const hasEn = fs.existsSync(enPath);
    const hasEl = fs.existsSync(elPath);

    if (!hasEn || !hasEl) {
      warnings.push(
        `actief bedrijf zonder beide pagina's: ${name} (${slug}.html ${hasEn ? 'ok' : 'MISSING'}, ${slug}-el.html ${hasEl ? 'ok' : 'MISSING'})`,
      );
      continue;
    }

    included.push({ slug, lastmod: businessLastmod(biz, slug), name });
  }

  included.sort((a, b) => a.slug.localeCompare(b.slug, 'en'));

  const enFiles = fs
    .readdirSync(BUSINESS_DIR)
    .filter((f) => f.endsWith('.html') && !f.endsWith('-el.html'))
    .map((f) => f.replace(/\.html$/, ''));
  const activeSlugs = new Set(included.map((b) => b.slug));
  for (const slug of enFiles) {
    if (!activeSlugs.has(slug)) {
      warnings.push(`HTML-bestand zonder actief bedrijf in JSON: business/${slug}.html`);
    }
  }

  for (const page of STATIC_PAGES) {
    if (page.path === '/') continue;
    const filePath = path.join(ROOT, page.path.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      warnings.push(`statische pagina ontbreekt op schijf: ${page.path}`);
    }
  }

  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...STATIC_PAGES.map((p) => staticUrlBlock(p)),
  ];

  for (const biz of included) {
    parts.push(businessUrlBlock(`${SITE_ORIGIN}/business/${biz.slug}.html`, biz.lastmod));
    parts.push(businessUrlBlock(`${SITE_ORIGIN}/business/${biz.slug}-el.html`, biz.lastmod));
  }

  parts.push('</urlset>', '');

  return {
    xml: parts.join('\n'),
    stats: {
      staticPages: STATIC_PAGES.length,
      businesses: included.length,
      urls: STATIC_PAGES.length + included.length * 2,
      warnings,
    },
  };
}

export { buildSitemap };

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const { xml, stats } = buildSitemap();

  if (stats.warnings.length) {
    console.warn('Waarschuwingen:');
    for (const w of stats.warnings) console.warn(`  - ${w}`);
  }

  console.log(
    `Sitemap: ${stats.urls} URL's (${stats.staticPages} statisch + ${stats.businesses} bedrijven × 2 talen)`,
  );

  if (checkOnly) {
    const current = fs.existsSync(SITEMAP_OUT) ? fs.readFileSync(SITEMAP_OUT, 'utf8') : '';
    if (current === xml) {
      console.log(`OK — ${path.basename(SITEMAP_OUT)} is up-to-date`);
      process.exit(0);
    }
    console.error(
      `${path.basename(SITEMAP_OUT)} is verouderd — run: node scripts/sync-sitemap.mjs${draftMode ? ' --draft' : ''}`,
    );
    process.exit(1);
  }

  fs.writeFileSync(SITEMAP_OUT, xml, 'utf8');
  console.log(`Geschreven: ${SITEMAP_OUT}`);
}
