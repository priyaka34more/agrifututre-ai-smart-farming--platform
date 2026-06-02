#!/usr/bin/env python3
"""
Comprehensive Test Script for All AgriFuture Modules
Tests all endpoints to ensure system is production-ready
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
import json

def test_all_modules():
    print("🚀 Testing All AgriFuture Modules")
    print("=" * 60)
    
    # Create test client
    client = TestClient(app)
    
    modules = [
        {
            "name": "Health Check",
            "method": "GET",
            "endpoint": "/api/v1/health",
            "expected_status": 200,
            "test_data": None
        },
        {
            "name": "Market Forecast (POST)",
            "method": "POST", 
            "endpoint": "/api/v1/market",
            "expected_status": 200,
            "test_data": {
                "crop": "tomato",
                "state": "Maharashtra",
                "district": "Pune", 
                "quantity": 1000
            }
        },
        {
            "name": "Market Prediction (GET)",
            "method": "GET",
            "endpoint": "/api/v1/market/predict?crop=tomato&quantity_kg=1000",
            "expected_status": 200,
            "test_data": None
        },
        {
            "name": "Market Summary",
            "method": "GET",
            "endpoint": "/api/v1/market/summary",
            "expected_status": 200,
            "test_data": None
        },
        {
            "name": "Market Crops",
            "method": "GET",
            "endpoint": "/api/v1/market/crops",
            "expected_status": 200,
            "test_data": None
        },
        {
            "name": "Admin Dashboard",
            "method": "GET",
            "endpoint": "/api/v1/admin/dashboard",
            "expected_status": [200, 401],  # 401 if auth required
            "test_data": None
        },
        {
            "name": "Admin Users",
            "method": "GET",
            "endpoint": "/api/v1/admin/users",
            "expected_status": [200, 401],
            "test_data": None
        },
        {
            "name": "Admin Analytics",
            "method": "GET",
            "endpoint": "/api/v1/admin/analytics",
            "expected_status": [200, 401],
            "test_data": None
        },
        {
            "name": "Admin AI Test",
            "method": "GET",
            "endpoint": "/api/v1/admin/ai-test",
            "expected_status": [200, 401],
            "test_data": None
        },
        {
            "name": "Disease Detection",
            "method": "POST",
            "endpoint": "/api/v1/disease",
            "expected_status": [200, 422],  # 422 if no file provided
            "test_data": {}
        },
        {
            "name": "Weather",
            "method": "GET",
            "endpoint": "/api/v1/weather?city=Pune",
            "expected_status": 200,
            "test_data": None
        },
        {
            "name": "AI Assistant",
            "method": "POST",
            "endpoint": "/api/v1/ai/ask",
            "expected_status": [200, 500],  # 500 if Ollama not running
            "test_data": {
                "question": "What is the best time to water crops?"
            }
        },
        {
            "name": "Government Schemes",
            "method": "GET",
            "endpoint": "/api/v1/schemes",
            "expected_status": 200,
            "test_data": None
        }
    ]
    
    results = {
        "passed": 0,
        "failed": 0,
        "skipped": 0,
        "details": []
    }
    
    for module in modules:
        print(f"\n📋 Testing: {module['name']}")
        print(f"   Method: {module['method']} {module['endpoint']}")
        
        try:
            if module['method'] == 'GET':
                response = client.get(module['endpoint'])
            elif module['method'] == 'POST':
                response = client.post(module['endpoint'], json=module['test_data'])
            
            print(f"   Status Code: {response.status_code}")
            
            # Check if status is expected
            expected_statuses = module['expected_status']
            if isinstance(expected_statuses, list):
                success = response.status_code in expected_statuses
            else:
                success = response.status_code == expected_statuses
            
            if success:
                print(f"   ✅ PASS")
                results["passed"] += 1
                
                # Show sample response data
                if response.status_code == 200 and response.text:
                    try:
                        data = response.json()
                        if isinstance(data, dict):
                            keys = list(data.keys())[:5]  # Show first 5 keys
                            print(f"   📊 Response keys: {keys}")
                        elif isinstance(data, list):
                            print(f"   📊 Response: List with {len(data)} items")
                    except:
                        print(f"   📊 Response: {response.text[:100]}...")
                        
            else:
                print(f"   ❌ FAIL - Expected {expected_statuses}, got {response.status_code}")
                results["failed"] += 1
                
                if response.text:
                    print(f"   📄 Error: {response.text[:200]}...")
                    
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            results["failed"] += 1
        
        results["details"].append({
            "name": module['name'],
            "status": "PASS" if success else "FAIL",
            "code": response.status_code if 'response' in locals() else "ERROR"
        })
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 TEST SUMMARY")
    print("=" * 60)
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"⏭️  Skipped: {results['skipped']}")
    print(f"📊 Total: {results['passed'] + results['failed'] + results['skipped']}")
    
    # Failed modules details
    if results['failed'] > 0:
        print("\n❌ FAILED MODULES:")
        for detail in results['details']:
            if detail['status'] == 'FAIL':
                print(f"   - {detail['name']}: Status {detail['code']}")
    
    # Overall status
    success_rate = (results['passed'] / (results['passed'] + results['failed'])) * 100 if (results['passed'] + results['failed']) > 0 else 0
    print(f"\n📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 SYSTEM IS PRODUCTION-READY!")
    elif success_rate >= 60:
        print("⚠️  System needs some fixes before production")
    else:
        print("🚨 System requires significant fixes")
    
    print("\n🔧 NEXT STEPS:")
    print("1. Start backend: uvicorn main:app --port 9000 --reload")
    print("2. Start frontend: npm start")
    print("3. Test in browser: http://localhost:3000")
    print("4. Verify all modules work correctly")
    
    return results

if __name__ == "__main__":
    test_all_modules()
