from typing import Any, Dict, List, Union

SUPPORTED_LANGUAGES = ['en', 'hi', 'mr']

WEATHER_CONDITIONS = {
    'Clear sky': {'hi': 'स्वच्छ आकाश', 'mr': 'स्वच्छ आकाश'},
    'Partly cloudy': {'hi': 'आंशिक रूप से बादल छाए हुए', 'mr': 'आंशिकपणे ढगाळ'},
    'Overcast': {'hi': 'पूरा बादल', 'mr': 'पूर्णपणे ढगाळ'},
    'Fog': {'hi': 'कोहरा', 'mr': 'धुके'},
    'Drizzle': {'hi': 'हल्की बारिश', 'mr': 'सावल्यात पाऊस'},
    'Rain': {'hi': 'बारिश', 'mr': 'पाऊस'},
    'Snow': {'hi': 'बर्फ', 'mr': 'हिमवृष्टी'},
    'Thunderstorm': {'hi': 'आकस्मिक तूफान', 'mr': 'वादळी वारा'},
    'Storm': {'hi': 'तूफ़ान', 'mr': 'वादळ'},
}

SEVERITY_LABELS = {
    'High': {'hi': 'उच्च', 'mr': 'उच्च'},
    'Medium': {'hi': 'मध्यम', 'mr': 'मध्यम'},
    'Low': {'hi': 'निम्न', 'mr': 'कमी'},
}

CROP_TRANSLATIONS = {
    'wheat': {'en': 'Wheat', 'hi': 'गेहूं', 'mr': 'गहू'},
    'rice': {'en': 'Rice', 'hi': 'धान', 'mr': 'तांदूळ'},
    'maize': {'en': 'Maize', 'hi': 'मक्का', 'mr': 'मका'},
    'cotton': {'en': 'Cotton', 'hi': 'कपास', 'mr': 'कापूस'},
    'soybean': {'en': 'Soybean', 'hi': 'सोयाबीन', 'mr': 'सोयाबीन'},
    'sugarcane': {'en': 'Sugarcane', 'hi': 'गन्ना', 'mr': 'ऊस'},
    'tomato': {'en': 'Tomato', 'hi': 'टमाटर', 'mr': 'टोमॅटो'},
    'potato': {'en': 'Potato', 'hi': 'आलू', 'mr': 'बटाटा'},
    'onion': {'en': 'Onion', 'hi': 'प्याज', 'mr': 'कांदा'},
}

RECOMMENDATION_TRANSLATIONS = {
    'sell': {
        'en': 'Consider selling - Prices expected to rise',
        'hi': 'बिक्री पर विचार करें - कीमतें बढ़ने की संभावना है',
        'mr': 'विक्री विचार करा - किमती वाढण्याची शक्यता आहे'
    },
    'hold': {
        'en': 'Hold - Prices expected to remain stable',
        'hi': 'रोकें - कीमतें स्थिर रहने की संभावना है',
        'mr': 'ठेवून ठेवा - किमती स्थिर राहण्याची शक्यता आहे'
    },
    'decrease': {
        'en': 'Consider holding - Prices may fall',
        'hi': 'रोकें - कीमतें गिर सकती हैं',
        'mr': 'ठेवून ठेवा - किमती घसरणीच्या मार्गावर आहेत'
    },
    'hold_for_better': {
        'en': 'Hold for better prices',
        'hi': 'बेहतर कीमतों के लिए रोकें',
        'mr': 'उत्तम किमतींसाठी थांबा'
    },
    'sell_now': {
        'en': 'Sell now',
        'hi': 'अब बेचें',
        'mr': 'आता विक्री करा'
    },
    'market_stable': {
        'en': 'Market conditions are stable.',
        'hi': 'बाजार की स्थिति स्थिर है।',
        'mr': 'बाजाराची स्थिती स्थिर आहे.'
    }
}

