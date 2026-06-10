/**
 * Simplify install UX: compact footer (Play badge + Play QR + iOS-only Safari link).
 * Run: node scripts/patch-install-flow-v2.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.kalanera.app';

const COPY = {
  en: {
    playAria: 'Get Kala Nera Guide on Google Play',
    playAlt: 'Get it on Google Play',
    playQrAria: 'Scan QR code — open Kala Nera Guide on Google Play',
    playQrAlt: 'QR code: Google Play — Kala Nera Guide',
    playQrLabel: 'Google Play',
    iosAria: 'Install Kala Nera Guide on iPhone via Safari',
    iosTitle: 'iPhone: add via Safari',
    iosNote: 'Free · No App Store',
    playQrFile: 'play-store-qr-en.png',
    installPage: 'install.html',
  },
  el: {
    playAria: 'Λήψη Οδηγού Καλών Νερών από το Google Play',
    playAlt: 'Διαθέσιμο στο Google Play',
    playQrAria: 'Σάρωση QR — Google Play Οδηγός Καλών Νερών',
    playQrAlt: 'QR κωδικός: Google Play — Kala Nera Guide',
    playQrLabel: 'Google Play',
    iosAria: 'Εγκατάσταση στο iPhone μέσω Safari',
    iosTitle: 'iPhone: μέσω Safari',
    iosNote: 'Δωρεάν · Χωρίς App Store',
    playQrFile: 'play-store-qr-el.png',
    installPage: 'install-el.html',
  },
};

function buildFooterInstallStrip(prefix, lang) {
  const L = COPY[lang];
  const installHref = `${prefix}${L.installPage}`;
  const playQr = `${prefix}pix/${L.playQrFile}`;
  const playBadge = `${prefix}pix/google-play-badge-${lang}.png`;
  return `<div class="footer-install-strip">
<a href="${PLAY_URL}" class="play-store-badge play-store-badge--footer js-play-store-promo js-play-store-android" target="_blank" rel="noopener noreferrer" aria-label="${L.playAria}"><img src="${playBadge}" width="135" height="40" alt="${L.playAlt}" loading="lazy"></a>
<a href="${PLAY_URL}" class="footer-install-qr footer-install-qr--play js-play-store-promo js-play-store-android" aria-label="${L.playQrAria}"><img src="${playQr}" width="72" height="72" alt="${L.playQrAlt}" loading="lazy"><span class="footer-install-qr__label">${L.playQrLabel}</span></a>
<a href="${installHref}" class="install-badge install-badge--footer install-badge--ios-only js-install-ios-promo" aria-label="${L.iosAria}"><span class="install-badge__icon" aria-hidden="true"><i class="fa-brands fa-safari"></i></span><span class="install-badge__text"><span class="install-badge__title">${L.iosTitle}</span><span class="install-badge__note">${L.iosNote}</span></span><i class="fa-solid fa-chevron-right install-badge__chevron" aria-hidden="true"></i></a>
</div>`;
}

function patchFooterStrip(html, prefix, lang) {
  const re = /<div class="footer-install-strip">[\s\S]*?<\/div>\s*(?=<\/div>\s*<div class="footer-aside">|<\/div><div class="footer-aside">|<\/div>\s*<\/div>\s*<div class="footer-aside">)/i;
  if (!re.test(html)) return html;
  return html.replace(re, buildFooterInstallStrip(prefix, lang));
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
  if (!html.includes('footer-install-strip')) continue;
  const before = html;
  const lang = detectLang(rel, html);
  const prefix = rel.startsWith('business/') ? '../' : '';
  html = patchFooterStrip(html, prefix, lang);
  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    changed++;
  }
}

// n8n template
const n8nFp = path.join(root, 'n8n', 'n8n-business-page-template.js');
let n8n = fs.readFileSync(n8nFp, 'utf8');
const n8nStripRe = /<div class="footer-install-strip">[\s\S]*?<\/div><\/div>\s*<div class="footer-aside">/;
const n8nReplacement = `<div class="footer-install-strip">
          <a href="${PLAY_URL}" class="play-store-badge play-store-badge--footer js-play-store-promo js-play-store-android" target="_blank" rel="noopener noreferrer" aria-label="\${escapeHtml(isGreek ? '${COPY.el.playAria}' : '${COPY.en.playAria}')}"><img src="../\${isGreek ? 'pix/google-play-badge-el.png' : 'pix/google-play-badge-en.png'}" width="135" height="40" alt="\${escapeHtml(isGreek ? '${COPY.el.playAlt}' : '${COPY.en.playAlt}')}" loading="lazy"></a>
          <a href="${PLAY_URL}" class="footer-install-qr footer-install-qr--play js-play-store-promo js-play-store-android" aria-label="\${escapeHtml(isGreek ? '${COPY.el.playQrAria}' : '${COPY.en.playQrAria}')}"><img src="../\${isGreek ? 'pix/play-store-qr-el.png' : 'pix/play-store-qr-en.png'}" width="72" height="72" alt="\${escapeHtml(isGreek ? '${COPY.el.playQrAlt}' : '${COPY.en.playQrAlt}')}" loading="lazy"><span class="footer-install-qr__label">\${escapeHtml(isGreek ? '${COPY.el.playQrLabel}' : '${COPY.en.playQrLabel}')}</span></a>
          <a href="../\${isGreek ? 'install-el.html' : 'install.html'}" class="install-badge install-badge--footer install-badge--ios-only js-install-ios-promo" aria-label="\${escapeHtml(isGreek ? '${COPY.el.iosAria}' : '${COPY.en.iosAria}')}"><span class="install-badge__icon" aria-hidden="true"><i class="fa-brands fa-safari"></i></span><span class="install-badge__text"><span class="install-badge__title">\${escapeHtml(isGreek ? '${COPY.el.iosTitle}' : '${COPY.en.iosTitle}')}</span><span class="install-badge__note">\${escapeHtml(isGreek ? '${COPY.el.iosNote}' : '${COPY.en.iosNote}')}</span></span><i class="fa-solid fa-chevron-right install-badge__chevron" aria-hidden="true"></i></a>
        </div></div>
      <div class="footer-aside">`;
if (n8nStripRe.test(n8n)) {
  n8n = n8n.replace(n8nStripRe, n8nReplacement);
  fs.writeFileSync(n8nFp, n8n, 'utf8');
  console.log('patched: n8n/n8n-business-page-template.js');
}

console.log(`Done. ${changed} HTML file(s) updated.`);
