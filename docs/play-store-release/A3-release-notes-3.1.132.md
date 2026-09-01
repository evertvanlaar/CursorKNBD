# A3 — Release notes (website 3.1.132)

**Doel:** OneSignal web push intern testbaar maken, zonder zichtbare wijziging voor bezoekers.

**Website:** `asset-version.txt` → **3.1.132** (via `scripts/sync-asset-version.mjs`)

**Android / Play:** geen nieuwe TWA-build; geen store-listing-wijziging. Push blijft uit voor het publiek.

Zie [`A3-release-notes-3.1.143.md`](./A3-release-notes-3.1.143.md) — OneSignal is verwijderd (niet meer testen).

---

## Wat is nieuw

1. **OneSignal Web SDK** achter `?onesignal=1` (localStorage-vlag). Standaard laadt de SDK niet.
2. **Service worker** `/push/onesignal/OneSignalSDKWorker.js` — eigen scope, PWA-cache op `/` blijft.
3. Root-SW slaat `/push/` over zodat OneSignal niet in de site-cache belandt.

---

## English (EN) — kort

Niet voor Play “What’s new”: geen publieke feature.

```
• Internal: optional web push test (not shown to visitors)
```

## Greek (EL) — kort

Niet voor Play “What’s new”: geen publieke feature.

```
• Εσωτερικό: δοκιμή web push (δεν εμφανίζεται στους επισκέπτες)
```

---

## Deploy-checklist

1. Deploy site (`app.js`, `style.css`, `service-worker.js`, `push/onesignal/`, root + `business/*.html` met `?v=3.1.132`)
2. Hard refresh / SW-update (`kalanera-cache-v3.1.132`)
3. Gewone homepage: geen bel
4. [https://www.kalanera.gr/?onesignal=1](https://www.kalanera.gr/?onesignal=1) → bel → Allow → OneSignal Subscriptions
