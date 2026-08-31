# OneSignal web push (tester)

**Status:** niet publiek. SDK en UI laden alleen na `?onesignal=1`.  
**Website:** `asset-version.txt` → **3.1.138**  
**OneSignal-app:** Custom Code, Site URL **`https://kalanera.gr`** (apex — `www` redirect hierheen), App ID in `app.js`

## Wat bezoekers zien

Niets. Geen bel, geen kaart, geen footerlink, geen More-rij, geen OneSignal-script. Alleen de gewone PWA-cache-update (`kalanera-cache-v3.1.138`).

Testers zijn geen namenlijst. Alleen wie in **die browser** [https://kalanera.gr/?onesignal=1](https://kalanera.gr/?onesignal=1) opent (vlag in `localStorage`). Andere telefoon/browser: opnieuw die link. Dashboard **Test Users** is alleen voor testduwtjes, niet voor de site-UI.

## Zelf testen

Chrome of Edge, **niet** incognito.

1. Open [https://kalanera.gr/?onesignal=1](https://kalanera.gr/?onesignal=1)
2. Als meldingen **uit** staan en de browser nog **Vragen** is: na ~1s de kaart “Events & news from Kala Nera?” → **Allow** / **Not now**
3. **Allow** opent daarna de **echte** browserprompt (eenmalig). Bij toestaan: switch **On**
4. **Mobiel:** More (···) → **Notifications** (On / Off)  
   **Desktop:** footer Info → **Notifications · On/Off**
5. Test-push via OneSignal **Test & preview**

Uitzetten als tester: [https://kalanera.gr/?onesignal=0](https://kalanera.gr/?onesignal=0)

## Kaart, browserprompt, switch

De kaart is **niet** de browsermachtiging. **Allow** op de kaart start de browserprompt. Na toestaan staat de app op **On**.

| Besturing | Wat het doet |
|-----------|----------------|
| Kaart Allow | Kaart weg + browserprompt (als de site nog geen toestemming heeft) + bij ja: On |
| Kaart Not now | Geen browserprompt. Switch blijft Off |
| More/footer On/Off | Alleen of Kala Nera pushes mag sturen. Geen nieuwe browserprompt als Edge/Chrome al **Toestaan** is |
| Browser slotje | Echte machtiging. **Vragen** = opnieuw prompt mogelijk. **Blokkeren** = switch **Blocked**, geen kaart |

**On** in More telt alleen als de **browser** toestemming heeft **én** OneSignal opted-in is. Intrekken via het slotje zet de switch terug op Off (niet meer het oude OneSignal-abonnement).

## Kaart — wanneer

| Actie | Gedrag |
|-------|--------|
| Zichtbaar | Tot **Allow** of **Not now** (geen timer). ~1s na SDK-load. Alleen bij switch Off. |
| Allow | Weg zolang subscribed + browser Toestaan |
| Not now | 7 dagen weg; daarna nog **1** keer. Na 2× Not now nooit meer automatisch |
| Andere pagina dezelfde sessie | Niet opnieuw |
| Al On of Blocked | Geen kaart. Beheer blijft in More/footer |
| Install-banner open | Geen push-kaart (niet stapelen) |

## Opnieuw vanaf het begin (Edge)

1. Slotje op `https://kalanera.gr` → Meldingen → **Vragen** (niet Blokkeren)
2. [https://kalanera.gr/?onesignal=1&onesignal_banner=reset](https://kalanera.gr/?onesignal=1&onesignal_banner=reset)
3. Hard refreshen. Switch **Off**, kaart zichtbaar. Allow → Edge-prompt → On

| Link | Effect |
|------|--------|
| `?onesignal=1` | Tester aan (blijft in die browser) |
| `?onesignal=1&onesignal_banner=reset` | Tester blijft aan; snooze van de kaart wissen |
| `?onesignal=0` | Tester uit: geen SDK, geen UI |

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
| Switch | browser `Notification.permission` + OneSignal `optedIn` (3.1.137+) |
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
