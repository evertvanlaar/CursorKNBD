#!/usr/bin/env node
/**
 * Rebuild n8n/monitor-kalanera-vs-visitkalanera.example.json from n8n/compare-visitkalanera.code.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'n8n/compare-visitkalanera.code.js'), 'utf8');

const workflow = {
  name: 'kalanera-monitor-kalanera-vs-visitkalanera (example)',
  nodes: [
    {
      parameters: {},
      id: 'vk-manual-001',
      name: 'Manual — test run',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [-920, -40],
    },
    {
      parameters: {
        rule: {
          interval: [{
            field: 'weeks',
            triggerAtDay: [1],
            triggerAtHour: 9,
            triggerAtMinute: 0,
          }],
        },
      },
      id: 'vk-schedule-002',
      name: 'Schedule — Monday 09:00',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.2,
      position: [-920, 160],
      notes: 'Standaard: wekelijks maandag 09:00 (workflow timezone Europe/Athens).',
    },
    {
      parameters: {
        mode: 'runOnceForAllItems',
        jsCode: 'return [{ json: { _workflowStart: true } }];',
      },
      id: 'vk-init-011',
      name: 'Init workflow',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [-780, 60],
    },
    {
      parameters: {
        operation: 'read',
        documentId: {
          __rl: true,
          value: '1EPTu-cz2NYKJxlC6Ki14cyfQYiMFxg_i5gSgjw0IUvI',
          mode: 'id',
        },
        sheetName: {
          __rl: true,
          value: 'gid=0',
          mode: 'id',
        },
        options: { returnAllMatches: true },
      },
      id: 'vk-shadow-read-007',
      name: 'Read shadow Google Sheet',
      type: 'n8n-nodes-base.googleSheets',
      typeVersion: 4.5,
      position: [-640, 60],
      credentials: {
        googleSheetsOAuth2Api: {
          id: 'REPLACE_WITH_GOOGLE_SHEETS_CREDENTIAL_ID',
          name: 'Google Sheets OAuth2',
        },
      },
      notes: 'Schaduw-sheet: 1EPTu-cz2NYKJxlC6Ki14cyfQYiMFxg_i5gSgjw0IUvI (gid=0).',
      settings: { alwaysOutputData: true },
    },
    {
      parameters: {
        mode: 'runOnceForAllItems',
        jsCode: code,
      },
      id: 'vk-compare-003',
      name: 'Compare kalanera vs visitkalanera',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [-360, 60],
    },
    {
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
          conditions: [{
            id: 'vk-if-sheet-001',
            leftValue: '={{ $json.sheetCandidatesCount }}',
            rightValue: 0,
            operator: { type: 'number', operation: 'gt' },
          }],
          combinator: 'and',
        },
        options: {},
      },
      id: 'vk-if-sheet-008',
      name: 'IF — new shadow rows?',
      type: 'n8n-nodes-base.if',
      typeVersion: 2.2,
      position: [-80, -80],
    },
    {
      parameters: {
        mode: 'runOnceForAllItems',
        jsCode: "const rows = $input.first().json.sheetCandidates || [];\nreturn rows.map((row) => ({ json: row }));",
      },
      id: 'vk-explode-009',
      name: 'Explode sheet candidates',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [160, -80],
    },
    {
      parameters: {
        operation: 'append',
        documentId: {
          __rl: true,
          value: '1EPTu-cz2NYKJxlC6Ki14cyfQYiMFxg_i5gSgjw0IUvI',
          mode: 'id',
        },
        sheetName: {
          __rl: true,
          value: 'gid=0',
          mode: 'id',
        },
        columns: {
          mappingMode: 'defineBelow',
          value: {
            Name: '={{ $json.Name }}',
            Name_EL: '={{ $json.Name_EL }}',
            Website: '={{ $json.Website }}',
            Phone: '={{ $json.Phone }}',
            Location: '={{ $json.Location }}',
            Category: '={{ $json.Category }}',
            Email: '={{ $json.Email }}',
            Status: '={{ $json.Status }}',
            PhotoURL: '={{ $json.PhotoURL }}',
            Datum: '={{ $json.Datum }}',
            siteOK: '={{ $json.siteOK }}',
            Lastcheck: '={{ $json.Lastcheck }}',
            Summary_en_imp: '={{ $json.Summary_en_imp }}',
            Summary_el_imp: '={{ $json.Summary_el_imp }}',
          },
        },
        options: {},
      },
      id: 'vk-shadow-append-010',
      name: 'Append to shadow Google Sheet',
      type: 'n8n-nodes-base.googleSheets',
      typeVersion: 4.5,
      position: [400, -80],
      credentials: {
        googleSheetsOAuth2Api: {
          id: 'REPLACE_WITH_GOOGLE_SHEETS_CREDENTIAL_ID',
          name: 'Google Sheets OAuth2',
        },
      },
      notes: 'Voegt alleen nieuwe missers toe (Status=Shadow). Duplicaten worden in Compare-node gefilterd.',
    },
    {
      parameters: {
        method: 'POST',
        url: 'https://api.resend.com/emails',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: "={{ { from: 'Kala Nera Guide <info@kalanera.gr>', to: ['REPLACE_TO_EMAIL'], subject: $json.subject, html: $json.bodyHtml, text: $json.body } }}",
        options: { timeout: 30000 },
      },
      id: 'vk-resend-004',
      name: 'Send via Resend',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [-80, 200],
      credentials: {
        httpHeaderAuth: {
          id: 'REPLACE_WITH_RESEND_HTTP_HEADER_CREDENTIAL_ID',
          name: 'Resend API (Authorization: Bearer re_...)',
        },
      },
      notes: 'Resend: Header Auth → Authorization: Bearer re_xxxxx',
    },
    {
      parameters: {
        fromEmail: 'REPLACE_FROM_EMAIL',
        toEmail: 'REPLACE_TO_EMAIL',
        subject: '={{ $json.subject }}',
        emailFormat: 'html',
        html: '={{ $json.bodyHtml }}',
        options: { appendAttribution: false },
      },
      id: 'vk-smtp-005',
      name: 'Send via SMTP (optional)',
      type: 'n8n-nodes-base.emailSend',
      typeVersion: 2.1,
      position: [-80, 360],
      disabled: true,
      credentials: {
        smtp: {
          id: 'REPLACE_WITH_YOUR_SMTP_CREDENTIAL_ID',
          name: 'SMTP account',
        },
      },
    },
    {
      parameters: {
        content: '## Directory-vergelijking (incognito)\n\n**n8n raakt visitkalanera.gr NIET aan.**\n\n1. GitHub Actions haalt wekelijks `page-sitemap.xml` op\n2. Schrijft `data/visitkalanera-sitemap.json` → deploy kalanera.gr\n3. n8n leest `kalanera.gr/data/*.json` + **schaduw Google Sheet**\n4. Nieuwe externe missers → append naar shadow sheet (Status=Shadow)\n\nShadow sheet: `1EPTu-cz2NYKJxlC6Ki14cyfQYiMFxg_i5gSgjw0IUvI`\n\nKoppel **Google Sheets OAuth2** op Read + Append nodes.',
        height: 440,
        width: 480,
      },
      id: 'vk-sticky-006',
      name: 'Sticky Note',
      type: 'n8n-nodes-base.stickyNote',
      typeVersion: 1,
      position: [-940, -400],
    },
  ],
  connections: {
    'Manual — test run': {
      main: [[{ node: 'Init workflow', type: 'main', index: 0 }]],
    },
    'Schedule — Monday 09:00': {
      main: [[{ node: 'Init workflow', type: 'main', index: 0 }]],
    },
    'Init workflow': {
      main: [[{ node: 'Read shadow Google Sheet', type: 'main', index: 0 }]],
    },
    'Read shadow Google Sheet': {
      main: [[{ node: 'Compare kalanera vs visitkalanera', type: 'main', index: 0 }]],
    },
    'Compare kalanera vs visitkalanera': {
      main: [[
        { node: 'IF — new shadow rows?', type: 'main', index: 0 },
        { node: 'Send via Resend', type: 'main', index: 0 },
      ]],
    },
    'IF — new shadow rows?': {
      main: [
        [{ node: 'Explode sheet candidates', type: 'main', index: 0 }],
        [],
      ],
    },
    'Explode sheet candidates': {
      main: [[{ node: 'Append to shadow Google Sheet', type: 'main', index: 0 }]],
    },
  },
  pinData: {},
  meta: { templateCredsSetupCompleted: false },
  settings: { executionOrder: 'v1', timezone: 'Europe/Athens' },
};

const out = path.join(root, 'n8n/monitor-kalanera-vs-visitkalanera.example.json');
fs.writeFileSync(out, `${JSON.stringify(workflow, null, 2)}\n`);
console.log(`Wrote ${out}`);
