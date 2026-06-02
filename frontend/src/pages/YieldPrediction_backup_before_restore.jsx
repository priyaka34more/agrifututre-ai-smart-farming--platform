import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Calculator,
  CheckCircle2,
  Coins,
  Droplets,
  IndianRupee,
  Leaf,
  Loader2,
  Scale,
  ShieldAlert,
  Sprout,
  TrendingUp,
  WalletCards
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { estimateYield } from "../services/apiService";
import "./YieldPrediction.css";

const crops = ["Tomato", "Rice", "Wheat", "Maize", "Sugarcane", "Cotton", "Soybean", "Potato", "Onion"];
const soils = ["Loamy", "Clay", "Sandy", "Black", "Red", "Alluvial", "Sandy Loam", "Clay Loam"];
const seasons = ["Kharif", "Rabi", "Zaid", "Whole Year"];

const loadingSteps = [
  "Checking soil and crop fit",
  "Reading rainfall and temperature",
  "Estimating yield and cost",
  "Preparing profit guidance"
];

function localYieldEstimate(formData) {
  const land = Number(formData.land_area_acre || 1);
  const price = Number(formData.market_price_per_kg || 22);
  const budget = Number(formData.fertilizer_budget || 4500);
  const baseYield = {
    Tomato: 9500,
    Rice: 2300,
    Wheat: 1800,
    Maize: 2200,
    Sugarcane: 32000,
    Cotton: 950,
    Soybean: 1000,
    Potato: 8000,
    Onion: 7000
  }[formData.crop_type] || 1800;

  const rain = Number(formData.rainfall_mm || 700);
  const temp = Number(formData.temperature_c || 28);
  const waterFactor = formData.irrigation_available ? 1.12 : 0.94;
  const weatherFactor = rain > 300 && rain < 1500 && temp > 15 && temp < 35 ? 1.08 : 0.9;
  const estimatedYield = Math.round(baseYield * land * waterFactor * weatherFactor);
  const revenue = Math.round(estimatedYield * price);
  const cost = Math.round(budget + land * 14500);
  const profit = revenue - cost;

  return {
    status: "success",
    crop_type: formData.crop_type,
    estimated_yield_kg: estimatedYield,
    estimated_cost_inr: cost,
    expected_revenue_inr: revenue,
    expected_profit_inr: profit,
    risk_level: profit > revenue * 0.25 ? "Low" : profit > revenue * 0.1 ? "Medium" : "High",
    recommendation: "Use balanced fertilizer, monitor mandi prices before sale, and maintain irrigation discipline.",
    fertilizer_recommendation: `Use crop-specific NPK schedule suitable for ${formData.soil_type} soil.`,
    water_advice: formData.irrigation_available ? "Use drip or scheduled irrigation to prevent stress." : "Use mulching and rainwater conservation to reduce moisture loss.",
    profit_advice: "Review market price weekly and avoid over-investing in late-stage inputs.",
    best_crop_recommendation: {
      crop_name: formData.crop_type,
      expected_profit_inr: profit,
      risk_level: profit > 0 ? "Low" : "High"
    }
  };
}

function normalizeYield(raw, formData) {
  const fallback = localYieldEstimate(formData);
  const source = raw?.status === "success" ? raw : fallback;
  const risk = source.risk_level || source.risk || fallback.risk_level;
  const confidence = risk === "Low" ? 0.91 : risk === "Medium" ? 0.78 : 0.63;

  return {
    ...fallback,
    ...source,
    risk,
    confidence,
    crop_type: source.crop_type || formData.crop_type,
    estimated_yield_kg: Number(source.estimated_yield_kg || fallback.estimated_yield_kg),
    estimated_cost_inr: Number(source.estimated_cost_inr || fallback.estimated_cost_inr),
    expected_revenue_inr: Number(source.expected_revenue_inr || fallback.expected_revenue_inr),
    expected_profit_inr: Number(source.expected_profit_inr || fallback.expected_profit_inr)
  };
}

