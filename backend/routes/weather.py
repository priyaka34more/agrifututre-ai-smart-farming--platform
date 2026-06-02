from fastapi import APIRouter, Depends, Request, Query
from pydantic import BaseModel
import requests
import os
from datetime import datetime
import logging
from main import verify_token, verify_token_optional
from utils.localization import (
    translate_weather_condition,
    translate_severity,
    translate_farming_advice_list,
    translate_fallback_message,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# Support both WeatherAPI and OpenWeatherMap
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "demo")  # Use demo key for fallback

class WeatherRequest(BaseModel):
    city: str
    lang: str = "en"


# 🌐 TRANSLATION
def translate_advice(advice, lang):
    mapping = {
        "Rain in 2 hours → Delay spraying": {
            "hi": "२ घंटे में बारिश → छिड़काव में देरी करें",
            "mr": "२ तासात पाऊस → फवारणी उशिरा करा"
        },
        "Cloudy → High risk of rain, monitor before spraying": {
            "hi": "बादल छाए हुए हैं → बारिश का खतरा, छिड़काव से पहले जांच करें",
            "mr": "ढगाळ हवामान → पावसाचा धोका, फवारणीपूर्वी खात्री करा"
        },
        "Avoid spraying": {
            "hi": "छिड़काव न करें",
            "mr": "फवारणी करू नका"
        },
        "High humidity risk": {
            "hi": "ज्यादा नमी से रोग का खतरा",
            "mr": "जास्त ओलावा — रोगाचा धोका"
        },
        "Provide irrigation": {
            "hi": "सिंचाई करें",
            "mr": "पाणी द्या"
        },
        "Weather is normal": {
            "hi": "मौसम सामान्य है",
            "mr": "हवामान सामान्य आहे"
        },
        "Weather unavailable": {
            "hi": "मौसम उपलब्ध नहीं",
            "mr": "हवामान उपलब्ध नाही"
        }
    }

    if lang == "en":
        return advice

    return [mapping.get(a, {}).get(lang, a) for a in advice]


def map_weather_code(code: int) -> str:
    """Map Open-Meteo WMO weather codes to string descriptions"""
    if code == 0: return "Clear sky"
    elif code in [1, 2]: return "Partly cloudy"
    elif code == 3: return "Overcast"
    elif code in [45, 48]: return "Fog"
    elif code in [51, 53, 55, 56, 57]: return "Drizzle"
    elif code in [61, 63, 65, 66, 67, 80, 81, 82]: return "Rain"
    elif code in [71, 73, 75, 77, 85, 86]: return "Snow"
    elif code in [95, 96, 99]: return "Thunderstorm"
    else: return "Clear sky"

def get_weather_by_city(city: str, lang: str = "en"):
    """Get weather by city name using Open-Meteo Geocoding + Weather API (No API Key Required)"""
    request_id = "unknown"
    
    try:
        if not city or len(city.strip()) < 2:
            return {"status": "error", "message": "Invalid city name", "request_id": request_id}
        
        # Step 1: Geocoding (City name -> Coordinates)
        # Try multiple variations of city name
        city_variants = [
            city,  # Try original first
            city.split(',')[0].strip(),  # Try just the city name if comma-separated
        ]
        
        geo_data = None
        for city_try in city_variants:
            if not city_try or len(city_try) < 2:
                continue
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city_try}&count=1&language=en&format=json"
            try:
                geo_res = requests.get(geo_url, timeout=5)
                geo_data = geo_res.json()
                if geo_data.get("results") and len(geo_data["results"]) > 0:
                    break  # Found a match, use this one
            except Exception as e:
                logger.error(f"Geocoding error for {city_try}: {e}")
                continue
        
        if not geo_data or not geo_data.get("results") or len(geo_data["results"]) == 0:
            return get_weather_fallback(city, lang, request_id, "city_not_found")
        
        lat = geo_data["results"][0]["latitude"]
        lon = geo_data["results"][0]["longitude"]
        city_name = geo_data["results"][0].get("name", city)
        
        # Step 2: Fetch real-time weather using coordinates
        return get_weather_by_location(lat, lon, lang, city_name)
        
    except Exception as e:
        logger.error(f"Weather API error for {city}: {e}")
        return get_weather_fallback(city, lang, request_id, "general")