FARMING_ADVICE_TRANSLATIONS = {
    'Extreme heat - provide shade and increase irrigation': {
        'hi': 'अत्यधिक गर्मी - छाया प्रदान करें और सिंचाई बढ़ाएं',
        'mr': 'अत्याधिक उष्णता - सावली द्या आणि सिंचन वाढवा'
    },
    'Water crops early morning to prevent heat stress': {
        'hi': 'तापमान तनाव को रोकने के लिए फसलों को सुबह जल्दी पानी दें',
        'mr': 'उन्हाळाच्या आघातापासून बचावासाठी पिकांना पहाटे पाणी द्या'
    },
    'Frost warning - protect sensitive crops': {
        'hi': 'पाला चेतावनी - संवेदनशील फसलों की रक्षा करें',
        'mr': 'हिमवर्षा सूचना - संवेदनशील पिके संरक्षित करा'
    },
    'Cold weather - consider covering young plants': {
        'hi': 'ठंडी मौसम - युवा पौधों को ढकने पर विचार करें',
        'mr': 'थंड हवामान - तरुण झाडांना झाका'
    },
    'Very high humidity - high disease risk, ensure ventilation': {
        'hi': 'बहुत अधिक नमी - उच्च रोग जोखिम, वेंटिलेशन सुनिश्चित करें',
        'mr': 'अत्यंत जास्त ओलावा - रोगाचा धोका जास्त, वेंटिलेशन सुनिश्चित करा'
    },
    'High humidity - risk of fungal disease, ensure proper ventilation': {
        'hi': 'उच्च नमी - कवक रोग का खतरा, उचित वेंटिलेशन सुनिश्चित करें',
        'mr': 'उच्च ओलावा - बुरशी रोगाचा धोका, योग्य वेंटिलेशन सुनिश्चित करा'
    },
    'Low humidity - increase irrigation frequency': {
        'hi': 'कम नमी - सिंचाई की तीव्रता बढ़ाएं',
        'mr': 'कमी ओलावा - सिंचन वारंवार करा'
    },
    'Moderate humidity - normal irrigation schedule': {
        'hi': 'मध्यम नमी - सामान्य सिंचाई अनुसूची',
        'mr': 'मध्यम ओलावा - सामान्य सिंचन वेळापत्रक'
    },
    'Rain expected - avoid spraying pesticides': {
        'hi': 'बारिश की उम्मीद है - कीटनाशक छिड़काव से बचें',
        'mr': 'पाऊस अपेक्षित आहे - कीटकनाशक फवारणी टाळा'
    },
    'Clear weather - good day for field activities': {
        'hi': 'साफ मौसम - खेत के काम के लिए अच्छा दिन',
        'mr': 'स्वच्छ हवामान - क्षेत्रीय कामासाठी चांगला दिवस'
    },
    'Cloudy conditions - monitor for rain': {
        'hi': 'बादल छाए हुए हैं - बारिश के लिए निगरानी रखें',
        'mr': 'ढगाळ हवामान - पावसासाठी लक्ष ठेवा'
    },
    'Storm warning - secure equipment and shelter': {
        'hi': 'तूफ़ान चेतावनी - उपकरण और आश्रय सुरक्षित करें',
        'mr': 'वादळाची सूचना - उपकरणे आणि आश्रय सुरक्षित करा'
    },
    'Foggy conditions - delay spraying activities': {
        'hi': 'कोहरे वाले हालात - स्प्रे गतिविधियों में देरी करें',
        'mr': 'धुकेदार परिस्थिती - फवारणी क्रिया उशिरा करा'
    },
    'Ideal conditions for rice and sugarcane': {
        'hi': 'धान और गन्ना के लिए आदर्श परिस्थितियां',
        'mr': 'तांदूळ आणि ऊस साठी आदर्श परिस्थिती'
    },
    'Good conditions for wheat and gram': {
        'hi': 'गेहूं और चना के लिए अच्छी परिस्थितियां',
        'mr': 'गहू आणि हरभरा साठी चांगली परिस्थिती'
    },
    'Weather conditions are normal for farming': {
        'hi': 'खेती के लिए मौसम सामान्य है',
        'mr': 'शेतकामासाठी हवामान सामान्य आहे'
    }
}

