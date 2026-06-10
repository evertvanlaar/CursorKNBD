# QR-codes in `pix/` — gecodeerde URL’s

Statische QR’s: de URL staat **letterlijk in de PNG** (geen redirect-dienst).

**Laatste verificatie:** decode met OpenCV (`cv2.QRCodeDetector`) op de bestanden in de repo.

## Productie / site

| Bestand | Exacte URL in de QR | `www` | `index.html` | Gebruik op site |
|---------|---------------------|-------|--------------|-----------------|
| `play-store-qr-en.png` | `https://play.google.com/store/apps/details?id=com.kalanera.app` | — | — | Footer + `install.html` desktop (Android) |
| `play-store-qr-el.png` | *(zelfde Play URL)* | — | — | Footer EL + `install-el.html` desktop (Android) |
| `install-qr-en.png` | `https://www.kalanera.gr/install.html` | ja | nee | Stickers, `install.html` desktop (iPhone) |
| `install-qr-el.png` | `https://www.kalanera.gr/install-el.html` | ja | nee | Stickers EL, `install-el.html` desktop (iPhone) |
| `home-qr.png` | `https://www.kalanera.gr/` | ja | nee | Homepage-stickers (browse site) |

**Aanbevolen sticker install (GR):** `install-qr-el.png` → `https://www.kalanera.gr/install-el.html`

## Vergelijkingsset (test / printproef)

| Bestand | Exacte URL in de QR | Opmerking |
|---------|---------------------|-----------|
| `home-qr-www.png` | `https://www.kalanera.gr/` | Zelfde inhoud als `home-qr.png` |
| `install-qr-www.png` | `https://www.kalanera.gr/install.html` | Zelfde inhoud als `install-qr-en.png` |
| `home-qr-no-www.png` | `https://kalanera.gr/` | Apex, zonder `www` |
| `install-qr-no-www.png` | `https://kalanera.gr/install.html` | Apex, zonder `www` |

Geen enkel bestand gebruikt `index.html` in de QR-string. De homepage-QR’s eindigen op `/` (canonical in `index.html` is ook zonder `index.html`).

## Redirect na scannen

De server stuurt doorgaans **`www` → apex** (bijv. `https://www.kalanera.gr/…` → `https://kalanera.gr/…`). De **QR-inhoud** blijft dan wel met `www`; alleen de adresbalk na redirect kan anders zijn.

## Opnieuw controleren

```powershell
cd "c:\Users\EvertvanLaar\OneDrive - vanlaar\Documents\CursorKNBD"
python -c "import cv2; from pathlib import Path; d=cv2.QRCodeDetector(); [print(p.name, d.detectAndDecode(cv2.imread(str(p)))[0]) for p in sorted(Path('pix').glob('*qr*.png'))]"
```

Lokaal opnieuw genereren (zelfde stijl, statisch):

```powershell
python -c "import qrcode; from pathlib import Path; pix=Path('pix'); qrcode.make('https://www.kalanera.gr/install-el.html').save(pix/'install-qr-el.png')"
```

## Generatiegeschiedenis (kort)

| Bron | Bestanden |
|------|-----------|
| qrserver.com API | Eerste `install-qr-en.png` / `install-qr-el.png`, `home-qr.png` |
| Python `qrcode` | `home-qr-www.png`, `install-qr-www.png`, `home-qr-no-www.png`, `install-qr-no-www.png` |
