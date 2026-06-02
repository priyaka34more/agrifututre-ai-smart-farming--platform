import json
from sqlalchemy.orm import Session
from models.history_model import DetectionHistory

def save_history(db: Session, result_id, disease, confidence, result):
    record = DetectionHistory(
        id=result_id,
        disease=disease,
        confidence=confidence,
        result_json=json.dumps(result)
    )
    db.add(record)
    db.commit()


def get_history(db: Session):
    return db.query(DetectionHistory).order_by(
        DetectionHistory.created_at.desc()
    ).all()