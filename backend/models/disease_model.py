from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import os
import json

# =========================
# 📦 PATH SETUP
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "trained_model.keras")
CLASS_FILE = os.path.join(BASE_DIR, "class_names.json")

# =========================
# 🤖 LOAD MODEL
# =========================
try:
    model = load_model(MODEL_PATH)
    print(f"✅ Model loaded: {MODEL_PATH}")
    print("🔢 Output classes:", model.output_shape[-1])
except Exception as e:
    print(f"❌ Model loading failed: {e}")
    model = None

# =========================
# 🧠 LOAD CLASS NAMES
# =========================
try:
    with open(CLASS_FILE, "r") as f:
        CLASS_NAMES = json.load(f)
    print(f"✅ Loaded class names: {len(CLASS_NAMES)} classes")
except Exception as e:
    print(f"❌ Failed to load class names: {e}")
    CLASS_NAMES = []

# =========================
# 🔍 PREDICT FUNCTION
# =========================
def predict_disease(image_file):
    try:
        # ❌ Model not loaded
        if model is None:
            return "Model not loaded", 0.0

        # 🖼️ Load image
        img = Image.open(image_file).convert("RGB")
        img = img.resize((224, 224))

        # 🔢 Preprocess
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # 🤖 Predict
        preds = model.predict(img_array)
        confidence = float(np.max(preds))
        index = int(np.argmax(preds))

        # ❌ Safety check
        if index >= len(CLASS_NAMES):
            return "Unknown disease", confidence

        disease = CLASS_NAMES[index]

        # 🔥 Confidence filter (important)
        if confidence < 0.6:
            return "Uncertain - Please upload a clearer image", confidence

        return disease, confidence

    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return "Prediction failed", 0.0