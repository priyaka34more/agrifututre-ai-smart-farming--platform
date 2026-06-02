"""
External API Integration Service
Provides real-time data with fallback to static data
"""

import asyncio
import aiohttp
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json

logger = logging.getLogger("ExternalAPIs")

class ExternalAPIService:
    def __init__(self):
        self.cache = {}
        self.cache_expiry = {}
        self.timeout = 10  # seconds
        
        # API endpoints
        self.openweather_url = "https://api.openweathermap.org/data/2.5"
        self.agmarknet_url = "https://agmarknet.gov.in"
        
        # Static fallback data
        self.static_weather = {
            "temperature": 28,
            "humidity": 65,
            "description": "Partly cloudy",
            "wind_speed": 12,
            "pressure": 1013,
            "location": "Mumbai, Maharashtra",
            "source": "static"
        }
        
        self.static_market_prices = {
            "wheat": {"price": 2200, "unit": "quintal", "market": "Mandi"},
            "rice": {"price": 2800, "unit": "quintal", "market": "Mandi"},
            "cotton": {"price": 6500, "unit": "quintal", "market": "Mandi"},
            "soybean": {"price": 4200, "unit": "quintal", "market": "Mandi"},
            "maize": {"price": 1800, "unit": "quintal", "market": "Mandi"},
            "sugarcane": {"price": 3500, "unit": "quintal", "market": "Mandi"}
        }

    async def get_weather_data(self, location: str = "Mumbai,IN") -> Dict:
        """
        Get weather data from OpenWeather API with fallback to static data
        """
        cache_key = f"weather_{location}"
        
        # Check cache (5 minutes expiry)
        if cache_key in self.cache:
            if datetime.now() < self.cache_expiry.get(cache_key, datetime.now()):
                return self.cache[cache_key]
        
        try:
            # Try OpenWeather API
            api_key = "YOUR_OPENWEATHER_API_KEY"  # Should be in environment variables
            
            if api_key and api_key != "YOUR_OPENWEATHER_API_KEY":
                weather_data = await self._fetch_openweather(location, api_key)
                if weather_data:
                    # Cache for 5 minutes
                    self.cache[cache_key] = weather_data
                    self.cache_expiry[cache_key] = datetime.now() + timedelta(minutes=5)
                    return weather_data
            
            # Fallback to static data
            logger.info("Using static weather data")
            static_data = self.static_weather.copy()
            static_data["location"] = location
            static_data["last_updated"] = datetime.now().isoformat()
            
            # Cache static data for 1 hour
            self.cache[cache_key] = static_data
            self.cache_expiry[cache_key] = datetime.now() + timedelta(hours=1)
            
            return static_data
            
        except Exception as e:
            logger.error(f"Weather API error: {e}")
            return self.static_weather

    async def _fetch_openweather(self, location: str, api_key: str) -> Optional[Dict]:
        """Fetch weather data from OpenWeather API"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout)) as session:
                url = f"{self.openweather_url}/weather"
                params = {
                    "q": location,
                    "appid": api_key,
                    "units": "metric"
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        return {
                            "temperature": round(data["main"]["temp"], 1),
                            "humidity": data["main"]["humidity"],
                            "description": data["weather"][0]["description"].title(),
                            "wind_speed": data["wind"]["speed"],
                            "pressure": data["main"]["pressure"],
                            "location": location,
                            "source": "openweather",
                            "last_updated": datetime.now().isoformat()
                        }
                    else:
                        logger.warning(f"OpenWeather API returned status {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"OpenWeather API error: {e}")
            return None

    async def get_market_prices(self, crop: str = None) -> Dict:
        """
        Get market prices from Agmarknet with fallback to static data
        """
        cache_key = f"market_{crop or 'all'}"
        
        # Check cache (1 hour expiry)
        if cache_key in self.cache:
            if datetime.now() < self.cache_expiry.get(cache_key, datetime.now()):
                return self.cache[cache_key]
        
        try:
            # Try Agmarknet API (simplified - actual implementation would need web scraping)
            market_data = await self._fetch_agmarknet(crop)
            
            if market_data:
                # Cache for 1 hour
                self.cache[cache_key] = market_data
                self.cache_expiry[cache_key] = datetime.now() + timedelta(hours=1)
                return market_data
            
            # Fallback to static data
            logger.info("Using static market data")
            if crop:
                crop_lower = crop.lower()
                if crop_lower in self.static_market_prices:
                    static_data = self.static_market_prices[crop_lower].copy()
                    static_data["source"] = "static"
                    static_data["last_updated"] = datetime.now().isoformat()
                    
                    # Cache static data for 2 hours
                    self.cache[cache_key] = static_data
                    self.cache_expiry[cache_key] = datetime.now() + timedelta(hours=2)
                    
                    return static_data
            else:
                # Return all static prices
                static_data = {
                    "prices": self.static_market_prices,
                    "source": "static",
                    "last_updated": datetime.now().isoformat()
                }
                
                # Cache static data for 2 hours
                self.cache[cache_key] = static_data
                self.cache_expiry[cache_key] = datetime.now() + timedelta(hours=2)
                
                return static_data
                
        except Exception as e:
            logger.error(f"Market API error: {e}")
            return self.static_market_prices

    async def _fetch_agmarknet(self, crop: str = None) -> Optional[Dict]:
        """
        Fetch market data from Agmarknet
        Note: This is a simplified implementation
        Actual implementation would require web scraping as Agmarknet doesn't have a public API
        """
        try:
            # This is a placeholder for actual Agmarknet integration
            # In production, you would need to implement web scraping
            # or use a different data source
            
            logger.info("Agmarknet integration not implemented, using fallback")
            return None
            
        except Exception as e:
            logger.error(f"Agmarknet API error: {e}")
            return None

    async def get_commodity_news(self, limit: int = 5) -> List[Dict]:
        """
        Get agricultural commodity news
        Returns static news as fallback
        """
        cache_key = "commodity_news"
        
        # Check cache (6 hours expiry)
        if cache_key in self.cache:
            if datetime.now() < self.cache_expiry.get(cache_key, datetime.now()):
                return self.cache[cache_key]
        
        try:
            # Static news data
            news_data = [
                {
                    "title": "Wheat prices rise in Maharashtra mandis",
                    "summary": "Wheat prices increased by 5% due to lower arrivals",
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "source": "Static"
                },
                {
                    "title": "Government announces new MSP for kharif crops",
                    "summary": "Minimum support prices increased for major crops",
                    "date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
                    "source": "Static"
                },
                {
                    "title": "Monsoon progress: Above normal rainfall expected",
                    "summary": "IMD predicts above normal monsoon this year",
                    "date": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
                    "source": "Static"
                }
            ]
            
            # Cache for 6 hours
            self.cache[cache_key] = news_data
            self.cache_expiry[cache_key] = datetime.now() + timedelta(hours=6)
            
            return news_data[:limit]
            
        except Exception as e:
            logger.error(f"News API error: {e}")
            return []

    async def health_check(self) -> Dict:
        """
        Check health of external API services
        """
        status = {
            "openweather": "not_configured",
            "agmarknet": "not_available",
            "cache_size": len(self.cache),
            "last_updated": datetime.now().isoformat()
        }
        
        # Test OpenWeather (if configured)
        try:
            api_key = "YOUR_OPENWEATHER_API_KEY"
            if api_key != "YOUR_OPENWEATHER_API_KEY":
                weather_data = await self.get_weather_data("Delhi,IN")
                if weather_data.get("source") == "openweather":
                    status["openweather"] = "available"
                else:
                    status["openweather"] = "error"
        except Exception as e:
            status["openweather"] = "error"
        
        return status

# Global service instance
external_api_service = ExternalAPIService()
