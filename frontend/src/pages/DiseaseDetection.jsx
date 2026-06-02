import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Camera, Leaf, Upload } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import useTranslation from "../hooks/useTranslation";
import "./DiseaseDetection.css";
import { detectDisease } from "../services/diseaseService";

const asPercent = (value) => {
  const numeric = typeof value === "string" ? parseFloat(value) : Number(value);
  if (Number.isNaN(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
};

const MIN_SCAN_PROCESSING_MS = 3500;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitForMinimumScanTime = (startedAt) => {
  const remaining = MIN_SCAN_PROCESSING_MS - (Date.now() - startedAt);
  return remaining > 0 ? delay(remaining) : Promise.resolve();
};

export default function DiseaseDetection() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const { t } = useTranslation();
  const text = {
    steps: [
      t("disease.steps.validate", "Checking leaf photo"),
      t("disease.steps.classify", "Looking for disease"),
      t("disease.steps.match", "Finding best advice"),
      t("disease.steps.prepare", "Preparing result")
    ],
    gov: t("disease.gov", "AgriFuture Crop Scan"),
    title: t("disease.title", "Crop Disease Scan"),
    sub: t("disease.sub", "Upload a leaf photo to check crop disease."),
    verified: t("disease.verified", "GOV VERIFIED"),
    imageReady: t("disease.imageReady", "Image ready for AI scan"),
    uploadPrompt: t("disease.uploadPrompt", "Upload crop image"),
    camera: t("disease.camera", "Camera"),
    gallery: t("disease.gallery", "Gallery"),
    start: t("disease.start", "Start Scan"),
    starting: t("disease.starting", "Scanning..."),
    unknownDisease: t("disease.unknownDisease", "Unknown Disease"),
    unknownCrop: t("disease.unknownCrop", "Unknown Crop"),
    high: t("disease.high", "High Priority"),
    moderate: t("disease.moderate", "Moderate Priority")
  };

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const disabled = useMemo(() => !selectedImage || isSubmitting, [selectedImage, isSubmitting]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedImage(file);
    setPreviewUrl(url);
  };

  const mapResultPayload = (data) => ({
    disease: data?.disease || text.unknownDisease,
    confidence: asPercent(data?.confidence),
    crop: data?.crop || data?.advisory?.crop || text.unknownCrop,
    urgency: data?.urgency || (data?.confidence_level === "high" ? text.high : text.moderate),
    image_quality: data?.image_quality || "good",
    problem: data?.problem || "-",
    medicine: data?.medicine || "-",
    dosage: data?.dosage || "-",
    prevention: data?.prevention || "-",
    soil_condition: data?.soil_condition || "-",
    weather_effect: data?.weather_effect || "-",
    root_health: data?.root_condition || "-",
    farmer_tip: data?.farmer_tip || "-",
    source: data?.source || "pytorch",
    timestamp: data?.timestamp || new Date().toISOString()
  });

  const handleScan = async () => {
    if (!selectedImage) return;
    const scanStartedAt = Date.now();
    setIsSubmitting(true);

    navigate("/disease-result", {
      replace: true,
      state: { loading: true, imagePreview: previewUrl, steps: text.steps, lang: language }
    });

    try {
      const data = await detectDisease(selectedImage, language);
      await waitForMinimumScanTime(scanStartedAt);
      if (!data || data?.status === "error") throw new Error(data?.message || "Prediction failed");

      navigate("/disease-result", {
        replace: true,
        state: { loading: false, imagePreview: previewUrl, result: mapResultPayload(data), lang: language }
      });
    } catch (error) {
      await waitForMinimumScanTime(scanStartedAt);
      navigate("/disease-result", {
        replace: true,
        state: { loading: false, imagePreview: previewUrl, error: error?.message || "Unable to process image", lang: language }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="disease-page">
      <header className="disease-header">
        <div>
          <p className="gov-line"><Building2 size={14} /> {text.gov}</p>
          <h1>{text.title}</h1>
          <p className="subtitle">{text.sub}</p>
        </div>
        
      </header>

      <section className="upload-panel">
        <div className="image-preview-container">
          {previewUrl ? (
            <div className="preview-wrapper">
              <img src={previewUrl} alt="Selected crop" className="preview-image" />
              <div className="preview-overlay">{text.imageReady}</div>
            </div>
          ) : (
            <div className="upload-placeholder">
              <Leaf size={64} />
              <p>{text.uploadPrompt}</p>
            </div>
          )}
        </div>
        <div className="upload-actions">
          <label className="file-btn primary-upload"><Camera size={18} /> {text.camera}<input hidden type="file" accept="image/*" capture="environment" onChange={handleImageUpload} /></label>
          <label className="file-btn secondary-upload"><Upload size={18} /> {text.gallery}<input hidden type="file" accept="image/*" onChange={handleImageUpload} /></label>
        </div>
        <button type="button" className="scan-btn" disabled={disabled} onClick={handleScan}>{isSubmitting ? text.starting : text.start}</button>
      </section>
    </div>
  );
}
