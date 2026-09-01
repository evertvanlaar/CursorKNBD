# A3 — Release notes (website 3.1.142)

**Doel:** More-menu herstellen op LAN-test (HTTP op telefoon).

**Website:** `asset-version.txt` → **3.1.142** (via `scripts/sync-asset-version.mjs`) — **niet live; opgevolgd door [3.1.143](./A3-release-notes-3.1.143.md)**

**Android / Play:** geen nieuwe TWA-build.

---

## Wat is nieuw

1. OneSignal-worker-opruiming crasht niet meer op `http://192.168…` (geen service worker op onveilige origin). More-tab bindt weer.
2. Verder gelijk aan 3.1.141 (OneSignal verwijderd).

---

## Deploy

1. Deploy site met `?v=3.1.142`
2. Hard refresh / SW-update (`kalanera-cache-v3.1.142`)
