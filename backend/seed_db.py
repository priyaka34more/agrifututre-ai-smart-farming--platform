import requests
import time

def seed():
    url = "http://127.0.0.1:8001/api/v1/schemes/seed"
    print(f"🌱 Attempting to seed database at {url}...")
    try:
        response = requests.post(url)
        if response.status_code == 200:
            print("✅ Database seeded successfully!")
            print("Response:", response.json())
        else:
            print(f"❌ Failed to seed. Status: {response.status_code}")
            print("Response:", response.text)
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")

if __name__ == "__main__":
    seed()
