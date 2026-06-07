#!/usr/bin/env node
/**
 * Genereer n8n/publish-seo-sitemap-workflow.example.json
 *
 *   node n8n/build-publish-seo-sitemap-workflow.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));

function embedCode(wrapperFile) {
  const shared = fs.readFileSync(path.join(dir, 'publish-seo-sitemap-shared.js'), 'utf8');
  const wrapper = fs.readFileSync(path.join(dir, wrapperFile), 'utf8');
  return wrapper.replace('/* __SHARED__ */', shared);
}

const previewCode = embedCode('publish-seo-sitemap-preview-code.js');
const goliveCode = embedCode('publish-seo-sitemap-golive-code.js');
const exportCode = fs.readFileSync(path.join(dir, 'publish-seo-sitemap-export-code.js'), 'utf8');

const previewSummaryCode = `const j = $input.first().json;
return [{ json: j }];`;

const goliveSummaryCode = `const built = $('Load draft → GitHub items').all();
const github = $input.all();
const s = built[0]?.json ?? {};
return [{
  json: {
    ok: true,
    phase: 'live',
    message: 'Live bestanden gecommit (index.html, index-el.html, sitemap.xml). GitHub Pages volgt.',
    files: built.map((b, i) => ({
      fileName: b.json.fileName,
      bytes: b.json.byteSize,
      commitUrl: github[i]?.json?.commit?.html_url ?? null,
    })),
    seoBusinessCount: s.seoBusinessCount,
    sitemapUrlCount: s.sitemapUrlCount,
    publishedAt: s.publishedAt,
  },
}];`;

