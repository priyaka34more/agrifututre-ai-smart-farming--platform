import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Code, Heart, Users } from "lucide-react";
import MobileLayout from "../components/MobileLayout";
import logo from "../icon/logo.png";
import "./About.css";

const About = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="about-page">
        <div className="about-header">
          <button 
            className="back-button" 
            onClick={() => navigate(-1)}
            type="button"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="about-title">About AgriFuture</h1>
          <div style={{ width: 24 }}></div>
        </div>

        <div className="about-content">
          <section className="about-app-card">
            <div className="app-logo-wrapper">
              <img src={logo} alt="AgriFuture AI" className="app-logo" />
            </div>
            <h2 className="app-name">AgriFuture AI</h2>
            <p className="app-version">Version 1.0.0</p>
          </section>

          <section className="about-description-card">
            <h3 className="about-section-title">About the App</h3>
            <p className="about-text">
              AgriFuture AI is a comprehensive agricultural intelligence platform designed to empower Indian farmers with cutting-edge technology and data-driven insights.
            </p>
            <p className="about-text">
              Our mission is to help farmers make better decisions through AI-powered disease detection, crop recommendations, market analysis, and weather forecasting.
            </p>
          </section>

          <section className="about-features-card">
            <h3 className="about-section-title">Key Features</h3>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🌾</span>
                <span className="feature-text">Crop Disease Detection</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span className="feature-text">Market Price Analysis</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌤️</span>
                <span className="feature-text">Weather Forecasting</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span className="feature-text">Yield Prediction</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💰</span>
                <span className="feature-text">Government Schemes</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤖</span>
                <span className="feature-text">AI Assistant</span>
              </div>
            </div>
          </section>

          <section className="about-info-card">
            <div className="info-item">
              <Heart size={20} color="#1B7F4A" />
              <div>
                <div className="info-label">Made with Care</div>
                <div className="info-value">For Indian Farmers</div>
              </div>
            </div>
            <div className="info-item">
              <Code size={20} color="#1B7F4A" />
              <div>
                <div className="info-label">Technology</div>
                <div className="info-value">AI & Machine Learning</div>
              </div>
            </div>
            <div className="info-item">
              <Users size={20} color="#1B7F4A" />
              <div>
                <div className="info-label">Community</div>
                <div className="info-value">Farmers Worldwide</div>
              </div>
            </div>
          </section>

          <section className="about-footer-card">
            <p className="about-footer-text">
              © 2024 AgriFuture AI. All rights reserved.
            </p>
            <p className="about-footer-text">
              Empowering farmers with technology and innovation.
            </p>
          </section>
        </div>
      </div>
    </MobileLayout>
  );
};

export default About;
