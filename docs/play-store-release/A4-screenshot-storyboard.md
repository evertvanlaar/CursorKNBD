# A4 — Play Store screenshot storyboard

**Doel:** 6–8 store screenshots met duidelijke captions (EN; EL optioneel).  
**Formaat upload:** telefoon 9:16 (Portrait); gebruik bestaande exports waar mogelijk.

---

## Bronbestanden (mei 2026 upload)

| ID | Bestand (workspace) | Scherm | Opmerking |
|----|---------------------|--------|-----------|
| S1 | `screenshots/9x16mob/mob1-9x16.png` | Home + hero + directory start | Pelion live badge; zoekbalk zichtbaar |
| S2 | `screenshots/9x16mob/mob2-9x16.png` | Business directory — categorieën | Camp, Drink, Eat, … met aantallen |
| S3 | `screenshots/9x16mob/mob3-9x16.png` | Categorie uitgevouwen (Drink) | Kaarten met bellen, web, maps |
| S4 | `screenshots/9x16mob/mob4-9x16.png` | Bedrijfsdetail (1900) | Foto, contact, website |
| S5 | `screenshots/9x16mob/mob5-9x16.png` | A–Z lijst | Letter-rail, favoriet-hart |
| S6 | `screenshots/9x16mob/mob6-9x16.png` | Favorites / wishlist | Opgeslagen plaatsen |
| S7 | `screenshots/9x16mob/mob9-9x16.png` | Bus timetable | Volos · Today, vertrekken, NEXT |
| S8 | `screenshots/9x16mob/mob8-9x16.png` | More menu | Bus, nuttige nummers, install, about |

**Alternatief / archief:** `screenshots/org/mob*.png`, `screenshots/9x16tab7i/*` (tablet).

**Let op:** Als een capture nog “Business Directory” als kop toont i.p.v. “Kala Nera Guide”, maak voor store een **nieuwe capture** na deploy van laatste copy — of accepteer voor launch en vervang in volgende upload.

---

## Aanbevolen volgorde Play Console (8 frames)

Volgorde beïnvloedt conversie: eerst waarde, dan bewijs.

| Pos | Asset | Screenshot ID | Caption EN (max ~80 tekens voor overlay) | Caption EL (optioneel) |
|-----|-------|---------------|------------------------------------------|-------------------------|
| 1 | Hero | S1 | **Kala Nera & Pelion** — mountain & sea | **Καλά Νερά & Πήλιο** |
| 2 | Directory | S2 | **Find local places** — eat, stay, shop & more | **Τοπικές επιχειρήσεις** — φαγητό, διαμονή, αγορές |
| 3 | Browse | S3 | **Browse by category** — tap to call or visit | **Ανά κατηγορία** — κλήση & χάρτες |
| 4 | Detail | S4 | **Business details** — contact & website | **Λεπτομέρειες** — επικοινωνία & ιστότοπος |
| 5 | Favorites | S6 | **Save favorites** — on your device | **Αγαπημένα** — στη συσκευή σας |
| 6 | Bus | S7 | **Bus timetable** — Kala Nera stop | **Δρομολόγια** — στάση Καλά Νερά |
| 7 | A–Z | S5 | **A–Z list** — jump by letter | **Λίστα Α–Ω** — γρήγορη πλοήγηση |
| 8 | More | S8 | **More tools** — numbers, install, contact | **Περισσότερα** — τηλέφωνα & εγκατάσταση |

**Waarom bus vóór A–Z:** onderscheidend t.o.v. generieke directory-apps; testrapport noemde bus expliciet.

---

## Annotatie-richtlijnen (design)

| Element | Richtlijn |
|---------|-----------|
| Device frame | Optioneel; focus op UI (testers: “annotated screenshots”) |
| Tekst overlay | 1 regel titel + 1 regel subtekst; contrast op drukke foto’s |
| Merk | “Kala Nera Guide” klein in hoek indien gewenst |
| Taal | EN voor internationale store; aparte EL-set optioneel |
| Achtergrond | Licht/neutraal; geen drukke patronen achter telefoon |

**Tools:** Canva, Figma, of design-AI — jij/designer levert finale PNG’s.

---

## Mapping naar app-routes (voor QA)

| Screenshot | URL (EN) | URL (EL) |
|------------|----------|----------|
| S1 Home | `/index.html` | `/index-el.html` |
| S2–S3 Directory | `/index.html` | `/index-el.html` |
| S4 Detail | `/business/1900.html` | `/business/1900-el.html` |
| S5 A–Z | `/index.html` (view A–Z) | idem |
| S6 Favorites | `/wishlist.html` | `/wishlist-el.html` |
| S7 Bus | `/bus.html` | `/bus-el.html` |
| S8 More | Open More-sheet (mobiel) | idem |

---

## Feature graphic & video

| Asset | Inhoud |
|-------|--------|
| **Feature graphic** | Logo + “Kala Nera Guide” + Pelion landschap (geen nieuwe screenshot nodig) |
| **Promo video** | Trailer — **Credits: Dejan MP** |
| **TV banner** | Optioneel later |

---

## Verschil t.o.v. testrapport (2.1.117)

Screenshots moeten tonen wat reviewers **niet** hadden:

| Feature | Tonen in set? | Frame |
|---------|---------------|-------|
| Bus timetable | Ja | S7 |
| Category filters + counts | Ja | S2, S3 |
| Favorites | Ja | S6 |
| Rich business cards | Ja | S3 |
| More / useful numbers | Ja | S8 |
| Pelion Guide hub | Optioneel 9e frame | `info.html` — **nog niet in huidige upload** |

### Optionele frame 9 (aanbevolen nieuwe capture)

| Pos | Scherm | Route | Caption EN |
|-----|--------|-------|------------|
| 9 | Pelion Guide hub | `/info.html` | **Pelion Guide** — flights, events, numbers & bus |

Dit adresseert direct de test-suggestie “feature highlight screenshots” voor de uitgebreide guide.

---

## Upload-checklist Play Console

- [ ] Minimaal 4, aanbevolen 8 phone screenshots (9:16)
- [ ] Bestanden ≤ 8 MB, PNG of JPEG
- [ ] Geen misleidende UI (oude merknaam “Business Directory” vermijden)
- [ ] EL-set: zelfde volgorde, vertaalde overlays
- [ ] Tablet screenshots optioneel (2e device type)
- [ ] Preview in Play Console op telefoon-weergave gecontroleerd

---

## Bestandsstructuur (voorstel na design)

```
screenshots/play-store/
  en/
    01-hero.png
    02-directory.png
    ...
  el/
    01-hero.png
    ...
```

Huidige bron: `screenshots/9x16mob/` — kopieer/hernoem na goedkeuring captions.
