from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import uuid
import requests
import os
from typing import List, Optional
from pydantic import BaseModel
from functools import lru_cache
import logging

from database import SessionLocal
from models.scheme_model import Scheme
from main import verify_token, check_role

router = APIRouter()
logger = logging.getLogger(__name__)

# =========================
# 🌐 REAL API INTEGRATION
# =========================
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY", "")
BASE_URL = "https://api.data.gov.in/resource/"

@lru_cache(maxsize=10)
def fetch_cached_schemes(url: str):
    """Cached API call for better performance"""
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"API call failed: {e}")
        return None

def get_real_schemes(state: Optional[str] = None):
    """Fetch real schemes from government APIs with fallback"""
    try:
        # Example API endpoint (replace with actual government scheme API)
        api_url = f"{BASE_URL}government-schemes"
        params = {
            "api-key": DATA_GOV_API_KEY,
            "format": "json",
            "limit": 100
        }
        
        if state:
            params["filters[state]"] = state
        
        # Try to fetch real data
        api_data = fetch_cached_schemes(f"{api_url}?{'&'.join([f'{k}={v}' for k, v in params.items()])}")
        
        if api_data and api_data.get("records"):
            schemes = []
            for record in api_data["records"]:
                schemes.append({
                    "name": record.get("scheme_name", "Unknown Scheme"),
                    "description": record.get("description", "No description available"),
                    "state": record.get("state", "All"),
                    "category": record.get("category", "General"),
                    "status": "active",
                    "benefits": record.get("benefits", "Various benefits available"),
                    "eligibility": record.get("eligibility", "Check eligibility criteria"),
                    "link": record.get("url", "#")
                })
            return schemes
        
    except Exception as e:
        logger.warning(f"Real API failed, using fallback: {e}")
    
    # Detailed Fallback Data if API fails
    fallback_schemes = [
        {
            "name": "PM-KISAN Samman Nidhi",
            "description": "Direct income support of ₹6,000 per year to small and marginal farmers to help them meet financial needs.",
            "state": "All",
            "category": "Financial Support",
            "status": "active",
            "benefits": "₹6,000 per year in three equal installments",
            "eligibility": "Small and marginal farmers with landholding up to 2 hectares",
            "link": "https://pmkisan.gov.in"
        },
        {
            "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            "description": "Crop insurance scheme protecting farmers against crop losses due to natural calamities, pests, and diseases.",
            "state": "All",
            "category": "Crop Insurance",
            "status": "active",
            "benefits": "Maximum premium of 2% for Kharif, 1.5% for Rabi, 5% for commercial crops",
            "eligibility": "All farmers growing notified crops in notified areas",
            "link": "https://pmfby.gov.in"
        },
        {
            "name": "Kisan Credit Card (KCC)",
            "description": "Provides adequate and timely credit support from the banking system for agricultural and allied activities.",
            "state": "All",
            "category": "Financial Support",
            "status": "active",
            "benefits": "Collateral-free loans up to ₹1.6 lakh, 4% interest subvention for timely repayment",
            "eligibility": "All farmers, tenant farmers, and sharecroppers",
            "link": "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card"
        },
        {
            "name": "Soil Health Card Scheme",
            "description": "Provides soil health cards to farmers containing crop-wise recommendations of nutrients and fertilizers required.",
            "state": "All",
            "category": "Technology & Tools",
            "status": "active",
            "benefits": "Free soil testing and customized fertilizer usage advice",
            "eligibility": "All farmers across India",
            "link": "https://soilhealth.dac.gov.in"
        },
        {
            "name": "Paramparagat Krishi Vikas Yojana (PKVY)",
            "description": "Promotes commercial organic farming through cluster approach and Participatory Guarantee System (PGS) certification.",
            "state": "All",
            "category": "Financial Support",
            "status": "active",
            "benefits": "₹50,000 per hectare assistance for 3 years (₹31,000 directly for inputs)",
            "eligibility": "Farmers interested in organic farming forming clusters",
            "link": "https://pgsindia-ncof.dac.net.in"
        },
        {
            "name": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
            "description": "Focuses on enhancing water use efficiency at farm level through Micro Irrigation (Drip and Sprinkler systems).",
            "state": "All",
            "category": "Technology & Tools",
            "status": "active",
            "benefits": "55% subsidy for small/marginal farmers, 45% for others on irrigation tools",
            "eligibility": "Farmers holding agricultural land",
            "link": "https://pmksy.gov.in"
        },
        {
            "name": "National Agriculture Market (e-NAM)",
            "description": "Pan-India electronic trading portal networking existing APMC mandis to create a unified national market.",
            "state": "All",
            "category": "Technology & Tools",
            "status": "active",
            "benefits": "Better price discovery, transparent auction process, direct bank payments",
            "eligibility": "All farmers registered with APMC",
            "link": "https://enam.gov.in"
        },
        {
            "name": "Maharashtra State Farm Mechanization Scheme",
            "description": "Subsidy for agricultural machinery and equipment like tractors, tillers, and implements to boost productivity.",
            "state": "Maharashtra",
            "category": "Financial Support",
            "status": "active",
            "benefits": "Up to 50% subsidy on farm machinery and implements",
            "eligibility": "Farmers in Maharashtra with valid land records (7/12 extract)",
            "link": "https://mahadbt.maharashtra.gov.in"
        },
        {
            "name": "Mukhya Mantri Krishi Aashirwad Yojana",
            "description": "State-level financial assistance scheme to provide investment support to farmers for kharif crops.",
            "state": "Jharkhand",
            "category": "Financial Support",
            "status": "active",
            "benefits": "₹5,000 per acre per year (up to max 5 acres)",
            "eligibility": "Small and marginal farmers of Jharkhand",
            "link": "https://mmkay.jharkhand.gov.in"
        },
        {
            "name": "Sub-Mission on Agricultural Mechanization (SMAM)",
            "description": "Promotes agricultural mechanization among small and marginal farmers and in regions with low farm power availability.",
            "state": "All",
            "category": "Technology & Tools",
            "status": "active",
            "benefits": "Financial assistance for establishing Custom Hiring Centres (CHCs)",
            "eligibility": "Rural youth, farmers, and self-help groups",
            "link": "https://agrimachinery.nic.in"
        }
    ]
    
    # Filter fallback schemes by state if specified
    if state and state != "All":
        fallback_schemes = [s for s in fallback_schemes if s["state"] == "All" or s["state"] == state]
    
    return fallback_schemes

