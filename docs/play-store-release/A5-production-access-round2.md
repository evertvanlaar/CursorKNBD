# A5 — Production access formulier (2e aanvraag)

**Doel:** Kant-en-klare Engelse antwoorden voor het Google Play **Apply for production**-formulier na de **tweede** closed-testronde.

**App:** Kala Nera Guide · `com.kalanera.app` · TWA → `https://www.kalanera.gr`

**Context 1e afwijzing:** tester engagement + testing best practices (feedback verwerken via updates tijdens closed test).

**Regel:** Alleen claimen wat **live** staat. Geen dubbele korte/lange tekst in één veld plakken.

**Status (8 jun 2026):** Dashboard toont alle 3 vinkjes groen → **Apply for production** is actief.

---

## Jouw Play Console-cijfers (ingevuld)

| Veld | Waarde |
|------|--------|
| Track | Closed testing — Alpha |
| Opted-in testers | **56** |
| 14 opeenvolgende dagen | **Ja** (dashboard groen) |
| Huidige release | **7 (3.1.40)** · versionCode **7** · 8 jun 2026 |
| Recente closed-test releases | **4 (3.1.1)** 30 mei → **6 (3.1.36)** 3 jun → **7 (3.1.40)** 8 jun |
| Apply-knop | **Actief** |

---

## Vóór je indient — checklist

| Veld | Jouw waarde | Waar |
|------|-------------|------|
| Opted-in testers (min. 12) | **56** ✓ | Testers-tab |
| 14 opeenvolgende dagen gehaald? | **ja** ✓ | Dashboard |
| Aantal releases (recent) | **3** (vc 4, 6, 7) | Release history |
| Huidige build | **7** · **3.1.40** | Play Console |
| Extern testrapport | alleen intern; **niet** Testers Community in formulier noemen | Email/PDF |

**Technisch (TWA):**

- [ ] `https://www.kalanera.gr/.well-known/assetlinks.json` klopt
- [ ] Play listing + screenshots = huidige features
- [ ] Privacy-URL in app (More) en op kalanera.gr
- [ ] Geen “planned” features claimen als niet-live (o.a. onboarding, rate-app link)

**Timing:** Apply zodra Dashboard groen is (12+ testers, 14 dagen). Idealiter nadat testers de **laatste** closed-test build hebben gezien.

---

## Strategie t.o.v. 1e aanvraag

| 1e aanvraag (zwak) | 2e aanvraag (sterker) |
|--------------------|------------------------|
| Algemene stabiliteitszinnen | Concrete cijfers (testers, dagen, versionCodes) |
| “Onboarding/rate link planned” | Alleen **shipped** wijzigingen noemen |
| Eén testperiode | Expliciet: **second** 14-day closed test, **fresh** testers |
| Vooral betaalde testers | Betaalde testers + **developer on-device validation** + doelgroep |
| Geen release-iteratie | **2–3 updates** gekoppeld aan feedback |

**Geen Testers Community in het formulier** (Google vroeg om echte testers). Gebruik onderstaande teksten; zie ook [A5-invulsheet](./A5-invulsheet-production-access.md).

---

## Part 1: Tell us about your closed test

### Dropdown — How easy was it to recruit testers?

**Keuze:** `Very easy` (56 testers)

### Recruitment (vrij tekstveld)

```
After our first production-access request was declined for insufficient tester engagement, we ran a second 14-day closed test with 56 testers who opted in via Play Console on their own Android devices, plus my own regular on-device testing. I also validated core flows with family, residents, and visitors familiar with Kala Nera and Pelion. This round focused on sustained usage across the full test window and releasing updates based on feedback—not only initial installs.
```

### Engagement during closed test

```
56 testers remained opted in for 14 consecutive days during this second closed-test cycle.

Testers repeatedly used the app across main production flows: browsing the local business directory (category, area, and A–Z), opening business detail pages (call, website, maps), saving favorites, checking estimated bus departure times for the Kala Nera stop (direction, day, and time filters), and exploring the Pelion Guide section (flights, regional events, useful numbers, and bus).

Usage matched how we expect real visitors to use the app: short, task-focused sessions (find a place to eat or stay, check a bus time, save a favorite). Some testers explored all screens systematically; others used two or three features per session, which we consider normal for a location guide. Both English and Greek were tested.
```

### Feedback summary + how collected

```
Feedback: Testers reported strong stability in this round (no critical crashes), clear navigation, and useful core features (directory, favorites, estimated bus departure times for the Kala Nera stop, Pelion Guide). Reported issues were minor: install-help wording, weather widget display, and layout on newer Android versions.

How we collected it: Direct feedback from testers during the closed test, follow-up on reported issues, and my own test notes per release. We addressed actionable feedback in 3 closed-test releases during the test period (versionCode 4, 6, and 7 — releases 3.1.1, 3.1.36, and 3.1.40), and testers re-verified on the latest build (3.1.40) before we applied for production access.
```

**Jouw releases (Play Console):**

| versionName | versionCode | Datum closed test | Hoofdpunten |
|-------------|-------------|-------------------|-------------|
| 3.1.1 | 4 | 30 mei 2026 | Favorieten-fix, magazine UI |
| 3.1.36 | 6 | 3 jun 2026 | Install-flow, weather widget, stabiliteit |
| 3.1.40 | 7 | 8 jun 2026 | Android 15 / edge-to-edge, splash, shell (huidig) |

