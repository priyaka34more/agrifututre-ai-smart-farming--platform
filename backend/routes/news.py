from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
import random
import logging
from datetime import datetime

logger = logging.getLogger("NewsAPI")

from database import SessionLocal
from models.admin_news_model import AdminNews

import time

router = APIRouter()

# 📝 CACHE CONFIG
NEWS_CACHE = {"data": None, "expiry": 0}
CACHE_TTL = 300 # 5 minutes

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 📰 MOCK LIVE NEWS (Fallback)
MOCK_NEWS = [
    {
        "title": "Government increases MSP for Wheat by ₹150",
        "description": "The central government has announced a significant hike in Minimum Support Price for the upcoming Rabi season.",
        "image": "https://img.freepik.com/free-photo/wheat-field-sunset_1150-11116.jpg",
        "source": "AgriIndia News",
        "is_pinned": False,
        "is_active": True
    },
    {
        "title": "New Organic Farming Subsidy announced in Maharashtra",
        "description": "Farmers adopting organic methods will receive ₹50,000 per hectare support.",
        "image": "https://img.freepik.com/free-photo/organic-vegetables-crate_1150-13417.jpg",
        "source": "Kisan News",
        "is_pinned": False,
        "is_active": True
    },
    {
        "title": "Monsoon Update: Normal rainfall expected this year",
        "description": "IMD predicts a healthy monsoon season across the central and southern belts of India.",
        "image": "https://img.freepik.com/free-photo/rainy-field-agriculture_1150-11110.jpg",
        "source": "Weather Portal",
        "is_pinned": False,
        "is_active": True
    }
]

@router.get("/")
def get_news(request: Request, db: Session = Depends(get_db)):
    global NEWS_CACHE
    request_id = getattr(request.state, "request_id", "unknown")
    
    current_time = time.time()
    if NEWS_CACHE["data"] and current_time < NEWS_CACHE["expiry"]:
        logger.info("[%s] NEWS CACHE HIT", request_id)
        return {
            "status": "success",
            "data": NEWS_CACHE["data"],
            "cache": True,
            "request_id": request_id
        }

    logger.info("[%s] NEWS CACHE MISS", request_id)

    # 1️⃣ Fetch Admin News from DB
    admin_news = db.query(AdminNews).filter(AdminNews.is_active == True).all()
    
    # Format DB news
    formatted_admin = [
        {
            "id": n.id,
            "title": n.title,
            "description": n.description,
            "image": n.image,
            "source": n.source,
            "is_pinned": n.is_pinned,
            "is_active": n.is_active,
            "created_at": n.created_at
        } for n in admin_news
    ]
    
    # 2️⃣ Merge with Live (Mock) News
    all_news = formatted_admin + MOCK_NEWS
    
    # 3️⃣ Sort Logic: Pinned First, then Latest
    sorted_news = sorted(
        all_news, 
        key=lambda x: (not x.get("is_pinned", False), -x.get("created_at", datetime.min).timestamp() if isinstance(x.get("created_at"), datetime) else 0)
    )
    
    # Update Cache
    NEWS_CACHE = {
        "data": sorted_news,
        "expiry": current_time + CACHE_TTL
    }
    
    return {
        "status": "success",
        "data": sorted_news,
        "cache": False,
        "request_id": request_id
    }
