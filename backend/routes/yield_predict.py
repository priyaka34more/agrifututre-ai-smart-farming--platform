from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from services.yield_service import estimate_yield_and_profit
from main import verify_token
from database import SessionLocal

router = APIRouter(tags=["Yield Prediction"])

class YieldEstimationRequest(BaseModel):
    crop_type: str
    soil_type: str
    land_area_acre: float = Field(..., gt=0)
    rainfall_mm: float = Field(..., ge=0)
    temperature_c: float
    irrigation_available: bool
    fertilizer_budget: float = Field(..., ge=0)
    market_price_per_kg: float = Field(..., ge=0)
    language: Optional[str] = "en"
    state: Optional[str] = ""
    district: Optional[str] = ""
    mandi_price_auto: Optional[bool] = False
    rainfall_auto: Optional[bool] = False

@router.post("/estimate-yield")
async def estimate_yield(request: YieldEstimationRequest, user: dict = Depends(verify_token)):
    db = SessionLocal()
    try:
        payload = request.model_dump()
        result = estimate_yield_and_profit(payload)
        
        # Save yield prediction to SQLite
        try:
            from models.yield_prediction_model import YieldPrediction
            from models.user_model import User
            
            user_id = user.get("id")
            user_rec = db.query(User).filter(User.id == user_id).first() if user_id else None
            full_name = user_rec.full_name if user_rec else "Farmer"
            
            # Map risk level to a confidence score
            risk_level = result.get("risk_level", "Medium")
            confidence_score = 0.92 if risk_level == "Low" else (0.78 if risk_level == "Medium" else 0.62)
            
            prediction = YieldPrediction(
                user_id=user_id,
                full_name=full_name,
                crop_name=request.crop_type,
                soil_type=request.soil_type,
                rainfall=request.rainfall_mm,
                temperature=request.temperature_c,
                humidity=65.0,  # Default standard humidity
                predicted_yield=result.get("estimated_yield_kg", 0.0),
                confidence=confidence_score
            )
            db.add(prediction)
            db.commit()
        except Exception as se:
            print(f"Failed to save yield prediction to DB: {se}")
            db.rollback()
        
        # Log activity
        try:
            from utils.activity_logger import log_activity
            log_activity(
                db=db,
                user_id=user.get("id"),
                module="Yield Prediction",
                action="Yield Prediction Used",
                result="Success"
            )
        except Exception as le:
            print(f"Failed to log yield activity: {le}")
            
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Validation Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")
    finally:
        db.close()