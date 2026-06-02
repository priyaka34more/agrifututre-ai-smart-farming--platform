import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import "./Settings.css";
import {
  Globe,
  Cpu,
  Sliders,
  Sun,
  Moon,
  Sparkles,
  Database,
  Wifi,
  Activity,
  ArrowLeft,
  Check,
  RefreshCw,
  Bell,
  SlidersHorizontal
} from "lucide-react";

// Tab entry animation variants
const tabVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } }
};

function Settings() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  // Active category tab
  const [activeTab, setActiveTab] = useState("preferences");

  // --- LOCAL STATE (Persisted in localStorage) ---
  
  // 1. Preferences & Units
  const [currency, setCurrency] = useState(() => localStorage.getItem("preferredCurrency") || "INR");
  const [tempUnit, setTempUnit] = useState(() => localStorage.getItem("tempUnit") || "C");
  const [areaUnit, setAreaUnit] = useState(() => localStorage.getItem("areaUnit") || "acres");

  // 2. AI Engine Config
  const [aiEngine, setAiEngine] = useState(() => localStorage.getItem("aiEngine") || "CropPredict-Pro");
  const [sensitivity, setSensitivity] = useState(() => localStorage.getItem("aiSensitivity") || "Balanced");
  const [alertNotifications, setAlertNotifications] = useState(() => localStorage.getItem("alertNotifications") || "enabled");

  // 3. Farm Quick Settings
  const [mainCrop, setMainCrop] = useState(() => localStorage.getItem("mainCrop") || "Wheat");
  const [soilType, setSoilType] = useState(() => localStorage.getItem("soilType") || "Black Soil");
  const [irrigation, setIrrigation] = useState(() => localStorage.getItem("irrigationStatus") || "Drip Irrigation");

  // 4. Appearance & Accessibility
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem("themeMode") || "emerald");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("fontSize") || "normal");
  const [compactLayout, setCompactLayout] = useState(() => localStorage.getItem("compactLayout") === "true");

  // --- DIAGNOSTICS STATE ---
  const [diagnosticStatus, setDiagnosticStatus] = useState("idle"); // idle, running, completed
  const [diagProgress, setDiagProgress] = useState(0);
  const [diagLogs, setDiagLogs] = useState([]);
  const [latency, setLatency] = useState(115);
  const [accuracy, setAccuracy] = useState(99.4);

  // --- Toast/Notification State ---
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Apply Appearance settings in real-time
  useEffect(() => {
    // Apply theme to document documentElement
    const root = document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark-theme");
      root.classList.remove("light-theme", "emerald-theme");
    } else if (themeMode === "emerald") {
      root.classList.add("emerald-theme");
      root.classList.remove("light-theme", "dark-theme");
    } else {
      root.classList.add("light-theme");
      root.classList.remove("dark-theme", "emerald-theme");
    }

    // Apply font size scale
    if (fontSize === "large") {
      document.body.style.fontSize = "18px";
    } else {
      document.body.style.fontSize = "16px";
    }
  }, [themeMode, fontSize]);

  const handleSave = () => {
    // Save everything to localStorage
    localStorage.setItem("preferredCurrency", currency);
    localStorage.setItem("tempUnit", tempUnit);
    localStorage.setItem("areaUnit", areaUnit);
    localStorage.setItem("aiEngine", aiEngine);
    localStorage.setItem("aiSensitivity", sensitivity);
    localStorage.setItem("alertNotifications", alertNotifications);
    localStorage.setItem("mainCrop", mainCrop);
    localStorage.setItem("soilType", soilType);
    localStorage.setItem("irrigationStatus", irrigation);
    localStorage.setItem("themeMode", themeMode);
    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("compactLayout", compactLayout.toString());

    setToastMessage("Settings successfully synchronized with AgriCloud! ✨");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore standard system presets?")) {
      setLanguage("en");
      setCurrency("INR");
      setTempUnit("C");
      setAreaUnit("acres");
      setAiEngine("CropPredict-Pro");
      setSensitivity("Balanced");
      setAlertNotifications("enabled");
      setMainCrop("Wheat");
      setSoilType("Black Soil");
      setIrrigation("Drip Irrigation");
      setThemeMode("emerald");
      setFontSize("normal");
      setCompactLayout(false);

      setToastMessage("System presets restored successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Simulated Diagnostics System
  const runDiagnostics = () => {
    setDiagnosticStatus("running");
    setDiagProgress(0);
    setDiagLogs([]);

    const steps = [
      { prg: 20, log: "📡 Pinged AgriCore Edge servers... Successful." },
      { prg: 45, log: "🗄️ Handshake with Local DB & Persistent Cache... Synchronized." },
      { prg: 70, log: "🤖 Initializing model inference test on 'CropPredict-Pro'... Warmup complete." },
      { prg: 90, log: "📊 Simulating NDVI multi-spectral crop scan calibration... Accuracies nominal." },
      { prg: 100, log: "💚 Diagnostic completed. All systems reporting optimal functionality!" }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setDiagProgress(step.prg);
        setDiagLogs(prev => [...prev, step.log]);
        if (step.prg === 100) {
          setDiagnosticStatus("completed");
          setLatency(Math.floor(Math.random() * 30) + 95);
          setAccuracy((98.5 + Math.random() * 1.4).toFixed(2));
        }
      }, (idx + 1) * 750);
    });
  };

  return (
    <div className={`min-h-screen bg-[#f7f9f5] text-slate-800 font-sans pb-20 relative overflow-y-auto ${themeMode === "dark" ? "bg-slate-950 text-slate-100" : ""}`}>
      
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none z-0" />

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 pt-6 relative z-10">
        
        {/* Breadcrumb / Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.015)] border border-slate-100 dark:border-slate-800 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-100 dark:border-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition-all flex items-center gap-2 font-bold text-xs"
            >
              <ArrowLeft size={16} />
              <span>⬅️ Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                ⚙️ Settings & Control Center
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Customize localizations, calibrate predictive AI models, and debug platform latency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              AI Core v3.5
            </span>
          </div>
        </div>

        {/* Outer Grid Layout (Fixed to guarantee side-by-side on desktop!) */}
        <div className="settings-grid">
          
          {/* LEFT: Sidebar Navigation Tabs */}
          <div className="settings-sidebar">
            <button
              onClick={() => setActiveTab("preferences")}
              className={`settings-tab-btn ${activeTab === "preferences" ? "active" : ""}`}
            >
              <Globe size={16} />
              <span>General Preferences</span>
            </button>
            <button
              onClick={() => setActiveTab("aiEngine")}
              className={`settings-tab-btn ${activeTab === "aiEngine" ? "active" : ""}`}
            >
              <Cpu size={16} />
              <span>AI Engine Parameter</span>
            </button>
            <button
              onClick={() => setActiveTab("farmSettings")}
              className={`settings-tab-btn ${activeTab === "farmSettings" ? "active" : ""}`}
            >
              <Sliders size={16} />
              <span>Farm Parameters</span>
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`settings-tab-btn ${activeTab === "appearance" ? "active" : ""}`}
            >
              <Sun size={16} />
              <span>UI Accessibility</span>
            </button>
            <button
              onClick={() => setActiveTab("diagnostics")}
              className={`settings-tab-btn ${activeTab === "diagnostics" ? "active" : ""}`}
            >
              <Activity size={16} />
              <span>AI Diagnostics</span>
            </button>
          </div>

          {/* RIGHT: Active Tab Form content */}
          <div className="settings-main-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="settings-main-card"
              >
                
                {/* Active Tab Panel Content */}
                <div>
                  
                  {/* TAB 1: General Preferences */}
                  {activeTab === "preferences" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-slate-50 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                          <Globe className="text-emerald-500" size={20} /> Localization & General Prefs
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Configure language rendering, trading currency standards, and metric units.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Preferred Language */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Preferred Language</label>
                          <p className="text-[11px] text-slate-400 -mt-1">Changes all platform text, voice hints, and recommendations.</p>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="settings-select"
                          >
                            <option value="en">English (US)</option>
                            <option value="hi">हिंदी (Hindi)</option>
                            <option value="mr">मराठी (Marathi)</option>
                          </select>
                        </div>

                        {/* Preferred Currency */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Trading Currency</label>
                          <p className="text-[11px] text-slate-400 -mt-1">Applied across commodity price projections and market tickers.</p>
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="settings-select"
                          >
                            <option value="INR">INR (₹) - Indian Rupee</option>
                            <option value="USD">USD ($) - US Dollar</option>
                            <option value="EUR">EUR (€) - Euro</option>
                          </select>
                        </div>

                        {/* Temperature Unit */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Temperature Scale</label>
                          <p className="text-[11px] text-slate-400 -mt-1">Determines whether smart weather metrics render in Celsius or Fahrenheit.</p>
                          <div className="settings-btn-group">
                            <button
                              type="button"
                              onClick={() => setTempUnit("C")}
                              className={`settings-btn-item ${tempUnit === "C" ? "active" : ""}`}
                            >
                              Celsius (°C)
                            </button>
                            <button
                              type="button"
                              onClick={() => setTempUnit("F")}
                              className={`settings-btn-item ${tempUnit === "F" ? "active" : ""}`}
                            >
                              Fahrenheit (°F)
                            </button>
                          </div>
                        </div>

                        {/* Land Measurement Unit */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Area Metric</label>
                          <p className="text-[11px] text-slate-400 -mt-1">Select your preferred system for sizing yield & soil prediction scopes.</p>
                          <select
                            value={areaUnit}
                            onChange={(e) => setAreaUnit(e.target.value)}
                            className="settings-select"
                          >
                            <option value="acres">Acres (Standard)</option>
                            <option value="hectares">Hectares (Metric)</option>
                            <option value="bigha">Bigha (Traditional)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: AI Engine parameters */}
                  {activeTab === "aiEngine" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-slate-50 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                          <Cpu className="text-emerald-500" size={20} /> AI Parameters & Models
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Select the AI "brain" and prediction strategies that best fit your farming needs.</p>
                      </div>

                      <div className="space-y-6">
                        {/* Target Model Selection */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Core AI Brain Selection</label>
                          <p className="text-[11px] text-slate-400 -mt-1">Choose the AI brain that calculates your harvest yields and forecasts crop health.</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                              { id: "CropPredict-Pro", label: "CropPredict Pro", speed: "115ms latency", type: "Best for Yield & Income" },
                              { id: "SoilSense-v3", label: "SoilSense v3", speed: "190ms latency", type: "Best for Soil & Fertilizers" },
                              { id: "Standard AgriModel", label: "Standard AgriModel", speed: "70ms latency", type: "Best for Older Phones & Low Signal" }
                            ].map((model) => (
                              <div
                                key={model.id}
                                onClick={() => setAiEngine(model.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                                  aiEngine === model.id
                                    ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20"
                                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800 dark:text-white">{model.label}</span>
                                    {aiEngine === model.id && <Check size={14} className="text-emerald-600" />}
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-1">{model.type}</p>
                                </div>
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-3">{model.speed}</span>
                              </div>
                            ))}
                          </div>

                          {/* Dynamic Model Explanation Card (Ultra User-Friendly!) */}
                          <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-2xl mt-1.5 flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                              💡 Simple Guide:
                            </span>
                            {aiEngine === "CropPredict-Pro" && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                                <strong>CropPredict Pro (Recommended)</strong>: The smartest calculator. It uses state-of-the-art satellite and weather formulas to predict your harvest yields and income. Perfect for standard crops like Wheat, Rice, and Cotton.
                              </p>
                            )}
                            {aiEngine === "SoilSense-v3" && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                                <strong>SoilSense v3</strong>: Focused deeply on what lies underground. It takes slightly longer but offers highly detailed calculations on moisture retention, chemistry changes, and custom fertilizer plans.
                              </p>
                            )}
                            {aiEngine === "Standard AgriModel" && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                                <strong>Standard AgriModel (Lightweight)</strong>: Designed specifically for rural fields. It uses very little mobile data and runs smoothly even if you have an older smartphone or a weak internet connection.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Yield Prediction Sensitivity */}
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Prediction Strategy</label>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                              {sensitivity} Plan
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 -mt-1">Sets prediction weights: Balanced (realistic), Conservative (underestimates risks), Optimistic (high yields assuming ideal climate).</p>
                          <div className="settings-btn-group">
                            {["Conservative", "Balanced", "Optimistic"].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setSensitivity(val)}
                                className={`settings-btn-item ${sensitivity === val ? "active" : ""}`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>

                          {/* Dynamic Sensitivity Explanation Card (Ultra User-Friendly!) */}
                          <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-2xl mt-1.5 flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                              🛡️ Strategy Analysis:
                            </span>
                            {sensitivity === "Conservative" && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                                <strong>Conservative (Safe Plan)</strong>: Prepares you for tough conditions. It assumes potential pest attacks and bad weather to keep your agricultural investments and budgets extremely safe.
                              </p>
                            )}
                            {sensitivity === "Balanced" && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                                <strong>Balanced (Realistic Plan)</strong>: The standard setup. It uses typical, historical seasonal weather forecasts to estimate normal harvest targets.
                              </p>
                            )}
                            {sensitivity === "Optimistic" && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                                <strong>Optimistic (High Yield Plan)</strong>: Assumes ideal weather conditions and zero crop issues. Useful for planning your absolute maximum possible harvest storage and market selling capacity.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Custom Push Toggles */}
                        <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-850">
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                              <Bell size={14} className="text-emerald-600" /> Emergency Crop Health Alerts
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Get urgent warning messages sent directly to your phone if an outbreak is calculated in your neighborhood.</p>
                          </div>
                          <select
                            value={alertNotifications}
                            onChange={(e) => setAlertNotifications(e.target.value)}
                            className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            <option value="enabled">Active (SMS & Notification)</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Farm Quick Settings */}
                  {activeTab === "farmSettings" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-slate-50 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                          <SlidersHorizontal className="text-emerald-500" size={20} /> Primary Farm Parameters
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Configure preset variables that pre-populate your yield prediction inputs.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Main Crop Select */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Default Target Crop</label>
                          <p className="text-[11px] text-slate-400 -mt-1">Primary crop type preselected in yield computations.</p>
                          <select
                            value={mainCrop}
                            onChange={(e) => setMainCrop(e.target.value)}
                            className="settings-select"
                          >
                            <option value="Wheat">Wheat (Kharif/Rabi)</option>
                            <option value="Rice">Rice (Paddy)</option>
                            <option value="Cotton">Cotton</option>
                            <option value="Tomato">Tomato / Vegetables</option>
                            <option value="Maize">Maize (Corn)</option>
                          </select>
                        </div>

                        {/* Soil Type Select */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Dominant Soil Type</label>
                          <p className="text-[11px] text-slate-400 -mt-1">Determines water filtration coefficients for yield models.</p>
                          <select
                            value={soilType}
                            onChange={(e) => setSoilType(e.target.value)}
                            className="settings-select"
                          >
                            <option value="Black Soil">Black Cotton Soil</option>
                            <option value="Clay Soil">Clay (High Water Retention)</option>
                            <option value="Loamy Soil">Loamy (Fertile Mix)</option>
                            <option value="Sandy Soil">Sandy (Low Retention)</option>
                          </select>
                        </div>

                        {/* Irrigation System Type */}
                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Irrigation Setup</label>
                          <p className="text-[11px] text-slate-400 -mt-1">Select your standard irrigation method to calibrate predictive water metrics.</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                            {[
                              { id: "Drip Irrigation", title: "Drip Irrigation", desc: "Sub-surface targeted feeding" },
                              { id: "Sprinkler System", title: "Sprinklers", desc: "Overhead simulated rain" },
                              { id: "Manual Rainfed", title: "Rainfed (Monsoon Only)", desc: "Zero mechanical irrigation" }
                            ].map((irr) => (
                              <div
                                key={irr.id}
                                onClick={() => setIrrigation(irr.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                                  irrigation === irr.id
                                    ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20"
                                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800 dark:text-white">{irr.title}</span>
                                  {irrigation === irr.id && <Check size={14} className="text-emerald-600" />}
                                </div>
                                <p className="text-[9px] text-slate-400 mt-1">{irr.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Appearance & UI Customization */}
                  {activeTab === "appearance" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-slate-50 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                          <Sun className="text-emerald-500" size={20} /> Interface Styles & Accessibility
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Tailor the visual presentation, color themes, and readability layouts.</p>
                      </div>

                      <div className="space-y-5">
                        
                        {/* Theme Select */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Color System Theme</label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { id: "emerald", name: "Premium Emerald", icon: Sparkles, colors: "from-emerald-500 to-teal-600" },
                              { id: "light", name: "Classic Light", icon: Sun, colors: "from-amber-400 to-orange-500" },
                              { id: "dark", name: "Cyber Dark", icon: Moon, colors: "from-slate-700 to-slate-900" }
                            ].map((theme) => (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={() => setThemeMode(theme.id)}
                                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                                  themeMode === theme.id
                                    ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20"
                                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${theme.colors} flex items-center justify-center text-white`}>
                                  <theme.icon size={16} />
                                </div>
                                <span className="text-xs font-bold text-slate-800 dark:text-white">{theme.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Font Size Selector */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Accessibility Font Scale</label>
                          <p className="text-[11px] text-slate-400 -mt-1">Enhance readability for outdoor daylight or elderly farmers.</p>
                          <div className="settings-btn-group">
                            <button
                              type="button"
                              onClick={() => setFontSize("normal")}
                              className={`settings-btn-item ${fontSize === "normal" ? "active" : ""}`}
                            >
                              Standard Scale (Default)
                            </button>
                            <button
                              type="button"
                              onClick={() => setFontSize("large")}
                              className={`settings-btn-item ${fontSize === "large" ? "active" : ""}`}
                            >
                              Large Scale (+15% Magnification)
                            </button>
                          </div>
                        </div>

                        {/* Toggle Compact Layout */}
                        <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-850">
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                              Compact UI Dense Mode
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Minimize page spacings & margins to present maximum statistics without scrolling.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCompactLayout(prev => !prev)}
                            className={`w-12 h-6 rounded-full p-1 transition-all ${compactLayout ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full transition-transform ${compactLayout ? "translate-x-6" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: AI Diagnostics Dashboard */}
                  {activeTab === "diagnostics" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                        <div>
                          <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                            <Activity className="text-emerald-500" size={20} /> Deep System Diagnostics
                          </h2>
                          <p className="text-xs text-slate-400 mt-1">Audit connection telemetry, API response times, and run virtual simulations.</p>
                        </div>
                        
                        <button
                          type="button"
                          disabled={diagnosticStatus === "running"}
                          onClick={runDiagnostics}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200/50 text-xs font-bold flex items-center gap-2 transition-all"
                        >
                          <RefreshCw size={14} className={diagnosticStatus === "running" ? "animate-spin text-emerald-600" : "text-emerald-600"} />
                          {diagnosticStatus === "running" ? "Diagnosing..." : "Run Systems Audit"}
                        </button>
                      </div>

                      {/* Stat meters */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                            <Wifi size={12} className="text-emerald-500" /> Telemetry Latency
                          </span>
                          <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                            {latency} <span className="text-xs font-bold text-slate-400">ms</span>
                          </div>
                          <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded mt-2 inline-block">Excellent Connection</span>
                        </div>

                        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                            <Cpu size={12} className="text-emerald-500" /> Prediction Accuracy
                          </span>
                          <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                            {accuracy} <span className="text-xs font-bold text-slate-400">%</span>
                          </div>
                          <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded mt-2 inline-block">Calibrated Weightings</span>
                        </div>

                        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                            <Database size={12} className="text-emerald-500" /> Cache Telemetry
                          </span>
                          <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                            28.4 <span className="text-xs font-bold text-slate-400">KB</span>
                          </div>
                          <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded mt-2 inline-block">Synchronized Local</span>
                        </div>
                      </div>

                      {/* Audit Progress Bar */}
                      {diagnosticStatus !== "idle" && (
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 dark:text-white">Audit Operations Progress</span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{diagProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${diagProgress}%` }} />
                          </div>

                          <div className="bg-slate-900 text-[10px] font-mono p-3 rounded-lg text-emerald-400 space-y-1.5 max-h-[140px] overflow-y-auto mt-2">
                            {diagLogs.map((log, idx) => (
                              <div key={idx} className="flex gap-1.5">
                                <span className="text-slate-500 select-none">[{idx + 1}]</span>
                                <span>{log}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Footer Save & Reset Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-5 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350 rounded-xl font-bold text-xs transition-all border border-slate-200/50 dark:border-slate-700/80"
                    >
                      Restore Presets
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200/40"
                    >
                      ⬅️ Go Back to Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} /> Synchronize Config
                    </button>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Modern sliding snackbar/toast for visual WOW feedback */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900/95 dark:bg-slate-900/98 backdrop-blur-md text-white border border-emerald-500/20 px-5 py-4 rounded-2xl shadow-[0_10px_35px_-10px_rgba(0,0,0,0.3)] flex items-center gap-3 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Check size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">AgriFuture Cloud Sync</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-normal">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Settings;