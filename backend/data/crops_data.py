CROPS_DATA = {
    "Wheat": {
        "base_yield_per_acre": 1400,
        "ideal_rainfall": (400, 800),
        "ideal_temp": (15, 25),
        "default_price": 28,
        "fertilizer": {
            "type": "NPK 20:20:0 + Urea",
            "quantity_per_acre": "40-50 kg basal + 25-30 kg Urea top dressing",
            "timing": "Basal at sowing, Urea at 25-30 days after sowing",
            "organic_support": "Add 1-2 tons FYM or compost before sowing"
        },
        "better_alternative": "Gram (Chana)",
        "soil_bonus": ["Alluvial Soil", "Loamy Soil", "Clay Soil"]
    },

    "Rice": {
        "base_yield_per_acre": 1800,
        "ideal_rainfall": (1000, 2000),
        "ideal_temp": (20, 35),
        "default_price": 24,
        "fertilizer": {
            "type": "DAP + Urea + Potash",
            "quantity_per_acre": "50-60 kg DAP + 35-45 kg Urea + 15-20 kg MOP",
            "timing": "Basal before transplanting, split Urea in 2-3 doses",
            "organic_support": "Use green manure or 2 tons compost if available"
        },
        "better_alternative": "Maize",
        "soil_bonus": ["Clay Soil", "Alluvial Soil", "Loamy Soil"]
    },

    "Maize": {
        "base_yield_per_acre": 1600,
        "ideal_rainfall": (500, 900),
        "ideal_temp": (18, 32),
        "default_price": 22,
        "fertilizer": {
            "type": "NPK 20:20:0 + Urea",
            "quantity_per_acre": "40-50 kg basal + 25-30 kg Urea",
            "timing": "Basal at sowing, top dressing at knee-high stage",
            "organic_support": "Apply 1-2 tons compost before sowing"
        },
        "better_alternative": "Bajra",
        "soil_bonus": ["Loamy Soil", "Alluvial Soil", "Black Soil"]
    },

    "Bajra": {
        "base_yield_per_acre": 900,
        "ideal_rainfall": (300, 600),
        "ideal_temp": (25, 35),
        "default_price": 30,
        "fertilizer": {
            "type": "NPK 18:18:18 / Urea",
            "quantity_per_acre": "25-30 kg basal + 15-20 kg Urea",
            "timing": "Basal at sowing, top dressing after 20-25 days",
            "organic_support": "Use compost if soil is poor"
        },
        "better_alternative": "Jowar",
        "soil_bonus": ["Sandy Soil", "Black Soil", "Red Soil"]
    },

    "Jowar": {
        "base_yield_per_acre": 1000,
        "ideal_rainfall": (400, 700),
        "ideal_temp": (24, 32),
        "default_price": 28,
        "fertilizer": {
            "type": "NPK + Urea",
            "quantity_per_acre": "30-40 kg basal + 15-20 kg Urea",
            "timing": "At sowing and 25 days after sowing",
            "organic_support": "Add farmyard manure for moisture retention"
        },
        "better_alternative": "Bajra",
        "soil_bonus": ["Black Soil", "Red Soil", "Loamy Soil"]
    },

    "Gram (Chana)": {
        "base_yield_per_acre": 800,
        "ideal_rainfall": (400, 700),
        "ideal_temp": (18, 30),
        "default_price": 60,
        "fertilizer": {
            "type": "DAP + Biofertilizer (Rhizobium)",
            "quantity_per_acre": "35-45 kg DAP + seed treatment with Rhizobium",
            "timing": "Basal at sowing",
            "organic_support": "Use compost before sowing"
        },
        "better_alternative": "Wheat",
        "soil_bonus": ["Black Soil", "Alluvial Soil", "Loamy Soil"]
    },

    "Tur (Arhar)": {
        "base_yield_per_acre": 700,
        "ideal_rainfall": (600, 1000),
        "ideal_temp": (20, 35),
        "default_price": 75,
        "fertilizer": {
            "type": "DAP + SSP",
            "quantity_per_acre": "30-40 kg DAP or 50 kg SSP",
            "timing": "Basal at sowing",
            "organic_support": "Use compost/FYM for better root growth"
        },
        "better_alternative": "Moong",
        "soil_bonus": ["Black Soil", "Red Soil", "Loamy Soil"]
    },

    "Moong": {
        "base_yield_per_acre": 500,
        "ideal_rainfall": (400, 700),
        "ideal_temp": (25, 35),
        "default_price": 80,
        "fertilizer": {
            "type": "DAP + Rhizobium",
            "quantity_per_acre": "25-30 kg DAP + biofertilizer seed treatment",
            "timing": "At sowing",
            "organic_support": "Compost improves soil activity"
        },
        "better_alternative": "Urad",
        "soil_bonus": ["Loamy Soil", "Alluvial Soil", "Sandy Soil"]
    },

    "Urad": {
        "base_yield_per_acre": 450,
        "ideal_rainfall": (400, 700),
        "ideal_temp": (25, 35),
        "default_price": 85,
        "fertilizer": {
            "type": "DAP + Rhizobium",
            "quantity_per_acre": "25-30 kg DAP + biofertilizer",
            "timing": "At sowing",
            "organic_support": "Use compost for better moisture balance"
        },
        "better_alternative": "Moong",
        "soil_bonus": ["Loamy Soil", "Black Soil", "Red Soil"]
    },

    "Soybean": {
        "base_yield_per_acre": 1000,
        "ideal_rainfall": (600, 1000),
        "ideal_temp": (20, 32),
        "default_price": 45,
        "fertilizer": {
            "type": "DAP + Potash + Rhizobium",
            "quantity_per_acre": "40-50 kg DAP + 10-15 kg MOP",
            "timing": "Basal at sowing",
            "organic_support": "Use FYM before sowing"
        },
        "better_alternative": "Groundnut",
        "soil_bonus": ["Black Soil", "Loamy Soil", "Alluvial Soil"]
    },

    "Groundnut": {
        "base_yield_per_acre": 900,
        "ideal_rainfall": (500, 1000),
        "ideal_temp": (22, 32),
        "default_price": 55,
        "fertilizer": {
            "type": "Gypsum + DAP",
            "quantity_per_acre": "40-50 kg DAP + 100 kg gypsum (if needed)",
            "timing": "DAP at sowing, gypsum during pegging stage",
            "organic_support": "Use compost for soil structure"
        },
        "better_alternative": "Soybean",
        "soil_bonus": ["Sandy Soil", "Red Soil", "Loamy Soil"]
    },

    "Mustard": {
        "base_yield_per_acre": 700,
        "ideal_rainfall": (350, 650),
        "ideal_temp": (15, 25),
        "default_price": 65,
        "fertilizer": {
            "type": "DAP + Sulphur + Urea",
            "quantity_per_acre": "35-45 kg DAP + 10-15 kg sulphur source",
            "timing": "Basal at sowing, light nitrogen later",
            "organic_support": "Use FYM before sowing"
        },
        "better_alternative": "Gram (Chana)",
        "soil_bonus": ["Alluvial Soil", "Loamy Soil", "Clay Soil"]
    },

    "Sunflower": {
        "base_yield_per_acre": 650,
        "ideal_rainfall": (500, 800),
        "ideal_temp": (20, 30),
        "default_price": 60,
        "fertilizer": {
            "type": "NPK + Boron (if deficient)",
            "quantity_per_acre": "35-45 kg balanced fertilizer",
            "timing": "Basal at sowing",
            "organic_support": "Compost helps moisture holding"
        },
        "better_alternative": "Mustard",
        "soil_bonus": ["Black Soil", "Red Soil", "Loamy Soil"]
    },

    "Cotton": {
        "base_yield_per_acre": 1200,
        "ideal_rainfall": (600, 1200),
        "ideal_temp": (21, 35),
        "default_price": 65,
        "fertilizer": {
            "type": "NPK + Urea + Micronutrients",
            "quantity_per_acre": "50-60 kg basal + 25-35 kg nitrogen split",
            "timing": "Basal at sowing, split doses at vegetative and flowering stages",
            "organic_support": "Add compost and zinc if deficiency suspected"
        },
        "better_alternative": "Soybean",
        "soil_bonus": ["Black Soil", "Loamy Soil", "Alluvial Soil"]
    },

    "Sugarcane": {
        "base_yield_per_acre": 35000,
        "ideal_rainfall": (750, 1500),
        "ideal_temp": (20, 35),
        "default_price": 3.5,
        "fertilizer": {
            "type": "NPK + Urea + Potash",
            "quantity_per_acre": "75-100 kg balanced nutrients in split doses",
            "timing": "Basal + multiple split applications",
            "organic_support": "Use press mud / compost if available"
        },
        "better_alternative": "Maize",
        "soil_bonus": ["Loamy Soil", "Alluvial Soil", "Black Soil"]
    },

    "Potato": {
        "base_yield_per_acre": 8000,
        "ideal_rainfall": (500, 700),
        "ideal_temp": (15, 25),
        "default_price": 18,
        "fertilizer": {
            "type": "NPK + Potash rich fertilizer",
            "quantity_per_acre": "60-80 kg balanced fertilizer with higher potash",
            "timing": "Basal + earthing-up stage support",
            "organic_support": "Use compost for tuber development"
        },
        "better_alternative": "Onion",
        "soil_bonus": ["Loamy Soil", "Sandy Soil", "Alluvial Soil"]
    },

    "Onion": {
        "base_yield_per_acre": 7000,
        "ideal_rainfall": (500, 800),
        "ideal_temp": (13, 25),
        "default_price": 20,
        "fertilizer": {
            "type": "NPK + Sulphur",
            "quantity_per_acre": "50-70 kg balanced fertilizer",
            "timing": "Basal + split nitrogen later",
            "organic_support": "Use compost to improve bulb size"
        },
        "better_alternative": "Garlic",
        "soil_bonus": ["Loamy Soil", "Alluvial Soil", "Sandy Soil"]
    },

    "Tomato": {
        "base_yield_per_acre": 10000,
        "ideal_rainfall": (600, 1000),
        "ideal_temp": (18, 30),
        "default_price": 15,
        "fertilizer": {
            "type": "NPK + Calcium + Micronutrients",
            "quantity_per_acre": "60-80 kg balanced fertilizer in split doses",
            "timing": "Basal + flowering + fruiting stage support",
            "organic_support": "Use vermicompost or compost"
        },
        "better_alternative": "Chili",
        "soil_bonus": ["Loamy Soil", "Alluvial Soil", "Sandy Soil"]
    },

    "Chili": {
        "base_yield_per_acre": 3500,
        "ideal_rainfall": (600, 1000),
        "ideal_temp": (20, 32),
        "default_price": 40,
        "fertilizer": {
            "type": "NPK + Micronutrients",
            "quantity_per_acre": "50-70 kg balanced fertilizer",
            "timing": "Basal + split during flowering and fruiting",
            "organic_support": "Use compost and avoid water stress"
        },
        "better_alternative": "Tomato",
        "soil_bonus": ["Loamy Soil", "Red Soil", "Alluvial Soil"]
    },

    "Banana": {
        "base_yield_per_acre": 15000,
        "ideal_rainfall": (1000, 2500),
        "ideal_temp": (20, 35),
        "default_price": 12,
        "fertilizer": {
            "type": "NPK + Organic manure",
            "quantity_per_acre": "100-150 kg balanced nutrients in multiple splits",
            "timing": "Split applications through crop cycle",
            "organic_support": "Heavy compost/FYM highly beneficial"
        },
        "better_alternative": "Sugarcane",
        "soil_bonus": ["Loamy Soil", "Alluvial Soil", "Clay Soil"]
    }
}

SOIL_TYPES = [
    "Black Soil",
    "Red Soil",
    "Alluvial Soil",
    "Laterite Soil",
    "Sandy Soil",
    "Clay Soil",
    "Loamy Soil",
    "Saline Soil",
    "Desert Soil",
    "Mountain Soil"
]