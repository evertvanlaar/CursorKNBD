# Bus UI — plan van aanpak (roadmap)

Gebaseerd op UX-advies voor het busschema (mobiel/desktop, EN/EL) en de copy in [`locales/bus-strings.json`](../locales/bus-strings.json). **Huidige richting (mei 2026):** compacte **verticale tijdlijn**, **alle bestemmingen per vertrektijd** als **doorlopende tekst** (geen pills, geen frequentie in de rij — dagfilter dekt dat), **max. 2 regels** met ellipsis waar nodig, **geen** focus/toggle meer.

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
  - In het **volledige schema**: **eerstvolgende rit** (vandaag: zelfde **10 min**-buffer als filtering; andere gekozen dag: **eerste rit van die dag**) heeft **oranje stip + bus-icoon** en zachte rij-highlight (consistent met ΠΡΩΤΟ/FIRST).
- **Tijdlijn UI — layout & PWA-cache (iteraties mei 2026):**
  - **NEXT** en volledig schema delen dezelfde **tijdlijnsweergave**; **tijdkolom** compacter; **bestemmingen links uitgelijnd** naast de tijd (meer bruikbare breedte).
  - **ETA onder de tijd:** timeline-ETA onder de kloktekst.
  - **Grieks** `nextDepartMinutes`: verkorte vorm **`Σε ~{n} λ.`**
  - **`bus-timeline-wrap`** + compacte **`li`-padding**; NEXT-highlight **`::before`** over volle rijbreedte.
  - **Brede witte kaart:** `bus-section` **max-width 1040px**, `main-container` **1140px**; mobiel iets meer contentbreedte.
  - **`service-worker.js`:** **`style.css?v=` / `app.js?v=`** network-first om oude SW-cache bij deploy te vermijden (PWA/geïnstalleerde app).
- **Compacte ritregels (huidige oplossing i.p.v. chips + sheet):**
  - Alle bestemmingen per vertrektijd als **doorlopende tekst**, gescheiden door **` · `** (HTML-units zodat er geen los scheidingsteken aan het begin van een nieuwe regel komt).
  - **Geen** pills, **geen** Font Awesome-patroon-iconen in de rij, **geen** frequentie/dagen-tekst in de rij (frontend filtert al op gekozen kalenderdag).
  - **Max. 2 regels** per rij (`bus-route-stops--clamp` + `-webkit-line-clamp: 2`); volledige lijst blijft in **`aria-label`** op het `<li>`.
  - **Geen** `bus-schedule-view-controls` (hint + toggle); **geen** focusmodus, **geen** tik-op-tijd expand, **geen** `localStorage` `kalanera_bus_schedule_full_row_stops`.
  - **Legenda “symbols”** onder het schema: **verwijderd** (symbolen niet meer in gebruik in de lijst).

### Bewust niet gerealiseerd

- **Sticky invoerzone op mobiel** (oud stap 1.2): geprobeerd met CSS `position: sticky` en daarna met een JS fixed-pin fallback — **volledig teruggedraaid**. In deze layout/stack bleek sticky niet betrouwbaar; er is gekozen voor een **compacte vaste kop** i.p.v. plakkende invoer.

### Nog open / optioneel (niet gecommitteerd)

- **Fase 3.1 — tijdvak-koppen** (Morning / Midday / Evening): nog niet gebouwd.
- **“Filtered for …”-kop** of **alle `dir` in één lijst** (fetch/API-merge): nog niet; blijft aparte epic als ooit gewenst.
- **Fase 2.1 / 2.2 (chips + sheet):** niet meer nodig voor de huidige UX; alleen nog relevant als je **per rit extra detail** wilt (haltes, uitzonderingen) zonder de lijst langer te maken — dan desgewenst heropenen.

### Ideeën op reserve (nog niet gebouwd)

- Optionele **microkoppen** (kleine caps of sr-only) boven de twee invoerpaneelen voor extra hiërarchie — alleen als het visueel nog steeds rustig blijft.
- **Fase 3.1-variant:** tijdvakken niet alleen als koppen, maar optioneel **inklapbare blokken** per dagdeel — alleen als het geen extra tik-last wordt.

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
- **Focus + toggle** werkte technisch, maar werd **bewust teruggedraaid**: het rooster is al gefilterd op bestemming + dag; **één compacte tekstregel** met alle slot-bestemmingen is eenvoudiger dan modi wisselen.

---

## Fase 2 — Lengte van het scherm aanpakken (kern)

**Status:** het oorspronkelijke doel (“minder hoogte per rit”) is bereikt met **doorlopende bestemmingstekst + 2-regels clamp**, niet met chips + sheet.

