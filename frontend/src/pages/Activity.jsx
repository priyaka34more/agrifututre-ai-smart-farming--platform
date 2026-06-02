import React from "react";
import Navbar from "../components/Navbar";
import "./Activity.css";

function Activity() {
  return (
    <>
      <Navbar />

      <div className="activity-container">
        <h2>📜 My Activity</h2>

        <div className="activity-card">
          <p>🌿 Disease Scan: Leaf Blight detected</p>
          <p>📅 Date: 10 Oct 2025</p>
        </div>

        <div className="activity-card">
          <p>🌦️ Weather Check: High humidity alert</p>
          <p>📅 Date: 9 Oct 2025</p>
        </div>

      </div>
    </>
  );
}

export default Activity;