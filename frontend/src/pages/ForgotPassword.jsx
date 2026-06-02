import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Lock } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import "./ForgotPassword.css";
function ForgotPassword() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState(null);

  useEffect(() => {
    console.log("Current Language:", language);
  }, [language]);

  const validateMobile = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length === 10;
  };
  const handleSendOtp = () => {
    if (!validateMobile(mobile)) {
      setError("Invalid Mobile Number");
      setSuccess("");
      return;
    }
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;
    setLoading(true);
    setError("");
    setSuccess("");
    setGeneratedOtp(newOtp);
    setOtpExpiry(expiry);
    console.log("Generated OTP:", newOtp);
    setTimeout(() => {
      setLoading(false);
      setSuccess(t('forgot.otpSentSuccess', 'OTP sent successfully. Enter the 6-digit code.'));
      setStep(2);
    }, 250);
  };
  const handleVerifyOtp = () => {
    if (!/^[0-9]{6}$/.test(otp)) {
      setError("Invalid OTP");
      setSuccess("");
      return;
    }
    if (!generatedOtp || !otpExpiry || Date.now() > otpExpiry) {
      setError("OTP Expired");
      setSuccess("");
      return;
    }
    if (otp !== generatedOtp) {
      setError("Invalid OTP");
      setSuccess("");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    setTimeout(() => {
      setLoading(false);
      setSuccess(t('forgot.otpVerifiedSuccess', 'OTP verified successfully. Create a new password.'));
      setStep(3);
    }, 250);
  };
  const handleResetPassword = () => {
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      setSuccess("");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords Do Not Match");
      setSuccess("");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    setTimeout(() => {
      setLoading(false);
      setSuccess(t('forgot.passwordUpdatedSuccess', 'Your password has been updated successfully.'));
      setStep(4);
    }, 250);
  };
  const renderStepContent = () => {
    if (step === 1) {
      return (
        <>
          <p className="forgot-subtitle">{t('forgot.step1', 'Enter your registered mobile number to receive an OTP.')}</p>
          <div className="forgot-input-wrapper">
            <label htmlFor="forgot-mobile" className="forgot-input-label">
              {t('forgot.mobileNumber', 'Mobile Number')}
            </label>
            <div className="forgot-input-box">
              <Phone size={20} className="forgot-input-icon" />
              <span className="forgot-prefix">+91</span>
              <input
                id="forgot-mobile"
                className="forgot-input-field"
                type="tel"
                inputMode="numeric"
                placeholder={t('forgot.mobilePlaceholder', 'Enter Mobile Number')}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength={14}
              />
            </div>
            <button
              type="button"
              className="forgot-primary-button"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? t('forgot.sendingOtp', 'Sending OTP...') : t('forgot.sendOtp', 'Send OTP')}
            </button>
          </div>
        </>
      );
    }
    if (step === 2) {
      return (
        <>
          <p className="forgot-subtitle">{t('forgot.step2', 'Enter the 6-digit OTP sent to your mobile.')}</p>
          <div className="forgot-input-wrapper">
            <label htmlFor="forgot-otp" className="forgot-input-label">
              {t('forgot.otpVerification', 'OTP Verification')}
            </label>
            <div className="forgot-input-box">
              <Lock size={20} className="forgot-input-icon" />
              <input
                id="forgot-otp"
                className="forgot-input-field"
                type="text"
                inputMode="numeric"
                placeholder={t('forgot.otpPlaceholder', 'Enter 6-digit OTP')}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
              />
            </div>
            <button
              type="button"
              className="forgot-primary-button"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? t('forgot.verifyingOtp', 'Verifying...') : t('forgot.verifyOtp', 'Verify OTP')}
            </button>
            <button
              type="button"
              className="forgot-secondary-button"
              onClick={() => {
                setError("");
                setSuccess("");
                setOtp("");
                setGeneratedOtp("");
                setOtpExpiry(null);
                setStep(1);
              }}
            >
              {t('forgot.backToSendOtp', 'Back to Send OTP')}
            </button>
          </div>
        </>
      );
    }
    if (step === 3) {
      return (
        <>
          <p className="forgot-subtitle">{t('forgot.step3', 'Create a new password for your account.')}</p>
          <div className="forgot-input-wrapper">
            <label htmlFor="forgot-new-password" className="forgot-input-label">
              {t('forgot.newPassword', 'New Password')}
            </label>
            <div className="forgot-input-box">
              <Lock size={20} className="forgot-input-icon" />
              <input
                id="forgot-new-password"
                className="forgot-input-field"
                type="password"
                placeholder={t('forgot.newPasswordPlaceholder', 'Create New Password')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="forgot-input-wrapper">
            <label htmlFor="forgot-confirm-password" className="forgot-input-label">
              {t('forgot.confirmPassword', 'Confirm Password')}
            </label>
            <div className="forgot-input-box">
              <Lock size={20} className="forgot-input-icon" />
              <input
                id="forgot-confirm-password"
                className="forgot-input-field"
                type="password"
                placeholder={t('forgot.confirmPasswordPlaceholder', 'Confirm Password')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="forgot-primary-button"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? t('forgot.resettingPassword', 'Resetting...') : t('forgot.resetPassword', 'Reset Password')}
            </button>
            <button
              type="button"
              className="forgot-secondary-button"
              onClick={() => {
                setError("");
                setSuccess("");
                setStep(2);
              }}
            >
              {t('forgot.back', 'Back')}
            </button>
          </div>
        </>
      );
    }
    return (
      <>
        <p className="forgot-subtitle forgot-success-title">✓ {t('forgot.successTitle', 'Password Reset Successful')}</p>
        <p className="forgot-success-copy">{t('forgot.successCopy', 'Your password has been updated successfully.')}</p>
        <button
          type="button"
          className="forgot-primary-button"
          onClick={() => navigate("/login")}
        >
          {t('forgot.backToLogin', 'Back to Login')}
        </button>
      </>
    );
  };
  return (
    <div className="forgot-password-page">
      <header className="forgot-app-header">
        <div className="forgot-header-left">
          <div className="forgot-header-logo">🌱</div>
          <div className="forgot-header-text">
            <div className="forgot-header-name">AgriFuture AI</div>
            <div className="forgot-header-subtitle">Smart Farming Platform</div>
          </div>
        </div>
      </header>

      <main className="forgot-main-content">
        <div className="forgot-welcome-section">
          <h1 className="forgot-welcome-title">{t('forgot.welcomeTitle', "Let's Grow Together")}</h1>
          <p className="forgot-welcome-subtitle">{t('forgot.welcomeSubtitle', 'Our Farm, Our Future.')}</p>
        </div>

        <div className="forgot-password-card">
          <div className="forgot-card-header">
            <button type="button" className="forgot-back-button" onClick={() => navigate("/login")}> 
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="forgot-title">{t('forgot.title', 'Forgot Password')}</h1>
              <p className="forgot-label">{t('forgot.label', 'Reset using your registered mobile number.')}</p>
            </div>
          </div>
          {error && <div className="forgot-alert forgot-alert-error">{error}</div>}
          {success && <div className="forgot-alert forgot-alert-success">{success}</div>}

          <div className="forgot-form-wrapper">{renderStepContent()}</div>
        </div>
      </main>
    </div>
  );
}
export default ForgotPassword;
