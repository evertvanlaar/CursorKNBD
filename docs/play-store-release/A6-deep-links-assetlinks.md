# A6 — Deep links / Digital Asset Links (uitgesteld)

**Status:** Production access verkregen (jun 2026). Fix doorgevoerd in TWA build **8 (3.1.45)** — aligned met `asset-version.txt`; zie `kalanera-twa/app/build.gradle`.  
**App:** Kala Nera Guide · `com.kalanera.app` · TWA  
**Betrokken build bij diagnose:** versionCode **7** · **3.1.40**

**Regel:** Geen server- of redirect-wijzigingen tijdens lopende production review. Eerdere poging redirect aan te passen bij provider veroorzaakte grote websiteproblemen → change teruggedraaid.

---

## Samenvatting

Google Play Console toont een waarschuwing dat **deep links niet werken** omdat het domein **`www.kalanera.gr`** niet aan de app gekoppeld is. De app zelf (openen via Play Store-icoon) werkt gewoon. Dit is **geen blocker** voor de production access-aanvraag.

**Oorzaak:** `assetlinks.json` is correct bereikbaar op `kalanera.gr` (zonder www), maar **niet** op `www.kalanera.gr` — Google krijgt daar een **redirect**, en redirects worden bij domeinverificatie geweigerd. De app claimt juist `www.kalanera.gr`.

**Aanbevolen oplossing (later):** app-side fix — TWA host wijzigen naar `kalanera.gr` (zonder www), zonder hosting/redirects aan te raken.

---

## Wat de Play Console-melding betekent

### Eerste notificatie (dashboard)

> *"One deep link may be failing because your web domains aren't associated with your app"*

Op Android 12+ kan de app dan **niet automatisch** web-URL's openen; gebruikers landen in de browser of app-kiezer.

### Deep links-pagina (jun 2026)

Navigatie: **Grow users → Deep links** (app-versie **7 (3.1.40)**).

| Melding | Detail |
|---------|--------|
| 1 domain not verified | `www.kalanera.gr` |
| 1 link not working | `https://www.kalanera.gr/*` → `LauncherActivity` |
| Domain status | `www.kalanera.gr` — **2 issues found, Failed domain checks** |
| Web link status | `/*` op `www.kalanera.gr` — **1 issue found, Failed domain checks** |

Popup **"Patch your deep links setup"** is een nieuwe Play Console-functie (tijdelijke patches). Lost dit probleem **niet** op — de oorzaak zit op de server/domeinkoppeling, niet in een patch.

---

## Technische achtergrond

### Digital Asset Links (twee richtingen)

1. **Website → app:** `/.well-known/assetlinks.json` op het domein bevat `package_name` + SHA-256 fingerprint van het signing-certificaat.
2. **App → website:** `asset_statements` in de Android-app wijst naar het webdomein (`strings.xml` → `AndroidManifest.xml`).

Beide moeten consistent zijn met het domein in de intent-filter (`android:autoVerify="true"`).

### Huidige configuratie in repo

| Onderdeel | Waarde | Bestand |
|-----------|--------|---------|
| Package | `com.kalanera.app` | `kalanera-twa/app/build.gradle` |
| Intent-filter host | `www.kalanera.gr` | `build.gradle` → `hostName` |
| Launch URL | `https://www.kalanera.gr/index.html` | `build.gradle` |
| asset_statements (app → web) | `https://kalanera.gr` (**zonder www**) | `kalanera-twa/app/src/main/res/values/strings.xml` |
| assetlinks.json (web → app) | fingerprint + `com.kalanera.app` | `.well-known/assetlinks.json` |
| SHA-256 in assetlinks | `3F:A5:11:ED:3A:D7:52:3C:F0:7F:0C:8F:71:27:F9:1B:FC:B8:BC:11:99:B4:23:B3:12:42:2D:B6:AD:59:EC:A3` | `.well-known/assetlinks.json` |

**Inconsistentie:** intent-filter gebruikt `www`, `assetStatements` gebruikt non-www.

---

## Oorzaak (root cause)

### Primair: redirect op www-domein

Google Digital Asset Links API (jun 2026):

| Domein | Resultaat |
|--------|-----------|
| `https://kalanera.gr` | **OK** — statement gevonden, fingerprint klopt |
| `https://www.kalanera.gr` | **FOUT** — `ERROR_CODE_REDIRECT`: redirect bij ophalen `/.well-known/assetlinks.json`; redirects niet toegestaan |

De app claimt `www.kalanera.gr`, maar verificatie faalt omdat dat domein `assetlinks.json` niet **direct** (HTTP 200, geen redirect) serveert.

### Secundair: www vs. non-www mismatch in app

- Intent-filter: `www.kalanera.gr`
- `assetStatements`: `kalanera.gr`

Dit kan het tweede issue op de Deep links-pagina verklaren ("2 issues found").

### Mogelijk tertiair (controleren bij uitvoering)

Als Google Play **App Signing** een ander certificaat gebruikt dan de upload key, moet de **App signing key** SHA-256 in `assetlinks.json` staan (niet alleen upload key).

Controleren: Play Console → **Test and release → Setup → App integrity → App signing → SHA-256 certificate fingerprint**.

