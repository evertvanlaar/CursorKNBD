# Bus UI — plan van aanpak (roadmap)

Gebaseerd op UX-advies voor het busschema (mobiel/desktop, EN/EL) en de copy in [`locales/bus-strings.json`](../locales/bus-strings.json). Volgorde: eerst kleine sprint met directe scanbaarheid, daarna compactere ritregels (Fase 2.1/2.2).

---

## Voortgang — wat staat er nu (mei 2026)

### Afgerond / ingevoerd

- **Fase 0 — voorbereiding:** `bus-strings.json` wordt geladen in `app.js` (embedded fallback); helpers `busUiString` / vertaalpatronen voor buscopy; KTEL-basis-URL per taal (`busKtelTimetableUrl`).
- **Compacte kop / invoer (doel: minder rommel, geen dubbele info):**
  - Geen aparte regel meer naast „TODAY“ met route/herhaling van de bestemming; context „Kala Nera“ blijft uit paginatitel, **Next bus**-kaart en het contactblok onder het schema.
  - **Dagkeuze:** horizontale dag-chips vervangen door één **`input type="date"`** (zelfde venster als voorheen: vandaag in Athene-kalender t/m +6 dagen).
  - **Trust:** geen vaste banner meer tussen invoer en „Next bus“; **`ⓘ` / About times** opent een **`dialog`** met `trustPrimary`, stop‑detail, offline/cache‑tekst en officiële KTEL-link (`linkOfficialKtelLong`); native **`title`** op de knop met korte `trustUltraCompact` als tooltip.
  - **Visuele structuur:** twee panelen (`bus-input-panel--destination` vs `--when`) voor „waarheen“ vs „welke dag + info“, met duidelijke scheiding.
  - **Voet / disclaimer:** geen apart disclaimerblok meer onderaan; **praktische tip (≈10 min eerder)** staat bij **Next bus / eerste rit** (`tipBeEarly`); **stop‑detail**, **offline/cache** en **trustPrimary + KTEL‑link** staan samen in het **ⓘ About times**‑dialoog (`bus-trust-dialog-*`).
- **Technisch:** witruimte-bug opgelost (`flex-grow` op `.bus-controls--select` gaf een lege band tussen bestemmings- en datumkiezer in kolom-layout).
- **Sprint — countdown + tijdlijn-highlight (mei 2026):**
  - Op de **NEXT**-kaart (één rit, **vandaag**): tekst **„ongeveer X min“** onder de vertrektijd (`nextDepartMinutes` / `nextDepartSoon`), live bijgewerkt (interval + tab terug naar voorgrond).
  - In het **volledige schema**: de eerstvolgende rit (zelfde **10 min**-buffer als filtering) heeft een **duidelijkere rij-highlight** (zachte achtergrond + inset-rand naast bestaande groene dot/bus-icoon).
- **Tijdlijn UI — layout & PWA-cache (iteraties mei 2026):**
  - **NEXT** en volledig schema delen dezelfde **tijdlijnsweergave** (geen aparte witte card); **tijdkolom links uitgelijnd** (desktop = mobiel) zodat **NEXT** / **eerste rit** gelijk ligt met de rest.
  - **ETA onder de tijd:** timeline-ETA niet meer `max-content`-smal (**Due soon / Σύντομα** staat onder de kloktekst).
  - **Grieks** `nextDepartMinutes`: verkorte vorm **`Σε ~{n} λ.`** (compact op smal scherm).
  - **Ruimte** rond stip/pills: **`bus-timeline-wrap`** + **`li`-padding** op alle rijen; NEXT-highlight **`::before`** weer volle rijbreedte (geen „smalle strip“).
  - **Brede witte kaart:** `bus-section` **max-width 1040px**, `main-container` **1140px**; mobiel bus-pagina iets meer contentbreedte (minder outer padding).
  - **`service-worker.js`:** **`style.css?v=` / `app.js?v=`** network-first om oude SW-cache bij deploy te vermijden (PWA/geïnstalleerde app).

### Bewust niet gerealiseerd

- **Sticky invoerzone op mobiel** (oud stap 1.2): geprobeerd met CSS `position: sticky` en daarna met een JS fixed-pin fallback — **volledig teruggedraaid**. In deze layout/stack bleek sticky niet betrouwbaar; er is gekozen voor een **compacte vaste kop** i.p.v. plakkende invoer.