def get_weather_by_location(lat: float, lon: float, lang: str = "en", city_name: str = "Current Location"):
    """Get weather by coordinates using Open-Meteo API"""
    request_id = "unknown"
    
    try:
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return {"status": "error", "message": "Invalid coordinates", "request_id": request_id}
        
        # Use Open-Meteo API to fetch current weather + hourly humidity + 7-day daily forecast incl sunrise/sunset
        url = (
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
            "&current_weather=true"
            "&hourly=relative_humidity_2m,temperature_2m"
            "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset"
            "&timezone=auto&forecast_days=7"
        )

        try:
            res = requests.get(url, timeout=8)
            if res.status_code != 200:
                raise Exception(f"API error: {res.status_code}")
            data = res.json()
        except requests.exceptions.Timeout:
            return get_weather_fallback(city_name, lang, request_id, "timeout")
        except requests.exceptions.ConnectionError:
            return get_weather_fallback(city_name, lang, request_id, "connection")

        # Parse Open-Meteo response
        current = data.get("current_weather", {})
        temp = current.get("temperature", data.get("hourly", {}).get("temperature_2m", [25])[0])
        wind_speed = current.get("windspeed", data.get("current", {}).get("wind_speed_10m", 10))
        weather_code = current.get("weathercode", 0)
        condition = map_weather_code(weather_code)

        # Get humidity from hourly at the current time index
        humidity = None
        try:
            hourly = data.get("hourly", {})
            times = hourly.get("time", [])
            humidities = hourly.get("relative_humidity_2m", [])
            if times and humidities and current.get("time"):
                # find exact time index match
                idx = None
                for i, t in enumerate(times):
                    if t.startswith(current.get("time")) or t == current.get("time"):
                        idx = i
                        break
                if idx is None:
                    # fallback: use first available
                    idx = 0
                humidity = humidities[idx] if idx < len(humidities) else None
        except Exception:
            humidity = None

        if humidity is None:
            humidity = data.get("hourly", {}).get("relative_humidity_2m", [60])[0]

        # Build 7-day forecast from daily
        forecast = []
        try:
            daily = data.get("daily", {})
            dates = daily.get("time", [])
            tmax = daily.get("temperature_2m_max", [])
            tmin = daily.get("temperature_2m_min", [])
            precip = daily.get("precipitation_probability_max", [])
            sunrise_list = daily.get("sunrise", [])
            sunset_list = daily.get("sunset", [])
            for i in range(min(len(dates), 7)):
                forecast.append({
                    "date": dates[i],
                    "temp_max": round(tmax[i]) if i < len(tmax) else None,
                    "temp_min": round(tmin[i]) if i < len(tmin) else None,
                    "precip_prob": precip[i] if i < len(precip) else None,
                    "sunrise": sunrise_list[i] if i < len(sunrise_list) else None,
                    "sunset": sunset_list[i] if i < len(sunset_list) else None
                })
        except Exception:
            forecast = []
        
        if temp < -50 or temp > 60:
            return get_weather_fallback(city_name, lang, request_id, "invalid_data")
            
        advice = generate_farming_advice(temp, humidity, condition, lang)
        advice_list = translate_farming_advice_list(advice, lang)
        
        result = {
            "status": "success",
            "data": {
                "temperature": round(temp, 1),
                "humidity": humidity,
                "condition": translate_weather_condition(condition, lang),
                "wind_speed": round(wind_speed, 1),
                "city": city_name,
                "advice": advice_list,
                "severity": translate_severity(get_severity(temp, humidity), lang),
                "forecast": forecast,
                "daily_forecast": forecast,
                "sunrise": forecast[0]["sunrise"] if len(forecast) > 0 else None,
                "sunset": forecast[0]["sunset"] if len(forecast) > 0 else None,
                "source": "open-meteo",
                "coordinates": {"lat": lat, "lon": lon},
                "last_updated": datetime.now().isoformat(),
                "is_fallback": False
            },
            "request_id": request_id
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Weather API error for coordinates {lat},{lon}: {e}")
        return get_weather_fallback(city_name, lang, request_id, "general")

def get_weather_fallback(city: str, lang: str, request_id: str, error_type: str):
    """Get fallback weather data when API fails"""
    fallback_messages = {
        "timeout": "Weather service timeout. Showing estimated data.",
        "connection": "Unable to connect to weather service. Showing estimated data.",
        "api_key": "Weather API key issue. Showing estimated data.",
        "city_not_found": "City not found. Showing regional data.",
        "invalid_data": "Invalid weather data received. Showing estimated data.",
        "general": "Weather service unavailable. Showing estimated data."
    }
    
    # Get seasonally appropriate fallback data
    import calendar
    month = calendar.month_name[datetime.now().month]
    
    seasonal_data = {
        "winter": {"temp": 22, "humidity": 55, "condition": "Clear"},
        "spring": {"temp": 28, "humidity": 60, "condition": "Partly Cloudy"},
        "summer": {"temp": 35, "humidity": 65, "condition": "Hot"},
        "monsoon": {"temp": 30, "humidity": 75, "condition": "Rainy"}
    }
    
    # Simple season detection
    if month in ["December", "January", "February"]:
        season_data = seasonal_data["winter"]
    elif month in ["March", "April", "May"]:
        season_data = seasonal_data["spring"]
    elif month in ["June", "July", "August", "September"]:
        season_data = seasonal_data["monsoon"]
    else:
        season_data = seasonal_data["summer"]
    
    return {
        "status": "success",
        "data": {
            "temperature": season_data["temp"],
            "humidity": season_data["humidity"],
            "condition": translate_weather_condition(season_data["condition"], lang),
            "wind_speed": 10,
            "city": city,
            "advice": [translate_fallback_message(error_type, lang)],
            "severity": translate_severity("Medium", lang),
            "forecast": [
                {"time": "Now", "temp": season_data["temp"]},
                {"time": "+3h", "temp": season_data["temp"] - 1},
                {"time": "+6h", "temp": season_data["temp"] - 2},
                {"time": "+9h", "temp": season_data["temp"] - 3},
                {"time": "+12h", "temp": season_data["temp"] - 4}
            ],
            "source": "fallback",
            "last_updated": datetime.now().isoformat(),
            "is_fallback": True,
            "fallback_reason": error_type
        },
        "request_id": request_id
    }

def generate_farming_advice(temp: float, humidity: float, condition: str, lang: str = "en"):
    """Generate smart farming advice based on weather conditions"""
    advice = []
    
    # Temperature-based advice
    if temp > 38:
        advice.append("Extreme heat - provide shade and increase irrigation")
    elif temp > 35:
        advice.append("Water crops early morning to prevent heat stress")
    elif temp < 8:
        advice.append("Frost warning - protect sensitive crops")
    elif temp < 12:
        advice.append("Cold weather - consider covering young plants")
    
    # Humidity-based advice
    if humidity > 80:
        advice.append("Very high humidity - high disease risk, ensure ventilation")
    elif humidity > 70:
        advice.append("High humidity - risk of fungal disease, ensure proper ventilation")
    elif humidity < 30:
        advice.append("Low humidity - increase irrigation frequency")
    elif humidity < 40:
        advice.append("Moderate humidity - normal irrigation schedule")
    
    # Condition-based advice
    condition_lower = condition.lower()
    if "rain" in condition_lower:
        advice.append("Rain expected - avoid spraying pesticides")
    elif "clear" in condition_lower or "sunny" in condition_lower:
        advice.append("Clear weather - good day for field activities")
    elif "cloud" in condition_lower:
        advice.append("Cloudy conditions - monitor for rain")
    elif "storm" in condition_lower or "thunder" in condition_lower:
        advice.append("Storm warning - secure equipment and shelter")
    elif "fog" in condition_lower or "mist" in condition_lower:
        advice.append("Foggy conditions - delay spraying activities")
    
    # Add specific crop recommendations
    if temp > 30 and humidity > 70:
        advice.append("Ideal conditions for rice and sugarcane")
    elif temp > 25 and humidity < 50:
        advice.append("Good conditions for wheat and gram")
    
    if not advice:
        advice = ["Weather conditions are normal for farming"]
    return translate_farming_advice_list(advice, lang)

def get_severity(temp: float, humidity: float):
    """Determine weather severity for farming"""
    if temp > 40 or temp < 5:
        return "High"
    elif temp > 35 or temp < 10 or humidity > 80:
        return "Medium"
    else:
        return "Low"

@router.post("")
def get_weather_post(request: Request, data: WeatherRequest, user: dict = Depends(verify_token_optional)):
    """Legacy weather endpoint - now uses OpenWeatherMap"""
    request_id = getattr(request.state, "request_id", "unknown")
    
    try:
        result = get_weather_by_city(data.city, data.lang)
        # Ensure the result has the correct structure
        if isinstance(result, dict):
            return result
        else:
            return {
                "success": False,
                "message": "Weather service temporarily unavailable",
                "fallback": True,
                "data": {
                    "temperature": 28,
                    "humidity": 65,
                    "condition": "Partly Cloudy",
                    "city": data.city or "Unknown",
                    "advice": ["Weather conditions are normal for farming"],
                    "severity": "Low",
                    "source": "fallback"
                },
                "request_id": request_id
            }
    except Exception as e:
        logger.error(f"Weather POST API error: {e}", exc_info=True)
        return {
            "success": False,
            "message": "Weather service temporarily unavailable",
            "fallback": True,
            "data": {
                "temperature": 28,
                "humidity": 65,
                "condition": "Partly Cloudy",
                "city": data.city or "Unknown",
                "advice": ["Weather conditions are normal for farming"],
                "severity": "Low",
                "source": "fallback"
            },
            "request_id": request_id
        }

@router.get("")
def get_weather_get(
    request: Request,
    city: str = Query(None),
    lat: float = Query(None),
    lon: float = Query(None),
    lang: str = Query("en"),
    user: dict = Depends(verify_token_optional)
):
    """GET weather endpoint supporting both city and coordinates"""
    request_id = getattr(request.state, "request_id", "unknown")
    
    try:
        # Prefer coordinates over city
        if lat is not None and lon is not None:
            return get_weather_by_location(lat, lon, lang)
        elif city:
            return get_weather_by_city(city, lang)
        else:
            return {
                "success": False,
                "message": "Either city or lat/lon coordinates required",
                "fallback": True,
                "data": {
                    "temperature": 28,
                    "humidity": 65,
                    "condition": "Partly Cloudy",
                    "city": "Unknown",
                    "advice": ["Weather conditions are normal for farming"],
                    "severity": "Low",
                    "source": "fallback"
                },
                "request_id": request_id
            }
    except Exception as e:
        logger.error(f"Weather API error: {e}", exc_info=True)
        return {
            "success": False,
            "message": "Weather service temporarily unavailable",
            "fallback": True,
            "data": {
                "temperature": 28,
                "humidity": 65,
                "condition": "Partly Cloudy",
                "city": city or "Unknown",
                "advice": ["Weather conditions are normal for farming"],
                "severity": "Low",
                "source": "fallback"
            },
            "request_id": request_id
        }


@router.get("/")
def get_weather_query_slash(
    request: Request,
    city: str,
    lang: str = "en",
    user: dict = Depends(verify_token),
):
    payload = WeatherRequest(city=city, lang=lang)
    return get_weather_post(request, payload, user)