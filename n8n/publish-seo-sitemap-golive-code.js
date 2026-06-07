/**
 * n8n Code node: Go live — lees goedgekeurde draft, push naar live bestandsnamen.
 */
/* __SHARED__ */

const sd = $getWorkflowStaticData('global');
const draft = sd[DRAFT_KEY];

if (!draft || !draft.liveFiles) {
  throw new Error('Geen preview-draft — run eerst "Manual — Preview (SEO + sitemap)"');
}

if (draft.expiresAt && Date.parse(draft.expiresAt) < Date.now()) {
  throw new Error(`Draft verlopen (${draft.expiresAt}) — run Preview opnieuw`);
}

const { liveFiles, meta, generatedAt } = draft;

for (const [fileName, html] of Object.entries(liveFiles)) {
  if (fileName.endsWith('.html')) {
    validatePatchedHtml(html, fileName);
  } else if (fileName.endsWith('.xml') && /\\n/.test(html)) {
    throw new Error('sitemap.xml: letterlijke \\\\n in draft');
  }
}

const publishedAt = new Date().toISOString();
const summary = { ...meta, generatedAt, publishedAt, phase: 'live' };

return [
  toLiveFileItem('indexEn', liveFiles[LIVE_FILES.indexEn], summary),
  toLiveFileItem('indexEl', liveFiles[LIVE_FILES.indexEl], summary),
  toLiveFileItem('sitemap', liveFiles[LIVE_FILES.sitemap], summary),
];
