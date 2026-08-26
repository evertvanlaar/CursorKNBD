# OneSignal web push (tester)

**Status:** niet publiek. SDK laadt alleen na `?onesignal=1`.  
**Website:** `asset-version.txt` → **3.1.134**  
**OneSignal-app:** Custom Code, Site URL **`https://kalanera.gr`** (apex — `www` redirect hierheen), App ID in `app.js`

## Wat bezoekers zien

Niets. Geen balk, geen OneSignal-script, privacytekst ongewijzigd. Alleen de gewone PWA-cache-update (`kalanera-cache-v3.1.134`).

## Zelf testen

Chrome of Edge, **niet** incognito. De SDK blijft achter `?onesignal=1` (localStorage). Geen testbalk.

1. Open [https://kalanera.gr/?onesignal=1](https://kalanera.gr/?onesignal=1)
2. Bel rechtsonder (vaag tot hover) — al geopt-in: meldingen beheren
3. Test-push via OneSignal **Test & preview** naar je test-subscription

In OneSignal **Settings → Web → Site URL** moet `https://kalanera.gr` staan (zonder `www`), anders matcht de origin niet.

De vlag blijft in die browser staan (`localStorage` `kalanera_onesignal_test`). Uitzetten: [https://kalanera.gr/?onesignal=0](https://kalanera.gr/?onesignal=0)

Andere browser of toestel: opnieuw `?onesignal=1`.

## Techniek

| Onderdeel | Keuze |
|-----------|--------|
| Integratie | Custom Code (pad niet in dashboard) |
| Worker | `/push/onesignal/OneSignalSDKWorker.js`, scope `/push/onesignal/` |
| PWA-SW | blijft scope `/`; slaat `/push/` over |
| Init | `app.js` → `kalanera.gr` / `www.kalanera.gr` + tester-vlag |
| Native Android SDK | niet gebruikt (TWA = web push) |

## Publiek aanzetten (later)

1. Tester-gate in `app.js` weg of omkeren
2. Privacy EN/EL + Play Data safety
3. Soft prompt i.p.v. bel, of bel uitzetten
4. Versie bump + sync-script
