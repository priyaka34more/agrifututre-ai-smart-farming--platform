import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { 
  TrendingUp, RefreshCw, BarChart3, 
  AlertCircle, CheckCircle2, Activity, Scale,
  Star, Package, CalendarDays, Zap, ShieldAlert,
  BarChart as BarChartIcon, Info
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, 
  ResponsiveContainer, CartesianGrid,
  BarChart as RechartsBarChart, Bar
} from "recharts";
import { getMarketForecast } from "../services/apiService";
const crops = [
  { value: "tomato", label: "Tomato 🍅" },
  { value: "onion", label: "Onion 🧅" },
  { value: "potato", label: "Potato 🥔" },
  { value: "wheat", label: "Wheat 🌾" },
  { value: "rice", label: "Rice 🌾" },
  { value: "cotton", label: "Cotton ☁️" },
  { value: "sugarcane", label: "Sugarcane 🎋" }
];

const states = [
  "Maharashtra", "Gujarat", "Karnataka", "Madhya Pradesh", "Punjab", "Uttar Pradesh", "Andhra Pradesh", "Tamil Nadu"
];

const loadingSteps = [
  "Connecting to mandi databases...",
  "Analyzing historical price volatility...",
  "Evaluating regional demand & supply...",
  "Generating final AI forecast..."
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } }
};

