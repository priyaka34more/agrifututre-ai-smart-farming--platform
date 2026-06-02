import requests
import json

print("Testing different city name variations:")

cities = [
    "Jalgaon",
    "Jalgaon, Maharashtra",
    "Jalgaon, India",
    "Jalgaon Maharashtra India"
]

for city in cities:
    print(f"\nTesting: '{city}'")
    res = requests.post('http://localhost:8000/api/v1/weather', json={"city": city})
    data = res.json()
    if data.get('data'):
        print(f"  Temperature: {data['data'].get('temperature')}°C")
        print(f"  Condition: {data['data'].get('condition')}")
        print(f"  Sunrise: {data['data'].get('sunrise')}")
        print(f"  Daily forecast count: {len(data['data'].get('daily_forecast', []))}")
        print(f"  Is fallback: {data['data'].get('is_fallback', False)}")
