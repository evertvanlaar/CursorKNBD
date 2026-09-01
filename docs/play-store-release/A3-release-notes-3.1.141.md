# A3 — Release notes (website 3.1.141)

**Doel:** OneSignal web push volledig uit de site halen (SDK, worker, More/footer/kaart).

**Website:** `asset-version.txt` → **3.1.141** (via `scripts/sync-asset-version.mjs`) — **niet live; opgevolgd door [3.1.143](./A3-release-notes-3.1.143.md)**

**Android / Play:** geen nieuwe TWA-build; geen store-listing-wijziging. Web push was nooit publiek.

---

## Wat is nieuw

1. Geen OneSignal SDK, geen `/push/onesignal/` worker, geen Notifications-rij in More, geen footerlink, geen opt-in-kaart.
2. Testers die eerder `?onesignal=1` gebruikten: de oude OneSignal-worker wordt bij laden afgemeld.
3. Overige site-functionaliteit ongewijzigd (listings, bedrijfspagina’s, PWA-cache).

Bezoekers zagen de tester-UI al niet; 3.1.141 verwijdert de code.

---

## Deploy

1. Deploy site (`app.js`, `style.css`, `service-worker.js`, root + `business/*.html` met `?v=3.1.141`)
2. Hard refresh / SW-update (`kalanera-cache-v3.1.141`)