# =========================
# 📦 SCHEMAS
# =========================
class SchemeBase(BaseModel):
    name: str
    state: str = "All"
    category: str
    status: str
    description: str
    benefits: str
    eligibility: str
    link: str

class SchemeOut(SchemeBase):
    id: str

    class Config:
        from_attributes = True

# =========================
# 🔗 DB DEPENDENCY
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# 🚀 GET SCHEMES (REAL API + DATABASE)
# =========================
@router.get("/")
def get_schemes(
    state: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token)
):
    try:
        # First try to get real schemes from API
        real_schemes = get_real_schemes(state)
        
        # Apply additional filters
        if category and category != "All":
            real_schemes = [s for s in real_schemes if s["category"].lower() == category.lower()]
        if status and status != "All":
            real_schemes = [s for s in real_schemes if s["status"].lower() == status.lower()]
        
        # If we have real data, return it
        if real_schemes:
            return {
                "status": "success",
                "source": "real_api" if DATA_GOV_API_KEY else "fallback",
                "count": len(real_schemes),
                "data": real_schemes
            }
        
        # Fallback to database if real API fails
        query = db.query(Scheme)
        if state and state != "All":
            query = query.filter(Scheme.state == state)
        if category and category != "All":
            query = query.filter(Scheme.category == category)
        if status and status != "All":
            query = query.filter(Scheme.status == status)
        
        db_schemes = query.all()
        
        return {
            "status": "success",
            "source": "database",
            "count": len(db_schemes),
            "data": db_schemes
        }
        
    except Exception as e:
        logger.error(f"Error fetching schemes: {e}")
        return {
            "status": "error",
            "message": "Failed to fetch schemes",
            "data": []
        }

# =========================
# 🛠️ ADMIN: ADD SCHEME
# =========================
@router.post("/", response_model=SchemeOut)
def add_scheme(
    scheme_in: SchemeBase, 
    db: Session = Depends(get_db),
    admin: dict = Depends(check_role(["admin", "super_admin"]))
):
    new_scheme = Scheme(
        id=str(uuid.uuid4()),
        **scheme_in.dict()
    )
    db.add(new_scheme)
    db.commit()
    db.refresh(new_scheme)
    return new_scheme

