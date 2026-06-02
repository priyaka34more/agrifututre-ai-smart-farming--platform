# =========================================================
# 🌱 AGRIFUTURE AI DISEASE DETECTION MODULE
# =========================================================

import io
import cv2
import json
import uuid
import torch
import logging
import numpy as np
from sqlalchemy import text

from PIL import Image
from datetime import datetime, timedelta

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Request
)

from database import SessionLocal
from database.db_helper import get_advisory
from services.advisory_service import get_advisory as get_csv_advisory

from models.history_model import DetectionHistory
from models.alert_model import OutbreakAlert

logger = logging.getLogger("DiseaseAPI")

router = APIRouter()

# =========================================================
# ⚙️ CONFIG
# =========================================================

CONFIDENCE_THRESHOLD = 60
HIGH_CONFIDENCE = 85

MIN_IMAGE_SIZE = 224

BLUR_THRESHOLD = 30
MEDIUM_BLUR_THRESHOLD = 60

MIN_BRIGHTNESS = 40
MAX_BRIGHTNESS = 230

# =========================================================
# 🧹 CLEAN DISEASE NAME
# =========================================================

def clean_disease_name(name: str):

    try:

        return (
            name
            .replace("_", " ")
            .replace("(", "")
            .replace(")", "")
            .strip()
            .title()
        )

    except Exception:

        return str(name)

# =========================================================
# 🖼️ IMAGE QUALITY CHECK
# =========================================================

def check_image_quality(image):

    try:

        gray = cv2.cvtColor(
            np.array(image),
            cv2.COLOR_RGB2GRAY
        )

        blur_score = cv2.Laplacian(
            gray,
            cv2.CV_64F
        ).var()

        brightness = np.mean(gray)

        width, height = image.size

        # ❌ BAD IMAGE

        if (
            blur_score < BLUR_THRESHOLD
            or brightness < MIN_BRIGHTNESS
            or brightness > MAX_BRIGHTNESS
            or width < MIN_IMAGE_SIZE
            or height < MIN_IMAGE_SIZE
        ):

            return {
                "status": "error",
                "message": "Image quality too low"
            }

        # ⚠️ MEDIUM IMAGE

        if blur_score < MEDIUM_BLUR_THRESHOLD:

            return {
                "status": "warning",
                "message": "Image slightly blurry"
            }

        # ✅ GOOD IMAGE

        return {
            "status": "good",
            "message": "Good image"
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }

# =========================================================
# 🧠 PREPROCESS IMAGE
# =========================================================

def preprocess_image(image, transform):

    image = image.convert("RGB")

    tensor = transform(image)

    tensor = tensor.unsqueeze(0)

    return tensor

# =========================================================
# 🚨 OUTBREAK DETECTION
# =========================================================

def check_outbreak(
    disease: str,
    region: str,
    db
):
    try:
        since = datetime.utcnow() - timedelta(hours=24)

        schema_rows = db.execute(
            text("PRAGMA table_info(detection_history)")
        ).fetchall()
        available_columns = {
            row[1]
            for row in schema_rows
            if len(row) > 1
        }

        if "disease" not in available_columns or "created_at" not in available_columns:
            return

        where_parts = [
            "disease = :disease",
            "created_at >= :since"
        ]
        params = {
            "disease": disease,
            "since": since
        }

        if "region" in available_columns:
            where_parts.append("region = :region")
            params["region"] = region

        count_sql = (
            "SELECT COUNT(1) AS total FROM detection_history "
            f"WHERE {' AND '.join(where_parts)}"
        )
        count = db.execute(
            text(count_sql),
            params
        ).scalar() or 0

        if count >= 5:

            existing = db.query(
                OutbreakAlert
            ).filter(
                OutbreakAlert.disease == disease,
                OutbreakAlert.region == region,
                OutbreakAlert.created_at >= since
            ).first()

            if not existing:

                alert = OutbreakAlert(
                    disease=disease,
                    region=region,
                    severity="High",
                    message=f"⚠️ {disease} outbreak detected in {region}"
                )

                db.add(alert)

                db.commit()

                logger.warning(
                    "🚨 OUTBREAK ALERT CREATED"
                )
    except Exception as outbreak_error:
        db.rollback()
        logger.warning(
            "Outbreak check skipped due to schema/runtime issue: %s",
            outbreak_error
        )

# =========================================================
# 🌱 PREDICT DISEASE
# =========================================================

@router.post("/predict")

