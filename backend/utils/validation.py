import cv2
import numpy as np
from PIL import Image
import io

# =========================
# CONFIG
# =========================
MAX_SIZE = 5 * 1024 * 1024   # 5MB
MIN_SIZE = 2 * 1024          # 2KB

BLUR_THRESHOLD = 100         # lower = blurry
DARK_THRESHOLD = 40          # too dark
BRIGHT_THRESHOLD = 220       # too bright


# =========================
# IMAGE QUALITY CHECK
# =========================
def check_image_quality(image: Image.Image):
    try:
        img = np.array(image.convert("L"))  # grayscale

        # 🔍 Blur detection (variance of Laplacian)
        blur_score = cv2.Laplacian(img, cv2.CV_64F).var()

        # 💡 Brightness
        brightness = np.mean(img)

        # =========================
        # DECISION
        # =========================
        if blur_score < BLUR_THRESHOLD:
            return False, "Image is blurry. Please take a clear close photo."

        if brightness < DARK_THRESHOLD:
            return False, "Image too dark. Increase lighting and retry."

        if brightness > BRIGHT_THRESHOLD:
            return False, "Image too bright. Avoid direct sunlight."

        return True, "ok"

    except Exception:
        return False, "Invalid or corrupted image"


# =========================
# MAIN VALIDATION
# =========================
def validate_image(file_bytes, size, content_type=None):
    
    # =========================
    # TYPE CHECK
    # =========================
    if content_type and not content_type.startswith("image/"):
        return False, "Invalid file type (only images allowed)"

    # =========================
    # SIZE CHECK
    # =========================
    if size > MAX_SIZE:
        return False, "Image too large (max 5MB)"

    if size < MIN_SIZE:
        return False, "Image too small or unclear"

    # =========================
    # OPEN IMAGE
    # =========================
    try:
        image = Image.open(io.BytesIO(file_bytes))
    except Exception:
        return False, "Invalid image file"

    # =========================
    # QUALITY CHECK
    # =========================
    ok, msg = check_image_quality(image)

    return ok, msg