from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from utils.advisory import get_advisory
from utils.farmer_brain import farmer_brain

async def local_verify_token(authorization: str = Header(None)):
    from main import verify_token
    return await verify_token(authorization)

router = APIRouter()

# =========================
# 🔐 ENV LOAD & LAZY OPENAI
# =========================
load_dotenv()

_client_cache = None

def get_openai_client():
    global _client_cache
    if _client_cache is not None:
        return _client_cache
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
        
    try:
        from openai import OpenAI
        _client_cache = OpenAI(api_key=api_key)
        return _client_cache
    except ImportError:
        return None


# =========================
# 📩 REQUEST MODEL
# =========================
class ChatRequest(BaseModel):
    disease: str = "unknown"
    message: str
    lang: str = "en"


# =========================
# 🌍 LANGUAGE SUPPORT
# =========================
def lang_instruction(lang):
    if lang == "hi":
        return """
- Reply in warm, friendly Hinglish (a mixture of simple Hindi and English using Devanagari script or clean phrasing) that Indian farmers naturally speak.
- Use familiar, highly practical local farming words like 'Dawai' (दवाई/दवा), 'Khad' (खाद), 'Mitti' (मिट्टी/जमीन), 'Beej' (बीज), 'Chhidkaw' (छिड़काव).
- Keep the language conversational, comforting, and extremely easy to understand.
"""
    elif lang == "mr":
        return """
- Reply in warm, friendly Marathish (a mixture of simple Marathi and English) that local Maharashtra farmers naturally speak.
- Use familiar, highly practical local farming words like 'Aushadh' (औषध), 'Khat' (खत), 'Sheti' (शेती), 'Beene' (बियाणे/बीज), 'Fawarni' (फवारणी).
- Keep the language conversational, comforting, and extremely easy to understand.
"""
    return """
- Reply in simple, friendly English or mixed Hinglish/Marathish words for Indian farmers.
- Use practical, easily understandable terms instead of high-level scientific terminology (e.g. use 'spray' instead of 'foliar application', 'bugs/insects' instead of 'invertebrate pests').
"""

# =========================
# 📋 RESPONSE FORMAT
# =========================
# 1. Problem (simple)
# 2. Solution (steps)
# 3. Optional precaution


# =========================
# 🧠 INTENT DETECTION (VERY IMPORTANT)
# =========================
def _advisory_lang_text(advisory: dict, field: str, lang: str) -> str:
    """Advisory CSV uses plain strings; keep compatible if values are ever nested dicts."""
    val = advisory.get(field)
    if isinstance(val, dict):
        return (val.get(lang) or val.get("en") or "").strip()
    return str(val or "").strip()


def detect_intent(message: str):
    msg = message.lower()

    if any(x in msg for x in ["medicine", "spray", "pesticide", "fungicide", "dawai", "फिटक", "बाया", "कीटनाशक", "औषध"]):
        return "medicine"
    if any(x in msg for x in ["fertilizer", "npk", "nutrient", "urea", "khad", "खत", "पोषण"]):
        return "fertilizer"
    if any(x in msg for x in ["dose", "dosage", "quantity", "how much", "kitna", "कितना", "प्रमाण"]):
        return "dosage"
    if any(x in msg for x in ["prevent", "stop", "control", "avoid", "rokna", "रोकना", "बचाव", "प्रतिबंध"]):
        return "prevention"
    if any(x in msg for x in ["soil", "root", "land", "mitti", "मिट्टी", "जमीन"]):
        return "soil"
    if any(x in msg for x in ["weather", "rain", "humidity", "temperature", "pani", "पानी", "बारिश", "हवामान"]):
        return "weather"
    if any(x in msg for x in ["why", "reason", "cause", "happened", "kyun", "क्यों", "कारण"]):
        return "reason"

    return "general"


