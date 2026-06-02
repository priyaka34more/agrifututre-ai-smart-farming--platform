import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Star, Send } from "lucide-react";
import MobileLayout from "../components/MobileLayout";
import "./Feedback.css";

const Feedback = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    // Here you would send the feedback to your backend
    console.log("Feedback submitted:", { rating, feedbackText });
    setSubmitted(true);
    setTimeout(() => {
      navigate(-1);
    }, 2000);
  };

  if (submitted) {
    return (
      <MobileLayout>
        <div className="feedback-page">
          <div className="feedback-success-container">
            <div className="success-icon">
              <Star size={48} color="#1B7F4A" fill="#1B7F4A" />
            </div>
            <h2>Thank You!</h2>
            <p>Your feedback has been received and will help us improve AgriFuture AI.</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="feedback-page">
        <div className="feedback-header">
          <button 
            className="back-button" 
            onClick={() => navigate(-1)}
            type="button"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="feedback-title">Send Feedback</h1>
          <div style={{ width: 24 }}></div>
        </div>

        <div className="feedback-content">
          <section className="feedback-form-card">
            <h3 className="feedback-section-title">How would you rate AgriFuture AI?</h3>
            
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="star-button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  type="button"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    size={32}
                    color={(hoverRating || rating) >= star ? "#FFB800" : "#E5E7EB"}
                    fill={(hoverRating || rating) >= star ? "#FFB800" : "none"}
                  />
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="feedback-text" className="form-label">
                  Tell us your feedback
                </label>
                <textarea
                  id="feedback-text"
                  className="feedback-textarea"
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows="6"
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit-feedback"
              >
                <Send size={16} />
                Submit Feedback
              </button>
            </form>
          </section>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Feedback;
