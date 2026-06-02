# =========================================================
# AgriFuture - populate_knowledge.py
# Multilingual Agricultural Advisory Database Builder
# =========================================================

import sqlite3
import json
import os

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = lambda *args, **kwargs: None

# =========================================================
# DATABASE CONFIG
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "database", "app.db")


def resolve_db_path():
    database_url = os.getenv("DATABASE_URL", "").strip()

    if database_url.startswith("sqlite:///"):
        sqlite_target = database_url.replace("sqlite:///", "", 1)
        if sqlite_target:
            if os.path.isabs(sqlite_target):
                return sqlite_target
            return os.path.normpath(os.path.join(BASE_DIR, sqlite_target))

    return DEFAULT_DB_PATH


DB_PATH = resolve_db_path()
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# =========================================================
# DATABASE CONNECTION
# =========================================================

conn = sqlite3.connect(DB_PATH)

cursor = conn.cursor()

# =========================================================
# CREATE TABLE
# =========================================================
cursor.execute("DROP TABLE IF EXISTS advisory_knowledge")
cursor.execute("""
CREATE TABLE IF NOT EXISTS advisory_knowledge (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    disease_name TEXT UNIQUE,

    advisory_json TEXT
)
""")

# =========================================================
# MULTILINGUAL DATASET
# =========================================================
#
# IMPORTANT:
# Put ALL your disease dataset inside this dictionary.
#
# Example:
#
# "Disease_Name": {
#     "problem": {
#         "en": "...",
#         "hi": "...",
#         "mr": "..."
#     }
# }
#
# =========================================================
expert_dataset = {
 
  "Apple___Apple_scab": {
    "problem": {
      "en": "Apple scab is a fungal disease that causes olive-green to dark brown spots on leaves and fruits. Infected fruits become rough, cracked, and deformed, reducing market quality and storage life.",
      "hi": "एप्पल स्कैब एक फफूंद जनित रोग है जिसमें पत्तियों और फलों पर जैतून जैसे हरे से भूरे धब्बे दिखाई देते हैं। संक्रमित फल खुरदरे, फटे हुए और टेढ़े-मेढ़े हो जाते हैं, जिससे बाजार मूल्य कम हो जाता है।",
      "mr": "ॲपल स्कॅब हा बुरशीजन्य रोग असून पानांवर आणि फळांवर हिरवट ते तपकिरी डाग दिसतात. बाधित फळे खरबरीत, तडकलेली आणि विकृत होतात त्यामुळे बाजारभाव आणि साठवण क्षमता कमी होते."
    },
    "medicine": {
      "en": "Spray Mancozeb or Captan fungicide at early disease stage. Repeat spraying if infection spreads rapidly.",
      "hi": "रोग की शुरुआती अवस्था में Mancozeb या Captan फफूंदनाशक का छिड़काव करें। संक्रमण बढ़ने पर दोबारा छिड़काव करें।",
      "mr": "रोगाची सुरुवात दिसताच Mancozeb किंवा Captan बुरशीनाशकाची फवारणी करा. प्रादुर्भाव वाढल्यास पुन्हा फवारणी करावी."
    },
    "dosage": {
      "en": "Mancozeb 2.5 g per liter of water.",
      "hi": "Mancozeb 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।",
      "mr": "Mancozeb 2.5 ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करा."
    },
    "fertilizer": {
      "en": "Apply balanced NPK fertilizer along with organic compost to improve plant immunity.",
      "hi": "संतुलित NPK खाद और जैविक खाद का उपयोग करें ताकि पौधों की रोग प्रतिरोधक क्षमता बढ़े।",
      "mr": "संतुलित NPK खतासोबत सेंद्रिय खत वापरल्यास झाडांची रोगप्रतिकारक शक्ती वाढते."
    },
    "root_condition": {
      "en": "Roots may weaken due to stress from repeated fungal infection and poor nutrient uptake.",
      "hi": "लगातार फफूंद संक्रमण के कारण जड़ें कमजोर हो सकती हैं और पोषक तत्वों का अवशोषण कम हो जाता है।",
      "mr": "सतत बुरशीच्या प्रादुर्भावामुळे मुळे कमकुवत होतात आणि अन्नद्रव्य शोषण कमी होते."
    },
    "soil_condition": {
      "en": "Poorly drained and continuously wet soil favors fungal growth.",
      "hi": "खराब जल निकासी वाली और लगातार गीली मिट्टी में रोग तेजी से बढ़ता है।",
      "mr": "पाण्याचा निचरा न होणारी आणि सतत ओलसर जमीन रोग वाढण्यासाठी पोषक ठरते."
    },
    "weather_effect": {
      "en": "Cool and humid weather increases disease spread rapidly.",
      "hi": "ठंडा और नम मौसम रोग को तेजी से फैलाता है।",
      "mr": "थंड आणि दमट हवामानात रोगाचा प्रादुर्भाव झपाट्याने वाढतो."
    },
    "prevention": {
      "en": "Remove fallen leaves, maintain orchard cleanliness, and avoid overhead irrigation.",
      "hi": "गिरी हुई पत्तियों को हटाएं, बाग की सफाई रखें और ऊपर से सिंचाई करने से बचें।",
      "mr": "गिरलेली पाने नष्ट करा, बाग स्वच्छ ठेवा आणि वरून पाणी देणे टाळा."
    },
    "farmer_tip": {
      "en": "Regular orchard monitoring helps detect scab early and prevents heavy crop loss.",
      "hi": "बगीचे की नियमित निगरानी से रोग की जल्दी पहचान होकर नुकसान कम किया जा सकता है।",
      "mr": "बागेची नियमित पाहणी केल्यास रोग लवकर ओळखून मोठे नुकसान टाळता येते."
    },
  },
  "Apple___Black_rot": {
    "problem": {
      "en": "Black rot causes circular dark lesions on fruits, leaves, and branches. Fruits gradually rot and dry on the tree.",
      "hi": "ब्लैक रॉट रोग में फलों, पत्तियों और शाखाओं पर काले गोल धब्बे बनते हैं। फल धीरे-धीरे सड़कर सूख जाते हैं।",
      "mr": "ब्लॅक रॉट रोगामुळे फळे, पाने आणि फांद्यांवर काळे गोल डाग पडतात. फळे हळूहळू सडून झाडावरच कोरडी होतात."
    },
    "medicine": {
      "en": "Use Copper oxychloride or Thiophanate methyl fungicide for disease management.",
      "hi": "रोग नियंत्रण के लिए Copper oxychloride या Thiophanate methyl का उपयोग करें।",
      "mr": "रोग नियंत्रणासाठी Copper oxychloride किंवा Thiophanate methyl ची फवारणी करा."
    },
    "dosage": {
      "en": "Copper oxychloride 3 g per liter of water.",
      "hi": "Copper oxychloride 3 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।",
      "mr": "Copper oxychloride 3 ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करा."
    },
    "fertilizer": {
      "en": "Apply potash-rich fertilizer to improve fruit strength and disease resistance.",
      "hi": "फल की मजबूती और रोग प्रतिरोध बढ़ाने के लिए पोटाश युक्त खाद दें।",
      "mr": "फळांची ताकद आणि रोगप्रतिकार वाढवण्यासाठी पालाशयुक्त खत वापरा."
    },
    "root_condition": {
      "en": "Weak roots under moisture stress increase plant vulnerability.",
      "hi": "नमी की कमी से कमजोर जड़ें पौधों को रोग के प्रति अधिक संवेदनशील बनाती हैं।",
      "mr": "ओलाव्याच्या ताणामुळे कमकुवत झालेली मुळे रोग वाढण्यास कारणीभूत ठरतात."
    },
    "soil_condition": {
      "en": "Excess organic debris and wet soil increase fungal survival.",
      "hi": "गीली मिट्टी और सड़ी हुई जैविक सामग्री रोग को बढ़ावा देती है।",
      "mr": "ओलसर जमीन आणि कुजलेला पालापाचोळा बुरशी वाढवतो."
    },
    "weather_effect": {
      "en": "Warm and rainy weather favors rapid spread of black rot.",
      "hi": "गर्म और बरसाती मौसम में रोग तेजी से फैलता है।",
      "mr": "उष्ण आणि पावसाळी हवामानात रोग झपाट्याने पसरतो."
    },
    "prevention": {
      "en": "Prune infected branches and destroy diseased fruits immediately.",
      "hi": "संक्रमित शाखाओं की छंटाई करें और रोगग्रस्त फलों को नष्ट करें।",
      "mr": "संक्रमित फांद्या छाटून टाका आणि बाधित फळे नष्ट करा."
    },
    "farmer_tip": {
      "en": "Do not leave infected fruits in the orchard as they spread disease next season.",
      "hi": "संक्रमित फलों को बगीचे में न छोड़ें, इससे अगले मौसम में रोग फैलता है।",
      "mr": "रोगट फळे बागेत पडू देऊ नका, त्यामुळे पुढील हंगामात रोग वाढतो."
    },
  },

  "Apple___Cedar_apple_rust": {
    "problem": {
      "en": "Cedar apple rust causes yellow-orange spots on leaves and reduces fruit quality and plant vigor.",
      "hi": "इस रोग में पत्तियों पर पीले-नारंगी धब्बे बनते हैं और फल की गुणवत्ता घट जाती है।",
      "mr": "या रोगामुळे पानांवर पिवळसर-केशरी डाग पडतात आणि फळांची गुणवत्ता कमी होते."
    },
    "medicine": {
      "en": "Apply Myclobutanil fungicide during early infection stage.",
      "hi": "रोग की शुरुआत में Myclobutanil का छिड़काव करें।",
      "mr": "रोगाची सुरुवात होताच Myclobutanil ची फवारणी करा."
    },
    "dosage": {
      "en": "Myclobutanil 1 ml per liter of water.",
      "hi": "Myclobutanil 1 मिली प्रति लीटर पानी में मिलाएं।",
      "mr": "Myclobutanil 1 मिली प्रति लिटर पाण्यात मिसळा."
    },
    "fertilizer": {
      "en": "Use micronutrient fertilizers to improve leaf health.",
      "hi": "पत्तियों की मजबूती के लिए सूक्ष्म पोषक तत्वों वाली खाद का उपयोग करें।",
      "mr": "पानांची ताकद वाढवण्यासाठी सूक्ष्म अन्नद्रव्ययुक्त खत वापरा."
    },
    "root_condition": {
      "en": "Healthy roots help plants recover faster from fungal stress.",
      "hi": "स्वस्थ जड़ें पौधों को रोग से जल्दी उबरने में मदद करती हैं।",
      "mr": "निरोगी मुळे झाडाला रोगातून लवकर सावरण्यास मदत करतात."
    },
    "soil_condition": {
      "en": "Moderately fertile and well-drained soil supports healthy growth.",
      "hi": "उपजाऊ और अच्छी जल निकासी वाली मिट्टी फसल के लिए बेहतर रहती है।",
      "mr": "चांगला निचरा होणारी सुपीक जमीन झाडासाठी फायदेशीर असते."
    },
    "weather_effect": {
      "en": "Humid weather and morning dew increase infection.",
      "hi": "नम मौसम और सुबह की ओस रोग को बढ़ाती है।",
      "mr": "दमट हवामान आणि सकाळची दव रोग वाढवतात."
    },
    "prevention": {
      "en": "Avoid nearby cedar host plants and maintain proper air circulation.",
      "hi": "पास में मौजूद संक्रमित पौधों को हटाएं और बगीचे में हवा का प्रवाह बनाए रखें।",
      "mr": "आजूबाजूची संक्रमित झाडे हटवा आणि बागेत हवा खेळती ठेवा."
    },
    "farmer_tip": {
      "en": "Timely preventive spraying before rainy season gives better control.",
      "hi": "बरसात से पहले समय पर छिड़काव करने से रोग नियंत्रण बेहतर होता है।",
      "mr": "पावसाळ्यापूर्वी वेळेवर फवारणी केल्यास रोग नियंत्रण चांगले मिळते."
    },
  },

  "Apple___healthy": {
    "problem": {
      "en": "The apple plant is healthy with dark green leaves, proper flowering, and good fruit development. No visible disease symptoms are present.",
      "hi": "सेब का पौधा स्वस्थ है। पत्तियां हरी हैं, फूल और फल अच्छी तरह विकसित हो रहे हैं तथा किसी रोग के लक्षण दिखाई नहीं दे रहे हैं।",
      "mr": "सफरचंदाचे झाड निरोगी असून पाने गर्द हिरवी आहेत, फुले आणि फळांची वाढ चांगली होत आहे आणि कोणताही रोग दिसत नाही."
    },
    "medicine": {
      "en": "No fungicide or pesticide is currently required. Continue regular crop monitoring.",
      "hi": "फिलहाल किसी दवा की आवश्यकता नहीं है। नियमित निरीक्षण जारी रखें।",
      "mr": "सध्या कोणत्याही औषधाची गरज नाही. नियमित निरीक्षण सुरू ठेवा."
    },
    "dosage": {
      "en": "No chemical dosage required under healthy condition.",
      "hi": "स्वस्थ अवस्था में किसी रसायन की मात्रा आवश्यक नहीं है।",
      "mr": "निरोगी अवस्थेत कोणत्याही रसायनाची गरज नाही."
    },
    "fertilizer": {
      "en": "Apply balanced NPK fertilizer and organic compost for steady growth.",
      "hi": "संतुलित NPK खाद और जैविक खाद का उपयोग करें।",
      "mr": "संतुलित NPK खत आणि सेंद्रिय खत वापरा."
    },
    "root_condition": {
      "en": "Roots are healthy, actively absorbing nutrients and moisture from soil.",
      "hi": "जड़ें स्वस्थ हैं और मिट्टी से पोषक तत्व अच्छे से ले रही हैं।",
      "mr": "मुळे निरोगी असून जमिनीतून अन्नद्रव्ये आणि ओलावा चांगल्या प्रकारे घेत आहेत."
    },
    "soil_condition": {
      "en": "Well-drained fertile soil supports healthy plant growth.",
      "hi": "अच्छी जल निकासी वाली उपजाऊ मिट्टी फसल के लिए लाभदायक है।",
      "mr": "चांगला निचरा होणारी सुपीक जमीन झाडासाठी फायदेशीर असते."
    },
    "weather_effect": {
      "en": "Moderate sunlight and balanced moisture maintain healthy growth.",
      "hi": "संतुलित धूप और नमी पौधों की अच्छी वृद्धि बनाए रखते हैं।",
      "mr": "समतोल सूर्यप्रकाश आणि ओलावा झाडांची चांगली वाढ टिकवून ठेवतात."
    },
    "prevention": {
      "en": "Maintain orchard sanitation and regular nutrient management to avoid future diseases.",
      "hi": "भविष्य में रोग रोकने के लिए बगीचे की सफाई और पोषण प्रबंधन बनाए रखें।",
      "mr": "भविष्यातील रोग टाळण्यासाठी बाग स्वच्छ ठेवा आणि योग्य खत व्यवस्थापन करा."
    },
    "farmer_tip": {
      "en": "Healthy orchards require regular pruning, irrigation, and monitoring for long-term productivity.",
      "hi": "लंबे समय तक अच्छी पैदावार के लिए नियमित छंटाई और सिंचाई जरूरी है।",
      "mr": "दीर्घकाळ चांगल्या उत्पादनासाठी नियमित छाटणी आणि पाणी व्यवस्थापन महत्त्वाचे आहे."
    },
  },

  "Cherry___Healthy": {
    "problem": {
      "en": "The cherry crop is healthy with fresh green foliage, proper flowering, and vigorous growth.",
      "hi": "चेरी की फसल स्वस्थ है। पत्तियां हरी हैं और पौधों की वृद्धि अच्छी हो रही है।",
      "mr": "चेरीची पिके निरोगी असून पाने ताजी हिरवी आहेत आणि वाढ चांगली होत आहे."
    },
    "medicine": {
      "en": "No medicine required at present. Maintain preventive orchard care.",
      "hi": "अभी किसी दवा की आवश्यकता नहीं है। नियमित देखभाल जारी रखें।",
      "mr": "सध्या कोणत्याही औषधाची गरज नाही. नियमित काळजी घ्या."
    },
    "dosage": {
      "en": "No dosage required under healthy crop condition.",
      "hi": "स्वस्थ फसल में किसी दवा की मात्रा आवश्यक नहीं है।",
      "mr": "निरोगी पिकात कोणत्याही औषधाची गरज नाही."
    },
    "fertilizer": {
      "en": "Use organic manure and balanced NPK fertilizer for healthy fruit development.",
      "hi": "फल विकास के लिए जैविक खाद और संतुलित NPK खाद का उपयोग करें।",
      "mr": "फळांच्या चांगल्या विकासासाठी सेंद्रिय खत आणि संतुलित NPK खत वापरा."
    },
    "root_condition": {
      "en": "Roots are healthy and capable of efficient nutrient uptake.",
      "hi": "जड़ें स्वस्थ हैं और पोषक तत्वों का अच्छा अवशोषण कर रही हैं।",
      "mr": "मुळे निरोगी असून अन्नद्रव्यांचे शोषण चांगले होत आहे."
    },
    "soil_condition": {
      "en": "Loamy and well-drained soil helps maintain healthy cherry plants.",
      "hi": "दोमट और अच्छी जल निकासी वाली मिट्टी चेरी के लिए उपयुक्त है।",
      "mr": "भुसभुशीत आणि चांगला निचरा होणारी जमीन चेरीसाठी योग्य असते."
    },
    "weather_effect": {
      "en": "Cool and moderate weather supports healthy flowering and fruit setting.",
      "hi": "हल्का ठंडा मौसम फूल और फल बनने के लिए अच्छा रहता है।",
      "mr": "थंड आणि समतोल हवामान फुलोरा आणि फळधारणेसाठी चांगले असते."
    },
    "prevention": {
      "en": "Regular pruning and balanced irrigation help maintain healthy orchard conditions.",
      "hi": "नियमित छंटाई और संतुलित सिंचाई से पौधे स्वस्थ रहते हैं।",
      "mr": "नियमित छाटणी आणि संतुलित पाणी व्यवस्थापनामुळे झाडे निरोगी राहतात."
    },
    "farmer_tip": {
      "en": "Avoid excess nitrogen fertilizer as it may increase weak vegetative growth.",
      "hi": "अधिक नाइट्रोजन खाद का उपयोग न करें, इससे पौधे कमजोर हो सकते हैं।",
      "mr": "अतिरिक्त नत्रयुक्त खत टाळा, त्यामुळे झाडांची अनावश्यक वाढ होऊ शकते."
    },
  },

  "Cherry___Powdery_mildew": {
    "problem": {
      "en": "Powdery mildew causes white powder-like fungal growth on leaves, shoots, and fruits, reducing plant vigor.",
      "hi": "इस रोग में पत्तियों, टहनियों और फलों पर सफेद चूर्ण जैसा फफूंद दिखाई देता है।",
      "mr": "या रोगात पानांवर, फांद्यांवर आणि फळांवर पांढऱ्या भुकटीसारखी बुरशी दिसते."
    },
    "medicine": {
      "en": "Spray Sulphur or Hexaconazole fungicide to control powdery mildew.",
      "hi": "रोग नियंत्रण के लिए Sulphur या Hexaconazole का छिड़काव करें।",
      "mr": "रोग नियंत्रणासाठी Sulphur किंवा Hexaconazole ची फवारणी करा."
    },
    "dosage": {
      "en": "Hexaconazole 1 ml per liter of water.",
      "hi": "Hexaconazole 1 मिली प्रति लीटर पानी में मिलाकर छिड़काव करें।",
      "mr": "Hexaconazole 1 मिली प्रति लिटर पाण्यात मिसळून फवारणी करा."
    },
    "fertilizer": {
      "en": "Use balanced fertilizer and avoid excess nitrogen application.",
      "hi": "संतुलित खाद दें और अधिक नाइट्रोजन से बचें।",
      "mr": "संतुलित खत वापरा आणि अतिरिक्त नत्र देणे टाळा."
    },
    "root_condition": {
      "en": "Weak roots reduce plant resistance against fungal infection.",
      "hi": "कमजोर जड़ें रोग प्रतिरोधक क्षमता कम कर देती हैं।",
      "mr": "कमकुवत मुळे रोगप्रतिकारक शक्ती कमी करतात."
    },
    "soil_condition": {
      "en": "Dry soil with poor nutrient balance weakens plants.",
      "hi": "सूखी और पोषक तत्वों की कमी वाली मिट्टी पौधों को कमजोर बनाती है।",
      "mr": "कोरडी आणि कमी सुपीक जमीन झाडे कमकुवत करते."
    },
    "weather_effect": {
      "en": "Warm days and humid nights encourage fungal growth.",
      "hi": "गर्म दिन और नम रातें रोग बढ़ाती हैं।",
      "mr": "उबदार दिवस आणि दमट रात्री रोग वाढवतात."
    },
    "prevention": {
      "en": "Maintain spacing between plants and remove infected plant parts.",
      "hi": "पौधों के बीच उचित दूरी रखें और संक्रमित भाग हटाएं।",
      "mr": "झाडांमध्ये योग्य अंतर ठेवा आणि संक्रमित भाग काढून टाका."
    },
    "farmer_tip": {
      "en": "Early spraying gives better disease control than waiting for severe infection.",
      "hi": "रोग बढ़ने से पहले छिड़काव करने से बेहतर नियंत्रण मिलता है।",
      "mr": "रोग वाढण्यापूर्वी फवारणी केल्यास नियंत्रण अधिक चांगले मिळते."
    },
  },

  "Corn___Common_rust": {
    "problem": {
      "en": "Common rust causes reddish-brown pustules on maize leaves leading to reduced photosynthesis and lower yield.",
      "hi": "इस रोग में मक्का की पत्तियों पर लाल-भूरे फफोले बनते हैं जिससे उत्पादन कम होता है।",
      "mr": "या रोगामुळे मक्याच्या पानांवर लालसर-तपकिरी ठिपके येतात आणि उत्पादन घटते."
    },
    "medicine": {
      "en": "Apply Propiconazole or Mancozeb fungicide for rust management.",
      "hi": "रोग नियंत्रण के लिए Propiconazole या Mancozeb का छिड़काव करें।",
      "mr": "रोग नियंत्रणासाठी Propiconazole किंवा Mancozeb ची फवारणी करा."
    },
    "dosage": {
      "en": "Propiconazole 1 ml per liter of water.",
      "hi": "Propiconazole 1 मिली प्रति लीटर पानी में मिलाएं।",
      "mr": "Propiconazole 1 मिली प्रति लिटर पाण्यात मिसळा."
    },
    "fertilizer": {
      "en": "Use nitrogen and potash fertilizer in balanced quantity.",
      "hi": "नाइट्रोजन और पोटाश संतुलित मात्रा में दें।",
      "mr": "नत्र आणि पालाश संतुलित प्रमाणात वापरा."
    },
    "root_condition": {
      "en": "Roots become stressed when leaf infection reduces plant energy production.",
      "hi": "पत्तियों के संक्रमित होने पर जड़ों की कार्यक्षमता प्रभावित होती है।",
      "mr": "पाने बाधित झाल्याने मुळांवर ताण येतो."
    },
    "soil_condition": {
      "en": "Moderately fertile soil supports healthy maize growth.",
      "hi": "उपजाऊ मिट्टी मक्का की अच्छी वृद्धि में मदद करती है।",
      "mr": "सुपीक जमीन मक्याच्या चांगल्या वाढीस मदत करते."
    },
    "weather_effect": {
      "en": "Cool and humid weather favors rust development.",
      "hi": "ठंडा और नम मौसम रोग को बढ़ाता है।",
      "mr": "थंड आणि दमट हवामानात रोग वाढतो."
    },
    "prevention": {
      "en": "Use resistant varieties and avoid overcrowded planting.",
      "hi": "रोगरोधी किस्में लगाएं और बहुत घनी बुवाई न करें।",
      "mr": "रोगप्रतिकारक वाण वापरा आणि दाट लागवड टाळा."
    },
    "farmer_tip": {
      "en": "Regular field inspection during humid weather helps early disease detection.",
      "hi": "नम मौसम में खेत की नियमित जांच करें।",
      "mr": "दमट हवामानात शेताची नियमित पाहणी करा."
    },
  },
  
  "Corn___Gray_leaf_spot": {
    "problem": {
      "en": "Gray leaf spot causes long gray to brown rectangular lesions on maize leaves, reducing photosynthesis and grain filling.",
      "hi": "ग्रे लीफ स्पॉट रोग में मक्का की पत्तियों पर लंबे भूरे-धूसर धब्बे बनते हैं जिससे दाना भराव कम हो जाता है।",
      "mr": "ग्रे लीफ स्पॉट रोगामुळे मक्याच्या पानांवर लांबट करड्या-तपकिरी डाग दिसतात आणि दाणे भरण्यावर परिणाम होतो."
    },
    "medicine": {
      "en": "Spray Azoxystrobin or Mancozeb fungicide at the initial stage of disease.",
      "hi": "रोग की शुरुआत में Azoxystrobin या Mancozeb का छिड़काव करें।",
      "mr": "रोगाची सुरुवात होताच Azoxystrobin किंवा Mancozeb ची फवारणी करा."
    },
    "dosage": {
      "en": "Azoxystrobin 1 ml per liter of water.",
      "hi": "Azoxystrobin 1 मिली प्रति लीटर पानी में मिलाकर छिड़काव करें।",
      "mr": "Azoxystrobin 1 मिली प्रति लिटर पाण्यात मिसळून फवारणी करा."
    },
    "fertilizer": {
      "en": "Apply balanced nitrogen and potash fertilizers to strengthen plant growth.",
      "hi": "पौधों की मजबूती के लिए संतुलित नाइट्रोजन और पोटाश खाद दें।",
      "mr": "पिकाची ताकद वाढवण्यासाठी संतुलित नत्र आणि पालाश खत वापरा."
    },
    "root_condition": {
      "en": "Healthy roots help plants tolerate fungal stress better.",
      "hi": "स्वस्थ जड़ें पौधों को रोग से लड़ने में मदद करती हैं।",
      "mr": "निरोगी मुळे झाडाला रोगाचा सामना करण्यास मदत करतात."
    },
    "soil_condition": {
      "en": "Poorly managed crop residue and moist soil increase disease development.",
      "hi": "गीली मिट्टी और खेत में बचे अवशेष रोग को बढ़ाते हैं।",
      "mr": "ओलसर जमीन आणि शेतातील अवशेषांमुळे रोग वाढतो."
    },
    "weather_effect": {
      "en": "Warm and humid weather favors rapid fungal spread.",
      "hi": "गर्म और नम मौसम रोग फैलने के लिए अनुकूल होता है।",
      "mr": "उष्ण आणि दमट हवामानात रोग झपाट्याने पसरतो."
    },
    "prevention": {
      "en": "Rotate crops and remove infected crop debris after harvest.",
      "hi": "फसल चक्र अपनाएं और संक्रमित अवशेष नष्ट करें।",
      "mr": "पीक फेरपालट करा आणि संक्रमित अवशेष नष्ट करा."
    },
    "farmer_tip": {
      "en": "Avoid excessive irrigation during cloudy and humid weather.",
      "hi": "बादल और नमी वाले मौसम में अधिक सिंचाई न करें।",
      "mr": "ढगाळ आणि दमट हवामानात जास्त पाणी देणे टाळा."
    },
  },

  "Corn___Healthy": {
    "problem": {
      "en": "The maize crop is healthy with dark green leaves, strong stem growth, and proper cob development.",
      "hi": "मक्का की फसल स्वस्थ है। पत्तियां हरी हैं और भुट्टों का विकास अच्छा हो रहा है।",
      "mr": "मक्याचे पीक निरोगी असून पाने गर्द हिरवी आहेत आणि कणसांची वाढ चांगली होत आहे."
    },
    "medicine": {
      "en": "No medicine required under healthy crop condition.",
      "hi": "स्वस्थ फसल में किसी दवा की आवश्यकता नहीं है।",
      "mr": "निरोगी पिकात कोणत्याही औषधाची गरज नाही."
    },
    "dosage": {
      "en": "No chemical dosage needed.",
      "hi": "किसी रसायन की मात्रा आवश्यक नहीं है।",
      "mr": "कोणत्याही रसायनाची गरज नाही."
    },
    "fertilizer": {
      "en": "Apply balanced NPK fertilizer and organic manure regularly.",
      "hi": "संतुलित NPK खाद और जैविक खाद का उपयोग करें।",
      "mr": "संतुलित NPK खत आणि सेंद्रिय खत वापरा."
    },
    "root_condition": {
      "en": "Roots are healthy and efficiently absorbing nutrients and water.",
      "hi": "जड़ें स्वस्थ हैं और पोषक तत्व अच्छे से ले रही हैं।",
      "mr": "मुळे निरोगी असून पाणी आणि अन्नद्रव्ये योग्य प्रकारे घेत आहेत."
    },
    "soil_condition": {
      "en": "Well-drained fertile soil supports strong maize growth.",
      "hi": "अच्छी जल निकासी वाली उपजाऊ मिट्टी फसल के लिए लाभदायक है।",
      "mr": "चांगला निचरा होणारी सुपीक जमीन मक्यासाठी फायदेशीर असते."
    },
    "weather_effect": {
      "en": "Adequate sunlight and moderate rainfall promote healthy growth.",
      "hi": "पर्याप्त धूप और संतुलित वर्षा फसल की अच्छी वृद्धि में मदद करती है।",
      "mr": "पुरेसा सूर्यप्रकाश आणि संतुलित पाऊस पिकाच्या चांगल्या वाढीस मदत करतात."
    },
    "prevention": {
      "en": "Maintain proper irrigation and timely weed management.",
      "hi": "समय पर सिंचाई और खरपतवार नियंत्रण करें।",
      "mr": "वेळेवर पाणी व्यवस्थापन आणि तण नियंत्रण करा."
    },
    "farmer_tip": {
      "en": "Regular nutrient management increases cob quality and grain yield.",
      "hi": "नियमित पोषण प्रबंधन से उत्पादन बढ़ता है।",
      "mr": "नियमित खत व्यवस्थापनामुळे उत्पादन आणि दर्जा सुधारतो."
    },
  },

  "Corn___Northern_Leaf_Blight": {
    "problem": {
      "en": "Northern leaf blight causes long cigar-shaped gray lesions on maize leaves, reducing plant vigor and yield.",
      "hi": "इस रोग में मक्का की पत्तियों पर लंबे धूसर धब्बे बनते हैं जिससे उत्पादन कम हो जाता है।",
      "mr": "या रोगामुळे मक्याच्या पानांवर लांब करड्या रंगाचे डाग पडतात आणि उत्पादन घटते."
    },
    "medicine": {
      "en": "Apply Mancozeb or Propiconazole fungicide for effective disease management.",
      "hi": "रोग नियंत्रण के लिए Mancozeb या Propiconazole का उपयोग करें।",
      "mr": "रोग नियंत्रणासाठी Mancozeb किंवा Propiconazole ची फवारणी करा."
    },
    "dosage": {
      "en": "Mancozeb 2.5 g per liter of water.",
      "hi": "Mancozeb 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।",
      "mr": "Mancozeb 2.5 ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करा."
    },
    "fertilizer": {
      "en": "Balanced nitrogen and phosphorus fertilizers improve plant resistance.",
      "hi": "संतुलित नाइट्रोजन और फास्फोरस पौधों को मजबूत बनाते हैं।",
      "mr": "संतुलित नत्र आणि स्फुरदयुक्त खत पिकाची ताकद वाढवतात."
    },
    "root_condition": {
      "en": "Weak roots reduce nutrient supply during severe infection.",
      "hi": "कमजोर जड़ें रोग के समय पौधों को कमजोर बना देती हैं।",
      "mr": "कमकुवत मुळे रोगाच्या वेळी पिकाची ताकद कमी करतात."
    },
    "soil_condition": {
      "en": "Continuous maize cultivation in wet soil increases disease pressure.",
      "hi": "लगातार मक्का की खेती और गीली मिट्टी रोग बढ़ाती है।",
      "mr": "सतत मका लागवड आणि ओलसर जमीन रोग वाढवते."
    },
    "weather_effect": {
      "en": "Cool and humid weather supports rapid disease spread.",
      "hi": "ठंडा और नम मौसम रोग फैलने के लिए अनुकूल होता है।",
      "mr": "थंड आणि दमट हवामानात रोग वेगाने पसरतो."
    },
    "prevention": {
      "en": "Use resistant maize varieties and avoid dense sowing.",
      "hi": "रोगरोधी किस्में लगाएं और घनी बुवाई से बचें।",
      "mr": "रोगप्रतिकारक वाण वापरा आणि दाट पेरणी टाळा."
    },
    "farmer_tip": {
      "en": "Field cleanliness and timely fungicide spray reduce major crop losses.",
      "hi": "खेत की सफाई और समय पर दवा छिड़काव से नुकसान कम होता है।",
      "mr": "शेत स्वच्छ ठेवणे आणि वेळेवर फवारणी केल्यास नुकसान कमी होते."
    },
  },

  "Grape___Black_rot": {
    "problem": {
      "en": "Black rot causes brown circular spots on grape leaves and shriveling of fruits into black dry berries.",
      "hi": "इस रोग में अंगूर की पत्तियों पर भूरे गोल धब्बे बनते हैं और फल काले होकर सूख जाते हैं।",
      "mr": "या रोगामुळे द्राक्षांच्या पानांवर तपकिरी गोल डाग पडतात आणि फळे काळी पडून सुकतात."
    },
    "medicine": {
      "en": "Spray Mancozeb or Copper oxychloride fungicide for disease control.",
      "hi": "रोग नियंत्रण के लिए Mancozeb या Copper oxychloride का छिड़काव करें।",
      "mr": "रोग नियंत्रणासाठी Mancozeb किंवा Copper oxychloride ची फवारणी करा."
    },
    "dosage": {
      "en": "Mancozeb 2.5 g per liter of water.",
      "hi": "Mancozeb 2.5 ग्राम प्रति लीटर पानी में मिलाएं।",
      "mr": "Mancozeb 2.5 ग्रॅम प्रति लिटर पाण्यात मिसळा."
    },
    "fertilizer": {
      "en": "Apply potash-rich fertilizer for better fruit strength.",
      "hi": "फल मजबूत बनाने के लिए पोटाश युक्त खाद दें।",
      "mr": "फळांची ताकद वाढवण्यासाठी पालाशयुक्त खत वापरा."
    },
    "root_condition": {
      "en": "Healthy roots improve recovery from fungal stress.",
      "hi": "स्वस्थ जड़ें रोग से उबरने में मदद करती हैं।",
      "mr": "निरोगी मुळे झाडाला रोगातून सावरण्यास मदत करतात."
    },
    "soil_condition": {
      "en": "Wet and poorly ventilated vineyard soil increases infection.",
      "hi": "गीली और कम हवा वाली मिट्टी रोग बढ़ाती है।",
      "mr": "ओलसर आणि कमी हवा खेळती असलेली जमीन रोग वाढवते."
    },
    "weather_effect": {
      "en": "Rainy and humid weather accelerates disease spread.",
      "hi": "बरसाती और नम मौसम रोग तेजी से फैलाता है।",
      "mr": "पावसाळी आणि दमट हवामानात रोग झपाट्याने पसरतो."
    },
    "prevention": {
      "en": "Prune infected vines and maintain vineyard hygiene.",
      "hi": "संक्रमित बेलों की छंटाई करें और खेत साफ रखें।",
      "mr": "संक्रमित वेलांची छाटणी करा आणि बाग स्वच्छ ठेवा."
    },
    "farmer_tip": {
      "en": "Avoid water stagnation around grape vines during rainy season.",
      "hi": "बरसात में बेलों के पास पानी जमा न होने दें।",
      "mr": "पावसाळ्यात वेलांजवळ पाणी साचू देऊ नका."
    },
  },
  
  "Grape___Esca": {
    "problem": {
      "en": "Esca is a serious fungal disease in grapes that causes yellow and brown discoloration on leaves, weak vine growth, and drying of branches. In severe cases, the entire vine may suddenly collapse.",
      "hi": "एस्का अंगूर का गंभीर फफूंद जनित रोग है जिसमें पत्तियों पर पीले और भूरे धब्बे बनते हैं, बेल कमजोर हो जाती है और शाखाएं सूखने लगती हैं। गंभीर स्थिति में पूरी बेल सूख सकती है।",
      "mr": "एस्का हा द्राक्षांवरील गंभीर बुरशीजन्य रोग असून पानांवर पिवळे आणि तपकिरी डाग दिसतात, वेल कमकुवत होते आणि फांद्या सुकू लागतात. गंभीर अवस्थेत संपूर्ण वेल कोमेजू शकते."
    },
    "medicine": {
      "en": "Apply Carbendazim or Thiophanate methyl fungicide and remove severely infected branches.",
      "hi": "Carbendazim या Thiophanate methyl का छिड़काव करें और अधिक संक्रमित शाखाएं काटकर नष्ट करें।",
      "mr": "Carbendazim किंवा Thiophanate methyl ची फवारणी करा आणि जास्त बाधित फांद्या काढून टाका."
    },
    "dosage": {
      "en": "Carbendazim 1 g per liter of water.",
      "hi": "Carbendazim 1 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।",
      "mr": "Carbendazim 1 ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करा."
    },
    "fertilizer": {
      "en": "Use organic compost and balanced NPK fertilizer to strengthen vines.",
      "hi": "बेल मजबूत करने के लिए जैविक खाद और संतुलित NPK खाद का उपयोग करें।",
      "mr": "वेल मजबूत ठेवण्यासाठी सेंद्रिय खत आणि संतुलित NPK खत वापरा."
    },
    "root_condition": {
      "en": "Roots may weaken due to long-term fungal infection and reduced nutrient flow.",
      "hi": "लगातार संक्रमण से जड़ें कमजोर हो जाती हैं और पोषण प्रवाह कम हो जाता है।",
      "mr": "सतत बुरशीच्या प्रादुर्भावामुळे मुळे कमकुवत होतात आणि अन्नद्रव्यांचा पुरवठा कमी होतो."
    },
    "soil_condition": {
      "en": "Heavy and poorly drained soil increases disease severity.",
      "hi": "भारी और खराब जल निकासी वाली मिट्टी रोग को बढ़ाती है।",
      "mr": "जड आणि पाण्याचा निचरा न होणारी जमीन रोग वाढवते."
    },
    "weather_effect": {
      "en": "Hot weather with irregular moisture stress worsens Esca symptoms.",
      "hi": "गर्म मौसम और असंतुलित नमी रोग को बढ़ाते हैं।",
      "mr": "उष्ण हवामान आणि ओलाव्यातील असमतोलामुळे रोग वाढतो."
    },
    "prevention": {
      "en": "Use clean pruning tools and avoid injury to grape vines during pruning.",
      "hi": "साफ उपकरणों से छंटाई करें और बेलों को चोट लगने से बचाएं।",
      "mr": "स्वच्छ साधनांनी छाटणी करा आणि वेलीला जखम होणार नाही याची काळजी घ्या."
    },
    "farmer_tip": {
      "en": "Timely removal of infected vines helps prevent spread to healthy plants.",
      "hi": "संक्रमित बेलों को समय पर हटाने से रोग फैलने से रोका जा सकता है।",
      "mr": "संक्रमित वेली वेळेवर काढल्यास रोगाचा प्रसार कमी होतो."
    },
  },

  "Grape___Healthy": {
    "problem": {
      "en": "The grape crop is healthy with fresh green leaves, strong vine growth, and proper bunch development.",
      "hi": "अंगूर की फसल स्वस्थ है। पत्तियां हरी हैं और गुच्छों का विकास अच्छी तरह हो रहा है।",
      "mr": "द्राक्षाचे पीक निरोगी असून पाने हिरवीगार आहेत आणि घडांची वाढ चांगली होत आहे."
    },
    "medicine": {
      "en": "No medicine is required under healthy vineyard condition.",
      "hi": "स्वस्थ फसल में किसी दवा की आवश्यकता नहीं है।",
      "mr": "निरोगी पिकात कोणत्याही औषधाची गरज नाही."
    },
    "dosage": {
      "en": "No chemical dosage needed.",
      "hi": "किसी रसायन की मात्रा आवश्यक नहीं है।",
      "mr": "कोणत्याही रसायनाची गरज नाही."
    },
    "fertilizer": {
      "en": "Apply balanced NPK fertilizer along with micronutrients and organic manure.",
      "hi": "संतुलित NPK खाद, सूक्ष्म पोषक तत्व और जैविक खाद का उपयोग करें।",
      "mr": "संतुलित NPK खत, सूक्ष्म अन्नद्रव्ये आणि सेंद्रिय खत वापरा."
    },
    "root_condition": {
      "en": "Roots are healthy and actively supplying nutrients to vines.",
      "hi": "जड़ें स्वस्थ हैं और पौधों को पोषण दे रही हैं।",
      "mr": "मुळे निरोगी असून वेलीला योग्य पोषण पुरवत आहेत."
    },
    "soil_condition": {
      "en": "Well-drained fertile soil supports healthy grape production.",
      "hi": "अच्छी जल निकासी वाली उपजाऊ मिट्टी अंगूर के लिए उपयुक्त है।",
      "mr": "चांगला निचरा होणारी सुपीक जमीन द्राक्षासाठी योग्य असते."
    },
    "weather_effect": {
      "en": "Warm sunny weather with controlled irrigation promotes healthy growth.",
      "hi": "धूप वाला मौसम और संतुलित सिंचाई फसल के लिए लाभदायक है।",
      "mr": "उबदार सूर्यप्रकाश आणि संतुलित पाणी व्यवस्थापन पिकासाठी फायदेशीर असते."
    },
    "prevention": {
      "en": "Maintain vineyard sanitation and proper canopy management.",
      "hi": "बाग की सफाई और उचित प्रबंधन बनाए रखें।",
      "mr": "बाग स्वच्छ ठेवा आणि योग्य व्यवस्थापन करा."
    },
    "farmer_tip": {
      "en": "Regular monitoring helps maintain high-quality grape production.",
      "hi": "नियमित निरीक्षण से बेहतर गुणवत्ता का उत्पादन मिलता है।",
      "mr": "नियमित पाहणीमुळे चांगल्या दर्जाचे उत्पादन मिळते."
    },
  },

  "Grape___Leaf_blight": {
    "problem": {
      "en": "Leaf blight causes brown dry patches on grape leaves which gradually spread and reduce photosynthesis.",
      "hi": "इस रोग में पत्तियों पर भूरे सूखे धब्बे बनते हैं जो धीरे-धीरे फैलते हैं।",
      "mr": "या रोगामुळे द्राक्षाच्या पानांवर तपकिरी कोरडे डाग पडतात आणि ते हळूहळू पसरतात."
    },
    "medicine": {
      "en": "Spray Copper oxychloride or Mancozeb fungicide for effective control.",
      "hi": "Copper oxychloride या Mancozeb का छिड़काव करें।",
      "mr": "Copper oxychloride किंवा Mancozeb ची फवारणी करा."
    },
    "dosage": {
      "en": "Copper oxychloride 3 g per liter of water.",
      "hi": "Copper oxychloride 3 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।",
      "mr": "Copper oxychloride 3 ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करा."
    },
    "fertilizer": {
      "en": "Apply balanced fertilizer with adequate potash for leaf strength.",
      "hi": "पत्तियों की मजबूती के लिए संतुलित खाद और पोटाश दें।",
      "mr": "पानांची ताकद वाढवण्यासाठी संतुलित खत आणि पालाश वापरा."
    },
    "root_condition": {
      "en": "Weak root systems reduce plant recovery after infection.",
      "hi": "कमजोर जड़ें पौधों की रोग से उबरने की क्षमता घटाती हैं।",
      "mr": "कमकुवत मुळे झाडाची रोगातून सावरण्याची क्षमता कमी करतात."
    },
    "soil_condition": {
      "en": "Excess moisture and poor drainage encourage fungal growth.",
      "hi": "अधिक नमी और खराब जल निकासी रोग को बढ़ाते हैं।",
      "mr": "जास्त ओलावा आणि खराब निचऱ्यामुळे रोग वाढतो."
    },
    "weather_effect": {
      "en": "Humid and cloudy weather favors leaf blight spread.",
      "hi": "नम और बादल वाला मौसम रोग फैलने के लिए अनुकूल होता है।",
      "mr": "दमट आणि ढगाळ हवामानात रोग झपाट्याने पसरतो."
    },
    "prevention": {
      "en": "Ensure good air circulation and remove infected leaves regularly.",
      "hi": "हवा का अच्छा प्रवाह रखें और संक्रमित पत्तियां हटाएं।",
      "mr": "बागेत हवा खेळती ठेवा आणि संक्रमित पाने काढून टाका."
    },
    "farmer_tip": {
      "en": "Avoid overhead irrigation during humid weather conditions.",
      "hi": "नम मौसम में ऊपर से सिंचाई न करें।",
      "mr": "दमट हवामानात वरून पाणी देणे टाळा."
    },
  },

  "Jute___Jute_Cescospora_Leaf_Spot": {
    "problem": {
      "en": "Cercospora leaf spot in jute causes brown circular spots on leaves which later dry and reduce plant growth.",
      "hi": "जूट में यह रोग पत्तियों पर भूरे गोल धब्बे बनाता है जिससे पौधों की वृद्धि रुक जाती है।",
      "mr": "ताग पिकात या रोगामुळे पानांवर तपकिरी गोल डाग पडतात आणि वाढ खुंटते."
    },
    "medicine": {
      "en": "Spray Mancozeb or Carbendazim fungicide to control the disease.",
      "hi": "रोग नियंत्रण के लिए Mancozeb या Carbendazim का छिड़काव करें।",
      "mr": "रोग नियंत्रणासाठी Mancozeb किंवा Carbendazim ची फवारणी करा."
    },
    "dosage": {
      "en": "Mancozeb 2.5 g per liter of water.",
      "hi": "Mancozeb 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।",
      "mr": "Mancozeb 2.5 ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करा."
    },
    "fertilizer": {
      "en": "Use balanced fertilizer and apply organic manure for healthy growth.",
      "hi": "संतुलित खाद और जैविक खाद का उपयोग करें।",
      "mr": "संतुलित खत आणि सेंद्रिय खत वापरा."
    },
    "root_condition": {
      "en": "Healthy roots improve plant resistance against fungal infection.",
      "hi": "स्वस्थ जड़ें पौधों की रोग प्रतिरोधक क्षमता बढ़ाती हैं।",
      "mr": "निरोगी मुळे पिकाची रोगप्रतिकारक शक्ती वाढवतात."
    },
    "soil_condition": {
      "en": "Waterlogged and poorly drained soil increases disease spread.",
      "hi": "पानी भरी और खराब जल निकासी वाली मिट्टी रोग बढ़ाती है।",
      "mr": "पाणी साचणारी आणि निचरा नसलेली जमीन रोग वाढवते."
    },
    "weather_effect": {
      "en": "Warm and humid weather favors fungal development.",
      "hi": "गर्म और नम मौसम रोग बढ़ाता है।",
      "mr": "उष्ण आणि दमट हवामानात रोग वाढतो."
    },
    "prevention": {
      "en": "Maintain field sanitation and avoid excess irrigation.",
      "hi": "खेत साफ रखें और अधिक सिंचाई से बचें।",
      "mr": "शेत स्वच्छ ठेवा आणि जास्त पाणी देणे टाळा."
    },
    "farmer_tip": {
      "en": "Early disease detection and timely spraying help save fiber quality.",
      "hi": "समय पर रोग पहचान और छिड़काव से फाइबर की गुणवत्ता बचाई जा सकती है।",
      "mr": "वेळेवर रोग ओळखून फवारणी केल्यास तागाच्या तंतूची गुणवत्ता टिकते."
    },
  },

  "Jute___Jute_Golden_Mosaic": {
    "problem": {
      "en": "Golden Mosaic disease in jute is caused by a viral infection mainly spread through whiteflies. Leaves develop yellow mosaic patches, plants become weak, growth slows down, and fiber quality reduces significantly if the infection spreads early.",
      "hi": "जूट में गोल्डन मोज़ेक रोग वायरस के कारण होता है और यह मुख्य रूप से सफेद मक्खी द्वारा फैलता है। पत्तियों पर पीले धब्बे और जाली जैसे निशान दिखाई देते हैं, पौधा कमजोर हो जाता है, वृद्धि रुक जाती है और रेशा उत्पादन कम हो जाता है।",
      "mr": "ज्यूट पिकामध्ये गोल्डन मोजॅक रोग हा विषाणूमुळे होतो आणि तो प्रामुख्याने पांढऱ्या माशीमुळे पसरतो. पानांवर पिवळ्या रंगाचे जाळीसारखे डाग दिसतात, झाडाची वाढ खुंटते आणि तंतूंची गुणवत्ता कमी होते."
    },
    "medicine": {
      "en": "Spray Imidacloprid 17.8 SL or Thiamethoxam 25 WG to control whiteflies and reduce virus spread.",
      "hi": "सफेद मक्खी नियंत्रण के लिए Imidacloprid 17.8 SL या Thiamethoxam 25 WG का छिड़काव करें।",
      "mr": "पांढरी माशी नियंत्रणासाठी Imidacloprid 17.8 SL किंवा Thiamethoxam 25 WG फवारणी करावी."
    },
    "dosage": {
      "en": "Use Imidacloprid 0.3 ml per liter of water or Thiamethoxam 0.25 gram per liter.",
      "hi": "Imidacloprid 0.3 मिली प्रति लीटर पानी या Thiamethoxam 0.25 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।",
      "mr": "Imidacloprid 0.3 मिली प्रति लिटर पाणी किंवा Thiamethoxam 0.25 ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करावी."
    },
    "fertilizer": {
      "en": "Apply balanced NPK fertilizer along with organic compost to improve plant strength and recovery.",
      "hi": "संतुलित NPK उर्वरक और जैविक खाद का उपयोग करें ताकि पौधा मजबूत रहे।",
      "mr": "संतुलित NPK खतासोबत सेंद्रिय खत वापरल्यास झाडे मजबूत राहतात."
    },
    "root_condition": {
      "en": "Roots become weak due to poor nutrient absorption in infected plants.",
      "hi": "संक्रमित पौधों की जड़ें कमजोर हो जाती हैं और पोषक तत्वों का अवशोषण कम होता है।",
      "mr": "संक्रमित झाडांच्या मुळांची ताकद कमी होते आणि अन्नद्रव्य शोषण घटते."
    },
    "soil_condition": {
      "en": "Poorly drained and nutrient-deficient soil increases disease severity.",
      "hi": "खराब जल निकासी वाली और कमजोर मिट्टी में रोग तेजी से बढ़ता है।",
      "mr": "पाण्याचा निचरा न होणाऱ्या आणि कमकुवत जमिनीत रोगाचा प्रादुर्भाव जास्त होतो."
    },
    "weather_effect": {
      "en": "Warm and humid weather favors whitefly multiplication and disease spread.",
      "hi": "गर्म और नम मौसम में सफेद मक्खी तेजी से बढ़ती है और रोग फैलता है।",
      "mr": "उष्ण आणि दमट हवामानात पांढरी माशी वाढून रोग जलद पसरतो."
    },
    "prevention": {
      "en": "Use healthy seeds, control whiteflies early, remove infected plants, and maintain field hygiene.",
      "hi": "स्वस्थ बीज का उपयोग करें, सफेद मक्खी का समय पर नियंत्रण करें और संक्रमित पौधे निकाल दें।",
      "mr": "निरोगी बियाणे वापरा, पांढरी माशी वेळेवर नियंत्रित करा आणि संक्रमित झाडे काढून टाका."
    },
    "farmer_tip": {
      "en": "Regularly inspect the lower side of leaves for whiteflies to stop disease spread early.",
      "hi": "पत्तियों के नीचे सफेद मक्खी की नियमित जांच करें ताकि रोग को शुरुआत में ही रोका जा सके।",
      "mr": "पानांच्या खालच्या बाजूची नियमित तपासणी करा म्हणजे रोग सुरुवातीलाच थांबवता येतो."
    },
  },

  "Jute___Jute_Healthy_Leaf": {
    "problem": {
      "en": "Healthy jute leaves indicate proper crop growth, balanced nutrition, and good field management.",
      "hi": "स्वस्थ जूट की पत्तियां संतुलित पोषण और अच्छे खेत प्रबंधन का संकेत देती हैं।",
      "mr": "निरोगी ज्यूट पाने म्हणजे संतुलित पोषण आणि योग्य पिक व्यवस्थापनाचे लक्षण आहे."
    },
    "medicine": {
      "en": "No medicine required. Preventive bio-fungicide spray can be used if needed.",
      "hi": "किसी दवा की आवश्यकता नहीं है। आवश्यकता होने पर जैविक फफूंदनाशक का उपयोग कर सकते हैं।",
      "mr": "कोणत्याही औषधाची गरज नाही. गरज असल्यास जैविक बुरशीनाशक वापरू शकता."
    },
    "dosage": {
      "en": "Use bio-fungicide 2 gram per liter if preventive spray is required.",
      "hi": "जर बचाव हेतु छिड़काव करना हो तो जैविक फफूंदनाशक 2 ग्राम प्रति लीटर उपयोग करें।",
      "mr": "प्रतिबंधात्मक फवारणीसाठी जैविक बुरशीनाशक 2 ग्रॅम प्रति लिटर वापरा."
    },
    "fertilizer": {
      "en": "Apply recommended NPK along with compost for healthy fiber production.",
      "hi": "संतुलित NPK और गोबर खाद का उपयोग करें।",
      "mr": "संतुलित NPK खत आणि शेणखत वापरावे."
    },
    "root_condition": {
      "en": "Roots remain active, white, and healthy with good nutrient absorption.",
      "hi": "जड़ें मजबूत और सक्रिय रहती हैं तथा पोषक तत्व अच्छी तरह अवशोषित करती हैं।",
      "mr": "मुळे मजबूत आणि सक्रिय राहून अन्नद्रव्य शोषण चांगले होते."
    },
    "soil_condition": {
      "en": "Well-drained fertile soil supports healthy crop growth.",
      "hi": "अच्छी जल निकासी वाली उपजाऊ मिट्टी फसल के लिए उत्तम रहती है।",
      "mr": "चांगला निचरा होणारी सुपीक जमीन पिकासाठी उत्तम असते."
    },
    "weather_effect": {
      "en": "Moderate temperature and sufficient moisture help healthy leaf development.",
      "hi": "सामान्य तापमान और पर्याप्त नमी स्वस्थ वृद्धि में मदद करती है।",
      "mr": "मध्यम तापमान आणि योग्य ओलावा निरोगी वाढीस मदत करतात."
    },
    "prevention": {
      "en": "Maintain balanced irrigation, timely weeding, and regular crop monitoring.",
      "hi": "समय पर सिंचाई, निराई और नियमित निगरानी बनाए रखें।",
      "mr": "वेळेवर पाणी, तण नियंत्रण आणि नियमित निरीक्षण करावे."
    },
    "farmer_tip": {
      "en": "Healthy crops should still be monitored regularly to avoid sudden pest or disease attack.",
      "hi": "स्वस्थ फसल की भी नियमित निगरानी जरूरी है ताकि अचानक रोग या कीट हमला न हो।",
      "mr": "निरोगी पिकाचीसुद्धा नियमित पाहणी करा म्हणजे अचानक रोग किंवा किडीचा प्रादुर्भाव टाळता येतो."
    },
  },

  "Peach___Bacterial_Spot": {
    "problem": {
      "en": "Bacterial Spot causes dark lesions on peach leaves and fruits, leading to defoliation and poor fruit quality.",
      "hi": "बैक्टीरियल स्पॉट रोग में पत्तियों और फलों पर काले धब्बे बनते हैं जिससे पत्तियां गिरने लगती हैं और फल खराब हो जाते हैं।",
      "mr": "बॅक्टेरियल स्पॉट रोगामुळे पानांवर आणि फळांवर काळे डाग पडतात, पाने गळतात आणि फळांची गुणवत्ता कमी होते."
    },
    "medicine": {
      "en": "Spray Copper Oxychloride or Streptocycline to manage bacterial infection.",
      "hi": "रोग नियंत्रण के लिए Copper Oxychloride या Streptocycline का छिड़काव करें।",
      "mr": "रोग नियंत्रणासाठी Copper Oxychloride किंवा Streptocycline ची फवारणी करावी."
    },
    "dosage": {
      "en": "Use Copper Oxychloride 3 gram and Streptocycline 0.5 gram per liter of water.",
      "hi": "Copper Oxychloride 3 ग्राम और Streptocycline 0.5 ग्राम प्रति लीटर पानी में मिलाएं।",
      "mr": "Copper Oxychloride 3 ग्रॅम आणि Streptocycline 0.5 ग्रॅम प्रति लिटर पाण्यात मिसळा."
    },
    "fertilizer": {
      "en": "Apply balanced fertilizer rich in potassium to improve plant resistance.",
      "hi": "पौधों की रोग प्रतिरोधक क्षमता बढ़ाने के लिए पोटाशयुक्त संतुलित खाद दें।",
      "mr": "झाडांची रोगप्रतिकारक क्षमता वाढवण्यासाठी पोटॅशयुक्त संतुलित खत द्यावे."
    },
    "root_condition": {
      "en": "Roots may weaken if the infection remains severe for a long period.",
      "hi": "लंबे समय तक संक्रमण रहने पर जड़ें कमजोर हो सकती हैं।",
      "mr": "रोग दीर्घकाळ राहिल्यास मुळे कमकुवत होऊ शकतात."
    },
    "soil_condition": {
      "en": "Poor drainage and excess moisture increase bacterial infection.",
      "hi": "अधिक नमी और खराब जल निकासी से रोग बढ़ता है।",
      "mr": "जास्त ओलावा आणि पाण्याचा निचरा न झाल्यास रोग वाढतो."
    },
    "weather_effect": {
      "en": "Rainy and humid weather promotes bacterial spread rapidly.",
      "hi": "बरसात और अधिक नमी वाले मौसम में रोग तेजी से फैलता है।",
      "mr": "पावसाळी आणि दमट हवामानात रोग जलद पसरतो."
    },
    "prevention": {
      "en": "Prune infected branches, avoid overhead irrigation, and maintain orchard cleanliness.",
      "hi": "संक्रमित शाखाएं काटें, ऊपर से सिंचाई न करें और बगीचे को साफ रखें।",
      "mr": "संक्रमित फांद्या काढून टाका, वरून पाणी देणे टाळा आणि बाग स्वच्छ ठेवा."
    },
    "farmer_tip": {
      "en": "Spraying preventive copper fungicide before monsoon helps reduce disease spread.",
      "hi": "मानसून से पहले कॉपर आधारित दवा का छिड़काव रोग नियंत्रण में मदद करता है।",
      "mr": "पावसाळ्यापूर्वी कॉपरयुक्त औषधाची फवारणी केल्यास रोग कमी होतो."
    },
  },
  "Pepper___Healthy": {
    "problem": {
      "en": "Healthy pepper plants show dark green leaves, strong stems, proper flowering, and good fruit development without any disease symptoms.",
      "hi": "स्वस्थ मिर्च के पौधों में गहरे हरे पत्ते, मजबूत तना, अच्छे फूल और स्वस्थ फल दिखाई देते हैं।",
      "mr": "निरोगी मिरचीच्या झाडांमध्ये गर्द हिरवी पाने, मजबूत खोड, चांगली फुलधारणा आणि निरोगी फळे दिसतात."
    },
    "medicine": {
      "en": "No medicine is required for healthy plants. Preventive bio-fungicide spray may be used occasionally.",
      "hi": "स्वस्थ पौधों के लिए किसी दवा की आवश्यकता नहीं होती। जरूरत पड़ने पर जैविक फफूंदनाशक का उपयोग कर सकते हैं।",
      "mr": "निरोगी झाडांसाठी औषधाची गरज नसते. गरज असल्यास जैविक बुरशीनाशक वापरू शकता."
    },
    "dosage": {
      "en": "Use bio-fungicide 2 gram per liter of water for preventive protection.",
      "hi": "बचाव हेतु जैविक फफूंदनाशक 2 ग्राम प्रति लीटर पानी में मिलाकर उपयोग करें।",
      "mr": "प्रतिबंधात्मक वापरासाठी जैविक बुरशीनाशक 2 ग्रॅम प्रति लिटर पाण्यात मिसळावे."
    },
    "fertilizer": {
      "en": "Apply balanced NPK fertilizer along with compost and micronutrients for healthy crop growth.",
      "hi": "संतुलित NPK उर्वरक, जैविक खाद और सूक्ष्म पोषक तत्वों का उपयोग करें।",
      "mr": "संतुलित NPK खत, सेंद्रिय खत आणि सूक्ष्म अन्नद्रव्यांचा वापर करावा."
    },
    "root_condition": {
      "en": "Roots remain healthy, active, and capable of proper nutrient absorption.",
      "hi": "जड़ें मजबूत और सक्रिय रहती हैं तथा पोषक तत्व अच्छी तरह ग्रहण करती हैं।",
      "mr": "मुळे मजबूत आणि सक्रिय राहून अन्नद्रव्यांचे शोषण चांगले करतात."
    },
    "soil_condition": {
      "en": "Well-drained fertile soil with moderate moisture supports healthy pepper growth.",
      "hi": "अच्छी जल निकासी वाली उपजाऊ मिट्टी मिर्च की फसल के लिए उपयुक्त होती है।",
      "mr": "चांगला निचरा होणारी सुपीक जमीन मिरची पिकासाठी योग्य असते."
    },
    "weather_effect": {
      "en": "Warm weather with balanced humidity promotes healthy plant development.",
      "hi": "हल्का गर्म और संतुलित नमी वाला मौसम फसल की अच्छी वृद्धि में मदद करता है।",
      "mr": "उबदार आणि संतुलित आर्द्रतेचे हवामान निरोगी वाढीस मदत करते."
    },
    "prevention": {
      "en": "Maintain proper irrigation, weed control, and regular crop monitoring to keep plants healthy.",
      "hi": "समय पर सिंचाई, खरपतवार नियंत्रण और नियमित निगरानी बनाए रखें।",
      "mr": "वेळेवर पाणी, तण नियंत्रण आणि नियमित निरीक्षण ठेवावे."
    },
    "farmer_tip": {
      "en": "Even healthy crops should be inspected weekly to detect early pest or disease problems.",
      "hi": "स्वस्थ फसल की भी साप्ताहिक जांच करें ताकि रोग या कीट का शुरुआती पता चल सके।",
      "mr": "निरोगी पिकाचीसुद्धा आठवड्यातून एकदा तपासणी करावी म्हणजे रोग किंवा किडीचा प्रादुर्भाव लवकर ओळखता येतो."
    },
  },

  "Potato___Early_Blight": {
    "problem": {
      "en": "Early Blight causes brown circular spots with concentric rings on potato leaves, reducing photosynthesis and lowering tuber yield.",
      "hi": "अर्ली ब्लाइट रोग में पत्तियों पर भूरे गोल धब्बे बनते हैं जिनमें गोल-गोल छल्ले दिखाई देते हैं, जिससे उत्पादन कम हो जाता है।",
      "mr": "अर्ली ब्लाइट रोगामुळे बटाट्याच्या पानांवर गोल तपकिरी डाग आणि वर्तुळाकार रेषा दिसतात, त्यामुळे उत्पादन घटते."
    },
    "medicine": {
      "en": "Spray Mancozeb or Chlorothalonil fungicide to control Early Blight infection.",
      "hi": "रोग नियंत्रण के लिए Mancozeb या Chlorothalonil का छिड़काव करें।",
      "mr": "रोग नियंत्रणासाठी Mancozeb किंवा Chlorothalonil ची फवारणी करावी."
    },
    "dosage": {
      "en": "Use Mancozeb 2.5 gram or Chlorothalonil 2 gram per liter of water.",
      "hi": "Mancozeb 2.5 ग्राम या Chlorothalonil 2 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।",
      "mr": "Mancozeb 2.5 ग्रॅम किंवा Chlorothalonil 2 ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करावी."
    },
    "fertilizer": {
      "en": "Apply balanced fertilizer with sufficient potassium to strengthen plant resistance.",
      "hi": "पौधों की मजबूती के लिए पोटाशयुक्त संतुलित खाद का उपयोग करें।",
      "mr": "झाडांची ताकद वाढवण्यासाठी पोटॅशयुक्त संतुलित खत वापरावे."
    },
    "root_condition": {
      "en": "Roots become weak if infection remains uncontrolled for a long time.",
      "hi": "रोग लंबे समय तक रहने पर जड़ें कमजोर होने लगती हैं।",
      "mr": "रोग दीर्घकाळ राहिल्यास मुळे कमकुवत होतात."
    },
    "soil_condition": {
      "en": "Low fertility soil and poor drainage increase disease severity.",
      "hi": "कमजोर और खराब जल निकासी वाली मिट्टी में रोग अधिक बढ़ता है।",
      "mr": "कमकुवत आणि पाण्याचा निचरा न होणाऱ्या जमिनीत रोग वाढतो."
    },
    "weather_effect": {
      "en": "Warm and humid weather favors fungal growth and rapid disease spread.",
      "hi": "गर्म और नम मौसम में रोग तेजी से फैलता है।",
      "mr": "उष्ण आणि दमट हवामानात रोग जलद वाढतो."
    },
    "prevention": {
      "en": "Use disease-free seed tubers, avoid overcrowding, and remove infected leaves regularly.",
      "hi": "रोगमुक्त बीज का उपयोग करें, पौधों में उचित दूरी रखें और संक्रमित पत्तियां हटाएं।",
      "mr": "रोगमुक्त बियाणे वापरा, योग्य अंतर ठेवा आणि संक्रमित पाने काढून टाका."
    },
    "farmer_tip": {
      "en": "Start fungicide spray immediately after the first symptoms appear to avoid major crop loss.",
      "hi": "रोग के शुरुआती लक्षण दिखते ही दवा का छिड़काव शुरू करें।",
      "mr": "रोगाची सुरुवातीची लक्षणे दिसताच लगेच फवारणी सुरू करावी."
    },
  },

  "Potato___Healthy": {
    "problem": {
      "en": "Healthy potato plants have green foliage, strong stems, and proper tuber development without signs of disease or pest damage.",
      "hi": "स्वस्थ आलू के पौधों में हरी पत्तियां, मजबूत तना और अच्छे कंद विकास दिखाई देते हैं।",
      "mr": "निरोगी बटाटा पिकात हिरवी पाने, मजबूत खोड आणि चांगले कंद तयार होतात."
    },
    "medicine": {
      "en": "No medicine required for healthy plants. Preventive fungicide can be applied if weather becomes favorable for disease.",
      "hi": "स्वस्थ फसल में दवा की आवश्यकता नहीं होती। मौसम अनुकूल होने पर बचाव हेतु फफूंदनाशक का उपयोग कर सकते हैं।",
      "mr": "निरोगी पिकासाठी औषधाची गरज नसते. रोगाचा धोका असल्यास प्रतिबंधात्मक फवारणी करू शकता."
    },
    "dosage": {
      "en": "Use preventive Mancozeb 2 gram per liter if required.",
      "hi": "जर आवश्यकता हो तो Mancozeb 2 ग्राम प्रति लीटर पानी में मिलाकर उपयोग करें।",
      "mr": "गरज असल्यास Mancozeb 2 ग्रॅम प्रति लिटर पाण्यात मिसळून वापरा."
    },
    "fertilizer": {
      "en": "Apply balanced NPK fertilizer and organic manure for healthy tuber growth.",
      "hi": "अच्छे कंद विकास के लिए संतुलित NPK और जैविक खाद दें।",
      "mr": "चांगल्या कंद वाढीसाठी संतुलित NPK आणि सेंद्रिय खत वापरावे."
    },
    "root_condition": {
      "en": "Roots remain healthy and absorb nutrients efficiently.",
      "hi": "जड़ें स्वस्थ रहती हैं और पोषक तत्वों का अच्छा अवशोषण करती हैं।",
      "mr": "मुळे निरोगी राहून अन्नद्रव्यांचे शोषण चांगले करतात."
    },
    "soil_condition": {
      "en": "Loose, fertile, and well-drained soil is ideal for healthy potato crops.",
      "hi": "भुरभुरी और अच्छी जल निकासी वाली मिट्टी आलू के लिए उपयुक्त होती है।",
      "mr": "भुसभुशीत आणि चांगला निचरा होणारी जमीन बटाट्यासाठी उत्तम असते."
    },
    "weather_effect": {
      "en": "Cool climate with moderate moisture supports healthy potato growth.",
      "hi": "ठंडा और हल्की नमी वाला मौसम आलू की अच्छी वृद्धि में मदद करता है।",
      "mr": "थंड आणि मध्यम ओलावा असलेले हवामान बटाट्याच्या वाढीस चांगले असते."
    },
    "prevention": {
      "en": "Maintain crop rotation, balanced irrigation, and regular monitoring for healthy production.",
      "hi": "फसल चक्र अपनाएं, संतुलित सिंचाई करें और नियमित निगरानी रखें।",
      "mr": "पीक फेरपालट करा, संतुलित पाणी द्या आणि नियमित निरीक्षण ठेवा."
    },
    "farmer_tip": {
      "en": "Avoid excessive nitrogen fertilizer because it can increase disease susceptibility later.",
      "hi": "अत्यधिक नाइट्रोजन खाद का उपयोग न करें क्योंकि इससे बाद में रोग बढ़ सकते हैं।",
      "mr": "जास्त नत्रयुक्त खत टाळा कारण त्यामुळे पुढे रोग वाढू शकतो."
    },
  },

  "Potato___Late_Blight": {
    "problem": {
      "en": "Late Blight is a highly destructive fungal-like disease in potato that causes water-soaked dark lesions on leaves and stems. In severe conditions, the entire crop may collapse rapidly and tubers may rot during storage.",
      "hi": "लेट ब्लाइट आलू की अत्यंत खतरनाक बीमारी है जिसमें पत्तियों और तनों पर पानी जैसे गहरे धब्बे दिखाई देते हैं। गंभीर स्थिति में पूरी फसल तेजी से खराब हो सकती है और भंडारण में कंद सड़ सकते हैं।",
      "mr": "लेट ब्लाइट हा बटाट्यातील अत्यंत घातक रोग आहे. पानांवर आणि खोडावर पाण्यासारखे काळसर डाग दिसतात. रोग वाढल्यास संपूर्ण पीक झपाट्याने नष्ट होऊ शकते आणि साठवणीत कंद सडू शकतात."
    },
    "medicine": {
      "en": "Spray Metalaxyl + Mancozeb or Cymoxanil + Mancozeb fungicide immediately after symptoms appear.",
      "hi": "रोग नियंत्रण के लिए Metalaxyl + Mancozeb या Cymoxanil + Mancozeb का तुरंत छिड़काव करें।",
      "mr": "रोग दिसताच Metalaxyl + Mancozeb किंवा Cymoxanil + Mancozeb ची फवारणी करावी."
    },
    "dosage": {
      "en": "Use Metalaxyl + Mancozeb 2.5 gram per liter of water.",
      "hi": "Metalaxyl + Mancozeb 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।",
      "mr": "Metalaxyl + Mancozeb 2.5 ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करावी."
    },
    "fertilizer": {
      "en": "Apply balanced NPK fertilizer with adequate potassium to strengthen plant immunity.",
      "hi": "पौधों की रोग प्रतिरोधक क्षमता बढ़ाने के लिए संतुलित NPK और पर्याप्त पोटाश दें।",
      "mr": "झाडांची रोगप्रतिकारक शक्ती वाढवण्यासाठी संतुलित NPK आणि पुरेसे पोटॅश खत द्यावे."
    },
    "root_condition": {
      "en": "Roots and tubers become weak and prone to rotting under severe infection.",
      "hi": "गंभीर संक्रमण में जड़ें और कंद कमजोर होकर सड़ने लगते हैं।",
      "mr": "तीव्र रोगामुळे मुळे आणि कंद कमकुवत होऊन सडू लागतात."
    },
    "soil_condition": {
      "en": "Poorly drained and continuously wet soil increases disease development.",
      "hi": "लगातार गीली और खराब जल निकासी वाली मिट्टी में रोग तेजी से बढ़ता है।",
      "mr": "सतत ओली आणि पाण्याचा निचरा न होणारी जमीन रोग वाढवते."
    },
    "weather_effect": {
      "en": "Cool, cloudy, and humid weather strongly favors Late Blight spread.",
      "hi": "ठंडा, बादलयुक्त और नम मौसम रोग फैलने के लिए अनुकूल होता है।",
      "mr": "थंड, ढगाळ आणि दमट हवामानात रोग जलद पसरतो."
    },
    "prevention": {
      "en": "Use certified seed tubers, avoid water stagnation, and start preventive fungicide sprays before disease spread.",
      "hi": "प्रमाणित बीज का उपयोग करें, खेत में पानी जमा न होने दें और समय पर बचाव हेतु फफूंदनाशक का छिड़काव करें।",
      "mr": "प्रमाणित बियाणे वापरा, शेतात पाणी साचू देऊ नका आणि वेळेवर प्रतिबंधात्मक फवारणी करा."
    },
    "farmer_tip": {
      "en": "During cloudy and rainy weather, inspect fields daily because Late Blight spreads very quickly.",
      "hi": "बारिश और बादल वाले मौसम में खेत की रोज जांच करें क्योंकि यह रोग बहुत तेजी से फैलता है।",
      "mr": "पावसाळी आणि ढगाळ हवामानात रोज शेताची पाहणी करा कारण हा रोग खूप वेगाने पसरतो."
    },
  },

  "Strawberry___Healthy": {
    "problem": {
      "en": "Healthy strawberry plants show fresh green leaves, strong runners, healthy roots, and good quality fruits without disease symptoms.",
      "hi": "स्वस्थ स्ट्रॉबेरी पौधों में हरे पत्ते, मजबूत जड़ें और अच्छी गुणवत्ता वाले फल दिखाई देते हैं।",
      "mr": "निरोगी स्ट्रॉबेरी झाडांमध्ये हिरवीगार पाने, मजबूत मुळे आणि चांगल्या प्रतीची फळे दिसतात."
    },
    "medicine": {
      "en": "No medicine is required for healthy plants. Preventive organic sprays may be used if necessary.",
      "hi": "स्वस्थ पौधों में दवा की आवश्यकता नहीं होती। आवश्यकता होने पर जैविक बचाव स्प्रे कर सकते हैं।",
      "mr": "निरोगी झाडांसाठी औषधाची गरज नसते. गरज असल्यास जैविक प्रतिबंधात्मक फवारणी करू शकता."
    },
    "dosage": {
      "en": "Use bio-fungicide 2 gram per liter for preventive care if required.",
      "hi": "जर जरूरत हो तो जैविक फफूंदनाशक 2 ग्राम प्रति लीटर पानी में मिलाएं।",
      "mr": "गरज असल्यास जैविक बुरशीनाशक 2 ग्रॅम प्रति लिटर पाण्यात वापरा."
    },
    "fertilizer": {
      "en": "Apply compost, balanced NPK fertilizer, and calcium for better fruit quality.",
      "hi": "अच्छे फल उत्पादन के लिए जैविक खाद, संतुलित NPK और कैल्शियम दें।",
      "mr": "चांगल्या फळांसाठी सेंद्रिय खत, संतुलित NPK आणि कॅल्शियम द्यावे."
    },
    "root_condition": {
      "en": "Healthy roots remain white and active with efficient nutrient uptake.",
      "hi": "स्वस्थ जड़ें सफेद और सक्रिय रहती हैं तथा पोषक तत्व अच्छी तरह ग्रहण करती हैं।",
      "mr": "निरोगी मुळे पांढरी आणि सक्रिय राहून अन्नद्रव्य शोषण चांगले करतात."
    },
    "soil_condition": {
      "en": "Well-drained sandy loam soil with organic matter is best for strawberry growth.",
      "hi": "अच्छी जल निकासी वाली बलुई दोमट मिट्टी स्ट्रॉबेरी के लिए उपयुक्त होती है।",
      "mr": "चांगला निचरा होणारी हलकी सुपीक जमीन स्ट्रॉबेरीसाठी उत्तम असते."
    },
    "weather_effect": {
      "en": "Cool weather with moderate sunlight supports healthy flowering and fruiting.",
      "hi": "हल्का ठंडा मौसम और संतुलित धूप अच्छी वृद्धि और फलन में मदद करती है।",
      "mr": "थंडसर हवामान आणि मध्यम सूर्यप्रकाश चांगल्या वाढीस मदत करतो."
    },
    "prevention": {
      "en": "Maintain proper spacing, mulching, irrigation, and field cleanliness for healthy crop growth.",
      "hi": "उचित दूरी, मल्चिंग, सिंचाई और खेत की सफाई बनाए रखें।",
      "mr": "योग्य अंतर, मल्चिंग, सिंचन आणि शेताची स्वच्छता राखावी."
    },
    "farmer_tip": {
      "en": "Avoid excessive irrigation because waterlogging can quickly damage strawberry roots.",
      "hi": "अधिक सिंचाई से बचें क्योंकि पानी भरने से जड़ें जल्दी खराब हो सकती हैं।",
      "mr": "जास्त पाणी देणे टाळा कारण पाणी साचल्यास मुळे लवकर खराब होतात."
    },
  },

  "Strawberry___Leaf_Scorch": {
    "problem": {
      "en": "Leaf Scorch causes purple or brown patches on strawberry leaves which later dry and burn from the edges, reducing plant vigor and fruit quality.",
      "hi": "लीफ स्कॉर्च रोग में पत्तियों पर बैंगनी या भूरे धब्बे बनते हैं और बाद में किनारे सूखने लगते हैं, जिससे पौधा कमजोर हो जाता है।",
      "mr": "लीफ स्कॉर्च रोगामुळे स्ट्रॉबेरीच्या पानांवर जांभळे किंवा तपकिरी डाग पडतात आणि पाने कडांपासून सुकू लागतात."
    },
    "medicine": {
      "en": "Spray Copper Oxychloride or Mancozeb fungicide to control fungal infection.",
      "hi": "रोग नियंत्रण के लिए Copper Oxychloride या Mancozeb का छिड़काव करें।",
      "mr": "रोग नियंत्रणासाठी Copper Oxychloride किंवा Mancozeb ची फवारणी करावी."
    },
    "dosage": {
      "en": "Use Mancozeb 2.5 gram or Copper Oxychloride 3 gram per liter of water.",
      "hi": "Mancozeb 2.5 ग्राम या Copper Oxychloride 3 ग्राम प्रति लीटर पानी में मिलाएं।",
      "mr": "Mancozeb 2.5 ग्रॅम किंवा Copper Oxychloride 3 ग्रॅम प्रति लिटर पाण्यात मिसळा."
    },
    "fertilizer": {
      "en": "Apply balanced fertilizer with micronutrients to improve plant recovery.",
      "hi": "पौधों की रिकवरी के लिए सूक्ष्म पोषक तत्वों सहित संतुलित खाद दें।",
      "mr": "झाडांच्या पुनर्वाढीसाठी सूक्ष्म अन्नद्रव्यांसह संतुलित खत द्यावे."
    },
    "root_condition": {
      "en": "Roots become stressed if infection continues for a long period.",
      "hi": "लंबे समय तक संक्रमण रहने पर जड़ें कमजोर हो जाती हैं।",
      "mr": "रोग जास्त काळ राहिल्यास मुळे तणावाखाली येतात."
    },
    "soil_condition": {
      "en": "Excess moisture and poor air circulation in soil favor disease development.",
      "hi": "अधिक नमी और कम वायु संचार रोग बढ़ाने में मदद करते हैं।",
      "mr": "जास्त ओलावा आणि कमी हवा खेळती राहिल्यास रोग वाढतो."
    },
    "weather_effect": {
      "en": "Humid and cool weather increases fungal spread on leaves.",
      "hi": "ठंडा और नम मौसम रोग फैलने के लिए अनुकूल होता है।",
      "mr": "थंड आणि दमट हवामानात रोग वाढतो."
    },
    "prevention": {
      "en": "Remove infected leaves, avoid overhead irrigation, and maintain proper plant spacing.",
      "hi": "संक्रमित पत्तियां हटाएं, ऊपर से सिंचाई न करें और उचित दूरी रखें।",
      "mr": "संक्रमित पाने काढा, वरून पाणी देणे टाळा आणि योग्य अंतर ठेवा."
    },
    "farmer_tip": {
      "en": "Morning irrigation is better because leaves dry faster and fungal infection reduces.",
      "hi": "सुबह सिंचाई करना बेहतर होता है क्योंकि पत्तियां जल्दी सूखती हैं और रोग कम फैलता है।",
      "mr": "सकाळी पाणी दिल्यास पाने लवकर सुकतात आणि रोग कमी पसरतो."
    },
  },

  "Sugarcane___Sugarcane_Healthy": {
    "problem": {
      "en": "Healthy sugarcane plants show vigorous growth, green leaves, strong stems, and good cane thickness without disease symptoms.",
      "hi": "स्वस्थ गन्ने की फसल में हरी पत्तियां, मजबूत तना और अच्छा विकास दिखाई देता है।",
      "mr": "निरोगी ऊस पिकात हिरवी पाने, मजबूत खोड आणि चांगली वाढ दिसून येते."
    },
    "medicine": {
      "en": "No medicine required for healthy crop. Preventive bio-fertilizer application may be used.",
      "hi": "स्वस्थ फसल में दवा की आवश्यकता नहीं होती। आवश्यकता होने पर जैविक उत्पाद उपयोग कर सकते हैं।",
      "mr": "निरोगी पिकासाठी औषधाची गरज नसते. गरज असल्यास जैविक उत्पादने वापरू शकता."
    },
    "dosage": {
      "en": "Use bio-fertilizer 5 kg per acre during soil application.",
      "hi": "जैविक खाद 5 किलो प्रति एकड़ मिट्टी में मिलाएं।",
      "mr": "जैविक खत 5 किलो प्रति एकर जमिनीत मिसळावे."
    },
    "fertilizer": {
      "en": "Apply recommended nitrogen, phosphorus, and potash along with organic manure.",
      "hi": "अनुशंसित नाइट्रोजन, फास्फोरस, पोटाश और जैविक खाद का उपयोग करें।",
      "mr": "शिफारस केलेले नत्र, स्फुरद, पालाश आणि सेंद्रिय खत वापरावे."
    },
    "root_condition": {
      "en": "Roots remain deep, healthy, and capable of efficient water absorption.",
      "hi": "जड़ें मजबूत और गहरी रहती हैं तथा पानी का अच्छा अवशोषण करती हैं।",
      "mr": "मुळे मजबूत आणि खोलवर जाऊन पाण्याचे शोषण चांगले करतात."
    },
    "soil_condition": {
      "en": "Deep fertile soil with good drainage supports healthy sugarcane growth.",
      "hi": "गहरी उपजाऊ और अच्छी जल निकासी वाली मिट्टी गन्ने के लिए उत्तम होती है।",
      "mr": "खोल आणि सुपीक तसेच चांगला निचरा होणारी जमीन ऊसासाठी उत्तम असते."
    },
    "weather_effect": {
      "en": "Warm climate with proper irrigation promotes healthy cane growth.",
      "hi": "गर्म मौसम और उचित सिंचाई गन्ने की अच्छी वृद्धि में मदद करती है।",
      "mr": "उबदार हवामान आणि योग्य सिंचन उसाच्या वाढीस मदत करतात."
    },
    "prevention": {
      "en": "Maintain proper field sanitation, irrigation management, and timely fertilizer application.",
      "hi": "खेत की सफाई, संतुलित सिंचाई और समय पर खाद प्रबंधन बनाए रखें।",
      "mr": "शेत स्वच्छता, संतुलित सिंचन आणि वेळेवर खत व्यवस्थापन करावे."
    },
    "farmer_tip": {
      "en": "Regularly remove weeds because they compete for nutrients and reduce cane growth.",
      "hi": "खरपतवार को समय पर हटाएं क्योंकि वे पोषक तत्वों की प्रतिस्पर्धा करते हैं।",
      "mr": "तण वेळेवर काढा कारण ते अन्नद्रव्यांवर स्पर्धा करतात."
    },
  },

  "Sugarcane___Sugarcane_Healthy": {
    "problem": {
      "en": "Healthy sugarcane plants show vigorous growth, green leaves, strong stems, and good cane thickness without disease symptoms.",
      "hi": "स्वस्थ गन्ने की फसल में हरी पत्तियां, मजबूत तना और अच्छा विकास दिखाई देता है।",
      "mr": "निरोगी ऊस पिकात हिरवी पाने, मजबूत खोड आणि चांगली वाढ दिसून येते."
    },
    "medicine": {
      "en": "No medicine required for healthy crop. Preventive bio-fertilizer application may be used.",
      "hi": "स्वस्थ फसल में दवा की आवश्यकता नहीं होती। आवश्यकता होने पर जैविक उत्पाद उपयोग कर सकते हैं।",
      "mr": "निरोगी पिकासाठी औषधाची गरज नसते. गरज असल्यास जैविक उत्पादने वापरू शकता."
    },
    "dosage": {
      "en": "Use bio-fertilizer 5 kg per acre during soil application.",
      "hi": "जैविक खाद 5 किलो प्रति एकड़ मिट्टी में मिलाएं।",
      "mr": "जैविक खत 5 किलो प्रति एकर जमिनीत मिसळावे."
    },
    "fertilizer": {
      "en": "Apply recommended nitrogen, phosphorus, and potash along with organic manure.",
      "hi": "अनुशंसित नाइट्रोजन, फास्फोरस, पोटाश और जैविक खाद का उपयोग करें।",
      "mr": "शिफारस केलेले नत्र, स्फुरद, पालाश आणि सेंद्रिय खत वापरावे."
    },
    "root_condition": {
      "en": "Roots remain deep, healthy, and capable of efficient water absorption.",
      "hi": "जड़ें मजबूत और गहरी रहती हैं तथा पानी का अच्छा अवशोषण करती हैं।",
      "mr": "मुळे मजबूत आणि खोलवर जाऊन पाण्याचे शोषण चांगले करतात."
    },
    "soil_condition": {
      "en": "Deep fertile soil with good drainage supports healthy sugarcane growth.",
      "hi": "गहरी उपजाऊ और अच्छी जल निकासी वाली मिट्टी गन्ने के लिए उत्तम होती है।",
      "mr": "खोल आणि सुपीक तसेच चांगला निचरा होणारी जमीन ऊसासाठी उत्तम असते."
    },
    "weather_effect": {
      "en": "Warm climate with proper irrigation promotes healthy cane growth.",
      "hi": "गर्म मौसम और उचित सिंचाई गन्ने की अच्छी वृद्धि में मदद करती है।",
      "mr": "उबदार हवामान आणि योग्य सिंचन उसाच्या वाढीस मदत करतात."
    },
    "prevention": {
      "en": "Maintain proper field sanitation, irrigation management, and timely fertilizer application.",
      "hi": "खेत की सफाई, संतुलित सिंचाई और समय पर खाद प्रबंधन बनाए रखें।",
      "mr": "शेत स्वच्छता, संतुलित सिंचन आणि वेळेवर खत व्यवस्थापन करावे."
    },
    "farmer_tip": {
      "en": "Regularly remove weeds because they compete for nutrients and reduce cane growth.",
      "hi": "खरपतवार को समय पर हटाएं क्योंकि वे पोषक तत्वों की प्रतिस्पर्धा करते हैं।",
      "mr": "तण वेळेवर काढा कारण ते अन्नद्रव्यांवर स्पर्धा करतात."
    },
  },

  "Sugarcane___Sugarcane_Mosaic": {
    "problem": {
      "en": "Sugarcane Mosaic is a viral disease that causes light green and yellow mosaic patterns on leaves, resulting in poor cane growth and reduced sugar recovery.",
      "hi": "गन्ने का मोज़ेक रोग वायरस के कारण होता है जिसमें पत्तियों पर हल्के हरे और पीले रंग के धब्बे दिखाई देते हैं, जिससे फसल कमजोर हो जाती है।",
      "mr": "ऊसातील मोझॅक रोग हा विषाणूमुळे होतो. पानांवर फिकट हिरवे आणि पिवळे डाग दिसतात व उसाची वाढ कमी होते."
    },
    "medicine": {
      "en": "Control aphids using Imidacloprid or Thiamethoxam to reduce virus spread.",
      "hi": "वायरस फैलाने वाले माहू कीट को नियंत्रित करने के लिए Imidacloprid या Thiamethoxam का उपयोग करें।",
      "mr": "विषाणू पसरवणाऱ्या मावा किडीच्या नियंत्रणासाठी Imidacloprid किंवा Thiamethoxam वापरावे."
    },
    "dosage": {
      "en": "Use Imidacloprid 0.3 ml per liter or Thiamethoxam 0.25 gram per liter of water.",
      "hi": "Imidacloprid 0.3 मिली या Thiamethoxam 0.25 ग्राम प्रति लीटर पानी में मिलाएं।",
      "mr": "Imidacloprid 0.3 मिली किंवा Thiamethoxam 0.25 ग्रॅम प्रति लिटर पाण्यात मिसळावे."
    },
    "fertilizer": {
      "en": "Apply balanced fertilizer with micronutrients to improve plant vigor.",
      "hi": "पौधों की मजबूती के लिए संतुलित उर्वरक और सूक्ष्म पोषक तत्व दें।",
      "mr": "झाडांची ताकद वाढवण्यासाठी संतुलित खत आणि सूक्ष्म अन्नद्रव्ये द्यावीत."
    },
    "root_condition": {
      "en": "Roots become weak due to reduced plant energy and nutrient uptake.",
      "hi": "संक्रमित पौधों की जड़ें कमजोर हो जाती हैं और पोषण अवशोषण कम होता है।",
      "mr": "संक्रमित झाडांची मुळे कमकुवत होतात आणि अन्नद्रव्य शोषण कमी होते."
    },
    "soil_condition": {
      "en": "Nutrient-deficient soil weakens plants and increases disease impact.",
      "hi": "कमजोर मिट्टी पौधों को कमजोर बनाती है और रोग का प्रभाव बढ़ाती है।",
      "mr": "कमकुवत जमीन झाडांची ताकद कमी करून रोगाचा प्रभाव वाढवते."
    },
    "weather_effect": {
      "en": "Warm and humid conditions favor aphid multiplication and virus spread.",
      "hi": "गर्म और नम मौसम में माहू कीट तेजी से बढ़ते हैं और रोग फैलता है।",
      "mr": "उष्ण आणि दमट हवामानात मावा किड वाढून रोग जलद पसरतो."
    },
    "prevention": {
      "en": "Use disease-free setts, control insect vectors, and remove infected plants immediately.",
      "hi": "रोगमुक्त बीज का उपयोग करें, कीट नियंत्रण करें और संक्रमित पौधों को हटाएं।",
      "mr": "रोगमुक्त बेणे वापरा, किड नियंत्रण करा आणि संक्रमित झाडे काढून टाका."
    },
    "farmer_tip": {
      "en": "Avoid using setts from infected fields because Mosaic spreads easily through planting material.",
      "hi": "संक्रमित खेत के बीज का उपयोग न करें क्योंकि यह रोग बीज से तेजी से फैलता है।",
      "mr": "संक्रमित शेतातील बेणे वापरू नका कारण हा रोग लागवड साहित्याद्वारे पटकन पसरतो."
    },
  },

  "Sugarcane___Sugarcane_RedRot": {
    "problem": {
      "en": "Red Rot is a serious fungal disease in sugarcane that causes internal reddening of stalks, drying of leaves, and foul smell from infected canes.",
      "hi": "रेड रॉट गन्ने की गंभीर बीमारी है जिसमें तनों के अंदर लाल सड़न हो जाती है, पत्तियां सूखने लगती हैं और संक्रमित तनों से दुर्गंध आती है।",
      "mr": "रेड रॉट हा उसातील गंभीर रोग असून खोडाच्या आतील भागात लालसर कुज येते, पाने सुकतात आणि संक्रमित उसातून दुर्गंधी येते."
    },
    "medicine": {
      "en": "Treat seed setts with Carbendazim and use Trichoderma in soil for disease management.",
      "hi": "बीज उपचार के लिए Carbendazim का उपयोग करें और मिट्टी में Trichoderma मिलाएं।",
      "mr": "बेणे प्रक्रिया करण्यासाठी Carbendazim वापरा आणि जमिनीत Trichoderma वापरावे."
    },
    "dosage": {
      "en": "Use Carbendazim 2 gram per liter for sett treatment and Trichoderma 5 kg per acre.",
      "hi": "Carbendazim 2 ग्राम प्रति लीटर पानी में मिलाकर बीज उपचार करें तथा Trichoderma 5 किलो प्रति एकड़ उपयोग करें।",
      "mr": "Carbendazim 2 ग्रॅम प्रति लिटर पाण्यात मिसळून बेणे प्रक्रिया करा आणि Trichoderma 5 किलो प्रति एकर वापरा."
    },
    "fertilizer": {
      "en": "Apply organic manure and balanced fertilizer to improve cane strength.",
      "hi": "गन्ने की मजबूती के लिए जैविक खाद और संतुलित उर्वरक का उपयोग करें।",
      "mr": "उसाची ताकद वाढवण्यासाठी सेंद्रिय खत आणि संतुलित खत वापरावे."
    },
    "root_condition": {
      "en": "Roots and lower stem tissues rot under severe infection.",
      "hi": "गंभीर संक्रमण में जड़ें और निचला तना सड़ने लगता है।",
      "mr": "तीव्र रोगामुळे मुळे आणि खोडाचा खालचा भाग सडतो."
    },
    "soil_condition": {
      "en": "Waterlogged and infected soil increases Red Rot severity.",
      "hi": "पानी भरी और संक्रमित मिट्टी में रोग अधिक बढ़ता है।",
      "mr": "पाणी साचणारी आणि संक्रमित जमीन रोग वाढवते."
    },
    "weather_effect": {
      "en": "Warm and humid climate favors fungal infection and spread.",
      "hi": "गर्म और नम मौसम में रोग तेजी से फैलता है।",
      "mr": "उष्ण आणि दमट हवामानात रोग जलद वाढतो."
    },
    "prevention": {
      "en": "Use resistant varieties, healthy seed setts, and avoid ratooning infected fields.",
      "hi": "प्रतिरोधी किस्में लगाएं, स्वस्थ बीज का उपयोग करें और संक्रमित खेत में रैटून फसल न लें।",
      "mr": "प्रतिरोधक वाण वापरा, निरोगी बेणे वापरा आणि संक्रमित शेतात खोडवा घेऊ नका."
    },
    "farmer_tip": {
      "en": "Destroy severely infected clumps immediately to stop disease spread to nearby plants.",
      "hi": "गंभीर संक्रमित पौधों को तुरंत नष्ट करें ताकि रोग आगे न फैले।",
      "mr": "जास्त संक्रमित बेटे त्वरित नष्ट करा म्हणजे रोग इतर झाडांमध्ये पसरणार नाही."
    },
  },

  "Sugarcane___Sugarcane_Rust": {
    "problem": {
      "en": "Sugarcane Rust causes reddish-brown pustules on leaves which reduce photosynthesis and weaken cane growth.",
      "hi": "गन्ने के रस्ट रोग में पत्तियों पर लाल-भूरे धब्बे बनते हैं जिससे पौधा कमजोर हो जाता है।",
      "mr": "ऊसावरील रस्ट रोगामुळे पानांवर लालसर-तपकिरी डाग पडतात आणि झाडाची वाढ कमी होते."
    },
    "medicine": {
      "en": "Spray Propiconazole or Mancozeb fungicide for effective disease control.",
      "hi": "रोग नियंत्रण के लिए Propiconazole या Mancozeb का छिड़काव करें।",
      "mr": "रोग नियंत्रणासाठी Propiconazole किंवा Mancozeb ची फवारणी करावी."
    },
    "dosage": {
      "en": "Use Propiconazole 1 ml or Mancozeb 2.5 gram per liter of water.",
      "hi": "Propiconazole 1 मिली या Mancozeb 2.5 ग्राम प्रति लीटर पानी में मिलाएं।",
      "mr": "Propiconazole 1 मिली किंवा Mancozeb 2.5 ग्रॅम प्रति लिटर पाण्यात मिसळावे."
    },
    "fertilizer": {
      "en": "Apply balanced fertilizer and avoid excessive nitrogen application.",
      "hi": "संतुलित उर्वरक का उपयोग करें और अत्यधिक नाइट्रोजन से बचें।",
      "mr": "संतुलित खत वापरा आणि जास्त नत्रयुक्त खत टाळा."
    },
    "root_condition": {
      "en": "Roots become weak if severe leaf damage continues for a long time.",
      "hi": "लंबे समय तक रोग रहने पर जड़ें कमजोर हो जाती हैं।",
      "mr": "रोग जास्त काळ राहिल्यास मुळे कमकुवत होतात."
    },
    "soil_condition": {
      "en": "Excessive moisture and poor field ventilation support fungal development.",
      "hi": "अधिक नमी और कम वायु संचार रोग को बढ़ाते हैं।",
      "mr": "जास्त ओलावा आणि कमी हवा खेळती राहिल्यास रोग वाढतो."
    },
    "weather_effect": {
      "en": "Humid and moderately warm weather favors rust development.",
      "hi": "नम और हल्के गर्म मौसम में रस्ट रोग तेजी से फैलता है।",
      "mr": "दमट आणि उबदार हवामानात रस्ट रोग वाढतो."
    },
    "prevention": {
      "en": "Maintain field sanitation, avoid overcrowding, and monitor crops regularly.",
      "hi": "खेत की सफाई रखें, पौधों में उचित दूरी रखें और नियमित निगरानी करें।",
      "mr": "शेत स्वच्छ ठेवा, योग्य अंतर ठेवा आणि नियमित निरीक्षण करा."
    },
    "farmer_tip": {
      "en": "Early fungicide spray after the first symptoms helps prevent major crop loss.",
      "hi": "शुरुआती लक्षण दिखते ही दवा का छिड़काव करने से बड़ा नुकसान रोका जा सकता है।",
      "mr": "सुरुवातीची लक्षणे दिसताच फवारणी केल्यास मोठे नुकसान टाळता येते."
    },
  },
"Tomato___Late_Blight": {
    "problem": {
        "en": "Late blight is a severe fungal-like disease that causes dark brown to black water-soaked spots on tomato leaves, stems, and fruits. White fungal growth may appear on the underside of leaves during humid conditions. The disease spreads rapidly and can destroy the crop within a few days if not controlled early.",
        "hi": "लेट ब्लाइट टमाटर की बहुत खतरनाक बीमारी है जिसमें पत्तियों, तनों और फलों पर काले और पानी जैसे धब्बे दिखाई देते हैं। नमी वाले मौसम में पत्तियों के नीचे सफेद फफूंदी भी दिख सकती है। समय पर नियंत्रण न करने पर यह बीमारी कुछ ही दिनों में पूरी फसल खराब कर सकती है।",
        "mr": "लेट ब्लाइट हा टोमॅटोवरील अतिशय धोकादायक रोग आहे. या रोगामुळे पानांवर, खोडावर आणि फळांवर काळपट पाणचट डाग दिसतात. दमट हवामानात पानांच्या खालच्या बाजूस पांढरी बुरशी दिसू शकते. योग्य वेळी नियंत्रण न केल्यास काही दिवसांत संपूर्ण पीक नष्ट होऊ शकते."
    },
    "medicine": {
        "en": "Spray Metalaxyl + Mancozeb or Cymoxanil + Mancozeb fungicide immediately after symptoms appear.",
        "hi": "लक्षण दिखाई देते ही Metalaxyl + Mancozeb या Cymoxanil + Mancozeb दवा का छिड़काव करें।",
        "mr": "रोगाची लक्षणे दिसताच Metalaxyl + Mancozeb किंवा Cymoxanil + Mancozeb फवारणी करावी."
    },
    "dosage": {
        "en": "Use 2 to 2.5 grams medicine per liter of water and spray at 7 day interval.",
        "hi": "2 से 2.5 ग्राम दवा प्रति लीटर पानी में मिलाकर 7 दिन के अंतर से छिड़काव करें।",
        "mr": "प्रति लिटर पाण्यात 2 ते 2.5 ग्रॅम औषध मिसळून 7 दिवसांच्या अंतराने फवारणी करावी."
    },
    "fertilizer": {
        "en": "Apply balanced NPK fertilizer with sufficient potash to improve plant resistance and fruit quality.",
        "hi": "संतुलित NPK खाद के साथ पर्याप्त पोटाश दें ताकि पौधों की रोग प्रतिरोधक क्षमता बढ़े।",
        "mr": "संतुलित NPK खतासोबत पुरेशा प्रमाणात पोटॅश द्यावे जेणेकरून झाडांची रोगप्रतिकारक शक्ती वाढेल."
    },
    "root_condition": {
        "en": "Roots become weak due to excess moisture and poor drainage, reducing nutrient absorption.",
        "hi": "अधिक नमी और खराब जल निकासी के कारण जड़ें कमजोर हो जाती हैं और पोषण कम मिलता है।",
        "mr": "जास्त ओलावा आणि पाण्याचा निचरा न झाल्यामुळे मुळे कमकुवत होतात आणि अन्नद्रव्य शोषण कमी होते."
    },
    "soil_condition": {
        "en": "Disease spreads faster in poorly drained and continuously wet soil.",
        "hi": "खराब जल निकासी वाली और लगातार गीली मिट्टी में रोग तेजी से फैलता है।",
        "mr": "पाण्याचा निचरा न होणाऱ्या आणि सतत ओलसर जमिनीत रोग वेगाने पसरतो."
    },
    "weather_effect": {
        "en": "Cool, cloudy, and humid weather favors rapid disease spread.",
        "hi": "ठंडा, बादलों वाला और नमी भरा मौसम रोग फैलने के लिए अनुकूल होता है।",
        "mr": "थंड, ढगाळ आणि दमट हवामानात रोगाचा प्रादुर्भाव झपाट्याने वाढतो."
    },
    "prevention": {
        "en": "Avoid overhead irrigation, maintain proper spacing, and remove infected leaves immediately.",
        "hi": "ऊपर से सिंचाई न करें, पौधों में उचित दूरी रखें और संक्रमित पत्तियां तुरंत हटाएं।",
        "mr": "वरून पाणी देणे टाळा, झाडांमध्ये योग्य अंतर ठेवा आणि रोगग्रस्त पाने त्वरित काढून टाका."
    },
    "farmer_tip": {
        "en": "Inspect the crop regularly during rainy season because late blight spreads very quickly after rainfall.",
        "hi": "बरसात के मौसम में फसल की नियमित जांच करें क्योंकि बारिश के बाद यह रोग तेजी से फैलता है।",
        "mr": "पावसाळ्यात पिकाची नियमित पाहणी करा कारण पावसानंतर हा रोग खूप वेगाने पसरतो."
    },
},

"Wheat___Wheat_Healthy": {
    "problem": {
        "en": "Healthy wheat plants show proper green leaves, strong tillering, and uniform grain development without disease symptoms.",
        "hi": "स्वस्थ गेहूं की फसल में हरी पत्तियां, मजबूत शाखाएं और समान दाना विकास दिखाई देता है।",
        "mr": "निरोगी गव्हाच्या पिकात हिरवीगार पाने, चांगली फुटवे वाढ आणि समसमान दाणे दिसतात."
    },
    "medicine": {
        "en": "No medicine required. Regular crop monitoring and preventive care are sufficient.",
        "hi": "किसी दवा की आवश्यकता नहीं है। नियमित निगरानी और देखभाल पर्याप्त है।",
        "mr": "कोणत्याही औषधाची गरज नाही. नियमित निरीक्षण आणि योग्य काळजी पुरेशी आहे."
    },
    "dosage": {
        "en": "No chemical dosage required under healthy crop conditions.",
        "hi": "स्वस्थ फसल में किसी रासायनिक दवा की मात्रा की आवश्यकता नहीं होती।",
        "mr": "निरोगी पिकासाठी कोणत्याही रासायनिक औषधाची गरज नसते."
    },
    "fertilizer": {
        "en": "Apply recommended dose of NPK along with zinc and organic manure for better growth.",
        "hi": "बेहतर वृद्धि के लिए संतुलित NPK, जिंक और गोबर खाद का उपयोग करें।",
        "mr": "चांगल्या वाढीसाठी संतुलित NPK, झिंक आणि शेणखताचा वापर करावा."
    },
    "root_condition": {
        "en": "Healthy roots are white, fibrous, and absorb nutrients efficiently.",
        "hi": "स्वस्थ जड़ें सफेद, मजबूत और पोषक तत्वों को अच्छी तरह अवशोषित करती हैं।",
        "mr": "निरोगी मुळे पांढरी, मजबूत आणि अन्नद्रव्ये चांगल्या प्रकारे शोषून घेतात."
    },
    "soil_condition": {
        "en": "Well-drained fertile loamy soil supports healthy wheat growth.",
        "hi": "अच्छी जल निकासी वाली उपजाऊ दोमट मिट्टी स्वस्थ गेहूं के लिए उपयुक्त होती है।",
        "mr": "चांगला निचरा होणारी सुपीक गाळमिश्रित जमीन गव्हासाठी उत्तम असते."
    },
    "weather_effect": {
        "en": "Cool and dry weather supports proper wheat growth and grain filling.",
        "hi": "ठंडा और शुष्क मौसम गेहूं की अच्छी वृद्धि और दाना भराव के लिए उपयुक्त है।",
        "mr": "थंड आणि कोरडे हवामान गव्हाच्या वाढीसाठी आणि दाणे भरण्यासाठी अनुकूल असते."
    },
    "prevention": {
        "en": "Use certified seeds, balanced fertilizer, and timely irrigation to maintain healthy crop growth.",
        "hi": "प्रमाणित बीज, संतुलित खाद और समय पर सिंचाई से फसल स्वस्थ रहती है।",
        "mr": "प्रमाणित बियाणे, संतुलित खत आणि वेळेवर सिंचन केल्यास पीक निरोगी राहते."
    },
    "farmer_tip": {
        "en": "Monitor fields regularly to detect early signs of pests or nutrient deficiency.",
        "hi": "कीट या पोषण की कमी के शुरुआती लक्षणों के लिए खेत की नियमित जांच करें।",
        "mr": "किडी किंवा अन्नद्रव्य कमतरतेची सुरुवातीची लक्षणे ओळखण्यासाठी शेताची नियमित पाहणी करा."
    },
},

"Wheat___Wheat_septoria": {
    "problem": {
        "en": "Septoria leaf blotch causes yellow to brown lesions on wheat leaves, reducing photosynthesis and grain yield.",
        "hi": "सेप्टोरिया रोग में गेहूं की पत्तियों पर पीले और भूरे धब्बे बनते हैं जिससे उत्पादन कम हो जाता है।",
        "mr": "सेप्टोरिया रोगामुळे गव्हाच्या पानांवर पिवळे आणि तपकिरी डाग पडतात व उत्पादन घटते."
    },
    "medicine": {
        "en": "Spray Propiconazole or Tebuconazole fungicide after disease appearance.",
        "hi": "रोग दिखाई देने पर Propiconazole या Tebuconazole का छिड़काव करें।",
        "mr": "रोग दिसल्यानंतर Propiconazole किंवा Tebuconazole फवारणी करावी."
    },
    "dosage": {
        "en": "Use 1 ml fungicide per liter of water and repeat after 10 days if required.",
        "hi": "1 मिली दवा प्रति लीटर पानी में मिलाकर छिड़काव करें और आवश्यकता अनुसार 10 दिन बाद दोहराएं।",
        "mr": "प्रति लिटर पाण्यात 1 मिली औषध मिसळून फवारणी करावी आणि गरज असल्यास 10 दिवसांनी पुन्हा फवारणी करावी."
    },
    "fertilizer": {
        "en": "Avoid excess nitrogen and maintain balanced nutrient management.",
        "hi": "अधिक नाइट्रोजन से बचें और संतुलित पोषण प्रबंधन रखें।",
        "mr": "जास्त नत्र खत टाळावे आणि संतुलित अन्नद्रव्य व्यवस्थापन करावे."
    },
    "root_condition": {
        "en": "Root growth slows due to weakened plant health under severe infection.",
        "hi": "गंभीर संक्रमण में पौधों की जड़ वृद्धि कमजोर हो जाती है।",
        "mr": "तीव्र प्रादुर्भावामुळे झाडांची मुळे कमजोर होतात."
    },
    "soil_condition": {
        "en": "Poorly managed and continuously moist fields increase disease severity.",
        "hi": "लगातार गीली और खराब प्रबंधन वाली मिट्टी में रोग अधिक फैलता है।",
        "mr": "सतत ओलसर आणि अयोग्य व्यवस्थापन असलेल्या जमिनीत रोग जास्त वाढतो."
    },
    "weather_effect": {
        "en": "Cool and humid weather favors septoria disease development.",
        "hi": "ठंडा और नम मौसम इस रोग के लिए अनुकूल होता है।",
        "mr": "थंड आणि दमट हवामानात हा रोग वाढतो."
    },
    "prevention": {
        "en": "Use resistant varieties and avoid dense sowing in the field.",
        "hi": "प्रतिरोधी किस्मों का उपयोग करें और अधिक घनी बुवाई से बचें।",
        "mr": "प्रतिरोधक वाण वापरा आणि दाट पेरणी टाळा."
    },
    "farmer_tip": {
        "en": "Remove infected crop residues after harvest to reduce future infection.",
        "hi": "कटाई के बाद संक्रमित अवशेष खेत से हटाएं ताकि अगली फसल सुरक्षित रहे।",
        "mr": "काढणीनंतर रोगग्रस्त अवशेष शेतातून काढून टाका जेणेकरून पुढील पिकाचे संरक्षण होईल."
    },
},

"Wheat___Wheat_stripe_rust": {
    "problem": {
        "en": "Stripe rust causes yellow linear pustules on wheat leaves, reducing grain filling and crop productivity.",
        "hi": "स्ट्राइप रस्ट रोग में गेहूं की पत्तियों पर पीली धारियों जैसे धब्बे बनते हैं जिससे उत्पादन घटता है।",
        "mr": "स्ट्राइप रस्ट रोगामुळे गव्हाच्या पानांवर पिवळ्या रेषांसारखे डाग पडतात आणि उत्पादन घटते."
    },
    "medicine": {
        "en": "Spray Propiconazole or Azoxystrobin fungicide immediately after symptoms appear.",
        "hi": "लक्षण दिखाई देते ही Propiconazole या Azoxystrobin का छिड़काव करें।",
        "mr": "लक्षणे दिसताच Propiconazole किंवा Azoxystrobin फवारणी करावी."
    },
    "dosage": {
        "en": "Apply 1 ml medicine per liter of water.",
        "hi": "1 मिली दवा प्रति लीटर पानी में मिलाकर छिड़काव करें।",
        "mr": "प्रति लिटर पाण्यात 1 मिली औषध मिसळून फवारणी करावी."
    },
    "fertilizer": {
        "en": "Use balanced fertilizer and avoid excess nitrogen application.",
        "hi": "संतुलित खाद दें और अधिक नाइट्रोजन का उपयोग न करें।",
        "mr": "संतुलित खत वापरा आणि जास्त नत्र खत देणे टाळा."
    },
    "root_condition": {
        "en": "Severe infection weakens overall plant vigor and root activity.",
        "hi": "गंभीर संक्रमण से पौधे और जड़ें कमजोर हो जाती हैं।",
        "mr": "तीव्र प्रादुर्भावामुळे झाडे आणि मुळे कमजोर होतात."
    },
    "soil_condition": {
        "en": "Excessive moisture and poor aeration can increase disease intensity.",
        "hi": "अधिक नमी और खराब वायु संचार रोग को बढ़ाता है।",
        "mr": "जास्त ओलावा आणि कमी हवा खेळती राहिल्यास रोग वाढतो."
    },
    "weather_effect": {
        "en": "Cool and cloudy weather supports rapid rust spread.",
        "hi": "ठंडा और बादलों वाला मौसम रोग फैलने के लिए अनुकूल है।",
        "mr": "थंड आणि ढगाळ हवामानात रोग वेगाने पसरतो."
    },
    "prevention": {
        "en": "Grow resistant varieties and monitor the field regularly during winter season.",
        "hi": "प्रतिरोधी किस्म लगाएं और सर्दियों में खेत की नियमित निगरानी करें।",
        "mr": "प्रतिरोधक वाण लावा आणि हिवाळ्यात शेताची नियमित पाहणी करा."
    },
    "farmer_tip": {
        "en": "Early spraying after first symptoms can save major crop losses.",
        "hi": "शुरुआती लक्षणों पर तुरंत दवा छिड़काव करने से बड़ा नुकसान रोका जा सकता है।",
        "mr": "सुरुवातीच्या लक्षणांवर त्वरित फवारणी केल्यास मोठे नुकसान टाळता येते."
    },
},
"cotton___Cotton_Aphids": {
    "problem": {
        "en": "Aphids are small soft-bodied sucking insects that attack tender cotton leaves and shoots. They suck plant sap, causing curling, yellowing, sticky honeydew formation, and weak plant growth. Heavy infestation reduces boll formation and overall yield.",
        "hi": "एफिड छोटे रस चूसने वाले कीट हैं जो कपास की कोमल पत्तियों और टहनियों पर हमला करते हैं। ये पौधों का रस चूसते हैं जिससे पत्तियां मुड़ जाती हैं, पीली पड़ती हैं और चिपचिपा पदार्थ बनता है। अधिक प्रकोप से बॉल विकास और उत्पादन कम हो जाता है।",
        "mr": "मावा ही लहान रस शोषणारी कीड असून ती कापसाच्या कोवळ्या पानांवर आणि फांद्यांवर प्रादुर्भाव करते. ही कीड झाडाचा रस शोषते त्यामुळे पाने वाकडी होतात, पिवळी पडतात आणि चिकट पदार्थ तयार होतो. जास्त प्रादुर्भाव झाल्यास बोंडांची वाढ कमी होऊन उत्पादन घटते."
    },
    "medicine": {
        "en": "Spray Imidacloprid or Thiamethoxam insecticide after early infestation is observed.",
        "hi": "प्रारंभिक प्रकोप दिखाई देने पर Imidacloprid या Thiamethoxam का छिड़काव करें।",
        "mr": "सुरुवातीचा प्रादुर्भाव दिसताच Imidacloprid किंवा Thiamethoxam फवारणी करावी."
    },
    "dosage": {
        "en": "Use 0.3 ml to 0.5 ml medicine per liter of water.",
        "hi": "0.3 से 0.5 मिली दवा प्रति लीटर पानी में मिलाकर छिड़काव करें।",
        "mr": "प्रति लिटर पाण्यात 0.3 ते 0.5 मिली औषध मिसळून फवारणी करावी."
    },
    "fertilizer": {
        "en": "Apply balanced fertilizer and avoid excessive nitrogen which attracts aphids.",
        "hi": "संतुलित खाद दें और अधिक नाइट्रोजन उपयोग से बचें क्योंकि इससे एफिड बढ़ते हैं।",
        "mr": "संतुलित खत वापरा आणि जास्त नत्र खत देणे टाळा कारण त्यामुळे माव्याचा प्रादुर्भाव वाढतो."
    },
    "root_condition": {
        "en": "Root growth becomes weak when aphid infestation remains uncontrolled for a long period.",
        "hi": "लंबे समय तक प्रकोप रहने पर पौधों की जड़ें कमजोर हो जाती हैं।",
        "mr": "दीर्घकाळ प्रादुर्भाव राहिल्यास झाडांची मुळे कमजोर होतात."
    },
    "soil_condition": {
        "en": "Over-fertilized and poorly managed fields increase aphid population.",
        "hi": "अधिक खाद और खराब प्रबंधन वाले खेतों में एफिड तेजी से बढ़ते हैं।",
        "mr": "जास्त खत आणि अयोग्य व्यवस्थापन असलेल्या शेतात माव्याचा प्रादुर्भाव वाढतो."
    },
    "weather_effect": {
        "en": "Warm and dry weather favors rapid multiplication of aphids.",
        "hi": "गर्म और शुष्क मौसम एफिड बढ़ने के लिए अनुकूल होता है।",
        "mr": "उष्ण आणि कोरड्या हवामानात माव्याची वाढ झपाट्याने होते."
    },
    "prevention": {
        "en": "Maintain field cleanliness, avoid excess nitrogen, and encourage natural predators like ladybird beetles.",
        "hi": "खेत साफ रखें, अधिक नाइट्रोजन से बचें और लेडीबर्ड जैसे लाभकारी कीटों को सुरक्षित रखें।",
        "mr": "शेत स्वच्छ ठेवा, जास्त नत्र खत टाळा आणि लेडीबर्डसारख्या उपयुक्त किडींचे संरक्षण करा."
    },
    "farmer_tip": {
        "en": "Check the underside of leaves regularly because aphids first appear on tender leaves.",
        "hi": "पत्तियों के नीचे नियमित जांच करें क्योंकि एफिड पहले कोमल पत्तियों पर दिखाई देते हैं।",
        "mr": "पानांच्या खालच्या बाजूची नियमित पाहणी करा कारण मावा सुरुवातीला कोवळ्या पानांवर दिसतो."
    },
},

"cotton___Cotton_Army_worm": {
    "problem": {
        "en": "Army worm larvae feed aggressively on cotton leaves and young bolls. Severe infestation causes defoliation, damaged bolls, and major yield reduction.",
        "hi": "आर्मी वर्म की सूंडियां कपास की पत्तियों और छोटे बॉल को खाकर नुकसान पहुंचाती हैं। अधिक प्रकोप से पत्तियां नष्ट हो जाती हैं और उत्पादन घटता है।",
        "mr": "आर्मी वर्मची अळी कापसाची पाने आणि लहान बोंडे खाऊन मोठे नुकसान करते. जास्त प्रादुर्भाव झाल्यास पाने नष्ट होतात आणि उत्पादन घटते."
    },
    "medicine": {
        "en": "Spray Emamectin Benzoate or Spinosad insecticide for effective control.",
        "hi": "नियंत्रण के लिए Emamectin Benzoate या Spinosad का छिड़काव करें।",
        "mr": "नियंत्रणासाठी Emamectin Benzoate किंवा Spinosad फवारणी करावी."
    },
    "dosage": {
        "en": "Apply 0.4 gram to 0.5 gram medicine per liter of water.",
        "hi": "0.4 से 0.5 ग्राम दवा प्रति लीटर पानी में मिलाकर छिड़काव करें।",
        "mr": "प्रति लिटर पाण्यात 0.4 ते 0.5 ग्रॅम औषध मिसळून फवारणी करावी."
    },
    "fertilizer": {
        "en": "Use balanced nutrition with adequate potash to strengthen plants against pest attack.",
        "hi": "संतुलित पोषण और पर्याप्त पोटाश का उपयोग करें ताकि पौधे मजबूत रहें।",
        "mr": "संतुलित अन्नद्रव्ये आणि पुरेशा पोटॅशचा वापर करावा जेणेकरून झाडे मजबूत राहतील."
    },
    "root_condition": {
        "en": "Continuous pest damage weakens plant vigor and indirectly affects root development.",
        "hi": "लगातार कीट प्रकोप से पौधे और जड़ें कमजोर हो जाती हैं।",
        "mr": "सतत किडीच्या प्रादुर्भावामुळे झाडे आणि मुळे कमजोर होतात."
    },
    "soil_condition": {
        "en": "Poorly maintained fields with weeds support army worm multiplication.",
        "hi": "खरपतवार वाले और खराब प्रबंधन वाले खेतों में आर्मी वर्म तेजी से बढ़ते हैं।",
        "mr": "तणयुक्त आणि अयोग्य व्यवस्थापन असलेल्या शेतात आर्मी वर्मचा प्रादुर्भाव वाढतो."
    },
    "weather_effect": {
        "en": "Warm and humid weather favors rapid development of army worms.",
        "hi": "गर्म और नम मौसम आर्मी वर्म बढ़ने के लिए अनुकूल होता है।",
        "mr": "उष्ण आणि दमट हवामानात आर्मी वर्मचा प्रादुर्भाव वाढतो."
    },
    "prevention": {
        "en": "Remove weeds regularly and install pheromone traps for monitoring pest population.",
        "hi": "खरपतवार हटाएं और कीट निगरानी के लिए फेरोमोन ट्रैप लगाएं।",
        "mr": "तण नियंत्रण करा आणि किडीच्या निरीक्षणासाठी फेरोमोन सापळे लावा."
    },
    "farmer_tip": {
        "en": "Early morning field inspection helps detect young larvae before severe crop damage occurs.",
        "hi": "सुबह खेत की जांच करने से छोटी सूंडियों का समय पर पता चलता है।",
        "mr": "सकाळी शेताची पाहणी केल्यास लहान अळ्यांचा वेळेवर शोध लागतो."
    },
},

"cotton___Cotton_Bacterial_blight": {
    "problem": {
        "en": "Bacterial blight causes angular brown to black spots on leaves, stem lesions, and boll rot in cotton. Severe infection reduces photosynthesis and lowers yield quality.",
        "hi": "बैक्टीरियल ब्लाइट रोग में कपास की पत्तियों पर भूरे-काले धब्बे, तनों पर घाव और बॉल सड़न दिखाई देती है। इससे उत्पादन और गुणवत्ता दोनों प्रभावित होते हैं।",
        "mr": "बॅक्टेरियल ब्लाइट रोगामुळे कापसाच्या पानांवर तपकिरी-काळे डाग, खोडावर जखमा आणि बोंड कुज दिसते. त्यामुळे उत्पादन आणि गुणवत्ता कमी होते."
    },
    "medicine": {
        "en": "Spray Copper Oxychloride combined with Streptocycline for disease management.",
        "hi": "रोग नियंत्रण के लिए Copper Oxychloride और Streptocycline का छिड़काव करें।",
        "mr": "रोग नियंत्रणासाठी Copper Oxychloride आणि Streptocycline फवारणी करावी."
    },
    "dosage": {
        "en": "Use 2.5 grams Copper Oxychloride and 0.5 gram Streptocycline per liter of water.",
        "hi": "प्रति लीटर पानी में 2.5 ग्राम Copper Oxychloride और 0.5 ग्राम Streptocycline मिलाएं।",
        "mr": "प्रति लिटर पाण्यात 2.5 ग्रॅम Copper Oxychloride आणि 0.5 ग्रॅम Streptocycline मिसळावे."
    },
    "fertilizer": {
        "en": "Apply balanced nutrients with sufficient micronutrients to improve plant resistance.",
        "hi": "पौधों की रोग प्रतिरोधक क्षमता बढ़ाने के लिए संतुलित पोषण और सूक्ष्म पोषक तत्व दें।",
        "mr": "झाडांची रोगप्रतिकारक शक्ती वाढवण्यासाठी संतुलित अन्नद्रव्ये आणि सूक्ष्म अन्नद्रव्यांचा वापर करावा."
    },
    "root_condition": {
        "en": "Severe bacterial infection weakens plant health and root activity.",
        "hi": "गंभीर संक्रमण से पौधों की जड़ें कमजोर हो जाती हैं।",
        "mr": "तीव्र रोगामुळे झाडांची मुळे कमजोर होतात."
    },
    "soil_condition": {
        "en": "Poor drainage and infected crop residues increase disease spread.",
        "hi": "खराब जल निकासी और संक्रमित अवशेष रोग फैलने का कारण बनते हैं।",
        "mr": "पाण्याचा निचरा न होणे आणि रोगग्रस्त अवशेषांमुळे रोग वाढतो."
    },
    "weather_effect": {
        "en": "Warm and rainy weather promotes bacterial disease spread.",
        "hi": "गर्म और बरसाती मौसम में यह रोग तेजी से फैलता है।",
        "mr": "उष्ण आणि पावसाळी हवामानात हा रोग वेगाने पसरतो."
    },
    "prevention": {
        "en": "Use disease-free seeds, avoid waterlogging, and remove infected plant parts.",
        "hi": "रोगमुक्त बीज का उपयोग करें, जलभराव से बचें और संक्रमित भाग हटाएं।",
        "mr": "रोगमुक्त बियाणे वापरा, पाणी साचू देऊ नका आणि रोगग्रस्त भाग काढून टाका."
    },
    "farmer_tip": {
        "en": "Do not work in wet fields because bacteria spread quickly through water splashes.",
        "hi": "गीले खेतों में काम करने से बचें क्योंकि पानी के छींटों से रोग तेजी से फैलता है।",
        "mr": "ओल्या शेतात काम करणे टाळा कारण पाण्याच्या उडण्यामुळे रोग वेगाने पसरतो."
    },
},

"cotton___Cotton_Healthy": {
    "problem": {
        "en": "Healthy cotton plants show dark green leaves, strong stems, proper boll formation, and vigorous growth without pest or disease symptoms.",
        "hi": "स्वस्थ कपास की फसल में गहरे हरे पत्ते, मजबूत तने और अच्छी बॉल वृद्धि दिखाई देती है।",
        "mr": "निरोगी कापसाच्या पिकात गर्द हिरवी पाने, मजबूत खोड आणि चांगली बोंड वाढ दिसते."
    },
    "medicine": {
        "en": "No medicine required under healthy crop condition. Continue regular monitoring.",
        "hi": "स्वस्थ फसल में किसी दवा की आवश्यकता नहीं होती। नियमित निगरानी जारी रखें।",
        "mr": "निरोगी पिकासाठी कोणत्याही औषधाची गरज नसते. नियमित निरीक्षण सुरू ठेवा."
    },
    "dosage": {
        "en": "No chemical dosage required for healthy plants.",
        "hi": "स्वस्थ पौधों में किसी दवा की मात्रा आवश्यक नहीं है।",
        "mr": "निरोगी झाडांसाठी कोणत्याही औषधाची गरज नाही."
    },
    "fertilizer": {
        "en": "Apply recommended NPK fertilizer along with organic manure and micronutrients.",
        "hi": "संतुलित NPK खाद, जैविक खाद और सूक्ष्म पोषक तत्वों का उपयोग करें।",
        "mr": "संतुलित NPK खत, सेंद्रिय खत आणि सूक्ष्म अन्नद्रव्यांचा वापर करावा."
    },
    "root_condition": {
        "en": "Healthy roots remain white, fibrous, and absorb nutrients efficiently.",
        "hi": "स्वस्थ जड़ें मजबूत और पोषक तत्वों को अच्छी तरह अवशोषित करती हैं।",
        "mr": "निरोगी मुळे मजबूत असून अन्नद्रव्ये चांगल्या प्रकारे शोषतात."
    },
    "soil_condition": {
        "en": "Well-drained fertile black soil is ideal for cotton growth.",
        "hi": "अच्छी जल निकासी वाली उपजाऊ काली मिट्टी कपास के लिए उपयुक्त होती है।",
        "mr": "चांगला निचरा होणारी सुपीक काळी जमीन कापसासाठी उत्तम असते."
    },
    "weather_effect": {
        "en": "Warm weather with moderate humidity supports healthy cotton growth.",
        "hi": "गर्म और मध्यम नमी वाला मौसम कपास की अच्छी वृद्धि के लिए अनुकूल है।",
        "mr": "उष्ण आणि मध्यम दमट हवामान कापसाच्या चांगल्या वाढीसाठी अनुकूल असते."
    },
    "prevention": {
        "en": "Maintain proper irrigation, balanced fertilizer, and regular pest monitoring.",
        "hi": "समय पर सिंचाई, संतुलित खाद और नियमित कीट निरीक्षण करें।",
        "mr": "वेळेवर सिंचन, संतुलित खत आणि नियमित कीड निरीक्षण करावे."
    },
    "farmer_tip": {
        "en": "Healthy crops should still be monitored weekly to prevent sudden pest outbreaks.",
        "hi": "स्वस्थ फसल की भी हर सप्ताह जांच करें ताकि अचानक कीट प्रकोप रोका जा सके।",
        "mr": "निरोगी पिकाचीही दर आठवड्याला पाहणी करा जेणेकरून अचानक किडीचा प्रादुर्भाव टाळता येईल."
    },
},

"rice___Rice_Blast": {
    "problem": {
        "en": "Rice blast is a serious fungal disease that affects leaves, nodes, and panicles of rice plants. Diamond-shaped gray or brown lesions appear on leaves, and severe infection can dry the entire crop and reduce grain formation.",
        "hi": "राइस ब्लास्ट धान की एक गंभीर फफूंद जनित बीमारी है जो पत्तियों, गांठों और बालियों को प्रभावित करती है। पत्तियों पर हीरे जैसे भूरे धब्बे दिखाई देते हैं और अधिक प्रकोप में पूरी फसल सूख सकती है।",
        "mr": "राईस ब्लास्ट हा भातावरील अतिशय गंभीर बुरशीजन्य रोग आहे. या रोगामुळे पानांवर, खोडाच्या गाठींवर आणि लोंब्यांवर परिणाम होतो. पानांवर हिर्‍यासारखे तपकिरी डाग दिसतात आणि तीव्र प्रादुर्भाव झाल्यास संपूर्ण पीक वाळू शकते."
    },
    "medicine": {
        "en": "Spray Tricyclazole or Isoprothiolane fungicide immediately after symptoms appear.",
        "hi": "लक्षण दिखाई देते ही Tricyclazole या Isoprothiolane का छिड़काव करें।",
        "mr": "लक्षणे दिसताच Tricyclazole किंवा Isoprothiolane फवारणी करावी."
    },
    "dosage": {
        "en": "Use 0.6 gram to 1 gram medicine per liter of water and spray uniformly.",
        "hi": "0.6 से 1 ग्राम दवा प्रति लीटर पानी में मिलाकर समान रूप से छिड़काव करें।",
        "mr": "प्रति लिटर पाण्यात 0.6 ते 1 ग्रॅम औषध मिसळून समान फवारणी करावी."
    },
    "fertilizer": {
        "en": "Avoid excessive nitrogen fertilizer and apply balanced NPK with sufficient potash.",
        "hi": "अधिक नाइट्रोजन से बचें और संतुलित NPK के साथ पर्याप्त पोटाश दें।",
        "mr": "जास्त नत्र खत देणे टाळा आणि संतुलित NPK सोबत पुरेसे पोटॅश द्यावे."
    },
    "root_condition": {
        "en": "Severe disease weakens plant vigor and reduces nutrient uptake by roots.",
        "hi": "गंभीर रोग से पौधे और जड़ें कमजोर हो जाती हैं।",
        "mr": "तीव्र रोगामुळे झाडे आणि मुळे कमजोर होतात."
    },
    "soil_condition": {
        "en": "Poorly drained and continuously wet fields increase disease spread.",
        "hi": "खराब जल निकासी और लगातार गीले खेतों में रोग तेजी से फैलता है।",
        "mr": "पाण्याचा निचरा न होणाऱ्या आणि सतत ओलसर शेतात रोग वेगाने वाढतो."
    },
    "weather_effect": {
        "en": "Cool nights, cloudy skies, and humid weather favor rapid disease development.",
        "hi": "ठंडी रातें, बादल और नमी वाला मौसम रोग फैलने के लिए अनुकूल होता है।",
        "mr": "थंड रात्री, ढगाळ वातावरण आणि दमट हवामानात रोग झपाट्याने वाढतो."
    },
    "prevention": {
        "en": "Use resistant rice varieties, maintain proper spacing, and avoid excess nitrogen application.",
        "hi": "प्रतिरोधी किस्में लगाएं, उचित दूरी रखें और अधिक नाइट्रोजन से बचें।",
        "mr": "प्रतिरोधक वाण वापरा, योग्य अंतर ठेवा आणि जास्त नत्र खत टाळा."
    },
    "farmer_tip": {
        "en": "Inspect paddy fields regularly during humid weather because blast spreads very fast in moist conditions.",
        "hi": "नमी वाले मौसम में खेत की नियमित जांच करें क्योंकि यह रोग तेजी से फैलता है।",
        "mr": "दमट हवामानात भातशेतीची नियमित पाहणी करा कारण हा रोग ओलसर वातावरणात खूप वेगाने पसरतो."
    },
},

"rice___Rice_Brownspot": {
    "problem": {
        "en": "Brown spot disease causes small brown circular lesions on rice leaves, reducing photosynthesis and grain quality. Severe infection may lead to poor grain filling and yield loss.",
        "hi": "ब्राउन स्पॉट रोग में धान की पत्तियों पर छोटे भूरे गोल धब्बे बनते हैं जिससे प्रकाश संश्लेषण और दाने की गुणवत्ता प्रभावित होती है।",
        "mr": "ब्राऊन स्पॉट रोगामुळे भाताच्या पानांवर लहान तपकिरी गोल डाग पडतात ज्यामुळे प्रकाशसंश्लेषण आणि दाण्यांची गुणवत्ता कमी होते."
    },
    "medicine": {
        "en": "Spray Mancozeb or Propiconazole fungicide after initial symptoms appear.",
        "hi": "प्रारंभिक लक्षण दिखाई देने पर Mancozeb या Propiconazole का छिड़काव करें।",
        "mr": "सुरुवातीची लक्षणे दिसताच Mancozeb किंवा Propiconazole फवारणी करावी."
    },
    "dosage": {
        "en": "Use 2 grams to 2.5 grams medicine per liter of water.",
        "hi": "2 से 2.5 ग्राम दवा प्रति लीटर पानी में मिलाकर छिड़काव करें।",
        "mr": "प्रति लिटर पाण्यात 2 ते 2.5 ग्रॅम औषध मिसळून फवारणी करावी."
    },
    "fertilizer": {
        "en": "Apply balanced fertilizer with zinc and potash to improve plant immunity.",
        "hi": "पौधों की रोग प्रतिरोधक क्षमता बढ़ाने के लिए जिंक और पोटाश सहित संतुलित खाद दें।",
        "mr": "झाडांची रोगप्रतिकारक शक्ती वाढवण्यासाठी झिंक आणि पोटॅशसह संतुलित खत वापरावे."
    },
    "root_condition": {
        "en": "Weak roots and nutrient deficiency increase disease severity.",
        "hi": "कमजोर जड़ें और पोषण की कमी से रोग अधिक बढ़ता है।",
        "mr": "कमजोर मुळे आणि अन्नद्रव्यांची कमतरता असल्यास रोगाचा प्रादुर्भाव वाढतो."
    },
    "soil_condition": {
        "en": "Nutrient-deficient and poorly fertile soils increase brown spot occurrence.",
        "hi": "कम उपजाऊ और पोषण की कमी वाली मिट्टी में यह रोग अधिक दिखाई देता है।",
        "mr": "कमी सुपीक आणि अन्नद्रव्य कमी असलेल्या जमिनीत हा रोग जास्त दिसतो."
    },
    "weather_effect": {
        "en": "Warm humid weather and intermittent rainfall favor disease spread.",
        "hi": "गर्म, नम और रुक-रुक कर बारिश वाला मौसम रोग फैलने के लिए अनुकूल है।",
        "mr": "उष्ण, दमट आणि मधूनमधून पाऊस पडणाऱ्या हवामानात रोग वाढतो."
    },
    "prevention": {
        "en": "Use healthy seeds, maintain proper nutrition, and avoid water stress in the crop.",
        "hi": "स्वस्थ बीज का उपयोग करें, संतुलित पोषण दें और फसल में पानी की कमी न होने दें।",
        "mr": "निरोगी बियाणे वापरा, संतुलित अन्नद्रव्ये द्या आणि पिकात पाण्याची कमतरता होऊ देऊ नका."
    },
    "farmer_tip": {
        "en": "Regular micronutrient application helps reduce disease stress and improves grain quality.",
        "hi": "सूक्ष्म पोषक तत्वों का नियमित उपयोग रोग कम करने और गुणवत्ता सुधारने में मदद करता है।",
        "mr": "सूक्ष्म अन्नद्रव्यांचा नियमित वापर रोग कमी करण्यास आणि गुणवत्तेत सुधारणा करण्यास मदत करतो."
    },
},

"rice___Rice_Tungro": {
    "problem": {
        "en": "Rice tungro is a viral disease spread by green leafhoppers. Infected plants become stunted, leaves turn yellow-orange, and grain production decreases significantly.",
        "hi": "राइस तुंग्रो एक विषाणु जनित रोग है जो ग्रीन लीफहॉपर कीट द्वारा फैलता है। संक्रमित पौधे छोटे रह जाते हैं, पत्तियां पीली-नारंगी हो जाती हैं और उत्पादन कम हो जाता है।",
        "mr": "राईस तुंग्रो हा विषाणूजन्य रोग असून तो हिरव्या लीफहॉपर किडीद्वारे पसरतो. संक्रमित झाडांची वाढ खुंटते, पाने पिवळी-नारिंगी होतात आणि उत्पादन घटते."
    },
    "medicine": {
        "en": "Control the leafhopper vector by spraying Imidacloprid or Thiamethoxam insecticide.",
        "hi": "ग्रीन लीफहॉपर नियंत्रण के लिए Imidacloprid या Thiamethoxam का छिड़काव करें।",
        "mr": "हिरव्या लीफहॉपर नियंत्रणासाठी Imidacloprid किंवा Thiamethoxam फवारणी करावी."
    },
    "dosage": {
        "en": "Use 0.3 ml to 0.5 ml medicine per liter of water.",
        "hi": "0.3 से 0.5 मिली दवा प्रति लीटर पानी में मिलाकर छिड़काव करें।",
        "mr": "प्रति लिटर पाण्यात 0.3 ते 0.5 मिली औषध मिसळून फवारणी करावी."
    },
    "fertilizer": {
        "en": "Apply balanced fertilizer with proper zinc application to support plant recovery.",
        "hi": "पौधों की रिकवरी के लिए संतुलित खाद और उचित जिंक का उपयोग करें।",
        "mr": "झाडांच्या पुनर्वाढीसाठी संतुलित खत आणि योग्य झिंकचा वापर करावा."
    },
    "root_condition": {
        "en": "Virus infection weakens root growth and reduces nutrient absorption.",
        "hi": "वायरस संक्रमण से जड़ें कमजोर हो जाती हैं और पोषण अवशोषण कम हो जाता है।",
        "mr": "विषाणू संसर्गामुळे मुळे कमजोर होतात आणि अन्नद्रव्य शोषण कमी होते."
    },
    "soil_condition": {
        "en": "Poorly managed fields with excessive weeds support insect multiplication.",
        "hi": "खरपतवार वाले और खराब प्रबंधन वाले खेतों में कीट तेजी से बढ़ते हैं।",
        "mr": "तणयुक्त आणि अयोग्य व्यवस्थापन असलेल्या शेतात किडींची वाढ जास्त होते."
    },
    "weather_effect": {
        "en": "Warm and humid weather favors rapid multiplication of leafhopper insects.",
        "hi": "गर्म और नम मौसम लीफहॉपर कीट बढ़ने के लिए अनुकूल होता है।",
        "mr": "उष्ण आणि दमट हवामानात लीफहॉपर किडींची वाढ वेगाने होते."
    },
    "prevention": {
        "en": "Use resistant varieties, remove infected plants early, and control leafhopper population regularly.",
        "hi": "प्रतिरोधी किस्म लगाएं, संक्रमित पौधे हटाएं और लीफहॉपर नियंत्रण नियमित करें।",
        "mr": "प्रतिरोधक वाण वापरा, रोगग्रस्त झाडे काढून टाका आणि लीफहॉपर नियंत्रण नियमित करा."
    },
    "farmer_tip": {
        "en": "Early insect control is very important because tungro spreads quickly through infected leafhoppers.",
        "hi": "शुरुआती कीट नियंत्रण बहुत जरूरी है क्योंकि यह रोग कीटों द्वारा तेजी से फैलता है।",
        "mr": "सुरुवातीपासून किड नियंत्रण करणे अत्यंत महत्त्वाचे आहे कारण हा रोग किडीद्वारे झपाट्याने पसरतो."
    },
},

"cotton___Cotton_Healthy": {
    "problem": {
        "en": "Healthy cotton plants show dark green leaves, strong stems, proper boll formation, and vigorous growth without pest or disease symptoms.",
        "hi": "स्वस्थ कपास की फसल में गहरे हरे पत्ते, मजबूत तने और अच्छी बॉल वृद्धि दिखाई देती है।",
        "mr": "निरोगी कापसाच्या पिकात गर्द हिरवी पाने, मजबूत खोड आणि चांगली बोंड वाढ दिसते."
    },
    "medicine": {
        "en": "No medicine required under healthy crop condition. Continue regular monitoring.",
        "hi": "स्वस्थ फसल में किसी दवा की आवश्यकता नहीं होती। नियमित निगरानी जारी रखें।",
        "mr": "निरोगी पिकासाठी कोणत्याही औषधाची गरज नसते. नियमित निरीक्षण सुरू ठेवा."
    },
    "dosage": {
        "en": "No chemical dosage required for healthy plants.",
        "hi": "स्वस्थ पौधों में किसी दवा की मात्रा आवश्यक नहीं है।",
        "mr": "निरोगी झाडांसाठी कोणत्याही औषधाची गरज नाही."
    },
    "fertilizer": {
        "en": "Apply recommended NPK fertilizer along with organic manure and micronutrients.",
        "hi": "संतुलित NPK खाद, जैविक खाद और सूक्ष्म पोषक तत्वों का उपयोग करें।",
        "mr": "संतुलित NPK खत, सेंद्रिय खत आणि सूक्ष्म अन्नद्रव्यांचा वापर करावा."
    },
    "root_condition": {
        "en": "Healthy roots remain white, fibrous, and absorb nutrients efficiently.",
        "hi": "स्वस्थ जड़ें मजबूत और पोषक तत्वों को अच्छी तरह अवशोषित करती हैं।",
        "mr": "निरोगी मुळे मजबूत असून अन्नद्रव्ये चांगल्या प्रकारे शोषतात."
    },
    "soil_condition": {
        "en": "Well-drained fertile black soil is ideal for cotton growth.",
        "hi": "अच्छी जल निकासी वाली उपजाऊ काली मिट्टी कपास के लिए उपयुक्त होती है।",
        "mr": "चांगला निचरा होणारी सुपीक काळी जमीन कापसासाठी उत्तम असते."
    },
    "weather_effect": {
        "en": "Warm weather with moderate humidity supports healthy cotton growth.",
        "hi": "गर्म और मध्यम नमी वाला मौसम कपास की अच्छी वृद्धि के लिए अनुकूल है।",
        "mr": "उष्ण आणि मध्यम दमट हवामान कापसाच्या चांगल्या वाढीसाठी अनुकूल असते."
    },
    "prevention": {
        "en": "Maintain proper irrigation, balanced fertilizer, and regular pest monitoring.",
        "hi": "समय पर सिंचाई, संतुलित खाद और नियमित कीट निरीक्षण करें।",
        "mr": "वेळेवर सिंचन, संतुलित खत आणि नियमित कीड निरीक्षण करावे."
    },
    "farmer_tip": {
        "en": "Healthy crops should still be monitored weekly to prevent sudden pest outbreaks.",
        "hi": "स्वस्थ फसल की भी हर सप्ताह जांच करें ताकि अचानक कीट प्रकोप रोका जा सके।",
        "mr": "निरोगी पिकाचीही दर आठवड्याला पाहणी करा जेणेकरून अचानक किडीचा प्रादुर्भाव टाळता येईल."
    },
},
    }


# =========================================================
# INSERT DATA INTO DATABASE
# =========================================================

for disease_name, advisory_data in expert_dataset.items():

    cursor.execute(
        """
        INSERT OR REPLACE INTO advisory_knowledge (
            disease_name,
            advisory_json
        )
        VALUES (?, ?)
        """,
        (
            disease_name,
            json.dumps(advisory_data, ensure_ascii=False)
        )
    )

# =========================================================
# SAVE DATABASE
# =========================================================

conn.commit()

conn.close()

# =========================================================
# SUCCESS MESSAGE
# =========================================================

print("✅ Multilingual advisory database populated successfully.")
