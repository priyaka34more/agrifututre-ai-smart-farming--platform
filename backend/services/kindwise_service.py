"""
Kindwise Crop Health API Service
Integrates with crop.kindwise.com for accurate disease detection
"""

import requests
import base64
import logging
from typing import Dict, List, Optional, Union
from datetime import datetime
import json
from io import BytesIO
from PIL import Image
import os

logger = logging.getLogger(__name__)

class KindwiseService:
    def __init__(self):
        self.base_url = "https://api.crop.kindwise.com"
        self.api_key = os.getenv("KINDWISE_API_KEY", "demo")  # Use demo key for testing
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'AgriFuture/1.0'
        })
        
        # Crop mappings for Kindwise API
        self.crop_mappings = {
            'tomato': 'tomato',
            'potato': 'potato',
            'onion': 'onion',
            'brinjal': 'eggplant',
            'cabbage': 'cabbage',
            'cauliflower': 'cauliflower',
            'carrot': 'carrot',
            'beans': 'bean',
            'capsicum': 'pepper',
            'chilli': 'pepper',
            'coriander': 'coriander',
            'spinach': 'spinach',
            'lettuce': 'lettuce',
            'cucumber': 'cucumber',
            'pumpkin': 'pumpkin',
            'bottle_gourd': 'bottle_gourd',
            'bitter_gourd': 'bitter_gourd',
            'ridge_gourd': 'ridge_gourd',
            'lady_finger': 'okra',
            'broccoli': 'broccoli',
            'celery': 'celery',
            'mint': 'mint',
            'fenugreek': 'fenugreek'
        }
        
        # Disease severity mappings
        self.severity_mappings = {
            'low': 'Low - Monitor closely',
            'moderate': 'Moderate - Take action soon',
            'high': 'High - Immediate treatment required',
            'critical': 'Critical - Urgent intervention needed'
        }

    def identify_disease(self, image_data: Union[bytes, str], crop: str = None) -> Dict:
        """
        Identify crop disease from image using Kindwise API
        
        Args:
            image_data: Image bytes or base64 string
            crop: Optional crop name for better accuracy
            
        Returns:
            Dictionary with disease identification results
        """
        try:
            # Prepare image for API
            if isinstance(image_data, str):
                # Assume it's base64
                image_bytes = base64.b64decode(image_data)
            else:
                image_bytes = image_data
            
            # Validate and optimize image
            optimized_image = self._optimize_image(image_bytes)
            image_base64 = base64.b64encode(optimized_image).decode('utf-8')
            
            # Prepare API request
            payload = {
                "images": [image_base64],
                "similar_images": True
            }
            
            # Add crop if specified
            if crop and crop.lower() in self.crop_mappings:
                payload["plant_language"] = "en"
                # Note: Kindwise might have different crop naming conventions
                # We'll map our crop names to their format
            
            # Make API request
            response = self._make_api_request("/v2/identification", payload)
            
            if response and response.get('result'):
                return self._parse_kindwise_response(response, crop)
            else:
                return self._get_fallback_disease_result(crop)
                
        except Exception as e:
            logger.error(f"Error in Kindwise disease identification: {e}")
            return self._get_fallback_disease_result(crop)

    def _optimize_image(self, image_bytes: bytes) -> bytes:
        """Optimize image for API processing"""
        try:
            # Open image and optimize
            img = Image.open(BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize to optimal size (Kindwise recommends max 2048x2048)
            max_size = 1024  # Conservative size for faster processing
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Save to bytes
            buffer = BytesIO()
            img.save(buffer, format='JPEG', quality=85, optimize=True)
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error optimizing image: {e}")
            return image_bytes  # Return original if optimization fails

    def _make_api_request(self, endpoint: str, payload: Dict) -> Optional[Dict]:
        """Make request to Kindwise API"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            # Add API key to headers
            headers = self.session.headers.copy()
            if self.api_key and self.api_key != "demo":
                headers['Api-Key'] = self.api_key
            
            response = self.session.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Kindwise API request failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in Kindwise API request: {e}")
            return None

    def _parse_kindwise_response(self, response: Dict, crop: str = None) -> Dict:
        """Parse Kindwise API response"""
        try:
            result = response.get('result', {})
            is_plant = result.get('is_plant', {}).get('probability', 0)
            
            if is_plant < 0.5:
                return {
                    'success': False,
                    'message': 'No plant detected in the image',
                    'confidence': 'low',
                    'source': 'kindwise',
                    'suggestions': ['Please upload a clear image of plant leaves or affected areas']
                }
            
            # Get disease identification
            disease = result.get('disease', {})
            suggestions = result.get('suggestions', [])
            
            if not disease and not suggestions:
                return {
                    'success': False,
                    'message': 'No disease detected - plant appears healthy',
                    'confidence': 'medium',
                    'source': 'kindwise',
                    'health_status': 'healthy'
                }
            
            # Parse top suggestion
            top_suggestion = suggestions[0] if suggestions else disease
            
            disease_name = top_suggestion.get('name', 'Unknown')
            probability = top_suggestion.get('probability', 0)
            disease_details = top_suggestion.get('details', {})
            
            # Extract treatment information
            treatment = disease_details.get('treatment', 'No specific treatment information available')
            symptoms = disease_details.get('symptoms', 'No specific symptoms information available')
            description = disease_details.get('description', 'No description available')
            
            # Determine severity based on disease type and probability
            severity = self._determine_severity(disease_name, probability)
            
            # Get similar images if available
            similar_images = top_suggestion.get('similar_images', [])
            
            return {
                'success': True,
                'disease_name': disease_name,
                'scientific_name': disease_details.get('scientific_name', ''),
                'probability': probability,
                'confidence': self._get_confidence_level(probability),
                'severity': severity,
                'treatment': treatment,
                'symptoms': symptoms,
                'description': description,
                'crop': crop or 'Unknown',
                'source': 'kindwise',
                'similar_images': similar_images[:3],  # Limit to 3 images
                'identification_date': datetime.now().isoformat(),
                'health_status': 'diseased',
                'recommendations': self._generate_recommendations(disease_name, severity, treatment)
            }
            
        except Exception as e:
            logger.error(f"Error parsing Kindwise response: {e}")
            return self._get_fallback_disease_result(crop)

    def _determine_severity(self, disease_name: str, probability: float) -> str:
        """Determine disease severity based on name and probability"""
        disease_lower = disease_name.lower()
        
        # High severity diseases
        high_severity_keywords = [
            'blight', 'wilt', 'rot', 'mold', 'virus', 'mosaic',
            'spot', 'anthracnose', 'downy mildew', 'powdery mildew'
        ]
        
        # Critical severity diseases
        critical_keywords = [
            'bacterial wilt', 'late blight', 'early blight', 'root rot',
            'stem rot', 'fusarium', 'phytophthora'
        ]
        
        if any(keyword in disease_lower for keyword in critical_keywords):
            return 'critical'
        elif any(keyword in disease_lower for keyword in high_severity_keywords):
            return 'high' if probability > 0.7 else 'moderate'
        elif probability > 0.8:
            return 'moderate'
        else:
            return 'low'

    def _get_confidence_level(self, probability: float) -> str:
        """Convert probability to confidence level"""
        if probability >= 0.8:
            return 'high'
        elif probability >= 0.6:
            return 'medium'
        else:
            return 'low'

    def _generate_recommendations(self, disease_name: str, severity: str, treatment: str) -> List[str]:
        """Generate actionable recommendations based on disease and severity"""
        recommendations = []
        
        if severity == 'critical':
            recommendations.append('🚨 Immediate intervention required - consult agricultural expert')
            recommendations.append('🔄 Isolate affected plants to prevent spread')
            recommendations.append('💊 Apply appropriate fungicide/pesticide as recommended')
        elif severity == 'high':
            recommendations.append('⚠️ Take action within 24-48 hours')
            recommendations.append('🌱 Remove affected leaves/plants if possible')
            recommendations.append('💧 Adjust watering practices to reduce humidity')
        elif severity == 'moderate':
            recommendations.append('📊 Monitor disease progression closely')
            recommendations.append('🌿 Consider organic treatment options first')
            recommendations.append('🔄 Improve air circulation around plants')
        else:
            recommendations.append('👁️ Regular monitoring recommended')
            recommendations.append('🌱 Maintain good plant hygiene')
            recommendations.append('💧 Ensure proper watering and nutrition')
        
        # Add specific treatment recommendations if available
        if treatment and treatment != 'No specific treatment information available':
            recommendations.append(f'💊 Treatment: {treatment[:100]}...' if len(treatment) > 100 else f'💊 Treatment: {treatment}')
        
        return recommendations

    def _get_fallback_disease_result(self, crop: str = None) -> Dict:
        """Get fallback disease detection result when API fails"""
        return {
            'success': False,
            'message': 'Kindwise API unavailable - using local analysis',
            'disease_name': 'Unknown',
            'probability': 0.0,
            'confidence': 'low',
            'severity': 'low',
            'treatment': 'Consult local agricultural expert for proper diagnosis',
            'symptoms': 'Unable to determine symptoms due to API unavailability',
            'description': 'Disease detection temporarily unavailable',
            'crop': crop or 'Unknown',
            'source': 'fallback',
            'identification_date': datetime.now().isoformat(),
            'health_status': 'unknown',
            'recommendations': [
                '🔄 Please try again later',
                '📱 Contact local agricultural extension office',
                '👁️ Monitor plant for any changes'
            ]
        }

    def get_supported_crops(self) -> List[str]:
        """Get list of supported crops"""
        return list(self.crop_mappings.keys())

    def get_api_status(self) -> Dict:
        """Check Kindwise API status"""
        try:
            response = self._make_api_request("/v2/identification", {"images": [""]})
            return {
                'status': 'available' if response else 'unavailable',
                'last_checked': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'last_checked': datetime.now().isoformat()
            }

# Create singleton instance
kindwise_service = KindwiseService()
