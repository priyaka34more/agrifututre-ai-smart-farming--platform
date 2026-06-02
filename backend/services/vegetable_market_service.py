"""
Vegetable Market Price Service
Integrates with vegetablemarketprice.com for accurate market pricing data
"""

import requests
import re
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class VegetableMarketService:
    def __init__(self):
        self.base_url = "https://vegetablemarketprice.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Maharashtra district mappings
        self.district_mappings = {
            'pune': 'pune',
            'mumbai': 'mumbai', 
            'nashik': 'nashik',
            'nagpur': 'nagpur',
            'aurangabad': 'aurangabad',
            'solapur': 'solapur',
            'amravati': 'amravati',
            'jalgaon': 'jalgaon',
            'kolhapur': 'kolhapur',
            'sangli': 'sangli',
            'satara': 'satara',
            'latur': 'latur',
            'nanded': 'nanded',
            'parbhani': 'parbhani',
            'hingoli': 'hingoli',
            'beed': 'beed',
            'osmanabad': 'osmanabad',
            'raigad': 'raigad',
            'ratnagiri': 'ratnagiri',
            'sindhudurg': 'sindhudurg',
            'thane': 'thane',
            'palghar': 'palghar',
            'wardha': 'wardha',
            'gadchiroli': 'gadchiroli',
            'chandrapur': 'chandrapur',
            'yavatmal': 'yavatmal',
            'bhandara': 'bhandara',
            'gondia': 'gondia',
            'buldhana': 'buldhana',
            'akola': 'akola',
            'washim': 'washim'
        }
        
        # Crop name mappings
        self.crop_mappings = {
            'tomato': 'tomato',
            'onion': 'onion',
            'potato': 'potato',
            'brinjal': 'brinjal',
            'cabbage': 'cabbage',
            'cauliflower': 'cauliflower',
            'carrot': 'carrot',
            'beans': 'beans',
            'bitter_gourd': 'bitter gourd',
            'bottle_gourd': 'bottle gourd',
            'ridge_gourd': 'ridge gourd',
            'lady_finger': 'lady finger',
            'capsicum': 'capsicum',
            'green_chilli': 'green chilli',
            'coriander': 'coriander',
            'spinach': 'spinach',
            'fenugreek': 'fenugreek',
            'mint': 'mint',
            'cucumber': 'cucumber',
            'pumpkin': 'pumpkin',
            'ridge_gourd': 'ridge gourd',
            'snake_gourd': 'snake gourd',
            'ash_gourd': 'ash gourd',
            'drumstick': 'drumstick',
            'celery': 'celery',
            'lettuce': 'lettuce',
            'broccoli': 'broccoli'
        }

    def get_market_price(self, crop: str, district: str = 'mumbai') -> Dict:
        """
        Get market price for a specific crop in a district
        
        Args:
            crop: Crop name (e.g., 'tomato', 'onion')
            district: District name (e.g., 'pune', 'mumbai')
            
        Returns:
            Dictionary with market price information
        """
        try:
            # Normalize inputs
            crop_lower = crop.lower()
            district_lower = district.lower()
            
            # Map to website format
            mapped_crop = self.crop_mappings.get(crop_lower, crop_lower)
            mapped_district = self.district_mappings.get(district_lower, district_lower)
            
            # Try to get district-specific data first
            district_url = f"{self.base_url}/market/{mapped_district}/today"
            price_data = self._scrape_market_data(district_url, mapped_crop)
            
            if not price_data:
                # Fall back to Mumbai data
                logger.warning(f"No data found for {mapped_district}, falling back to Mumbai")
                mumbai_url = f"{self.base_url}/market/mumbai/today"
                price_data = self._scrape_market_data(mumbai_url, mapped_crop)
            
            if price_data:
                return {
                    'crop': crop.title(),
                    'district': district.title(),
                    'current_price': price_data.get('price', 0),
                    'unit': price_data.get('unit', '₹/kg'),
                    'trend': price_data.get('trend', 'Stable ➖'),
                    'source': 'vegetablemarketprice.com',
                    'last_updated': datetime.now().isoformat(),
                    'confidence': 'high',
                    'market': mapped_district.title()
                }
            else:
                return self._get_fallback_data(crop, district)
                
        except Exception as e:
            logger.error(f"Error fetching market price from vegetablemarketprice.com: {e}")
            return self._get_fallback_data(crop, district)

    def _scrape_market_data(self, url: str, crop: str) -> Optional[Dict]:
        """Scrape market data from the website"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for price data in various formats
            price_data = self._extract_price_from_table(soup, crop)
            
            if not price_data:
                price_data = self._extract_price_from_text(soup, crop)
            
            return price_data
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
            return None

    def _extract_price_from_table(self, soup: BeautifulSoup, crop: str) -> Optional[Dict]:
        """Extract price from table data"""
        try:
            # Look for tables that might contain price data
            tables = soup.find_all('table')
            
            for table in tables:
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 2:
                        # Check if crop name is in this row
                        row_text = ' '.join(cell.get_text().strip().lower() for cell in cells)
                        if crop.lower() in row_text:
                            # Try to extract price
                            for cell in cells:
                                cell_text = cell.get_text().strip()
                                # Look for price patterns
                                price_match = re.search(r'₹\s*(\d+(?:\.\d+)?)', cell_text)
                                if price_match:
                                    price = float(price_match.group(1))
                                    
                                    # Determine trend
                                    trend = 'Stable ➖'
                                    if '↑' in cell_text or 'increase' in row_text.lower():
                                        trend = 'Rising 📈'
                                    elif '↓' in cell_text or 'decrease' in row_text.lower():
                                        trend = 'Falling 📉'
                                    
                                    return {
                                        'price': price,
                                        'unit': '₹/kg',
                                        'trend': trend
                                    }
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting price from table: {e}")
            return None

    def _extract_price_from_text(self, soup: BeautifulSoup, crop: str) -> Optional[Dict]:
        """Extract price from text content"""
        try:
            # Look for price patterns in the entire page
            page_text = soup.get_text()
            
            # Search for crop name followed by price
            patterns = [
                rf'{crop}.+?₹\s*(\d+(?:\.\d+)?)',
                rf'{crop}.+?(\d+(?:\.\d+)?)\s*rupee',
                rf'{crop}.+?(\d+(?:\.\d+)?)\s*rs',
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, page_text, re.IGNORECASE)
                if matches:
                    price = float(matches[0])
                    return {
                        'price': price,
                        'unit': '₹/kg',
                        'trend': 'Stable ➖'
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting price from text: {e}")
            return None

    def _get_fallback_data(self, crop: str, district: str) -> Dict:
        """Get fallback data when API fails"""
        fallback_prices = {
            'tomato': 25.0,
            'onion': 30.0,
            'potato': 20.0,
            'brinjal': 35.0,
            'cabbage': 15.0,
            'cauliflower': 40.0,
            'carrot': 45.0,
            'beans': 50.0,
            'capsicum': 60.0,
            'green_chilli': 80.0
        }
        
        price = fallback_prices.get(crop.lower(), 25.0)
        
        return {
            'crop': crop.title(),
            'district': district.title(),
            'current_price': price,
            'unit': '₹/kg',
            'trend': 'Stable ➖',
            'source': 'fallback',
            'last_updated': datetime.now().isoformat(),
            'confidence': 'low',
            'market': f'{district.title()} (Estimated)',
            'note': 'Using estimated market data'
        }

    def get_supported_crops(self) -> List[str]:
        """Get list of supported crops"""
        return list(self.crop_mappings.keys())

    def get_supported_districts(self) -> List[str]:
        """Get list of supported districts"""
        return list(self.district_mappings.keys())

# Create singleton instance
vegetable_market_service = VegetableMarketService()
