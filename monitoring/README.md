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

Import in n8n → **Workflows → Import from file** → koppel **SMTP** op e-mailnodes → vul `REPLACE_FROM_EMAIL` / `REPLACE_TO_EMAIL` → **Manual test run** → workflow **Active**.
