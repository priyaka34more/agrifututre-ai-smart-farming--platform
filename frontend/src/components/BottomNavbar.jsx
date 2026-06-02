import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart3, CloudSun, Home, Leaf, User } from "lucide-react";
import useTranslation from "../hooks/useTranslation";

export default function BottomNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const items = [
    { path: "/", labelKey: "bottomNav.home", label: "Home", icon: Home, match: (path) => path === "/" },
    { path: "/disease", labelKey: "bottomNav.scan", label: "Scan", icon: Leaf, match: (path) => path.startsWith("/disease") },
    { path: "/market", labelKey: "bottomNav.market", label: "Market", icon: BarChart3, match: (path) => path.startsWith("/market") },
    { path: "/weather", labelKey: "bottomNav.weather", label: "Weather", icon: CloudSun, match: (path) => path.startsWith("/weather") },
    { path: "/profile", labelKey: "bottomNav.profile", label: "Profile", icon: User, match: (path) => path.startsWith("/profile") }
  ];

  return (
    <nav className="bottom-nav" aria-label="Primary mobile navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.match(location.pathname);
        return (
          <button
            key={item.path}
            type="button"
            aria-current={active ? "page" : undefined}
            aria-label={t(item.labelKey, item.label)}
            className={`bottom-nav-item ${active ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="bottom-nav-icon">
              <Icon size={active ? 34 : 30} />
            </span>
            <span>{t(item.labelKey, item.label)}</span>
          </button>
        );
      })}
    </nav>
  );
}
