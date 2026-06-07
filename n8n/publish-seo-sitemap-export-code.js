/**
 * n8n Webhook GET: export seoDraft naar lokaal script (bestanden op schijf).
 */
const sd = $getWorkflowStaticData('global');
const draft = sd.seoDraft;

if (!draft || !draft.draftFiles) {
  throw new Error('Geen preview-draft — run eerst Manual — Preview (SEO + sitemap)');
}

if (draft.expiresAt && Date.parse(draft.expiresAt) < Date.now()) {
  throw new Error(`Draft verlopen (${draft.expiresAt}) — run Preview opnieuw`);
}

return [
  {
    json: {
      ok: true,
      generatedAt: draft.generatedAt,
      expiresAt: draft.expiresAt,
      files: draft.draftFiles,
      meta: draft.meta ?? {},
    },
  },
];
