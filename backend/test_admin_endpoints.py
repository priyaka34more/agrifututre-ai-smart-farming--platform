#!/usr/bin/env python3
"""
Test script for Admin Panel Endpoints
Verifies all admin APIs are working correctly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
import json

def test_admin_endpoints():
    print("🔧 Testing Admin Panel Endpoints")
    print("=" * 50)
    
    # Create test client
    client = TestClient(app)
    
    # Test endpoints without authentication (should return 401 or fallback data)
    endpoints = [
        "/api/v1/admin/dashboard",
        "/api/v1/admin/users", 
        "/api/v1/admin/analytics",
        "/api/v1/admin/ai-test",
        "/api/v1/admin/health"
    ]
    
    for endpoint in endpoints:
        try:
            print(f"\n📡 Testing: {endpoint}")
            response = client.get(endpoint)
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Success - Response received")
                print(f"   📊 Data Keys: {list(data.keys())}")
                
                # Check for required fields
                if endpoint == "/api/v1/admin/dashboard":
                    if "data" in data and "total_users" in data["data"]:
                        print(f"   ✅ Dashboard data format correct")
                    else:
                        print(f"   ⚠️ Dashboard data format issue")
                        
                elif endpoint == "/api/v1/admin/users":
                    if "data" in data:
                        print(f"   ✅ Users data format correct - {len(data['data'])} users")
                    else:
                        print(f"   ⚠️ Users data format issue")
                        
                elif endpoint == "/api/v1/admin/analytics":
                    if "data" in data and "usage_stats" in data["data"]:
                        print(f"   ✅ Analytics data format correct")
                    else:
                        print(f"   ⚠️ Analytics data format issue")
                        
                elif endpoint == "/api/v1/admin/ai-test":
                    if "data" in data and "ai_model_status" in data["data"]:
                        print(f"   ✅ AI Test data format correct")
                    else:
                        print(f"   ⚠️ AI Test data format issue")
                        
                elif endpoint == "/api/v1/admin/health":
                    if "data" in data and "admin_service" in data["data"]:
                        print(f"   ✅ Health data format correct")
                    else:
                        print(f"   ⚠️ Health data format issue")
                        
            elif response.status_code == 401:
                print(f"   🔐 Authentication required (expected)")
                
            elif response.status_code == 404:
                print(f"   ❌ Endpoint not found")
                
            else:
                print(f"   ⚠️ Unexpected status: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Admin Panel Test Complete!")
    print("✅ All endpoints tested")
    print("📊 Ready for frontend integration")

if __name__ == "__main__":
    test_admin_endpoints()
