# PWA naar Google Play Store (Android)

Dit project is een **Progressive Web App** (o.a. `manifest.json`, service worker). Voor publicatie in de **Google Play Store** pak je die site meestal in als **Android-app via Trusted Web Activity (TWA)**: Chrome opent je domein fullscreen; je hoeft de site niet opnieuw te schrijven in Kotlin.

## Twee gangbare routes

### 1. PWABuilder (snelste start)

1. Open [PWABuilder](https://www.pwabuilder.com/).
2. Voer je productie-URL in (bijv. `https://www.kalanera.gr`).
3. Laat de PWA-analyse lopen en los eventuele waarschuwingen op (manifest, HTTPS, icons).
4. Kies **Package for Stores** → **Android** en volg de stappen om een project en **Android App Bundle (`.aab`)** te genereren.

### 2. Bubblewrap (CLI, meer controle)

1. Installeer [Node.js](https://nodejs.org/) en daarna bijvoorbeeld:  
   `npm install -g @bubblewrap/cli`
2. Voer `bubblewrap init` uit en vul URL + manifest-gegevens in (Bubblewrap haalt veel uit je live site).
3. Maak/gebruik een **upload key** voor signing (bewaar backups veilig).
4. `bubblewrap build` → output is onder andere een **`.aab`** voor Play Console.

Documentatie: [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap).

## Vereisten aan de website

| Onderdeel | Opmerking |
|-----------|-----------|
| HTTPS | Verplicht. |
| `manifest.json` | Geldige `name`, `short_name`, `icons` (o.a. 512×512), `start_url`, `scope`, `display`. |
| Icons | Play / TWA verwachten bruikbare store- en launcher-iconen; maskable waar nodig. |
| `start_url` / `scope` | Moeten logisch zijn voor hoe de app moet openen (bijv. start op homepage). |

## Digital Asset Links (belangrijk voor TWA)

De Play-app moet aan Google tonen dat hij **gemachtigd** is om jouw domein fullscreen te tonen. Dat gaat via **`/.well-known/assetlinks.json`** op **exact het domein** dat je in de app gebruikt (bijv. `https://www.kalanera.gr/.well-known/assetlinks.json`).

- PWABuilder en Bubblewrap geven je de **exacte JSON** (SHA-256 fingerprints van je **signing certificate**) nadat je keys/package hebt aangemaakt.
- Zonder correcte `assetlinks.json` werkt de TWA‑koppeling niet zoals bedoeld.

## Google Play Console (hoofdlijnen)

1. **Google Play Developer-account** aanmaken (eenmalige registratiekosten).
2. Nieuwe app aanmaken → Store listing (titel, beschrijving, screenshots), privacy policy URL, content rating, enz.
3. Onder **Release** een **production** (of internal/open testing) track: upload **`*.aab`** (nieuwe apps gebruiken bij voorkeur App Bundle, geen legacy APK-only workflow).
4. Na review kan de app live.

Actuele vereisten en formulieren staan altijd in de [Play Console Help](https://support.google.com/googleplay/android-developer).

## Alternatief: Capacitor / Cordova

Als je een **WebView-shell** met native plugins wilt (camera, meer maatwerk), kun je naar **Capacitor** of **Cordova** kijken. Dat is meer onderhoud dan een pure TWA, maar geeft meer vrijheid.

## Gerelateerde bestanden in deze repo

- `manifest.json` — PWA-manifest (naam, icons, `start_url`, …).
- `service-worker.js` — offline/cache-gedrag voor geïnstalleerde PWA.

## Handige externe links

- [Trusted Web Activity](https://developer.chrome.com/docs/android/trusted-web-activity/) (Chrome Developers)
- [PWABuilder](https://www.pwabuilder.com/)
- [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