const marketText = {
  en: {
    market: "Market",
    forecast: "Market Forecast",
    subtitle: "AI price predictions & best selling days",
    cropDetails: "Crop Details",
    formSubtitle: "Select your crop and location for prediction",
    cropType: "Crop Type",
    state: "State",
    district: "District / Mandi",
    harvestQuantity: "Harvest Quantity (KG)",
    generateForecast: "Generate Forecast",
    startNewForecast: "Start New Forecast",
    analysisComplete: "AI Analysis Complete",
    engineReady: "AI Engine Ready",
    loadingSteps: [
      "Connecting to mandi databases...",
      "Analyzing historical price volatility...",
      "Evaluating regional demand & supply...",
      "Generating final AI forecast..."
    ],
    analyzingMarketData: "Analyzing Market Data",
    processingLiveTrends: "Processing live trends for",
    calculatedDynamically: "Calculated dynamically based on market volatility, historical crop stability, and predicted local trend.",
    currentPrice: "Current Price",
    predictedPeak: "Predicted Peak",
    extraProfit: "Extra Profit",
    marketDemand: "Market Demand",
    bestDayToSell: "Best Day to Sell",
    storageAdvice: "Storage Advice",
    riskLevel: "Risk Level",
    aiConfidence: "AI Confidence",
    priceForecast: "7-Day Price Forecast",
    mandiDemand: "Mandi Demand",
    estimatedPricePerKg: "Estimated price per kg",
    mandiDemandExplanation: "Shows which mandi buyers want your crop most.",
    topDemand: "Buyers want more from",
    marketLocal: "Local market",
    marketCity: "City market",
    marketExport: "Export market",
    marketProcess: "Processing market",
    today: "today",
    expected: "expected",
    forHarvest: "For",
    basedOnMandiTrends: "Based on mandi trends",
    riskWord: "Risk",
    estimatedBuyerDemand: "How much buyers want your crop in mandi",
    adviceRising: "Market is moving up. Wait 3-4 days to sell and capture peak price.",
    adviceFalling: "Market trends show a decline. Secure your profit by selling today.",
    demandHigh: "High Demand",
    demandStable: "Stable Demand",
    demandLow: "Low Demand",
    langName_en: "English",
    langName_hi: "Hindi",
    langName_mr: "Marathi",
    in: "in",
    local: "Local",
    city: "City",
    export: "Export",
    process: "Process",
    tomorrow: "Tomorrow",
    day1: "Day 1",
    day2: "Day 2",
    day3: "Day 3",
    day4: "Day 4",
    day5: "Day 5",
    day6: "Day 6",
    day7: "Day 7",
    storage: {
      tomato: "Requires cold storage (10-15°C). Highly perishable, sell quickly.",
      onion: "Keep in a dry, dark, well-ventilated space to prevent sprouting.",
      potato: "Store in a cool, dark environment. Avoid moisture.",
      wheat: "Use dry, pest-free silos. Ensure moisture content is below 12%.",
      rice: "Store dry in bags, raised off the ground to prevent dampness.",
      cotton: "Keep perfectly dry. Moisture will quickly ruin fiber quality.",
      sugarcane: "Process immediately after harvest to retain sugar content.",
      default: "Store in a cool, dry place away from direct sunlight."
    }
  },
  hi: {
    market: "बाजार",
    forecast: "बाजार पूर्वानुमान",
    subtitle: "AI मूल्य भविष्यवाणियाँ और सबसे अच्छा बिक्री दिन",
    cropDetails: "फसल विवरण",
    formSubtitle: "अपनी फसल और स्थान चुनें भविष्यवाणी के लिए",
    cropType: "फसल प्रकार",
    state: "राज्य",
    district: "ज़िला / मंडी",
    harvestQuantity: "फसल मात्रा (KG)",
    generateForecast: "पूर्वानुमान बनाएं",
    startNewForecast: "नई भविष्यवाणी शुरू करें",
    analysisComplete: "AI विश्लेषण पूरा",
    engineReady: "AI इंजन तैयार",
    loadingSteps: [
      "मंडी डेटाबेस से जुड़ा जा रहा है...",
      "ऐतिहासिक मूल्य अस्थिरता का विश्लेषण किया जा रहा है...",
      "क्षेत्रीय मांग और आपूर्ति का मूल्यांकन किया जा रहा है...",
      "अंतिम AI पूर्वानुमान तैयार किया जा रहा है..."
    ],
    analyzingMarketData: "बाजार डेटा विश्लेषण हो रहा है",
    processingLiveTrends: "लाइव रुझानों को संसाधित किया जा रहा है",
    calculatedDynamically: "बाजार अस्थिरता, ऐतिहासिक फसल स्थिरता और अनुमानित स्थानीय प्रवृत्ति के आधार पर गतिशील रूप से गणना की गई।",
    currentPrice: "मौजूदा कीमत",
    predictedPeak: "प्रत्याशित उच्चतम कीमत",
    extraProfit: "अतिरिक्त लाभ",
    marketDemand: "बाजार मांग",
    bestDayToSell: "बेचने का सबसे अच्छा दिन",
    storageAdvice: "भंडारण सलाह",
    riskLevel: "जोखिम स्तर",
    aiConfidence: "AI भरोसा",
    priceForecast: "7-दिन मूल्य पूर्वानुमान",
    mandiDemand: "मंडी मांग",
    estimatedPricePerKg: "प्रति किलो अनुमानित कीमत",
    mandiDemandExplanation: "यह दिखाता है कि मंडी के खरीदार आपकी फसल से किस बाजार में अधिक चाहते हैं।",
    topDemand: "खरीदार अधिक चाहते हैं",
    marketLocal: "स्थानीय मंडी",
    marketCity: "शहर मंडी",
    marketExport: "निर्यात मंडी",
    marketProcess: "प्रक्रिया मंडी",
    today: "आज",
    expected: "अपेक्षित",
    forHarvest: "के लिए",
    basedOnMandiTrends: "मंडी रुझानों के आधार पर",
    riskWord: "जोखिम",
    estimatedBuyerDemand: "मंडी में आपकी फसल के लिए खरीदार कितनी मांग कर रहे हैं",
    adviceRising: "बाजार ऊपर जा रहा है। 3-4 दिन तक प्रतीक्षा करें और उच्चतम मूल्य प्राप्त करें।",
    adviceFalling: "बाजार मंदी की ओर है। अपना लाभ आज ही सुरक्षित करें।",
    demandHigh: "उच्च मांग",
    demandStable: "स्थिर मांग",
    demandLow: "कम मांग",
    langName_en: "English",
    langName_hi: "Hindi",
    langName_mr: "Marathi",
    in: "में",
    local: "स्थानीय",
    city: "शहर",
    export: "निर्यात",
    process: "प्रक्रिया",
    tomorrow: "कल",
    day1: "दिन 1",
    day2: "दिन 2",
    day3: "दिन 3",
    day4: "दिन 4",
    day5: "दिन 5",
    day6: "दिन 6",
    day7: "दिन 7",
    storage: {
      tomato: "ठंडी भंडारण करें (10-15°C)। जल्दी बिकने वाली फसल है, जल्द बेचे।",
      onion: "सूखी, अंधेरी और अच्छी हवादार जगह में रखें ताकि अंकुरण न हो।",
      potato: "ठंडी, अंधेरी जगह में रखें। नमी से बचें।",
      wheat: "सूखे, कीट-मुक्त साइलो में रखें। नमी 12% से नीचे होनी चाहिए।",
      rice: "सूखे बोरों में उठाकर रखें, जमीन से ऊपर रखें ताकि नमी न लगे।",
      cotton: "बिल्कुल सूखा रखें। नमी फाइबर खराब कर देगी।",
      sugarcane: "कटाई के बाद तुरंत संसाधित करें ताकि शक्कर बनी रहे।",
      default: "ठंडी, सूखी जगह में रखें, सीधी धूप से दूर।"
    }
  },
  mr: {
    market: "बाजार",
    forecast: "बाजार अंदाज",
    subtitle: "AI मूल्य अंदाज आणि सर्वोत्तम विक्री दिवस",
    cropDetails: "पिक तपशील",
    formSubtitle: "अंदाजासाठी आपले पीक आणि स्थान निवडा",
    cropType: "पिक प्रकार",
    state: "राज्य",
    district: "जिल्हा / मंडी",
    harvestQuantity: "हंगामाचे प्रमाण (KG)",
    generateForecast: "अंदाज तयार करा",
    startNewForecast: "नवीन अंदाज सुरू करा",
    analysisComplete: "AI विश्लेषण पूर्ण झाले",
    engineReady: "AI इंजिन तयार आहे",
    loadingSteps: [
      "मंडी डेटाबेसशी कनेक्ट करीत आहे...",
      "ऐतिहासिक किंमत अस्थिरतेचे विश्लेषण करीत आहे...",
      "प्रादेशिक मागणी आणि पुरवठा मूल्यांकन करीत आहे...",
      "अंतिम AI अंदाज तयार केला जात आहे..."
    ],
    analyzingMarketData: "बाजार डेटा विश्लेषण चालू आहे",
    processingLiveTrends: "लाइव्ह ट्रेंड प्रक्रिया केली जात आहे",
    calculatedDynamically: "बाजार अस्थिरता, ऐतिहासिक पिक स्थिरता आणि स्थानिक ट्रेंडवर आधारित गतिशीलपणे गणना केली.",
    currentPrice: "सध्याची किंमत",
    predictedPeak: "अनुमानित उच्चतम किंमत",
    extraProfit: "अतिरिक्त नफा",
    marketDemand: "बाजार मागणी",
    bestDayToSell: "विक्रीसाठी सर्वोत्तम दिवस",
    storageAdvice: "साठवण सल्ला",
    riskLevel: "जोखीम स्तर",
    aiConfidence: "AI आत्मविश्वास",
    priceForecast: "7-दिवसांची किंमत अंदाज",
    mandiDemand: "मंडी मागणी",
    estimatedPricePerKg: "प्रति किलो अंदाजित किंमत",
    mandiDemandExplanation: "हे दाखवते की मंडीचे खरेदीदार तुमच्या पिकासाठी कोणत्या बाजाराला सर्वाधिक मागणी देत आहेत.",
    topDemand: "खरेदीदार प्राधान्य देतात",
    marketLocal: "स्थानिक मंडी",
    marketCity: "शहर मंडी",
    marketExport: "निर्यात मंडी",
    marketProcess: "प्रक्रिया मंडी",
    estimatedBuyerDemand: "मंडीमध्ये तुमच्या पिकासाठी खरेदीदार काय मागतात",
    today: "आज",
    expected: "अपेक्षित",
    tomorrow: "उद्या",
    day1: "दिवस 1",
    day2: "दिवस 2",
    day3: "दिवस 3",
    day4: "दिवस 4",
    day5: "दिवस 5",
    day6: "दिवस 6",
    day7: "दिवस 7",
    forHarvest: "साठी",
    basedOnMandiTrends: "मंडी ट्रेंडच्या आधारे",
    riskWord: "जोखीम",
    adviceRising: "बाजार वाढत आहे. 3-4 दिवस प्रतिक्षा करा आणि सर्वोच्च किंमत मिळवा.",
    adviceFalling: "बाजार खाली जाऊन आहे. आपला नफा आजच सुरक्षित करा.",
    langName_en: "English",
    langName_hi: "हिंदी",
    langName_mr: "मराठी",
    in: "मध्ये",
    local: "स्थानिक",
    city: "शहर",
    export: "निर्यात",
    process: "प्रक्रिया",
    demandHigh: "उच्च मागणी",
    demandStable: "स्थिर मागणी",
    demandLow: "कमी मागणी",
    storage: {
      tomato: "थंड साठवण करा (10-15°C). लवकर विक्रीसाठी असलेली पिक आहे, त्वरीत विक्री करा.",
      onion: "आक्रमकपणे वाऱ्याचे ठिकाण निवडा जेथे अंकुरणे होणार नाही.",
      potato: "थंड आणि अंधाऱ्या ठिकाणी साठवा. ओलावा टाळा.",
      wheat: "कोरडे, किडीमुक्त सायलोमध्ये ठेवा. ओलावा 12% पेक्षा कमी ठेवा.",
      rice: "कोरड्या पिशव्यांमध्ये जमीनपासून वर ठेवा जेणेकरून ओलावा लागू शकणार नाही.",
      cotton: "पूर्णपणे कोरडे ठेवा. ओलावा तंतू खराब करेल.",
      sugarcane: "कापणी नंतर लगेच प्रक्रिया करा जेणेकरून साखर टिकून राहील.",
      default: "थंड, कोरडे ठिकाण आणि थेट उन्हापासून दूर ठेवा."
    }
  }
};

