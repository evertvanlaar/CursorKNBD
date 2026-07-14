#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const REPLACEMENTS = [
  [
    'E-Project all rights reserved. · <span class="footer-powered-inline">Powered by <a href="mailto:info@spiti.tech">KanteKlik</a></span>',
    'E-Project all rights reserved - Developed by Evert van Laar',
  ],
  [
    'E-Project όλα τα δικαιώματα διατηρούνται. · <span class="footer-powered-inline">Με την υποστήριξη <a href="mailto:info@spiti.tech">KanteKlik</a></span>',
    'E-Project όλα τα δικαιώματα διατηρούνται - Developed by Evert van Laar',
  ],
  [
    'E-Project όλα τα δικαιώματα διατηρούνται. — <span class="footer-powered-inline">Powered by <a href="mailto:info@spiti.tech">KanteKlik</a></span>',
    'E-Project όλα τα δικαιώματα διατηρούνται - Developed by Evert van Laar',
  ],
];

function walk(dir, changed = []) {
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    const st = fs.statSync(fp);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.git' || name === 'dev') continue;
      walk(fp, changed);
    } else if (name.endsWith('.html')) {
      let html = fs.readFileSync(fp, 'utf8');
      let next = html;
      for (const [from, to] of REPLACEMENTS) next = next.split(from).join(to);
      if (next !== html) {
        fs.writeFileSync(fp, next, 'utf8');
        changed.push(path.relative(ROOT, fp));
      }
    }
  }
  return changed;
}

const changed = walk(ROOT);
console.log(`Updated ${changed.length} HTML file(s).`);
