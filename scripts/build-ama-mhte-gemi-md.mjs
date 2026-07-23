import fs from 'fs';

const results = JSON.parse(
  fs.readFileSync('./data/ama-mhte-gemi-scan-raw.json', 'utf8')
);

const overrides = {
  'Orange Garden': {
    status: 'found',
    ama: ['1299615'],
    gemi: ['169576744000'],
    mhte: [],
    notes: [
      'Website toont ΜΑΓ 1299615 (niet letterlijk ΑΜΑ) en ΓΕΜΗ 169576744000',
    ],
    sources: ['https://www.ogkalanera.com/'],
  },
  Skourgias: {
    status: 'found',
    mhte: ['0726K112K02347-0'],
    ama: [],
    gemi: [],
    notes: ['Op de site met koppelteken: 0726Κ112Κ02347-0'],
    sources: ['https://kalanera-skourgias.gr/'],
  },
  'Olive Tree Garden': {
    status: 'found',
    mhte: ['0726K203A0141600'],
    ama: [],
    gemi: [],
    notes: [
      'Zelfde website als Camping Hellas (campinghellas.gr) — MHTE is van de camping, niet per se van het restaurant',
    ],
    sources: ['https://campinghellas.gr/'],
  },
};

for (const r of results) {
  if (overrides[r.name]) Object.assign(r, overrides[r.name]);
  if (r.mhte.length > 1) {
    r.mhte = [...new Set(r.mhte)].sort((a, b) => b.length - a.length);
    r.mhte = r.mhte.filter(
      (code, i, arr) =>
        !arr.some(
          (other, j) =>
            j !== i &&
            other.replace(/-/g, '').startsWith(code.replace(/-/g, '')) &&
            other.length > code.length
        )
    );
  }
}

const found = results.filter((r) => r.status === 'found');
const social = results.filter((r) => r.status === 'social-only');
const notFound = results.filter((r) => r.status === 'not-found');
const failed = results.filter((r) => r.status === 'fetch-failed');
const noWeb = results.filter((r) => r.status === 'no-website');

const esc = (s) => String(s || '').replace(/\|/g, '\\|');
const tick = (s) => '`' + s + '`';
const today = '2026-07-16';
const lines = [];

lines.push('# AMA / MHTE / GEMI — scan van eigen websites');
lines.push('');
lines.push(
  'Bron: websites uit `data/local-businesses.json` (Google Sheets export), categorieën **Sleep**, **Eat**, **Drink**, **Camp**.'
);
lines.push('');
lines.push('Scan-datum: ' + today);
lines.push('');
lines.push(
  '**Sheet niet aangepast.** Dit bestand is alleen een inventarisatie.'
);
lines.push('');
lines.push('## Samenvatting');
lines.push('');
lines.push('| Status | Aantal |');
lines.push('|---|---:|');
lines.push('| Nummer gevonden | ' + found.length + ' |');
lines.push('| Alleen social / booking-URL | ' + social.length + ' |');
lines.push(
  '| Website bereikbaar, geen nummer herkend | ' + notFound.length + ' |'
);
lines.push('| Website niet bereikbaar | ' + failed.length + ' |');
lines.push('| Geen bruikbare website | ' + noWeb.length + ' |');
lines.push('| **Totaal gescand** | **' + results.length + '** |');
lines.push('');
lines.push('## Gevonden nummers (voor kolom `AMA-MHTE-GEMI`)');
lines.push('');
lines.push(
  '| Naam | Categorie | Locatie | Type | Nummer | Bron |'
);
lines.push('|---|---|---|---|---|---|');

for (const r of [...found].sort((a, b) => a.name.localeCompare(b.name))) {
  const rows = [];
  for (const n of r.mhte) rows.push(['MHTE', n]);
  for (const n of r.ama) rows.push(['AMA/ΜΑΓ', n]);
  for (const n of r.gemi) rows.push(['GEMI', n]);
  const src = (r.sources && r.sources[0]) || r.scannedUrl || r.website;
  for (const [type, num] of rows) {
    lines.push(
      '| ' +
        [
          esc(r.name),
          esc(r.category),
          esc(r.location),
          type,
          tick(num),
          esc(src),
        ].join(' | ') +
        ' |'
    );
  }
}