# =========================
# 🔍 SYMPTOM-BASED DISEASE CLASSIFIER
# =========================
def detect_disease_from_symptoms(message: str, current_disease: str = "unknown") -> str:
    """
    Translates raw symptom descriptions (e.g. 'yellow leaves', 'black spots', 'curling')
    into actual agricultural disease categories for farmers who don't know scientific names.
    """
    if current_disease and current_disease.lower() != "unknown" and current_disease.strip() != "":
        return current_disease

    msg = message.lower()
    
    # 1. Identify the crop
    crop = ""
    if any(x in msg for x in ["tomato", "tamatar", "टमाटर", "टोमॅटो"]):
        crop = "Tomato"
    elif any(x in msg for x in ["potato", "aalu", "आलू", "बटाटा"]):
        crop = "Potato"
    elif any(x in msg for x in ["onion", "pyaaz", "प्याज़", "कांदा"]):
        crop = "Onion"
    elif any(x in msg for x in ["rice", "paddy", "dhaan", "धान", "भात"]):
        crop = "Rice"
    elif any(x in msg for x in ["wheat", "gehun", "गेहूं", "गहू"]):
        crop = "Wheat"
    else:
        crop = "Crop"

    # 2. Identify the visual symptoms
    symptom = ""
    if any(x in msg for x in ["yellow spot", "yellow leaf", "yellowing", "peela", "पिवळी", "पीला", "yellow"]):
        symptom = "Leaf Yellowing & Spotting"
    elif any(x in msg for x in ["black spot", "brown spot", "spots", "dhabba", "ठिपके", "spot", "धब्बे"]):
        symptom = "Leaf Spot Disease"
    elif any(x in msg for x in ["curl", "curling", "muda", "मुरडणे", "सिकुड़ना", "mudi"]):
        symptom = "Leaf Curl Virus"
    elif any(x in msg for x in ["white powder", "powdery", "pandhri", "पांढरी", "सफेद पाउडर", "mildew"]):
        symptom = "Powdery Mildew"
    elif any(x in msg for x in ["dry leaf", "burnt", "dry", "sookha", "सुकलेली", "edges"]):
        symptom = "Leaf Blight / Scorching"
    elif any(x in msg for x in ["hole", "insect", "worm", "keeda", "कीड़ा", "अळी", "pest"]):
        symptom = "Pest Infestation"
    else:
        symptom = "General Health Issue"

    return f"{crop} {symptom}"


# =========================
# 🤖 OPENAI CALL
# =========================
async def get_ai_response(system_prompt, user_message):
    client_inst = get_openai_client()
    if not client_inst:
        return None

    try:
        response = client_inst.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=120,
            temperature=0.3
        )

        return response.choices[0].message.content.strip()

    except Exception:
        return None


# =========================
# 🚀 MAIN CHAT API (/ask + /chat)
# =========================
async def _run_chat(req: ChatRequest):

    # =========================
    # 🛑 VALIDATION
    # =========================
    if not req.message.strip():
        return {
            "status": "error",
            "reply": "Please ask a valid question.",
            "mode": "validation"
        }

    # =========================
    # 🧠 DIAGNOSE DISEASES FROM VISUAL SYMPTOMS
    # =========================
    disease = detect_disease_from_symptoms(req.message, req.disease)

    # =========================
    # 🧠 STEP 1: OFFLINE BRAIN (ALWAYS)
    # =========================
    fallback_reply = farmer_brain(disease, req.message, req.lang)

    # =========================
    # 🧠 STEP 2: INTENT
    # =========================
    intent = detect_intent(req.message)

    advisory = get_advisory(disease, req.lang)

    # =========================
    # 🧠 STEP 3: SMART PROMPT
    # =========================
    system_prompt = f"""
You are an agricultural expert helping Indian farmers. 
Be like a friendly advisor.

Crop Disease/Symptom described: {disease}
User intent: {intent}

Response Rules:
- Answer ONLY in {req.lang} (Marathi, Hindi or English).
- Format:
  1. Problem (What is wrong?)
  2. Solution (Simple steps)
  3. Precaution (How to avoid in future?)
- Total length: max 120 words.
- Avoid technical or scientific terms. Use local farming words.
- Note: Farmers describe physical leaf symptoms (e.g. leaf yellowing, black spots, dry edges, holes) rather than knowing the exact scientific name. Identify the underlying disease or pest issue from their descriptions, explain it simply, and recommend clear actionable steps.

Context:
Problem: {advisory.get('problem', '')}
Medicine: {advisory.get('medicine', '')}
Action: {advisory.get('action', '')}
Farmer Tip: {advisory.get('farmer_tip', '')}
Quick Advice: {advisory.get('quick_advice', '')}
Organic Solution: {advisory.get('organic_solution', '')}

{lang_instruction(req.lang)}
"""

    # =========================
    # 🤖 STEP 4: TRY AI
    # =========================
    ai_reply = await get_ai_response(system_prompt, req.message)

    # =========================
    # ✅ STEP 5: RESPONSE PRIORITY
    # =========================
    if ai_reply:
        return {
            "status": "online",
            "reply": ai_reply,
            "intent": intent,
            "mode": "openai-ai"
        }

    # =========================
    # 🔁 STEP 6: FALLBACK
    # =========================
    return {
        "status": "offline",
        "reply": fallback_reply,
        "intent": intent,
        "mode": "farmer-brain"
    }


@router.post("/ask")
async def chat_ask(req: ChatRequest, user: dict = Depends(local_verify_token)):
    return await _run_chat(req)


@router.post("/chat")
async def chat_path(req: ChatRequest, user: dict = Depends(local_verify_token)):
    return await _run_chat(req)


@router.get("/insights")
async def get_ai_insights(user: dict = Depends(local_verify_token)):
    return {
        "status": "success",
        "data": {
            "risk": "No major risk detected right now.",
            "irrigation": "Follow regular irrigation schedule.",
            "alert": "Weather looks stable for most crops.",
        },
    }
