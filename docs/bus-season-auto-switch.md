# Automatische winter ↔ zomer bus-switch (later)

**Status:** overweging — **niet gebouwd** (sep 2026, na handmatige wintercutover 2026-09-11).  
**Roadmap:** [`docs/bus-ui-roadmap.md`](./bus-ui-roadmap.md) → *Nog open*.  
**Huidige handmatige flow:** [`data/README.md`](../data/README.md), [`scripts/switch-bus-season.mjs`](../scripts/switch-bus-season.mjs), [`docs/static-bus-json-rollout.md`](./static-bus-json-rollout.md).

Doel: geen middernacht-deploy meer bij de ~2×/jaar KTEL-seizoenswissel. Ritten in de Sheet blijven menselijk; alleen **welk rooster live is** zou op datum kunnen.

---

## Wat er nu al is

| Stuk | Rol nu |
|------|--------|
| `data/bus-schedule.winter.json` / `.summer.json` | Beide seizoenen op de server; test via `?busSeason=winter\|summer` |
| `data/bus-schedule.meta.json` | `activeScheduleId` + `seasons.*.validFrom` / `validUntil` (badge) |
| `app.js` `busJsonFetchUrls()` | Kiest seizoensbestand **alleen** bij URL-override; anders altijd `bus-schedule.json` |
| n8n publish | Eén Sheet-tab `Bus_Schedule` → `data/bus-schedule.json` |
| `scripts/switch-bus-season.mjs` | Handmatige copy winter/summer → actief JSON + meta |

De datums in de meta sturen de **badge**, niet welk bestand wordt geladen. n8n overschrijft het actieve bestand vanuit **één** tab: als die tab nog zomer is, blijft zomer live.

Handmatige cutover (zoals sep 2026): Sheet vullen → `meta.json` op de server → n8n publish. App-code (zaterdag-labels, More “New”) is een aparte versiebump.

---

## Optie A — app kiest op Athene-datum (voorkeur)

Beide roosters blijven op de server. `app.js` leest `meta.json`, pakt de kalenderdatum in `Europe/Athens`, en laadt het seizoen waarvan `validFrom`–`validUntil` vandaag dekt. `bus-schedule.json` alleen als fallback.

Nodig:

- Logica in `busJsonFetchUrls()` (of equivalent) naast de bestaande `?busSeason=`-override
- n8n publiceert naar **het seizoensbestand** (niet naar het actieve bestand), of twee Sheet-tabs: `Bus_Schedule_Winter` / `Bus_Schedule_Summer`
- Meta bijwerken als KTEL de **periode** wijzigt (niet bij elke ritwijziging)
- Gedrag op de grensdag, bij overlap, en bij een gat tussen ranges vastleggen

Geen middernacht-upload meer: bezoekers zien winter zodra de Athene-datum in de winterrange valt.

---

## Optie B — n8n wisselt het actieve bestand

Schedule ~00:05 Athene: als vandaag in de winterrange valt, kopieer winter → `bus-schedule.json` en zet `activeScheduleId`. De app blijft ongewijzigd.

Nodig: dezelfde twee bronbestanden (of twee tabs) plus een workflow die meta + actief JSON schrijft. Als de job faalt, blijft het oude seizoen staan tot de volgende run.

---

## Bewust buiten scope

- **Ritten in de Sheet** — KTEL-inhoud blijft handmatig, daarna publish.
- **More → New** (`MORE_WHATS_NEW` in `app.js`) — campagne, geen seizoenswissel.
- **Play Store / TWA** — volgt de site; geen aparte app-release voor een roosterwissel.

---

## Praktisch minimum later

Twee bevroren JSON’s (of twee Sheet-tabs) als bron. Datums alleen in `meta.json`. App kiest op Athene-datum (**A**). n8n schrijft wijzigingen naar het juiste seizoensbestand.

Handmatig blijft: nieuwe KTEL-tijden invoeren, seizoensdatums in de meta zetten als de periode verschuift, en één keer de kies-logica bouwen.
