# Statische bus-JSON — onafhankelijk van n8n-webhooks

**Doel:** bezoekers laden `/data/bus-schedule.json` op `kalanera.gr`; Google Sheets wordt alleen door een **publish-workflow** bijgewerkt (dagelijks of handmatig). De bestaande `bus-schedule-next` webhook blijft als fallback.

**Status in repo:** `app.js` gebruikt `auto` (JSON eerst, webhook fallback). Zie ook `docs/static-business-json-rollout.md` voor bedrijven (ongewijzigd).

---

## Waarom

| Probleem nu | Oplossing |
|-------------|-----------|
| UptimeRobot checkt elke 15 min de cached webhook → Google Sheets-read | Monitor `/data/bus-schedule.json` i.p.v. webhook |
| Sheets-quota / timeouts → errors in n8n | Bezoekers raken Sheets niet |
| Bus-schema wijzigt ~2×/jaar | Dagelijkse publish is ruim voldoende |

**Business-flows niet aanpassen** — alleen bus publish + app-cutover + monitoring.

---

## Architectuur

```text
Google Sheet tab Bus_Schedule
        │
        ▼
n8n: kalanera-bus-schedule-publish-json  (Schedule daily + Manual)
        │  Read Sheets → pack JSON (alle ruwe rijen)
        ▼
Deploy naar www.kalanera.gr/data/bus-schedule.json
        │
        ▼
app.js (modus auto) → fetch JSON → filter dir/dayOffset in browser → localStorage
        │
        └── fallback: GET /webhook/bus-schedule-next
```

Filtering (`dir`, `dayOffset`, `Days`-kolom) gebeurt **client-side** — zelfde logica als n8n `Filter + Normalize + Sort`.

---

## Bestanden

| Pad | Rol |
|-----|-----|
| `data/bus-schedule.json` | Productie-dataset (niet in git; `.gitignore`) |
| `data/bus-schedule.staging.json` | Optioneel staging vóór atomic swap |
| `dev/bus-schedule.json` | Dev/LAN snapshot |
| `dev/bus-schedule-next-volos.json` | Legacy LAN-fallback (volos/vandaag) |
| `n8n/bus-schedule-publish-json.example.json` | Importeerbare publish-workflow |
| `scripts/refresh-bus-schedule-snapshot.mjs` | Preview of bootstrap → dev + data |
| `scripts/seed-bus-schedule-data.mjs` | Kopieer dev → data |

### JSON-contract

```json
{
  "generatedAt": "2026-06-10T06:00:00.000Z",
  "source": "google-sheets",
  "rowCount": 180,
  "rows": [ ... ]
}
```

`rows` = ongefilterde sheet-rijen (zelfde kolommen als `Bus_Schedule` tab).

---

## Fase 0 — Lokaal testen

```bash
# Eerste snapshot (preview-webhook of bootstrap via bestaande webhook):
node scripts/refresh-bus-schedule-snapshot.mjs

# Of alleen dev → data:
node scripts/seed-bus-schedule-data.mjs
```

Open bus-pagina met JSON-modus (alleen jouw browser):

```
https://www.kalanera.gr/bus.html?busData=json
```

DevTools → Network: request naar `/data/bus-schedule.json`, **geen** call naar `n8n.vanlaar.cloud` als JSON geladen is.

Terug naar standaard: `?busData=reset`

| Actie | URL |
|--------|-----|
| JSON-modus aan | `?busData=json` |
| Alleen webhook | `?busData=webhook` |
| JSON eerst, webhook fallback | `?busData=auto` |
| Override wissen | `?busData=reset` |

Opgeslagen in `localStorage` key `kalanera_bus_data_source`.

---

## Fase 1 — n8n publish-workflow

1. Import `n8n/bus-schedule-publish-json.example.json` als **nieuwe** workflow (naast cached webhook; niet vervangen).
2. Tab **Bus_Schedule** (gid `681885468`) — zelfde als cached flow.
3. Workflow **Inactive** tot deploy getest; eerst **Manual — publish JSON**.
4. Preview: `GET https://n8n.vanlaar.cloud/webhook/bus-schedule-json-preview`
5. Deploy via **GitHub Push** → `data/bus-schedule.json` (zelfde repo als bedrijven) of SFTP staging.
6. Test productie alleen voor jou: `https://www.kalanera.gr/bus.html?busData=json`

Schedule in voorbeeld: **dagelijks 06:00** (schema wijzigt zelden; wekelijks mag ook).

---

## Fase 2 — Productie (app)

`BUS_DATA_SOURCE_DEFAULT = 'auto'` staat al in `app.js`. Na deploy van `data/bus-schedule.json`:

1. Deploy website.
2. Verifieer: `curl -I https://www.kalanera.gr/data/bus-schedule.json` → 200.
3. Normale bezoekers gebruiken JSON zonder `?busData=`.

---

## Fase 3 — UptimeRobot aanpassen

**Toevoegen (primair):**

| Naam | Type | URL | Keyword | Alert when |
|------|------|-----|---------|------------|
| Bus JSON | Keyword | `https://www.kalanera.gr/data/bus-schedule.json` | `rowCount` | Keyword **not** exists |

Drempels in `monitoring/monitors.json`: min. 20 rijen, `generatedAt` max. 14 dagen oud (bus verandert zelden).

**Aanpassen (fallback, lagere prioriteit):**

| Was | Wordt |
|-----|-------|
| `n8n-bus-schedule` elke 15 min | Optioneel: interval 24 uur of **uitschakelen** na stabiele JSON |
| Cached webhook workflow actief | **Deactiveren** of alleen handmatig — stopt Sheets-errors in n8n |

**Business-monitors ongewijzigd laten** (zoals afgesproken).

Lokaal checken:

```bash
node scripts/check-site-availability.mjs --id bus-json
```

---

## Fase 4 — Opruimen (optioneel)

- `kalanera-bus-schedule-next (cached example)` workflow **inactive** — geen UptimeRobot meer op webhook.
- Publish-workflow blijft voor Sheet → JSON sync.
- `?busData=webhook` blijft nuttig voor debug.

---

## Checklist

- [ ] `node scripts/refresh-bus-schedule-snapshot.mjs`
- [ ] Lokaal `?busData=json` op bus-pagina
- [ ] n8n publish-workflow geïmporteerd, manual run → JSON op server
- [ ] `curl -I https://www.kalanera.gr/data/bus-schedule.json` → 200
- [ ] UptimeRobot: monitor `bus-json` toegevoegd
- [ ] UptimeRobot: `n8n-bus-schedule` uitgezet of interval verlaagd
- [ ] Cached bus-webhook workflow inactive
- [ ] Website deploy

---

## Gerelateerd

- `docs/static-business-json-rollout.md` — bedrijven (parallel, niet wijzigen)
- `docs/uptime-monitoring.md` — monitor-setup
- `docs/offline-first-roadmap.md` — Laag 2 bus-bundle
