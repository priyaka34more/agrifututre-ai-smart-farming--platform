"""
Smart Decision Engine Route
Intelligent decision-making based on disease detection and market analysis
"""

import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional

from services.history_storage import history_storage

logger = logging.getLogger("DecisionEngine")
router = APIRouter()

class DecisionRequest(BaseModel):
    disease: str
    confidence: float
    predicted_price: Optional[float] = None
    trend: Optional[str] = None  # increasing, decreasing, stable
    crop_type: Optional[str] = "unknown"

class DecisionResponse(BaseModel):
    recommendation: str
    priority: str  # high, medium, low
    reasoning: str
    reason: str
    action_items: list
    confidence_score: float

class DecisionEngine:
    def __init__(self):
        self.decision_rules = self._initialize_rules()
    
    def _initialize_rules(self):
        """Initialize decision-making rules"""
        return {
            "low_confidence": {
                "condition": lambda data: data["confidence"] < 0.6,
                "recommendation": "Retake image with better lighting and focus",
                "priority": "low",
                "reasoning": "Low confidence in disease detection requires better image quality",
                "reason": "Image quality is poor - confidence {confidence}% is below 60% threshold",
                "action_items": [
                    "Ensure proper lighting (avoid direct sunlight)",
                    "Focus camera clearly on affected area",
                    "Include multiple leaves if possible",
                    "Avoid blurry or shaky images"
                ]
            },
            "high_confidence_disease_increasing_market": {
                "condition": lambda data: (
                    data["confidence"] >= 0.6 and 
                    "healthy" not in data["disease"].lower() and
                    data.get("trend") == "increasing"
                ),
                "recommendation": "Apply treatment immediately and plan to sell within 3-5 days",
                "priority": "high",
                "reasoning": "Disease detected with high confidence and market prices are rising - optimal time for treatment and sale",
                "reason": "Disease '{disease}' detected with {confidence}% confidence and market prices are increasing to ₹{predicted_price} - treat now and sell quickly for maximum profit",
                "action_items": [
                    "Apply recommended treatment immediately",
                    "Monitor crop response daily",
                    "Plan harvest/sale within 3-5 days for best prices",
                    "Document treatment for future reference"
                ]
            },
            "high_confidence_disease_decreasing_market": {
                "condition": lambda data: (
                    data["confidence"] >= 0.6 and 
                    "healthy" not in data["disease"].lower() and
                    data.get("trend") == "decreasing"
                ),
                "recommendation": "Treat immediately and delay selling until market improves",
                "priority": "high",
                "reasoning": "Disease requires immediate treatment but market conditions suggest waiting for better prices",
                "reason": "Disease '{disease}' detected with {confidence}% confidence but market prices are decreasing to ₹{predicted_price} - treat immediately and wait for market recovery",
                "action_items": [
                    "Apply treatment immediately to prevent spread",
                    "Monitor market trends regularly",
                    "Delay sale until prices stabilize or increase",
                    "Consider storage if crop is ready for harvest"
                ]
            },
            "high_confidence_disease_stable_market": {
                "condition": lambda data: (
                    data["confidence"] >= 0.6 and 
                    "healthy" not in data["disease"].lower() and
                    data.get("trend") == "stable"
                ),
                "recommendation": "Treat disease and monitor market conditions before selling",
                "priority": "medium",
                "reasoning": "Disease confirmed with high confidence, market conditions are stable",
                "reason": "Disease '{disease}' detected with {confidence}% confidence and market is stable at ₹{predicted_price} - treat now and monitor for optimal selling time",
                "action_items": [
                    "Apply appropriate treatment",
                    "Monitor market trends weekly",
                    "Consider selling when prices show upward trend",
                    "Maintain crop health records"
                ]
            },
            "healthy_crop_increasing_market": {
                "condition": lambda data: (
                    data["confidence"] >= 0.6 and 
                    "healthy" in data["disease"].lower() and
                    data.get("trend") == "increasing"
                ),
                "recommendation": "Crop is healthy - consider selling soon to maximize profits",
                "priority": "medium",
                "reasoning": "Healthy crop with rising market prices presents good selling opportunity",
                "reason": "Crop is healthy with {confidence}% confidence and market prices are increasing to ₹{predicted_price} - excellent time to sell for maximum profit",
                "action_items": [
                    "Monitor crop maturity closely",
                    "Plan logistics for timely sale",
                    "Consider selling in batches to manage risk",
                    "Document crop quality for premium pricing"
                ]
            },
            "healthy_crop_stable_decreasing_market": {
                "condition": lambda data: (
                    data["confidence"] >= 0.6 and 
                    "healthy" in data["disease"].lower() and
                    data.get("trend") in ["stable", "decreasing"]
                ),
                "recommendation": "Crop condition stable - monitor regularly and wait for better market conditions",
                "priority": "low",
                "reasoning": "Healthy crop with stable or declining prices - no immediate action needed",
                "reason": "Crop is healthy with {confidence}% confidence but market prices are {trend} at ₹{predicted_price} - maintain crop health and wait for better market conditions",
                "action_items": [
                    "Continue regular monitoring",
                    "Watch for market improvement opportunities",
                    "Maintain crop health practices",
                    "Plan for optimal harvest timing"
                ]
            },
            "default": {
                "condition": lambda data: True,
                "recommendation": "Crop condition stable. Monitor regularly and make decisions based on market trends",
                "priority": "medium",
                "reasoning": "General recommendation for ongoing monitoring",
                "reason": "Standard monitoring recommendation - crop shows '{disease}' with {confidence}% confidence and market at ₹{predicted_price} - continue regular monitoring",
                "action_items": [
                    "Monitor crop health weekly",
                    "Track market price movements",
                    "Maintain standard agricultural practices",
                    "Consult local agricultural experts if needed"
                ]
            }
        }
    
    def make_decision(self, data: dict) -> dict:
        """
        Make intelligent decision based on input data
        """
        try:
            # Find matching rule
            decision = None
            for rule_name, rule in self.decision_rules.items():
                if rule["condition"](data):
                    decision = rule.copy()
                    break
            
            if not decision:
                decision = self.decision_rules["default"]
            
            # Calculate confidence score
            confidence_score = self._calculate_confidence_score(data, decision)
            
            # Format reason with actual data
            if "reason" in decision and "{" in decision["reason"]:
                try:
                    decision["reason"] = decision["reason"].format(
                        disease=data.get("disease", "unknown"),
                        confidence=round(data.get("confidence", 0) * 100),
                        predicted_price=data.get("predicted_price", "unknown"),
                        trend=data.get("trend", "unknown")
                    )
                except Exception as e:
                    logger.warning(f"Failed to format reason: {e}")
                    decision["reason"] = decision.get("reasoning", "Decision based on analysis")
            
            # Add timestamp
            decision["timestamp"] = datetime.now().isoformat()
            decision["input_data"] = data
            
            logger.info(f"Decision made: {decision['recommendation']} (Priority: {decision['priority']})")
            return decision
            
        except Exception as e:
            logger.error(f"Decision engine error: {e}")
            # Fallback decision
            return {
                "recommendation": "System error - consult agricultural expert",
                "priority": "low",
                "reasoning": "Decision engine encountered an error",
                "action_items": ["Contact local agricultural expert", "Retry detection later"],
                "timestamp": datetime.now().isoformat(),
                "input_data": data
            }
    
    def _calculate_confidence_score(self, data: dict, decision: dict) -> float:
        """Calculate overall confidence score for the decision"""
        base_confidence = data.get("confidence", 0.5)
        
        # Adjust based on data completeness
        completeness_factor = 1.0
        if data.get("predicted_price") is None:
            completeness_factor -= 0.1
        if data.get("trend") is None:
            completeness_factor -= 0.1
        if data.get("crop_type") == "unknown":
            completeness_factor -= 0.1
        
        # Adjust based on decision priority
        priority_factor = {
            "high": 0.9,
            "medium": 0.8,
            "low": 0.7
        }.get(decision.get("priority", "medium"), 0.8)
        
        final_confidence = base_confidence * completeness_factor * priority_factor
        return round(min(final_confidence, 1.0), 2)

