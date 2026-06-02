import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Copy, Send, Mail } from "lucide-react";
import MobileLayout from "../components/MobileLayout";
import "./HelpSupport.css";

const EMAIL_SUPPORT = "connect.agrifutureai@gmail.com";

const ContactSupport = () => {
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
          <h1 className="help-support-title">Contact Support</h1>
          <div style={{ width: 24 }}></div>
        </div>

        <div className="help-support-content">
          <section className="email-support-card">
            <div className="email-support-icon-wrapper">
              <Mail size={24} color="#1B7F4A" />
            </div>
            <h3 className="email-support-title">Email Support</h3>
            <p className="email-support-description">
              Reach out to us via email for any questions or support needs.
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
            <p className="support-message-text">
              Our support team is ready to assist you with any questions or issues you may encounter while using AgriFuture AI.
            </p>
            <p className="support-message-text">
              Expected response time: Within 24 hours
            </p>
          </section>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ContactSupport;
