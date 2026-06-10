/**
 * Add Google Play badges + updated install copy site-wide.
 * Run from repo root: node scripts/patch-play-store-promo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.kalanera.app';

const COPY = {
  en: {
    installNoteOld: 'Free · Browser install · Not in App Store or Google Play',
    installNoteNew: 'Free · Google Play or browser install',
    playAria: 'Get Kala Nera Guide on Google Play',
    playAlt: 'Get it on Google Play',
    heroLabel: 'Also on Google Play',
    playTrust: 'Official app on Google Play · Free · Verified by Google',
    divider: 'or install via Chrome',
    desktopPlay: 'Android users can also install from <strong>Google Play</strong> — safe and verified.',
  },
  el: {
    installNoteOld: 'Δωρεάν · Μέσω browser · Όχι App Store ή Google Play',
    installNoteNew: 'Δωρεάν · Google Play ή browser',
    playAria: 'Λήψη Οδηγού Καλών Νερών από το Google Play',
    playAlt: 'Διαθέσιμο στο Google Play',
    heroLabel: 'Διαθέσιμο στο Google Play',
    playTrust: 'Επίσημη εφαρμογή στο Google Play · Δωρεάν · Επαληθευμένη από Google',
    divider: 'ή εγκατάσταση μέσω Chrome',
    desktopPlay: 'Για Android μπορείτε επίσης από το <strong>Google Play</strong> — ασφαλές και επαληθευμένο.',
  },
};

function playBadgeHtml(prefix, lang, variant = 'footer') {
  const L = COPY[lang];
  const cls =
    variant === 'footer'
      ? 'play-store-badge play-store-badge--footer js-play-store-promo js-play-store-android'
      : 'play-store-badge play-store-badge--landing';
  const w = variant === 'landing' ? 155 : 135;
  const h = variant === 'landing' ? 60 : 40;
  const loading = variant === 'landing' ? 'eager' : 'lazy';
  return `<a href="${PLAY_URL}" class="${cls}" target="_blank" rel="noopener noreferrer" aria-label="${L.playAria}"><img src="${prefix}pix/google-play-badge-${lang}.png" width="${w}" height="${h}" alt="${L.playAlt}" loading="${loading}"></a>`;
}

function patchFooterInstallStrip(html, prefix, lang) {
  const L = COPY[lang];
  if (html.includes('play-store-badge')) return html;
  if (!html.includes(L.installNoteOld) && !html.includes(L.installNoteNew)) return html;

  html = html.replaceAll(L.installNoteOld, L.installNoteNew);
  const badge = playBadgeHtml(prefix, lang, 'footer');
  html = html.replace(
    /(<div class="footer-install-strip">)\s*/i,
    `$1\n${badge}\n`
  );
  return html;
}

function patchInstallAndroidCard(html, lang) {
  const L = COPY[lang];
  if (html.includes('install-landing-play-store')) return html;

  const badge = playBadgeHtml('', lang, 'landing');
  const block = `${badge}
            <p class="install-landing-play-trust">${L.playTrust}</p>
            </div>
            <p class="install-landing-divider" aria-hidden="true"><span>${L.divider}</span></p>`;

  return html.replace(
    /(<p class="install-landing-lead">[\s\S]*?<\/p>)\s*(<button type="button" id="install-landing-btn")/,
    `$1
            <div class="install-landing-play-store">
            ${block}
            $2`
  );
}

function patchInstallDesktopCard(html, lang) {
  const L = COPY[lang];
  if (html.includes('install-landing-desktop-play')) return html;

  return html.replace(
    /(<div class="install-landing-card" data-install-ui="desktop">[\s\S]*?<p class="install-landing-lead">[\s\S]*?<\/p>)/,
    `$1
            <p class="install-landing-desktop-play">${L.desktopPlay}</p>`
  );
}

function patchIndexHero(html, lang) {
  const L = COPY[lang];
  if (html.includes('hero-play-strip')) return html;

  const block = `
        <div class="hero-play-strip js-play-store-promo js-play-store-android">
            <p class="hero-play-strip__label">${L.heroLabel}</p>
            ${playBadgeHtml('', lang, 'footer').replace('play-store-badge--footer', 'play-store-badge--hero')}
        </div>`;

  return html.replace(
    /(<p class="hero-hub-cta">[\s\S]*?<\/p>)/,
    `$1${block}`
  );
}

function patchN8nTemplate() {
  const fp = path.join(root, 'n8n', 'n8n-business-page-template.js');
  let js = fs.readFileSync(fp, 'utf8');
  if (js.includes('play-store-badge')) {
    console.log('n8n template: already patched');
    return false;
  }

  js = js.replaceAll(COPY.en.installNoteOld, COPY.en.installNoteNew);
  js = js.replaceAll(COPY.el.installNoteOld, COPY.el.installNoteNew);

  const playLine = `<a href="${PLAY_URL}" class="play-store-badge play-store-badge--footer js-play-store-promo js-play-store-android" target="_blank" rel="noopener noreferrer" aria-label="\${escapeHtml(isGreek ? '${COPY.el.playAria}' : '${COPY.en.playAria}')}"><img src="../\${isGreek ? 'pix/google-play-badge-el.png' : 'pix/google-play-badge-en.png'}" width="135" height="40" alt="\${escapeHtml(isGreek ? '${COPY.el.playAlt}' : '${COPY.en.playAlt}')}" loading="lazy"></a>`;
  js = js.replace(
    /(<div class="footer-install-strip">\s*\n\s*)<a href="\.\.\/\$\{isGreek \? 'install-el\.html'/,
    `$1${playLine}\n          <a href="../\${isGreek ? 'install-el.html'`
  );

  fs.writeFileSync(fp, js, 'utf8');
  return true;
}

function collectHtmlFiles(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    const st = fs.statSync(fp);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.git') continue;
      collectHtmlFiles(fp, acc);
    } else if (name.endsWith('.html')) acc.push(fp);
  }
  return acc;
}

function detectLang(rel, html) {
  if (rel.endsWith('-el.html') || rel === 'install-el.html') return 'el';
  if (/<html[^>]*\slang=["']el["']/i.test(html)) return 'el';
  if (html.includes('Ιστότοπος') || html.includes('Κοινωνικά')) return 'el';
  return 'en';
}

let changed = 0;
for (const fp of collectHtmlFiles(root)) {
  const rel = path.relative(root, fp).replace(/\\/g, '/');
  if (rel.startsWith('dev/') || rel.startsWith('n8n/')) continue;

  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  const lang = detectLang(rel, html);
  const prefix = rel.startsWith('business/') ? '../' : '';

  html = patchFooterInstallStrip(html, prefix, lang);

  if (rel === 'install.html' || rel === 'install-el.html') {
    html = patchInstallAndroidCard(html, lang);
    html = patchInstallDesktopCard(html, lang);
  }
  if (rel === 'index.html' || rel === 'index-el.html') {
    html = patchIndexHero(html, lang);
  }

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    changed++;
    console.log('patched:', rel);
  }
}

if (patchN8nTemplate()) console.log('patched: n8n/n8n-business-page-template.js');
console.log(`Done. ${changed} HTML file(s) updated.`);