### Nog open uit dit document

- **Fase 2.1 / 2.2:** compactere ritregels + sheet/modal bij chips — nog te bouwen.

### Ideeën op reserve (nog niet gebouwd)

- Optionele **microkoppen** (kleine caps of sr-only) boven de twee invoerpaneelen voor extra hiërarchie — alleen als het visueel nog steeds rustig blijft.
- **Fase 3.1-variant:** tijdvakken niet alleen als koppen, maar optioneel **inklapbare blokken** per dagdeel (Morning / Midday / Evening) voor nog minder scroll — alleen als het geen extra tik-last wordt.

---

## Fase 0 — Voorbereiding (kort)

| Stap | Actie |
|------|--------|
| 0.1 | **`bus-strings.json`** inladen in `app.js` (of mergen met bestaande `translations`) + kleine helper `busT(key, { n, time })` voor placeholders `{n}` / `{time}`. |
| 0.2 | **Copy-keuze** vastleggen: standaard `trustPrimary` op tablet/desktop, `trustUltraCompact` op smalle mobiel (of altijd primary met kleinere font-size). |
| 0.3 | **KTEL-URL** per taal (zoals nu EN/EL links) als constante naast de strings. |

**Deliverable:** strings bruikbaar in code zonder dubbele hardcoded teksten.

**Status:** in de huidige codebase operationeel — zie ook **Voortgang** hierboven.

---

## Fase 1 — Snelle verbeteringen (hoge ROI, laag risico)

| Stap | Actie | Status |
|------|--------|--------|
| 1.1 | **Trust + KTEL:** oorspronkelijk bedoeld als vaste regel onder/boven de tabel; **nu:** volledige tekst + link in **`dialog`** via info-knop naast datumkiezer (`trustPrimary` + `linkOfficialKtelLong`; tooltip ~ `trustUltraCompact`). | **Gedaan** (andere vorm dan oorspronkelijke zin) |
| 1.2 | **Sticky zone** op mobiel (dagkiezer + „Where to?“ + hero vast bij scroll). | **Geschrapt** — niet haalbaar/betrouwbaar in deze stack; voorkeur voor compacte invoer |
| 1.3 | **Disclaimer / trust‑copy:** tip bij **Next bus**; offline + stop‑detail + trust + KTEL in **ⓘ**‑dialoog; geen dubbel voetblok. | **Gedaan** (herzien — tip omhoog, rest in dialoog) |

**Deliverable (bijgewerkt):** gebruiker heeft duidelijke invoer voor bestemming + dag; schatting/niet-officieel, KTEL, offline/cache‑uitleg en stop‑detail via **ⓘ**; **10‑min‑tip** direct bij Next bus / eerste rit (stap 1.3 afgerond).

---

## Ondervonden / lessen

- **`position: sticky`** op de bus-invoer werd door globale layout (`overflow`, stacking context, nested headers) **onbetrouwbaar**; een JS-fixed fallback werkte bij gebruiker nog niet naar wens → **feature niet verder uitgewerkt**.
- **Dubbele bestemming** (route-regel + dropdown + hero) werd als storend ervaren → route-regel/`TODAY`-rij verwijderd ten gunste van picker + resultaat.
- **Native datumveld** past bij een vast venster van 7 kalenderdagen en bespaart verticale ruimte t.o.v. zeven chips.
- **Flexbox:** `flex-grow: 1` op een kolom-kind (`.bus-controls--select`) kan **ongebruikte verticale ruimte** tussen blokken creëren — bij stack-layout liever `flex: 0 1 auto`.

---

## Fase 2 — Lengte van het scherm aanpakken (kern)

**Volgorde:** eerst sprint „NEXT-context“ (countdown + tijdlijn-highlight) af — daarna onderstaande stappen voor compactere ritregels.

