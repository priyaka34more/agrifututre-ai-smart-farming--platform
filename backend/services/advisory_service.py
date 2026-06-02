import pandas as pd
import os

# Load CSV once (important for performance)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "advisory.csv")

df = pd.read_csv(CSV_PATH)

def get_advisory(disease_name: str):
    try:
        result = df[
        df["disease"].str.lower()
        == disease_name.lower()
]
        
        if result.empty:
            return None
        
        row = result.iloc[0]

        return {
            "disease": row["disease"],
            "crop": row["crop"],

            "problem": {
                "en": row["problem_en"],
                "hi": row["problem_hi"],
                "mr": row["problem_mr"],
            },

            "action": {
                "en": row["action_en"],
                "hi": row["action_hi"],
                "mr": row["action_mr"],
            },

            "medicine": {
                "en": row["medicine_en"],
                "hi": row["medicine_hi"],
                "mr": row["medicine_mr"],
            },

            "dosage": row["dosage"],

            "prevention": {
                "en": row["prevention_en"],
                "hi": row["prevention_hi"],
                "mr": row["prevention_mr"],
            },

            "soil_condition": row["soil_condition"],
            "root_health": row["root_health"],
            "weather_effect": row["weather_effect"],

            "farmer_tip": {
                "en": row["farmer_tip_en"],
                "hi": row["farmer_tip_hi"],
                "mr": row["farmer_tip_mr"],
            },

            "urgency": row["urgency_level"],
            "confidence_level": row["confidence_level"],

            "quick_advice": {
                "en": row["quick_advice_en"],
                "hi": row["quick_advice_hi"],
                "mr": row["quick_advice_mr"],
            },

            "organic_solution": {
                "en": row["organic_solution_en"],
                "hi": row["organic_solution_hi"],
                "mr": row["organic_solution_mr"],
            }
        }

    except Exception:
        return None