import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { 
  ChevronLeft, Download, Send, MessageSquare, Info, ShieldCheck, 
  Droplets, Thermometer, Sprout, AlertCircle, FileText
} from "lucide-react";
import "./ResultPage.css";
import { aiApi } from "../services/apiService";
import { useLanguage } from "../contexts/LanguageContext";

// 🌿 Memoized Sub-components to prevent re-renders
const AdvisoryItem = React.memo(({ icon: Icon, title, content, colorClass }) => (
  <div className="info-card">
    <div className={`card-icon ${colorClass}`}><Icon size={20} /></div>
    <h4>{title}</h4>
    <p>{content}</p>
  </div>
));

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = useMemo(() => location.state?.result || {}, [location.state?.result]);
  const imagePreview = location.state?.image;
  const isOffline = location.state?.isOffline || false;
  const isUncertain = location.state?.isUncertain || false;

  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasShownWelcome = useRef(false);

  const advisory = useMemo(() => data.advice || {}, [data.advice]);
  const insights = useMemo(() => data.insights || {}, [data.insights]);
  const { t, language } = useLanguage();
  
  const disease = data.disease || t("unknownDisease", "Unknown Disease");
  const confidence = data.confidence || 0;
  const predictions = data.top_matches || data.predictions || [];
  const suggestions = data.suggestions || [];
  const isLowConfidence = location.state?.isLowConfidence || false;

  // Quick action buttons based on language
  const quickActions = useMemo(() => {
    if (language === "hi") {
      return [
        { label: "कौन सी दवा?", query: "कौन सी दवा इस्तेमाल करूं?" },
        { label: "जैविक समाधान?", query: "जैविक समाधान क्या है?" },
        { label: "कैसे रोकें?", query: "यह कैसे रोकें?" },
        { label: "खत सलाह?", query: "कौन सा खत डालें?" }
      ];
    } else if (language === "mr") {
      return [
        { label: "कोणती औषध?", query: "कोणती औषध वापरावी?" },
        { label: "सेंद्रिय उपाय?", query: "सेंद्रिय उपाय कोणते?" },
        { label: "कसे टाळावे?", query: "हे कसे टाळावे?" },
        { label: "खत सुचना?", query: "कोणते खत टाकावे?" }
      ];
    }
    return [
      { label: "What medicine?", query: "What medicine should I use?" },
      { label: "Organic solution?", query: "Is there an organic solution?" },
      { label: "How to prevent?", query: "How to prevent this?" },
      { label: "Fertilizer advice?", query: "What fertilizer should I use?" }
    ];
  }, [language]);

  // Welcome message based on disease and language
  const welcomeMessage = useMemo(() => {
    const cropName = disease.split(' ')[0];
    if (isLowConfidence) {
      if (language === "hi") {
        return "हमें फोटो स्पष्ट नहीं मिली। कृपया अच्छी रोशनी में पत्ते का करीब से फोटो लें और फिर से अपलोड करें। फिर भी मैं आपकी मदद कर सकता हूं!";
      } else if (language === "mr") {
        return "आम्हाला फोटो स्पष्ट दिसत नाही. कृपया चांगल्या प्रकाशात पानाचे जवळचे फोटो काढा आणि पुन्हा अपलोड करा. तरीही मी तुम्हाला मदत करू शकतो!";
      }
      return "The photo isn't very clear. Please take a closer photo in good lighting and try again. But I can still help you!";
    }
    
    if (language === "hi") {
      return `मैंने आपकी ${cropName} पत्ती की तस्वीर का विश्लेषण किया। आपके पौधे को ${disease} हो सकता है। क्या आप उपचार सलाह या जैविक समाधान चाहते हैं?`;
    } else if (language === "mr") {
      return `मी तुमच्या ${cropName} पानाच्या छायेचे विश्लेषण केले आहे. तुमच्या वनस्पतीला ${disease} असू शकते. तुम्हाला उपचार सलाह किंवा सेंद्रिय उपाय हवे आहेत का?`;
    }
    return `I analyzed your ${cropName} leaf image. Your plant may have ${disease}. Would you like treatment advice or organic solutions?`;
  }, [disease, language, isLowConfidence]);

  const [checklist, setChecklist] = useState({
    spray: false,
    water: false,
    check: false
  });

  const confidencePercent = useMemo(() => {
    // Handle both decimal (0.87) and percentage ("87%") formats
    if (typeof confidence === 'string' && confidence.includes('%')) {
      return confidence;
    }
    const num = typeof confidence === 'string' ? parseFloat(confidence) : confidence;
    return `${(num * 100).toFixed(1)}%`;
  }, [confidence]);

  const confidenceValue = useMemo(() => {
    // Extract numeric confidence value for calculations
    if (typeof confidence === 'string' && confidence.includes('%')) {
      return parseFloat(confidence.replace('%', '')) / 100;
    }
    const numericConfidence = typeof confidence === 'string' ? parseFloat(confidence) : confidence;
    return numericConfidence > 1 ? numericConfidence / 100 : numericConfidence;
  }, [confidence]);

  const statusColor = useMemo(() => {
    if (isUncertain || isLowConfidence) return "#f59e0b";
    if (confidenceValue > 0.85) return "#22c55e";
    if (confidenceValue > 0.7) return "#84cc16";
    if (confidenceValue > 0.5) return "#f59e0b";
    return "#ef4444";
  }, [confidenceValue, isUncertain, isLowConfidence]);

  // Auto-show welcome message when result loads
  useEffect(() => {
    hasShownWelcome.current = false;
    if (chat.length === 0) {
      setChat([{ sender: "bot", text: welcomeMessage }]);
      hasShownWelcome.current = true;
    }
  }, [chat.length, welcomeMessage]);

  const handleAsk = useCallback(async (customMsg = null) => {
    const msg = customMsg || question;
    if (!msg.trim()) return;

    setChat((prev) => [...prev, { sender: "user", text: msg }]);
    setLoading(true);

    try {
      const result = await aiApi.chat(msg, data.disease || "unknown", language);

      setChat((prev) => [...prev, { sender: "bot", text: result.reply || "No response" }]);
    } catch (err) {
      setChat((prev) => [...prev, { sender: "bot", text: `❌ ${err.userMessage || err.message || "AI server error"}` }]);
    }
    setQuestion("");
    setLoading(false);
  }, [question, data.disease, language]);

  const downloadPDF = useCallback(async () => {
    const element = document.getElementById("report-content");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 1 }); // Reduced scale to save memory
      const img = canvas.toDataURL("image/jpeg", 0.7); // Use JPEG with 0.7 quality to save memory
      const pdf = new jsPDF();
      pdf.addImage(img, "JPEG", 10, 10, 190, 0);
      pdf.save(`AgriFuture_${disease.replace(/\s+/g, "_")}.pdf`);
    } catch (e) {
      console.error("PDF Export Error:", e);
    }
  }, [disease]);

  return (
    <div className="result-container">
      {/* 🔝 Sticky Header */}
      <div className="result-header">
        <button className="icon-btn" onClick={() => navigate("/disease")}>
          <ChevronLeft size={24} />
        </button>
        <h2>Analysis Result</h2>
        {isOffline && <span className="offline-badge">Offline Data</span>}
        <button className="icon-btn" onClick={downloadPDF}>
          <Download size={24} />
        </button>
      </div>

      <div id="report-content" className="report-wrapper">
        {/* 🏆 Result Card */}
        <div className="main-card">
          <div className="result-summary">
            <span className="label">Detected Disease</span>
            <h1 className="disease-name">{disease}</h1>
            
            <div className="status-row">
              <div className="confidence-badge" style={{ backgroundColor: statusColor + "15", color: statusColor }}>
                <ShieldCheck size={18} />
                <span>{confidencePercent} Confidence</span>
              </div>
              
              <div className="risk-badge" style={{ 
                backgroundColor: data.risk === "High" ? "#fee2e2" : data.risk === "Medium" ? "#fef3c7" : "#dcfce7",
                color: data.risk === "High" ? "#991b1b" : data.risk === "Medium" ? "#92400e" : "#166534"
              }}>
                <AlertCircle size={18} />
                <span>Risk: {data.risk || insights.risk_level || "Low"}</span>
              </div>
            </div>

            {insights.explanation && (
              <p className="ai-explanation">
                🧠 <strong>AI Insight:</strong> {insights.explanation}
              </p>
            )}
          </div>

          {/* 📊 Confidence Bar */}
          <div className="confidence-section">
            <h3>Confidence Level</h3>
            <div className="confidence-bar-container">
              <div className="confidence-bar" style={{ 
                width: `${confidenceValue * 100}%`,
                backgroundColor: statusColor
              }}></div>
            </div>
            <div className="confidence-label">
              {isUncertain || isLowConfidence ? "⚠️ Low Confidence - Retake Photo" : `${confidencePercent} Match`}
            </div>
            
            {/* 🌟 Kindwise Source Information */}
            {data.source === 'kindwise' && (
              <div className="source-info">
                <div className="source-badge">
                  🌿 Powered by Kindwise AI
                </div>
                {data.severity && (
                  <div className={`severity-badge ${data.severity}`}>
                    {data.severity === 'critical' ? '🚨 Critical' : 
                     data.severity === 'high' ? '⚠️ High' : 
                     data.severity === 'moderate' ? '📊 Moderate' : '📋 Low'} Severity
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 🎯 Top 3 Predictions */}
          {predictions.length > 0 && (
            <div className="predictions-section">
              <h3>Top 3 Predictions</h3>
              <div className="predictions-list">
                {predictions.map((pred, index) => {
                  const predConfidence = typeof pred.confidence === 'string' && pred.confidence.includes('%') 
                    ? parseFloat(pred.confidence.replace('%', '')) / 100 
                    : (pred.confidence > 1 ? pred.confidence / 100 : pred.confidence);
                  return (
                    <div key={index} className={`prediction-item ${index === 0 ? 'main-prediction' : 'alternative'}`}>
                      <div className="prediction-label">
                        {index === 0 && '🎯 '}
                        {pred.label}
                      </div>
                      <div className="prediction-confidence">
                        <div className="mini-bar" style={{ 
                          width: `${predConfidence * 100}%`,
                          backgroundColor: predConfidence > 0.7 ? "#22c55e" : predConfidence > 0.5 ? "#f59e0b" : "#ef4444"
                        }}></div>
                        <span>{pred.confidence}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ⚠️ Uncertain Result Suggestions */}
          {isUncertain && suggestions.length > 0 && (
            <div className="suggestions-section">
              <h3>📸 Photo Tips for Better Results</h3>
              <ul className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="suggestion-item">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 🔥 Heatmap Display */}
          {data.heatmap && (
            <div className="heatmap-section">
              <h3>AI Detection View</h3>
              <div className="image-pair">
                <div className="img-box">
                  <span>Original</span>
                  <img src={imagePreview} alt="original" loading="lazy" />
                </div>
                <div className="img-box">
                  <span>Heatmap</span>
                  <img src={`data:image/jpeg;base64,${data.heatmap}`} alt="heatmap" loading="lazy" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 📋 Advisory Grid */}
        <div className="section-title">
          <h3>🩺 Treatment & Care (उपचार आणि काळजी)</h3>
        </div>
        <div className="info-grid">
          <AdvisoryItem 
            icon={Droplets} 
            title="💊 Medicine (औषध)" 
            content={advisory.medicine || "Consult local expert"} 
            colorClass="medicine"
          />
          <AdvisoryItem 
            icon={FileText} 
            title="📏 Dosage (प्रमाण)" 
            content={advisory.dosage || "As per instructions"} 
            colorClass="dosage"
          />
          <AdvisoryItem 
            icon={Thermometer} 
            title="☁️ Weather (हवामान)" 
            content={advisory.weather || "Monitor climate conditions"} 
            colorClass="weather"
          />
          <AdvisoryItem 
            icon={Sprout} 
            title="🌱 Fertilizer (खत)" 
            content={advisory.fertilizer || "Apply balanced fertilizer"} 
            colorClass="fertilizer"
          />
        </div>

        {/* 🌿 Kindwise-Specific Information */}
        {data.source === 'kindwise' && (
          <>
            {/* 🩺 Symptoms Section */}
            {data.symptoms && (
              <div className="symptoms-card">
                <h3>🩺 Disease Symptoms</h3>
                <p>{data.symptoms}</p>
              </div>
            )}

            {/* 💊 Treatment Details */}
            {data.treatment && (
              <div className="treatment-card">
                <h3>💊 Treatment Details</h3>
                <p>{data.treatment}</p>
              </div>
            )}

            {/* 🖼️ Similar Images */}
            {data.similar_images && data.similar_images.length > 0 && (
              <div className="similar-images-card">
                <h3>🖼️ Reference Images</h3>
                <div className="similar-images-grid">
                  {data.similar_images.slice(0, 3).map((image, index) => (
                    <div key={index} className="similar-image-item">
                      <img 
                        src={image.url || `data:image/jpeg;base64,${image}`} 
                        alt={`Reference ${index + 1}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span>Reference {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ✅ Action Checklist */}
        <div className="checklist-card">
          <h3>✔️ Action Plan (कृती आराखडा)</h3>
          <div className="checklist-items">
            <label className={`check-item ${checklist.spray ? 'done' : ''}`}>
              <input type="checkbox" checked={checklist.spray} onChange={() => setChecklist({...checklist, spray: !checklist.spray})} />
              <span>Spray recommended medicine</span>
            </label>
            <label className={`check-item ${checklist.water ? 'done' : ''}`}>
              <input type="checkbox" checked={checklist.water} onChange={() => setChecklist({...checklist, water: !checklist.water})} />
              <span>Adjust watering as advised</span>
            </label>
            <label className={`check-item ${checklist.check ? 'done' : ''}`}>
              <input type="checkbox" checked={checklist.check} onChange={() => setChecklist({...checklist, check: !checklist.check})} />
              <span>Check nearby plants for spread</span>
            </label>
          </div>
        </div>

        {/* 💡 Insights Card */}
        <div className="insights-card">
          <h3><Info size={20} /> Farmer's Insights</h3>
          <div className="insight-item">
            <strong>Root Health:</strong> <span>{insights.root_condition || "Normal"}</span>
          </div>
          <div className="insight-item">
            <strong>Soil Condition:</strong> <span>{insights.soil_condition || "Good"}</span>
          </div>
          <div className="tip-box">
            <AlertCircle size={20} />
            <p>{advisory.tips || insights.farmer_tip || "Regular monitoring is key to healthy crops."}</p>
          </div>
        </div>

        {/* 🚨 Low Confidence Message */}
        {isLowConfidence && (
          <div className="low-confidence-card">
            <h3><AlertCircle size={20} /> Image Quality Issue</h3>
            <p>{data.message || "Image not clear. Please take a closer photo of the leaf."}</p>
            <div className="confidence-tips">
              <h4>💡 Tips for Better Photos:</h4>
              <ul>
                <li>Take photo in good lighting</li>
                <li>Focus clearly on the affected area</li>
                <li>Include the whole leaf if possible</li>
                <li>Avoid blurry or dark images</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 💬 AgriBot Assistant */}
      <div className="chat-section">
        <h3><MessageSquare size={20} /> Ask AgriBot</h3>
        
        <div className="chat-history">
          {chat.map((c, i) => (
            <div key={i} className={`msg ${c.sender}`}>
              <div className="msg-bubble">{c.text}</div>
            </div>
          ))}
          {loading && <div className="typing">AgriBot is thinking...</div>}
        </div>

        {/* Quick Action Buttons */}
        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button 
              key={index} 
              className="quick-action-btn" 
              onClick={() => handleAsk(action.query)}
              disabled={loading}
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="chat-input-wrapper">
          <input 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={language === "hi" ? "कृषि समस्या पूछें..." : language === "mr" ? "शेतीच्या समस्येबद्दल विचारा..." : "Ask about crop problems..."}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button className="send-btn" onClick={() => handleAsk()} disabled={!question.trim() || loading}>
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* 🔙 Footer Actions */}
      <div className="footer-actions">
        <button className="secondary-btn" onClick={() => navigate("/disease")}>New Scan</button>
        <button className="primary-btn" onClick={() => navigate("/dashboard")}>Go Home</button>
      </div>
    </div>
  );
}

export default ResultPage;