| Stap | Actie | Status |
|------|--------|--------|
| — | **Countdown bij NEXT** (geschatte minuten tot vertrek, alleen **vandaag**) + DOM-verversing op interval / visibility. | **Gedaan** |
| — | **Zelfde „next“ als hero visueel in de tijdlijn** (heldere rij-highlight voor eerste nog-te-komen rit). | **Gedaan** |
| 2.1 | Per vertrektijd: toon **max. 2–3** bestemmings-chips; rest als **`chipMoreStops`** / **`chipMoreSuffix`** (klikbaar). | Open |
| 2.2 | **Sheet of modal** bij tik: `sheetTitleDeparture` of `sheetTitleWhereBusGoes`, ondertitel `sheetSubtitleStopFull` / `sheetSubtitleStopShort`, optioneel `sheetFooterPlansChange`, knoppen `btnClose` / `btnDone`, **`ariaAdditionalDestinations`** op de chip. | Open |
| 2.3 | *(Geïntegreerd in sprint hierboven.)* Highlight „eerstvolgende rit“ in tijdlijn — zie eerste rijen van deze tabel. | **Gedaan** |

**Deliverable:** minder verticale hoogte per rit; detail op aanvraag — onderdelen **2.1 + 2.2** nog.

*(De invoerbalk gebruikt nu een **datumveld** i.p.v. dag-chips; deze fase gaat vooral over **compactere ritregels** in het schema.)*

---

## Fase 3 — Scanbaarheid en modus

| Stap | Actie |
|------|--------|
| 3.1 | **Tijdvakken** in de lijst: subtiele koppen (bijv. Morning / Midday / Evening) op basis van vertrektijd — copy desgewenst taalgebonden in `busStrings`. *(Variant later: inklapbare dagdelen — zie Voortgang.)* |
| 3.2 | **Filtered-mental model:** als “Where to?” een specifieke bestemming is, toon een duidelijke regel *“Filtered for …”* (nieuwe keys later in JSON) en optioneel toggle **“All departures today”** voor power users. |

**Deliverable:** sneller scrollen naar relevant deel; minder zoekwerk bij gekozen bestemming.

---

## Fase 4 — Vertrouwen en context op het juiste moment

| Stap | Actie |
|------|--------|
| 4.1 | **Hero-kaart:** één actieregel (bijv. “Be at the main-road stop …”) + link **Maps** naar halte (copy uitbreiden in `bus-strings` wanneer gebouwd). |
| 4.2 | **Offline / cache:** badge bij “Last updated” (bijv. offline + cached schedule) — keys uitbreiden in `bus-strings` wanneer gebouwd. |
| 4.3 | Legenda **standaard ingeklapt** na eerste bezoek (`localStorage`), kop bv. “Symbols” met bestaande iconen-uitleg. |

---

## Fase 5 — Verfijning en meten

| Stap | Actie |
|------|--------|
| 5.1 | **Breakpoint-check:** desktop met brede pills behouden; mobiel alleen compact + sheet. |
| 5.2 | **Touch targets** ≥ ~44px voor chips die een sheet openen. |
| 5.3 | Optioneel **GA4-events**: sheet open, filter change, KTEL-link (privacy-bewust). |

---

## Prioriteit als tijd beperkt is

1. **Must:** **Fase 2.1 + 2.2** — compactere ritregels en sheet/modal (countdown + tijdlijn-highlight zijn afgerond).
2. **Should:** **Fase 3.1** (tijdvak-koppen; optioneel later inklapbare dagdelen) + breakpoint-/touch-polish (**geen** sticky hero meer als doel).
3. **Nice:** Fase 3.2 + Fase 4.

---

## Afhankelijkheden

- **Geen n8n-wijziging** nodig voor puur UI copy/layout als de payload hetzelfde blijft.
- **`bus.html` / `bus-el.html`:** zelfde `app.js`; taal via `document.documentElement.lang` of bestaande `busLang()`.

---

## Gerelateerde bestanden

- [`locales/bus-strings.json`](../locales/bus-strings.json) — EN/EL copy en placeholders
- [`bus.html`](../bus.html) / [`bus-el.html`](../bus-el.html) — markup invoerpaneelen + trust-`dialog`
- [`app.js`](../app.js) — datum-offset (`busScheduleTargetYmd`, date input), trust-UI (`refreshBusTrustUi`), NEXT-ETA (`busRefreshNextEtaDom`), pelion-mapdialog
- [`style.css`](../style.css) — invoerpanels, timelines (`.bus-timeline-*`, `.bus-next-eta--timeline`), NEXT-highlight
- [`service-worker.js`](../service-worker.js) — cache; versie-cache voor `*.css?v=` / `*.js?v=`
- [`docs/google-play-pwa.md`](google-play-pwa.md) — Play Store / TWA (apart onderwerp)
