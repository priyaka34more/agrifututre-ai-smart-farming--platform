import os
import json
import tensorflow as tf
import logging

logger = logging.getLogger("ModelLoader")

# =========================
# 📁 PATHS
# =========================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

# =========================
# 🔁 CACHE
# =========================
MODEL_CACHE = {}

# 🔥 GLOBAL CLASS NAMES
class_names = []


# =========================
# 🤖 LOAD MODEL + CLASSES
# =========================
def load_model_safe(model_name: str):
    global class_names

    model_path = os.path.join(MODEL_DIR, model_name)

    # 🔁 Return cached model
    if model_name in MODEL_CACHE:
        logger.info("Using cached model")
        return MODEL_CACHE[model_name]

    # ❌ Model file missing
    if not os.path.isfile(model_path):
        logger.error("Model not found: %s", model_path)
        return None

    try:
        # =========================
        # 🤖 LOAD MODEL
        # =========================
        model = tf.keras.models.load_model(model_path, compile=False)
        MODEL_CACHE[model_name] = model

        # =========================
        # 📊 LOAD CLASS NAMES
        # =========================
        json_path = os.path.join(MODEL_DIR, "class_names.json")

        if os.path.exists(json_path):
            with open(json_path, "r") as f:
                data = json.load(f)

                class_names.clear()
                class_names.extend(data)

            logger.info("Classes loaded: %s", len(class_names))

            # 🔥 Validate with model output
            try:
                output_classes = model.output_shape[-1]

                if output_classes != len(class_names):
                    logger.warning(
                        "Mismatch: Model expects %s classes but JSON has %s",
                        output_classes,
                        len(class_names),
                    )
            except Exception:
                logger.warning("Could not validate model output shape")

        else:
            logger.error("class_names.json not found at: %s", json_path)
            class_names.clear()  # prevent using stale data

        logger.info("Model loaded successfully")

        return model

    except Exception as e:
        logger.error("Error loading model: %s", e)
        return None


# =========================
# 🚀 PRELOAD (OPTIONAL)
# =========================
def preload_models():
    logger.info("Preloading model...")
    load_model_safe("trained_model.h5")


# =========================
# ⚡ OPTIONAL WARMUP
# =========================
def warmup_model(model):
    """
    Run one dummy prediction to reduce first-request latency
    """
    try:
        import numpy as np
        dummy = np.zeros((1, 224, 224, 3))
        model.predict(dummy, verbose=0)
        logger.info("Model warmup complete")
    except Exception as e:
        logger.warning("Warmup failed: %s", e)