import os
import pandas as pd
import difflib
import logging

logger = logging.getLogger("Advisory")

ADVISORY_DB = {}

# =========================
# 🔧 NORMALIZE
# =========================
def _norm(text: str):
    if not text:
        return ""
    return str(text).strip().lower().replace("_", " ").replace("-", " ")

# =========================
# 📥 LOAD CSV
# =========================
def load_advisory_from_csv(csv_path: str):
    global ADVISORY_DB
    ADVISORY_DB = {}

    if not os.path.exists(csv_path):
        logger.error("advisory.csv not found: %s", csv_path)
        return

    df = pd.read_csv(csv_path)
    df.columns = [c.strip().lower() for c in df.columns]

    for _, row in df.iterrows():
        disease = _norm(row.get("disease", ""))

        if not disease:
            continue

        ADVISORY_DB[disease] = {
            "problem": str(row.get("problem_en", "")),
            "problem_hi": str(row.get("problem_hi", "")),
            "problem_mr": str(row.get("problem_mr", "")),
            "action": str(row.get("action_en", "")),
            "action_hi": str(row.get("action_hi", "")),
            "action_mr": str(row.get("action_mr", "")),
            "medicine": str(row.get("medicine_en", "")),
            "medicine_hi": str(row.get("medicine_hi", "")),
            "medicine_mr": str(row.get("medicine_mr", "")),
            "dosage": str(row.get("dosage", "")),
            "fertilizer": str(row.get("fertilizer", "")),
            "prevention": str(row.get("prevention_en", "")),
            "prevention_hi": str(row.get("prevention_hi", "")),
            "prevention_mr": str(row.get("prevention_mr", "")),
            "weather_effect": str(row.get("weather_effect", "")),
            "farmer_tip": str(row.get("farmer_tip_en", "")),
            "farmer_tip_hi": str(row.get("farmer_tip_hi", "")),
            "farmer_tip_mr": str(row.get("farmer_tip_mr", "")),
            "urgency_level": str(row.get("urgency_level", "")),
            "confidence_level": str(row.get("confidence_level", "")),
            "quick_advice": str(row.get("quick_advice_en", "")),
            "quick_advice_hi": str(row.get("quick_advice_hi", "")),
            "quick_advice_mr": str(row.get("quick_advice_mr", "")),
            "organic_solution": str(row.get("organic_solution_en", "")),
            "organic_solution_hi": str(row.get("organic_solution_hi", "")),
            "organic_solution_mr": str(row.get("organic_solution_mr", "")),
        }

    logger.info("Advisory loaded: %s entries", len(ADVISORY_DB))

# =========================
# 🔎 GET ADVISORY (SMART MATCH)
# =========================
def get_advisory(disease: str, lang: str = "en") -> dict:
    if not disease:
        return _default()

    key = _norm(disease)
    
    # Map common PlantVillage disease names to advisory entries
    plantvillage_mapping = {
        "apple scab": "leaf_spot",
        "black rot": "anthracnose",
        "cedar apple rust": "rust",
        "healthy": "yellow_leaf",
        "powdery mildew": "powdery_mildew",
        "cercospora leaf spot gray leaf spot": "leaf_spot",
        "common rust": "rust",
        "northern leaf blight": "rust",
        "black measles": "anthracnose",
        "leaf blight isariopsis leaf spot": "leaf_spot",
        "huanglongbing citrus greening": "yellow_leaf",
        "bacterial spot": "bacterial_blight",
        "early blight": "early_blight",
        "late blight": "late_blight",
        "leaf mold": "downy_mildew",
        "septoria leaf spot": "leaf_spot",
        "spider mites two-spotted spider mites": "aphid_attack",
        "target spot": "leaf_spot",
        "tomato yellow leaf curl virus": "leaf_curl",
        "tomato mosaic virus": "leaf_curl",
        "leaf scorch": "leaf_spot"
    }
    
    # Check if we have a direct mapping
    for pv_name, adv_name in plantvillage_mapping.items():
        if pv_name in key:
            key = adv_name
            break

    # 1️⃣ Exact match
    if key in ADVISORY_DB:
        advisory = ADVISORY_DB[key].copy()
        if lang == "hi":
            advisory["problem"] = advisory.get("problem_hi", advisory["problem"])
            advisory["action"] = advisory.get("action_hi", advisory["action"])
            advisory["medicine"] = advisory.get("medicine_hi", advisory["medicine"])
            advisory["prevention"] = advisory.get("prevention_hi", advisory["prevention"])
            advisory["farmer_tip"] = advisory.get("farmer_tip_hi", advisory.get("farmer_tip", ""))
            advisory["quick_advice"] = advisory.get("quick_advice_hi", advisory.get("quick_advice", ""))
            advisory["organic_solution"] = advisory.get("organic_solution_hi", advisory.get("organic_solution", ""))
        elif lang == "mr":
            advisory["problem"] = advisory.get("problem_mr", advisory["problem"])
            advisory["action"] = advisory.get("action_mr", advisory["action"])
            advisory["medicine"] = advisory.get("medicine_mr", advisory["medicine"])
            advisory["prevention"] = advisory.get("prevention_mr", advisory["prevention"])
            advisory["farmer_tip"] = advisory.get("farmer_tip_mr", advisory.get("farmer_tip", ""))
            advisory["quick_advice"] = advisory.get("quick_advice_mr", advisory.get("quick_advice", ""))
            advisory["organic_solution"] = advisory.get("organic_solution_mr", advisory.get("organic_solution", ""))
        return advisory

    # 2️⃣ Similarity match (lower threshold to 0.4)
    best_match = None
    best_score = 0

    for k in ADVISORY_DB:
        score = difflib.SequenceMatcher(None, key, k).ratio()

        if score > best_score:
            best_score = score
            best_match = k

    if best_score > 0.4:
        advisory = ADVISORY_DB[best_match].copy()
        if lang == "hi":
            advisory["problem"] = advisory.get("problem_hi", advisory["problem"])
            advisory["action"] = advisory.get("action_hi", advisory["action"])
            advisory["medicine"] = advisory.get("medicine_hi", advisory["medicine"])
            advisory["prevention"] = advisory.get("prevention_hi", advisory["prevention"])
            advisory["farmer_tip"] = advisory.get("farmer_tip_hi", advisory.get("farmer_tip", ""))
            advisory["quick_advice"] = advisory.get("quick_advice_hi", advisory.get("quick_advice", ""))
            advisory["organic_solution"] = advisory.get("organic_solution_hi", advisory.get("organic_solution", ""))
        elif lang == "mr":
            advisory["problem"] = advisory.get("problem_mr", advisory["problem"])
            advisory["action"] = advisory.get("action_mr", advisory["action"])
            advisory["medicine"] = advisory.get("medicine_mr", advisory["medicine"])
            advisory["prevention"] = advisory.get("prevention_mr", advisory["prevention"])
            advisory["farmer_tip"] = advisory.get("farmer_tip_mr", advisory.get("farmer_tip", ""))
            advisory["quick_advice"] = advisory.get("quick_advice_mr", advisory.get("quick_advice", ""))
            advisory["organic_solution"] = advisory.get("organic_solution_mr", advisory.get("organic_solution", ""))
        return advisory

    return _default()

# =========================
# 🛡 DEFAULT
# =========================
def _default():
    return {
        "problem": "Disease detected",
        "action": "Consult agriculture expert",
        "medicine": "Use suitable pesticide",
        "dosage": "Follow label instructions",
        "fertilizer": "Apply balanced fertilizer",
        "prevention": "Keep field clean",
        "weather_effect": "Humidity increases disease"
    }

# =========================
# 🚀 INIT FUNCTION (FIX ERROR)
# =========================
def init_advisory():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, "data", "advisory.csv")

    load_advisory_from_csv(csv_path)