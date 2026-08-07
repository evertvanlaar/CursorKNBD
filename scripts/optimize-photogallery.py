#!/usr/bin/env python3
"""
Build gallery thumbs + compressed full-size WebP from photogallery originals.

Usage (repo root):
  python scripts/optimize-photogallery.py

Writes:
  photogallery/thumbs/<stem>.webp   (~560px wide, grid + lightbox strip)
  photogallery/full/<stem>.webp     (~1600px wide, lightbox)

Also rewrites gallery.html / gallery-el.html img tags to use thumbs + data-full-src.
Leaves originals in photogallery/ untouched (not linked from the page).
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "photogallery"
THUMB_DIR = SRC_DIR / "thumbs"
FULL_DIR = SRC_DIR / "full"
HTML_FILES = [ROOT / "gallery.html", ROOT / "gallery-el.html"]

THUMB_MAX = 560
FULL_MAX = 1600
THUMB_QUALITY = 78
FULL_QUALITY = 82
EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def stem_key(path: Path) -> str:
    return path.stem


def optimize_one(src: Path) -> tuple[Path, Path, tuple[int, int]]:
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGB")
        elif im.mode == "RGBA":
            bg = Image.new("RGB", im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[-1])
            im = bg

        thumb = im.copy()
        thumb.thumbnail((THUMB_MAX, THUMB_MAX), Image.Resampling.LANCZOS)
        full = im.copy()
        full.thumbnail((FULL_MAX, FULL_MAX), Image.Resampling.LANCZOS)

        out_thumb = THUMB_DIR / f"{stem_key(src)}.webp"
        out_full = FULL_DIR / f"{stem_key(src)}.webp"
        thumb.save(out_thumb, "WEBP", quality=THUMB_QUALITY, method=4)
        full.save(out_full, "WEBP", quality=FULL_QUALITY, method=4)
        return out_thumb, out_full, thumb.size


def rewrite_html(path: Path, mapping: dict[str, tuple[str, str, tuple[int, int]]]) -> int:
    text = path.read_text(encoding="utf-8")
    changed = 0

    def repl(m: re.Match[str]) -> str:
        nonlocal changed
        before, src, after = m.group(1), m.group(2), m.group(3)
        name = Path(src).name
        key = Path(name).stem
        if key not in mapping:
            return m.group(0)
        thumb_rel, full_rel, (w, h) = mapping[key]
        changed += 1
        # Drop previous width/height/data-full-src; re-add consistent attrs.
        after_clean = re.sub(r'\s+data-full-src="[^"]*"', "", after)
        after_clean = re.sub(r'\s+width="\d+"', "", after_clean)
        after_clean = re.sub(r'\s+height="\d+"', "", after_clean)
        if after_clean.endswith(">"):
            after_clean = after_clean[:-1].rstrip() + f' width="{w}" height="{h}">'
        return (
            f'{before}src="{thumb_rel}" data-full-src="{full_rel}"'
            f"{after_clean}"
        )

    # Match img tags that still point at photogallery originals (or already-optimized).
    pattern = re.compile(
        r'(<img\b[^>]*?)\bsrc="(photogallery/(?:thumbs/|full/)?[^"]+)"([^>]*>)',
        re.IGNORECASE,
    )
    new_text = pattern.sub(repl, text)

    # Prefer full WebP for schema/OG single-image refs of known originals.
    for key, (_t, full_rel, _size) in mapping.items():
        for ext in (".jpg", ".jpeg", ".png", ".webp"):
            old = f"photogallery/{key}{ext}"
            if old in new_text and f"photogallery/thumbs/{key}" not in old:
                # Only replace absolute/relative full-file refs, not thumbs.
                new_text2 = new_text.replace(
                    f"https://www.kalanera.gr/{old}",
                    f"https://www.kalanera.gr/{full_rel}",
                )
                new_text2 = new_text2.replace(f'"{old}"', f'"{full_rel}"')
                if new_text2 != new_text:
                    new_text = new_text2

    if new_text != text:
        path.write_text(new_text, encoding="utf-8", newline="\n")
    return changed


def main() -> int:
    if not SRC_DIR.is_dir():
        print(f"Missing {SRC_DIR}", file=sys.stderr)
        return 1

    originals = sorted(
        p
        for p in SRC_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in EXTS
    )
    if not originals:
        print("No originals found in photogallery/", file=sys.stderr)
        return 1

    THUMB_DIR.mkdir(parents=True, exist_ok=True)
    FULL_DIR.mkdir(parents=True, exist_ok=True)

    mapping: dict[str, tuple[str, str, tuple[int, int]]] = {}
    total_in = total_thumb = total_full = 0

    for src in originals:
        out_thumb, out_full, size = optimize_one(src)
        key = stem_key(src)
        mapping[key] = (
            f"photogallery/thumbs/{out_thumb.name}",
            f"photogallery/full/{out_full.name}",
            size,
        )
        total_in += src.stat().st_size
        total_thumb += out_thumb.stat().st_size
        total_full += out_full.stat().st_size
        print(
            f"OK {src.name} -> thumb {out_thumb.stat().st_size // 1024}KB "
            f"/ full {out_full.stat().st_size // 1024}KB ({size[0]}x{size[1]})"
        )

    html_changes = 0
    for html in HTML_FILES:
        if html.is_file():
            n = rewrite_html(html, mapping)
            html_changes += n
            print(f"HTML {html.name}: updated {n} <img> tags")

    def mb(n: int) -> float:
        return round(n / (1024 * 1024), 2)

    print(
        f"\nDone: {len(originals)} images | "
        f"originals {mb(total_in)}MB -> thumbs {mb(total_thumb)}MB + full {mb(total_full)}MB "
        f"(= {mb(total_thumb + total_full)}MB served set)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
