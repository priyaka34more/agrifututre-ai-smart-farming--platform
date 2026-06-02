"""
AI Assistant Route - Ollama Integration
Provides farming expert AI responses with fallback to rule-based responses
"""

import logging
import asyncio
import aiohttp
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger("AI_API")
router = APIRouter()

# Ollama Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3"
OLLAMA_TIMEOUT = 30  # seconds

class AIRequest(BaseModel):
    question: str
    context: Optional[dict] = None
    disease: Optional[str] = None

class AIResponse(BaseModel):
    answer: str
    source: str  # "ollama" or "fallback"
    confidence: Optional[float] = None

# Rule-based fallback responses
FALLBACK_RESPONSES = {
    "medicine": "For medicine recommendations, consult your local agricultural expert or visit the nearest Krishi Vigyan Kendra. Always follow the instructions on pesticide labels and use protective equipment.",
    "dosage": "Dosage depends on crop stage, severity, and environmental conditions. Read the product label carefully or consult an agricultural officer for proper application guidelines.",
    "prevention": "Prevention includes: crop rotation, proper irrigation, balanced fertilization, regular monitoring, and timely application of preventive measures. Remove infected plants to prevent spread.",
    "weather": "Weather affects disease development. High humidity and moderate temperatures favor fungal diseases. Monitor forecasts and adjust treatment schedules accordingly.",
    "soil": "Soil health is crucial. Test soil pH, ensure proper drainage, add organic matter, and maintain balanced nutrient levels for disease resistance.",
    "treatment": "Treatment should include both chemical and cultural methods. Remove affected parts, apply recommended fungicides, and improve growing conditions.",
    "general": "For specific farming advice, contact your local agricultural extension office or Krishi Vigyan Kendra. They provide personalized guidance based on local conditions."
}

async def call_ollama_api(question: str, context: Optional[dict] = None) -> Optional[str]:
    """Call Ollama API for AI response"""
    try:
        # Build context-aware prompt
        context_str = ""
        if context:
            context_str = f"\nContext: {context}\n"
        
        if context and context.get('disease'):
            disease_context = f"Disease: {context.get('disease')}\n"
            context_str += disease_context
        
        prompt = f"""You are a farming expert assistant for Indian farmers. Answer questions simply and practically.

{context_str}
Question: {question}

Provide a helpful, practical answer in simple language. Focus on actionable advice for Indian farmers."""

        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=OLLAMA_TIMEOUT)) as session:
            payload = {
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": false,
                "options": {
                    "temperature": 0.7,
                    "max_tokens": 500
                }
            }
            
            async with session.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    return result.get("response", "").strip()
                else:
                    logger.warning(f"Ollama API returned status {response.status}")
                    return None
                    
    except asyncio.TimeoutError:
        logger.warning("Ollama API timeout")
        return None
    except Exception as e:
        logger.error(f"Ollama API error: {e}")
        return None

def get_fallback_response(question: str, disease: Optional[str] = None) -> str:
    """Get rule-based fallback response"""
    question_lower = question.lower()
    
    # Check for specific keywords
    for keyword, response in FALLBACK_RESPONSES.items():
        if keyword in question_lower:
            return response
    
    # Disease-specific responses
    if disease:
        disease_lower = disease.lower()
        if "blight" in disease_lower:
            return "For leaf blight: Use copper-based fungicides, ensure proper ventilation, remove affected leaves, and avoid overhead irrigation."
        elif "rust" in disease_lower:
            return "For rust disease: Apply sulfur-based fungicides, increase air circulation, and practice crop rotation."
        elif "spot" in disease_lower:
            return "For leaf spot: Use mancozeb or copper fungicides, remove infected plant parts, and improve drainage."
    
    # Default response
    return FALLBACK_RESPONSES["general"]

@router.post("/ask", response_model=AIResponse)
async def ask_ai(
    request: AIRequest,
    http_request: Request,
    user: dict = Depends(lambda: {"id": "anonymous"})  # Optional auth
):
    """
    Ask AI farming assistant
    Uses Ollama if available, falls back to rule-based responses
    """
    try:
        # Try Ollama first
        ollama_response = await call_ollama_api(
            request.question, 
            request.context
        )
        
        if ollama_response:
            logger.info("AI response from Ollama")
            return AIResponse(
                answer=ollama_response,
                source="ollama",
                confidence=0.8
            )
        else:
            # Fallback to rule-based response
            fallback_response = get_fallback_response(
                request.question, 
                request.disease or (request.context.get("disease") if request.context else None)
            )
            
            logger.info("AI response from fallback")
            return AIResponse(
                answer=fallback_response,
                source="fallback",
                confidence=0.6
            )
            
    except Exception as e:
        logger.error(f"AI API error: {e}")
        raise HTTPException(status_code=500, detail="AI service temporarily unavailable")

@router.get("/status")
async def ai_status():
    """Check AI service status"""
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
            async with session.get(f"{OLLAMA_BASE_URL}/api/tags") as response:
                if response.status == 200:
                    data = await response.json()
                    models = [model["name"] for model in data.get("models", [])]
                    return {
                        "status": "available",
                        "ollama_running": True,
                        "models": models,
                        "default_model": OLLAMA_MODEL
                    }
                else:
                    return {
                        "status": "fallback_only",
                        "ollama_running": False,
                        "message": "Ollama not available, using fallback responses"
                    }
    except Exception as e:
        return {
            "status": "fallback_only",
            "ollama_running": False,
            "message": f"Ollama error: {str(e)}"
        }
