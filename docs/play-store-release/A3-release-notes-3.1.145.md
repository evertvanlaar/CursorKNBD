# A3 — Release notes (website 3.1.145)

**Doel:** Contactadres van de site en de app naar info@kanteklik.nl.

**Website:** `asset-version.txt` → **3.1.145** (via `scripts/sync-asset-version.mjs`)

**Android / Play:** geen nieuwe TWA-build. Listing-teksten in deze map noemen **info@kanteklik.nl**; het adres in Play Console zelf moet daar nog handmatig gelijk worden gezet als het oude adres er nog staat.

---

## Wat is nieuw

1. Footer, privacy, schema.org en het Meer-menu gebruiken **info@kanteklik.nl** (was info@spiti.tech). E-mailadressen van bedrijven op hun eigen pagina blijven van de ondernemer.
2. Bus: patroon **zaterdag** (label, icoon, korte en lange tekst) naast daily / weekdays / weekend.
3. Meer-menu: “New” op de buslink (`MORE_WHATS_NEW` id `2026-09-bus-v1`, tot 30-09-2026).

## Deploy

1. Deploy site (`app.js`, `style.css`, `service-worker.js`, root + `business/*.html` met `?v=3.1.145`)
2. Hard refresh / SW-update (`kalanera-cache-v3.1.145`)
3. Footer Contact en Meer → Contact tonen info@kanteklik.nl; versie onderaan **v3.1.145**
