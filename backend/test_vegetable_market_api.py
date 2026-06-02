#!/usr/bin/env python3
"""
Test Script for Vegetable Market Price API Integration
Tests the vegetablemarketprice.com integration for accurate pricing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
import json

def test_vegetable_market_api():
    print("🥬 Testing Vegetable Market Price API Integration")
    print("=" * 60)
    
    # Create test client
    client = TestClient(app)
    
    # Test cases for different crops and districts
    test_cases = [
        {
            "name": "Tomato in Pune",
            "payload": {
                "crop": "tomato",
                "state": "Maharashtra",
                "district": "Pune",
                "quantity": 1000
            }
        },
        {
            "name": "Onion in Mumbai",
            "payload": {
                "crop": "onion",
                "state": "Maharashtra", 
                "district": "Mumbai",
                "quantity": 500
            }
        },
        {
            "name": "Potato in Nashik",
            "payload": {
                "crop": "potato",
                "state": "Maharashtra",
                "district": "Nashik", 
                "quantity": 2000
            }
        },
        {
            "name": "Brinjal in Nagpur",
            "payload": {
                "crop": "brinjal",
                "state": "Maharashtra",
                "district": "Nagpur",
                "quantity": 750
            }
        },
        {
            "name": "Cabbage in Aurangabad",
            "payload": {
                "crop": "cabbage",
                "state": "Maharashtra",
                "district": "Aurangabad",
                "quantity": 1500
            }
        }
    ]
    
    results = {
        "passed": 0,
        "failed": 0,
        "details": []
    }
    
    for test_case in test_cases:
        print(f"\n📋 Testing: {test_case['name']}")
        
        try:
            response = client.post("/api/v1/market", json=test_case['payload'])
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                print(f"   ✅ PASS")
                results["passed"] += 1
                
                try:
                    data = response.json()
                    print(f"   📊 Response keys: {list(data.keys())}")
                    
                    # Check for required fields
                    required_fields = ['crop', 'location', 'current_price', 'unit', 'trend', 'forecast', 'labels']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        print(f"   ⚠️ Missing fields: {missing_fields}")
                    else:
                        print(f"   ✅ All required fields present")
                    
                    # Display key information
                    print(f"   🥬 Crop: {data.get('crop', 'N/A')}")
                    print(f"   📍 Location: {data.get('location', 'N/A')}")
                    print(f"   💰 Current Price: ₹{data.get('current_price', 0)}/kg")
                    print(f"   📈 Trend: {data.get('trend', 'N/A')}")
                    print(f"   🔮 Forecast: {data.get('forecast', [])}")
                    print(f"   📅 Best Sell Day: {data.get('best_sell_day', 'N/A')}")
                    print(f"   💵 Total Profit: ₹{data.get('total_profit', 0)}")
                    print(f"   📊 Source: {data.get('source', 'N/A')}")
                    print(f"   🎯 Confidence: {data.get('confidence', 'N/A')}")
                    print(f"   🏪 Market: {data.get('market', 'N/A')}")
                    
                    # Validate data quality
                    price = data.get('current_price', 0)
                    if price > 0 and price < 1000:  # Reasonable price range
                        print(f"   ✅ Price in reasonable range: ₹{price}/kg")
                    else:
                        print(f"   ⚠️ Price seems unusual: ₹{price}/kg")
                    
                    # Check forecast data
                    forecast = data.get('forecast', [])
                    if len(forecast) == 4:
                        print(f"   ✅ Forecast has 4 data points")
                    else:
                        print(f"   ⚠️ Forecast has {len(forecast)} data points (expected 4)")
                        
                except Exception as e:
                    print(f"   ⚠️ Error parsing JSON: {e}")
                    
            else:
                print(f"   ❌ FAIL - Expected 200, got {response.status_code}")
                results["failed"] += 1
                
                if response.text:
                    print(f"   📄 Error: {response.text[:200]}...")
                    
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            results["failed"] += 1
        
        results["details"].append({
            "name": test_case['name'],
            "status": "PASS" if response.status_code == 200 else "FAIL",
            "code": response.status_code if 'response' in locals() else "ERROR"
        })
    
    # Test vegetable market service directly
    print(f"\n🔧 Testing Vegetable Market Service Directly")
    try:
        from services.vegetable_market_service import vegetable_market_service
        
        # Test the service directly
        print(f"   📊 Testing tomato price in Pune...")
        price_data = vegetable_market_service.get_market_price('tomato', 'pune')
        
        if price_data:
            print(f"   ✅ Service returned data")
            print(f"   💰 Price: ₹{price_data.get('current_price', 0)}/kg")
            print(f"   📊 Source: {price_data.get('source', 'N/A')}")
            print(f"   🎯 Confidence: {price_data.get('confidence', 'N/A')}")
            results["passed"] += 1
        else:
            print(f"   ❌ Service returned no data")
            results["failed"] += 1
            
    except Exception as e:
        print(f"   ❌ Service test failed: {e}")
        results["failed"] += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 VEGETABLE MARKET API TEST SUMMARY")
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
    
    if success_rate >= 80:
        print("🎉 VEGETABLE MARKET API INTEGRATION IS WORKING!")
    elif success_rate >= 60:
        print("⚠️  Integration needs some improvements")
    else:
        print("🚨 Integration requires significant fixes")
    
    print("\n🔧 NEXT STEPS:")
    print("1. Test with real vegetablemarketprice.com data")
    print("2. Verify price accuracy against actual market rates")
    print("3. Monitor API response times and reliability")
    print("4. Consider adding more crops and districts")
    
    return results

if __name__ == "__main__":
    test_vegetable_market_api()