async def predict_disease(

    request: Request,

    file: UploadFile = File(...),

    lang: str = Form("en"),

    region: str = Form("Maharashtra")

):

    db = SessionLocal()

    request_id = getattr(
        request.state,
        "request_id",
        "unknown"
    )

    try:

        # =====================================================
        # 📥 READ IMAGE
        # =====================================================

        contents = await file.read()

        if not contents:

            return {
                "status": "error",
                "message": "Empty image uploaded"
            }

        image = Image.open(
            io.BytesIO(contents)
        ).convert("RGB")

        # =====================================================
        # 🖼️ IMAGE QUALITY CHECK
        # =====================================================

        quality = check_image_quality(image)

        if quality["status"] == "error":

            return quality

        # =====================================================
        # 🤖 LOAD MODEL
        # =====================================================

        model = request.app.state.model

        class_names = request.app.state.class_names

        transform = request.app.state.transform

        device = request.app.state.device

        # =====================================================
        # 🔄 PREPROCESS IMAGE
        # =====================================================

        img_tensor = preprocess_image(
            image,
            transform
        )

        img_tensor = img_tensor.to(device)

        # =====================================================
        # 🧠 AI PREDICTION
        # =====================================================

        with torch.no_grad():

            outputs = model(img_tensor)

            probabilities = torch.nn.functional.softmax(
                outputs[0],
                dim=0
            )

        confidence, predicted = torch.max(
            probabilities,
            0
        )

        confidence = round(
            float(confidence.item() * 100),
            2
        )

        disease = class_names[
            predicted.item()
        ]

        disease_clean = clean_disease_name(
            disease
        )

        # =====================================================
        # ⚠️ LOW CONFIDENCE
        # =====================================================

        if confidence < CONFIDENCE_THRESHOLD:

            warning_text = {
                "en": {
                    "message": "Low confidence prediction",
                    "suggestion": "Upload clearer and focused leaf image"
                },
                "hi": {
                    "message": "कम विश्वास वाला परिणाम",
                    "suggestion": "कृपया अधिक स्पष्ट और फोकस वाली पत्ती की तस्वीर अपलोड करें"
                },
                "mr": {
                    "message": "कमी विश्वास असलेला निकाल",
                    "suggestion": "कृपया अधिक स्पष्ट आणि फोकस असलेली पानाची प्रतिमा अपलोड करा"
                }
            }.get(lang, {
                "message": "Low confidence prediction",
                "suggestion": "Upload clearer and focused leaf image"
            })

            return {

                "status": "warning",

                "message": warning_text["message"],

                "confidence": confidence,

                "suggestion": warning_text["suggestion"]
            }

        # =====================================================
        # 📋 CONVERT MODEL LABEL → DATABASE LABEL
        # =====================================================

        try:

            parts = disease.split("_", 1)

            if len(parts) == 2:

                crop = parts[0]

                disease_part = parts[1]

                disease_part = disease_part.replace(
                    " ",
                    "_"
                )

                db_disease_name = (
                    f"{crop}___{disease_part}"
                )

            else:

                db_disease_name = disease

        except Exception:

            db_disease_name = disease

        # =====================================================
        # 📋 GET MULTILINGUAL ADVISORY
        # Flow: populate_knowledge.py seeded DB advisory + advisory_service.py enrichment
        # =====================================================

        advisory = get_advisory(
            db_disease_name,
            lang
        )

        csv_advisory = (
            get_csv_advisory(db_disease_name)
            or get_csv_advisory(disease)
            or get_csv_advisory(disease_clean.replace(" ", "_"))
        )

        if csv_advisory:
            csv_normalized = {
                "problem": csv_advisory.get("problem", {}).get(lang, csv_advisory.get("problem", {}).get("en", "N/A")),
                "medicine": csv_advisory.get("medicine", {}).get(lang, csv_advisory.get("medicine", {}).get("en", "N/A")),
                "dosage": csv_advisory.get("dosage", "N/A"),
                "fertilizer": csv_advisory.get("action", {}).get(lang, csv_advisory.get("action", {}).get("en", "N/A")),
                "root_condition": csv_advisory.get("root_health", "N/A"),
                "soil_condition": csv_advisory.get("soil_condition", "N/A"),
                "weather_effect": csv_advisory.get("weather_effect", "N/A"),
                "prevention": csv_advisory.get("prevention", {}).get(lang, csv_advisory.get("prevention", {}).get("en", "N/A")),
                "farmer_tip": csv_advisory.get("farmer_tip", {}).get(lang, csv_advisory.get("farmer_tip", {}).get("en", "N/A")),
                "crop": csv_advisory.get("crop", "Unknown"),
                "urgency": csv_advisory.get("urgency", "Moderate Priority")
            }

            advisory_is_missing = (
                (not advisory)
                or str(advisory.get("problem", "")).lower().startswith("no advisory")
                or str(advisory.get("problem", "")).lower().startswith("database error")
            )

            if advisory_is_missing:
                advisory = csv_normalized
            else:
                for key, value in csv_normalized.items():
                    if advisory.get(key) in (None, "", "N/A", "Unknown", "No advisory found"):
                        advisory[key] = value

        # =====================================================
        # 🏆 CONFIDENCE LEVEL
        # =====================================================

        if confidence >= HIGH_CONFIDENCE:

            confidence_level = "high"

        else:

            confidence_level = "medium"

        # =====================================================
        # 🛡️ EXTRACT USER ID FROM TOKEN
        # =====================================================
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                from utils.auth_utils import decode_token
                payload = decode_token(token)
                if payload:
                    user_id = payload.get("id")
            except Exception:
                pass

        # =====================================================
        # 💾 SAVE HISTORY
        # =====================================================

        detection_id = str(uuid.uuid4())

        try:

            detection = DetectionHistory(

                id=detection_id,

                user_id=user_id,

                disease=disease,

                confidence=confidence / 100,

                region=region,

                result_json=json.dumps({

                    "lang": lang,

                    "source": "pytorch"
                })
            )

            db.add(detection)

            db.commit()

        except Exception as history_error:

            db.rollback()

            # Backward-compatible fallback for older schemas where some columns
            # (e.g., user_id or region) may not exist yet.
            try:
                schema_rows = db.execute(
                    text("PRAGMA table_info(detection_history)")
                ).fetchall()
                available_columns = {
                    row[1]
                    for row in schema_rows
                    if len(row) > 1
                }

                payload = {
                    "id": detection_id,
                    "user_id": user_id,
                    "disease": disease,
                    "confidence": confidence / 100,
                    "region": region,
                    "result_json": json.dumps({"lang": lang, "source": "pytorch"}),
                    "created_at": datetime.utcnow()
                }

                ordered_columns = [
                    column
                    for column in [
                        "id",
                        "user_id",
                        "disease",
                        "confidence",
                        "region",
                        "result_json",
                        "created_at"
                    ]
                    if column in available_columns
                ]

                if ordered_columns:
                    columns_sql = ", ".join(ordered_columns)
                    values_sql = ", ".join(
                        f":{column}"
                        for column in ordered_columns
                    )
                    db.execute(
                        text(
                            f"""
                            INSERT INTO detection_history ({columns_sql})
                            VALUES ({values_sql})
                            """
                        ),
                        {
                            key: payload[key]
                            for key in ordered_columns
                        }
                    )
                    db.commit()
                else:
                    logger.warning("History save skipped: detection_history has no insertable columns")
            except Exception as fallback_error:
                db.rollback()
                logger.warning(
                    "History save skipped: %s | fallback failed: %s",
                    history_error,
                    fallback_error
                )

        # =====================================================
        # 🪵 LOG ACTIVITY
        # =====================================================
        if user_id:
            try:
                from utils.activity_logger import log_activity
                log_activity(
                    db=db,
                    user_id=user_id,
                    module="Disease Detection",
                    action=f"Scan Crop: {disease_clean}",
                    result="Success",
                    extra_data=json.dumps({"confidence": f"{confidence}%", "region": region})
                )
            except Exception as le:
                logger.error(f"Failed to log disease activity: {le}")

        # =====================================================
        # 🚨 OUTBREAK CHECK
        # =====================================================

        if "healthy" not in disease.lower():

            check_outbreak(
                disease,
                region,
                db
            )

        # =====================================================
        # 📤 FINAL RESPONSE
        # =====================================================

        return {

            "status": "success",

            "result_id": detection_id,

            "disease": disease_clean,

            "confidence": f"{confidence}%",

            "crop": advisory.get("crop", disease.split("_")[0] if "_" in disease else "Unknown"),

            "confidence_level": confidence_level,

            "urgency": advisory.get("urgency", "Moderate Priority"),

            "problem": advisory.get(
                "problem",
                f"{disease_clean} detected"
            ),

            "medicine": advisory.get(
                "medicine",
                "Use recommended pesticide"
            ),

            "dosage": advisory.get(
                "dosage",
                "Follow label instructions"
            ),

            "fertilizer": advisory.get(
                "fertilizer",
                "Apply balanced nutrients"
            ),

            "root_condition": advisory.get(
                "root_condition",
                "Monitor root health"
            ),

            "soil_condition": advisory.get(
                "soil_condition",
                "Maintain healthy soil"
            ),

            "weather_effect": advisory.get(
                "weather_effect",
                "Humidity may increase spread"
            ),

            "prevention": advisory.get(
                "prevention",
                "Inspect nearby plants regularly"
            ),

            "farmer_tip": advisory.get(
                "farmer_tip",
                "Early treatment improves recovery"
            ),

            "advisory": advisory,

            "image_quality": quality["status"],

            "request_id": request_id,

            "source": "pytorch",

            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:

        logger.error(
            "Disease prediction error: %s",
            e,
            exc_info=True
        )

        return {

            "status": "error",

            "message": "Disease detection failed",

            "error": str(e),

            "request_id": request_id
        }

    finally:

        db.close()

# =========================================================
# ❤️ HEALTH CHECK
# =========================================================

@router.get("/health")

async def disease_health():

    return {

        "status": "ok",

        "module": "PyTorch Disease Detection",

        "model": "MobileNetV3",

        "engine": "PyTorch"
    }