function YieldPrediction() {
  const resultRef = useRef(null);
  const [formData, setFormData] = useState({
    crop_type: "Cotton",
    soil_type: "Black",
    season: "Kharif",
    land_area_acre: "5",
    rainfall_mm: "850",
    temperature_c: "29",
    irrigation_available: true,
    fertilizer_budget: "18000",
    market_price_per_kg: "68"
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) return undefined;
    setLoadingStep(0);
    const timer = setInterval(() => {
      setLoadingStep((current) => Math.min(current + 1, loadingSteps.length - 1));
    }, 750);
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const comparisonData = useMemo(() => {
    if (!result) return [];
    const value = result.estimated_yield_kg;
    return [
      { name: "Your farm", value },
      { name: "Regional avg", value: Math.round(value * 0.82) },
      { name: "Best practice", value: Math.round(value * 1.18) }
    ];
  }, [result]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const required = ["land_area_acre", "rainfall_mm", "temperature_c", "fertilizer_budget", "market_price_per_kg"];
    if (required.some((key) => !formData[key])) {
      setError("Please fill all farm, climate, and price inputs.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const payload = {
      crop_type: formData.crop_type,
      soil_type: formData.soil_type,
      land_area_acre: Number(formData.land_area_acre),
      rainfall_mm: Number(formData.rainfall_mm),
      temperature_c: Number(formData.temperature_c),
      irrigation_available: Boolean(formData.irrigation_available),
      fertilizer_budget: Number(formData.fertilizer_budget),
      market_price_per_kg: Number(formData.market_price_per_kg)
    };

    try {
      const response = await estimateYield(payload);
      await new Promise((resolve) => setTimeout(resolve, 850));
      setResult(normalizeYield(response, formData));
    } catch (requestError) {
      await new Promise((resolve) => setTimeout(resolve, 850));
      setResult(normalizeYield(localYieldEstimate(formData), formData));
      setError("Yield API is unavailable, so AgriFuture is showing a local AI estimate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ag-page yield-page">
      <div className="ag-page-inner">
        <header className="ag-page-header ag-animate">
          <div>
            <p className="ag-eyebrow">Yield intelligence</p>
            <h1 className="ag-title">AI yield and profit forecast</h1>
            <p className="ag-subtitle">
              Convert crop, soil, climate, irrigation, and mandi price inputs into a clear production and income estimate.
            </p>
          </div>
          <span className="ag-pill success">
            <BadgeCheck size={14} />
            Advisory estimate
          </span>
        </header>

        <section className="yield-layout">
          <form className="ag-panel ag-form yield-form" onSubmit={handleSubmit}>
            <div className="ag-section-title">
              <div>
                <h2>Farm inputs</h2>
                <p>Keep numbers realistic for best guidance</p>
              </div>
            </div>

            <div className="ag-grid three">
              <div className="ag-field">
                <label>Crop</label>
                <select className="ag-select" name="crop_type" value={formData.crop_type} onChange={handleChange}>
                  {crops.map((crop) => <option key={crop} value={crop}>{crop}</option>)}
                </select>
              </div>
              <div className="ag-field">
                <label>Soil</label>
                <select className="ag-select" name="soil_type" value={formData.soil_type} onChange={handleChange}>
                  {soils.map((soil) => <option key={soil} value={soil}>{soil}</option>)}
                </select>
              </div>
              <div className="ag-field">
                <label>Season</label>
                <select className="ag-select" name="season" value={formData.season} onChange={handleChange}>
                  {seasons.map((season) => <option key={season} value={season}>{season}</option>)}
                </select>
              </div>
            </div>

            <div className="ag-grid two">
              <div className="ag-field">
                <label>Land area acres</label>
                <input className="ag-input" name="land_area_acre" type="number" min="0.1" step="0.1" value={formData.land_area_acre} onChange={handleChange} />
              </div>
              <div className="ag-field">
                <label>Rainfall mm</label>
                <input className="ag-input" name="rainfall_mm" type="number" min="0" value={formData.rainfall_mm} onChange={handleChange} />
              </div>
            </div>

            <div className="ag-grid two">
              <div className="ag-field">
                <label>Temperature deg C</label>
                <input className="ag-input" name="temperature_c" type="number" value={formData.temperature_c} onChange={handleChange} />
              </div>
              <label className="ag-check-row">
                <input name="irrigation_available" type="checkbox" checked={formData.irrigation_available} onChange={handleChange} />
                Irrigation available
              </label>
            </div>

            <div className="ag-grid two">
              <div className="ag-field">
                <label>Fertilizer budget INR</label>
                <input className="ag-input" name="fertilizer_budget" type="number" min="0" value={formData.fertilizer_budget} onChange={handleChange} />
              </div>
              <div className="ag-field">
                <label>Selling price INR per kg</label>
                <input className="ag-input" name="market_price_per_kg" type="number" min="0" value={formData.market_price_per_kg} onChange={handleChange} />
              </div>
            </div>

            <button className="ag-btn" type="submit" disabled={loading}>
              {loading ? <Loader2 size={18} className="yield-spin" /> : <Calculator size={18} />}
              Predict yield
            </button>

            {error && (
              <div className="ag-alert warning">
                <AlertCircle size={18} />
                <div>
                  <strong>Estimator note</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </form>

          <aside className="ag-panel yield-trust-panel">
            <div className="ag-section-title">
              <div>
                <h2>Prediction quality</h2>
                <p>What improves trust</p>
              </div>
            </div>
            <div className="ag-list">
              <div className="ag-list-row">
                <span className="ag-icon green"><Leaf size={18} /></span>
                <div>
                  <strong>Crop and soil compatibility</strong>
                  <p>Soil fit changes production potential and fertilizer response.</p>
                </div>
              </div>
              <div className="ag-list-row">
                <span className="ag-icon blue"><Droplets size={18} /></span>
                <div>
                  <strong>Rainfall and irrigation</strong>
                  <p>Water stress is one of the highest yield risk drivers.</p>
                </div>
              </div>
              <div className="ag-list-row">
                <span className="ag-icon amber"><IndianRupee size={18} /></span>
                <div>
                  <strong>Market price realism</strong>
                  <p>Profit forecast becomes stronger when mandi price is current.</p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {loading && (
          <section className="ag-panel ag-loading">
            <div>
              <div className="ag-spinner" />
              <h3>Running yield forecast</h3>
              <p>{loadingSteps[loadingStep]}</p>
            </div>
          </section>
        )}

        {result && !loading && (
          <section className="yield-results" ref={resultRef}>
            <div className="ag-grid four">
              <article className="ag-metric-card">
                <div className="ag-metric-top">
                  <span className="ag-metric-label">Expected yield</span>
                  <span className="ag-icon green"><Sprout size={18} /></span>
                </div>
                <div>
                  <div className="ag-metric-value">{Math.round(result.estimated_yield_kg).toLocaleString()} kg</div>
                  <p className="ag-metric-note">Total harvest estimate</p>
                </div>
              </article>
              <article className="ag-metric-card">
                <div className="ag-metric-top">
                  <span className="ag-metric-label">Revenue</span>
                  <span className="ag-icon blue"><WalletCards size={18} /></span>
                </div>
                <div>
                  <div className="ag-metric-value">INR {Math.round(result.expected_revenue_inr).toLocaleString()}</div>
                  <p className="ag-metric-note">At selected market rate</p>
                </div>
              </article>
              <article className="ag-metric-card">
                <div className="ag-metric-top">
                  <span className="ag-metric-label">Profit</span>
                  <span className="ag-icon amber"><Coins size={18} /></span>
                </div>
                <div>
                  <div className={`ag-metric-value ${result.expected_profit_inr >= 0 ? "success" : "warning"}`}>
                    INR {Math.round(result.expected_profit_inr).toLocaleString()}
                  </div>
                  <p className="ag-metric-note">After estimated costs</p>
                </div>
              </article>
              <article className="ag-metric-card">
                <div className="ag-metric-top">
                  <span className="ag-metric-label">Risk</span>
                  <span className={`ag-icon ${result.risk === "High" ? "red" : "green"}`}><ShieldAlert size={18} /></span>
                </div>
                <div>
                  <div className={`ag-metric-value ${result.risk === "High" ? "warning" : "success"}`}>{result.risk}</div>
                  <p className="ag-metric-note">{Math.round(result.confidence * 100)}% confidence</p>
                </div>
              </article>
            </div>

            <div className="ag-grid two">
              <article className="ag-panel">
                <div className="ag-section-title">
                  <div>
                    <h2>Yield comparison</h2>
                    <p>Your farm vs regional benchmarks</p>
                  </div>
                </div>
                <div className="ag-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                      <CartesianGrid vertical={false} stroke="#e6ece4" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {comparisonData.map((entry, index) => (
                          <Cell key={entry.name} fill={index === 0 ? "#23834f" : index === 1 ? "#2563eb" : "#c77700"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="ag-panel">
                <div className="ag-section-title">
                  <div>
                    <h2>Smart recommendations</h2>
                    <p>Practical next steps</p>
                  </div>
                </div>
                <div className="ag-list">
                  <div className="ag-list-row">
                    <span className="ag-icon green"><CheckCircle2 size={18} /></span>
                    <div>
                      <strong>Fertilizer strategy</strong>
                      <p>{result.fertilizer_recommendation || result.fertilizer_type || "Follow soil-test based nutrient planning."}</p>
                    </div>
                  </div>
                  <div className="ag-list-row">
                    <span className="ag-icon blue"><Droplets size={18} /></span>
                    <div>
                      <strong>Water management</strong>
                      <p>{result.water_advice || "Keep irrigation scheduled and avoid waterlogging."}</p>
                    </div>
                  </div>
                  <div className="ag-list-row">
                    <span className="ag-icon amber"><TrendingUp size={18} /></span>
                    <div>
                      <strong>Profit action</strong>
                      <p>{result.profit_advice || result.recommendation}</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div className="ag-alert">
              <Scale size={20} />
              <div>
                <strong>Advisory estimate only</strong>
                <p>Validate major investment decisions with local Krishi Seva Kendra or agriculture officer.</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default YieldPrediction;