# Global decision engine instance
decision_engine = DecisionEngine()

@router.post("/recommend", response_model=DecisionResponse)
async def get_decision_recommendation(
    request: DecisionRequest,
    http_request: Request
):
    """
    Get intelligent recommendation based on disease detection and market analysis
    """
    try:
        # Prepare data for decision engine
        decision_data = {
            "disease": request.disease,
            "confidence": request.confidence,
            "predicted_price": request.predicted_price,
            "trend": request.trend,
            "crop_type": request.crop_type,
            "client_ip": http_request.client.host,
            "timestamp": datetime.now().isoformat()
        }
        
        # Get decision
        decision = decision_engine.make_decision(decision_data)
        
        # Store in history
        history_data = decision_data.copy()
        history_data.update({
            "recommendation": decision["recommendation"],
            "priority": decision["priority"],
            "reasoning": decision["reasoning"],
            "action_items": decision["action_items"],
            "confidence_score": decision_engine._calculate_confidence_score(decision_data, decision)
        })
        history_storage.add_decision(history_data)
        
        # Format response
        response = DecisionResponse(
            recommendation=decision["recommendation"],
            priority=decision["priority"],
            reasoning=decision["reasoning"],
            reason=decision.get("reason", decision.get("reasoning", "Decision based on analysis")),
            action_items=decision["action_items"],
            confidence_score=decision_engine._calculate_confidence_score(decision_data, decision)
        )
        
        logger.info(f"Decision recommendation provided: {decision['recommendation'][:50]}...")
        return response
        
    except Exception as e:
        logger.error(f"Decision recommendation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendation")

@router.get("/rules")
async def get_decision_rules():
    """
    Get available decision rules (for debugging/monitoring)
    """
    try:
        rules_summary = {}
        for rule_name, rule in decision_engine.decision_rules.items():
            rules_summary[rule_name] = {
                "recommendation": rule["recommendation"],
                "priority": rule["priority"]
            }
        
        return {
            "total_rules": len(rules_summary),
            "rules": rules_summary,
            "engine_status": "active"
        }
        
    except Exception as e:
        logger.error(f"Decision rules error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get decision rules")

@router.get("/health")
async def decision_health():
    """
    Health check for decision engine
    """
    try:
        # Test decision engine with sample data
        test_data = {
            "disease": "Healthy",
            "confidence": 0.9,
            "predicted_price": 2000,
            "trend": "stable"
        }
        
        test_decision = decision_engine.make_decision(test_data)
        
        return {
            "status": "healthy",
            "engine": "decision_engine",
            "rules_loaded": len(decision_engine.decision_rules),
            "test_decision_successful": bool(test_decision),
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Decision health check error: {e}")
        return {
            "status": "degraded",
            "engine": "decision_engine",
            "error": str(e),
            "last_updated": datetime.now().isoformat()
        }
