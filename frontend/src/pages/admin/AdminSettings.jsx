import React from "react";
import { 
  Shield, Server, HardDrive, 
  Activity, Lock, Globe 
} from "lucide-react";
import "./AdminSettings.css";

const AdminSettings = () => {
  return (
    <div className="admin-settings">
      <div className="page-header">
        <h1>System Settings</h1>
        <p>Manage infrastructure and security preferences</p>
      </div>

      <div className="settings-container">
        <section className="settings-section">
          <div className="section-header">
            <Shield size={20} color="#22c55e" />
            <h3>Security</h3>
          </div>
          <div className="settings-list">
            <SettingItem 
              icon={<Lock size={18} />} 
              title="Admin Email" 
              value={process.env.REACT_APP_ADMIN_EMAIL || "admin@agrifuture.com"} 
              description="Primary developer email with root access"
            />
            <SettingItem 
              icon={<Shield size={18} />} 
              title="CORS Policy" 
              value="Restricted" 
              description="Allow-list enabled for production domains"
            />
          </div>
        </section>

        <section className="settings-section">
          <div className="section-header">
            <Server size={20} color="#3b82f6" />
            <h3>Infrastructure</h3>
          </div>
          <div className="settings-list">
            <SettingItem 
              icon={<Activity size={18} />} 
              title="Backend Status" 
              value="Operational" 
              status="online"
              description="FastAPI production cluster health"
            />
            <SettingItem 
              icon={<HardDrive size={18} />} 
              title="DB Storage" 
              value="12.4 GB / 50 GB" 
              description="PostgreSQL storage utilization"
            />
            <SettingItem 
              icon={<Globe size={18} />} 
              title="API Latency" 
              value="142ms" 
              description="Global average response time"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const SettingItem = ({ icon, title, value, description, status }) => (
  <div className="setting-item">
    <div className="setting-icon">{icon}</div>
    <div className="setting-info">
      <div className="setting-title-row">
        <span className="setting-title">{title}</span>
        {status && <span className={`status-badge ${status}`}>{status}</span>}
      </div>
      <p className="setting-desc">{description}</p>
    </div>
    <div className="setting-action">
      <span className="setting-value">{value}</span>
    </div>
  </div>
);

export default AdminSettings;
