import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function walk(d, acc = []) {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n);
    if (fs.statSync(p).isDirectory()) {
      if (!['node_modules', '.git'].includes(n)) walk(p, acc);
    } else if (n.endsWith('.html')) acc.push(p);
  }
  return acc;
}

let fixed = 0;
for (const fp of walk(root)) {
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  html = html.replace(
    /<\/div><\/div>(\s*)<\/div>(\s*<div class="footer-aside">)/g,
    '</div>$1</div>$2'
  );
  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    fixed++;
  }
}
console.log(`fixed ${fixed} file(s)`);
