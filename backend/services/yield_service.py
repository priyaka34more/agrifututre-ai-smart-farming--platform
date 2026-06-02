# services/yield_service.py

from typing import Dict, List

# -----------------------------
# Crop Master Data (India-focused)
# -----------------------------
CROP_DATA = {
    "rice": {
        "name_en": "Rice",
        "name_hi": "धान",
        "name_mr": "तांदूळ",
        "yield_per_acre": 2600,
        "cost_per_acre": 18000,
        "ideal_rain_min": 900,
        "ideal_rain_max": 1800,
        "ideal_temp_min": 20,
        "ideal_temp_max": 35,
        "preferred_soils": ["Clay", "Alluvial", "Loamy"],
        "fertilizer_type": "NPK 20:10:10 + Urea",
        "fertilizer_dose_kg_per_acre": "45-60 kg NPK + 35-45 kg Urea",
        "irrigation_bonus": 1.08,
    },
    "wheat": {
        "name_en": "Wheat",
        "name_hi": "गेहूं",
        "name_mr": "गहू",
        "yield_per_acre": 1800,
        "cost_per_acre": 15000,
        "ideal_rain_min": 350,
        "ideal_rain_max": 700,
        "ideal_temp_min": 15,
        "ideal_temp_max": 28,
        "preferred_soils": ["Loamy", "Alluvial", "Clay Loam"],
        "fertilizer_type": "DAP + Urea",
        "fertilizer_dose_kg_per_acre": "40-50 kg DAP + 35-45 kg Urea",
        "irrigation_bonus": 1.10,
    },
    "maize": {
        "name_en": "Maize",
        "name_hi": "मक्का",
        "name_mr": "मका",
        "yield_per_acre": 2200,
        "cost_per_acre": 16000,
        "ideal_rain_min": 500,
        "ideal_rain_max": 900,
        "ideal_temp_min": 18,
        "ideal_temp_max": 32,
        "preferred_soils": ["Loamy", "Sandy Loam", "Alluvial"],
        "fertilizer_type": "NPK 20:20:0 + Urea",
        "fertilizer_dose_kg_per_acre": "50-60 kg NPK + 30-40 kg Urea",
        "irrigation_bonus": 1.07,
    },
    "cotton": {
        "name_en": "Cotton",
        "name_hi": "कपास",
        "name_mr": "कापूस",
        "yield_per_acre": 900,
        "cost_per_acre": 22000,
        "ideal_rain_min": 500,
        "ideal_rain_max": 1100,
        "ideal_temp_min": 22,
        "ideal_temp_max": 35,
        "preferred_soils": ["Black", "Clay", "Loamy"],
        "fertilizer_type": "NPK 19:19:19 + Urea",
        "fertilizer_dose_kg_per_acre": "35-45 kg NPK + 25-35 kg Urea",
        "irrigation_bonus": 1.12,
    },
    "soybean": {
        "name_en": "Soybean",
        "name_hi": "सोयाबीन",
        "name_mr": "सोयाबीन",
        "yield_per_acre": 1000,
        "cost_per_acre": 14000,
        "ideal_rain_min": 600,
        "ideal_rain_max": 1000,
        "ideal_temp_min": 20,
        "ideal_temp_max": 32,
        "preferred_soils": ["Black", "Loamy", "Clay Loam"],
        "fertilizer_type": "SSP + Rhizobium seed treatment",
        "fertilizer_dose_kg_per_acre": "50-60 kg SSP + seed treatment",
        "irrigation_bonus": 1.05,
    },
    "sugarcane": {
        "name_en": "Sugarcane",
        "name_hi": "गन्ना",
        "name_mr": "ऊस",
        "yield_per_acre": 32000,
        "cost_per_acre": 30000,
        "ideal_rain_min": 900,
        "ideal_rain_max": 1600,
        "ideal_temp_min": 22,
        "ideal_temp_max": 38,
        "preferred_soils": ["Loamy", "Alluvial", "Clay Loam"],
        "fertilizer_type": "NPK + Organic manure",
        "fertilizer_dose_kg_per_acre": "75-100 kg NPK + FYM/compost",
        "irrigation_bonus": 1.15,
    },
    "tomato": {
        "name_en": "Tomato",
        "name_hi": "टमाटर",
        "name_mr": "टोमॅटो",
        "yield_per_acre": 10000,
        "cost_per_acre": 35000,
        "ideal_rain_min": 400,
        "ideal_rain_max": 800,
        "ideal_temp_min": 18,
        "ideal_temp_max": 30,
        "preferred_soils": ["Loamy", "Sandy Loam"],
        "fertilizer_type": "NPK 19:19:19 + Calcium",
        "fertilizer_dose_kg_per_acre": "50-70 kg water-soluble mix",
        "irrigation_bonus": 1.12,
    },
    "potato": {
        "name_en": "Potato",
        "name_hi": "आलू",
        "name_mr": "बटाटा",
        "yield_per_acre": 8500,
        "cost_per_acre": 32000,
        "ideal_rain_min": 300,
        "ideal_rain_max": 700,
        "ideal_temp_min": 15,
        "ideal_temp_max": 28,
        "preferred_soils": ["Sandy Loam", "Loamy"],
        "fertilizer_type": "NPK 12:32:16 + Potash",
        "fertilizer_dose_kg_per_acre": "60-80 kg NPK + 25-35 kg Potash",
        "irrigation_bonus": 1.10,
    },
    "onion": {
        "name_en": "Onion",
        "name_hi": "प्याज",
        "name_mr": "कांदा",
        "yield_per_acre": 7000,
        "cost_per_acre": 28000,
        "ideal_rain_min": 350,
        "ideal_rain_max": 700,
        "ideal_temp_min": 16,
        "ideal_temp_max": 30,
        "preferred_soils": ["Loamy", "Sandy Loam", "Black"],
        "fertilizer_type": "NPK + Sulphur",
        "fertilizer_dose_kg_per_acre": "50-60 kg NPK + sulphur source",
        "irrigation_bonus": 1.10,
    },
    "tur": {
        "name_en": "Tur / Pigeon Pea",
        "name_hi": "अरहर / तूर",
        "name_mr": "तूर",
        "yield_per_acre": 700,
        "cost_per_acre": 12000,
        "ideal_rain_min": 500,
        "ideal_rain_max": 1000,
        "ideal_temp_min": 20,
        "ideal_temp_max": 35,
        "preferred_soils": ["Black", "Loamy"],
        "fertilizer_type": "SSP + biofertilizer",
        "fertilizer_dose_kg_per_acre": "40-50 kg SSP + seed treatment",
        "irrigation_bonus": 1.04,
    },
    "gram": {
        "name_en": "Gram / Chana",
        "name_hi": "चना",
        "name_mr": "हरभरा",
        "yield_per_acre": 800,
        "cost_per_acre": 11000,
        "ideal_rain_min": 300,
        "ideal_rain_max": 600,
        "ideal_temp_min": 15,
        "ideal_temp_max": 28,
        "preferred_soils": ["Black", "Loamy", "Clay Loam"],
        "fertilizer_type": "SSP + Rhizobium",
        "fertilizer_dose_kg_per_acre": "40-50 kg SSP + seed treatment",
        "irrigation_bonus": 1.03,
    },
}

