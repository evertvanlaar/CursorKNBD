# Beschikbaarheid — externe uptime monitoring

**Doel:** proactief weten wanneer `kalanera.gr`, de statische bedrijven-JSON of n8n-fallbacks down zijn — vóór bezoekers of jij het merkt.

**In de repo:**

| Bestand | Rol |
|---------|-----|
| [`monitoring/monitors.json`](../monitoring/monitors.json) | Enige bron van waarheid: welke URL’s, drempels en keywords |
| [`scripts/check-site-availability.mjs`](../scripts/check-site-availability.mjs) | Dezelfde checks lokaal / handmatig / CI |
| Dit document | Stappen om **UptimeRobot** (gratis) in te richten |

---

## Wat het biedt

| Zonder monitoring | Met externe uptime monitor |
|-------------------|----------------------------|
| Je merkt storingen via klachten of toevallig openen | E-mail/push binnen ~5 min na storing |
| Geen historie (“was het gisteren ook traag?”) | Uptime-% en responstijd-grafieken per endpoint |
| JSON kan stuk zijn terwijl homepage nog laadt | Aparte alert op `/data/local-businesses.json` |
| n8n-fallback onbekend tot massaal gebruik | Webhook-health los van site-static |

**Wat het níet is:** geen vervanging voor Google Analytics (echte gebruikerssnelheid) of nginx-loganalyse. Dit is **laag 1: bereikbaarheid**.

---

## Monitors (7 stuks)

Definitie staat in `monitoring/monitors.json`. Samenvatting:

| ID | URL | Waarom |
|----|-----|--------|
| `homepage-en` | `https://www.kalanera.gr/` | Hoofdingang + bedrijvengids-shell |
| `homepage-el` | `https://www.kalanera.gr/index-el.html` | Griekse homepage |
| `business-json` | `https://www.kalanera.gr/data/local-businesses.json` | **Primair** na JSON-cutover |
| `pwa-manifest` | `https://www.kalanera.gr/manifest.json` | PWA / Play Store TWA |
| `n8n-business-fallback` | `https://n8n.vanlaar.cloud/webhook/local-businesses` | Backup als JSON faalt |
| `bus-json` | `https://www.kalanera.gr/data/bus-schedule.json` | **Primair** bus-schema na JSON-cutover |
| `n8n-bus-schedule` | `https://n8n.vanlaar.cloud/webhook/bus-schedule-next?dir=volos&remaining=0&dayOffset=0` | Bus fallback (optioneel uitzetten) |

Drempels in het check-script (lokaal):

- Homepage: HTTP 200, bevat `business-list`
- JSON: min. 50 actieve rijen, `generatedAt` niet ouder dan 72 uur
- n8n: HTTP 200 binnen 15s, min. 50 bedrijfsrijen / bus-meta

Pas drempels aan in `monitoring/monitors.json` als het aantal bedrijven structureel verandert.

---

## Wat jij buiten de repo moet doen (eenmalig, ~20 min)

Externe monitoring draait **niet in git** — je registreert een gratis account en voert de monitors handmatig in (of via API). De repo levert de exacte specificatie.

### Stap 1 — Account

