# Monitoring

| Bestand | Gebruik |
|---------|---------|
| `monitors.json` | Definitie van alle uptime-targets (URL, drempels, UptimeRobot-keywords) |
| `../scripts/check-site-availability.mjs` | Voer dezelfde checks lokaal uit |
| `../docs/uptime-monitoring.md` | UptimeRobot + GA4 + n8n import |

```bash
node scripts/check-site-availability.mjs
```

## n8n monitoring-workflows (import)

| Workflow | Bestand | Schema |
|----------|---------|--------|
| JSON vs webhook (wekelijks, alert bij sync-probleem) | `../n8n/monitor-json-webhook-compare-weekly.example.json` | Zo 09:00 |
| Bus sanity (dagelijks, alert bij geen ritten) | `../n8n/monitor-bus-sanity-daily.example.json` | Dagelijks 08:00 |
| Weekoverzicht (maandag, altijd e-mail) | `../n8n/monitor-weekly-overview.example.json` | Ma 09:00 |
| kalanera.gr vs visitkalanera.gr (incognito) | `../n8n/monitor-kalanera-vs-visitkalanera.example.json` | Ma 09:00; snapshot via GHA → `data/visitkalanera-sitemap.json`; nieuwe missers → schaduw Google Sheet |

Import in n8n → **Workflows → Import from file** → koppel **Google Sheets OAuth2** (Read + Append) + **Resend** → vul `REPLACE_TO_EMAIL` → **Manual test run** → workflow **Active**.

**Schaduw-sheet:** [1EPTu-cz2NYKJxlC6Ki14cyfQYiMFxg_i5gSgjw0IUvI](https://docs.google.com/spreadsheets/d/1EPTu-cz2NYKJxlC6Ki14cyfQYiMFxg_i5gSgjw0IUvI/edit) — handmatige eerste import: `data/shadow-sheet-import-2026-06-06.csv`.
