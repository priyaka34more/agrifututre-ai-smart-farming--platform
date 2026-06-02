#!/usr/bin/env python3
"""
Hybrid Disease Detection Service
Combines Local AI model with Kindwise API for accurate results
"""

import asyncio
import aiohttp
import json
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class DiseaseHybridService:
    def __init__(self):
        self.kindwise_api_url = "https://api.kindwise.ai/v1/detect"
        self.confidence_threshold = {
            "high": 75,
            "medium": 50,
            "low": 40
        }
    
    async def get_hybrid_result(self, image_data: bytes, local_result: Dict) -> Dict:
        """
        Hybrid AI result combining Local AI and Kindwise API
        
        Logic:
        - Local AI confidence ≥ 75% → Use local result
        - Local AI confidence ≤ 50% → Use Kindwise result
        - Both similar → Combine results
        """
        try:
            local_confidence = local_result.get("confidence", 0)
            
            # Decision logic
            if local_confidence >= self.confidence_threshold["high"]:
                # Use local result as primary
                result = await self._use_local_result(local_result)
            elif local_confidence <= self.confidence_threshold["medium"]:
                # Use Kindwise API as primary
                result = await self._use_kindwise_result(image_data)
            else:
                # Combine both results
                result = await self._combine_results(image_data, local_result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error in hybrid detection: {e}")
            return await self._fallback_result()
    
    async def _use_local_result(self, local_result: Dict) -> Dict:
        """Use local AI result as primary"""
        disease = local_result.get("disease", "Unknown")
        confidence = local_result.get("confidence", 0)
        
        return {
            "disease": disease,
            "confidence": confidence,
            "level": self._get_confidence_level(confidence),
            "verified": True,
            "message": f"Your plant may have {disease} disease",
            "source": "local_ai",
            "top_matches": []
        }
    
    async def _use_kindwise_result(self, image_data: bytes) -> Dict:
        """Use Kindwise API as primary"""
        try:
            async with aiohttp.ClientSession() as session:
                data = aiohttp.FormData()
                data.add_field('image', image_data, filename='leaf.jpg', content_type='image/jpeg')
                
                headers = {
                    'Authorization': 'Bearer YOUR_KINDWISE_API_KEY'
                }
                
                async with session.post(self.kindwise_api_url, data=data, headers=headers) as response:
                    if response.status == 200:
                        kindwise_result = await response.json()
                        return self._format_kindwise_result(kindwise_result)
                    else:
                        logger.error(f"Kindwise API error: {response.status}")
                        return await self._fallback_result()
                        
        except Exception as e:
            logger.error(f"Kindwise API error: {e}")
            return await self._fallback_result()
    
    async def _combine_results(self, image_data: bytes, local_result: Dict) -> Dict:
        """Combine local and Kindwise results"""
        try:
            # Get both results
            local_result_formatted = await self._use_local_result(local_result)
            kindwise_result = await self._use_kindwise_result(image_data)
            
            # If both agree on disease
            if local_result.get("disease") == kindwise_result.get("disease"):
                return {
                    "disease": local_result.get("disease"),
                    "confidence": max(local_result.get("confidence", 0), kindwise_result.get("confidence", 0)),
                    "level": self._get_confidence_level(max(local_result.get("confidence", 0), kindwise_result.get("confidence", 0))),
                    "verified": True,
                    "message": f"Your plant has {local_result.get('disease')} disease (verified by both AI systems)",
                    "source": "hybrid_verified",
                    "top_matches": []
                }
            else:
                # Different results - show both
                return {
                    "disease": local_result.get("disease"),
                    "confidence": local_result.get("confidence", 0),
                    "level": self._get_confidence_level(local_result.get("confidence", 0)),
                    "verified": True,
                    "message": f"Your plant may have {local_result.get('disease')} disease",
                    "source": "hybrid_primary",
                    "top_matches": [
                        {"name": kindwise_result.get("disease"), "confidence": kindwise_result.get("confidence", 0)}
                    ]
                }
                
        except Exception as e:
            logger.error(f"Error combining results: {e}")
            return await self._fallback_result()
    
    def _format_kindwise_result(self, kindwise_result: Dict) -> Dict:
        """Format Kindwise API result to standard format"""
        if not kindwise_result or "predictions" not in kindwise_result:
            return self._fallback_result()
        
        predictions = kindwise_result.get("predictions", [])
        if not predictions:
            return self._fallback_result()
        
        top_prediction = predictions[0]
        disease = top_prediction.get("class", "Unknown")
        confidence = round(top_prediction.get("confidence", 0) * 100)
        
        return {
            "disease": disease,
            "confidence": confidence,
            "level": self._get_confidence_level(confidence),
            "verified": True,
            "message": f"Your plant may have {disease} disease",
            "source": "kindwise_api",
            "top_matches": []
        }
    
    def _get_confidence_level(self, confidence: float) -> str:
        """Get confidence level as string"""
        if confidence >= self.confidence_threshold["high"]:
            return "High"
        elif confidence >= self.confidence_threshold["medium"]:
            return "Medium"
        else:
            return "Low"
    
    async def _fallback_result(self) -> Dict:
        """Fallback result when APIs fail"""
        return {
            "disease": "Unknown",
            "confidence": 0,
            "level": "Low",
            "verified": False,
            "message": "Unable to detect disease. Please try again with a clearer photo.",
            "source": "fallback",
            "top_matches": []
        }
    
    def validate_image(self, image_data: bytes) -> Dict:
        """Validate image quality"""
        if not image_data or len(image_data) < 1000:
            return {
                "valid": False,
                "error": "Image is too small or empty"
            }
        
        # Check image size (basic check)
        if len(image_data) > 10 * 1024 * 1024:  # 10MB
            return {
                "valid": False,
                "error": "Image is too large. Please use a smaller image."
            }
        
        return {
            "valid": True,
            "error": None
        }

# Global instance
disease_hybrid_service = DiseaseHybridService()
