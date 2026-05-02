/**
 * Bouwt bus-schedule-next-cached-workflow.example.json uit bus-schedule-workflow.json.
 * Run: node n8n/build-bus-schedule-next-cached-example.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const orig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'bus-schedule-workflow.json'), 'utf8'),
);

const nid = () => crypto.randomUUID();

const ALLOWED_ORIGINS =
  'https://www.kalanera.gr,https://kalanera.gr,http://localhost:5500,http://localhost:5501';

function acaoExpr(webhookNodeName) {
  return (
    "={{ (() => { const h = $('" +
    webhookNodeName +
    "').first().json.headers || {}; const o = String(h.origin ?? h.Origin ?? '').trim(); const allowed = new Set(['https://www.kalanera.gr','https://kalanera.gr','http://localhost:5500','http://localhost:5501']); return allowed.has(o) ? o : 'https://www.kalanera.gr'; })() }}"
  );
}

const readCacheJs = [
  '// Webhook1 moet exact matchen. Bypass: LB_CACHE_BYPASS_SECRET + header X-LB-Cache-Bypass of ?refresh=',
  "const sd = $getWorkflowStaticData('global');",
  "const h = $('Webhook1').first().json.headers || {};",
  "const q = $('Webhook1').first().json.query || {};",
  '',
  "let secret = '';",
  'try {',
  "  secret = String($env.LB_CACHE_BYPASS_SECRET || '').trim();",
  '} catch {',
  "  secret = '';",
  '}',
  '',
  "const headerVal = String(h['x-lb-cache-bypass'] ?? h['X-LB-Cache-Bypass'] ?? '').trim();",
  'const qRefresh = q.refresh != null ? String(q.refresh).trim() : \'\';',
  '',
  'const bypass = secret.length > 0 && (headerVal === secret || qRefresh === secret);',
  '',
  'if (bypass) {',
  '  delete sd.busScheduleRawRows;',
  '  delete sd.busScheduleExpires;',
  '}',
  '',
  'const now = Date.now();',
  '',
  'if (',
  '  sd.busScheduleRawRows &&',
  "  typeof sd.busScheduleExpires === 'number' &&",
  '  now < sd.busScheduleExpires &&',
  '  Array.isArray(sd.busScheduleRawRows)',
  ') {',
  '  return [{ json: { cacheHit: true, rows: sd.busScheduleRawRows } }];',
  '}',
  '',
  'return [{ json: { cacheHit: false } }];',
].join('\n');

const unpackJs = [
  'const rows = Array.isArray($json.rows) ? $json.rows : [];',
  'return rows.map((row) => ({ json: row }));',
].join('\n');

const writeCacheJs = [
  '// TTL alleen hier (ms). Bus-voorbeeld: 6 min (local-businesses-voorbeeld: 5 min — licht verschoven).',
  '// Filtering (tijd/dir/remaining) gebeurt per request op de cached snapshot.',
  '// Spoed naast TTL: reset-webhook of X-LB-Cache-Bypass op bus-schedule-next.',
  'const TTL_MS = 6 * 60 * 1000;',
  '',
  'const rows = $input.all().map((i) => i.json);',
  "const sd = $getWorkflowStaticData('global');",
  '',
  'sd.busScheduleRawRows = rows;',
  'sd.busScheduleExpires = Date.now() + TTL_MS;',
  '',
  'return [{ json: { rows } }];',
].join('\n');

/** Manual Trigger uit editor = geen persisted static data (n8n docs); gebruik reset-webhook voor echte wipe. */
const manualClearJs = [
  "const sd = $getWorkflowStaticData('global');",
  'delete sd.busScheduleRawRows;',
  'delete sd.busScheduleExpires;',
  'return [',
  '  {',
  '    json: {',
  '      ok: true,',
  '      persistedClear: false,',
  "      why:",
  "        'n8n slaat workflow static data niet op bij Execute Workflow / Manual trigger uit de editor (alleen echte webhook/trigger runs).',",
  '      doInstead:',
  "        'Roep GET .../webhook/bus-schedule-next-reset-cache?token=<LB_CACHE_BYPASS_SECRET> aan terwijl workflow ACTIEF is, of gebruik bypass op bus-schedule-next (header/query).',",
  '    },',
  '  },',
  '];',
].join('\n');

const validateResetJs = [
  'const item = $input.first().json;',
  'const q = item.query || {};',
  'const h = item.headers || {};',
  '',
  "let secret = '';",
  'try {',
  "  secret = String($env.LB_CACHE_BYPASS_SECRET || '').trim();",
  '} catch {',
  "  secret = '';",
  '}',
  '',
  'const token = String(',
  "  q.token ?? q.secret ?? h['x-cache-reset-token'] ?? h['X-Cache-Reset-Token'] ?? '',",
  ').trim();',
  '',
  'if (!secret) {',
  '  return [',
  '    {',
  '      json: {',
  '        resetAllowed: false,',
  "        reason: 'Geen LB_CACHE_BYPASS_SECRET (niet gezet of env geblokkeerd in Code node)',",
  '      },',
  '    },',
  '  ];',
  '}',
  '',
  "if (token !== secret) {",
  "  return [{ json: { resetAllowed: false, reason: 'forbidden' } }];",
  '}',
  '',
  "const sd = $getWorkflowStaticData('global');",
  'delete sd.busScheduleRawRows;',
  'delete sd.busScheduleExpires;',
  '',
  'return [{ json: { resetAllowed: true } }];',
].join('\n');

