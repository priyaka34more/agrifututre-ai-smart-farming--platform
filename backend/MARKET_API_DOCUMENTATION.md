# 🌾 Enhanced Market API Documentation

## 📋 Overview

The Enhanced Market API provides production-level market price forecasting with real mandi data, ARIMA predictions, and comprehensive profit analysis.

## 🚀 Features

- ✅ **Real Mandi Data**: Authentic market prices from major agricultural mandis
- ✅ **₹/kg Conversion**: Proper unit conversion from ₹/quintal to ₹/kg
- ✅ **ARIMA Forecasting**: Statistical time series prediction for 4 days
- ✅ **Trend Analysis**: Rising 📈, Falling 📉, Stable ➖ indicators
- ✅ **Best Selling Time**: Optimal selling recommendations
- ✅ **Profit Estimation**: Complete profit analysis with ROI calculations
- ✅ **Failsafe System**: Never returns "Not Found" - always provides usable data
- ✅ **Performance Caching**: 10-minute cache for optimal performance
- ✅ **Multi-Crop Support**: Onion, Tomato, Wheat, Rice

## 📡 API Endpoints

### Base URL
```
http://localhost:8001/api/v1/market
```

### 1. Get Market Prediction
**Endpoint:** `GET /predict`

**Description:** Get comprehensive market price prediction with ARIMA forecasting

**Parameters:**
- `crop` (required): Crop name (onion, tomato, wheat, rice)
- `quantity_kg` (optional): Quantity in kg for profit calculation (default: 1000)

**Example Request:**
```
GET /api/v1/market/predict?crop=onion&quantity_kg=1000
```

**Example Response:**
```json
{
  "crop": "Onion",
  "location": "Jalgaon",
  "current_price": 48.3,
  "unit": "₹/kg",
  "trend": "Rising 📈",
  "forecast": [48.5, 49.2, 50.1, 51.0],
  "labels": ["Today", "Tomorrow", "Day 3", "Day 4"],
  "best_sell_day": "Day 4",
  "max_price": 51.0,
  "profit_per_kg": 2.7,
  "total_profit": 2700,
  "sell_recommendation": "Best to sell in Day 4",
  "data_points": 120,
  "last_updated": "2024-05-05T15:30:00",
  "confidence": "high"
}
```

### 2. Get Market Summary
**Endpoint:** `GET /summary`

**Description:** Get summary of all crop market predictions

**Example Request:**
```
GET /api/v1/market/summary
```

**Example Response:**
```json
{
  "crops": {
    "onion": {
      "current_price": 48.3,
      "trend": "Rising 📈",
      "best_sell_day": "Day 4",
      "profit_per_kg": 2.7
    },
    "tomato": {
      "current_price": 26.9,
      "trend": "Stable ➖",
      "best_sell_day": "Day 3",
      "profit_per_kg": 1.2
    }
  },
  "total_crops": 4,
  "last_updated": "2024-05-05T15:30:00",
  "data_source": "real_mandi_data"
}
```

### 3. Get Supported Crops
**Endpoint:** `GET /crops`

**Description:** Get list of supported crops for market prediction

**Example Request:**
```
GET /api/v1/market/crops
```

**Example Response:**
```json
{
  "supported_crops": ["Onion", "Tomato", "Wheat", "Rice"],
  "total_crops": 4,
  "examples": ["onion", "tomato", "wheat", "rice"],
  "note": "Use crop names in lowercase",
  "data_source": "real_mandi_data",
  "price_unit": "₹/kg"
}
```

### 4. Health Check
**Endpoint:** `GET /health`

**Description:** Health check for enhanced market prediction service

**Example Request:**
```
GET /api/v1/market/health
```

**Example Response:**
```json
{
  "status": "healthy",
  "service": "enhanced_market_predictor",
  "data_loaded": true,
  "data_records": 180,
  "supported_crops": 4,
  "statsmodels_available": true,
  "cache_entries": 12,
  "test_prediction_success": true,
  "last_updated": "2024-05-05T15:30:00"
}
```

### 5. Get Crop Forecast
**Endpoint:** `GET /forecast/{crop}`

**Description:** Get detailed forecast for a specific crop

**Parameters:**
- `crop` (path): Crop name
- `days` (query): Number of days to forecast (1-7, default: 4)

**Example Request:**
```
GET /api/v1/market/forecast/onion?days=4
```

### 6. Get Profit Analysis
**Endpoint:** `GET /profit/{crop}`

**Description:** Get detailed profit analysis for a crop

**Parameters:**
- `crop` (path): Crop name
- `quantity_kg` (query): Quantity in kg (default: 1000)
- `target_days` (query): Target days for profit calculation (1-7, default: 4)

**Example Request:**
```
GET /api/v1/market/profit/onion?quantity_kg=1000&target_days=4
```

**Example Response:**
```json
{
  "crop": "Onion",
  "quantity_kg": 1000,
  "current_price": 48.3,
  "unit": "₹/kg",
  "profit_analysis": {
    "best_case": {
      "price_per_kg": 51.0,
      "total_profit": 2700,
      "roi_percentage": 5.59,
      "sell_day": "Day 4"
    },
    "worst_case": {
      "price_per_kg": 48.5,
      "total_profit": 200,
      "roi_percentage": 0.41,
      "sell_day": "Today"
    },
    "recommended": {
      "price_per_kg": 51.0,
      "total_profit": 2700,
      "roi_percentage": 5.59,
      "sell_day": "Day 4"
    }
  },
  "market_trend": "Rising 📈",
  "confidence": "high",
  "last_updated": "2024-05-05T15:30:00"
}
```

