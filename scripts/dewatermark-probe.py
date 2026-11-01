"""
Small proof: remove corner watermark / overlay text via brightness mask + OpenCV inpaint.
Writes cleaned copies + side-by-side comparisons into photogallery/_dewatermark-preview/
"""
from pathlib import Path
import cv2
import numpy as np

ROOT = Path("photogallery")
OUT = ROOT / "_dewatermark-preview"
OUT.mkdir(parents=True, exist_ok=True)

# Representative cases: simple watermark, credit+script, large slogan, sunset credit
SAMPLES = [
    "649257195_10238030846248484_1404257146333807197_n.jpg",  # www.kalanera.info bottom-right
    "702982001_10239114556940574_6304151805031012636_n.jpg",  # Kala Nera + photo credit bottom-left
    "740106131_10239726139429754_708767854012718276_n.jpg",  # ΚΑΛΟ ΒΡΑΔΥ + brand bottom-right
    "759433655_10240057817921509_8573893886588566563_n.jpg",  # photo credit + Kala Nera bottom-right
]


def corner_rois(h, w):
    """Regions where overlays usually sit (bottom corners)."""
    band_h = max(int(h * 0.22), 80)
    band_w = max(int(w * 0.55), 160)
    return {
        "bl": (slice(h - band_h, h), slice(0, band_w)),
        "br": (slice(h - band_h, h), slice(w - band_w, w)),
        # taller band for big slogans covering more of lower third
        "bottom": (slice(h - max(int(h * 0.32), 120), h), slice(0, w)),
    }


def text_mask_in_roi(bgr, ys, xs, bright_thr=205, sat_max=70):
    """White-ish overlay text: high brightness, low saturation."""
    roi = bgr[ys, xs]
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    # bright + relatively unsaturated (white text)
    m = (gray >= bright_thr) & (hsv[:, :, 1] <= sat_max)
    # also catch slightly soft anti-aliased edges
    m2 = (gray >= bright_thr - 25) & (hsv[:, :, 1] <= sat_max + 25) & (gray >= 175)
    mask = (m | m2).astype(np.uint8) * 255
    # morphology to connect letter strokes
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k, iterations=2)
    mask = cv2.dilate(mask, k, iterations=2)
    # drop tiny noise speckles
    num, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    cleaned = np.zeros_like(mask)
    min_area = max(28, int(roi.shape[0] * roi.shape[1] * 0.00015))
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            cleaned[labels == i] = 255
    return cleaned


def build_mask(bgr, mode="auto"):
    h, w = bgr.shape[:2]
    full = np.zeros((h, w), dtype=np.uint8)
    rois = corner_rois(h, w)

    if mode == "slogan":
        # prefer wider bottom band for large overlays
        keys = ["bottom", "br"]
        thr = 190
    else:
        keys = ["bl", "br"]
        thr = 205

    for key in keys:
        ys, xs = rois[key]
        part = text_mask_in_roi(bgr, ys, xs, bright_thr=thr)
        full[ys, xs] = cv2.bitwise_or(full[ys, xs], part)

    # expand a bit more for soft glow
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    full = cv2.dilate(full, k, iterations=1)
    return full


def dewatermark(path: Path, mode="auto"):
    bgr = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if bgr is None:
        raise RuntimeError(f"Cannot read {path}")
    mask = build_mask(bgr, mode=mode)
    coverage = float(mask.mean() / 255.0)
    # If almost nothing found, relax threshold once
    if coverage < 0.0008:
        mask = build_mask(bgr, mode="slogan")
        coverage = float(mask.mean() / 255.0)
    radius = 4 if min(bgr.shape[:2]) < 900 else 6
    cleaned = cv2.inpaint(bgr, mask, radius, cv2.INPAINT_TELEA)
    return bgr, cleaned, mask, coverage


def side_by_side(a, b):
    h = max(a.shape[0], b.shape[0])
    def pad(img):
        if img.shape[0] == h:
            return img
        out = np.zeros((h, img.shape[1], 3), dtype=img.dtype)
        out[: img.shape[0]] = img
        return out
    return np.hstack([pad(a), pad(b)])


results = []
for name in SAMPLES:
    src = ROOT / name
    mode = "slogan" if name.startswith("740106131") else "auto"
    original, cleaned, mask, coverage = dewatermark(src, mode=mode)
    stem = Path(name).stem
    out_clean = OUT / f"{stem}__cleaned.jpg"
    out_cmp = OUT / f"{stem}__compare.jpg"
    out_mask = OUT / f"{stem}__mask.jpg"
    cv2.imwrite(str(out_clean), cleaned, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    cv2.imwrite(str(out_cmp), side_by_side(original, cleaned), [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    # visualize mask on dark bg
    mask_vis = cv2.cvtColor(mask, cv2.COLOR_GRAY2BGR)
    cv2.imwrite(str(out_mask), mask_vis)
    results.append((name, coverage, out_clean.name, out_cmp.name))
    print(f"OK {name}  mask_coverage={coverage:.4%}  mode={mode}")

print("\nWrote:")
for r in results:
    print(" -", r[2], "|", r[3])
