/**
 * Insert About us footer link before Privacy policy across HTML pages.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function walkHtmlFiles(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtmlFiles(p, acc);
    else if (ent.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const ABOUT_LINKS = [
  {
    test: (html) => html.includes('href="about.html"') || html.includes('href="about-el.html"') || html.includes('href="../about'),
    skip: true,
  },
  {
    re: /(<li><a href="mailto:info@spiti\.tech">[\s\S]*?<\/a><\/li>\s*)(<li><a href="privacy\.html")/g,
    insert: '$1<li><a href="about.html"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> About us</a></li>\n                            $2',
  },
  {
    re: /(<li><a href="mailto:info@spiti\.tech">[\s\S]*?<\/a><\/li>\s*)(<li><a href="privacy-el\.html")/g,
    insert: '$1<li><a href="about-el.html"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Σχετικά με εμάς</a></li>\n                            $2',
  },
  {
    re: /(<li><a href="mailto:info@spiti\.tech">[\s\S]*?<\/a><\/li>\s*)(<li><a href="\.\.\/privacy\.html")/g,
    insert: '$1<li><a href="../about.html"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> About us</a></li>\n            $2',
  },
  {
    re: /(<li><a href="mailto:info@spiti\.tech">[\s\S]*?<\/a><\/li>\s*)(<li><a href="\.\.\/privacy-el\.html")/g,
    insert: '$1<li><a href="../about-el.html"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Σχετικά με εμάς</a></li>\n            $2',
  },
];

let updated = 0;
let skipped = 0;

for (const filePath of walkHtmlFiles(root)) {
  const rel = path.relative(root, filePath).replace(/\\/g, '/');
  if (rel.startsWith('about')) continue;

  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('site-footer') || !html.includes('privacy')) continue;

  if (html.includes('about.html') || html.includes('about-el.html')) {
    skipped++;
    continue;
  }

  let next = html;
  for (const rule of ABOUT_LINKS) {
    if (rule.skip) continue;
    next = next.replace(rule.re, rule.insert);
  }

  if (next !== html) {
    fs.writeFileSync(filePath, next, 'utf8');
    updated++;
    console.log('updated', rel);
  }
}

console.log(`patch-footer-about-link: ${updated} updated, ${skipped} already had link`);
