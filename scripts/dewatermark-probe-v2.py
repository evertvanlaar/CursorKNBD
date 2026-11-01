"""Retry sunset sample with tighter bottom-right ROI and stricter white-text mask."""
from pathlib import Path
import cv2
import numpy as np

src = Path("photogallery/759433655_10240057817921509_8573893886588566563_n.jpg")
out = Path("photogallery/_dewatermark-preview")
bgr = cv2.imread(str(src))
h, w = bgr.shape[:2]

# Tight corner only (text is bottom-right)
ys = slice(int(h * 0.78), h)
xs = slice(int(w * 0.42), w)
roi = bgr[ys, xs]
hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)

# Strict: very bright + low sat (true white overlay), avoid golden highlights
mask_roi = ((gray >= 220) & (hsv[:, :, 1] <= 40) & (hsv[:, :, 2] >= 210)).astype(np.uint8) * 255
k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
mask_roi = cv2.morphologyEx(mask_roi, cv2.MORPH_CLOSE, k, iterations=2)
mask_roi = cv2.dilate(mask_roi, k, iterations=2)

# Keep only components that look like text clusters (not tiny sparkle)
num, labels, stats, _ = cv2.connectedComponentsWithStats(mask_roi, 8)
cleaned = np.zeros_like(mask_roi)
min_area = 40
for i in range(1, num):
    if stats[i, cv2.CC_STAT_AREA] >= min_area:
        cleaned[labels == i] = 255

full = np.zeros((h, w), np.uint8)
full[ys, xs] = cleaned
print("mask_coverage", f"{full.mean()/255:.4%}", "components_kept", int((cleaned > 0).any()))

result = cv2.inpaint(bgr, full, 5, cv2.INPAINT_TELEA)
cmp = np.hstack([bgr, result])
cv2.imwrite(str(out / "759433655__cleaned_v2.jpg"), result, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
cv2.imwrite(str(out / "759433655__compare_v2.jpg"), cmp, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
cv2.imwrite(str(out / "759433655__mask_v2.jpg"), cleaned)
print("wrote v2")
