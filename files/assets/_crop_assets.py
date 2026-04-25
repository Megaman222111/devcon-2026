"""Crop full-page screenshots in files/assets/ down to just the figure/photo.

The asset PNGs are full PDF page screenshots that contain a small embedded
figure (a colour photo or a black-and-white diagram) somewhere on the page,
surrounded by the body text of the page.

Strategy:
1. Load the page and look at the HSV saturation channel. Saturated pixels are
   almost always part of a colour photo (text and diagrams have ~0 saturation).
2. If there is a strong saturation signal, dilate it and crop to the bounding
   box of the largest connected colour blob.
3. Otherwise (e.g. a black-and-white diagram), fall back to detecting "thick"
   ink — pixels that are dark AND surrounded by other dark pixels in a
   reasonably large neighbourhood. Body text fails this test because each
   character is small and surrounded by white space.
4. Throw away crops that look unsafe (too small, full-page, or empty).

Run from any cwd::

    python files/assets/_crop_assets.py

Originals live under files/assets/_originals/ and are read from there; the
crops are written back to files/assets/<name>.png.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


SCRIPT_DIR = Path(__file__).resolve().parent
ORIGINALS_DIR = SCRIPT_DIR / "_originals"
OUTPUT_DIR = SCRIPT_DIR
PADDING = 18
MIN_CROP_RATIO = 0.005  # crop must be at least 0.5% of page area
MAX_CROP_RATIO = 0.92  # crop must be smaller than 92% of page area

# Each page has a header strip with a horizontal rule + a footer with a
# horizontal rule and "Alberta..." attribution lines. We mask both so they
# never become candidate figures.
HEADER_MARGIN_FRAC = 0.06
FOOTER_MARGIN_FRAC = 0.08


def _largest_blob_bbox(mask: np.ndarray) -> tuple[int, int, int, int] | None:
    """Return (top, left, bottom, right) bbox of the largest connected blob."""
    if not mask.any():
        return None
    labelled, n = ndi.label(mask)
    if n == 0:
        return None
    sizes = ndi.sum(mask, labelled, index=range(1, n + 1))
    largest = int(np.argmax(sizes)) + 1
    blob = labelled == largest
    rows = np.where(blob.any(axis=1))[0]
    cols = np.where(blob.any(axis=0))[0]
    return int(rows.min()), int(cols.min()), int(rows.max()) + 1, int(cols.max()) + 1


def _all_blob_bboxes(mask: np.ndarray) -> list[tuple[int, int, int, int, int]]:
    """Return [(top, left, bottom, right, area)] for every connected blob."""
    if not mask.any():
        return []
    labelled, n = ndi.label(mask)
    if n == 0:
        return []
    out: list[tuple[int, int, int, int, int]] = []
    sizes = ndi.sum(mask, labelled, index=range(1, n + 1))
    for idx in range(1, n + 1):
        area = int(sizes[idx - 1])
        if area < 200:
            continue
        blob = labelled == idx
        rows = np.where(blob.any(axis=1))[0]
        cols = np.where(blob.any(axis=0))[0]
        out.append(
            (
                int(rows.min()),
                int(cols.min()),
                int(rows.max()) + 1,
                int(cols.max()) + 1,
                area,
            )
        )
    return out


def _bbox_looks_like_text(bbox: tuple[int, int, int, int], page_shape: tuple[int, int]) -> bool:
    """Heuristic for `bbox` being a column of body text vs. a figure/diagram.

    Body text columns tend to be much wider than they are tall (a single
    paragraph) or are very tall and only a couple of characters wide
    (numbered lists). They also live in the left ~75% of the page.
    """
    top, left, bottom, right = bbox
    h = bottom - top
    w = right - left
    if h <= 0 or w <= 0:
        return True
    page_h, page_w = page_shape
    # Very wide & flat: paragraph-like
    if w > page_w * 0.55 and h < w * 0.65:
        return True
    # Spans almost the entire page width: definitely page content, not figure.
    if w > page_w * 0.85:
        return True
    return False


def _bbox_looks_like_thin_line(bbox: tuple[int, int, int, int]) -> bool:
    """True for very thin/wide bboxes (page rules, single text lines, etc.)."""
    top, left, bottom, right = bbox
    h = bottom - top
    w = right - left
    if h == 0 or w == 0:
        return True
    aspect = max(h, w) / max(1, min(h, w))
    return aspect > 8.0


def _zero_out_chrome(mask: np.ndarray) -> np.ndarray:
    """Suppress the page header/footer strips so they never win detection."""
    h, _w = mask.shape
    top = int(h * HEADER_MARGIN_FRAC)
    bottom = int(h * (1.0 - FOOTER_MARGIN_FRAC))
    out = mask.copy()
    out[:top, :] = False
    out[bottom:, :] = False
    return out


def _detect_color_photo(arr_rgb: np.ndarray) -> tuple[int, int, int, int] | None:
    """Find the most prominent colourful photo on the page, if any exists."""
    img = Image.fromarray(arr_rgb)
    hsv = np.array(img.convert("HSV"))
    sat = hsv[:, :, 1]
    val = hsv[:, :, 2]
    h, w = sat.shape

    # Photos have moderately saturated pixels. Require non-extreme value so we
    # ignore stray low-light noise and pure-white/black anti-aliasing.
    sat_mask = (sat > 32) & (val > 30) & (val < 250)
    sat_mask = _zero_out_chrome(sat_mask)

    if sat_mask.sum() < 1_500:
        return None

    # Dilate to merge JPEG noise / text-y artefacts into solid blobs and to
    # bridge small gaps inside the photo.
    dilated = ndi.binary_dilation(sat_mask, iterations=8)
    dilated = ndi.binary_closing(dilated, iterations=4)

    blobs = _all_blob_bboxes(dilated)
    if not blobs:
        return None

    # Score each blob by saturated-pixel count inside the bbox (preferring
    # dense colour regions over scattered noise).
    best: tuple[float, tuple[int, int, int, int]] | None = None
    for top, left, bottom, right, _area in blobs:
        bbox = (top, left, bottom, right)
        if _bbox_looks_like_thin_line(bbox):
            continue
        block = sat_mask[top:bottom, left:right]
        score = float(block.sum())
        if score < 600:
            continue
        if best is None or score > best[0]:
            best = (score, bbox)

    return best[1] if best else None


def _row_profile_looks_like_text(grey: np.ndarray, bbox: tuple[int, int, int, int]) -> bool:
    """True if `bbox` over `grey` shows the regular striping of body text."""
    top, left, bottom, right = bbox
    region = grey[top:bottom, left:right]
    if region.size == 0:
        return True

    ink_per_row = (region < 130).sum(axis=1)
    if ink_per_row.max() == 0:
        return True

    threshold = 0.25 * ink_per_row.max()
    is_dark = ink_per_row > threshold

    # Count alternations between "dark row" and "blank row" — each line of
    # body text contributes one alternation pair.
    transitions = int(np.sum(is_dark[1:] != is_dark[:-1]))
    h = bottom - top
    if h == 0:
        return True
    transitions_per_100px = transitions * 100.0 / h
    # 5-line paragraphs have ~10 transitions per 100px. Photos/diagrams sit
    # closer to 0-2 (essentially solid, no striping).
    return transitions_per_100px > 6.0


def _build_text_mask(grey: np.ndarray) -> np.ndarray:
    """Approximate mask of body-text regions on the page.

    Body text shows up as horizontal stripes of dark pixels at a regular line
    spacing (~15-20 px). We detect it by taking a strong horizontal blur of
    the ink mask, finding rows that are mostly dark, and marking the columns
    that contribute most of the darkness.
    """
    h, w = grey.shape
    ink = grey < 130

    # Horizontal smoothing makes single text lines into long dark bars.
    smooth = ndi.uniform_filter(ink.astype(np.float32), size=(1, 60))
    text_band = smooth > 0.18

    # Vertical smoothing groups consecutive text lines into paragraph blocks.
    smooth_v = ndi.uniform_filter(text_band.astype(np.float32), size=(45, 1))
    text_mask = smooth_v > 0.3

    return text_mask


def _detect_diagram(arr_rgb: np.ndarray) -> tuple[int, int, int, int] | None:
    """Find a B&W photo or diagram via local greyscale variance.

    Photos have high local greyscale variance (varied tones).  Diagrams have
    long sharp edges with high variance along them.  Body text also has high
    local variance, so we explicitly suppress text regions via the heuristic
    in :func:`_build_text_mask` before searching for figure blobs.
    """
    grey_f = np.array(Image.fromarray(arr_rgb).convert("L")).astype(np.float32)
    h, w = grey_f.shape

    # Local greyscale standard deviation in a 9x9 window.
    mean = ndi.uniform_filter(grey_f, size=9)
    sqr_mean = ndi.uniform_filter(grey_f * grey_f, size=9)
    local_std = np.sqrt(np.maximum(sqr_mean - mean * mean, 0.0))

    photo_mask = local_std > 22

    grey_u8 = grey_f.astype(np.uint8)
    text_mask = _build_text_mask(grey_u8)

    # Suppress everything that looks like body text or page chrome.
    figure_mask = photo_mask & ~text_mask
    figure_mask = _zero_out_chrome(figure_mask)

    if figure_mask.sum() < 800:
        return None

    # Slightly stronger dilation merges diagram strokes (which can be far apart)
    # without bridging into surrounding text once the text mask has been
    # subtracted.
    dilated = ndi.binary_dilation(figure_mask, iterations=8)
    dilated = ndi.binary_closing(dilated, iterations=4)

    blobs = _all_blob_bboxes(dilated)
    if not blobs:
        return None

    candidates: list[tuple[float, tuple[int, int, int, int]]] = []
    for top, left, bottom, right, _area in blobs:
        bbox = (top, left, bottom, right)
        bb_h = bottom - top
        bb_w = right - left
        if bb_h < 60 or bb_w < 60:
            continue
        if _bbox_looks_like_text(bbox, (h, w)):
            continue
        if _bbox_looks_like_thin_line(bbox):
            continue

        block = figure_mask[top:bottom, left:right]
        fill = float(block.mean())
        if fill < 0.05:
            continue

        # Avoid bboxes that are mostly inside the text mask (text leaking
        # through the suppression).
        text_block = text_mask[top:bottom, left:right]
        text_overlap = float(text_block.mean())
        if text_overlap > 0.55:
            continue

        score = fill * (bb_h * bb_w)
        candidates.append((score, bbox))

    if not candidates:
        return None

    candidates.sort(reverse=True)
    return candidates[0][1]


def _trim_to_content(arr_rgb: np.ndarray, bbox: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    """Tighten a bbox by trimming surrounding white margins."""
    top, left, bottom, right = bbox
    region = arr_rgb[top:bottom, left:right]
    grey = np.array(Image.fromarray(region).convert("L"))
    not_white = grey < 245

    if not not_white.any():
        return bbox

    rows = np.where(not_white.any(axis=1))[0]
    cols = np.where(not_white.any(axis=0))[0]
    new_top = top + int(rows.min())
    new_bottom = top + int(rows.max()) + 1
    new_left = left + int(cols.min())
    new_right = left + int(cols.max()) + 1
    return new_top, new_left, new_bottom, new_right


def _apply_padding(bbox: tuple[int, int, int, int], shape: tuple[int, int]) -> tuple[int, int, int, int]:
    h, w = shape
    top, left, bottom, right = bbox
    return (
        max(0, top - PADDING),
        max(0, left - PADDING),
        min(h, bottom + PADDING),
        min(w, right + PADDING),
    )


def _bbox_area(bbox: tuple[int, int, int, int]) -> int:
    top, left, bottom, right = bbox
    return max(0, (bottom - top) * (right - left))


def _safe_open(src: Path) -> Image.Image:
    """Open even slightly truncated PNGs by allowing PIL to load them anyway."""
    from PIL import ImageFile

    ImageFile.LOAD_TRUNCATED_IMAGES = True
    return Image.open(src).convert("RGB")


def crop_one(src: Path, dst: Path) -> str:
    img = _safe_open(src)
    arr = np.array(img)
    h, w, _ = arr.shape
    page_area = h * w

    color_bbox = _detect_color_photo(arr)
    diagram_bbox = _detect_diagram(arr)

    candidates: list[tuple[str, tuple[int, int, int, int]]] = []
    if color_bbox is not None:
        candidates.append(("color", color_bbox))
    if diagram_bbox is not None:
        candidates.append(("diagram", diagram_bbox))

    if not candidates:
        return f"skip ({src.name}): no figure detected"

    # Prefer the colour photo when it covers a meaningful slice of the page;
    # otherwise pick whichever bbox gives the largest valid crop.
    chosen: tuple[str, tuple[int, int, int, int]] | None = None
    for name, bbox in candidates:
        if name == "color":
            ratio = _bbox_area(bbox) / page_area
            if ratio >= 0.025:
                chosen = (name, bbox)
                break

    if chosen is None:
        candidates.sort(key=lambda item: _bbox_area(item[1]), reverse=True)
        chosen = candidates[0]

    used, bbox = chosen
    bbox = _trim_to_content(arr, bbox)
    bbox = _apply_padding(bbox, (h, w))
    top, left, bottom, right = bbox

    crop_area = max(1, (bottom - top) * (right - left))
    ratio = crop_area / page_area
    if ratio < MIN_CROP_RATIO or ratio > MAX_CROP_RATIO:
        return f"skip ({src.name}): crop ratio {ratio:.2%} out of bounds (used {used})"

    cropped = img.crop((left, top, right, bottom))
    cropped.save(dst, "PNG", optimize=True)
    return f"ok   ({src.name}): {right - left}x{bottom - top}  ratio={ratio:.1%}  used={used}"


def main() -> int:
    if not ORIGINALS_DIR.exists():
        print(f"missing {ORIGINALS_DIR}", file=sys.stderr)
        return 1

    targets = sorted(ORIGINALS_DIR.glob("*.png"))
    if not targets:
        print(f"no PNGs in {ORIGINALS_DIR}", file=sys.stderr)
        return 1

    print(f"cropping {len(targets)} images from {ORIGINALS_DIR}")
    for src in targets:
        dst = OUTPUT_DIR / src.name
        try:
            print(crop_one(src, dst))
        except Exception as exc:
            print(f"err  ({src.name}): {exc}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
