import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CloudRain,
  AlertTriangle,
  TrendingUp,
  Building2,
  Bot,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import MobileLayout from "../components/MobileLayout";
import "./Notifications.css";

const initialNotifications = [
  {
    id: 1,
    category: "Weather Alerts",
    title: "Rain expected tomorrow in your area.",
    timestamp: "2m ago",
    unread: true,
    icon: "weather",
  },
  {
    id: 2,
    category: "Market Updates",
    title: "Cotton price increased by 5%.",
    timestamp: "15m ago",
    unread: true,
    icon: "market",
  },
  {
    id: 3,
    category: "Government Schemes",
    title: "New PM-Kisan update available.",
    timestamp: "1h ago",
    unread: false,
    icon: "schemes",
  },
  {
    id: 4,
    category: "AI Advisory",
    title: "AI Advisory: Consider irrigation this week.",
    timestamp: "3h ago",
    unread: false,
    icon: "ai",
  },
];

const categories = [
  {
    key: "weather",
    label: "Weather Alerts",
    icon: CloudRain,
    color: "#2563EB",
    bg: "#DBEAFE",
    items: ["Rain forecast", "Temperature alerts"],
  },
  {
    key: "disease",
    label: "Disease Alerts",
    icon: AlertTriangle,
    color: "#F59E0B",
    bg: "#FEF3C7",
    items: ["Disease risk warnings", "Crop health alerts"],
  },
  {
    key: "market",
    label: "Market Updates",
    icon: TrendingUp,
    color: "#16A34A",
    bg: "#DCFCE7",
    items: ["Crop price changes", "Market trends"],
  },
  {
    key: "schemes",
    label: "Government Schemes",
    icon: Building2,
    color: "#1F7B3A",
    bg: "#E6F4EC",
    items: ["New scheme announcements", "Eligibility updates"],
  },
  {
    key: "ai",
    label: "AI Advisory",
    icon: Bot,
    color: "#9333EA",
    bg: "#F3E8FF",
    items: ["New farming recommendations", "Crop management tips"],
  },
];

function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const handleMarkAllRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false }))
    );
  };

  const handleMarkRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const notificationIcon = (type) => {
    switch (type) {
      case "weather":
        return CloudRain;
      case "disease":
        return AlertTriangle;
      case "market":
        return TrendingUp;
      case "schemes":
        return Building2;
      case "ai":
        return Bot;
      default:
        return CloudRain;
    }
  };

  return (
    <MobileLayout title={t("notifications", "Notifications")}> 
      <div className="notifications-page">
        <section className="notifications-header-card">
          <div className="notifications-header-top">
            <div>
              <h2>{t("notifications", "Notifications")}</h2>
              <p className="notifications-subtitle">
                Stay up to date with farm alerts and advisory updates.
              </p>
            </div>
            <div className="notifications-badge">
              <span>{unreadCount}</span>
              <small>{t("notifications.unread", "Unread")}</small>
            </div>
          </div>

          <div className="notifications-actions-row">
            <button
              type="button"
              className="notifications-action-btn"
              onClick={handleMarkAllRead}
            >
              <CheckCircle2 size={16} />
              {t("notifications.markAllRead", "Mark all read")}
            </button>
            <button
              type="button"
              className="notifications-action-btn danger"
              onClick={handleClearAll}
            >
              <Trash2 size={16} />
              {t("notifications.clearAll", "Clear all")}
            </button>
          </div>
        </section>

        <section className="notifications-category-section">
          <div className="section-heading-row">
            <h3>Notification Categories</h3>
          </div>
          <div className="notification-categories-grid">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div className="notification-category-card" key={category.key}>
                  <div
                    className="category-icon"
                    style={{ background: category.bg, color: category.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="category-copy">
                    <strong>{category.label}</strong>
                    <ul>
                      {category.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="notifications-list-section">
          <div className="section-heading-row">
            <h3>{t("notifications.latestAlerts", "Latest Alerts")}</h3>
            <span className="unread-pill">
              {unreadCount} {t("notifications.unreadCount", "Unread")}
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="notifications-empty-state">
              <div className="empty-icon">🔔</div>
              <h4>{t("notifications.emptyTitle", "No notifications available")}</h4>
              <p>{t("notifications.emptySubtitle", "All alerts have been cleared.")}</p>
              <button
                type="button"
                className="notifications-back-btn"
                onClick={() => navigate("/dashboard")}
              >
                {t("notifications.goToDashboard", "Back to dashboard")}
              </button>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((item) => {
                const Icon = notificationIcon(item.icon);
                return (
                  <div
                    key={item.id}
                    className={`notification-card ${item.unread ? "unread" : "read"}`}
                  >
                    <div
                      className="notification-card-icon"
                      style={{
                        background:
                          item.icon === "weather"
                            ? "#DBEAFE"
                            : item.icon === "disease"
                            ? "#FEF3C7"
                            : item.icon === "market"
                            ? "#DCFCE7"
                            : item.icon === "schemes"
                            ? "#E6F4EC"
                            : "#F3E8FF",
                        color:
                          item.icon === "weather"
                            ? "#2563EB"
                            : item.icon === "disease"
                            ? "#F59E0B"
                            : item.icon === "market"
                            ? "#16A34A"
                            : item.icon === "schemes"
                            ? "#1F7B3A"
                            : "#9333EA",
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="notification-card-body">
                      <div className="notification-card-top">
                        <span className="notification-category">{item.category}</span>
                        {item.unread && <span className="notification-unread-dot" />}
                      </div>
                      <p className="notification-title">{item.title}</p>
                      <div className="notification-meta-row">
                        <span className="notification-timestamp">{item.timestamp}</span>
                        {item.unread && (
                          <button
                            type="button"
                            className="notification-mark-read"
                            onClick={() => handleMarkRead(item.id)}
                          >
                            {t("notifications.markAsRead", "Mark as Read")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </MobileLayout>
  );
}

export default Notifications;
