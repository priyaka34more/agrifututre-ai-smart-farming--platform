from sqlalchemy import text
import os
import json
from database import engine

# =====================================================
# 🌱 GET ADVISORY
# =====================================================

def get_advisory(
    disease_name,
    lang="en"
):

    try:
        # =============================================
        # DATABASE CONNECT WITH SQLALCHEMY
        # =============================================
        with engine.connect() as conn:
            # =============================================
            # GET JSON ADVISORY
            # =============================================
            result = conn.execute(
                text("SELECT advisory_json FROM advisory_knowledge WHERE disease_name = :disease_name"),
                {"disease_name": disease_name}
            )
            row = result.fetchone()

        # =============================================
        # ❌ NO DATA FOUND
        # =============================================
        if not row:

            return {

                "problem":
                "No advisory found",

                "medicine":
                "Consult agriculture expert",

                "dosage":
                "N/A",

                "fertilizer":
                "Balanced NPK recommended",

                "root_condition":
                "Unknown",

                "soil_condition":
                "Monitor soil health",

                "weather_effect":
                "Weather may affect spread",

                "prevention":
                "Monitor crop regularly",

                "farmer_tip":
                "Upload clearer image if needed"
            }

        # =============================================
        # ✅ LOAD JSON
        # =============================================

        advisory_data = json.loads(
            row[0]
        )

        # =============================================
        # 🌍 SAFE MULTILINGUAL GETTER
        # =============================================

        def get_lang_value(field_name):

            field = advisory_data.get(
                field_name,
                {}
            )

            # MULTILINGUAL FIELD

            if isinstance(field, dict):

                return field.get(
                    lang,
                    field.get(
                        "en",
                        "N/A"
                    )
                )

            # NORMAL FIELD

            return field

        # =============================================
        # ✅ RETURN MULTILINGUAL DATA
        # =============================================

        return {

            "problem":
            get_lang_value("problem"),

            "medicine":
            get_lang_value("medicine"),

            "dosage":
            get_lang_value("dosage"),

            "fertilizer":
            get_lang_value("fertilizer"),

            "root_condition":
            get_lang_value("root_condition"),

            "soil_condition":
            get_lang_value("soil_condition"),

            "weather_effect":
            get_lang_value("weather_effect"),

            "prevention":
            get_lang_value("prevention"),

            "farmer_tip":
            get_lang_value("farmer_tip")
        }

    # =============================================
    # ❌ DATABASE ERROR
    # =============================================

    except Exception as e:

        return {

            "problem":
            f"Database error: {str(e)}",

            "medicine":
            "N/A",

            "dosage":
            "N/A",

            "fertilizer":
            "N/A",

            "root_condition":
            "N/A",

            "soil_condition":
            "N/A",

            "weather_effect":
            "N/A",

            "prevention":
            "N/A",

            "farmer_tip":
            "System error occurred"
        }