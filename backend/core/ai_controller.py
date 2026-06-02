from utils.llm_service import ask_llm

# =========================
# 🌐 MULTI-LANG HELPER
# =========================
def get_text(value, lang):
    if isinstance(value, dict):
        return value.get(lang) or value.get("en") or ""
    return value


# =========================
# 🔍 INTENT DETECTION
# =========================
def detect_intent(message: str):
    msg = message.lower()

    if any(w in msg for w in ["medicine", "spray", "dawa", "औषध", "दवा"]):
        return "medicine"

    if any(w in msg for w in ["fertilizer", "khad", "खत"]):
        return "fertilizer"

    if any(w in msg for w in ["prevent", "रोकथाम", "प्रतिबंध"]):
        return "prevent"

    if any(w in msg for w in ["weather", "मौसम", "हवामान"]):
        return "weather"

    if any(w in msg for w in ["why", "problem", "issue", "का", "क्यों"]):
        return "reason"

    if "full" in msg or "detail" in msg:
        return "full"

    return "general"


# =========================
# 🌍 FULL ADVISORY FORMAT
# =========================
def format_full_advisory(advisory, insights, lang="en"):

    def t(key):
        return get_text(advisory.get(key), lang)

    if lang == "mr":
        return f"""
🌿 समस्या: {t('problem')}
💊 औषध: {t('medicine')}
🧪 डोस: {t('dosage')}
🌱 खत: {t('fertilizer')}

🌳 मुळ: {insights.get('root_condition','')}
🌾 माती: {insights.get('soil_condition','')}

🌦 हवामान: {t('weather_effect')}
🛡 प्रतिबंध: {t('prevention')}

💡 सल्ला: {insights.get('farmer_tip','')}
"""

    elif lang == "hi":
        return f"""
🌿 समस्या: {t('problem')}
💊 दवा: {t('medicine')}
🧪 मात्रा: {t('dosage')}
🌱 खाद: {t('fertilizer')}

🌳 जड़: {insights.get('root_condition','')}
🌾 मिट्टी: {insights.get('soil_condition','')}

🌦 मौसम: {t('weather_effect')}
🛡 रोकथाम: {t('prevention')}

💡 सलाह: {insights.get('farmer_tip','')}
"""

    else:
        return f"""
🌿 Problem: {t('problem')}
💊 Medicine: {t('medicine')}
🧪 Dosage: {t('dosage')}
🌱 Fertilizer: {t('fertilizer')}

🌳 Root: {insights.get('root_condition','')}
🌾 Soil: {insights.get('soil_condition','')}

🌦 Weather: {t('weather_effect')}
🛡 Prevention: {t('prevention')}

💡 Tip: {insights.get('farmer_tip','')}
"""


# =========================
# 🌾 FALLBACK
# =========================
def structured_fallback(disease, message, lang, advisory):

    intent = detect_intent(message)

    if intent == "medicine":
        return f"💊 {get_text(advisory.get('medicine'), lang)}"

    if intent == "fertilizer":
        return f"🌱 {get_text(advisory.get('fertilizer'), lang)}"

    if intent == "prevent":
        return f"🛡 {get_text(advisory.get('prevention'), lang)}"

    if intent == "weather":
        return f"🌦 {get_text(advisory.get('weather_effect'), lang)}"

    if intent == "reason":
        return f"⚠ {get_text(advisory.get('problem'), lang)}"

    return "🌾 Ask about medicine, fertilizer, prevention or weather"


# =========================
# 🧠 MAIN PROCESSOR
# =========================
def process_ai_request(disease, message, lang="en", advisory=None, insights=None):

    try:
        advisory = advisory or {}
        insights = insights or {}

        intent = detect_intent(message)

        # FULL REPORT
        if intent == "full":
            return format_full_advisory(advisory, insights, lang)

        fallback = structured_fallback(disease, message, lang, advisory)

        # Skip LLM for small messages
        if len(message.split()) < 3:
            return fallback

        prompt = f"""
Explain simply for farmer.

Disease: {disease}
Question: {message}

Medicine: {get_text(advisory.get('medicine'), lang)}
Dosage: {get_text(advisory.get('dosage'), lang)}
"""

        llm_reply = ask_llm(prompt)

        if llm_reply and len(llm_reply) > 10:
            return llm_reply

        return fallback

    except Exception as e:
        print("AI error:", e)
        return structured_fallback(disease, message, lang, advisory)