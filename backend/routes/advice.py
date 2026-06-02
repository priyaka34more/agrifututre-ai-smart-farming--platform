from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from typing import Optional
import logging
import numpy as np

router = APIRouter()
logger = logging.getLogger(__name__)

DEFAULT_CITY = "Jalgaon, Maharashtra"
DEFAULT_CROP = "wheat"


def get_weather_data(city: str, language: str = "en"):
    try:
        from routes.weather import get_weather_by_city

        return get_weather_by_city(city, language)
    except Exception as exc:
        logger.error(f"Weather helper load failed: {exc}", exc_info=True)
        return {
            "status": "error",
            "data": {
                "city": city,
                "condition": "Unavailable",
                "severity": "Medium",
                "advice": ["Weather data currently unavailable."],
            },
        }


def get_market_data(crop: str, state: Optional[str], district: Optional[str]):
    try:
        from routes.market_forecast import generate_historical_prices, generate_fallback_forecast

        historical_prices = generate_historical_prices(crop, state or "", district or "")
        forecast = generate_fallback_forecast(historical_prices)

        current_price = float(historical_prices[-1])
        forecast_last = float(forecast[-1])
        trend = (
            "rising"
            if forecast_last > current_price
            else "falling"
            if forecast_last < current_price
            else "stable"
        )

        return {
            "crop": crop,
            "current_price": round(current_price, 2),
            "forecast": [round(float(p), 2) for p in forecast],
            "trend": trend,
            "max_price": round(float(np.max(forecast)), 2),
            "min_price": round(float(np.min(forecast)), 2),
            "avg_price": round(float(np.mean(forecast)), 2),
            "confidence": 0.78,
        }
    except Exception as exc:
        logger.error(f"Market helper failed: {exc}", exc_info=True)
        return {
            "crop": crop,
            "current_price": 0.0,
            "forecast": [],
            "trend": "stable",
            "max_price": 0.0,
            "min_price": 0.0,
            "avg_price": 0.0,
            "confidence": 0.0,
        }


def get_disease_advice(disease: Optional[str], confidence: float, crop: str):
    disease = (disease or "").strip()
    messages = []
    if not disease:
        messages.append("Run the crop scanner to detect early disease symptoms.")
        messages.append("Keep field monitoring active and inspect leaves daily.")
        return messages

    if "healthy" in disease.lower():
        messages.append(f"Crop appears healthy for {crop.title()}. Continue routine monitoring.")
        if confidence > 0:
            messages.append(f"Detection confidence is {round(confidence * 100)}%.")
    else:
        messages.append(f"Disease detected: {disease}. Apply treatment immediately.")
        messages.append(
            f"Isolate affected plants and remove infected leaves to prevent spread."
        )
        if confidence > 0:
            messages.append(
                f"Detection confidence is {round(confidence * 100)}%. Prioritize crop protection."
            )
    return messages


def summarize_weather_context(weather_data: dict, crop: str):
    if not weather_data or not isinstance(weather_data, dict):
        return ["Weather context unavailable."]

    data = weather_data.get("data", {})
    condition = data.get("condition") or "Normal"
    severity = data.get("severity") or "Low"
    city = data.get("city") or DEFAULT_CITY

    summary = [
        f"Weather in {city} is {condition}. Farm risk level: {severity}.",
        f"Adjust irrigation and spraying decisions around current weather conditions."
    ]

    return summary


@router.get("/", response_class=JSONResponse)
async def get_advice(
    city: Optional[str] = Query(None),
    crop: str = Query(DEFAULT_CROP),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    disease: Optional[str] = Query(None),
    disease_confidence: float = Query(0.0),
    market_trend: Optional[str] = Query(None),
    language: str = Query("en")
):
    crop = crop.strip() or DEFAULT_CROP
    city = city.strip() if city else DEFAULT_CITY

    weather_data = get_weather_data(city, language)
    market_data = get_market_data(crop, state, district)

    effective_trend = market_trend or market_data.get("trend", "stable")
    disease_advice = get_disease_advice(disease, disease_confidence, crop)
    weather_summary = summarize_weather_context(weather_data, crop)

    advice_items = []
    advice_items.extend(weather_data.get("data", {}).get("advice", []))
    advice_items.extend(weather_summary)

    if effective_trend:
        if effective_trend == "rising":
            advice_items.append(
                f"{crop.title()} mandi prices are trending up. Plan harvest and sale timing to capture higher returns."
            )
        elif effective_trend == "falling":
            advice_items.append(
                f"{crop.title()} prices are trending down. Delay sales if storage is possible and monitor prices closely."
            )
        else:
            advice_items.append(
                f"{crop.title()} market is stable. Maintain crop health and review selling options regularly."
            )

    advice_items.extend(disease_advice)

    if not disease:
        advice_items.append(
            "Use the AI Crop Scanner to catch diseases early and protect your yield."
        )

    # Deduplicate and normalize advice
    normalized_advice = [str(item).strip() for item in advice_items if item and str(item).strip()]
    unique_advice = list(dict.fromkeys(normalized_advice))

    return {
        "status": "success",
        "advice": unique_advice,
        "context": {
            "crop": crop,
            "weather": weather_data.get("data", {}),
            "market": market_data,
            "disease": {
                "name": disease or "unknown",
                "confidence": round(disease_confidence * 100, 1),
            },
        },
    }