FALLBACK_MESSAGES = {
    'timeout': {
        'en': 'Weather service timeout. Showing estimated data.',
        'hi': 'मौसम सेवा समय सीमा समाप्त। अनुमानित डेटा दिखाया जा रहा है।',
        'mr': 'हवामान सेवा वेळ संपली. अंदाजित डेटा दाखवत आहे.'
    },
    'connection': {
        'en': 'Unable to connect to weather service. Showing estimated data.',
        'hi': 'मौसम सेवा से कनेक्ट नहीं हो पा रहा है। अनुमानित डेटा दिखाया जा रहा है।',
        'mr': 'हवामान सेवेशी कनेक्ट करता येत नाही. अंदाजित डेटा दाखवत आहे.'
    },
    'city_not_found': {
        'en': 'City not found. Showing regional data.',
        'hi': 'शहर नहीं मिला। क्षेत्रीय डेटा दिखाया जा रहा है।',
        'mr': 'शहर आढळले नाही. प्रादेशिक डेटा दाखवत आहे.'
    },
    'invalid_data': {
        'en': 'Invalid weather data received. Showing estimated data.',
        'hi': 'अमान्य मौसम डेटा प्राप्त हुआ। अनुमानित डेटा दिखाया जा रहा है।',
        'mr': 'अवैध हवामान डेटा प्राप्त झाला. अंदाजित डेटा दाखवत आहे.'
    },
    'general': {
        'en': 'Weather service unavailable. Showing estimated data.',
        'hi': 'मौसम सेवा अनुपलब्ध है। अनुमानित डेटा दिखाया जा रहा है।',
        'mr': 'हवामान सेवा उपलब्ध नाही. अंदाजित डेटा दाखवत आहे.'
    }
}


def get_localized_value(value: Any, lang: str = 'en') -> Any:
    if value is None:
        return value
    if isinstance(value, dict):
        return value.get(lang) or value.get('en') or next((v for v in value.values() if isinstance(v, str)), '')
    if isinstance(value, list):
        return [get_localized_value(item, lang) for item in value]
    return value


def translate_weather_condition(condition: str, lang: str) -> str:
    if lang == 'en':
        return condition
    return WEATHER_CONDITIONS.get(condition, {}).get(lang, condition)


def translate_severity(severity: str, lang: str) -> str:
    if lang == 'en':
        return severity
    return SEVERITY_LABELS.get(severity, {}).get(lang, severity)


def translate_farming_advice_list(advice: List[str], lang: str) -> List[str]:
    if lang == 'en':
        return advice
    return [FARMING_ADVICE_TRANSLATIONS.get(item, {}).get(lang, item) for item in advice]


def translate_fallback_message(error_type: str, lang: str) -> str:
    return FALLBACK_MESSAGES.get(error_type, FALLBACK_MESSAGES['general']).get(lang, FALLBACK_MESSAGES['general']['en'])


def get_crop_translation(crop: str, lang: str) -> str:
    return CROP_TRANSLATIONS.get(crop.lower(), {}).get(lang) or crop.capitalize()


def get_market_recommendation(key: str, lang: str) -> str:
    return RECOMMENDATION_TRANSLATIONS.get(key, {}).get(lang) or RECOMMENDATION_TRANSLATIONS.get(key, {}).get('en', key)


def localize_object(data: Any, lang: str) -> Any:
    if isinstance(data, dict):
        return {k: localize_object(v, lang) for k, v in data.items()}
    if isinstance(data, list):
        return [localize_object(item, lang) for item in data]
    return get_localized_value(data, lang)
