/**
 * n8n Code node: Preview — build + validatie, draft in n8n (geen GitHub).
 * Daarna lokaal: node scripts/fetch-seo-draft-from-n8n.mjs → bestanden in Verkenner.
 */
/* __SHARED__ */

const active = loadActiveRows($input.all());
const bundle = await buildPatchedBundle(this, active);

const sd = $getWorkflowStaticData('global');
const generatedAt = new Date().toISOString();
const expiresAt = new Date(Date.now() + DRAFT_MAX_AGE_MS).toISOString();
sd[DRAFT_KEY] = {
  generatedAt,
  expiresAt,
  liveFiles: bundle.liveFiles,
  draftFiles: bundle.draftFiles,
  meta: bundle.meta,
};

const testUrls = localDraftTestUrls();

return [
  {
    json: {
      ok: true,
      phase: 'preview',
      message:
        'Draft opgeslagen in n8n. Run nu lokaal: node scripts/fetch-seo-draft-from-n8n.mjs — dan staan de 3 *-seo-draft.* bestanden in Verkenner.',
      generatedAt,
      expiresAt,
      ...bundle.meta,
      testUrls,
      localCommand: 'node scripts/fetch-seo-draft-from-n8n.mjs',
      files: [
        {
          draftFileName: DRAFT_FILES.indexEn,
          liveFileName: LIVE_FILES.indexEn,
          testUrl: testUrls.indexEn,
        },
        {
          draftFileName: DRAFT_FILES.indexEl,
          liveFileName: LIVE_FILES.indexEl,
          testUrl: testUrls.indexEl,
        },
        {
          draftFileName: DRAFT_FILES.sitemap,
          liveFileName: LIVE_FILES.sitemap,
          testUrl: testUrls.sitemap,
        },
      ],
      nextStep: 'node scripts/fetch-seo-draft-from-n8n.mjs → test op localhost:5501 → Manual Go live',
    },
  },
];