---

## Impact als we niets doen

| Wat | Effect |
|-----|--------|
| App openen via Play Store | Geen probleem |
| Production access-aanvraag | Geen blocker (aparte review) |
| Links delen (`https://www.kalanera.gr/...`) | Openen mogelijk in browser i.p.v. app (Android 12+) |
| TWA fullscreen-trust | Kan beperkt zijn voor www-URL's |
| SEO / website | Geen impact |

---

## Waarom nu niets doen

1. Production access-aanvraag loopt (review ~7 dagen).
2. Eerdere redirect-wijziging bij provider → grote websiteproblemen → teruggedraaid.
3. Deep-link-fix is **nice-to-have**, geen productie-blocker.
4. Server-side redirect-fix = hoog risico; app-side fix = laag risico (later).

---

## Oplossingsopties (voor later)

### Optie A — Aanbevolen: app-side fix (geen hosting wijzigen)

Wijzig TWA naar **`kalanera.gr`** (zonder www), waar `assetlinks.json` al werkt.

**Te wijzigen (indicatief):**

| Bestand | Wijziging |
|---------|-----------|
| `kalanera-twa/app/build.gradle` | `hostName: 'kalanera.gr'` |
| `kalanera-twa/app/src/main/res/values/strings.xml` | `"site": "https://kalanera.gr"` (al correct) |
| `kalanera-twa/app/src/main/res/xml/shortcuts.xml` | URLs naar `https://kalanera.gr/...` |
| `kalanera-twa/twa-manifest.json` | `host` en gerelateerde URL's consistent non-www |

**Daarna:** `bubblewrap build` of Gradle build → nieuwe `.aab` → closed/open test → production.

**Voordeel:** geen provider/redirect aanraken.  
**Nadeel:** nieuwe app-release nodig; patches in Play Console zijn tijdelijk en vervangen dit niet permanent.

### Optie B — Server-side fix (alleen als provider het veilig kan)

Zorg dat `https://www.kalanera.gr/.well-known/assetlinks.json` **zonder redirect** HTTP 200 retourneert (zelfde JSON als non-www).

**Risico:** hoog — eerdere ervaring met site-storingen. Alleen overwegen met provider die een **uitsluiting alleen voor `/.well-known/`** kan doen, zonder algemene redirect-regels te wijzigen.

### Optie C — Play Console patch

**Niet aanbevolen** voor dit probleem. Patches fixen geen `assetlinks.json`-redirect op de server.

---

## Vervolgacties (checklist — na production access)

### Fase 1 — Voorbereiding

- [ ] Production access-afhandeling afwachten (e-mail Play Console).
- [ ] Play Console → **App integrity** → SHA-256 **App signing key** noteren.
- [ ] Vergelijken met fingerprint in `.well-known/assetlinks.json`.
- [ ] Zo nodig fingerprint in `assetlinks.json` aanvullen (meerdere fingerprints toegestaan).

### Fase 2 — Implementatie (optie A)

- [ ] `hostName` en alle TWA-URL's naar `kalanera.gr` (non-www) alignen.
- [ ] Controleren dat `assetStatements` en intent-filter hetzelfde domein gebruiken.
- [ ] Nieuwe `.aab` bouwen en testen op fysiek Android-toestel (12+).
- [ ] Test: link `https://kalanera.gr/bus.html` opent in app (niet alleen browser).

### Fase 3 — Verificatie

- [ ] Google API check (vervang domein na deploy):

  ```
  https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://kalanera.gr&relation=delegate_permission/common.handle_all_urls
  ```

  Verwacht: `statements` array met `com.kalanera.app` en juiste fingerprint (geen `ERROR_CODE_REDIRECT`).

- [ ] Play Console → **Grow users → Deep links** → status groen na release (kan uren tot ~48u duren).

### Fase 4 — Release

- [ ] Upload nieuwe build naar closed test (korte smoke test).
- [ ] Daarna production track.

---

## Wat we bewust niet doen tijdens production review

- Geen redirect-regels bij hostingprovider wijzigen
- Geen Play Console deep-link patch
- Geen nieuwe `.aab` alleen voor deep links
- Geen wijzigingen aan live `assetlinks.json` tenzij fingerprint-check dat vereist (kan ook na goedkeuring)

---

## Referenties

| Onderwerp | Locatie |
|-----------|---------|
| assetlinks.json (repo) | `.well-known/assetlinks.json` |
| TWA manifest | `kalanera-twa/twa-manifest.json` |
| Android manifest | `kalanera-twa/app/src/main/AndroidManifest.xml` |
| PWA / TWA uitleg | `docs/google-play-pwa.md` |
| Production access context | `docs/play-store-release/A5-production-access-round2.md` |
| Play Console Deep links help | [Verify and maintain deep links](https://support.google.com/googleplay/android-developer/answer/12463044) |
| Digital Asset Links API | [Statement List API](https://developers.google.com/digital-asset-links/v1/getting-started) |

---

*Document aangemaakt: 9 jun 2026 — diagnose op basis van Play Console Deep links-pagina, codebase en Google Digital Asset Links API.*