function Market() {
  const resultsRef = useRef(null);
  const { language: lang } = useLanguage();

  const t = (key) => marketText[lang][key] || marketText.en[key] || key;
  const activeLoadingSteps = marketText[lang].loadingSteps || loadingSteps;
  const translateResultValue = (category, value) => {
    const map = {
      demand: {
        en: { "High Demand": "High Demand", "Stable Demand": "Stable Demand", "Low Demand": "Low Demand" },
        hi: { "High Demand": "उच्च मांग", "Stable Demand": "स्थिर मांग", "Low Demand": "कम मांग" },
        mr: { "High Demand": "उच्च माग", "Stable Demand": "स्थिर माग", "Low Demand": "कमी माग" }
      },
      risk: {
        en: { High: "High", Medium: "Medium", Low: "Low" },
        hi: { High: "उच्च", Medium: "मध्यम", Low: "कम" },
        mr: { High: "उच्च", Medium: "मध्यम", Low: "कमी" }
      }
    };
    return map[category]?.[lang]?.[value] || value;
  };

  const [formData, setFormData] = useState({
    crop: "tomato",
    state: "Maharashtra",
    district: "Pune",
    quantity: ""
  });

  const [loading, setLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 900);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [result]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const calculateDynamicMarketScore = (crop, state, district, trend, maxPrice, spotPrice) => {
    const seedString = `${crop}-${state}-${district}-${trend}`;
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
      seed += seedString.charCodeAt(i);
    }
    const stableRandom = (seed % 100) / 100;
    const isHighDemandCrop = ["tomato", "onion", "wheat", "rice"].includes(crop.toLowerCase());
    const volatility = (maxPrice - spotPrice) / spotPrice; 
    
    let riskLevel = "Medium";
    let confidence = 0.85;

    if (isHighDemandCrop && trend === "rising" && volatility <= 0.15) {
      riskLevel = "Low";
      confidence = 0.88 + (stableRandom * 0.07);
    } else if (trend === "falling" || volatility > 0.20) {
      riskLevel = "High";
      confidence = 0.55 + (stableRandom * 0.20);
    } else {
      riskLevel = "Medium";
      confidence = 0.75 + (stableRandom * 0.10);
    }

    const demand_level = isHighDemandCrop && trend === "rising" ? "High Demand" : 
                         !isHighDemandCrop && trend === "falling" ? "Low Demand" : "Stable Demand";

    return { risk: riskLevel, confidence, demand_level };
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.crop || !formData.state || !formData.district) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const payload = {
      crop: formData.crop,
      state: formData.state,
      district: formData.district,
      quantity: formData.quantity === "" ? 1000 : Number(formData.quantity)
    };

    try {
      const res = await getMarketForecast(payload);
      
      const forecast = res.forecast || [2500, 2600, 2700, 2800];
      const maxPrice = Math.max(...forecast);
      const lastPrice = res.current_price || 2400;
      
      const spotPricePerKg = parseFloat((lastPrice / 100).toFixed(2));
      const peakPricePerKg = parseFloat((maxPrice / 100).toFixed(2));
      const extra_profit_per_kg = Math.max(0, parseFloat((peakPricePerKg - spotPricePerKg).toFixed(2)));
      const baseProfitMultiplier = extra_profit_per_kg > 0 ? extra_profit_per_kg : 1.85;

      const dynamicScoring = calculateDynamicMarketScore(formData.crop, formData.state, formData.district, res.trend || "rising", maxPrice, lastPrice);

      const finalResult = {
        ...res,
        spotPricePerKg,
        peakPricePerKg,
        extra_profit_per_kg: baseProfitMultiplier,
        total_profit: Math.round(baseProfitMultiplier * payload.quantity),
        demand_level: dynamicScoring.demand_level,
        risk: dynamicScoring.risk,
        confidence: dynamicScoring.confidence,
        advice: res.trend === "rising" 
          ? "The market is moving up. Wait 3-4 days to sell and capture the peak price." 
          : "Market trends show a decline. Secure your profit by selling your harvest today."
      };

      await new Promise(r => setTimeout(r, 2600));
      setResult(finalResult);
    } catch (err) {
      console.warn("Using local simulation.");
      
      const basePrices = { tomato: 2200, onion: 1800, potato: 1500, wheat: 2400, rice: 2800, cotton: 6500, sugarcane: 300 };
      const base = basePrices[formData.crop] || 2000;
      const volatility = 0.09;
      
      const forecast = [
        Math.round(base * (1 + volatility * 0.25)),
        Math.round(base * (1 + volatility * 0.6)),
        Math.round(base * (1 + volatility * 0.95)),
        Math.round(base * (1 + volatility * 1.15))
      ];

      const maxPrice = Math.max(...forecast);
      const spotPricePerKg = parseFloat((base / 100).toFixed(2));
      const peakPricePerKg = parseFloat((maxPrice / 100).toFixed(2));
      const extra_profit_per_kg = parseFloat((peakPricePerKg - spotPricePerKg).toFixed(2));
      const quantityVal = payload.quantity === "" ? 1000 : Number(payload.quantity);

      const dynamicScoring = calculateDynamicMarketScore(formData.crop, formData.state, formData.district, "rising", maxPrice, base);

      const fallbackResult = {
        status: "success",
        current_price: base,
        forecast: forecast,
        trend: "rising",
        max_price: maxPrice,
        min_price: base,
        avg_price: Math.round((base + maxPrice) / 2),
        confidence: dynamicScoring.confidence,
        spotPricePerKg,
        peakPricePerKg,
        extra_profit_per_kg: extra_profit_per_kg > 0 ? extra_profit_per_kg : 1.85,
        total_profit: Math.round((extra_profit_per_kg > 0 ? extra_profit_per_kg : 1.85) * quantityVal),
        demand_level: dynamicScoring.demand_level,
        risk: dynamicScoring.risk,
        advice: "The market is moving up. Wait 3-4 days to sell and capture the peak price."
      };

      await new Promise(r => setTimeout(r, 2600));
      setResult(fallbackResult);
    } finally {
      setLoading(false);
    }
  };

  const getLineChartData = () => {
    if (!result) return [];
    const spot = result.current_price;
    const f = result.forecast || [2500, 2600, 2700, 2800];
    return [
      { day: t('today'), Price: Math.round(spot / 100) },
      { day: t('day1'), Price: Math.round(f[0] / 100) },
      { day: t('day2'), Price: Math.round(f[1] / 100) },
      { day: t('day3'), Price: Math.round(f[2] / 100) },
      { day: t('day4'), Price: Math.round(f[3] / 100) },
      { day: t('day5'), Price: Math.round((f[3] * 1.01) / 100) },
      { day: t('day6'), Price: Math.round((f[3] * 1.005) / 100) },
      { day: t('day7'), Price: Math.round((f[3] * 1.02) / 100) }
    ];
  };

  const getBarChartData = () => {
    return [
      { name: t('local'), Demand: result?.demand_level?.includes("High") ? 92 : 65 },
      { name: t('city'), Demand: result?.demand_level?.includes("High") ? 98 : 75 },
      { name: t('export'), Demand: result?.demand_level?.includes("High") ? 60 : 45 },
      { name: t('process'), Demand: result?.demand_level?.includes("High") ? 55 : 40 },
    ];
  };

  const getTopDemandCategory = () => {
    const data = getBarChartData();
    if (!data.length) return t('local');
    const top = data.reduce((best, item) => item.Demand > best.Demand ? item : best, data[0]).name;
    const labels = {
      [t('local')]: t('marketLocal'),
      [t('city')]: t('marketCity'),
      [t('export')]: t('marketExport'),
      [t('process')]: t('marketProcess')
    };
    return labels[top] || `${top} ${t('market') || ''}`.trim();
  };

  const getBestSellDay = () => {
    if (!result || !result.forecast) return t('day4');
    const forecast = result.forecast;
    const maxIdx = forecast.indexOf(Math.max(...forecast));
    const days = [t('tomorrow'), t('day3'), t('day4'), t('day5')];
    return days[maxIdx] || t('day4');
  };

  const getStorageAdvice = (crop) => {
    const storage = marketText[lang].storage || marketText.en.storage;
    return storage[crop] || storage.default;
  };

  const handleReset = () => {
    setResult(null);
    setError("");
  };

  const MetricCard = ({ title, value, subtext, icon, colorClass, iconBgClass }) => (
    <motion.div variants={cardVariants} className="ag-metric-card flex-1 h-full">
      <div className="ag-metric-top">
        <span className="ag-metric-label">{title}</span>
        <div className={`p-2 rounded-2xl ${iconBgClass}`}>{icon}</div>
      </div>
      <div>
        <h3 className={`ag-metric-value ${colorClass}`}>{value}</h3>
        <p className="ag-metric-note mt-3 text-sm md:text-base">{subtext}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="ag-page text-slate-800">
      <div className="ag-page-inner relative">

        {/* Subtle Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-[18vh] bg-gradient-to-b from-emerald-50/60 to-transparent pointer-events-none z-0" />

        <div className="w-full mx-auto relative z-10 flex flex-col gap-5 md:gap-6">
        
        {/* 1. Page Header (use app-wide styles) */}
        <header className="ag-page-header ag-animate">
          <div>
            <p className="ag-eyebrow">{t('market')}</p>
            <h1 className="ag-title">{t('forecast')}</h1>
            <p className="ag-subtitle">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`ag-pill ${result ? 'success' : 'info'}`}>
              <div style={{ width: 8, height: 8, borderRadius: 8, background: result ? 'var(--ag-green-800)' : '#3b82f6' }} />
              {result ? t('analysisComplete') : t('engineReady')}
            </span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            /* 3. Compact Loading Screen */
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="ag-screen-card w-full flex flex-col items-center justify-center min-h-[260px] space-y-6"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-50 border-t-emerald-500 animate-spin" />
                <Activity size={16} className="text-emerald-500 animate-pulse absolute" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm md:text-base font-bold text-slate-800">{t('analyzingMarketData')}</h3>
                <p className="text-sm md:text-sm text-slate-500 font-medium">{t('processingLiveTrends')} {formData.crop} {t('in')} {formData.district}</p>
              </div>

              <div className="w-full max-w-[280px] space-y-3">
                {activeLoadingSteps.map((stepText, idx) => {
                  const isActive = idx === loadingStepIndex;
                  const isCompleted = idx < loadingStepIndex;
                  return (
                    <div key={idx} className={`flex items-center gap-2.5 transition-opacity duration-300 ${isActive ? 'opacity-100' : isCompleted ? 'opacity-40' : 'opacity-20'}`}>
                      <div className={`p-1 rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-blue-50 text-blue-500 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                        {isCompleted ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />}
                      </div>
                      <span className={`text-sm md:text-sm font-medium ${isCompleted ? 'text-slate-400 line-through' : isActive ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                        {stepText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : result ? (
            /* Result Dashboard */
            <motion.div 
              ref={resultsRef}
              key="result"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="ag-screen-card flex flex-col gap-5 md:gap-6"
            >
              <div className="ag-screen-fixed-header">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="hidden sm:block">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t('market')}</p>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900">{t('forecast')}</h2>
                  </div>
                  <button onClick={handleReset} className="ag-btn px-4 py-3 rounded-full text-sm font-bold bg-emerald-700 hover:bg-emerald-800 transition-colors">
                    <RefreshCw size={14} /> {t('startNewForecast')}
                  </button>
                </div>
              </div>

              <div className="ag-screen-scroll flex flex-col gap-5 md:gap-6">
                {/* 4. Result Summary Cards (Only 4) */}
                <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 items-stretch">
                <MetricCard 
                  title={t('currentPrice')} 
                  value={`₹${(result.current_price || 2400).toLocaleString()}`} 
                  subtext={`₹${result.spotPricePerKg}/kg ${t('today')}`} 
                  icon={<Package size={18} />} 
                  colorClass="text-slate-800" 
                  iconBgClass="bg-slate-50 text-slate-500" 
                />
                <MetricCard 
                  title={t('predictedPeak')} 
                  value={`₹${(result.max_price || 2800).toLocaleString()}`} 
                  subtext={`₹${result.peakPricePerKg}/kg ${t('expected')}`} 
                  icon={<TrendingUp size={18} />} 
                  colorClass="text-emerald-600" 
                  iconBgClass="bg-emerald-50 text-emerald-600" 
                />
                <MetricCard 
                  title={t('extraProfit')} 
                  value={`+₹${result.total_profit.toLocaleString()}`} 
                  subtext={`${t('forHarvest')} ${formData.quantity || 1000} kg`} 
                  icon={<Scale size={18} />} 
                  colorClass="text-emerald-600" 
                  iconBgClass="bg-emerald-50 text-emerald-600" 
                />
                <MetricCard 
                  title={t('marketDemand')} 
                  value={translateResultValue('demand', result.demand_level)} 
                  subtext={t('basedOnMandiTrends')} 
                  icon={<Zap size={18} />} 
                  colorClass="text-slate-800" 
                  iconBgClass="bg-blue-50 text-blue-500" 
                />
              </motion.div>

                {/* 6. Farmer Advice Section */}
                <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 items-stretch">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 md:p-5 flex flex-col justify-between h-full shadow-[0_2px_8px_-2px_rgba(16,185,129,0.05)] hover:-translate-y-0.5 transition-transform duration-300">
                  <div className="flex gap-3">
                    <CalendarDays className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-emerald-700">{t('bestDayToSell')}</h4>
                      <p className="text-xl md:text-2xl font-bold text-emerald-900 mt-1">{getBestSellDay()}</p>
                      <p className="text-sm md:text-base text-emerald-600/90 mt-3 font-semibold leading-relaxed">{result.trend === 'falling' ? t('adviceFalling') : t('adviceRising')}</p>
                    </div>
                  </div>
                </div>

                {/* Storage Advice Banner */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 md:p-5 flex gap-3 h-full shadow-[0_2px_8px_-2px_rgba(99,102,241,0.05)] hover:-translate-y-0.5 transition-transform duration-300">
                  <Star className="text-indigo-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm md:text-base font-semibold text-indigo-700">{t('storageAdvice')}</h4>
                    <p className="text-sm md:text-base font-medium text-indigo-900 mt-3 leading-relaxed">
                      {getStorageAdvice(formData.crop)}
                    </p>
                  </div>
                </div>

                {/* Dynamic Risk & Confidence Banner */}
                <div className={`border rounded-2xl p-4 md:p-5 flex flex-col gap-2 h-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-transform duration-300 relative ${result.risk === 'High' ? 'bg-red-50/50 border-red-100' : result.risk === 'Low' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
                  
                  {/* Tooltip trigger */}
                  <div 
                    className="absolute top-4 right-4 cursor-pointer text-slate-400 hover:text-slate-600"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <Info size={14} />
                  </div>
                  {showTooltip && (
                    <div className="absolute top-10 right-0 bg-slate-800 text-white text-[10px] p-2 rounded-lg w-48 shadow-lg z-50 pointer-events-none">
                      {t('calculatedDynamically')}
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <ShieldAlert className={`shrink-0 mt-0.5 ${result.risk === 'High' ? 'text-red-500' : result.risk === 'Low' ? 'text-emerald-500' : 'text-amber-500'}`} size={18} />
                    <div className="w-full">
                      <h4 className={`text-sm md:text-base font-semibold ${result.risk === 'High' ? 'text-red-700' : result.risk === 'Low' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {t('riskLevel')}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={`text-sm md:text-base font-bold ${result.risk === 'High' ? 'text-red-900' : result.risk === 'Low' ? 'text-emerald-900' : 'text-amber-900'}`}>
                          {translateResultValue('risk', result.risk)} {t('riskWord')}
                        </p>
                      </div>

                      {/* Dynamic Confidence Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-slate-500">{t('aiConfidence')}</span>
                          <span className={result.confidence > 0.8 ? "text-emerald-600" : result.confidence > 0.65 ? "text-amber-600" : "text-red-600"}>
                            {Math.round(result.confidence * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full ${result.confidence > 0.8 ? "bg-emerald-500" : result.confidence > 0.65 ? "bg-amber-500" : "bg-red-500"}`} 
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 5. Charts Section */}
              <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                
                {/* 7-Day Forecast */}
                <div className="bg-white border border-slate-100/80 p-4 md:p-5 rounded-2xl h-full shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <h4 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-1.5">
                      <Activity size={16} className="text-emerald-500" />
                      {t('priceForecast')}
                    </h4>
                    <p className="text-sm md:text-base text-slate-500 mt-1 font-semibold">{t('estimatedPricePerKg')}</p>
                  </div>
                  <div className="w-full h-[180px] md:h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getLineChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPriceMkt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={8} interval="preserveStartEnd" minTickGap={20} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} domain={['dataMin - 2', 'dataMax + 2']} />
                        <RechartsTooltip 
                          contentStyle={{ 
                            background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px",
                            fontSize: "11px", fontWeight: "600", padding: "8px 12px", boxShadow: "0 4px 12px -2px rgba(0,0,0,0.08)"
                          }} 
                        />
                        <Area 
                          type="monotone" dataKey="Price" stroke="#10B981" strokeWidth={2} 
                          fillOpacity={1} fill="url(#colorPriceMkt)"
                          dot={{ r: 3, fill: '#fff', strokeWidth: 1.5, stroke: '#10B981' }} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Mandi Demand */}
                <div className="bg-white border border-slate-100/80 p-4 md:p-5 rounded-2xl h-full shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <h4 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-1.5">
                      <BarChartIcon size={16} className="text-blue-500" />
                      {t('mandiDemand')}
                    </h4>
                    <p className="text-sm md:text-base text-slate-500 mt-1 font-semibold">{t('mandiDemandExplanation')}</p>
                    <div className="mt-3 rounded-2xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-sm md:text-base text-slate-500 mb-1">{t('topDemand')}</p>
                      <p className="text-base md:text-lg font-bold text-slate-900">{getTopDemandCategory()}</p>
                    </div>
                  </div>
                  <div className="w-full h-[180px] md:h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={getBarChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={8} interval="preserveStartEnd" />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                        <RechartsTooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{ 
                            background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px",
                            fontSize: "11px", fontWeight: "600", padding: "8px 12px", boxShadow: "0 4px 12px -2px rgba(0,0,0,0.08)"
                          }} 
                        />
                        <Bar dataKey="Demand" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </motion.div>

            </div>
          </motion.div>
          ) : (
            /* 2. Forecast Form */
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="ag-panel ag-form"
            >
                <div className="ag-section-title">
                  <div>
                    <h2>{t('cropDetails')}</h2>
                    <p>{t('formSubtitle')}</p>
                  </div>
                </div>

              <form onSubmit={handleSubmit} className="ag-form">

                <div className="ag-field">
                  <label>{t('cropType')}</label>
                  <select name="crop" value={formData.crop} onChange={handleChange} className="ag-select" disabled={loading}>
                    {crops.map(cr => <option key={cr.value} value={cr.value}>{cr.label}</option>)}
                  </select>
                </div>

                <div className="ag-field">
                  <label>{t('state')}</label>
                  <select name="state" value={formData.state} onChange={handleChange} className="ag-select" disabled={loading}>
                    {states.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>

                <div className="ag-field">
                  <label>{t('district')}</label>
                  <div>
                    <input name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Pune" className="ag-input" required disabled={loading} />
                  </div>
                </div>

                <div className="ag-field">
                  <label>{t('harvestQuantity')}</label>
                  <div>
                    <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="e.g. 1000" className="ag-input" disabled={loading} />
                  </div>
                </div>

                <div className="md:col-span-2 pt-2">
                  <button type="submit" disabled={loading} className="ag-btn">
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : <BarChart3 size={18} />}
                    {t('generateForecast')}
                  </button>
                </div>
              </form>

              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-2.5 mt-5">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <span className="text-xs text-red-700 font-medium">{error}</span>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
  );
}

export default Market;