lines.push('');
lines.push('### Suggestie voor sheet-waarde');
lines.push('');
lines.push(
  'Eén cel per ondernemer, bijv. `MHTE: 0726K011A0177800` of `GEMI: 169576744000` (of gecombineerd als beide relevant zijn).'
);
lines.push('');
lines.push('| Naam | Voorgestelde `AMA-MHTE-GEMI` waarde |');
lines.push('|---|---|');
for (const r of [...found].sort((a, b) => a.name.localeCompare(b.name))) {
  const parts = [];
  for (const n of r.mhte) parts.push('MHTE: ' + n);
  for (const n of r.ama) {
    parts.push((r.name === 'Orange Garden' ? 'ΜΑΓ: ' : 'AMA: ') + n);
  }
  for (const n of r.gemi) parts.push('GEMI: ' + n);
  lines.push('| ' + esc(r.name) + ' | ' + tick(parts.join(' | ')) + ' |');
}

lines.push('');
lines.push('### Notities bij gevonden hits');
lines.push('');
for (const r of found.filter((r) => r.notes && r.notes.length)) {
  lines.push('- **' + r.name + '**: ' + r.notes.join('; '));
}

lines.push('');
lines.push('## Website bereikbaar — geen nummer gevonden');
lines.push('');
lines.push('| Naam | Categorie | Locatie | Website |');
lines.push('|---|---|---|---|');
for (const r of [...notFound].sort((a, b) => a.name.localeCompare(b.name))) {
  lines.push(
    '| ' +
      [esc(r.name), esc(r.category), esc(r.location), esc(r.website)].join(
        ' | '
      ) +
      ' |'
  );
}

lines.push('');
lines.push('## Alleen social media / booking platform');
lines.push('');
lines.push('Geen footer-scan mogelijk via de sheet-URL.');
lines.push('');
lines.push('| Naam | Categorie | Locatie | URL |');
lines.push('|---|---|---|---|');
for (const r of [...social].sort((a, b) => a.name.localeCompare(b.name))) {
  lines.push(
    '| ' +
      [esc(r.name), esc(r.category), esc(r.location), esc(r.website)].join(
        ' | '
      ) +
      ' |'
  );
}

lines.push('');
lines.push('## Website niet bereikbaar');
lines.push('');
if (!failed.length) {
  lines.push('_Geen._');
} else {
  lines.push('| Naam | Categorie | Website |');
  lines.push('|---|---|---|');
  for (const r of failed) {
    lines.push(
      '| ' + [esc(r.name), esc(r.category), esc(r.website)].join(' | ') + ' |'
    );
  }
}

lines.push('');
lines.push('## Geen bruikbare website in sheet');
lines.push('');
if (!noWeb.length) {
  lines.push('_Geen._');
} else {
  for (const r of noWeb) {
    lines.push(
      '- **' +
        r.name +
        '** (' +
        r.category +
        ', ' +
        r.location +
        ') — websiteveld: ' +
        tick(r.website || '(leeg)')
    );
  }
}

lines.push('');
lines.push('## Methode');
lines.push('');
lines.push(
  '- Homepage + gangbare pagina’s (`/imprint`, `/privacy`, `/contact`, `/el`, `/en`, …)'
);
lines.push(
  '- Patronen: MHTE / ΜΗΤΕ / ΕΟΤ / GNTO / Operating License, AMA / ΑΜΑ / ΜΑΓ, GEMI / ΓΕΜΗ'
);
lines.push('- Griekse lookalike-letters (Κ→K, Α→A, …) genormaliseerd');
lines.push('- Raw scan-output: `data/ama-mhte-gemi-scan-raw.json`');
lines.push('- Script: `scripts/scan-ama-mhte-gemi.mjs`');
lines.push('');

fs.writeFileSync(
  './data/ama-mhte-gemi-website-scan.md',
  lines.join('\n'),
  'utf8'
);
console.log('Wrote data/ama-mhte-gemi-website-scan.md');
console.log('Found:', found.length);