| Stap | Actie | Status |
|------|--------|--------|
| — | **Countdown bij NEXT** (geschatte minuten tot vertrek, alleen **vandaag**) + DOM-verversing op interval / visibility. | **Gedaan** |
| — | **Highlight eerste relevante rit in tijdlijn** (oranje stip + bus waar van toepassing). | **Gedaan** |
| 2.1 | Per vertrektijd: max. 2–3 **chips** + `chipMoreStops` / `chipMoreSuffix`. | **Niet gepland** — vervangen door compacte tekst + clamp |
| 2.2 | **Sheet/modal** bij tik voor volledige detail. | **Niet gepland** — zelfde; optioneel later als aparte feature |
| 2.3 | Highlight „eerstvolgende rit“ / eerste rit van de dag in tijdlijn. | **Gedaan** |

*(De invoerbalk gebruikt een **datumveld** i.p.v. dag-chips.)*

---

## Fase 3 — Scanbaarheid en modus

| Stap | Actie | Status |
|------|--------|--------|
| 3.1 | **Tijdvak-koppen** (Morning / Midday / Evening) — copy in `busStrings` indien gebouwd. | Open |
| 3.2 | **Focusmodus + toggle** (`showFullRowStops`, hint, uitklap per tijd). | **Verwijderd uit product** — vervangen door altijd-tonen + compacte tekst |

**Deliverable (huidig):** stabiele, scanbare tijdlijn zonder moduswissel; volledige bestemmingsinformatie in aria waar de zichtbare tekst afkapt.

---

## Historisch: focusmodus en toggle (niet meer actief)

Eerder is **focus + toggle** ontworpen om per vertrektijd alleen de gekozen picker-bestemming te tonen en de rest achter een actie te verbergen. Dat is **niet meer** de gekozen richting: de UI toont nu **altijd** alle bestemmingen die het rooster aan dat tijdslot koppelt (als tekst, max. 2 zichtbare regels). De onderstaande bullets zijn alleen ter **documentatie** van het oude besluit.

- **Oude idee:** `showFullRowStops` + `localStorage` `kalanera_bus_schedule_full_row_stops`, `bus-schedule-view-controls`, tik op tijdkolom voor `bus-route-stops--revealed`.
- **Huidige code:** `busUnifiedDestinationsHtml(bus, routeDirKey)` zonder focus-flag; `busRenderTimelineList` zonder expandable kolom; gerelateerde strings (`scheduleFocusHint`, enz.) uit embedded copy gehaald.

---

## Fase 4 — Vertrouwen en context op het juiste moment

| Stap | Actie | Status |
|------|--------|--------|
| 4.1 | **Hero-kaart:** één actieregel + link **Maps** naar halte (copy in `bus-strings` wanneer gebouwd). | Open |
| 4.2 | **Offline / cache:** badge bij “Last updated” (offline + cached schedule) — keys in `bus-strings` wanneer gebouwd. | Open |
| 4.3 | Legenda **symbols** onderaan. | **Geschrapt** — geen symbolen meer in ritregels |

---

## Fase 5 — Verfijning en meten

| Stap | Actie |
|------|--------|
| 5.1 | **Breakpoint-check:** compacte tekst + clamp op smal vs. breder scherm (eventueel clamp alleen mobiel). |
| 5.2 | Touch targets voor primaire acties (info, dagkiezer, bestemming) blijven ≥ ~44px waar relevant. |
| 5.3 | Optioneel **GA4-events**: filter change, KTEL-link (privacy-bewust). |

---

## Prioriteit als tijd beperkt is

1. **Should:** **Fase 3.1** (tijdvak-koppen) als de lijst verder leesbaarheid kan gebruiken.
2. **Nice:** **Fase 4.1 / 4.2** (context rond halte + offline-badge bij last updated).
3. **Nice:** “alle `dir`s in één lijst” (API/fetch-merge) — aparte epic.
4. **Alleen bij nieuwe inhoudsbehoefte:** heropen **sheet/modal (oud 2.2)** voor diepere ritinfo, los van de huidige compacte lijst.

---

## Afhankelijkheden

- **Geen n8n-wijziging** nodig voor puur UI copy/layout als de payload hetzelfde blijft.
- **`bus.html` / `bus-el.html`:** zelfde `app.js`; taal via `document.documentElement.lang` of bestaande `busLang()`.

---

## Gerelateerde bestanden

- [`locales/bus-strings.json`](../locales/bus-strings.json) — EN/EL copy en placeholders
- [`bus.html`](../bus.html) / [`bus-el.html`](../bus-el.html) — markup invoerpaneelen + trust-`dialog`
- [`app.js`](../app.js) — `busRenderTimelineList`, `busUnifiedDestinationsHtml`, NEXT-ETA, cache-keys (`BUS_STORAGE_KEY`, …)
- [`style.css`](../style.css) — `.bus-timeline-*`, `.bus-route-stops--compact`, `.bus-route-stops--clamp`, NEXT-highlight
- [`service-worker.js`](../service-worker.js) — cache; versie-cache voor `*.css?v=` / `*.js?v=`
- [`docs/google-play-pwa.md`](google-play-pwa.md) — Play Store / TWA (apart onderwerp)
