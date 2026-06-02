import sys
import os
sys.path.append('.')

try:
    from services.enhanced_market_predictor import enhanced_predictor
    print("✅ Enhanced predictor imported successfully")
    
    # Test basic functionality
    crops = enhanced_predictor.get_supported_crops()
    print(f"✅ Supported crops: {crops}")
    
    # Test prediction
    result = enhanced_predictor.predict_market_price('onion', 1000)
    print(f"✅ Prediction generated for {result['crop']}")
    print(f"   Current price: ₹{result['current_price']}/kg")
    print(f"   Trend: {result['trend']}")
    print(f"   Forecast: {result['forecast']}")
    print(f"   Best sell day: {result['best_sell_day']}")
    print(f"   Profit: ₹{result['total_profit']}")
    
    print("✅ All tests passed!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
