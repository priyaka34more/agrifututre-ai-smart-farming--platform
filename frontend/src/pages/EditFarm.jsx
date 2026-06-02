import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Sprout,
  Tractor,
  Droplets,
  Languages,
  Save,
  X,
  CheckCircle,
  Camera
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import "./EditFarm.css";

const CROP_OPTIONS = ["Cotton", "Wheat", "Rice", "Soybean", "Tomato", "Potato", "Onion", "Chili"];
const SOIL_OPTIONS = ["Black Cotton", "Red Soil", "Alluvial Soil", "Laterite Soil", "Sandy Soil"];
const IRRIGATION_OPTIONS = ["Drip", "Sprinkler", "Flood", "Canal", "Well/Borewell"];

function EditFarm() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("agrifuture_farm_draft");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      name: localStorage.getItem("userName") || "",
      location: localStorage.getItem("userLocation") || "",
      mainCrop: localStorage.getItem("mainCrop") || "",
      landSize: localStorage.getItem("farmSize") || "",
      soilType: localStorage.getItem("soilType") || "",
      irrigationType: localStorage.getItem("irrigationStatus") || "",
      avatar: localStorage.getItem("userAvatar") || ""
    };
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("agrifuture_farm_draft", JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please enter farmer name";
    if (!formData.location.trim()) newErrors.location = "Please enter location";
    if (!formData.landSize.trim()) newErrors.landSize = "Please enter land size";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    localStorage.setItem("userName", formData.name);
    localStorage.setItem("userLocation", formData.location);
    localStorage.setItem("mainCrop", formData.mainCrop);
    localStorage.setItem("farmSize", formData.landSize);
    localStorage.setItem("soilType", formData.soilType);
    localStorage.setItem("irrigationStatus", formData.irrigationType);
    if (formData.avatar) {
      localStorage.setItem("userAvatar", formData.avatar);
    }
    localStorage.setItem("agrifuture_farmer_profile", JSON.stringify(formData));
    localStorage.removeItem("agrifuture_farm_draft");

    // Add history entry
    const existingHistory = JSON.parse(localStorage.getItem("agrifuture_unified_history") || "[]");
    const newHistoryEntry = {
      id: Date.now(),
      module: "profile",
      type: "update",
      title: "Farm Profile Updated",
      subtitle: `${formData.name}'s farm details changed`,
      date: Date.now(),
      icon: "user",
      color: "emerald"
    };
    const updatedHistory = [newHistoryEntry, ...existingHistory];
    localStorage.setItem("agrifuture_unified_history", JSON.stringify(updatedHistory));

    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      navigate("/profile");
    }, 1500);
  };

  const handleCancel = () => {
    localStorage.removeItem("agrifuture_farm_draft");
    navigate("/profile");
  };

  return (
    <div className="edit-farm-page">
      <div className="edit-farm-header">
        <div className="header-content">
          <button className="edit-back-btn" onClick={handleCancel}>
            <X size={22} />
          </button>
          <div className="header-text">
            <h2>Edit Farm Profile</h2>
            <p>Update your farming details</p>
          </div>
        </div>
      </div>

      <div className="edit-farm-content">
        {saveSuccess && (
          <div className="save-success-banner">
            <CheckCircle size={20} />
            <span>Profile saved successfully!</span>
          </div>
        )}

        <div className="avatar-section">
          <div className="avatar-wrapper">
            <div className="avatar-container">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Farmer" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  <User size={40} />
                </div>
              )}
              <label className="avatar-upload-btn">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div className="avatar-hint">Tap to upload profile photo</div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Personal Details</h3>

          <div className={`form-group ${errors.name ? "error" : ""}`}>
            <label className="form-label">Farmer Name *</label>
            <div className="input-wrapper">
              <User size={18} />
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter farmer name"
              />
            </div>
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          <div className={`form-group ${errors.location ? "error" : ""}`}>
            <label className="form-label">Location *</label>
            <div className="input-wrapper">
              <MapPin size={18} />
              <input
                type="text"
                className="form-input"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Village, State"
              />
            </div>
            {errors.location && <p className="error-message">{errors.location}</p>}
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Farm Details</h3>

          <div className="form-group">
            <label className="form-label">Main Crop</label>
            <div className="input-wrapper">
              <Sprout size={18} />
              <select
                className="form-select"
                value={formData.mainCrop}
                onChange={(e) => handleChange("mainCrop", e.target.value)}
              >
                <option value="">Select crop</option>
                {CROP_OPTIONS.map((crop, i) => (
                  <option key={i} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={`form-group ${errors.landSize ? "error" : ""}`}>
            <label className="form-label">Land Size *</label>
            <div className="input-wrapper">
              <Tractor size={18} />
              <input
                type="text"
                className="form-input"
                value={formData.landSize}
                onChange={(e) => handleChange("landSize", e.target.value)}
                placeholder="e.g., 2 Acres, 5 Hectares"
              />
            </div>
            {errors.landSize && <p className="error-message">{errors.landSize}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Soil Type</label>
            <div className="input-wrapper">
              <Sprout size={18} />
              <select
                className="form-select"
                value={formData.soilType}
                onChange={(e) => handleChange("soilType", e.target.value)}
              >
                <option value="">Select soil type</option>
                {SOIL_OPTIONS.map((soil, i) => (
                  <option key={i} value={soil}>{soil}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Irrigation Type</label>
            <div className="input-wrapper">
              <Droplets size={18} />
              <select
                className="form-select"
                value={formData.irrigationType}
                onChange={(e) => handleChange("irrigationType", e.target.value)}
              >
                <option value="">Select irrigation</option>
                {IRRIGATION_OPTIONS.map((irr, i) => (
                  <option key={i} value={irr}>{irr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Preferences</h3>

          <div className="form-group">
            <label className="form-label">Language</label>
            <div className="input-wrapper">
              <Languages size={18} />
              <select
                className="form-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions-sticky">
          <div className="form-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              <X size={18} />
              Cancel
            </button>
            <button
              className={`save-btn ${isSaving || saveSuccess ? "disabled" : ""}`}
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
            >
              {isSaving ? (
                <>
                  <div className="spinner-small" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle size={18} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditFarm;