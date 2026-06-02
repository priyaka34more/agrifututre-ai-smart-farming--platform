import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Phone, Languages, ChevronDown } from "lucide-react";
import { authApi } from "../services/apiService";
// Google sign-in removed from login page
import { API_BASE_URL } from "../apiConfig";
import { useLanguage } from "../contexts/LanguageContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const selectedLanguageLabel =
    language === 'en'
      ? 'EN'
      : availableLanguages.find((langOption) => langOption.code === language)?.name || language.toUpperCase();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  

  useEffect(() => {
    console.log("Current Language:", language);
  }, [language]);

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const payload = { mobile: identifier, password };
      const data = await authApi.login(payload);
      const authPayload = data?.data || data;
      const user = authPayload.user || authPayload.userData || {
        full_name: authPayload?.user?.full_name || authPayload?.full_name || "Farmer",
        mobile: authPayload?.mobile || identifier,
        role: authPayload?.role
      };
      localStorage.setItem("token", authPayload.access_token || "");
      localStorage.setItem("role", authPayload.role || "");
      localStorage.setItem("userName", user.full_name || "Farmer");
      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("mobile", identifier);
      setSuccess("Login Successful ✅");
      if (authPayload.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      let errorMsg = "Login failed. Please check your credentials.";
      if (!err.response) {
        if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
          errorMsg = "⌛ Connection timed out. Please check your internet connectivity and try again.";
        } else {
          errorMsg = `🔌 Connection failed. The AgriFuture server at ${API_BASE_URL} appears to be offline or unreachable.`;
        }
      } else if (err.response.status === 401 || err.response.status === 403) {
        errorMsg = "❌ Invalid credentials. Please verify your email/mobile and password.";
      } else if (err.response.status >= 500) {
        errorMsg = `🔥 Internal Server Error (${err.response.status}). Please contact AgriFuture system support.`;
      } else {
        errorMsg = err.response.data?.detail || err.response.data?.message || err.message || errorMsg;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="login-page">
      {/* HEADER - App Bar Style */}
      <header className="login-app-header">
        <div className="login-header-left">
          <div className="login-header-logo">🌱</div>
          <div className="login-header-text">
            <div className="login-header-name">AgriFuture AI</div>
            <div className="login-header-subtitle">Smart Farming Platform</div>
          </div>
        </div>
        <div className="login-header-right">
          <div className="login-lang-selector">
            <button 
              className="login-lang-btn"
              onClick={() => setShowLangMenu(!showLangMenu)}
            >
              <Languages size={20} />
              <span>{selectedLanguageLabel}</span>
              <ChevronDown size={16} />
            </button>
            {showLangMenu && (
              <div className="login-lang-menu">
                {Array.isArray(availableLanguages) && availableLanguages.map((langOption) => (
                  <button
                    key={langOption.code}
                    className={`login-lang-option ${language === langOption.code ? "active" : ""}`}
                    onClick={() => {
                      console.log("Selected Language:", langOption.code);
                      setLanguage(langOption.code);
                      setShowLangMenu(false);
                    }}
                  >
                    {langOption.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="login-main-content">
        <div className="login-content-card">
          {/* Welcome Section */}
          <div className="login-welcome-section">
            <h1 className="login-welcome-title">{t('login.welcomeTitle', "Let's Grow Together")}</h1>
            <p className="login-welcome-subtitle">{t('login.welcomeSubtitle', 'Our Farm, Our Future.')}</p>
          </div>

          {/* Form Container */}
          <div className="login-form-wrapper">
{/* Mobile Number Input */}
          <div className="login-input-wrapper">
            <label htmlFor="mobile-number" className="login-input-label">
              {t('login.mobileNumber', 'Mobile Number')}
            </label>
            <div className="login-input-box">
              <Phone size={20} className="login-input-icon" />
              <input
                id="mobile-number"
                className="login-input-field"
                type="tel"
                placeholder={t('login.mobilePlaceholder', '+91 Enter Mobile Number')}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

            {/* Password Input */}
            <div className="login-input-wrapper">
              <label htmlFor="password" className="login-input-label">
                {t('login.password', 'Password')}
              </label>
              <div className="login-input-box">
                <Lock size={20} className="login-input-icon" />
                <input
                  id="password"
                  className="login-input-field"
                  type="password"
                  placeholder={t('login.passwordPlaceholder', 'Enter Password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <div className="login-forgot-link-container">
                <button type="button" className="login-forgot-link" onClick={() => navigate("/forgot-password")}>
                  {t('login.forgotPassword', 'Forgot Password?')}
                </button>
              </div>
            </div>

            {/* Error/Success Alerts */}
            {error && (
              <div className="login-alert login-alert-error">
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="login-alert login-alert-success">
                <span>{success}</span>
              </div>
            )}

            {/* Login Button */}
            <div className="login-farming-identity">
              🌾 Crop Health • Weather • Market Prices
            </div>
            
            <button
              type="button"
              className="login-btn-primary"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? t('login.continuing', 'Continuing...') : t('login.continue', 'Continue')}
            </button>

            {/* Divider */}
            <div className="login-divider">
              <span className="login-divider-line" />
              <span className="login-divider-text">{t('login.or', 'OR')}</span>
              <span className="login-divider-line" />
            </div>
            
          </div>

          {/* Register Link */}
          <div className="login-register-section">
            <span className="login-register-text">{t('login.newToAgriFuture', 'New to AgriFuture?')}</span>
            <button 
              type="button" 
              className="login-register-btn" 
              onClick={() => navigate("/register")}
            >
              {t('login.createAccount', 'Create Account')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
export default Login;

