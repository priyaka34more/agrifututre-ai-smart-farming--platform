from utils.advisory import get_advisory

# =========================
# 🧠 SMART ADVISORY ENGINE
# =========================

def generate_smart_advisory(disease, crop=None, state=None, season=None, confidence=0.0):
    
    base = get_advisory(disease)

    # =========================
    # 🔥 URGENCY ENGINE
    # =========================
    urgency = "low"

    if confidence > 0.85:
        urgency = "high"
    elif confidence > 0.6:
        urgency = "medium"

    if base.get("severity_level", "").lower() == "severe":
        urgency = "high"

    # =========================
    # 🌦️ WEATHER BOOST LOGIC
    # =========================
    weather_note = base.get("weather", "")

    if season == "Monsoon":
        urgency = "high"

    # =========================
    # 💡 FINAL RESPONSE BUILDER
    # =========================
    result = {
        "problem": base.get("problem"),
        "action": base.get("action"),
        "reason": base.get("reason"),
        "prevention": base.get("prevention"),
        "medicine": base.get("medicine"),
        "fertilizer": base.get("fertilizer"),
        "dosage": base.get("dosage"),

        # NEW AI LAYER
        "urgency_level": urgency,
        "weather_effect": weather_note,
        "farmer_tip": base.get("farmer_tip", "Monitor crop daily"),
        "confidence_level": confidence,

        "quick_advice": "Act immediately if spread increases"
    }

    return result