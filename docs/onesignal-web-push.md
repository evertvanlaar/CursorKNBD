# OneSignal web push (tester)

**Status:** niet publiek. SDK laadt alleen na `?onesignal=1`.  
**Website:** `asset-version.txt` → **3.1.133**  
**OneSignal-app:** Custom Code, Site URL **`https://kalanera.gr`** (apex — `www` redirect hierheen), App ID in `app.js`

## Wat bezoekers zien

Niets. Geen bel, geen OneSignal-script, privacytekst ongewijzigd. Alleen de gewone PWA-cache-update (`kalanera-cache-v3.1.133`).

## Zelf testen

Chrome of Edge, **niet** incognito:

1. Open [https://kalanera.gr/?onesignal=1](https://kalanera.gr/?onesignal=1) (`www` springt hier automatisch naartoe)
2. Bovenaan een donkere testbalk: “OneSignal-test klaar” + knop **Meldingen toestaan**
3. Eventueel bel rechtsonder
4. OneSignal dashboard → **Audience → Subscriptions** → **Add to Test Users**
5. **Messages → New Push** naar Test Users

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
