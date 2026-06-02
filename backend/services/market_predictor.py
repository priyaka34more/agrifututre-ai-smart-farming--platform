"""
Market Prediction Service - ARIMA Model
Provides crop price predictions using ARIMA time series analysis
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger("MarketPredictor")

class MarketPredictor:
    def __init__(self):
        self.mock_data = self._generate_mock_data()
        self.cache = {}
        self.cache_expiry = {}
        
    def _generate_mock_data(self) -> Dict[str, pd.DataFrame]:
        """Generate mock historical price data for common crops"""
        crops = ["wheat", "rice", "cotton", "soybean", "maize", "sugarcane"]
        data = {}
        
        for crop in crops:
            # Generate 2 years of daily data
            dates = pd.date_range(end=datetime.now(), periods=730, freq='D')
            
            # Base price with seasonal patterns and trends
            base_price = np.random.uniform(1500, 3500)
            seasonal_pattern = 200 * np.sin(2 * np.pi * np.arange(730) / 365)  # Annual cycle
            trend = np.linspace(0, 500, 730)  # Upward trend
            noise = np.random.normal(0, 100, 730)  # Random fluctuations
            
            prices = base_price + seasonal_pattern + trend + noise
            prices = np.maximum(prices, 500)  # Minimum price floor
            
            df = pd.DataFrame({
                'date': dates,
                'price': prices,
                'crop': crop
            })
            data[crop] = df
            
        return data
    
    def _simple_arima_forecast(self, series: pd.Series, periods: int = 30) -> Tuple[np.ndarray, str]:
        """
        Simple ARIMA-like forecast using moving averages and trends
        Fallback method when statsmodels is not available
        """
        try:
            # Calculate moving averages
            ma_7 = series.rolling(window=7).mean()
            ma_30 = series.rolling(window=30).mean()
            
            # Calculate trend
            recent_trend = series[-30:] - series[-60:-30]
            avg_trend = recent_trend.mean()
            
            # Simple forecast
            last_price = series.iloc[-1]
            forecast = []
            
            for i in range(periods):
                # Combine moving average with trend
                if len(ma_7) > 0:
                    ma_component = ma_7.iloc[-1] if not pd.isna(ma_7.iloc[-1]) else last_price
                else:
                    ma_component = last_price
                    
                # Add trend component with decay
                trend_component = avg_trend * (0.9 ** i)
                
                # Add some randomness
                noise = np.random.normal(0, 50)
                
                predicted_price = ma_component + trend_component + noise
                predicted_price = max(predicted_price, 500)  # Minimum price
                
                forecast.append(predicted_price)
                
                # Update series for next iteration
                series = pd.concat([series, pd.Series([predicted_price])])
                ma_7 = series.rolling(window=7).mean()
            
            forecast_array = np.array(forecast)
            
            # Determine trend direction
            avg_forecast = forecast_array.mean()
            if avg_forecast > last_price * 1.05:
                trend = "increasing"
            elif avg_forecast < last_price * 0.95:
                trend = "decreasing"
            else:
                trend = "stable"
            
            return forecast_array, trend
            
        except Exception as e:
            logger.error(f"Simple forecast error: {e}")
            # Fallback to basic prediction
            last_price = series.iloc[-1]
            forecast = np.full(periods, last_price)
            return forecast, "stable"
    
    def predict_price(self, crop: str, days: int = 30, language: str = 'en') -> Dict:
        """
        Predict crop prices for specified number of days
        """
        cache_key = f"{crop}_{days}_{language}"
        
        # Check cache
        if cache_key in self.cache:
            if datetime.now() < self.cache_expiry.get(cache_key, datetime.now()):
                return self.cache[cache_key]
        
        try:
            # Get historical data
            if crop not in self.mock_data:
                return {
                    "error": f"Crop '{crop}' not supported",
                    "supported_crops": list(self.mock_data.keys())
                }
            
            df = self.mock_data[crop]
            prices = df['price']
            
            # Generate forecast
            forecast, trend = self._simple_arima_forecast(prices, days)
            
            # Calculate statistics
            current_price = prices.iloc[-1]
            predicted_price = forecast.mean()
            min_price = forecast.min()
            max_price = forecast.max()
            
            # Calculate confidence (simplified)
            price_volatility = prices.pct_change().std()
            confidence = max(0.5, min(0.95, 1 - price_volatility))
            
            result = {
                "crop": crop,
                "current_price": round(current_price, 2),
                "predicted_price": round(predicted_price, 2),
                "min_predicted": round(min_price, 2),
                "max_predicted": round(max_price, 2),
                "trend": trend,
                "confidence": round(confidence, 2),
                "forecast_days": days,
                "price_change": round(((predicted_price - current_price) / current_price) * 100, 2),
                "recommendation": self._get_recommendation(trend, confidence, language),
                "last_updated": datetime.now().isoformat(),
                "data_points": len(prices)
            }
            
            # Cache result for 1 hour
            self.cache[cache_key] = result
            self.cache_expiry[cache_key] = datetime.now() + timedelta(hours=1)
            
            return result
            
        except Exception as e:
            logger.error(f"Prediction error for {crop}: {e}")
            return {
                "error": "Prediction failed",
                "message": str(e)
            }
    
    def _get_recommendation(self, trend: str, confidence: float, language: str = 'en') -> dict:
        """Get trading recommendation based on trend and confidence"""
        recommendations = {
            'low_confidence': {
                'en': 'Hold - Low confidence in prediction',
                'hi': 'रोकें - भविष्यवाणी में कम विश्वास',
                'mr': 'थांबा - अंदाजावर कमी विश्वास'
            },
            'increasing': {
                'en': 'Consider selling - Prices expected to rise',
                'hi': 'बिक्री पर विचार करें - कीमतें बढ़ने की संभावना है',
                'mr': 'विक्री विचार करा - किमती वाढण्याची शक्यता आहे'
            },
            'decreasing': {
                'en': 'Consider holding - Prices expected to fall',
                'hi': 'रोकें - कीमतें गिरने की संभावना है',
                'mr': 'ठेवून ठेवा - किमती घसरणीच्या मार्गावर आहेत'
            },
            'stable': {
                'en': 'Hold - Prices expected to remain stable',
                'hi': 'रोकें - कीमतें स्थिर रहने की संभावना है',
                'mr': 'थांबा - किमती स्थिर राहण्याची शक्यता आहे'
            }
        }
        if confidence < 0.6:
            key = 'low_confidence'
        elif trend == 'increasing':
            key = 'increasing'
        elif trend == 'decreasing':
            key = 'decreasing'
        else:
            key = 'stable'
        return recommendations.get(key, recommendations['stable'])
    
    def get_supported_crops(self) -> List[str]:
        """Get list of supported crops for prediction"""
        return list(self.mock_data.keys())
    
    def get_market_summary(self, language: str = 'en') -> Dict:
        """Get summary of all crop markets"""
        summary = {}
        
        for crop in self.mock_data.keys():
            try:
                prediction = self.predict_price(crop, days=7, language=language)
                if "error" not in prediction:
                    summary[crop] = {
                        "current_price": prediction["current_price"],
                        "predicted_price": prediction["predicted_price"],
                        "trend": prediction["trend"],
                        "recommendation": prediction["recommendation"]
                    }
            except Exception as e:
                logger.error(f"Summary error for {crop}: {e}")
                continue
        
        return {
            "crops": summary,
            "total_crops": len(summary),
            "last_updated": datetime.now().isoformat()
        }

# Global predictor instance
predictor = MarketPredictor()
