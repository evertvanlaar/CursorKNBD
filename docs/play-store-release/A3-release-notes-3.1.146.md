# A3 — Release notes (website 3.1.146)

**Doel:** Contactadres van de site en de app naar info@kanteklik.nl. 3.1.145 draaide al, daarom een nieuwe cache-versie.

**Website:** `asset-version.txt` → **3.1.146** (via `scripts/sync-asset-version.mjs`)

**Android / Play:** geen nieuwe TWA-build. Contact in Play Console is al **info@kanteklik.nl**.

---

## Wat is nieuw

1. Footer, privacy, schema.org en het Meer-menu gebruiken **info@kanteklik.nl** (was info@spiti.tech). E-mailadressen van bedrijven op hun eigen pagina blijven van de ondernemer.

## Deploy

1. Deploy site (`app.js`, `style.css`, `service-worker.js`, root + `business/*.html` met `?v=3.1.146`)
2. Hard refresh / SW-update (`kalanera-cache-v3.1.146`)
3. Footer Contact en Meer → Contact tonen info@kanteklik.nl; versie onderaan **v3.1.146**