## 📊 Response Fields Explained

### Core Fields
- `crop`: Crop name (capitalized)
- `location`: Mandi location
- `current_price`: Current market price in ₹/kg
- `unit`: Price unit (always "₹/kg")
- `trend`: Market trend with emoji (Rising 📈, Falling 📉, Stable ➖)

### Forecast Fields
- `forecast`: Array of 4 predicted prices in ₹/kg
- `labels`: Time labels ["Today", "Tomorrow", "Day 3", "Day 4"]
- `best_sell_day`: Optimal selling day
- `max_price`: Highest predicted price

### Profit Fields
- `profit_per_kg`: Profit per kg in ₹
- `total_profit`: Total profit for specified quantity
- `sell_recommendation`: Actionable selling advice

### Meta Fields
- `data_points`: Number of historical data points used
- `confidence`: Prediction confidence (high/medium/low)
- `last_updated`: Last update timestamp

## 🔧 Usage Examples

### Frontend Integration

```javascript
// Get market prediction for Onion
async function getMarketPrediction() {
  try {
    const response = await fetch('/api/v1/market/predict?crop=onion&quantity_kg=1000');
    const data = await response.json();
    
    console.log(`Current Price: ₹${data.current_price}/kg`);
    console.log(`Trend: ${data.trend}`);
    console.log(`Best Sell Day: ${data.best_sell_day}`);
    console.log(`Expected Profit: ₹${data.total_profit}`);
    
    return data;
  } catch (error) {
    console.error('Market prediction error:', error);
  }
}
```

### Python Integration

```python
import requests

def get_market_prediction(crop, quantity_kg=1000):
    url = f"http://localhost:8001/api/v1/market/predict"
    params = {"crop": crop, "quantity_kg": quantity_kg}
    
    response = requests.get(url, params=params)
    data = response.json()
    
    print(f"Current Price: ₹{data['current_price']}/kg")
    print(f"Trend: {data['trend']}")
    print(f"Forecast: {data['forecast']}")
    print(f"Best Sell Day: {data['best_sell_day']}")
    print(f"Total Profit: ₹{data['total_profit']}")
    
    return data

# Usage
prediction = get_market_prediction("onion", 1000)
```

## 🛡️ Error Handling

The API includes comprehensive error handling and fallback mechanisms:

- **400 Bad Request**: Invalid crop name or parameters
- **500 Internal Server Error**: Service issues (rare)
- **Failsafe Data**: Always returns usable market data, never "Not Found"

### Fallback Response Example
```json
{
  "crop": "Unknown",
  "location": "Major Mandi",
  "current_price": 25.0,
  "unit": "₹/kg",
  "trend": "Stable ➖",
  "forecast": [25.2, 25.5, 25.7, 26.0],
  "labels": ["Today", "Tomorrow", "Day 3", "Day 4"],
  "best_sell_day": "Day 4",
  "max_price": 26.0,
  "profit_per_kg": 1.0,
  "total_profit": 1000,
  "sell_recommendation": "Hold for better prices",
  "data_points": 30,
  "last_updated": "2024-05-05T15:30:00",
  "confidence": "low",
  "note": "Using last available data"
}
```

## 🚀 Performance Features

### Caching
- **Cache Duration**: 10 minutes
- **Cache Key**: `{crop}_{quantity_kg}`
- **Automatic Cache Invalidation**: Time-based expiry

### Data Optimization
- **Lazy Loading**: Data loaded on first request
- **Memory Efficient**: Optimized data structures
- **Fast Response**: < 100ms typical response time

## 📈 Data Sources

### Primary Data
- **Mandi Prices**: Real agricultural market data
- **Historical Data**: 6+ months of price history
- **Major Mandis**: Jalgaon, Kolar, Delhi, Punjab

### Fallback Data
- **Synthetic Data**: Generated when real data unavailable
- **Realistic Patterns**: Seasonal trends and price movements
- **Minimum Viable**: Always provides usable predictions

## 🔍 Testing

### Health Check
```bash
curl http://localhost:8001/api/v1/market/health
```

### Sample Prediction
```bash
curl "http://localhost:8001/api/v1/market/predict?crop=onion&quantity_kg=1000"
```

### Market Summary
```bash
curl http://localhost:8001/api/v1/market/summary
```

## 🎯 Production Ready Features

- ✅ **Real Data**: Authentic mandi prices
- ✅ **Correct Units**: ₹/kg conversion
- ✅ **ARIMA Model**: Statistical forecasting
- ✅ **Trend Analysis**: Emoji indicators
- ✅ **Profit Analysis**: Complete ROI calculations
- ✅ **Best Timing**: Optimal selling recommendations
- ✅ **Failsafe**: Never returns "Not Found"
- ✅ **Caching**: Performance optimization
- ✅ **Multi-Crop**: 4 major crops supported
- ✅ **Health Checks**: Monitoring endpoints
- ✅ **Error Handling**: Comprehensive fallbacks
- ✅ **Documentation**: Complete API docs

## 📞 Support

For issues or questions:
1. Check the health endpoint: `/api/v1/market/health`
2. Verify crop names: `/api/v1/market/crops`
3. Review logs for detailed error information
4. Test with different quantities and crops

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2024-05-05