---

## Part 2: Tell us about your app/game

### Intended audience

```
Kala Nera Guide is for tourists and residents in Kala Nera, Kato Gatzea, Koropi, and visitors exploring the Pelion coast in Greece. The audience includes travelers planning meals, accommodation, or shopping; people who need local services and contact details; and users who want practical trip information (estimated bus departure times for the Kala Nera stop, flights to Volos airport, regional events, useful phone numbers). The app is bilingual (English and Greek).
```

### How your app provides value

```
Kala Nera Guide helps visitors and locals discover places to eat, stay, and shop; save favorites on the device (no account required); check estimated bus departure times for the Kala Nera stop (not an official KTEL timetable—clear disclaimers and links to official sources); and use the Pelion Guide hub (flights, events, useful numbers, walking inspiration).

The app is distributed on Google Play as a Trusted Web Activity (TWA): the Play package is a verified shell for https://www.kalanera.gr. Content and most feature updates are served from our production website (Digital Asset Links verified). TWA shell updates are released when Android compatibility or Play requirements change. Internet is required for current directory data; favorites are stored locally on the device. English and Greek.
```

### Expected installs (first year)

**Keuze:** `0 – 10,000`

Optionele toelichting (als er een vrij veld is):

```
Niche, location-specific tourism and local-services guide for the Pelion coast.
```

---

## Part 3: Tell us about your production readiness

### Changes made based on closed testing

```
During this second closed-test cycle we:

• Ran a full new 14-day test with a fresh tester group after our first production-access request was declined
• Released 3 updates on the closed testing track (versionCode 4 → 6 → 7; 3.1.1, 3.1.36, 3.1.40) during the test period
• Improved install-page flow and install-help copy based on tester feedback (3.1.36)
• Fixed weather widget display issues reported by testers (3.1.36)
• Improved Android 15 / edge-to-edge compatibility, splash screen, and full-screen layout (3.1.40)
• Updated Play Store listing text and screenshots to better reflect current features (directory, estimated bus times, favorites, Pelion Guide)
• Continued polishing directory navigation, bus disclaimers, and Pelion Guide discoverability from earlier feedback

Optional first-time tips and an in-app “rate the app” link remain on our post-launch roadmap—we did not claim them as shipped in this build.
```

**Belangrijk:** Verwijder de laatste zin over onboarding/rate-app als je die features intussen **wel** live hebt gezet.

### How you decided the app is ready for production

```
We completed a second 14-day closed test with 56 testers continuously opted in, addressing Google’s prior feedback on tester engagement and iterating on releases during the test window. Testing found no critical crashes and confirmed that core flows work as intended: directory browse by category and area, business details, favorites, estimated bus departure times for the Kala Nera stop, and Pelion Guide.

We addressed actionable feedback in multiple closed-test releases and had testers re-verify on the latest build (3.1.40, versionCode 7). Besides external test reports, I validated each release on real Android devices, reviewed layout and navigation across main flows, and confirmed that disclaimers (estimated bus times are not an official timetable) and privacy information match the shipped build.

The current release matches what we describe on Google Play. Privacy information is linked in the app (More menu) and published at kalanera.gr. We monitor feedback via info@spiti.tech.
```

---

## Wat vermijden in het formulier

| Vermijden | Waarom |
|-----------|--------|
| Verwijzing naar betaalde testdiensten | Google vroeg om “real testers”; niet noemen in ronde 2 |
| “Planned” / “will add” zonder shipped release | Zwak t.o.v. “testing best practices” |
| Vage zinnen (“stable, good UX”) zonder flows/releases | Te generiek; klinkt als template |
| Dubbele tekst (kort + lang in hetzelfde veld) | Slordig; gebruik één polished versie |
| Features claimen die niet in de app staan | Mismatch met listing/review |
| Refund-garanties of interne mail testers-community | Irrelevant voor Google |

---

## TWA — één zin voor reviewers (optioneel ergens in value/readiness)

```
This is a Trusted Web Activity: users get the same PWA experience as kalanera.gr inside a verified Play shell; shell versionCode bumps track Android/Play compatibility while guide content updates ship via the website.
```

---

## Gerelateerde bestanden

| Bestand | Gebruik |
|---------|---------|
| `Test-reports/submitted-input-playstore-production-request.docx` | 1e aanvraag (referentie) |
| `Test-reports/final-input-playstore-production.docx` | Uitgebreidere 1e draft |
| `Test-reports/com.kalanera.app_production.pdf` | Template testers-community |
| [A2-play-store-copy.md](./A2-play-store-copy.md) | Store listing — alleen live features |
| [A3-release-notes-3.1.36.md](./A3-release-notes-3.1.36.md) | Release notes vc6 |
| [A3-release-notes-3.1.40.md](./A3-release-notes-3.1.40.md) | Release notes vc7 |

---

## Stappen nu

1. Dashboard → klik **Apply for production**
2. Plak de Engelse teksten uit [A5-invulsheet](./A5-invulsheet-production-access.md) (geen Testers Community in formulier)
3. Dropdown recruitment: **Very easy**
4. Installs jaar 1: **0 – 10,000**
5. Bewaar kopie in `Test-reports/` na submit
6. Mail Testers Community: *applied today, will update when Google responds*

*Laatst bijgewerkt: 8 jun 2026 — cijfers uit Play Console ingevuld.*