SOIL_TYPES = [
    "Loamy",
    "Clay",
    "Sandy",
    "Black",
    "Red",
    "Alluvial",
    "Sandy Loam",
    "Clay Loam",
]

# -----------------------------
# Helpers
# -----------------------------
def _clamp(value: float, min_val: float, max_val: float) -> float:
    return max(min_val, min(value, max_val))

def _safe_round(value: float) -> float:
    return round(value, 2)

def _risk_from_profit_margin(profit: float, revenue: float) -> str:
    if revenue <= 0:
        return "High"
    margin = (profit / revenue) * 100
    if margin >= 30:
        return "Low"
    if margin >= 15:
        return "Medium"
    return "High"

def _get_crop_display_name(crop_key: str, language: str) -> str:
    crop = CROP_DATA[crop_key]
    if language == "mr":
        return crop["name_mr"]
    if language == "hi":
        return crop["name_hi"]
    return crop["name_en"]

def _build_explanations(
    crop_key: str,
    soil_type: str,
    rainfall_mm: float,
    temperature_c: float,
    irrigation_available: bool,
    fertilizer_budget: float,
    language: str,
) -> List[str]:
    crop = CROP_DATA[crop_key]
    exp = []

    if soil_type in crop["preferred_soils"]:
        exp.append({
            "en": f"Soil type '{soil_type}' is suitable for {_get_crop_display_name(crop_key, 'en')}.",
            "hi": f"मिट्टी प्रकार '{soil_type}' इस फसल के लिए उपयुक्त है।",
            "mr": f"'{soil_type}' माती प्रकार या पिकासाठी योग्य आहे.",
        }[language])
    else:
        exp.append({
            "en": f"Soil type '{soil_type}' is not ideal; yield may reduce slightly.",
            "hi": f"यह मिट्टी पूरी तरह उपयुक्त नहीं है, इसलिए उत्पादन थोड़ा कम हो सकता है।",
            "mr": f"ही माती पूर्णपणे योग्य नाही, त्यामुळे उत्पादन थोडे कमी होऊ शकते.",
        }[language])

    if crop["ideal_rain_min"] <= rainfall_mm <= crop["ideal_rain_max"]:
        exp.append({
            "en": "Rainfall is in a good range for this crop.",
            "hi": "वर्षा इस फसल के लिए अच्छी सीमा में है।",
            "mr": "पावसाचे प्रमाण या पिकासाठी चांगल्या मर्यादेत आहे.",
        }[language])
    elif rainfall_mm < crop["ideal_rain_min"]:
        exp.append({
            "en": "Rainfall is lower than ideal; irrigation can improve yield.",
            "hi": "वर्षा कम है; सिंचाई से उत्पादन बढ़ सकता है।",
            "mr": "पाऊस कमी आहे; सिंचन केल्यास उत्पादन वाढू शकते.",
        }[language])
    else:
        exp.append({
            "en": "Rainfall is higher than ideal; drainage is important.",
            "hi": "वर्षा अधिक है; जल निकासी महत्वपूर्ण है।",
            "mr": "पाऊस जास्त आहे; पाण्याचा निचरा महत्त्वाचा आहे.",
        }[language])

    if crop["ideal_temp_min"] <= temperature_c <= crop["ideal_temp_max"]:
        exp.append({
            "en": "Temperature is favorable for growth.",
            "hi": "तापमान वृद्धि के लिए अनुकूल है।",
            "mr": "तापमान वाढीसाठी अनुकूल आहे.",
        }[language])
    else:
        exp.append({
            "en": "Temperature is outside ideal range, so risk increases.",
            "hi": "तापमान आदर्श सीमा से बाहर है, इसलिए जोखिम बढ़ता है।",
            "mr": "तापमान आदर्श मर्यादेबाहेर आहे, त्यामुळे धोका वाढतो.",
        }[language])

    if irrigation_available:
        exp.append({
            "en": "Irrigation support improves stability and reduces weather risk.",
            "hi": "सिंचाई उपलब्ध होने से मौसम का जोखिम कम होता है।",
            "mr": "सिंचन उपलब्ध असल्याने हवामानाचा धोका कमी होतो.",
        }[language])

    if fertilizer_budget < 3000:
        exp.append({
            "en": "Low fertilizer budget may reduce yield potential.",
            "hi": "कम उर्वरक बजट से उत्पादन क्षमता कम हो सकती है।",
            "mr": "कमी खत बजेटमुळे उत्पादन क्षमता कमी होऊ शकते.",
        }[language])

    return exp

