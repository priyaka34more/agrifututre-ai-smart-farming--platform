from fastapi import APIRouter, Depends, Request
from database import SessionLocal
from models.history_model import DetectionHistory
import json
from main import verify_token

router = APIRouter()

@router.get("/")
def get_history(request: Request, user: dict = Depends(verify_token)):
    request_id = getattr(request.state, "request_id", "unknown")
    user_id = user.get("id")
    
    if not user_id:
        return {"status": "success", "data": [], "request_id": request_id}

    db = SessionLocal()

    records = db.query(DetectionHistory).filter(
        DetectionHistory.user_id == user_id
    ).order_by(
        DetectionHistory.created_at.desc()
    ).all()

    data = []

    for r in records:
        data.append({
            "id": r.id,
            "disease": r.disease,
            "confidence": r.confidence,
            "date": r.created_at,
            "result": json.loads(r.result_json)
        })

    db.close()

    return {
        "status": "success",
        "data": data,
        "request_id": request_id
    }