import requests
import json

print("Test 1: Get weather by location (lat/lon)")
res1 = requests.get('http://localhost:8000/api/v1/weather?lat=21.1458&lon=75.8385')
data1 = res1.json()
print(f"Status: {data1.get('status')}")
print(f"Has sunrise: {'sunrise' in data1.get('data', {})}")
print(f"Has sunset: {'sunset' in data1.get('data', {})}")
print(f"Has daily_forecast: {'daily_forecast' in data1.get('data', {})}")
if data1.get('data'):
    print(f"Sunrise value: {data1['data'].get('sunrise')}")
    print(f"Sunset value: {data1['data'].get('sunset')}")
    print(f"Daily forecast length: {len(data1['data'].get('daily_forecast', []))}")
print()

print("Test 2: Get weather by city (POST)")
res2 = requests.post('http://localhost:8000/api/v1/weather', json={"city": "Jalgaon, Maharashtra"})
data2 = res2.json()
print(f"Status: {data2.get('status')}")
print(f"Has sunrise: {'sunrise' in data2.get('data', {})}")
print(f"Has sunset: {'sunset' in data2.get('data', {})}")
print(f"Has daily_forecast: {'daily_forecast' in data2.get('data', {})}")
if data2.get('data'):
    print(f"Sunrise value: {data2['data'].get('sunrise')}")
    print(f"Sunset value: {data2['data'].get('sunset')}")
    print(f"Daily forecast length: {len(data2['data'].get('daily_forecast', []))}")
print()

print("Test 3: Full data for city-based call")
print(json.dumps(data2.get('data', {}), indent=2))

