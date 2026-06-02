"""
Market Prediction Route - ARIMA Price Forecasting
Provides crop price predictions using time series analysis
"""

import logging
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from services.market_predictor import predictor

logger = logging.getLogger("MarketAPI")
router = APIRouter()

class PricePrediction(BaseModel):
    crop: str
    current_price: float
    predicted_price: float
    min_predicted: float
    max_predicted: float
    trend: str
    confidence: float
    forecast_days: int
    price_change: float
    recommendation: dict
    last_updated: str
    data_points: int

class MarketSummary(BaseModel):
    crops: dict
    total_crops: int
    last_updated: str

@router.get("/predict", response_model=PricePrediction)
async def predict_market_price(
    crop: str = Query(..., description="Crop name (wheat, rice, cotton, soybean, maize, sugarcane)"),
    days: int = Query(30, ge=1, le=90, description="Number of days to predict (1-90)"),
    lang: str = Query('en', regex='^(en|hi|mr)$', description='Language code for localized results')
):
    """
    Predict crop prices using ARIMA time series analysis
    
    - **crop**: Crop name for prediction
    - **days**: Number of days to forecast (1-90 days)
    
    Returns price predictions with trend analysis and recommendations.
    """
    try:
        # Validate crop name
        supported_crops = predictor.get_supported_crops()
        if crop.lower() not in supported_crops:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported crop '{crop}'. Supported crops: {', '.join(supported_crops)}"
            )
        
        # Get prediction
        result = predictor.predict_price(crop.lower(), days, lang)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        logger.info(f"Price prediction generated for {crop}: {result['trend']} trend")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Market prediction error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate price prediction")

@router.get("/summary", response_model=MarketSummary)
async def get_market_summary(
    lang: str = Query('en', regex='^(en|hi|mr)$', description='Language code for localized results')
):
    """
    Get summary of all crop market predictions
    Returns current prices, predictions, and recommendations for all supported crops.
    """
    try:
        summary = predictor.get_market_summary(lang)
        return summary
        
    except Exception as e:
        logger.error(f"Market summary error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate market summary")

@router.get("/crops")
async def get_supported_crops():
    """
    Get list of supported crops for price prediction
    """
    try:
        crops = predictor.get_supported_crops()
        return {
            "supported_crops": crops,
            "total_crops": len(crops),
            "examples": ["wheat", "rice", "cotton"],
            "note": "Use crop names in lowercase"
        }
        
    except Exception as e:
        logger.error(f"Supported crops error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get supported crops")

@router.get("/health")
async def market_health():
    """
    Health check for market prediction service
    """
    try:
        supported_crops = predictor.get_supported_crops()
        sample_prediction = predictor.predict_price("wheat", 7, language='en')
        
        return {
            "status": "healthy",
            "service": "market_prediction",
            "supported_crops": len(supported_crops),
            "sample_prediction_available": "error" not in sample_prediction,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Market health check error: {e}")
        return {
            "status": "degraded",
            "service": "market_prediction",
            "error": str(e),
            "last_updated": datetime.now().isoformat()
        }
