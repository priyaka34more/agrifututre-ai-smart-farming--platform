import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import "./Chat.css";
import { useLanguage } from "../contexts/LanguageContext";
import { aiApi } from "../services/apiService";

function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const { language } = useLanguage();
  const chatEndRef = useRef(null);

  const [error, setError] = useState("");

  // =========================
  // 🎤 VOICE INPUT FIX
  // =========================
  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;

    recognition.start();

    recognition.onresult = (event) => {
      setMessage(event.results[0][0].transcript);
    };

    recognition.onerror = (err) => {
      setError("Voice error: " + err.error);
    };
  };

  // =========================
  // 🔊 SPEAK RESPONSE
  // =========================
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = language === "hi" ? "hi-IN" : "en-IN";
    window.speechSynthesis.speak(speech);
  };

  // =========================
  // 🤖 SEND MESSAGE (axios + shared API client)
  // =========================
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    const textSent = message;
    const updated = [...chat, userMsg];

    setChat(updated);
    setMessage("");
    setLoading(true);

    try {
      console.log("💬 Sending chat message:", { message: textSent, language });
      
      const data = await aiApi.chat({
        message: textSent,
        language,
      });

      console.log("💬 Chat response:", data);

      const botText =
        data?.reply ||
        data?.data?.reply ||
        data?.message ||
        data?.response ||
        "Sorry, I couldn't process your request.";

      const botMsg = {
        sender: "bot",
        text: botText,
      };

      setChat((prev) => [...prev, botMsg]);
      speak(botText);
    } catch (err) {
      console.error("💬 Chat API error:", err);
      const errorMessage = err.message || "Failed to get AI response";
      setError(errorMessage);
      
      setChat((prev) => [
        ...prev,
        {
          sender: "bot",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="chat-container">
        <h2>AI Farming Assistant</h2>

        <div className="chat-box">
          {chat.map((msg, i) => (
            <div key={i} className={`msg ${msg.sender}`}>
              {msg.text}
            </div>
          ))}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

          {loading && <div className="msg bot">Thinking...</div>}

          <div ref={chatEndRef} />
        </div>

        <div className="chat-input">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask farming question..."
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
          />

          <button 
            type="button" 
            onClick={startVoice} 
            aria-label="Voice input"
            disabled={loading}
          >
            🎤
          </button>

          <button 
            type="button" 
            onClick={sendMessage}
            disabled={loading || !message.trim()}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </>
  );
}

export default Chat;
