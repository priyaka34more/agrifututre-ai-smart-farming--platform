from utils.advisory import get_advisory


# =========================
# 🧠 INTENT ENGINE
# =========================
def detect_intent(msg: str):
    msg = msg.lower()

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
# 🌾 FARMER BRAIN (CORE ENGINE)
# =========================
def farmer_brain(disease: str, message: str, lang: str = "en"):

    disease = detect_disease_from_symptoms(message, disease)
    advisory = get_advisory(disease, lang) or {}
    intent = detect_intent(message)

    # ================= STRUCTURED RESPONSE =================
    problem = advisory.get("problem") or "Unknown issue"
    solution = advisory.get("medicine") or "Consult an expert"
    precaution = advisory.get("prevention") or "Monitor crop health"
    quick_advice = advisory.get("quick_advice") or solution
    farmer_tip = advisory.get("farmer_tip") or ""
    organic_solution = advisory.get("organic_solution") or ""

    # Localized labels for B2B SaaS Indian farmer localization
    labels = {
        "en": {
            "disease": "🌿 Disease/Symptom",
            "problem": "❓ Problem Description",
            "solution": "💡 Solution (Treatment)",
            "precaution": "🛡 Prevention Plan",
            "tip": "💡 Farmer Tip",
            "organic": "🌱 Organic Option",
            "action": "⚡ Quick Action"
        },
        "hi": {
            "disease": "🌿 बीमारी / लक्षण",
            "problem": "❓ समस्या का विवरण",
            "solution": "💡 समाधान (इलाज)",
            "precaution": "🛡 बचाव / रोकथाम",
            "tip": "💡 किसान भाई की सलाह",
            "organic": "🌱 जैविक (Organic) उपाय",
            "action": "⚡ त्वरित उपाय"
        },
        "mr": {
            "disease": "🌿 रोग / लक्षण",
            "problem": "❓ समस्येचे वर्णन",
            "solution": "💡 उपाय (उपचार)",
            "precaution": "🛡 प्रतिबंधक काळजी",
            "tip": "💡 शेतकरी सल्ला",
            "organic": "🌱 सेंद्रिय (Organic) पर्याय",
            "action": "⚡ त्वरित कृती"
        }
    }
    
    lbl = labels.get(lang) or labels["en"]

    if intent == "medicine":
        return f"{lbl['solution']}: {solution}\n\n{lbl['organic']}: {organic_solution}"

    if intent == "prevention":
        return f"{lbl['precaution']}: {precaution}"

    if intent == "reason":
        return f"{lbl['problem']}: {problem}"

    # ================= GENERAL STRUCTURED =================
    response = (
        f"{lbl['disease']}: {disease}\n\n"
        f"{lbl['problem']}: {problem}\n"
        f"{lbl['solution']}: {solution}\n"
        f"{lbl['precaution']}: {precaution}\n"
    )
    
    if farmer_tip:
        response += f"\n{lbl['tip']}: {farmer_tip}"
    
    if organic_solution:
        response += f"\n{lbl['organic']}: {organic_solution}"
    
    if quick_advice:
        response += f"\n\n{lbl['action']}: {quick_advice}"
    
    return response