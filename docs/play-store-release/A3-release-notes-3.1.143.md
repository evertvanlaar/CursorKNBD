# A3 — Release notes (website 3.1.143)

**Doel:** OneSignal web push uit de site halen; More-menu weer werkend.

**Website:** `asset-version.txt` → **3.1.143** (via `scripts/sync-asset-version.mjs`)

**Android / Play:** geen nieuwe TWA-build; geen store-listing-wijziging. Web push was nooit publiek.

Dit is de **te deployen** versie (3.1.141–3.1.142 waren lokale tussenstappen).

---

## Wat is nieuw (t.o.v. 3.1.140)

1. **OneSignal verwijderd:** geen SDK, geen `/push/onesignal/` worker, geen Notifications-rij in More, geen footerlink, geen opt-in-kaart.
2. Testers die eerder `?onesignal=1` hadden: de oude OneSignal-worker wordt bij laden afgemeld (alleen als de browser een service worker heeft; op LAN-HTTP niet).
3. **More-menu:** `openMoreSheet` riep geen verwijderde OneSignal-functie meer aan — tap op More opent het sheet weer.

Bezoekers zagen de tester-UI al niet. Listings, bedrijfspagina’s en PWA-cache blijven.

---

## Deploy

1. Deploy site (`app.js`, `style.css`, `service-worker.js`, root + `business/*.html` met `?v=3.1.143`)
2. Hard refresh / SW-update (`kalanera-cache-v3.1.143`)
3. Op telefoon: More tikken — sheet moet openen; versie onderaan **v3.1.143**
