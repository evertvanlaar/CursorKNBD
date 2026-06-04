# Statische bedrijven-JSON — testen zonder productie-impact

**Doel:** bezoekers laden `/data/local-businesses.json` op `kalanera.gr`; Google Sheets wordt alleen door n8n bijgewerkt (schedule of handmatig). De bestaande webhook blijft beschikbaar als fallback.

**Status in repo:** `app.js` ondersteunt opt-in; productie-default blijft `webhook` tot jij cutover doet.

---

## Architectuur

```text
Google Sheet (bewerken)
        │
        ▼
n8n: kalanera-localbusiness-publish-json  (Schedule + Manual)
        │  Read Sheets → pack JSON
        ▼
Deploy naar www.kalanera.gr/data/local-businesses.json
        │
        ▼
app.js (modus json of auto) → fetch same-origin JSON → localStorage
```

Publieke webhook `/webhook/local-businesses` blijft actief tot fase 4.

---

## Bestanden

| Pad | Rol |
|-----|-----|
| `data/local-businesses.json` | Productie-dataset (niet in git tot eerste publish; wel `.gitignore` optioneel) |
| `data/local-businesses.staging.json` | Optioneel: testbestand op server vóór atomic swap |
| `data/local-businesses.meta.json` | Optioneel: alleen `{ generatedAt, rowCount }` voor snelle checks |
| `dev/local-businesses.json` | Bestaande LAN/dev snapshot |
| `n8n/local-businesses-publish-json.example.json` | Importeerbare n8n-workflow |
| `scripts/seed-local-businesses-data.mjs` | Kopieert `dev/` → `data/` voor lokaal testen |

### JSON-contract

Ondersteund door `app.js` (`normalizeBusinessWebhookPayload`):

1. **Platte array** (zoals events): `[{ "Name": "...", "Status": "Active", ... }, ...]`
2. **Object met `rows`** (aanbevolen vanuit n8n):

```json
{
  "generatedAt": "2026-06-04T12:00:00.000Z",
  "source": "google-sheets",
  "rowCount": 72,
  "rows": [ ... ]
}
```

Alleen rijen met `Status` = `Active` (case-insensitive) worden in de UI getoond.

---

## Fase 0 — Lokaal testen (geen productie)

1. Seed data op je machine:

```bash
# Verse data van Sheet (via n8n webhook) — aanbevolen na nieuwe bedrijven:
node scripts/refresh-local-businesses-snapshot.mjs

# Of alleen kopie dev → data (als dev al up-to-date is):
node scripts/seed-local-businesses-data.mjs
```

2. Start een static server in de projectroot (bijv. Live Server op poort 5500).

3. Open met JSON-modus (alleen jouw browser):

```
http://localhost:5500/index.html?bizData=json
```

4. Controleer in DevTools → Network: request naar `/data/local-businesses.json`, **geen** call naar `n8n.vanlaar.cloud` als het bestand geladen is.

5. Terug naar standaard (webhook-gedrag lokaal):

```
http://localhost:5500/index.html?bizData=reset
```

### Opt-in persistent (zelfde browser)

| Actie | URL / commando |
|--------|----------------|
| JSON-modus aan | `?bizData=json` |
| Alleen webhook | `?bizData=webhook` |
| JSON eerst, webhook fallback | `?bizData=auto` |
| Override wissen | `?bizData=reset` |

Opgeslagen in `localStorage` key `kalanera_biz_data_source`.

### LAN zonder `data/`-bestand

Bij `?bizData=json` probeert de app ook `dev/local-businesses.json` op LAN-hosts.

---

## Fase 1 — n8n publish-workflow (staging)

1. Import `n8n/local-businesses-publish-json.example.json` als **nieuwe** workflow (naast de cached webhook; niet vervangen).

2. In de node **Google Sheets — business tab**: kies dezelfde spreadsheet + tab als de live webhook-flow.

3. Zet op de **Schedule**-node: workflow **Inactive** tot je klaar bent; test eerst met **Manual — publish JSON**.

4. Node **Preview webhook (JSON)** (optioneel):  
   `GET https://n8n.vanlaar.cloud/webhook/local-businesses-json-preview`  
   Vergelijk output met `GET .../webhook/local-businesses`.

5. Deploy-node configureren (één kiezen, zie workflow-notities):
   - **SFTP/SSH** naar `.../data/local-businesses.staging.json`
   - **HTTP POST** naar intern deploy-script op de VPS
   - Handmatig: execution output kopiëren + upload

6. Op de server (nginx): staging bestand controleren, daarna atomic rename:

```bash
# voorbeeld op VPS (pad aanpassen)
mv /var/www/kalanera.gr/data/local-businesses.staging.json \
   /var/www/kalanera.gr/data/local-businesses.json
```

7. Test op productie **zonder andere bezoekers te raken**:

```
https://www.kalanera.gr/index.html?bizData=json
```

Zolang `BUSINESS_DATA_SOURCE_DEFAULT = 'webhook'` in `app.js`, zien andere gebruikers nog n8n.

Optioneel staging-bestand:

```
https://www.kalanera.gr/index.html?bizData=json&bizStaging=1
```

(laadt eerst `data/local-businesses.staging.json`).

---

## Fase 2 — Productie-cutover (app)

Wanneer JSON stabiel op de server staat:

1. In `app.js` wijzig:

```javascript
const BUSINESS_DATA_SOURCE_DEFAULT = 'auto';  // was: 'webhook'
```

(`auto` = JSON eerst, webhook als fallback als JSON ontbreekt of leeg is.)

2. Deploy website (TWA volgt `kalanera.gr`).

3. Monitor: nginx access logs op `/data/local-businesses.json`, n8n-executions publish-workflow, minder traffic op `/webhook/local-businesses`.

4. Na 1–2 weken stabiel: optioneel webhook-flow **deactiveren** of alleen handmatig laten draaien.

---

## Fase 3 — nginx (aanbevolen)

```nginx
location = /data/local-businesses.json {
    add_header Cache-Control "public, max-age=300";
    add_header Access-Control-Allow-Origin "*";  # same-origin; meestal niet nodig
    try_files $uri =404;
}
```

Geen rate limit nodig op statisch JSON; wel `gzip` aan voor grote payloads.

---

## Fase 4 — Opruimen (optioneel)

- Cached webhook-workflow uitzetten of alleen als nood-fallback houden.
- `?bizData=` overrides blijven nuttig voor support/debug.

---

## Checklist snel

- [ ] `node scripts/seed-local-businesses-data.mjs` + lokaal `?bizData=json`
- [ ] n8n publish-workflow geïmporteerd, Sheets-tab correct
- [ ] Manual run → staging JSON op server
- [ ] `curl -I https://www.kalanera.gr/data/local-businesses.json` → 200
- [ ] Productie alleen voor jou: `?bizData=json`
- [ ] `BUSINESS_DATA_SOURCE_DEFAULT = 'auto'` + deploy
- [ ] Stickers/promo: verifieer eerste bezoek zonder n8n-afhankelijkheid

---

## Gerelateerd

- `docs/offline-first-roadmap.md` — Laag 2
- `ARCHITECTURE_AND_WEBHOOK_HARDENING.md` — `/webhook/local-businesses`
- `n8n/local-businesses-cached-workflow.example.json` — huidige webhook
