import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCcw, Leaf } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { adviceApi } from "../services/adviceService";
import "./FarmAdvisory.css";

const advisoryTranslations = {
  en: {
    weather: "Rain expected in next 24 hours.",
    irrigation: "Irrigate cotton crop tomorrow morning.",
    pest: "Avoid pesticide spraying today.",
    market: "Soybean market price is increasing."
  },
  hi: {
    weather: "जलगांव में वर्षा की संभावना है।",
    irrigation: "सुबह सिंचाई करें।",
    pest: "फसलों की नियमित जांच करें।",
    market: "सोयाबीन के भाव बढ़ रहे हैं।"
  },
  mr: {
    weather: "जळगावमध्ये पावसाची शक्यता आहे. शेती जोखीम पातळी मध्यम आहे.",
    irrigation: "सकाळी सिंचन करा. फवारणी पुढे ढकला.",
    pest: "पिकांवर नियमित निरीक्षण ठेवा.",
    market: "सोयाबीन बाजारभाव वाढत आहेत."
  }
};

export default function FarmAdvisory() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [liveAdvice, setLiveAdvice] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const parseAdviceResponse = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (typeof response === "string") return [response];
    const rawAdvice = response?.advice || response?.data || response?.adviceData || response;
    if (Array.isArray(rawAdvice)) return rawAdvice;
    if (typeof rawAdvice === "string") return [rawAdvice];
    return [];
  };


  const isLikelyEnglishAdvice = (items) => {
    return items.every((item) => {
      if (typeof item !== "string") return false;
      return item.split("").every((char) => char.charCodeAt(0) <= 0x7f);
    });
  };

  const getTranslatedFallbackAdvice = (lang) => {
    const langMap = advisoryTranslations[lang] || advisoryTranslations.en;
    return [
      {
        heading: t("dashboard.weatherAdvisory"),
        text: langMap.weather
      },
      {
        heading: t("dashboard.irrigationAdvisory"),
        text: langMap.irrigation
      },
      {
        heading: t("dashboard.pestAdvisory"),
        text: langMap.pest
      },
      {
        heading: t("dashboard.marketAdvisory"),
        text: langMap.market
      },
      {
        heading: t("dashboard.cropRecommendation"),
        text: t("dashboard.cropRecommendationText")
      }
    ];
  };

  const fetchAdvice = useCallback(
    async (requestLanguage) => {
      const currentLanguage = requestLanguage || language || "en";
      console.log("Language:", currentLanguage);
      setLoading(true);
      setError(false);
      setLiveAdvice([]);
      try {
        const storedUser = localStorage.getItem("userData");
        const userData = storedUser ? JSON.parse(storedUser) : null;
        const params = {
          city: userData?.location || localStorage.getItem("userLocation") || undefined,
          crop: userData?.crop || userData?.favoriteCrop || "wheat",
          lang: currentLanguage
        };

        const response = await adviceApi.getAdvice(params);
        console.log("Advice Response:", response);

        const rawAdvice = parseAdviceResponse(response);
        const filteredAdvice = rawAdvice.filter(
          (item) => typeof item === "string" && item.trim().length > 0
        );

        if (filteredAdvice.length === 0) {
          throw new Error("No live advisory data available");
        }

        setLiveAdvice(filteredAdvice);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        setError(true);
        setLiveAdvice([]);
      } finally {
        setLoading(false);
      }
    },
    [language]
  );

  useEffect(() => {
    fetchAdvice(language);
  }, [language, fetchAdvice]);

  

  const advisoryHeadings = [
    t("dashboard.weatherAdvisory"),
    t("dashboard.irrigationAdvisory"),
    t("dashboard.pestAdvisory"),
    t("dashboard.marketAdvisory"),
    t("dashboard.cropRecommendation")
  ];

  const useFallbackAdvice =
    language !== "en" && liveAdvice.length > 0 && isLikelyEnglishAdvice(liveAdvice);

  const localizedAdvice = getTranslatedFallbackAdvice(language);
  console.log("Current Advice:", localizedAdvice);

  const advisoryItems = !error && liveAdvice.length > 0 && !useFallbackAdvice
    ? liveAdvice.map((item, idx) => ({
        heading: advisoryHeadings[idx] || t("dashboard.farmAdvisoryHeader"),
        text: item
      }))
    : localizedAdvice;

  const formattedUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleString(language || "en")
    : t("dashboard.notUpdated");

  return (
    <div className="farm-advisory-page">
      <div className="farm-advisory-shell">
        <div className="farm-advisory-header">
          <button type="button" className="farm-advisory-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            {t("dashboard.back")}
          </button>
          <h1>{t("dashboard.farmAdvisoryPageTitle")}</h1>
        </div>

        <div className="farm-advisory-meta">
          <div className="farm-advisory-meta-item">
            <span>{t("dashboard.lastUpdated")}:</span>
            <strong>{formattedUpdated}</strong>
          </div>
          <button type="button" className="farm-advisory-refresh" onClick={() => fetchAdvice(language)}>
            <RefreshCcw size={18} />
            {t("dashboard.refresh")}
          </button>
        </div>

        <div className="farm-advisory-card">
          <div className="farm-advisory-card-title">
            <Leaf size={28} />
            <span>{t("dashboard.farmAdvisoryHeader")}</span>
          </div>

          {loading && <div className="farm-advisory-status">{t("dashboard.loadingAdvisoryText")}</div>}
          {error && !loading && (
            <div className="farm-advisory-error">
              <p>{t("dashboard.fallbackAdvisoryMessage")}</p>
            </div>
          )}

          <ul className="farm-advisory-list">
            {advisoryItems.map((item, idx) => (
              <li key={idx} className="farm-advisory-list-item">
                <div className="farm-advisory-item-heading">{item.heading}</div>
                <div className="farm-advisory-item-text">
                  {item.text || t("dashboard.adviceUnavailable", "No advice available")}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
