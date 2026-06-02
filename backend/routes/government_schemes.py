"""
Government Schemes API Routes
Provides real-time Maharashtra government schemes information
"""

import logging
from fastapi import APIRouter, Query, HTTPException, Body, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from main import verify_token, verify_token_optional
from database import SessionLocal

from services.government_schemes_service import government_schemes_service

logger = logging.getLogger("GovernmentSchemesAPI")
router = APIRouter()

class SchemeRequest(BaseModel):
    state: Optional[str] = "maharashtra"
    category: Optional[str] = None

class EligibilityRequest(BaseModel):
    scheme_id: str
    farmer_profile: Dict
    state: Optional[str] = "maharashtra"

class SchemeSearchRequest(BaseModel):
    query: str
    state: Optional[str] = "maharashtra"

@router.get("/")
async def get_all_schemes(
    state: str = Query(default="maharashtra"),
    category: Optional[str] = Query(None),
    user: Optional[dict] = Depends(verify_token_optional)
):
    """
    Get all available government schemes for a state
    """
    db = SessionLocal()
    try:
        logger.info(f"Fetching schemes for state: {state}, category: {category}")
        
        schemes = government_schemes_service.get_all_schemes(state, category)
        
        # Save government scheme activity to SQLite
        try:
            from models.govt_scheme_activity_model import GovtSchemeActivity
            from models.user_model import User
            
            user_id = user.get("id") if user else None
            user_rec = db.query(User).filter(User.id == user_id).first() if user_id else None
            user_name = user_rec.full_name if user_rec else "Farmer"
            
            activity_record = GovtSchemeActivity(
                user_id=user_id,
                user_name=user_name,
                scheme_name="All Schemes",
                category=category or "General",
                action="Viewed Schemes List",
                state=state
            )
            db.add(activity_record)
            db.commit()
        except Exception as se:
            print(f"Failed to save govt scheme list activity to DB: {se}")
            db.rollback()
            
        # Log activity to user_activities table
        try:
            from utils.activity_logger import log_activity
            log_activity(
                db=db,
                user_id=user.get("id") if user else None,
                module="Government Schemes",
                action="Government Scheme Viewed",
                result="Success"
            )
        except Exception as le:
            print(f"Failed to log govt scheme activity: {le}")
        
        if not schemes:
            logger.warning(f"No schemes found for state: {state}")
            return {
                "status": "success",
                "message": "No schemes available",
                "schemes": [],
                "count": 0,
                "state": state,
                "category": category
            }
        
        logger.info(f"Retrieved {len(schemes)} schemes for {state}")
        
        return {
            "status": "success",
            "message": f"Found {len(schemes)} schemes",
            "schemes": schemes,
            "count": len(schemes),
            "state": state,
            "category": category,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching schemes: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch schemes")
    finally:
        db.close()

@router.get("/{scheme_id}")
async def get_scheme_details(
    scheme_id: str,
    state: str = Query(default="maharashtra"),
    user: Optional[dict] = Depends(verify_token_optional)
):
    """
    Get detailed information about a specific scheme
    """
    db = SessionLocal()
    try:
        logger.info(f"Fetching details for scheme: {scheme_id} in {state}")
        
        scheme = government_schemes_service.get_scheme_details(scheme_id, state)
        
        if not scheme:
            logger.warning(f"Scheme not found: {scheme_id}")
            raise HTTPException(status_code=404, detail="Scheme not found")
        
        # Save government scheme activity to SQLite
        try:
            from models.govt_scheme_activity_model import GovtSchemeActivity
            from models.user_model import User
            
            user_id = user.get("id") if user else None
            user_rec = db.query(User).filter(User.id == user_id).first() if user_id else None
            user_name = user_rec.full_name if user_rec else "Farmer"
            
            activity_record = GovtSchemeActivity(
                user_id=user_id,
                user_name=user_name,
                scheme_name=scheme.get("name", scheme_id),
                category=scheme.get("category", "General"),
                action="Viewed Scheme Details",
                state=state
            )
            db.add(activity_record)
            db.commit()
        except Exception as se:
            print(f"Failed to save govt scheme detail activity to DB: {se}")
            db.rollback()
        
        logger.info(f"Retrieved details for scheme: {scheme_id}")
        
        return {
            "status": "success",
            "scheme": scheme,
            "last_updated": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching scheme details: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch scheme details")
    finally:
        db.close()

@router.post("/eligibility")
async def check_eligibility(request: EligibilityRequest):
    """
    Check farmer eligibility for a specific scheme
    """
    try:
        logger.info(f"Checking eligibility for scheme: {request.scheme_id}")
        
        eligibility_result = government_schemes_service.check_eligibility(
            request.scheme_id, 
            request.farmer_profile
        )
        
        logger.info(f"Eligibility check completed for {request.scheme_id}: {eligibility_result['eligible']}")
        
        return {
            "status": "success",
            "scheme_id": request.scheme_id,
            "eligibility": eligibility_result,
            "checked_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error checking eligibility: {e}")
        raise HTTPException(status_code=500, detail="Failed to check eligibility")

@router.post("/search")
async def search_schemes(
    request: SchemeSearchRequest,
    user: Optional[dict] = Depends(verify_token_optional)
):
    """
    Search schemes by name or keywords
    """
    db = SessionLocal()
    try:
        logger.info(f"Searching schemes for query: {request.query}")
        
        schemes = government_schemes_service.search_schemes(request.query, request.state)
        
        logger.info(f"Search completed: {len(schemes)} results found")
        
        # Save government scheme activity to SQLite
        try:
            from models.govt_scheme_activity_model import GovtSchemeActivity
            from models.user_model import User
            
            user_id = user.get("id") if user else None
            user_rec = db.query(User).filter(User.id == user_id).first() if user_id else None
            user_name = user_rec.full_name if user_rec else "Farmer"
            
            activity_record = GovtSchemeActivity(
                user_id=user_id,
                user_name=user_name,
                scheme_name=request.query or "All Schemes",
                category="Search",
                action="Searched Scheme",
                state=request.state or "maharashtra"
            )
            db.add(activity_record)
            db.commit()
        except Exception as se:
            print(f"Failed to save govt scheme search activity to DB: {se}")
            db.rollback()
            
        # Log activity to user_activities table
        try:
            from utils.activity_logger import log_activity
            log_activity(
                db=db,
                user_id=user.get("id") if user else None,
                module="Government Schemes",
                action="Government Scheme Searched",
                result="Success"
            )
        except Exception as le:
            print(f"Failed to log govt scheme search activity: {le}")
            
        return {
            "status": "success",
            "query": request.query,
            "schemes": schemes,
            "count": len(schemes),
            "state": request.state,
            "searched_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error searching schemes: {e}")
        raise HTTPException(status_code=500, detail="Failed to search schemes")
    finally:
        db.close()

@router.get("/categories")
async def get_scheme_categories():
    """
    Get all available scheme categories
    """
    try:
        logger.info("Fetching scheme categories")
        
        categories = government_schemes_service.get_scheme_categories()
        
        logger.info(f"Retrieved {len(categories)} categories")
        
        return {
            "status": "success",
            "categories": categories,
            "count": len(categories),
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch categories")

@router.get("/featured")
async def get_featured_schemes(
    state: str = Query(default="maharashtra"),
    limit: int = Query(default=3)
):
    """
    Get featured/schemes for dashboard display
    """
    try:
        logger.info(f"Fetching featured schemes for {state}")
        
        # Get all schemes and return top priority ones
        all_schemes = government_schemes_service.get_all_schemes(state)
        
        # Sort by priority (PM schemes first, then by benefit amount)
        def scheme_priority(scheme):
            priority = 0
            if scheme.get('name', '').startswith('PM-'):
                priority -= 1000  # Highest priority for PM schemes
            if scheme.get('benefit_amount'):
                priority -= scheme.get('benefit_amount', 0)  # Higher benefit = higher priority
            if scheme.get('real_time_status', {}).get('status') == 'active':
                priority -= 100  # Active schemes get higher priority
            return priority
        
        sorted_schemes = sorted(all_schemes, key=scheme_priority)
        featured_schemes = sorted_schemes[:limit]
        
        logger.info(f"Retrieved {len(featured_schemes)} featured schemes")
        
        return {
            "status": "success",
            "schemes": featured_schemes,
            "count": len(featured_schemes),
            "state": state,
            "limit": limit,
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching featured schemes: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch featured schemes")

@router.get("/status/{scheme_id}")
async def get_scheme_status(
    scheme_id: str,
    state: str = Query(default="maharashtra")
):
    """
    Get real-time status of a specific scheme
    """
    try:
        logger.info(f"Fetching status for scheme: {scheme_id}")
        
        status = government_schemes_service._get_scheme_status(scheme_id, state)
        
        if not status:
            raise HTTPException(status_code=404, detail="Scheme not found")
        
        logger.info(f"Retrieved status for {scheme_id}: {status.get('status')}")
        
        return {
            "status": "success",
            "scheme_id": scheme_id,
            "scheme_status": status,
            "checked_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching scheme status: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch scheme status")

@router.post("/apply")
async def initiate_scheme_application(
    scheme_id: str = Body(...),
    farmer_profile: Dict = Body(...),
    state: str = Body(default="maharashtra"),
    user: dict = Depends(verify_token)
):
    """
    Initiate scheme application process
    """
    db = SessionLocal()
    try:
        logger.info(f"Initiating application for scheme: {scheme_id}")
        
        # Check eligibility first
        eligibility = government_schemes_service.check_eligibility(scheme_id, farmer_profile)
        
        if not eligibility['eligible']:
            return {
                "status": "ineligible",
                "message": "Farmer is not eligible for this scheme",
                "eligibility": eligibility,
                "scheme_id": scheme_id
            }
        
        # Get scheme details
        scheme = government_schemes_service.get_scheme_details(scheme_id, state)
        
        if not scheme:
            raise HTTPException(status_code=404, detail="Scheme not found")
        
        # Save government scheme activity to SQLite
        try:
            from models.govt_scheme_activity_model import GovtSchemeActivity
            from models.user_model import User
            
            user_id = user.get("id")
            user_rec = db.query(User).filter(User.id == user_id).first() if user_id else None
            user_name = user_rec.full_name if user_rec else "Farmer"
            
            activity_record = GovtSchemeActivity(
                user_id=user_id,
                user_name=user_name,
                scheme_name=scheme.get("name", scheme_id),
                category=scheme.get("category", "General"),
                action="Applied to Scheme",
                state=state
            )
            db.add(activity_record)
            db.commit()
        except Exception as se:
            print(f"Failed to save govt scheme application activity to DB: {se}")
            db.rollback()
            
        # Log activity to user_activities table
        try:
            from utils.activity_logger import log_activity
            log_activity(
                db=db,
                user_id=user.get("id"),
                module="Government Schemes",
                action="Government Scheme Applied",
                result="Success"
            )
        except Exception as le:
            print(f"Failed to log govt scheme application activity: {le}")
        
        # Return application initiation response
        return {
            "status": "initiated",
            "message": "Application process initiated",
            "scheme_id": scheme_id,
            "scheme_name": scheme.get('name'),
            "application_status": scheme.get('application_status'),
            "application_portal": scheme.get('application_status', {}).get('application_portal'),
            "required_documents": scheme.get('eligibility', {}).get('required_documents', []),
            "processing_time": scheme.get('application_status', {}).get('processing_time'),
            "next_steps": scheme.get('application_status', {}).get('required_steps', []),
            "initiated_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initiating application: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate application")
    finally:
        db.close()
