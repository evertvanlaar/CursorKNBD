# A3 — Release notes (website 3.1.144)

**Doel:** Service-worker image-cache: geen `Response.clone()` nadat de body al gelezen is.

**Website:** `asset-version.txt` → **3.1.144** (via `scripts/sync-asset-version.mjs`)

---

## Wat is nieuw

1. Afbeeldingen: clone + `arrayBuffer` **vóór** `caches.open` (zelfde patroon als HTML/CSS/JSON). Voorkomt `TypeError: Response body is already used` in de console.
2. Verder gelijk aan 3.1.143 (OneSignal eruit, More hersteld).
