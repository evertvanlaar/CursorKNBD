# OneSignal web push (tester)

**Status:** niet publiek. SDK laadt alleen na `?onesignal=1`.  
**Website:** `asset-version.txt` → **3.1.136**  
**OneSignal-app:** Custom Code, Site URL **`https://kalanera.gr`** (apex — `www` redirect hierheen), App ID in `app.js`

## Wat bezoekers zien

Niets. Geen bel, geen kaart, geen footerlink, geen OneSignal-script. Alleen de gewone PWA-cache-update (`kalanera-cache-v3.1.136`).

## Zelf testen

Chrome of Edge, **niet** incognito. De SDK blijft achter `?onesignal=1` (localStorage). Geen OneSignal-bel.

1. Open [https://kalanera.gr/?onesignal=1](https://kalanera.gr/?onesignal=1)
2. Als meldingen **uit** staan: na ~1s de kaart “Events & news from Kala Nera?” → **Allow** / **Not now**
3. **Mobiel:** More (···) → **Notifications** (On / Off)
4. **Desktop:** footer Info → **Notifications · On/Off**
5. Test-push via OneSignal **Test & preview**

Al geopt-in? Zet **Off** in More/footer om de kaart te zien. Snooze wissen: [https://kalanera.gr/?onesignal=1&onesignal_banner=reset](https://kalanera.gr/?onesignal=1&onesignal_banner=reset)

Uitzetten: [https://kalanera.gr/?onesignal=0](https://kalanera.gr/?onesignal=0)

## Kaart — wanneer

| Actie | Gedrag |
|-------|--------|
| Zichtbaar | Tot **Allow** of **Not now** (geen timer). ~1s na SDK-load. |
| Allow | Weg; komt niet terug zolang je subscribed bent. |
| Not now | 7 dagen weg; daarna nog **1** keer. Na 2× Not now nooit meer automatisch. |
| Andere pagina dezelfde sessie | Niet opnieuw (tot nieuw browsertab/sessie). |
| Al On of Blocked | Geen kaart. Beheer blijft in More/footer. |
| Install-banner open | Geen push-kaart (niet stapelen). |

In OneSignal **Settings → Web → Site URL** moet `https://kalanera.gr` staan (zonder `www`).

## Techniek

| Onderdeel | Keuze |
|-----------|--------|
| Integratie | Custom Code (pad niet in dashboard) |
| Worker | `/push/onesignal/OneSignalSDKWorker.js`, scope `/push/onesignal/` |
| PWA-SW | blijft scope `/`; slaat `/push/` over |
| Init | `app.js` → `kalanera.gr` / `www.kalanera.gr` + tester-vlag |
| Bel | uit (`notifyButton.enable: false`) |
| Tester-UI | kaart + More-rij (mobiel) + footerlink (desktop ≥992px) |
| Native Android SDK | niet gebruikt (TWA = web push) |

## Publiek aanzetten (later)

1. Tester-gate in `app.js` weg of omkeren
2. Privacy EN/EL + Play Data safety
3. Versie bump + `node scripts/sync-asset-version.mjs`

## Roadmap — eigen meldingen-UI

| Waar | Eerste opt-in | Beheren (aan/uit) |
|------|----------------|-------------------|
| App / mobiele site | **Klaar (tester):** kaart Allow / Not now | **Klaar (tester):** More → Notifications |
| Desktop-site | **Klaar (tester):** dezelfde kaart | **Klaar (tester):** footer Info → Notifications |

Niet doen: zwevende bel of extra FAB. Privacy-pagina’s blijven zonder SDK.
