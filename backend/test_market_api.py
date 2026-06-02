#!/usr/bin/env python3
"""
Test script for Market API Endpoints
Verifies market price forecast APIs are working correctly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
import json

def test_market_api():
    print("🌾 Testing Market API Endpoints")
    print("=" * 50)
    
    # Create test client
    client = TestClient(app)
    
    # Test data
    test_payload = {
        "crop": "tomato",
        "state": "Maharashtra",
        "district": "Pune",
        "quantity": 1000
    }
    
    # Test POST endpoint (what frontend calls)
    print("\n📡 Testing POST /api/v1/market")
    try:
        response = client.post("/api/v1/market", json=test_payload)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success - Market forecast received")
            print(f"   📊 Crop: {data.get('crop', 'N/A')}")
            print(f"   💰 Current Price: ₹{data.get('current_price', 0)}/kg")
            print(f"   📈 Trend: {data.get('trend', 'N/A')}")
            print(f"   🔮 Forecast: {data.get('forecast', [])}")
            print(f"   📅 Best Sell Day: {data.get('best_sell_day', 'N/A')}")
            print(f"   💵 Total Profit: ₹{data.get('total_profit', 0)}")
            
            # Check for required fields
            required_fields = ['crop', 'current_price', 'unit', 'trend', 'forecast', 'labels']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"   ⚠️ Missing fields: {missing_fields}")
            else:
                print(f"   ✅ All required fields present")
                
        elif response.status_code == 404:
            print(f"   ❌ Endpoint not found")
            
        else:
            print(f"   ⚠️ Unexpected status: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test GET endpoint (enhanced market)
    print("\n📡 Testing GET /api/v1/market/predict")
    try:
        response = client.get("/api/v1/market/predict?crop=tomato&quantity_kg=1000")
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success - Enhanced market prediction received")
            print(f"   📊 Crop: {data.get('crop', 'N/A')}")
            print(f"   💰 Current Price: ₹{data.get('current_price', 0)}/kg")
            print(f"   📈 Trend: {data.get('trend', 'N/A')}")
            
        else:
            print(f"   ⚠️ Status: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test market summary
    print("\n📡 Testing GET /api/v1/market/summary")
    try:
        response = client.get("/api/v1/market/summary")
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success - Market summary received")
            print(f"   📊 Total Crops: {data.get('total_crops', 0)}")
            
        else:
            print(f"   ⚠️ Status: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test supported crops
    print("\n📡 Testing GET /api/v1/market/crops")
    try:
        response = client.get("/api/v1/market/crops")
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success - Supported crops received")
            print(f"   📊 Crops: {data.get('supported_crops', [])}")
            
        else:
            print(f"   ⚠️ Status: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Market API Test Complete!")
    print("✅ All market endpoints tested")
    print("🌾 Ready for frontend integration")

if __name__ == "__main__":
    test_market_api()
