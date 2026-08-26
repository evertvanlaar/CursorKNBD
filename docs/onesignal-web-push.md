# OneSignal web push (tester)

**Status:** niet publiek. SDK laadt alleen na `?onesignal=1`.  
**Website:** `asset-version.txt` → **3.1.132**  
**OneSignal-app:** Custom Code, Site URL `https://www.kalanera.gr`, App ID in `app.js`

## Wat bezoekers zien

Niets. Geen bel, geen OneSignal-script, privacytekst ongewijzigd. Alleen de gewone PWA-cache-update (`kalanera-cache-v3.1.132`).

## Zelf testen

Chrome of Edge, **niet** incognito, op productie:

1. Open [https://www.kalanera.gr/?onesignal=1](https://www.kalanera.gr/?onesignal=1)
2. Controleer [OneSignalSDKWorker.js](https://www.kalanera.gr/push/onesignal/OneSignalSDKWorker.js) — moet de `importScripts`-regel tonen
3. Bel rechtsonder → Allow
4. OneSignal dashboard → **Audience → Subscriptions** → device **Subscribed** → **Add to Test Users**
5. **Messages → New Push** naar Test Users

De vlag blijft in die browser staan (`localStorage` `kalanera_onesignal_test`). Uitzetten: [https://www.kalanera.gr/?onesignal=0](https://www.kalanera.gr/?onesignal=0)

Andere browser of toestel: opnieuw `?onesignal=1`.

## Techniek

| Onderdeel | Keuze |
|-----------|--------|
| Integratie | Custom Code (pad niet in dashboard) |
| Worker | `/push/onesignal/OneSignalSDKWorker.js`, scope `/push/onesignal/` |
| PWA-SW | blijft scope `/`; slaat `/push/` over |
| Init | `app.js` → alleen `www.kalanera.gr` + tester-vlag |
| Native Android SDK | niet gebruikt (TWA = web push) |

## Publiek aanzetten (later)

1. Tester-gate in `app.js` weg of omkeren
2. Privacy EN/EL + Play Data safety
3. Soft prompt i.p.v. bel, of bel uitzetten
4. Versie bump + sync-script
