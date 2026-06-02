from config.crops import CROPS


def get_sell_decision(crop, forecast_data, quantity=0, lang="en"):
    current_price = forecast_data["current_price"]
    forecast = forecast_data["forecast"]
    trend = forecast_data["trend"]
    risk = forecast_data["risk"]

    best_day = 0
    best_price = current_price

    for i, price in enumerate(forecast):
        if price > best_price:
            best_price = price
            best_day = i + 1

    extra_profit_per_kg = round(best_price - current_price, 2)
    total_profit = round(extra_profit_per_kg * float(quantity or 0), 2)

    perish = CROPS.get(crop.lower(), {}).get("perishability", "medium")
    if perish == "high" and best_day > 2:
        best_day = 1

    advice = (
        "Sell today" if best_day == 0
        else f"Wait {best_day} days for better price"
    )

    return {
        "best_sell_day": best_day,
        "best_price": best_price,
        "extra_profit_per_kg": extra_profit_per_kg,
        "total_profit": total_profit,
        "trend": trend,
        "risk": risk,
        "advice": advice
    }