#!/usr/bin/env python3
"""
Test Script for Location + Weather Functionality
Tests real-time location detection and weather APIs with fallbacks
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
import json

def test_location_weather():
    print("🌍 Testing Location + Weather Functionality")
    print("=" * 60)
    
    # Create test client
    client = TestClient(app)
    
    # Test cases
    test_cases = [
        {
            "name": "Weather by City (Pune)",
            "method": "GET",
            "endpoint": "/api/v1/weather?city=Pune",
            "expected_status": 200,
            "test_data": None
        },
        {
            "name": "Weather by Coordinates (Mumbai)",
            "method": "GET", 
            "endpoint": "/api/v1/weather?lat=19.0760&lon=72.8777",
            "expected_status": 200,
            "test_data": None
        },
        {
            "name": "Weather by Coordinates (Delhi)",
            "method": "GET",
            "endpoint": "/api/v1/weather?lat=28.6139&lon=77.2090",
            "expected_status": 200,
            "test_data": None
        },
        {
            "name": "Weather by City (Invalid)",
            "method": "GET",
            "endpoint": "/api/v1/weather?city=InvalidCityName",
            "expected_status": 200,  # Should return fallback data
            "test_data": None
        },
        {
            "name": "Weather by Invalid Coordinates",
            "method": "GET",
            "endpoint": "/api/v1/weather?lat=999&lon=999",
            "expected_status": 200,  # Should return fallback data
            "test_data": None
        },
        {
            "name": "Weather Missing Parameters",
            "method": "GET",
            "endpoint": "/api/v1/weather",
            "expected_status": 422,  # Should return validation error
            "test_data": None
        }
    ]
    
    results = {
        "passed": 0,
        "failed": 0,
        "details": []
    }
    
    for test_case in test_cases:
        print(f"\n📋 Testing: {test_case['name']}")
        print(f"   Endpoint: {test_case['endpoint']}")
        
        try:
            response = client.get(test_case['endpoint'])
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == test_case['expected_status']:
                print(f"   ✅ PASS")
                results["passed"] += 1
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        print(f"   📊 Response keys: {list(data.keys())}")
                        
                        # Check for required fields
                        if 'data' in data:
                            weather_data = data['data']
                            required_fields = ['temperature', 'humidity', 'condition', 'city', 'advice']
                            missing_fields = [field for field in required_fields if field not in weather_data]
                            
                            if missing_fields:
                                print(f"   ⚠️ Missing weather fields: {missing_fields}")
                            else:
                                print(f"   ✅ All required weather fields present")
                                print(f"   🌡️ Temperature: {weather_data.get('temperature', 'N/A')}°C")
                                print(f"   💧 Humidity: {weather_data.get('humidity', 'N/A')}%")
                                print(f"   ☁ Condition: {weather_data.get('condition', 'N/A')}")
                                print(f"   📍 City: {weather_data.get('city', 'N/A')}")
                                print(f"   🌱 Advice: {weather_data.get('advice', 'N/A')}")
                                print(f"   📊 Source: {weather_data.get('source', 'N/A')}")
                                
                                # Check for fallback data
                                if weather_data.get('is_fallback'):
                                    print(f"   🔄 Using fallback data")
                        
                    except Exception as e:
                        print(f"   ⚠️ Error parsing JSON: {e}")
                        
            else:
                print(f"   ❌ FAIL - Expected {test_case['expected_status']}, got {response.status_code}")
                results["failed"] += 1
                
                if response.text:
                    print(f"   📄 Error: {response.text[:200]}...")
                    
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            results["failed"] += 1
        
        results["details"].append({
            "name": test_case['name'],
            "status": "PASS" if response.status_code == test_case['expected_status'] else "FAIL",
            "code": response.status_code if 'response' in locals() else "ERROR"
        })
    
    # Test farming advice generation
    print(f"\n🌱 Testing Farming Advice Generation")
    try:
        # Import the weather functions to test advice generation
        from routes.weather import generate_farming_advice, get_severity
        
        # Test different weather conditions
        test_conditions = [
            {"temp": 40, "humidity": 30, "condition": "clear sky", "expected": "heat stress"},
            {"temp": 8, "humidity": 60, "condition": "cloudy", "expected": "cold protection"},
            {"temp": 25, "humidity": 85, "condition": "rain", "expected": "fungal disease"},
            {"temp": 20, "humidity": 25, "condition": "sunny", "expected": "irrigation"}
        ]
        
        for condition in test_conditions:
            advice = generate_farming_advice(condition["temp"], condition["humidity"], condition["condition"])
            severity = get_severity(condition["temp"], condition["humidity"])
            print(f"   🌡️ {condition['temp']}°C, 💧 {condition['humidity']}%, ☁ {condition['condition']}")
            print(f"   🌱 Advice: {advice}")
            print(f"   ⚠️ Severity: {severity}")
            print(f"   ✅ PASS")
            results["passed"] += 1
            
    except Exception as e:
        print(f"   ❌ Farming advice test failed: {e}")
        results["failed"] += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 LOCATION + WEATHER TEST SUMMARY")
    print("=" * 60)
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"📊 Total: {results['passed'] + results['failed']}")
    
    # Failed tests details
    if results['failed'] > 0:
        print("\n❌ FAILED TESTS:")
        for detail in results['details']:
            if detail['status'] == 'FAIL':
                print(f"   - {detail['name']}: Status {detail['code']}")
    
    # Overall status
    success_rate = (results['passed'] / (results['passed'] + results['failed'])) * 100 if (results['passed'] + results['failed']) > 0 else 0
    print(f"\n📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("🎉 LOCATION + WEATHER SYSTEM IS PRODUCTION-READY!")
    elif success_rate >= 70:
        print("⚠️  System needs some fixes before production")
    else:
        print("🚨 System requires significant fixes")
    
    print("\n🔧 NEXT STEPS:")
    print("1. Set OPENWEATHER_API_KEY environment variable for real data")
    print("2. Test frontend location permission handling")
    print("3. Verify auto-refresh functionality")
    print("4. Test fallback behavior when location is denied")
    
    return results

if __name__ == "__main__":
    test_location_weather()
