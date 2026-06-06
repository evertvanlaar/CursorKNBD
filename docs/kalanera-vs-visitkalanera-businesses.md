# Vergelijking geregistreerde bedrijven: kalanera.gr vs visitkalanera.gr

**Datum live-snapshot:** 2026-06-06 09:33 UTC  
**Bronnen:**
- [kalanera.gr/data/local-businesses.json](https://kalanera.gr/data/local-businesses.json) — Google Sheet via n8n, status `Active`
- [visitkalanera.gr/page-sitemap.xml](https://visitkalanera.gr/page-sitemap.xml) — Rank Math sitemap (Grieks, geen `/en/` duplicaten)

## Samenvatting

| Metriek | kalanera.gr | visitkalanera.gr |
|---------|------------:|-----------------:|
| Geregistreerde bedrijven (actief) | **73** | **28** individuele pagina's |
| Overlap (eenduidige match) | **20** | **20** |
| Alleen op kalanera.gr | **52** | — |
| Alleen op visitkalanera.gr (URL's) | — | **9** (→ **6** echte missers) |
| Gedeeltelijke overlap | **1** kalanera-registratie(s) | **1** gecombineerde visit-pagina |

**Dekking:** visitkalanera.gr publiceert momenteel **27%** van de actieve kalanera-gr bedrijven als eigen WordPress-pagina (20/73).

### kalanera.gr per categorie

| Categorie | Aantal |
|-----------|-------:|
| Sleep | 37 |
| Eat | 15 |
| Drink | 7 |
| Rent | 4 |
| Other | 3 |
| Shop | 3 |
| Camp | 2 |
| Travel | 2 |

### Beperkingen

- visitkalanera.gr heeft **categorie-hubpagina's** (Ταβέρνες, Ξενοδοχεία, …) met vaak weinig directe links; veel bedrijven hebben **geen eigen pagina**.
- kalanera.gr dekt ook **Kato Gatzea** en **Koropi**; visitkalanera.gr lijkt vooral Kala Nera zelf te omvatten.
- **Oceanis**: één gecombineerde visit-pagina vs. twee aparte kalanera-registraties (autoverhuur + bootverhuur).
- Matching op genormaliseerde namen/slugs; handmatige controle op grensgevallen.

## Overlap — op beide sites (20)

| kalanera.gr | Cat | Locatie | visitkalanera.gr | Match |
|-------------|-----|---------|------------------|-------|
| Naftilos | Drink | Kala Nera | [Naftilos Coffee Bar](https://visitkalanera.gr/naftilos-coffee-bar/) | exact |
| 1900 | Eat | Kala Nera | [1900 Παραδοσιακό Ταβερνείο](https://visitkalanera.gr/1900-%cf%80%ce%b1%cf%81%ce%b1%ce%b4%ce%bf%cf%83%ce%b9%ce%b1%ce%ba%cf%8c-%cf%84%ce%b1%ce%b2%ce%b5%cf%81%ce%bd%ce%b5%ce%af%ce%bf/) | exact |
| Edem | Eat | Kala Nera | [Εδέμ ταβέρνα](https://visitkalanera.gr/%ce%b5%ce%b4%ce%ad%ce%bc-%cf%84%ce%b1%ce%b2%ce%ad%cf%81%ce%bd%ce%b1/) | exact |
| Apostolis Barber | Other | Kala Nera | [Αποστόλης Φοβος Κουρέας](https://visitkalanera.gr/apostolis-fovos/) | exact |
| Oceanis Rentals Pelion | Rent | Kala Nera | [Oceanis Water Sports & Rentals](https://visitkalanera.gr/oceanis-water-sports-rentals/) | exact |
| Vardakis Market | Shop | Kala Nera | [Βαρδάκειος αγορά](https://visitkalanera.gr/%ce%b2%ce%b1%cf%81%ce%b4%ce%ac%ce%ba%ce%b5%ce%b9%ce%bf%cf%82-%ce%b1%ce%b3%ce%bf%cf%81%ce%ac/) | exact |
| Agelis | Sleep | Kala Nera | [HOTEL AGELIS](https://visitkalanera.gr/hotel-agelis/) | exact |
| Ainareti | Sleep | Kala Nera | [Ainareti Hotel](https://visitkalanera.gr/ainareti-hotel/) | exact |
| Irida | Sleep | Kala Nera | [Irida house](https://visitkalanera.gr/irida-house/) | exact |
| La Luna | Sleep | Kala Nera | [La Luna hotel](https://visitkalanera.gr/la-luna-hotel/) | exact |
| Levantes | Sleep | Kala Nera | [Levantes Villas](https://visitkalanera.gr/levantes-villas/) | exact |
| Orange Garden | Sleep | Kala Nera | [Orange Garden](https://visitkalanera.gr/orange-garden/) | exact |
| Pagaseon | Sleep | Kala Nera | [Pagaseon Studios](https://visitkalanera.gr/pagaseon-studios/) | exact |
| Pandora | Sleep | Kala Nera | [Pandora Studios](https://visitkalanera.gr/pandora-studios/) | exact |
| Panorama | Sleep | Kala Nera | [Kala Nera Panorama](https://visitkalanera.gr/kala-nera-panorama/) | exact |
| Pegasus | Sleep | Kala Nera | [Hotel Πήγασος](https://visitkalanera.gr/hotel-pigasus/) | exact |
| Rodia | Sleep | Kala Nera | [Hotel Rodia](https://visitkalanera.gr/hotel-rodia/) | exact |
| Serenity | Sleep | Kala Nera | [Serenity Studios](https://visitkalanera.gr/serenity-studios/) | exact |
| Vasileiou | Sleep | Kala Nera | [Vasileiou apartments](https://visitkalanera.gr/vasileiou-apartments/) | exact |
| Four Ways Travel | Travel | Kala Nera | [Four Ways Travel Ε.Π.Ε](https://visitkalanera.gr/four-ways-travel-%ce%b5-%cf%80-%ce%b5/) | exact |

## Gedeeltelijke overlap

Op visitkalanera.gr staat één gecombineerde pagina [Oceanis Water Sports & Rentals](https://visitkalanera.gr/oceanis-water-sports-rentals/) die deels overlapt met meerdere kalanera-registraties:

- **Oceanis Rentals Pelion** (Rent) — volledige match (zelfde pagina)
- **Oceanis Water Sports Rent a Boat** (Rent) — geen aparte visit-pagina

## Alleen op kalanera.gr (52)

Actief in de gids/PWA, geen eigen pagina op visitkalanera.gr.

### Camp

- **Hellas** — Kato Gatzea
- **Sikia** (Συκιά) — Kato Gatzea
### Drink

- **Aiolos** (Αίολος) — Kala Nera
- **Coffee Break** — Kala Nera
- **Medousa** (Μέδουσα) — Kala Nera
- **Nalu Cafe** (Καφέ Νάλου) — Kato Gatzea
- **Rivera** — Kato Gatzea
- **Yabanaki** — Kala Nera
### Eat

- **Argi tis gefsis** (Αρχή της γεύσης) — Kala Nera
- **Avra** (Αύρα) — Kala Nera
- **Gialoparméno** (Γιαλοπαρμένο) — Kato Gatzea
- **Irthe ke Edese** (Ηρθέ κι Έδεσε) — Koropi
- **Kadi** (Κάδη) — Koropi
- **Kamares** (Καμάρες) — Kato Gatzea
- **Olive Tree Garden** — Kato Gatzea
- **Pagasitikos** (Παγασητικός) — Kala Nera
- **Pasta La Vista** — Kala Nera
- **Roumeli** (Ρούμελη) — Kala Nera
- **Sikia Taverna** (Ταβέρνα Συκιά) — Kato Gatzea
- **Skourgias Taverna** (Σκουργιάς Ταβέρνα) — Kato Gatzea
- **Yperokeánio** (Υπερωκεάνιο) — Kato Gatzea
### Other

- **Auto Margaritis** — Kala Nera
- **Makrygiannis Wood & Color** (Μακρυγιάννης Wood & Color) — Koropi
### Rent

- **Paris Pelion Rent** — Kala Nera
- **Sea Escape** — Kala Nera
### Shop

- **To Trenaki** (Το Τρενάκι) — Kala Nera
- **Vergonis Market** (Αγορά Βεργώνη) — Koropi
### Sleep

- **Alkifron** (Αλκίφρων) — Kala Nera
- **Argo** (Αργώ) — Kala Nera
- **Dinos** (Τίνος) — Kala Nera
- **Efi** (Έφη) — Kala Nera
- **Enalion** (Ενάλιον) — Kala Nera
- **Gatzea Villas** — Kato Gatzea
- **Gatzea's Blue** — Kato Gatzea
- **Iakovakis** (Ιακωβάκης) — Koropi
- **Kamelia** (Καμέλια) — Kala Nera
- **Kassandra** (Κασσάνδρα) — Kala Nera
- **Kondara** (Κοντάρα) — Kala Nera
- **Magani** (Μαγγάνι) — Kala Nera
- **Mairi Lina** (Μαίρη Λίνα) — Kala Nera
- **Marianthi** (Μαριάνθη) — Kala Nera
- **Melograno** (Μελογράνο) — Kala Nera
- **Minelska** — Kala Nera
- **Okeanis** (Ωκεανίς) — Kala Nera
- **Palirria** (Παλίρροια) — Kala Nera
- **Saily Beach** — Koropi
- **Seranides** (Σερανίδες) — Kato Gatzea
- **Skourgias** (Σκουργιάς) — Kala Nera
- **Takos** (Τάκος) — Kala Nera
- **Vergonis** (Βεργώνης) — Koropi
- **Vergos Dimitrios** (Βέργος Δημήτριος) — Kala Nera
### Travel

- **Stoumpovikos Tours Pelion** (Στουμποβίκος Εκδρομές Πηλίου) — Kala Nera

## Alleen op visitkalanera.gr (9 URL's → 6 echte missers)

De n8n-mail telt **9** sitemap-URL's; daarvan zijn **3 valse positieven** (dubbele Grieks/Latijn-slugs + Edem staat al op kalanera). **6 bedrijven** ontbreken echt in de kalanera-gids.

→ **Volledige analyse met contactgegevens en EN/EL-omschrijvingen:** [visitkalanera-only-external-businesses.md](./visitkalanera-only-external-businesses.md)

### Dubbele slugs (geen kalanera-actie)

| Bedrijf | Reden |
|---------|-------|
| [Εδέμ ταβέρνα](https://visitkalanera.gr/%ce%b5%ce%b4%ce%ad%ce%bc-%cf%84%ce%b1%ce%b2%ce%ad%cf%81%ce%bd%ce%b1/) | Tweede pagina van **Edem** (al op kalanera) |
| [Market Κένταυρος](https://visitkalanera.gr/market-%ce%ba%ce%ad%ce%bd%cf%84%ce%b1%cf%85%cf%81%ce%bf%cf%82/) + [Market Café Kentauros](https://visitkalanera.gr/market-cafe-kentauros/) | Zelfde bedrijf, twee slugs |

### Echte missers (6)

- [Eirini Filippou Apartments](https://visitkalanera.gr/eirini-filippou-apartments/)
- [Ηλιαχτίδες rooms](https://visitkalanera.gr/enikoiazomena-dwmatia-hliaxtides/)
- [Pelion Esties / Avgi by the Sea](https://visitkalanera.gr/pelion-esties/)
- [Platanofylla Studios](https://visitkalanera.gr/platanofylla-studios-and-apartments/)
- [Ξενοδοχείο Δημουλά](https://visitkalanera.gr/xenodoxeio-dimoula/)
- [Φούρνος](https://visitkalanera.gr/%cf%86%ce%bf%cf%8d%cf%81%ce%bd%ce%bf%cf%82/) *(pagina vrijwel leeg)*

## Categorie-hubs op visitkalanera.gr

- [Water Sports](https://visitkalanera.gr/water-sports/)
- [Γενικές επιχειρήσεις](https://visitkalanera.gr/genikes-epixeiriseis/)
- [Γυμναστήρια](https://visitkalanera.gr/gymnatiria/)
- [Ενοικίαση οχημάτων](https://visitkalanera.gr/rentals/)
- [Ενοικιαζόμενα δωμάτια / διαμερίσματα](https://visitkalanera.gr/enikiazomena-diamerismata/)
- [Καφετέριες](https://visitkalanera.gr/cafe/)
- [Κουρεία](https://visitkalanera.gr/koureia/)
- [Μάρκετ](https://visitkalanera.gr/market/)
- [Ξενοδοχεία](https://visitkalanera.gr/hotels/)
- [Περίπτερα](https://visitkalanera.gr/periptera/)
- [Ταβέρνες](https://visitkalanera.gr/tavernes/)
- [Ταξιδιωτικά γραφεία](https://visitkalanera.gr/taxidiotika-grafeia/)
- [Φαρμακεία](https://visitkalanera.gr/farmakeia/)

---
*Live-data snapshot. Automatisch herhalen: `n8n/monitor-kalanera-vs-visitkalanera.example.json` (leest `page-sitemap.xml` + kalanera JSON).*
