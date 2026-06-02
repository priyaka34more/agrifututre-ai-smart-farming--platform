import pandas as pd
import os
import logging

logger = logging.getLogger("DiseaseDB")

DISEASE_DB = {}

def load_disease_db():
    global DISEASE_DB

    try:
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        csv_path = os.path.join(
            base_path,
            "data",
            "Indian_Crop_Disease_Dataset_Hindi_and_Marathi_NLP.csv"
        )

        df = pd.read_csv(csv_path)

        # Convert CSV → dictionary (fast lookup)
        for _, row in df.iterrows():
            disease = str(row.get("disease", "")).strip().lower()

            DISEASE_DB[disease] = {
                "medicine": row.get("medicine"),
                "dosage": row.get("dosage"),
                "prevention": row.get("prevention"),
                "hindi": row.get("hindi"),
                "marathi": row.get("marathi"),
            }

        logger.info("Disease DB loaded: %s records", len(DISEASE_DB))

    except Exception as e:
        logger.error("CSV load error: %s", e)