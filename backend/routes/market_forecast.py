from fastapi import APIRouter, Depends
from pydantic import BaseModel
import numpy as np
import logging

from main import verify_token

router = APIRouter()
logger = logging.getLogger(__name__)

# Try to import statsmodels, make it optional
try:
    from statsmodels.tsa.arima.model import ARIMA
    HAS_STATSMODELS = True
except ImportError:
    logger.warning("statsmodels not available, using fallback forecasting")
    HAS_STATSMODELS = False


class MarketRequest(BaseModel):
    language: str = "en"
    crop: str
    state: str
    district: str
    quantity: float = 0
    user_id: str = "default_user"


class ARIMARequest(BaseModel):
    prices: list[float]


@router.post("/forecast")
async def market_forecast(data: MarketRequest, user: dict = Depends(verify_token)):
    from database import SessionLocal
    db = SessionLocal()
    try:
        # Generate sample historical prices based on crop and location
        # In production, this would come from actual market data
        historical_prices = generate_historical_prices(data.crop, data.state, data.district)
        
        if HAS_STATSMODELS:
            # Train ARIMA model
            model = ARIMA(historical_prices, order=(2,1,2))
            model_fit = model.fit()
            
            # Forecast next 4 days
            forecast = model_fit.forecast(steps=4)
        else:
            # Simple fallback forecasting (trend-based)
            forecast = generate_fallback_forecast(historical_prices)
        
        # Calculate trend
        last_price = float(historical_prices[-1])
        forecast_last = float(forecast[-1])
        trend = "rising" if forecast_last > last_price else "falling"
        
        # Calculate statistics
        max_price = float(np.max(forecast))
        min_price = float(np.min(forecast))
        avg_price = float(np.mean(forecast))
        
        # Determine mock demand level based on trend
        demand_level = "High" if trend == "rising" else "Medium"
        
        # Save market forecast to SQLite
        try:
            from models.market_forecast_model import MarketForecast
            from datetime import datetime
            
            user_id = user.get("id")
            forecast_record = MarketForecast(
                user_id=user_id,
                crop_name=data.crop,
                current_price=last_price,
                predicted_price=forecast_last,
                market_trend=trend,
                demand_level=demand_level,
                forecast_date=datetime.utcnow().strftime("%Y-%m-%d")
            )
            db.add(forecast_record)
            db.commit()
        except Exception as se:
            print(f"Failed to save market forecast to DB: {se}")
            db.rollback()
            
        # Log activity
        try:
            from utils.activity_logger import log_activity
            log_activity(
                db=db,
                user_id=user.get("id"),
                module="Market Forecasting",
                action="Market Forecast Checked",
                result="Success"
            )
        except Exception as le:
            print(f"Failed to log market forecast activity: {le}")
            
        return {
            "status": "success",
            "current_price": last_price,
            "forecast": forecast.tolist() if hasattr(forecast, 'tolist') else forecast,
            "trend": trend,
            "max_price": max_price,
            "min_price": min_price,
            "avg_price": avg_price,
            "confidence": 0.85  # Mock confidence score
        }
        
    except Exception as e:
        logger.error(f"Market forecast error: {str(e)}")
        return {
            "status": "error",
            "message": "Failed to generate market forecast",
            "forecast": [2500, 2600, 2700, 2800],  # Fallback values
            "trend": "rising",
            "current_price": 2400
        }
    finally:
        db.close()


@router.post("/arima-forecast")
async def arima_forecast(data: ARIMARequest, user: dict = Depends(verify_token)):
    try:
        prices = data.prices
        
        if len(prices) < 5:
            return {
                "status": "error",
                "message": "Need at least 5 price points for ARIMA forecasting"
            }
        
        # Convert to numpy array
        series = np.array(prices)
        
        if HAS_STATSMODELS:
            # Train ARIMA model
            model = ARIMA(series, order=(2,1,2))
            model_fit = model.fit()
            
            # Forecast next 4 days
            forecast = model_fit.forecast(steps=4)
        else:
            # Simple fallback forecasting
            forecast = generate_fallback_forecast(series)
        
        # Calculate trend
        last_price = series[-1]
        forecast_last = forecast[-1]
        trend = "rising" if forecast_last > last_price else "falling"
        
        return {
            "status": "success",
            "forecast": forecast.tolist() if hasattr(forecast, 'tolist') else forecast,
            "trend": trend,
            "current_price": float(last_price)
        }
        
    except Exception as e:
        logger.error(f"ARIMA forecast error: {str(e)}")
        return {
            "status": "error",
            "message": "Failed to generate ARIMA forecast",
            "forecast": [2500, 2600, 2700, 2800],  # Fallback values
            "trend": "rising"
        }


def generate_fallback_forecast(prices):
    """Simple trend-based fallback forecast when statsmodels is not available"""
    prices = np.array(prices)
    last_price = prices[-1]
    
    # Calculate simple linear trend
    n = len(prices)
    if n < 2:
        return [last_price, last_price, last_price, last_price]
    
    x = np.arange(n)
    slope, intercept = np.polyfit(x, prices, 1)
    
    # Forecast next 4 points
    forecast = []
    for i in range(1, 5):
        next_price = intercept + slope * (n + i - 1)
        # Add small randomness
        next_price *= (1 + np.random.normal(0, 0.02))
        forecast.append(float(next_price))
    
    return forecast


def generate_historical_prices(crop: str, state: str, district: str) -> np.ndarray:
    """Generate realistic historical prices based on crop and location"""
    # Base prices for different crops (in INR per quintal)
    base_prices = {
        "tomato": 2000,
        "onion": 1800,
        "potato": 1500,
        "wheat": 2200,
        "rice": 2500
    }
    
    # Location multipliers
    state_multipliers = {
        "Maharashtra": 1.0,
        "Gujarat": 0.95,
        "Karnataka": 1.05,
        "Madhya Pradesh": 0.9
    }
    
    base_price = base_prices.get(crop.lower(), 2000)
    state_mult = state_multipliers.get(state, 1.0)
    
    # Generate 30 days of historical prices with some volatility
    np.random.seed(hash(f"{crop}_{state}_{district}") % 1000)
    days = 30
    prices = []
    
    current_price = base_price * state_mult
    
    for i in range(days):
        # Add daily variation (-5% to +5%)
        daily_change = np.random.normal(0, 0.02)  # 2% standard deviation
        current_price = current_price * (1 + daily_change)
        
        # Add some trend
        if i > 15:  # Second half of month
            trend_change = np.random.normal(0.001, 0.01)  # Slight upward trend
            current_price = current_price * (1 + trend_change)
        
        prices.append(max(current_price, 500))  # Minimum price floor
    
    return np.array(prices)