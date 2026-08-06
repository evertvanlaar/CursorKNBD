# A3 — Release notes (website 3.1.125)

**Doel:** Pelion Guide — fotogallery van Kala Nera & omgeving (miniaturen, lightbox, filmstrip).

**Website:** `asset-version.txt` → **3.1.125** (via `scripts/sync-asset-version.mjs`)

**Android / Play:** geen nieuwe TWA-build vereist; shell blijft op eerdere Play-release tenzij je bewust opnieuw wilt alignen.

---

## Wat is nieuw

1. **Photo gallery** (`gallery.html` / `gallery-el.html`)
   - ~39 foto’s van het dorp en de omgeving (bron: [Kala Nera InPhoto](https://www.facebook.com/kalanera.info))
   - Verhaalvolgorde: overzicht → strand → haven → dorp → tafelen → activiteit → avond
   - Hero + spotlight-tegels (brede tiles) in het raster
   - Lightbox met prev/next, swipe, toetsenbord en **filmstrip** onderin
2. **Ontdekking**
   - Kaart op de Pelion Guide-hub (`info.html` / `info-el.html`)
   - Rij in het More-sheet (Travel), met “New”-label tot eind september 2026
3. **Sync-script**
   - `gallery.html` / `gallery-el.html` meegenomen in `scripts/sync-asset-version.mjs`

---

## English (EN) — kort

```
• New photo gallery of Kala Nera and surroundings (Pelion guide)
• Tap to enlarge — swipe, arrows, or the thumbnail filmstrip
• Photos credited to Kala Nera InPhoto on Facebook
```

## Greek (EL) — kort

```
• Νέα συλλογή φωτογραφιών από τα Καλά Νερά και την περιοχή (Οδηγός Πηλίου)
• Πατήστε για μεγέθυνση — σύρετε, βέλη ή η λωρίδα μικρογραφιών
• Πηγή φωτογραφιών: Kala Nera InPhoto στο Facebook
```

---

## Deploy-checklist

1. Deploy site (o.a. `app.js`, `style.css`, `service-worker.js`, `gallery.html` / `gallery-el.html`, map `photogallery/`, root + `business/*.html` met `?v=3.1.125`)
2. Hard refresh / SW-update controleren (`kalanera-cache-v3.1.125`)
3. Test: hub-kaart → gallery; lightbox + filmstrip; More → Photo gallery; EN/EL taalwissel
