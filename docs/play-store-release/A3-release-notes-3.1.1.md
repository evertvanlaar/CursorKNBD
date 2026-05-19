# A3 — Release notes (website 3.1.0 / 3.1.1)

**Play Console:** plak onder *Release → Production* (of testing track) → *Release notes* per taal.

**Android build (TWA):** `versionCode` 4 · `versionName` `3.1.1` (shell; inhoud komt van `https://www.kalanera.gr`).

**Artifacts (mei 2026):**

| Bestand | Gebruik |
|---------|---------|
| `kalanera-twa/kalanera-guide-3.1.1-vc4-release.aab` | Upload naar Play Console (verplicht voor productie) |
| `kalanera-twa/kalanera-guide-3.1.1-vc4-release.apk` | Handmatig testen / sideload (niet nodig voor Play-upload) |

---

## English (EN) — volledig

```
• Refreshed magazine-style home and business listings
• Bus timetable for Kala Nera (direction, day and time filters)
• Pelion Guide: flights, events, walking, useful numbers and bus
• Clearer business pages with full navigation
• Fix: Favorites from a business page now open correctly
```

## English (EN) — kort

```
• New look for home and listings
• Bus times and Pelion Guide
• Favorites fix on business pages
```

---

## Greek (EL) — volledig

```
• Ανανεωμένη αρχική σελίδα και καταχωρήσεις σε στυλ περιοδικού
• Δρομολόγια λεωφορείου Καλά Νερά (κατεύθυνση, ημέρα, φίλτρα ώρας)
• Οδηγός Πηλίου: πτήσεις, εκδηλώσεις, πεζοπορία, χρήσιμα τηλέφωνα και λεωφορείο
• Καθαρότερες σελίδες επιχειρήσεων με πλήρες μενού
• Διόρθωση: τα Αγαπημένα από σελίδα επιχείρησης λειτουργούν σωστά
```

## Greek (EL) — kort

```
• Νέα εμφάνιση αρχικής και καταχωρήσεων
• Δρομολόγια λεωφορείου και Οδηγός Πηλίου
• Διόρθωση Αγαπημένων από σελίδες επιχειρήσεων
```

## Dutch (NL) - volledig
• Vernieuwde, tijdschriftachtige weergave voor alle paginas
• Bustijden voor Kala Nera (richting, dag en tijd filters)
• Pelion-gids: vluchten, evenementen, wandelingen, telefoonnummers en bus
• Duidelijkere bedrijfspagina's met volledige navigatie
• Opgelost: Favorieten van een bedrijfspagina openen nu correct

---

## Wat zit in 3.1.0 / 3.1.1 (referentie)

| Versie | Hoofdpunten |
|--------|-------------|
| **3.1.0** | Magazine-UI hub, bus POC, Pelion Guide, business detail + volledig menu, n8n-template |
| **3.1.1** | Favorieten-404 op business-pagina’s opgelost; homepage-subtitel ingekort |

---

## Google Play: testactiviteit

Voor **production access** wil Google vaak zien dat er tijdens testen **meerdere releases** op een testing track stonden (typisch 2–3+ met oplopende `versionCode`).

| Build | versionCode | versionName | Opmerking |
|-------|-------------|-------------|-----------|
| Eerdere test-builds | 1–2 | 2.1.x | Zoals al in Console geüpload |
| Huidige | 3 | 2.1 | Laatste geteste shell (indien al geüpload) |
| **Deze release** | **4** | **3.1.1** | Upload naar closed/open testing **of** direct production |

De TWA toont de live website; elke nieuwe `.aab` telt als release-activiteit ook als de shell weinig wijzigt.