const wf = {
  name: 'kalanera-publish-seo-sitemap (preview → go live)',
  nodes: [
    {
      parameters: {},
      id: 'manual-preview-001',
      name: 'Manual — Preview (SEO + sitemap)',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [-900, -120],
      notes: 'Stap 1a: draft in n8n. Daarna lokaal fetch-seo-draft-from-n8n.mjs',
    },
    {
      parameters: {},
      id: 'manual-golive-002',
      name: 'Manual — Go live (SEO + sitemap)',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [-900, 200],
      notes: 'Stap 3: index.html, index-el.html, sitemap.xml naar GitHub main.',
    },
    {
      parameters: {
        content:
          '## Stap 1 — Preview + lokaal\n\n**1a — n8n Preview** (Manual trigger)\n→ draft in workflow-geheugen\n\n**1b — lokaal** (terminal):\n`node scripts/fetch-seo-draft-from-n8n.mjs`\n→ 3 bestanden in Verkenner\n→ open op **localhost:5501**\n\nWebhook export: `GET …/webhook/seo-draft-export`\n\n**Stap 2 — Go live** → GitHub live namen\n\nDraft in `.gitignore` — niet op kalanera.gr',
        height: 480,
        width: 580,
      },
      id: 'sticky-seo-003',
      name: 'Sticky Note',
      type: 'n8n-nodes-base.stickyNote',
      typeVersion: 1,
      position: [-960, -520],
    },
    {
      parameters: {
        documentId: {
          __rl: true,
          value: '1DGtUvOvJ35MzXsZBZOPR1xzkyb0V_sMttOKcv1JBuig',
          mode: 'list',
          cachedResultName: 'localbusinesses-kalanera',
          cachedResultUrl:
            'https://docs.google.com/spreadsheets/d/1DGtUvOvJ35MzXsZBZOPR1xzkyb0V_sMttOKcv1JBuig/edit?usp=drivesdk',
        },
        sheetName: {
          __rl: true,
          value: 'REPLACE_WITH_BUSINESS_TAB_GID',
          mode: 'list',
          cachedResultName: 'REPLACE_WITH_TAB_NAME',
        },
        options: {
          outputFormatting: {
            values: {
              general: 'UNFORMATTED_VALUE',
              date: 'FORMATTED_STRING',
            },
          },
        },
      },
      id: 'sheets-seo-004',
      name: 'Google Sheets — business',
      type: 'n8n-nodes-base.googleSheets',
      typeVersion: 4.5,
      position: [-580, -120],
      credentials: {
        googleSheetsOAuth2Api: {
          id: 'REPLACE_WITH_YOUR_CREDENTIAL_ID',
          name: 'Google Sheets account',
        },
      },
    },
    {
      parameters: { mode: 'runOnceForAllItems', jsCode: previewCode },
      id: 'code-preview-005',
      name: 'Preview — build + validate + draft',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [-300, -120],
    },
    {
      parameters: { mode: 'runOnceForAllItems', jsCode: previewSummaryCode },
      id: 'code-preview-summary-006',
      name: 'Preview summary',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [0, -120],
    },
    {
      parameters: {
        path: 'seo-draft-export',
        responseMode: 'responseNode',
        options: {},
      },
      id: 'webhook-export-011',
      name: 'Webhook — seo draft export GET',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1.1,
      position: [-580, 120],
      webhookId: 'seo-draft-export',
      notes: 'Voor fetch-seo-draft-from-n8n.mjs. Workflow moet ACTIVE zijn.',
    },
    {
      parameters: { mode: 'runOnceForAllItems', jsCode: exportCode },
      id: 'code-export-012',
      name: 'Export draft JSON',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [-300, 120],
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: '={{ $json }}',
        options: {
          responseHeaders: {
            entries: [
              { name: 'Content-Type', value: 'application/json; charset=utf-8' },
              { name: 'Cache-Control', value: 'no-store' },
            ],
          },
        },
      },
      id: 'respond-export-013',
      name: 'Respond draft JSON',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [0, 120],
    },
    {
      parameters: { mode: 'runOnceForAllItems', jsCode: goliveCode },
      id: 'code-golive-007',
      name: 'Load draft → GitHub items',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [-300, 200],
    },
    {
      parameters: {
        resource: 'file',
        operation: 'edit',
        owner: { __rl: true, value: 'evertvanlaar', mode: 'name' },
        repository: { __rl: true, value: 'VisualStudioCode', mode: 'name' },
        filePath: '={{ $json.fileName }}',
        fileContent: '={{ $json.htmlContent }}',
        commitMessage: 'Automatische creatie',
        additionalParameters: {},
      },
      id: 'github-golive-008',
      name: 'GitHub Push',
      type: 'n8n-nodes-base.github',
      typeVersion: 1.1,
      position: [0, 200],
      credentials: {
        githubOAuth2Api: {
          id: 'REPLACE_WITH_GITHUB_CREDENTIAL_ID',
          name: 'GitHub account',
        },
      },
      notes: 'Alleen Go live. Zelfde instellingen als GitHub Push1.',
    },
    {
      parameters: { mode: 'runOnceForAllItems', jsCode: goliveSummaryCode },
      id: 'code-golive-summary-009',
      name: 'Go live summary',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [280, 200],
    },
  ],
  connections: {
    'Manual — Preview (SEO + sitemap)': {
      main: [[{ node: 'Google Sheets — business', type: 'main', index: 0 }]],
    },
    'Google Sheets — business': {
      main: [[{ node: 'Preview — build + validate + draft', type: 'main', index: 0 }]],
    },
    'Preview — build + validate + draft': {
      main: [[{ node: 'Preview summary', type: 'main', index: 0 }]],
    },
    'Webhook — seo draft export GET': {
      main: [[{ node: 'Export draft JSON', type: 'main', index: 0 }]],
    },
    'Export draft JSON': {
      main: [[{ node: 'Respond draft JSON', type: 'main', index: 0 }]],
    },
    'Manual — Go live (SEO + sitemap)': {
      main: [[{ node: 'Load draft → GitHub items', type: 'main', index: 0 }]],
    },
    'Load draft → GitHub items': {
      main: [[{ node: 'GitHub Push', type: 'main', index: 0 }]],
    },
    'GitHub Push': {
      main: [[{ node: 'Go live summary', type: 'main', index: 0 }]],
    },
  },
  pinData: {},
  meta: { templateCredsSetupCompleted: false },
  settings: { executionOrder: 'v1', timezone: 'Europe/Athens' },
};

const out = path.join(dir, 'publish-seo-sitemap-workflow.example.json');
fs.writeFileSync(out, `${JSON.stringify(wf, null, 2)}\n`, 'utf8');
console.log(`OK ${out}`);