const sheets = orig.nodes.find((n) => n.name.includes('Read Google Sheet'));
const attach = orig.nodes.find((n) => n.name === 'Attach request query');
const filter = orig.nodes.find((n) => n.name.includes('Filter'));

if (!sheets || !attach || !filter) {
  throw new Error('bus-schedule-workflow.json mist verwachte nodes');
}

const attachParams = {
  ...attach.parameters,
  jsCode: [
    "const q = $('Webhook1').first().json.query || {};",
    'return $input.all().map((item) => ({',
    '  json: {',
    '    ...item.json,',
    '    _busQuery: q,',
    '  },',
    '}));',
  ].join('\n'),
};

/** Function-node body uit bronworkflow → Code node (Function is deprecated / import faalt op sommige n8n-versies). */
const filterJsCode = `const items = $input.all();\n\n${filter.parameters.functionCode}`;

const sheetsExample = {
  ...sheets,
  id: nid(),
  name: sheets.name,
  parameters: {
    ...sheets.parameters,
    documentId: {
      __rl: true,
      value: 'YOUR_SPREADSHEET_ID',
      mode: 'id',
    },
    sheetName: {
      __rl: true,
      value: 'YOUR_BUS_SHEET_GID_OR_NAME',
      mode: 'list',
    },
  },
  credentials: {
    googleSheetsOAuth2Api: {
      id: 'REPLACE_WITH_YOUR_CREDENTIAL_ID',
      name: 'Google Sheets account',
    },
  },
  position: [140, 120],
};

