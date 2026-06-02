import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HelpCircle,
  ChevronLeft,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Copy,
  Send,
} from "lucide-react";
import MobileLayout from "../components/MobileLayout";
import "./HelpSupport.css";

const EMAIL_SUPPORT = "connect.agrifutureai@gmail.com";

const HelpSupport = () => {
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(EMAIL_SUPPORT);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSendEmail = () => {
    window.location.href = `mailto:${EMAIL_SUPPORT}?subject=AgriFuture Support Request`;
  };

  const supportOptions = [
    {
      icon: Phone,
      title: "Call Support",
      subtitle: "1800-123-4567 (Toll Free)",
      bg: "#E6F4EC",
    },
    {
      icon: Mail,
      title: "Email Support",
      subtitle: EMAIL_SUPPORT,
      bg: "#E6F0FF",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      subtitle: "Available 9 AM - 6 PM",
      bg: "#FFF0E6",
    },
    {
      icon: FileText,
      title: "FAQ & Guides",
      subtitle: "Browse help articles",
      bg: "#F0E6FF",
    },
  ];
  return (
    <MobileLayout>
      <div className="help-support-page">
        <div className="help-support-header">
          <button 
            className="back-button" 
            onClick={() => navigate(-1)}
            type="button"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="help-support-title">Help & Support</h1>
          <div style={{ width: 24 }}></div>
        </div>

        <div className="help-support-content">
          <section className="help-support-section">
            <h2 className="section-title">Contact Us</h2>
            <div className="support-options-list">
              {supportOptions.map((item, idx) => (
                <div key={idx} className="support-option-item">
                  <div
                    className="support-option-icon"
                    style={{ backgroundColor: item.bg }}
                  >
                    <item.icon size={20} color="#1B7F4A" />
                  </div>
                  <div className="support-option-text">
                    <strong className="option-title">{item.title}</strong>
                    <span className="option-subtitle">{item.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="email-support-card">
            <div className="email-support-icon-wrapper">
              <Mail size={24} color="#1B7F4A" />
            </div>
            <h3 className="email-support-title">Email Support</h3>
            <p className="email-support-description">
              Need help? Contact the AgriFuture AI team for support, feedback, bug reports, or feature suggestions.
            </p>
            <div className="email-display-box">
              <div className="email-address">{EMAIL_SUPPORT}</div>
            </div>
            <div className="email-button-group">
              <button
                className="btn-copy-email"
                onClick={handleCopyEmail}
                type="button"
                aria-label="Copy email address"
              >
                <Copy size={16} />
                {copySuccess ? "Copied!" : "Copy Email"}
              </button>
              <button
                className="btn-send-email"
                onClick={handleSendEmail}
                type="button"
                aria-label="Send email"
              >
                <Send size={16} />
                Send Email
              </button>
            </div>
          </section>

          <section className="support-message-card">
            <div className="support-message-header">
              <HelpCircle size={20} color="#1B7F4A" />
              <h3>We're Here to Help</h3>
            </div>
            <p className="support-message-text">
              We are here to help farmers get the best experience from AgriFuture AI.
            </p>
            <p className="support-message-text">
              For any questions, technical issues, or suggestions, please contact us at:
            </p>
            <a href={`mailto:${EMAIL_SUPPORT}`} className="support-email-link">
              {EMAIL_SUPPORT}
            </a>
          </section>
        </div>
      </div>
    </MobileLayout>
  );
};
export default HelpSupport;