import os
import json
import numpy as np
import tensorflow as tf
from PIL import Image

# =========================
# 📁 PATHS
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_DIR = os.path.join(BASE_DIR, "models")

MOBILENET_PATH = os.path.join(MODEL_DIR, "mobilenetv2.keras")
EFFICIENTNET_PATH = os.path.join(MODEL_DIR, "efficientnet.keras")
CLASS_PATH = os.path.join(MODEL_DIR, "class_names.json")

IMG_SIZE = (224, 224)

# =========================
# 🧠 LOAD MODELS
# =========================
print("🔄 Loading Hybrid Models...")

mobilenet_model = tf.keras.models.load_model(MOBILENET_PATH)
efficient_model = tf.keras.models.load_model(EFFICIENTNET_PATH)

with open(CLASS_PATH, "r") as f:
    CLASS_NAMES = json.load(f)

print(f"✅ Models Loaded | Classes: {len(CLASS_NAMES)}")

# =========================
# 🖼️ IMAGE PREPROCESS
# =========================
def preprocess_image(image: Image.Image):
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)
    img = np.array(image, dtype=np.float32) / 255.0
    return np.expand_dims(img, axis=0)

# =========================
# 🧠 HYBRID PREDICTION ENGINE
# =========================
def predict_disease(image: Image.Image):
    img = preprocess_image(image)

    # 🔹 Step 1: MobileNet prediction (fast model)
    mob_pred = mobilenet_model.predict(img, verbose=0)[0]

    mob_idx = int(np.argmax(mob_pred))
    mob_conf = float(mob_pred[mob_idx])

    model_used = "mobilenetv2"

    # 🔹 Step 2: fallback to EfficientNet if uncertain
    if mob_conf < 0.75:
        print("⚡ Low confidence → switching to EfficientNet")
        eff_pred = efficient_model.predict(img, verbose=0)[0]

        final_pred = eff_pred
        model_used = "efficientnet"
    else:
        final_pred = mob_pred

    # 🔹 Step 3: final result
    final_idx = int(np.argmax(final_pred))
    final_conf = float(final_pred[final_idx])
    disease = CLASS_NAMES[final_idx]

    # 🔹 Step 4: top 3 predictions
    top_indices = final_pred.argsort()[-3:][::-1]

    top_predictions = [
        {
            "disease": CLASS_NAMES[i],
            "confidence": round(float(final_pred[i]), 4)
        }
        for i in top_indices
    ]

    return {
        "status": "success",
        "disease": disease,
        "confidence": round(final_conf, 4),
        "model_used": model_used,
        "top_predictions": top_predictions
    }