# =========================
# 🛠️ SEED SCHEMES (ONE-TIME)
# =========================
@router.post("/seed")
def seed_schemes(db: Session = Depends(get_db)):
    # Check if already seeded
    if db.query(Scheme).first():
        return {"message": "Database already seeded"}
    
    initial_schemes = [
        {
            "name": "PM-KISAN Samman Nidhi",
            "description": "Direct income support of ₹6,000 per year to small and marginal farmers to help them meet financial needs.",
            "state": "All",
            "category": "Financial Support",
            "status": "active",
            "benefits": "₹6,000 per year in three equal installments",
            "eligibility": "Small and marginal farmers with landholding up to 2 hectares",
            "link": "https://pmkisan.gov.in"
        },
        {
            "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            "description": "Crop insurance scheme protecting farmers against crop losses due to natural calamities, pests, and diseases.",
            "state": "All",
            "category": "Crop Insurance",
            "status": "active",
            "benefits": "Maximum premium of 2% for Kharif, 1.5% for Rabi, 5% for commercial crops",
            "eligibility": "All farmers growing notified crops in notified areas",
            "link": "https://pmfby.gov.in"
        },
        {
            "name": "Kisan Credit Card (KCC)",
            "description": "Provides adequate and timely credit support from the banking system for agricultural and allied activities.",
            "state": "All",
            "category": "Financial Support",
            "status": "active",
            "benefits": "Collateral-free loans up to ₹1.6 lakh, 4% interest subvention for timely repayment",
            "eligibility": "All farmers, tenant farmers, and sharecroppers",
            "link": "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card"
        },
        {
            "name": "Soil Health Card Scheme",
            "description": "Provides soil health cards to farmers containing crop-wise recommendations of nutrients and fertilizers required.",
            "state": "All",
            "category": "Technology & Tools",
            "status": "active",
            "benefits": "Free soil testing and customized fertilizer usage advice",
            "eligibility": "All farmers across India",
            "link": "https://soilhealth.dac.gov.in"
        },
        {
            "name": "Paramparagat Krishi Vikas Yojana (PKVY)",
            "description": "Promotes commercial organic farming through cluster approach and Participatory Guarantee System (PGS) certification.",
            "state": "All",
            "category": "Financial Support",
            "status": "active",
            "benefits": "₹50,000 per hectare assistance for 3 years (₹31,000 directly for inputs)",
            "eligibility": "Farmers interested in organic farming forming clusters",
            "link": "https://pgsindia-ncof.dac.net.in"
        },
        {
            "name": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
            "description": "Focuses on enhancing water use efficiency at farm level through Micro Irrigation (Drip and Sprinkler systems).",
            "state": "All",
            "category": "Technology & Tools",
            "status": "active",
            "benefits": "55% subsidy for small/marginal farmers, 45% for others on irrigation tools",
            "eligibility": "Farmers holding agricultural land",
            "link": "https://pmksy.gov.in"
        },
        {
            "name": "National Agriculture Market (e-NAM)",
            "description": "Pan-India electronic trading portal networking existing APMC mandis to create a unified national market.",
            "state": "All",
            "category": "Technology & Tools",
            "status": "active",
            "benefits": "Better price discovery, transparent auction process, direct bank payments",
            "eligibility": "All farmers registered with APMC",
            "link": "https://enam.gov.in"
        },
        {
            "name": "Maharashtra State Farm Mechanization Scheme",
            "description": "Subsidy for agricultural machinery and equipment like tractors, tillers, and implements to boost productivity.",
            "state": "Maharashtra",
            "category": "Financial Support",
            "status": "active",
            "benefits": "Up to 50% subsidy on farm machinery and implements",
            "eligibility": "Farmers in Maharashtra with valid land records (7/12 extract)",
            "link": "https://mahadbt.maharashtra.gov.in"
        },
        {
            "name": "Mukhya Mantri Krishi Aashirwad Yojana",
            "description": "State-level financial assistance scheme to provide investment support to farmers for kharif crops.",
            "state": "Jharkhand",
            "category": "Financial Support",
            "status": "active",
            "benefits": "₹5,000 per acre per year (up to max 5 acres)",
            "eligibility": "Small and marginal farmers of Jharkhand",
            "link": "https://mmkay.jharkhand.gov.in"
        },
        {
            "name": "Sub-Mission on Agricultural Mechanization (SMAM)",
            "description": "Promotes agricultural mechanization among small and marginal farmers and in regions with low farm power availability.",
            "state": "All",
            "category": "Technology & Tools",
            "status": "active",
            "benefits": "Financial assistance for establishing Custom Hiring Centres (CHCs)",
            "eligibility": "Rural youth, farmers, and self-help groups",
            "link": "https://agrimachinery.nic.in"
        }
    ]
    
    for s in initial_schemes:
        db.add(Scheme(id=str(uuid.uuid4()), **s))
    
    db.commit()
    return {"message": "Schemes seeded successfully"}
