import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, ArrowLeft, BadgeCheck, Building2, CloudRain, Leaf, Pill, ShieldCheck, Sprout } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import useTranslation from "../hooks/useTranslation";
import localize from "../utils/localize";
import "./DiseaseResult.css";

const FALLBACK_STEPS = ["Checking leaf photo", "Looking for disease", "Finding best advice", "Preparing result"];
const toNumber = (value) => { const n = typeof value === "string" ? parseFloat(value) : Number(value); return Number.isNaN(n) ? 0 : n; };

export default function DiseaseResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);

  const { t } = useTranslation();
  const lang = location.state?.lang || language;
  const loading = Boolean(location.state?.loading);
  const result = location.state?.result;
  const error = location.state?.error;
  const imagePreview = location.state?.imagePreview;
  const steps = location.state?.steps || FALLBACK_STEPS;

  const localizedResult = result ? localize(result, lang) : null;

  const text = useMemo(
    () => ({
      gov: t("disease.gov", "AgriFuture Crop Scan"),
      analyzing: t("disease.analyzing", "Scanning leaf photo"),
      failed: t("disease.failed", "AI Processing Failed"),
      noResult: t("disease.noResult", "No scan result found"),
      retry: t("disease.retry", "Try again"),
      gotoScanner: t("disease.gotoScanner", "Go to scanner"),
      uploadAgain: t("disease.uploadAgain", "Please upload a crop image and run scan again."),
      scanAgain: t("disease.scanAgain", "Scan again"),
      verified: t("disease.verified", "Government Verified"),
      crop: t("disease.crop", "Crop"),
      confidence: t("disease.confidence", "Confidence"),
      problem: t("disease.problem", "Problem"),
      medicine: t("disease.medicine", "Medicine"),
      dosage: t("disease.dosage", "Dosage"),
      soil: t("disease.soil", "Soil condition"),
      weather: t("disease.weather", "Weather impact"),
      root: t("disease.root", "Root health"),
      prevention: t("disease.prevention", "Prevention"),
      tips: t("disease.tips", "Farmer Tips"),
      serverError: t("disease.serverError", "Server is not reachable. Please try again."),
      endpointError: t("disease.endpointError", "Prediction service endpoint not found."),
      detectionError: t("disease.detectionError", "Disease detection failed. Please scan again with a clear image.")
    }),
    [t]
  );

  const localizedError = useMemo(() => {
    if (!error) return "";
    const raw = String(error);
    const normalized = raw.toLowerCase();

    if (normalized.includes("not found")) return text.endpointError;
    if (normalized.includes("disease detection failed")) return text.detectionError;
    if (normalized.includes("network error") || normalized.includes("failed to fetch") || normalized.includes("server not responding")) {
      return text.serverError;
    }
    return raw;
  }, [error, text]);

  useEffect(() => {
    if (!loading) return undefined;
    const timer = setInterval(() => setStepIndex((p) => (p + 1 < steps.length ? p + 1 : p)), 750);
    return () => clearInterval(timer);
  }, [loading, steps.length]);

  const confidence = useMemo(() => toNumber(result?.confidence), [result]);
  const confidenceWidth = Math.max(0, Math.min(100, confidence)) + "%";

  if (loading) {
    return (
      <div className="processing-screen">
        <div className="scan-frame">
          {imagePreview ? <img src={imagePreview} alt="Processing crop" /> : <Leaf size={90} />}
          <div className="scan-line" />
        </div>
        <p className="gov-tag"><Building2 size={14} /> {text.gov}</p>
        <h2>{text.analyzing}</h2>
        <p className="step-line">{steps[Math.min(stepIndex, steps.length - 1)]}</p>
        <div className="step-list">{steps.map((step, index) => <div key={step} className={index <= stepIndex ? "step active" : "step"}>{step}</div>)}</div>
      </div>
    );
  }

  if (error) {
    return <div className="empty-state"><AlertTriangle size={44} /><h2>{text.failed}</h2><p>{localizedError}</p><button onClick={() => navigate("/disease")}>{text.retry}</button></div>;
  }

  if (!result) {
    return <div className="empty-state"><AlertTriangle size={44} /><h2>{text.noResult}</h2><p>{text.uploadAgain}</p><button onClick={() => navigate("/disease")} >{text.gotoScanner}</button></div>;
  }

  return (
    <div className="result-page">
      <div className="result-topbar">
        <button onClick={() => navigate("/disease")}><ArrowLeft size={16} /> {text.scanAgain}</button>
        <span><ShieldCheck size={14} /> {text.verified}</span>
      </div>
      <section className="result-hero">
        {imagePreview ? <img src={imagePreview} alt="Scanned crop" /> : <Leaf size={64} />}
        <div>
          <h1>{localizedResult?.disease || result?.disease}</h1>
          <p className="crop-line">{text.crop}: {localizedResult?.crop || result?.crop}</p>
          <p className="urgency">{localizedResult?.urgency || result?.urgency}</p>
          <div className="confidence">
            <span>{text.confidence} {confidence.toFixed(2)}%</span>
            <div className="bar"><div style={{ width: confidenceWidth }} /></div>
          </div>
        </div>
      </section>
      <section className="fact-grid">
        <article><Activity size={18} /><h3>{text.problem}</h3><p>{localizedResult?.problem || result.problem}</p></article>
        <article><Pill size={18} /><h3>{text.medicine}</h3><p>{localizedResult?.medicine || result.medicine}</p></article>
        <article><BadgeCheck size={18} /><h3>{text.dosage}</h3><p>{localizedResult?.dosage || result.dosage}</p></article>
        <article><Sprout size={18} /><h3>{text.soil}</h3><p>{localizedResult?.soil_condition || result.soil_condition}</p></article>
        <article><CloudRain size={18} /><h3>{text.weather}</h3><p>{localizedResult?.weather_effect || result.weather_effect}</p></article>
        <article><Leaf size={18} /><h3>{text.root}</h3><p>{localizedResult?.root_health || result.root_health}</p></article>
      </section>
      <section className="detail-block"><h3>{text.prevention}</h3><p>{localizedResult?.prevention || result.prevention}</p></section>
      <section className="detail-block"><h3>{text.tips}</h3><p>{localizedResult?.farmer_tip || result.farmer_tip}</p></section>
    </div>
  );
}
