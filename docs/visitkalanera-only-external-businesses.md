# Alleen op externe directory — analyse & bedrijfsgegevens

**Snapshot:** 2026-06-06 (n8n-run + live visitkalanera.gr-pagina's)  
**Bron:** [visitkalanera.gr/page-sitemap.xml](https://visitkalanera.gr/page-sitemap.xml) vs [kalanera.gr/data/local-businesses.json](https://kalanera.gr/data/local-businesses.json)

**Locatie:** Ja — alle bedrijven hieronder liggen in **Kala Nera** (gemeente South Pelion). Geen Kato Gatzea/Koropi in deze “alleen extern”-lijst.

**Schaduw-sheet import:** `data/shadow-sheet-import-2026-06-06.csv` (7 rijen, Status=`Shadow`) → [Google Sheet](https://docs.google.com/spreadsheets/d/1EPTu-cz2NYKJxlC6Ki14cyfQYiMFxg_i5gSgjw0IUvI/edit).

## Classificatie van de 9 sitemap-URL's

De n8n-mail toonde **9** items onder “Alleen op externe directory”. Dat zijn **9 URL's**, maar slechts **7 unieke bedrijven** — **2 paren zijn dubbele WordPress-pagina's** (Latijnse + Griekse slug).

| # | Sitemap-titel / slug | Type | kalanera.gr-match |
|---|----------------------|------|-------------------|
| 1 | `edem-tavern` | **Dubbele slug** | ✅ **Edem** (Eat) — al in overlap via deze slug |
| 2 | `εδέμ-ταβέρνα` | **Dubbele slug** | Zelfde bedrijf als #1; tweede WP-pagina |
| 3 | `market-cafe-kentauros` | **Dubbele slug** | Zelfde bedrijf als #4 |
| 4 | `market-κένταυρος` | **Dubbele slug** | Geen kalanera-entry (echte misser) |
| 5 | `eirini-filippou-apartments` | **Echte misser** | — |
| 6 | `enikoiazomena-dwmatia-hliaxtides` | **Echte misser** | — |
| 7 | `pelion-esties` | **Echte misser** | — (merk: Pelion Esties / villa Avgi by the Sea) |
| 8 | `platanofylla-studios-and-apartments` | **Echte misser** | — |
| 9 | `xenodoxeio-dimoula` | **Echte misser** | — |
| 10 | `φούρνος` | **Echte misser** | — (pagina vrijwel leeg) |

**Samenvatting:** 9 URL's → **2 valse positieven** (dubbele slugs) + **1 extra valse positief** (Edem staat wél op kalanera) → **6 echte missers** voor kalanera.gr.

> **Aanbeveling matching:** alias `εδέμ-ταβέρνα` → `edem` en `market-κένταυρος` ↔ `market-cafe-kentauros` in de n8n-workflow, zodat toekomstige mails **6** echte missers tonen i.p.v. 9.

---

## Dubbele slugs (geen actie nodig op kalanera)

### Edem / Εδέμ ταβέρνα

| Veld | Waarde |
|------|--------|
| **Status** | Dubbele slug — al geregistreerd op kalanera.gr als **Edem** |
| **Naam (EN)** | Edem Taverna |
| **Naam (EL)** | Εδέμ ταβέρνα |
| **Website** | [Facebook](https://www.facebook.com/profile.php?id=100066897199760#) (kalanera) · [visitkalanera.gr/εδέμ-ταβέρνα](https://visitkalanera.gr/%ce%b5%ce%b4%ce%ad%ce%bc-%cf%84%ce%b1%ce%b2%ce%ad%cf%81%ce%bd%ce%b1/) |
| **Telefoon** | +30 24230 23097 (kalanera) · +30 698 602 1638 (visitkalanera) |
| **Locatie** | Paraliaki Odos, Kala Nera 370 10 |
| **Categorie** | Eat / Ταβέρνα |
| **E-mail** | — |
| **Omschrijving (EN)** | Traditional taverna at the quiet end of Kala Nera beach, serving an authentic menu reflecting the region's culinary heritage. |
| **Omschrijving (EL)** | Παραδοσιακή ταβέρνα στο ήσυχο άκρο της παραλίας των Καλών Νερών, με αυθεντικό μενού που αντικατοπτρίζει τη γαστρονομική κληρονομιά της περιοχής. |

*Opmerking: visitkalanera heeft twee pagina's (`edem-tavern` geeft 404; `εδέμ-ταβέρνα` werkt). Telefoonnummers verschillen tussen bronnen.*

### Market – Café Kentauros / Μαρκετ Κένταυρος

| Veld | Waarde |
|------|--------|
| **Status** | Dubbele slug — **niet** op kalanera.gr (wel echte misser, maar maar één bedrijf) |
| **Naam (EN)** | Market – Café Kentauros |
| **Naam (EL)** | Μαρκετ – Καφέ Κένταυρος |
| **Website** | [visitkalanera.gr/market-cafe-kentauros](https://visitkalanera.gr/market-cafe-kentauros/) · [visitkalanera.gr/market-κένταυρος](https://visitkalanera.gr/market-%ce%ba%ce%ad%ce%bd%cf%84%ce%b1%cf%85%cf%81%ce%bf%cf%82/) |
| **Telefoon** | +30 24230 22763 |
| **Locatie** | Kala Nera beach / Παραλία Καλών Νερών |
| **Categorie** | Shop + Drink (mini-market & café) |
| **E-mail** | — |
| **Omschrijving (EN)** | Beach-side mini-market and café in Kala Nera, offering groceries and refreshments for locals and visitors. |
| **Omschrijving (EL)** | Μίνι-μάρκετ και καφέ στην παραλία των Καλών Νερών, με είδη παντοπωλείου και αναψυκτικά για ντόπιους και επισκέπτες. |

---

## Echte missers — detailgegevens (6 bedrijven)

### 1. Eirini Filippou Apartments

| Veld | Waarde |
|------|--------|
| **Naam (EN)** | Eirini Filippou Apartments |
| **Naam (EL)** | Επιπλωμένα διαμερίσματα Ειρήνης Φιλίππου |
| **Website** | [visitkalanera.gr/eirini-filippou-apartments](https://visitkalanera.gr/eirini-filippou-apartments/) |
| **Telefoon** | *Niet vermeld op visitkalanera.gr* |
| **Locatie** | Sarafopoulou 159, Kala Nera 37010 (centrum, ~60 m van strand) |
| **Categorie** | Sleep — furnished apartments |
| **E-mail** | *Niet vermeld op visitkalanera.gr* |
| **Omschrijving (EN)** | Furnished apartments in the village centre, 60 metres from the beach, restaurants and shops. All units have equipped kitchen, TV, A/C, heating, balcony with table and other amenities. |
| **Omschrijving (EL)** | Επιπλωμένα διαμερίσματα στο κέντρο του χωριού, 60 μέτρα από την παραλία και τα μαγαζιά εστίασης. Όλα τα δωμάτια έχουν εξοπλισμένη κουζίνα, τηλεόραση, κλιματιστικό, καλοριφέρ, μπαλκόνι με τραπεζάκι και άλλες παροχές. |

---

### 2. Iliachtides Rooms (Ηλιαχτίδες)

| Veld | Waarde |
|------|--------|
| **Naam (EN)** | Iliachtides Rooms |
| **Naam (EL)** | Ενοικιαζόμενα δωμάτια Ηλιαχτίδες |
| **Website** | [visitkalanera.gr/enikoiazomena-dwmatia-hliaxtides](https://visitkalanera.gr/enikoiazomena-dwmatia-hliaxtides/) |
| **Telefoon** | +30 24230 22164 · mobiel +30 6946 135 189 |
| **Locatie** | Kala Nera (centrale weg Pelion, ~500 m van het strand) |
| **Categorie** | Sleep — rooms & studios |
| **E-mail** | blana.hotels@gmail.com |
| **Omschrijving (EN)** | Summer rooms on Pelion's main road with easy access to mountain villages; 500 m from Kala Nera beach. Double, triple and family rooms (up to 4) with kitchenette, private bathroom, A/C, WiFi, garden view balcony. Parking, BBQ and small playground; pets welcome. |
| **Omschrijving (EL)** | Ενοικιαζόμενα δωμάτια στην κεντρική οδό του Πηλίου, 500 μ. από την παραλία των Καλών Νερών. Δίκλινα, τρίκλινα και οικογενειακά δωμάτια με κουζίνα, ιδιωτικό μπάνιο, A/C, WiFi και μπαλκόνι με θέα στον κήπο. Διαθέτει parking, BBQ και μίνι παιδική χαρά· δεκτά κατοικίδια. |

---

### 3. Pelion Esties — Avgi by the Sea

| Veld | Waarde |
|------|--------|
| **Naam (EN)** | Pelion Esties — Avgi by the Sea |
| **Naam (EL)** | Pelion Esties — Avgi by the Sea (Αύγη by the Sea) |
| **Website** | [pelion-villas.com/en/villas/avgi-by-the-sea](https://pelion-villas.com/en/villas/avgi-by-the-sea/) · [visitkalanera.gr/pelion-esties](https://visitkalanera.gr/pelion-esties/) |
| **Telefoon** | +30 24230 23147 · mobiel +30 698 097 8900 |
| **Locatie** | Kala Nera, Magnisia — sea-front |
| **Categorie** | Sleep — holiday villa / apartment (4–6 guests) |
| **E-mail** | info@pelion-villas.com |
| **Omschrijving (EN)** | A sea-front Pelion beach house literally on the water in Kala Nera. Fully equipped apartment with private terrace, ideal for couples or families; steps from tavernas, cafés and shops. Managed by Pelion Esties villa rental company. |
| **Omschrijving (EL)** | Παραθαλάσσιο διαμέρισμα/βίλα ακριβώς πάνω στο κύμα στα Καλά Νερά. Πλήρως εξοπλισμένο κατάλυμα με ιδιωτική βεράντα, ιδανικό για ζευγάρια ή οικογένειες· λίγα βήματα από ταβέρνες, καφέ και καταστήματα. Διαχείριση από την εταιρεία ενοικιαζόμενων βιλών Pelion Esties. |

---

### 4. Platanofylla Studios & Apartments

| Veld | Waarde |
|------|--------|
| **Naam (EN)** | Platanofylla Studios & Apartments |
| **Naam (EL)** | Platanofylla Studios & Apartments |
| **Website** | [platanofylla.gr](https://platanofylla.gr/) · [visitkalanera.gr/platanofylla-studios-and-apartments](https://visitkalanera.gr/platanofylla-studios-and-apartments/) |
| **Telefoon** | +30 24230 22622 (jun–sep) · +30 210 620 9749 (okt–mei) · Viber +30 694 519 0362 |
| **Locatie** | End of coastal road, Kala Nera 37010 (sea-side, under plane trees) |
| **Categorie** | Sleep — studios & apartments |
| **E-mail** | info@platanofylla.gr |
| **Omschrijving (EN)** | Guesthouse shaded by tall plane trees, directly beside the sea at the end of Kala Nera's coastal road. Two-storey complex with 4–5 person apartments and 2–3 person studios; each with kitchenette, shower bathroom and balcony or terrace. |
| **Omschrijving (EL)** | Ξενώνας με ψηλά πλατάνια, ακριβώς δίπλα στη θάλασσα στο τέρμα της παραλιακής οδού των Καλών Νερών. Συγκρότημα με δίχωρα διαμερίσματα 4–5 ατόμων και στούντιο 2–3 ατόμων· αυτόνομοι χώροι με κουζίνα, μπάνιο και μπαλκόνι/βεράντα. |

---

### 5. Hotel Dimoula (Ξενοδοχείο Δημουλά)

| Veld | Waarde |
|------|--------|
| **Naam (EN)** | Hotel Dimoula |
| **Naam (EL)** | Ξενοδοχείο Δημουλά |
| **Website** | [visitkalanera.gr/xenodoxeio-dimoula](https://visitkalanera.gr/xenodoxeio-dimoula/) |
| **Telefoon** | +30 24230 22245 · mobiel +30 6937 479 157 · +30 6972 727 568 |
| **Locatie** | Kala Nera, Pelion (quiet area, few steps from beach and village centre) |
| **Categorie** | Sleep — hotel |
| **E-mail** | hdimoula@otenet.gr |
| **Omschrijving (EN)** | Family-run hotel with long hospitality experience, recently fully renovated. Quiet location near the beach and village centre; flower-filled courtyard offers shade and relaxation even on hot summer days. |
| **Omschrijving (EL)** | Οικογενειακό ξενοδοχείο με μεγάλη πείρα στη φιλοξενία, πρόσφατα πλήρως ανακαινισμένο. Ήσυχη τοποθεσία κοντά στην παραλία και το κέντρο· η αυλή με πολύχρωμα λουλούδια προσφέρει δροσιά και απόλαυση τις ζεστές μέρες. |

---

### 6. Fouornos (Φούρνος)

| Veld | Waarde |
|------|--------|
| **Naam (EN)** | Fouornos *(bakery — name only)* |
| **Naam (EL)** | Φούρνος |
| **Website** | [visitkalanera.gr/φούρνος](https://visitkalanera.gr/%cf%86%ce%bf%cf%8d%cf%81%ce%bd%ce%bf%cf%82/) |
| **Telefoon** | *Niet vermeld op visitkalanera.gr* |
| **Locatie** | Kala Nera *(vermoedelijk; niet bevestigd op pagina)* |
| **Categorie** | Shop / Eat — bakery *(vermoedelijk)* |
| **E-mail** | *Niet vermeld* |
| **Omschrijving (EN)** | Bakery listing on the external directory; the visitkalanera.gr page contains no further business details, contact information or description at time of snapshot. |
| **Omschrijving (EL)** | Καταχώριση αρτοποιείου στον εξωτερικό κατάλογο· η σελίδα στο visitkalanera.gr δεν περιέχει περαιτέρω στοιχεία, επικοινωνία ή περιγραφή κατά τη στιγμή του snapshot. |

*Actie: eigenaar benaderen of pagina op visitkalanera.gr aanvullen voordat dit bedrijf aan kalanera.gr wordt toegevoegd.*

---

## Actie voor kalanera.gr

Prioriteit om toe te voegen aan de gids (6 echte missers):

| Prioriteit | Bedrijf | Categorie | Contact compleet? |
|:----------:|---------|-----------|:-----------------:|
| 1 | Hotel Dimoula | Sleep | ✅ |
| 2 | Platanofylla Studios | Sleep | ✅ |
| 3 | Iliachtides Rooms | Sleep | ✅ |
| 4 | Pelion Esties / Avgi by the Sea | Sleep | ✅ |
| 5 | Market Kentauros | Shop + Drink | ⚠️ geen e-mail |
| 6 | Eirini Filippou Apartments | Sleep | ⚠️ geen tel/e-mail op visit |
| 7 | Fouornos | Shop | ❌ pagina leeg |

---

*Gegevens uit visitkalanera.gr-pagina's (jun 2026) en aanvullend pelion-villas.com / platanofylla.gr waar visitkalanera onvolledig was.*
