import React, { useState, useEffect, useRef } from "react";
import "./FloatingChat.css";

// 🌐 Language
import { useLanguage } from "../contexts/LanguageContext";

import { MessageSquare, Mic, Send, Volume2, VolumeX, X } from "lucide-react";
import { aiApi } from "../services/apiService";

function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [unread, setUnread] = useState(1);
  const [voiceOn, setVoiceOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const { language } = useLanguage();
  const chatEndRef = useRef(null);

  const suggestions = {
    en: ["What medicine?", "When to spray?", "How to prevent?"],
    hi: ["दवाई क्या है?", "छिड़काव कब करें?", "बचाव कैसे करें?"],
    mr: ["औषध काय आहे?", "फवारणी कधी करावी?", "प्रतिबंध कसा करावा?"]
  };

  // 🟢 Welcome message (multilingual)
  useEffect(() => {
    let welcomeText = "👋 Hello farmer! Ask me anything.";

    if (language === "hi") {
      welcomeText = "👋 नमस्ते किसान! कुछ भी पूछिए।";
    } else if (language === "mr") {
      welcomeText = "👋 नमस्कार शेतकरी! काहीही विचारा.";
    }

    setChat((prev) => {
      if (prev.length <= 1) {
        return [{ sender: "bot", text: welcomeText }];
      }
      return prev;
    });
  }, [language]);

  // 🔔 Open chat event
  useEffect(() => {
    const openChatHandler = () => {
      setOpen(true);
      setUnread(0);
    };
    window.addEventListener("openChat", openChatHandler);
    return () => window.removeEventListener("openChat", openChatHandler);
  }, []);

  // 📜 Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // 🔊 Voice reply
  const speak = (text) => {
    if (!voiceOn) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    // Filter for best Indian voices if available
    const voices = window.speechSynthesis.getVoices();
    
    if (language === "hi") {
      speech.lang = "hi-IN";
      const hiVoice = voices.find(v => v.lang.includes("hi"));
      if (hiVoice) speech.voice = hiVoice;
    } else if (language === "mr") {
      speech.lang = "mr-IN";
      const mrVoice = voices.find(v => v.lang.includes("mr"));
      if (mrVoice) speech.voice = mrVoice;
    } else {
      speech.lang = "en-IN";
      const enVoice = voices.find(v => v.lang.includes("en-IN"));
      if (enVoice) speech.voice = enVoice;
    }

    speech.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(speech);
  };

  // 🎤 Voice input
  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();

    recognition.lang =
      language === "hi" ? "hi-IN" :
      language === "mr" ? "mr-IN" :
      "en-IN";

    recognition.start();

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (event) => {
      setMessage(event.results[0][0].transcript);
    };
  };

  // 📤 Send message
  const sendMessage = async (customMsg = null) => {
    const msgToSend = customMsg || message;
    if (!msgToSend.trim()) return;

    const userMsg = { sender: "user", text: msgToSend };
    setChat((prev) => [...prev, userMsg]);

    try {
      // Get last disease from localStorage for context defensively
      let disease = "unknown";
      try {
        const lastDiseaseData = localStorage.getItem("last_disease_result");
        if (lastDiseaseData) {
          const parsed = JSON.parse(lastDiseaseData);
          disease = parsed?.result?.raw_disease || parsed?.disease || "unknown";
        }
      } catch (e) {
        console.error("Error parsing disease result from localStorage:", e);
      }

      const data = await aiApi.chat(
        msgToSend,
        disease,
        language
      );

      const replyText =
        data?.reply ||
        data?.data?.reply ||
        data?.message ||
        "No response";

      const botMsg = { sender: "bot", text: replyText };
      setChat((prev) => [...prev, botMsg]);

      speak(replyText);

      if (!open) setUnread((prev) => prev + 1);

    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "⚠️ Please check internet or try again";
      setChat((prev) => [...prev, { sender: "bot", text: errorMsg }]);
      speak(errorMsg);
    }

    setMessage("");
  };

  return (
    <>
      {/* 🤖 Floating Button */}
      <div
        className="chat-button"
        onClick={() => {
          setOpen(!open);
          setUnread(0);
        }}
      >
        <MessageSquare size={28} />
        {unread > 0 && <span className="badge">{unread}</span>}
      </div>

      {/* 💬 Chat Popup */}
      {open && (
        <div className="chat-popup">

          {/* Header */}
          <div className="chat-header">
            <div className="header-info">
              <span className="bot-icon">🤖</span>
              <div className="title-area">
                <span className="title">AI Assistant</span>
                <span className="status">● Online</span>
              </div>
            </div>

            <div className="header-actions">
              <button className="action-btn" onClick={() => setVoiceOn(!voiceOn)}>
                {voiceOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button className="action-btn close" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="chat-body">
            {chat.map((msg, i) => (
              <div key={i} className={`msg ${msg.sender}`}>
                <div className="msg-bubble">{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          {/* Suggested Questions */}
          <div className="suggestions-area">
            {suggestions[language]?.map((s, i) => (
              <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="chat-footer">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={language === "hi" ? "पूछिए..." : language === "mr" ? "विचारा..." : "Ask..."}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />

            <button 
              className={`mic-btn ${isRecording ? 'recording' : ''}`} 
              onClick={startVoice}
            >
              <Mic size={20} />
            </button>
            <button className="send-btn" onClick={() => sendMessage()} disabled={!message.trim()}>
              <Send size={20} />
            </button>
          </div>

        </div>
      )}
    </>
  );
}

export default FloatingChat;