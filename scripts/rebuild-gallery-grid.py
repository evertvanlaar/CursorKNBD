# -*- coding: utf-8 -*-
"""Rebuild gallery grids from new photogallery set in narrative order."""
from pathlib import Path
import re

ROOT = Path(".")
PHOTOS = [
    # overview
    "11131613118518988748.jpeg",  # hero
    "AddText_08-06-05.25.05.jpg",
    "AISelect_20260701_091508_Facebook.jpg",
    "20260806_165253.jpg",
    # beach
    "20260708_082748.jpg",  # spotlight
    "20260708_083847.jpg",
    "AISelect_20260701_091415_Facebook.jpg",
    "20260616_112505.jpg",
    "FB_IMG_1778152024144.jpg",
    "20260706_142331.jpg",
    "696661762_10239010728344924_3866935153225729479_n.jpg",
    "FB_IMG_1654674504588.jpg",
    # harbor
    "1000133370.jpg",
    "FB_IMG_1785060112987.jpg",
    "20260618_200948.jpg",
    # village
    "758154565_10240022216271490_8991714898459704687_n.jpg",
    "20260709_203849.jpg",
    # dining
    "20260706_141905.jpg",  # spotlight
    "FB_IMG_1786029284581.jpg",
    "20260710_134147.jpg",
    "Screenshot_20260531_144508_Facebook.jpg",
    "20260806_165218.jpg",
    # activity
    "FB_IMG_1786028392409.jpg",
    "556029704_10236954634062189_164394049798092568_n.jpg",
    "FB_IMG_1655919360320.jpg",
    # evening
    "FB_IMG_1786028076616.jpg",
    "FB_IMG_1786028823057.jpg",
    "FB_IMG_1785415679719.jpg",
    "1000133367.jpg",
    "20260615_210647.jpg",
    "20260709_203728.jpg",
    "1000133368.jpg",
    "20260618_211701.jpg",
    "FB_IMG_1786028780887.jpg",
    "FB_IMG_1644605091300.jpg",
]

HERO = {0}
SPOTLIGHT = {4, 17}  # beach establishing + seaside taverna


def verify():
    folder = ROOT / "photogallery"
    disk = {p.name for p in folder.iterdir() if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}}
    missing = [f for f in PHOTOS if f not in disk]
    extra = sorted(disk - set(PHOTOS))
    if missing:
        raise SystemExit(f"Missing files: {missing}")
    if len(PHOTOS) != len(set(PHOTOS)):
        raise SystemExit("Duplicate in ordered list")
    print(f"OK {len(PHOTOS)} photos; unused on disk: {len(extra)}")
    if extra:
        for e in extra:
            print("  unused:", e)


def build_grid(lang: str) -> str:
    n = len(PHOTOS)
    lines = []
    for i, name in enumerate(PHOTOS):
        classes = ["photo-gallery-item"]
        if i in HERO:
            classes.append("photo-gallery-item--hero")
        if i in SPOTLIGHT:
            classes.append("photo-gallery-item--spotlight")
        cls = " ".join(classes)
        num = i + 1
        if lang == "el":
            alt = f"Καλά Νερά και περιοχή, φωτογραφία {num}"
            aria = f"Προβολή φωτογραφίας {num} από {n}"
        else:
            alt = f"Kala Nera and surroundings, photo {num}"
            aria = f"View photo {num} of {n}"
        loading = "eager" if i < 4 else "lazy"
        lines.append(f'        <button type="button" class="{cls}" data-gallery-index="{i}" aria-label="{aria}">')
        lines.append(
            f'            <img src="photogallery/{name}" alt="{alt}" loading="{loading}" decoding="async" width="800" height="600">'
        )
        lines.append("        </button>")
    return "\n".join(lines)


def replace_grid(path: Path, lang: str):
    html = path.read_text(encoding="utf-8")
    grid = build_grid(lang)
    pattern = re.compile(
        r'(<div class="photo-gallery-grid" id="photo-gallery-grid"[^>]*>)(.*?)(</div>\s*</main>)',
        re.S,
    )
    m = pattern.search(html)
    if not m:
        raise SystemExit(f"Grid not found in {path}")
    html = pattern.sub(rf"\1\n{grid}\n    \3", html)
    # keep JSON-LD hero image pointing at first photo
    first = PHOTOS[0]
    html = re.sub(
        r'"image":"https://www\.kalanera\.gr/photogallery/[^"]+"',
        f'"image":"https://www.kalanera.gr/photogallery/{first}"',
        html,
    )
    path.write_text(html, encoding="utf-8", newline="\n")
    print(f"updated {path} ({len(PHOTOS)} items, hero={PHOTOS[0]}, spotlights={[PHOTOS[i] for i in sorted(SPOTLIGHT)]})")


verify()
replace_grid(ROOT / "gallery.html", "en")
replace_grid(ROOT / "gallery-el.html", "el")
