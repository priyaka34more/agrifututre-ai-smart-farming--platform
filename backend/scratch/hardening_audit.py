import requests
import os
import io
from PIL import Image

BASE_URL = "http://127.0.0.1:8003/api/v1"

def test_large_file_rejection():
    print("Testing Large File Rejection (5MB+)...")
    # Create 6MB of random data to prevent compression
    large_data = os.urandom(6 * 1024 * 1024)
    
    files = {'file': ('large.jpg', large_data, 'image/jpeg')}
    data = {'lang': 'en', 'region': 'Maharashtra'}
    
    # Needs a token (login first)
    login_res = requests.post(f"{BASE_URL}/auth/login", json={"mobile": "9075331101", "password": "admin"})
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    res = requests.post(f"{BASE_URL}/disease/predict", files=files, data=data, headers=headers)
    print(f"Result: {res.status_code} - {res.json()}")
    if res.json().get("message") == "Image too large (Max 5MB)":
        print("[SUCCESS] Correctly rejected large file.")
    else:
        print("[FAILED] Failed large file test.")

def test_news_cache():
    print("\nTesting News Cache...")
    res1 = requests.get(f"{BASE_URL}/news/")
    cache1 = res1.json().get("cache")
    
    res2 = requests.get(f"{BASE_URL}/news/")
    cache2 = res2.json().get("cache")
    
    print(f"Request 1 Cache: {cache1}")
    print(f"Request 2 Cache: {cache2}")
    if cache2 is True:
        print("[SUCCESS] News cache working!")
    else:
        print("[FAILED] News cache failed.")

def test_rbac_bypass():
    print("\nTesting RBAC Bypass...")
    res = requests.get(f"{BASE_URL}/admin/ai-stats")
    print(f"No Token Access: {res.status_code} - {res.json().get('detail')}")
    
    if res.status_code == 401:
        print("[SUCCESS] Correctly blocked unauthenticated access.")
    else:
        print("[FAILED] Failed security test.")

if __name__ == "__main__":
    try:
        test_large_file_rejection()
        test_news_cache()
        test_rbac_bypass()
    except Exception as e:
        print(f"Audit Error: {e}")
