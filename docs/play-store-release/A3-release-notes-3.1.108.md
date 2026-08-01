# A3 — Release notes (website 3.1.108)

**Doel:** homepage UX — naam-sortering per taal + categorie behouden bij taalwisseling.

**Website:** `asset-version.txt` → **3.1.108** (via `scripts/sync-asset-version.mjs`)

**Android / Play:** geen nieuwe TWA-build vereist; shell blijft op eerdere Play-release (vc9 / 3.1.103) tenzij je bewust opnieuw wilt alignen.

---

## Wat is nieuw

1. **Sortering businesslijst**
   - **EN:** eerst Latijnse/Engelse namen A–Z, daarna Griekse namen α–ω
   - **EL:** eerst Griekse namen α–ω, daarna Latijnse namen A–Z
2. **Taalwisseling op de homepage** behoudt de actieve categorie (`?cat=…`), bv. Sleep → `index-el.html?cat=sleep`

---

## English (EN) — kort

```
• Business list sorting: Latin names first (A–Z), then Greek names
• Switching language keeps your selected category on the homepage
• Stability and UX improvements for the directory hub
```

## Greek (EL) — kort

```
• Ταξινόμηση επιχειρήσεων: πρώτα ελληνικά ονόματα (α–ω), μετά λατινικά
• Η αλλαγή γλώσσας διατηρεί την επιλεγμένη κατηγορία στην αρχική
• Βελτιώσεις UX στον κατάλογο
```

---

## Deploy-checklist

1. Deploy site (o.a. `app.js`, `service-worker.js`, root HTML, `business/*.html` met `?v=3.1.108`)
2. Hard refresh / SW-update controleren (`kalanera-cache-v3.1.108`)
3. Test: EL Sleep-lijst (Grieks vóór Latijn); EN Sleep → vlag → EL blijft Sleep
