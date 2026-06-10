# Install-strategie — Android, iOS, QR & stickers

**Versie:** 3.1.47+ · **Play Store:** `com.kalanera.app`

## Drie install-methodes

| Platform | Aanbevolen methode | Alternatief |
|----------|-------------------|-------------|
| **Android** | **Google Play** (browser → Play Store → Install) | Chrome PWA “Add to home screen” (uitgeklapt onder *Alternative* op install-pagina) |
| **iPhone/iPad** | Safari → **Add to Home Screen** | Geen App Store |
| **Desktop** | Toon QR’s; installatie gebeurt op telefoon | — |

## QR-codes — wat wijst waarheen?

| Bestand | URL in QR | Gebruik |
|---------|-----------|---------|
| `pix/home-qr.png` | `https://www.kalanera.gr/` | **Sticker “website”** — browse de gids |
| `pix/install-qr-en.png` / `install-qr-el.png` | `install.html` / `install-el.html` | **Sticker “install”** — blijft zo (fysieke stickers al gedrukt) |
| `pix/play-store-qr-en.png` / `play-store-qr-el.png` | Google Play listing | **Website footer** + install-pagina (desktop Android-blok) |

### Stickers (al geplakt / in druk)

1. **QR → www.kalanera.gr** — homepage, geen wijziging nodig.
2. **QR → install.html** — blijft geldig: pagina toont nu **eerst Google Play** op Android, Safari-instructies op iPhone.

Geen nieuwe stickers verplicht. Optioneel later: sticker 2 direct naar Play Store als je herdrukt.

## Website-onderdelen

| Plek | Android | iOS |
|------|---------|-----|
| **Homepage hero** | Klein Play-badge | Verborgen |
| **Footer** | Play-badge (135×40) + Play-QR | Link “iPhone: add via Safari” |
| **install.html (mobiel)** | Play-badge → Play Store | Safari-stappen |
| **install.html (desktop)** | Play-QR + badge | install-qr (Safari-pagina) |
| **In de Play-app (TWA)** | Footer-installstrip verborgen | — |

## Technisch

- `manifest.json`: `prefer_related_applications: true` → Chrome mag Play Store voorstellen.
- `app.js`: `applyPlayStorePromoUi()` verbergt Play op iOS en in de geïnstalleerde app.
- Scripts: `patch-install-flow-v2.mjs`, `patch-play-store-promo.mjs`, `patch-hub-footer.mjs`.

## QR opnieuw genereren

```powershell
# Play Store (footer + install desktop)
python -c "import qrcode; from pathlib import Path; u='https://play.google.com/store/apps/details?id=com.kalanera.app'; p=Path('pix'); qrcode.make(u).save(p/'play-store-qr-en.png'); qrcode.make(u).save(p/'play-store-qr-el.png')"

# Install-pagina (stickers — alleen wijzigen als je stickers herdrukt)
python -c "import qrcode; from pathlib import Path; p=Path('pix'); qrcode.make('https://www.kalanera.gr/install.html').save(p/'install-qr-en.png'); qrcode.make('https://www.kalanera.gr/install-el.html').save(p/'install-qr-el.png')"
```

Zie ook [pix-qr-urls.md](./pix-qr-urls.md).