const nodes = [
  {
    parameters: {},
    id: nid(),
    name: 'Manual — reset cache',
    type: 'n8n-nodes-base.manualTrigger',
    typeVersion: 1,
    position: [-600, 340],
  },
  {
    parameters: { mode: 'runOnceForAllItems', jsCode: manualClearJs },
    id: nid(),
    name: 'Clear cache (manual)',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [-360, 340],
  },
  {
    parameters: {
      path: 'bus-schedule-next-reset-cache',
      responseMode: 'responseNode',
      options: { allowedOrigins: ALLOWED_ORIGINS },
    },
    id: nid(),
    name: 'Webhook reset cache',
    type: 'n8n-nodes-base.webhook',
    typeVersion: 1.1,
    position: [-600, -260],
    webhookId: 'bus-schedule-next-reset-cache',
  },
  {
    parameters: { mode: 'runOnceForAllItems', jsCode: validateResetJs },
    id: nid(),
    name: 'Validate + clear cache (API)',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [-360, -260],
  },
  {
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
        conditions: [
          {
            id: 'reset-allowed-if',
            leftValue: '={{ String($json.resetAllowed) }}',
            rightValue: 'true',
            operator: { type: 'string', operation: 'equals', name: 'filter.operator.equals' },
          },
        ],
        combinator: 'and',
      },
      options: {},
    },
    id: nid(),
    name: 'Reset allowed?',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.3,
    position: [-120, -260],
  },
  {
    parameters: {
      respondWith: 'json',
      responseBody:
        "={{ JSON.stringify({ cleared: true, hint: 'Volgende GET bus-schedule-next haalt Bus_Schedule opnieuw.' }) }}",
      options: {
        responseHeaders: {
          entries: [
            { name: 'Content-Type', value: 'application/json; charset=utf-8' },
            { name: 'Access-Control-Allow-Origin', value: acaoExpr('Webhook reset cache') },
            { name: 'Vary', value: 'Origin' },
            { name: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
            {
              name: 'Access-Control-Allow-Headers',
              value: 'Content-Type, X-LB-Cache-Bypass, X-Cache-Reset-Token',
            },
          ],
        },
      },
    },
    id: nid(),
    name: 'Respond reset OK',
    type: 'n8n-nodes-base.respondToWebhook',
    typeVersion: 1.1,
    position: [140, -340],
  },
  {
    parameters: {
      respondWith: 'json',
      responseBody: "={{ JSON.stringify({ error: 'forbidden', detail: $json.reason || undefined }) }}",
      options: {
        responseCode: 403,
        responseHeaders: {
          entries: [
            { name: 'Content-Type', value: 'application/json; charset=utf-8' },
            { name: 'Access-Control-Allow-Origin', value: acaoExpr('Webhook reset cache') },
            { name: 'Vary', value: 'Origin' },
            { name: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
            { name: 'Access-Control-Allow-Headers', value: 'Content-Type, X-Cache-Reset-Token' },
          ],
        },
      },
    },
    id: nid(),
    name: 'Respond reset forbidden',
    type: 'n8n-nodes-base.respondToWebhook',
    typeVersion: 1.1,
    position: [140, -160],
  },
  {
    parameters: {
      path: 'bus-schedule-next',
      responseMode: 'responseNode',
      options: { allowedOrigins: ALLOWED_ORIGINS },
    },
    id: nid(),
    name: 'Webhook1',
    type: 'n8n-nodes-base.webhook',
    typeVersion: 1.1,
    position: [-600, 0],
    webhookId: 'bus-schedule-next',
  },
  {
    parameters: { mode: 'runOnceForAllItems', jsCode: readCacheJs },
    id: nid(),
    name: 'Read cache (static data)',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [-360, 0],
  },
  {
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
        conditions: [
          {
            id: 'cache-hit-if',
            leftValue: '={{ String($json.cacheHit) }}',
            rightValue: 'true',
            operator: { type: 'string', operation: 'equals', name: 'filter.operator.equals' },
          },
        ],
        combinator: 'and',
      },
      options: {},
    },
    id: nid(),
    name: 'Cache hit?',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.3,
    position: [-120, 0],
  },
  {
    parameters: { mode: 'runOnceForAllItems', jsCode: unpackJs },
    id: nid(),
    name: 'Unpack cached rows',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [140, -80],
  },
  sheetsExample,
  {
    parameters: { mode: 'runOnceForAllItems', jsCode: writeCacheJs },
    id: nid(),
    name: 'Write cache + pack rows',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [400, 120],
  },
  {
    ...attach,
    id: nid(),
    name: attach.name,
    parameters: attachParams,
    position: [520, 20],
    typeVersion: 2,
  },
  {
    parameters: {
      language: 'javaScript',
      mode: 'runOnceForAllItems',
      jsCode: filterJsCode,
    },
    id: nid(),
    name: filter.name,
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [680, 20],
  },
  {
    parameters: {
      respondWith: 'json',
      responseBody: '={{$json}}',
      options: {
        responseHeaders: {
          entries: [
            { name: 'Content-Type', value: 'application/json; charset=utf-8' },
            { name: 'Access-Control-Allow-Origin', value: acaoExpr('Webhook1') },
            { name: 'Vary', value: 'Origin' },
            { name: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
            {
              name: 'Access-Control-Allow-Headers',
              value: 'Content-Type, X-LB-Cache-Bypass',
            },
            { name: 'Cache-Control', value: 'public, max-age=60' },
          ],
        },
      },
    },
    id: nid(),
    name: 'Respond (JSON + CORS)',
    type: 'n8n-nodes-base.respondToWebhook',
    typeVersion: 1.1,
    position: [880, 20],
  },
];

const connections = {
  'Manual — reset cache': { main: [[{ node: 'Clear cache (manual)', type: 'main', index: 0 }]] },
  'Webhook reset cache': { main: [[{ node: 'Validate + clear cache (API)', type: 'main', index: 0 }]] },
  'Validate + clear cache (API)': { main: [[{ node: 'Reset allowed?', type: 'main', index: 0 }]] },
  'Reset allowed?': {
    main: [
      [{ node: 'Respond reset OK', type: 'main', index: 0 }],
      [{ node: 'Respond reset forbidden', type: 'main', index: 0 }],
    ],
  },
  Webhook1: { main: [[{ node: 'Read cache (static data)', type: 'main', index: 0 }]] },
  'Read cache (static data)': { main: [[{ node: 'Cache hit?', type: 'main', index: 0 }]] },
  'Cache hit?': {
    main: [
      [{ node: 'Unpack cached rows', type: 'main', index: 0 }],
      [{ node: sheetsExample.name, type: 'main', index: 0 }],
    ],
  },
  [sheetsExample.name]: {
    main: [[{ node: 'Write cache + pack rows', type: 'main', index: 0 }]],
  },
  'Write cache + pack rows': {
    main: [[{ node: 'Unpack cached rows', type: 'main', index: 0 }]],
  },
  'Unpack cached rows': {
    main: [[{ node: 'Attach request query', type: 'main', index: 0 }]],
  },
  'Attach request query': {
    main: [[{ node: filter.name, type: 'main', index: 0 }]],
  },
  [filter.name]: {
    main: [[{ node: 'Respond (JSON + CORS)', type: 'main', index: 0 }]],
  },
};

const out = {
  name: 'kalanera-bus-schedule-next (cached example)',
  nodes,
  connections,
  pinData: {},
  meta: { templateCredsSetupCompleted: false },
  settings: { executionOrder: 'v1' },
};

const outPath = path.join(__dirname, 'bus-schedule-next-cached-workflow.example.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('Written', outPath, nodes.length, 'nodes');