1. Ga naar [UptimeRobot](https://uptimerobot.com/) (gratis: 50 monitors, interval 5 min).
2. Maak account aan met een **alert-e-mail** die je echt leest (ook op vakantie in GR).
3. Optioneel: voeg **SMS**, **Telegram** of **Slack** toe onder *My Settings → Alert Contacts*.

### Stap 2 — Monitors aanmaken

Twee typen in UptimeRobot (niet door elkaar halen):

| Type | Wanneer | Methode |
|------|---------|---------|
| **HTTP(s)** | Alleen bereikbaarheid (status 200) | **HEAD** op gratis plan |
| **Keyword** | Pagina moet bepaalde tekst bevatten | **GET** (leest body) |

#### Keyword-logica (belangrijk)

Je wilt een **incident als de site stuk is** = verwachte tekst **ontbreekt**.

| UptimeRobot-instelling | Betekenis |
|------------------------|-----------|
| **Alert when → Keyword does NOT exist** | ✓ Juist voor gezondheidsmonitoring |
| Alert when → Keyword exists | ✗ Alleen nuttig om te weten wanneer iets *verschijnt* (bv. “weer op voorraad”) |

Voorbeeld homepage: keyword `business-list` → **Alert when: Keyword does NOT exist** → monitor **Up** zolang de gids-shell in HTML staat.

#### Welke monitor welk type?

| Naam | Type | URL | Keyword | Alert when |
|------|------|-----|---------|------------|
| Homepage EN | HTTP(s) of Keyword | `https://www.kalanera.gr/` | `business-list` | Keyword **not** exists |
| Homepage EL | HTTP(s) of Keyword | `https://www.kalanera.gr/index-el.html` | `business-list` | Keyword **not** exists |
| Bedrijven JSON | Keyword | `https://www.kalanera.gr/data/local-businesses.json` | `rowCount` | Keyword **not** exists |
| PWA manifest | HTTP(s) | `https://www.kalanera.gr/manifest.json` | — | — |
| n8n bedrijven fallback | **Keyword** (verplicht) | `https://n8n.vanlaar.cloud/webhook/local-businesses` | `Name` | Keyword **not** exists |
| Bus JSON | Keyword | `https://www.kalanera.gr/data/bus-schedule.json` | `rowCount` | Keyword **not** exists |
| n8n bus (fallback) | **Keyword** (optioneel) | `https://n8n.vanlaar.cloud/webhook/bus-schedule-next?dir=volos&remaining=0&dayOffset=0` | `Europe/Athens` | Keyword **not** exists |

**n8n + HTTP(s) = valse alarmen:** n8n-webhooks antwoorden **404 op HEAD**, maar **200 op GET**. Het gratis HTTP-monitor-type gebruikt HEAD → je krijgt een incident terwijl de webhook wél werkt. Gebruik voor beide n8n-URL’s daarom type **Keyword**.

Per monitor: interval **5 min**, timeout **30 s**, e-mail alert aan.

### Stap 3 — Statuspagina (optioneel)

UptimeRobot kan een publieke statuspagina hosten (`stats.uptimerobot.com/...`). Handig als je later een link “Site status” in de footer wilt; niet verplicht.

### Stap 4 — Verificatie

Op je pc, in de projectmap:

```bash
node scripts/check-site-availability.mjs
```

Verwacht: `ALL OK`. Bij afwijkingen zie je welke monitor faalt — zelfde logica als je straks in UptimeRobot verwacht.

JSON-output (voor logging):

```bash
node scripts/check-site-availability.mjs --json
```

Eén monitor testen:

```bash
node scripts/check-site-availability.mjs --id business-json
```

### Stap 5 — Testalert

In UptimeRobot: monitor tijdelijk op een foute URL zetten → bevestig dat je alert ontvangt → terugzetten.

---

## Drempels aanpassen

Bewerk `monitoring/monitors.json`:

```json
"json": {
  "minRowCount": 50,
  "maxAgeHours": 72
}
```

- **`minRowCount`:** onder dit aantal → check faalt (corrupte of lege publish).
- **`maxAgeHours`:** alleen op statische JSON; publish-workflow niet gedraaid = waarschuwing vóór data echt stale wordt.

Na wijziging: `node scripts/check-site-availability.mjs` en pas UptimeRobot-keywords/drempels aan indien nodig.

---

## Wanneer welke alert betekent wat

| Alert | Waarschijnlijke oorzaak | Actie |
|-------|-------------------------|--------|
| Alleen `business-json` | Publish mislukt, bestand verwijderd, nginx-pad fout | n8n publish-workflow + server `/data/` |
| `homepage-*` + JSON | VPS/nginx down of SSL verlopen | Hosting/VPS |
| Alleen `n8n-*` | n8n VPS, Sheets-quota, workflow error | n8n executions; site kan nog werken via JSON |
| `n8n-business-fallback` vaak OK terwijl JSON down | Bezoekers raken fallback — precies het scenario na cutover | Fix JSON eerst |
| Alles down | Netwerk/DNS of complete outage | VPS-provider |

---

## Alternatieven voor UptimeRobot

| Dienst | Plus | Min |
|--------|------|-----|
| [HetrixTools](https://hetrixtools.com/) | Blacklist/monitoring extras | Andere UI |
| [Uptime Kuma](https://github.com/louislam/uptime-kuma) | Self-hosted, mooi dashboard | Jij beheert Docker op VPS |
| n8n schedule (later) | Zelfde infra | Meet niet als n8n zelf down is — altijd **extern** houden |

Gebruik **minimaal één externe checker** die niet op dezelfde VPS draait als je site.

---

## Core Web Vitals in GA4 (`app.js`)

Na deploy verzamelt `app.js` LCP, INP, CLS, FCP en TTFB als event **`web_vitals`** (alleen op `kalanera.gr`).

**Eenmalig in GA4 Admin → Custom definitions** (event-scoped):

| Parameter | Voorbeeld |
|-----------|-----------|
| `metric_name` | LCP, INP, CLS |
| `metric_rating` | good, needs-improvement, poor |
| `display_mode` | standalone, browser |
| `app_version` | 3.1.42 |

**Rapport (na enkele dagen verkeer):** Explore → Free form → Event name = `web_vitals` → Metric: Average `metric_value` → Rows: `metric_name`, `page_path` → Filter `display_mode` = standalone voor PWA.

Realtime check: Reports → Realtime → event `web_vitals` na een bezoek aan www.kalanera.gr.

---

## n8n monitoring-workflows (optioneel)

Naast UptimeRobot kun je in n8n importeren (zie `monitoring/README.md`):

| # | Workflow | Bestand | Gedrag |
|---|----------|---------|--------|
| 3 | JSON ↔ webhook | `n8n/monitor-json-webhook-compare-weekly.example.json` | Zo 09:00, **e-mail alleen bij probleem** |
| 4 | Bus sanity | `n8n/monitor-bus-sanity-daily.example.json` | Dagelijks 08:00, **e-mail alleen bij probleem** |
| 5 | Weekoverzicht | `n8n/monitor-weekly-overview.example.json` | Ma 09:00, **altijd e-mail** (OK + FAIL samenvatting) |

**Setup (alle drie):**

1. n8n → Import from file  
2. E-mail versturen:
   - **Resend (weekoverzicht):** HTTP node → `html: {{ $json.bodyHtml }}` en `text: {{ $json.body }}` — zet plain `body` **niet** in het html-veld
   - **SMTP:** `emailFormat: html`, veld `html` = `{{ $json.bodyHtml }}`
3. Credentials + `REPLACE_TO_EMAIL` invullen  
4. *Manual — test run* → controleer inbox (regels + kleuren OK/FAIL)  
5. Workflow **Active** zetten (timezone: Europe/Athens)

Workflow #5 bevat dezelfde URL-checks als `monitoring/monitors.json` plus JSON/webhook-vergelijking in één rapport.

---

## Gerelateerd

- [`docs/static-business-json-rollout.md`](static-business-json-rollout.md) — JSON-architectuur
- [`ARCHITECTURE_AND_WEBHOOK_HARDENING.md`](../ARCHITECTURE_AND_WEBHOOK_HARDENING.md) — n8n/nginx
- Laag 2 (performance) en laag 3 (pipeline-alerts): nog niet in repo; zie eerdere chat / vervolg
