import requests

BASE_URL = "http://127.0.0.1:8001/api/v1"

def test_admin_flow():
    print("Testing Admin Login...")
    login_data = {
        "mobile": "9075331101",
        "password": "admin"
    }
    try:
        res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if res.status_code == 200:
            data = res.json()
            token = data["data"]["access_token"]
            role = data["data"]["role"]
            print(f"Login Success! Role: {role}")
            
            print("Testing Admin Stats...")
            headers = {"Authorization": f"Bearer {token}"}
            stats_res = requests.get(f"{BASE_URL}/admin/ai-stats", headers=headers)
            if stats_res.status_code == 200:
                print("Stats retrieved successfully!")
                print(stats_res.json()["data"])
            else:
                print(f"Stats failed: {stats_res.text}")
                
            print("Testing News Merge...")
            news_res = requests.get(f"{BASE_URL}/news/")
            if news_res.status_code == 200:
                print(f"News retrieved! Total items: {len(news_res.json()['data'])}")
            else:
                print(f"News failed: {news_res.text}")
        else:
            print(f"Login failed: {res.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_admin_flow()
