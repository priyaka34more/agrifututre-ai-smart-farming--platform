import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, Languages, ChevronDown } from "lucide-react";
import { authApi } from "../services/apiService";
import { API_BASE_URL } from "../apiConfig";
import { useLanguage } from "../contexts/LanguageContext";

function Register() {
  const navigate = useNavigate();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const selectedLanguageLabel =
    language === 'en'
      ? 'EN'
      : availableLanguages.find((langOption) => langOption.code === language)?.name || language.toUpperCase();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  React.useEffect(() => {
    console.log("Current Language:", language);
  }, [language]);

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (!fullName || (!email && !mobile) || !password) {
      setError("Please fill all required fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        full_name: fullName,
        email: email || null,
        mobile: mobile || null,
        password,
      };

      const data = await authApi.register(payload);

      if (data?.status === "success") {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setError(data?.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);

      let errorMsg = "Registration failed. Please try again.";
      if (!err.response) {
        if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
          errorMsg = "⌛ Connection timed out. Please check your internet connectivity and try again.";
        } else {
          errorMsg = `🔌 Connection failed. The AgriFuture server at ${API_BASE_URL} appears to be offline or unreachable.`;
        }
      } else if (err.response.status === 400) {
        errorMsg = err.response.data?.detail || err.response.data?.message || "❌ Registration failed. User may already exist.";
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
    <div style={styles.page}>
      {/* Soft blurred background circles */}
      <div style={styles.bgCircleTop} />
      <div style={styles.bgCircleBottom} />

      {/* TOP HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerLogo}>🌱</div>
          <div style={styles.headerText}>
            <div style={styles.headerName}>AgriFuture AI</div>
            <div style={styles.headerSubtitle}>Smart Farming Platform</div>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.langSelector}>
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              style={styles.langBtn}
            >
              <Languages size={20} />
              <span>{selectedLanguageLabel}</span>
              <ChevronDown size={16} />
            </button>
            {showLangMenu && (
              <div style={styles.langMenu}>
                {Array.isArray(availableLanguages) && availableLanguages.map((langOption) => (
                  <button
                    key={langOption.code}
                    onClick={() => {
                      console.log("Selected Language:", langOption.code);
                      setLanguage(langOption.code);
                      setShowLangMenu(false);
                    }}
                    style={{
                      ...styles.langOption,
                      ...(language === langOption.code ? styles.langOptionActive : {})
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
      <main style={styles.mainContent}>
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>{t('register.welcomeTitle', "Let's Grow Together")}</h1>
          <p style={styles.welcomeSubtitle}>{t('register.welcomeSubtitle', 'Create your AgriFuture account and start smart farming today.')}</p>
        </div>

        {/* CARD */}
        <div style={styles.card}>
          {success && (
            <div style={styles.successBanner}>
              {success}
            </div>
          )}

          {error && (
            <div style={styles.errorBanner}>
              {error}
            </div>
          )}

          <div style={styles.formWrapper}>
            <div style={styles.inputGroup}>
              <User size={20} style={styles.icon} />
              <input
                type="text"
                placeholder={t('register.fullName', 'Full Name')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <Phone size={20} style={styles.icon} />
              <input
                type="tel"
                placeholder={t('login.mobileNumber', 'Mobile Number')}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <Mail size={20} style={styles.icon} />
              <input
                type="email"
                placeholder={t('register.emailOptional', 'Email (Optional)')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <Lock size={20} style={styles.icon} />
              <input
                type="password"
                placeholder={t('register.createPassword', 'Create Password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                onKeyPress={(e) => e.key === "Enter" && handleRegister()}
              />
            </div>

            <div style={styles.inputGroup}>
              <Lock size={20} style={styles.icon} />
              <input
                type="password"
                placeholder={t('register.confirmPassword', 'Confirm Password')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                onKeyPress={(e) => e.key === "Enter" && handleRegister()}
              />
            </div>

            <button onClick={handleRegister} style={styles.primaryButton} disabled={loading}>
              {loading ? t('register.creatingAccount', 'Creating Account...') : t('register.createAccount', 'Create Account')}
            </button>

            <p style={styles.footerText}>
              {t('register.alreadyHaveAccount', 'Already have an account?')} <span onClick={() => navigate("/")} style={styles.linkText}>{t('register.signIn','Sign In')}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  /* PAGE LAYOUT */
  page: {
    width: "100%",
    minHeight: "100vh",
    maxWidth: "100vw",
    margin: "0 auto",
    background: "linear-gradient(180deg, #F4FAF3 0%, #E8F5E9 50%, #DDF3E0 100%)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Noto Sans', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    overflowX: "hidden",
    overflowY: "auto",
    position: "relative",
    boxSizing: "border-box",
    paddingBottom: "env(safe-area-inset-bottom, 20px)"
  },

  /* Background circles */
  bgCircleTop: {
    position: "absolute",
    top: "-100px",
    right: "-50px",
    width: "300px",
    height: "300px",
    background: "radial-gradient(circle, rgba(67, 160, 71, 0.08) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
    pointerEvents: "none"
  },

  bgCircleBottom: {
    position: "absolute",
    bottom: "-80px",
    left: "-80px",
    width: "280px",
    height: "280px",
    background: "radial-gradient(circle, rgba(27, 94, 32, 0.06) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(50px)",
    pointerEvents: "none"
  },

  /* TOP HEADER */
  header: {
    width: "100%",
    height: "90px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "linear-gradient(180deg, #1B5E20 0%, #2E7D32 100%)",
    borderRadius: "0 0 24px 24px",
    boxShadow: "0 8px 24px rgba(27, 94, 32, 0.15)",
    flexShrink: 0,
    position: "relative",
    zIndex: 20
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },

  headerLogo: {
    fontSize: "28px",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: "1px"
  },

  headerName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: "-0.2px"
  },

  headerSubtitle: {
    fontSize: "11px",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: "0.3px"
  },

  headerRight: {
    display: "flex",
    alignItems: "center"
  },

  /* Language Selector */
  langSelector: {
    position: "relative"
  },

  langBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    background: "rgba(255, 255, 255, 0.25)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#FFFFFF",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Noto Sans', inherit",
    backdropFilter: "blur(10px)"
  },

  langMenu: {
    position: "absolute",
    top: "100%",
    right: "0",
    marginTop: "6px",
    background: "rgba(255, 255, 255, 0.95)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(27, 94, 32, 0.12)",
    zIndex: 100,
    overflow: "hidden",
    minWidth: "80px",
    backdropFilter: "blur(10px)"
  },

  langOption: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    background: "transparent",
    border: "none",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#4E6E57",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Noto Sans', inherit"
  },

  langOptionActive: {
    background: "rgba(27, 94, 32, 0.1)",
    color: "#1B5E20",
    fontWeight: "700"
  },

  /* MAIN CONTENT */
  mainContent: {
    flex: 1,
    width: "100%",
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    position: "relative",
    zIndex: 5
  },

  /* Welcome Section */
  welcomeSection: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "24px"
  },

  welcomeTitle: {
    fontSize: "30px",
    fontWeight: "700",
    color: "#1B5E20",
    margin: 0,
    letterSpacing: "-0.3px",
    lineHeight: 1.2
  },

  welcomeSubtitle: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#4E6E57",
    margin: 0,
    lineHeight: 1.5
  },

  /* CARD */
  card: {
    width: "92%",
    maxWidth: "380px",
    padding: "24px",
    borderRadius: "28px",
    background: "rgba(255, 255, 255, 0.22)",
    border: "1px solid rgba(255, 255, 255, 0.35)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    boxShadow: "0 20px 60px rgba(27, 94, 32, 0.12)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    
  },

  formWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },

  inputGroup: {
    display: "flex",
    alignItems: "center",
    height: "56px",
    gap: "12px",
    padding: "0 16px",
    background: "rgba(248, 250, 252, 0.92)",
    border: "1px solid rgba(226, 232, 240, 0.9)",
    borderRadius: "16px"
  },

  icon: {
    color: "#4E6E57"
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "16px",
    color: "#1E293B",
    fontFamily: "'Noto Sans', inherit"
  },

  errorBanner: {
    backgroundColor: "rgba(244, 67, 54, 0.12)",
    border: "1px solid rgba(244, 67, 54, 0.25)",
    color: "#C41E3A",
    borderRadius: "16px",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: "500"
  },

  successBanner: {
    backgroundColor: "rgba(67, 160, 71, 0.12)",
    border: "1px solid rgba(67, 160, 71, 0.25)",
    color: "#1B5E20",
    borderRadius: "16px",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: "500"
  },

  primaryButton: {
    width: "100%",
    height: "56px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(180deg, #1B5E20 0%, #43A047 100%)",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(46, 125, 50, 0.22)",
    transition: "transform 0.2s ease, opacity 0.2s ease"
  },

  footerText: {
    marginTop: "10px",
    color: "#4E6E57",
    fontSize: "14px",
    textAlign: "center"
  },

  linkText: {
    color: "#1B5E20",
    cursor: "pointer",
    fontWeight: "700"
  }
};

export default Register;