def _estimate_for_crop(data: Dict, crop_key: str) -> Dict:
    crop = CROP_DATA[crop_key]

    land = data["land_area_acre"]
    rainfall = data["rainfall_mm"]
    temp = data["temperature_c"]
    soil = data["soil_type"]
    irrigation = data["irrigation_available"]
    fertilizer_budget = data["fertilizer_budget"]
    market_price = data["market_price_per_kg"]

    base_yield = crop["yield_per_acre"] * land
    base_cost = crop["cost_per_acre"] * land

    factor = 1.0

    # Soil factor
    if soil in crop["preferred_soils"]:
        factor *= 1.08
    else:
        factor *= 0.92

    # Rainfall factor
    if rainfall < crop["ideal_rain_min"]:
        gap = crop["ideal_rain_min"] - rainfall
        penalty = _clamp(1 - (gap / max(crop["ideal_rain_min"], 1)) * 0.35, 0.65, 1.0)
        factor *= penalty
    elif rainfall > crop["ideal_rain_max"]:
        gap = rainfall - crop["ideal_rain_max"]
        penalty = _clamp(1 - (gap / max(crop["ideal_rain_max"], 1)) * 0.25, 0.70, 1.0)
        factor *= penalty
    else:
        factor *= 1.10

    # Temperature factor
    if crop["ideal_temp_min"] <= temp <= crop["ideal_temp_max"]:
        factor *= 1.06
    else:
        diff = min(abs(temp - crop["ideal_temp_min"]), abs(temp - crop["ideal_temp_max"]))
        penalty = _clamp(1 - (diff * 0.02), 0.75, 1.0)
        factor *= penalty

    # Irrigation factor
    if irrigation:
        factor *= crop["irrigation_bonus"]
    else:
        factor *= 0.95

    # Fertilizer budget factor
    budget_per_acre = fertilizer_budget / max(land, 1)
    if budget_per_acre >= 6000:
        factor *= 1.08
    elif budget_per_acre >= 3500:
        factor *= 1.03
    elif budget_per_acre >= 2000:
        factor *= 0.98
    else:
        factor *= 0.90

    estimated_yield = max(0, base_yield * factor)
    estimated_cost = base_cost + fertilizer_budget
    expected_revenue = estimated_yield * market_price
    expected_profit = expected_revenue - estimated_cost
    risk = _risk_from_profit_margin(expected_profit, expected_revenue)

    return {
        "crop_key": crop_key,
        "estimated_yield_kg": _safe_round(estimated_yield),
        "estimated_cost_inr": _safe_round(estimated_cost),
        "expected_revenue_inr": _safe_round(expected_revenue),
        "expected_profit_inr": _safe_round(expected_profit),
        "risk_level": risk,
        "fertilizer_type": crop["fertilizer_type"],
        "fertilizer_dose_kg_per_acre": crop["fertilizer_dose_kg_per_acre"],
    }

# -----------------------------
# Main Service
# -----------------------------
def estimate_yield_and_profit(data: Dict) -> Dict:
    required = [
        "crop_type",
        "soil_type",
        "land_area_acre",
        "rainfall_mm",
        "temperature_c",
        "irrigation_available",
        "fertilizer_budget",
        "market_price_per_kg",
    ]
    for key in required:
        if key not in data:
            raise ValueError(f"Missing required field: {key}")

    crop_type = str(data["crop_type"]).strip().lower()
    if crop_type not in CROP_DATA:
        raise ValueError(f"Unsupported crop_type: {data['crop_type']}")

    soil_type = str(data["soil_type"]).strip()
    if soil_type not in SOIL_TYPES:
        raise ValueError(f"Unsupported soil_type: {soil_type}")

    language = str(data.get("language", "en")).lower()
    if language not in ["en", "hi", "mr"]:
        language = "en"

    current = _estimate_for_crop(data, crop_type)
    crop_display = _get_crop_display_name(crop_type, language)

    explanations = _build_explanations(
        crop_key=crop_type,
        soil_type=soil_type,
        rainfall_mm=float(data["rainfall_mm"]),
        temperature_c=float(data["temperature_c"]),
        irrigation_available=bool(data["irrigation_available"]),
        fertilizer_budget=float(data["fertilizer_budget"]),
        language=language,
    )

    # Best crop recommendation
    all_results = []
    for ck in CROP_DATA.keys():
        simulated = dict(data)
        simulated["crop_type"] = ck
        all_results.append(_estimate_for_crop(simulated, ck))

    all_results_sorted = sorted(all_results, key=lambda x: x["expected_profit_inr"], reverse=True)
    best = all_results_sorted[0]

    alternative = None
    if best["crop_key"] != crop_type:
        alternative = best
    else:
        if len(all_results_sorted) > 1:
            alternative = all_results_sorted[1]

    current_profit = current["expected_profit_inr"]

    if current_profit >= 50000:
        recommendation = {
            "en": "Good profit potential. Continue with proper fertilizer schedule, water management, and timely market selling.",
            "hi": "अच्छा लाभ संभावित है। सही उर्वरक, सिंचाई और समय पर बिक्री करें।",
            "mr": "नफा चांगला मिळण्याची शक्यता आहे. योग्य खत, पाणी व्यवस्थापन आणि योग्य वेळी विक्री करा.",
        }[language]
    elif current_profit >= 15000:
        recommendation = {
            "en": "Moderate profit expected. Improve irrigation, fertilizer planning, and monitor mandi prices for better returns.",
            "hi": "मध्यम लाभ अपेक्षित है। सिंचाई, उर्वरक योजना और मंडी भाव पर ध्यान दें।",
            "mr": "मध्यम नफा अपेक्षित आहे. सिंचन, खत नियोजन आणि बाजारभाव तपासा.",
        }[language]
    else:
        recommendation = {
            "en": "Low profit or high risk. Consider an alternative crop with better local profitability.",
            "hi": "लाभ कम या जोखिम अधिक है। बेहतर लाभ वाली वैकल्पिक फसल पर विचार करें।",
            "mr": "नफा कमी किंवा धोका जास्त आहे. पर्यायी जास्त फायदेशीर पिकाचा विचार करा.",
        }[language]

    crop = CROP_DATA[crop_type]

    return {
        "status": "success",
        "language": language,
        "crop_type": crop_display,
        "crop_key": crop_type,
        "soil_type": soil_type,
        "estimated_yield_kg": current["estimated_yield_kg"],
        "estimated_cost_inr": current["estimated_cost_inr"],
        "expected_revenue_inr": current["expected_revenue_inr"],
        "expected_profit_inr": current["expected_profit_inr"],
        "risk_level": current["risk_level"],
        "fertilizer_type": current["fertilizer_type"],
        "fertilizer_dose_kg_per_acre": current["fertilizer_dose_kg_per_acre"],
        "recommendation": recommendation,
        "explanations": explanations,
        "best_crop_recommendation": {
            "crop_key": best["crop_key"],
            "crop_name": _get_crop_display_name(best["crop_key"], language),
            "expected_profit_inr": best["expected_profit_inr"],
            "risk_level": best["risk_level"],
        },
        "alternative_crop": {
            "crop_key": alternative["crop_key"],
            "crop_name": _get_crop_display_name(alternative["crop_key"], language),
            "expected_profit_inr": alternative["expected_profit_inr"],
            "risk_level": alternative["risk_level"],
        } if alternative else None,
        "profit_advice": {
            "en": "For higher profit: use recommended fertilizer dose, check mandi rate before sale, and avoid over-irrigation.",
            "hi": "अधिक लाभ के लिए: अनुशंसित उर्वरक मात्रा, बिक्री से पहले मंडी भाव, और अधिक सिंचाई से बचें।",
            "mr": "जास्त नफ्यासाठी: शिफारस केलेले खत, विक्रीपूर्वी बाजारभाव तपासा, आणि जास्त पाणी टाळा.",
        }[language],
        "gov_note": {
            "en": "Advisory estimate only. Please verify with local Krishi Seva Kendra / Agriculture Officer.",
            "hi": "यह केवल सलाह आधारित अनुमान है। स्थानीय कृषि सेवा केंद्र / कृषि अधिकारी से पुष्टि करें।",
            "mr": "हा फक्त सल्ला-आधारित अंदाज आहे. स्थानिक कृषी सेवा केंद्र / कृषी अधिकाऱ्यांशी खात्री करा.",
        }[language],
        "crop_master": {
            "preferred_soils": crop["preferred_soils"],
            "ideal_rainfall_mm": f"{crop['ideal_rain_min']} - {crop['ideal_rain_max']}",
            "ideal_temperature_c": f"{crop['ideal_temp_min']} - {crop['ideal_temp_max']}",
        },
    }