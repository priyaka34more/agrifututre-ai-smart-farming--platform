import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ExternalLink,
  FileCheck2,
  Loader2,
  MapPin,
  ShieldCheck,
  Sprout,
  Star,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { schemesApi } from "../../services/apiService";
import "./GovtSchemes.css";

/* ─── Fallback data ──────────────────────────────────── */
const fallbackSchemes = [
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    category: "Direct Income Support",
    state: "All India",
    description: "Direct income support for eligible farmer families.",
    benefits: "₹6,000 per year in three installments",
    eligibility: "Eligible landholding farmer families with valid Aadhaar and bank account.",
    documents: ["Aadhaar card", "Bank passbook", "Land ownership record"],
    application_steps: ["Open the official portal.", "Fill farmer and bank details.", "Submit documents and save the acknowledgement number."],
    deadline: "Open year-round",
    status: "Active",
    link: "https://pmkisan.gov.in/",
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana",
    category: "Crop Insurance",
    state: "All India",
    description: "Crop insurance support against notified crop losses from natural risks.",
    benefits: "Low farmer premium for notified crops",
    eligibility: "Farmers growing notified crops in notified areas.",
    documents: ["Aadhaar card", "Crop details", "Bank account details"],
    application_steps: ["Visit the official PMFBY portal.", "Choose your notified crop and season.", "Upload required documents and submit application."],
    deadline: "Season specific",
    status: "Active",
    link: "https://pmfby.gov.in/",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card",
    category: "Credit Facility",
    state: "All India",
    description: "Timely credit support for crop cultivation and allied farm activities.",
    benefits: "Loan up to ₹3 lakh @ 4% (subsidized)",
    eligibility: "Farmers, tenant farmers, sharecroppers, and self-help groups.",
    documents: ["Aadhaar card", "Farm documents", "Bank passbook"],
    application_steps: ["Apply at your bank or digital portal.", "Provide land and crop details.", "Wait for sanction and receive credit limit."],
    deadline: "Open year-round",
    status: "Active",
    link: "https://pmkisan.gov.in/",
  },
  {
    id: "soil-health",
    name: "Soil Health Card Scheme",
    category: "Soil Management",
    state: "All India",
    description: "Soil nutrient testing with crop-wise fertilizer recommendations.",
    benefits: "Free soil health card and fertilizer guidance",
    eligibility: "All farmers with cultivable land.",
    documents: ["Aadhaar card", "Land record", "Mobile number"],
    application_steps: ["Request a soil sample test from local agriculture office.", "Submit sample and farmer details.", "Receive soil health card and recommendations."],
    deadline: "Open year-round",
    status: "Active",
    link: "https://soilhealth.dac.gov.in/",
  },
  {
    id: "micro-irrigation",
    name: "Maharashtra Drip Irrigation Scheme",
    category: "Water Conservation",
    state: "Maharashtra",
    description: "Support for drip and sprinkler irrigation adoption.",
    benefits: "55% subsidy (up to ₹1 lakh per hectare)",
    eligibility: "Farmers with land and water source documents.",
    documents: ["Aadhaar card", "Land record", "Water source proof"],
    application_steps: ["Apply through Maharashtra DBT portal.", "Select irrigation system and submit documents.", "Receive subsidy approval and installation support."],
    deadline: "Based on state window",
    status: "Active",
    link: "https://mahadbt.maharashtra.gov.in/",
  },
  {
    id: "farm-mechanization",
    name: "Maharashtra Farm Mechanization",
    category: "Subsidy",
    state: "Maharashtra",
    description: "Assistance for farm equipment, tools, and custom hiring centers.",
    benefits: "40–50% subsidy (up to ₹5 lakh)",
    eligibility: "Farmers, rural youth, FPOs, and self-help groups.",
    documents: ["Aadhaar card", "Bank account details", "Land ownership proof"],
    application_steps: ["Check the official mechanization portal.", "Apply for the required equipment subsidy.", "Submit details and wait for approval."],
    deadline: "Based on budget allocation",
    status: "Active",
    link: "https://agrimachinery.nic.in/",
  },
];

/* ─── Filter config ──────────────────────────────────── */
const chipCategories = ["All", "Income Support", "Insurance", "Credit", "Subsidy", "Soil", "Water"];
const chipStates     = ["All", "Maharashtra"];
const categoryMap = {
  All: "",
  "Income Support": "Direct Income Support",
  Insurance:        "Crop Insurance",
  Credit:           "Credit Facility",
  Subsidy:          "Subsidy",
  Soil:             "Soil Management",
  Water:            "Water Conservation",
};

/* ─── Profile / doc config ───────────────────────────── */
const needOptions = [
  { id: "income",    label: "Income support",    categories: ["Direct Income Support"], keywords: ["income","support","kisan","samman","nidhi","6000"] },
  { id: "insurance", label: "Crop insurance",    categories: ["Crop Insurance"],        keywords: ["insurance","bima","risk","crop loss","fasal","pmfby"] },
  { id: "credit",    label: "Farm credit",       categories: ["Credit Facility"],       keywords: ["credit","loan","kcc","bank","lakh"] },
  { id: "irrigation",label: "Irrigation support",categories: ["Water Conservation"],   keywords: ["irrigation","drip","sprinkler","water","conservation"] },
  { id: "equipment", label: "Equipment subsidy", categories: ["Subsidy"],              keywords: ["equipment","mechanization","machinery","tractor","tool","subsidy"] },
  { id: "soil",      label: "Soil health",       categories: ["Soil Management"],      keywords: ["soil","fertilizer","nutrient","health card"] },
];
const cropOptions       = ["Wheat","Rice","Cotton","Sugarcane","Soybean","Vegetables"];
const irrigationOptions = ["Rainfed","Canal","Borewell","Drip","Sprinkler"];
const documentOptions   = [
  { id: "aadhaar", label: "Aadhaar card",      aliases: ["aadhaar","aadhar","identity"] },
  { id: "bank",    label: "Bank passbook",     aliases: ["bank","passbook","account"] },
  { id: "land",    label: "Land record",       aliases: ["land","ownership","farm document","7/12","record"] },
  { id: "crop",    label: "Crop details",      aliases: ["crop","sowing","farm details"] },
  { id: "water",   label: "Water source proof",aliases: ["water","irrigation","source"] },
  { id: "mobile",  label: "Mobile number",     aliases: ["mobile","phone"] },
];
const defaultFarmProfile = { need: "income", crop: "Wheat", landSize: "2", irrigation: "Rainfed" };
const defaultReadyDocs   = { aadhaar: true, bank: true, land: false, crop: false, water: false, mobile: true };

/* ─── Pure helpers ───────────────────────────────────── */
function readStoredValue(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const s = window.localStorage.getItem(key);
    return s ? { ...fallback, ...JSON.parse(s) } : fallback;
  } catch { return fallback; }
}
const normalizeText = (v) => String(v || "").toLowerCase();

function getDocumentId(name) {
  const t = normalizeText(name);
  const k = documentOptions.find((d) => d.aliases.some((a) => t.includes(a)));
  return k?.id || t.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function getDisplayDocuments(docs) {
  const arr = Array.isArray(docs) ? docs
    : typeof docs === "string" ? docs.split(/[,;|]/).map((d) => d.trim()).filter(Boolean)
    : [];
  return arr.length ? arr : ["Aadhaar card", "Bank passbook", "Land record"];
}
function getDisplaySteps(steps) {
  if (Array.isArray(steps)) return steps.filter(Boolean);
  if (typeof steps === "string" && steps.trim()) return steps.split(/[\n;|]/).map((s) => s.trim()).filter(Boolean);
  return [];
}
const isDocumentReady = (name, ready) => Boolean(ready[getDocumentId(name)]);

/* ─── normalizeScheme ────────────────────────────────── */
function normalizeScheme(scheme, index) {
  const ss  = scheme.state_specific?.maharashtra || {};
  const elig = scheme.eligibility || {};
  const rt   = scheme.real_time_status || {};

  const rawStatus = rt.status || scheme.status || scheme.application_status || "active";
  const status = String(rawStatus).charAt(0).toUpperCase() + String(rawStatus).slice(1);

  const id = scheme.id || scheme.scheme_id
    || scheme.name?.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")
    || `scheme-${index}`;

  const state = scheme.state || (ss && Object.keys(ss).length ? "Maharashtra" : "All India");

  const description = scheme.description || rt.message
    || `${scheme.name || "Government scheme"} for eligible farmers in Maharashtra.`;

  let benefits = scheme.benefits || "";
  if (!benefits) {
    if (scheme.benefit_amount)
      benefits = `₹${Number(scheme.benefit_amount).toLocaleString("en-IN")}${scheme.frequency?" "+scheme.frequency:""}`;
    else if (scheme.subsidy_percentage)
      benefits = `${scheme.subsidy_percentage} subsidy${scheme.max_equipment_cost||scheme.max_project_cost?" (up to "+(scheme.max_equipment_cost||scheme.max_project_cost)+")":""}`;
    else if (scheme.max_loan)
      benefits = `Loan up to ₹${scheme.max_loan}${scheme.interest_rate?" @ "+scheme.interest_rate:""}`;
    else if (scheme.coverage)
      benefits = `${scheme.coverage} coverage${scheme.premium_rate?" at "+scheme.premium_rate+" premium":""}`;
    else if (scheme.cost === "Free")
      benefits = `Free${scheme.frequency?" — "+scheme.frequency:""}`;
    else
      benefits = "Check official portal for benefit details.";
  }

  let eligibilityText = "";
  if (typeof elig === "string") {
    eligibilityText = elig;
  } else {
    eligibilityText = [
      elig.landholding, elig.farming_activity, elig.residency, elig.income_criteria,
      elig.land_ownership ? "Land ownership required" : null,
      elig.credit_history ? "No default in credit" : null,
    ].filter(Boolean).join(". ") || "Eligibility depends on documents and state guidelines.";
  }

  const rawDocs  = scheme.documents || scheme.required_documents || elig.required_documents || [];
  const documents = getDisplayDocuments(rawDocs);

  const rawSteps = scheme.application_steps || scheme.application_process || scheme.application_status?.required_steps || [];
  const application_steps = getDisplaySteps(rawSteps).length ? getDisplaySteps(rawSteps)
    : ["Open the official portal below.", "Fill in your farmer details and bank account.",
       "Upload required documents.", "Submit and note your acknowledgement number."];

  const deadline = scheme.deadline || scheme.application_deadline || rt.next_installment || "Open — verify on official portal";

  const link = scheme.link || ss.application_portal || ss.status_check_url || scheme.application_portal
    || (scheme.category==="Direct Income Support" ? "https://pmkisan.gov.in/"
      : scheme.category==="Crop Insurance"        ? "https://pmfby.gov.in/"
      : scheme.category==="Soil Management"       ? "https://soilhealth.gov.in/"
      : "https://agri.maharashtra.gov.in/");

  return {
    id, name: scheme.name || "Government Agriculture Scheme",
    category: scheme.category || "General", state, description,
    benefits, eligibility: eligibilityText, documents, application_steps,
    deadline, status, link,
    interest_rate: scheme.interest_rate || null,
    premium_rate:  scheme.premium_rate  || null,
    beneficiaries: ss.beneficiaries     || null,
    api_source: scheme.api_source || "fallback",
  };
}

/* ─── scoreScheme ────────────────────────────────────── */
function scoreScheme(scheme, profile, readyDocs, stateFilter) {
  const need = needOptions.find((n) => n.id === profile.need) || needOptions[0];
  const text = normalizeText(`${scheme.name} ${scheme.category} ${scheme.description} ${scheme.benefits} ${scheme.eligibility}`);
  const categoryFits  = need.categories.some((c) => normalizeText(scheme.category).includes(normalizeText(c)));
  const keywordFits   = need.keywords.some((k) => text.includes(k));
  const stateFits     = stateFilter==="All" || scheme.state==="All India" || scheme.state===stateFilter;
  const cropFits      = !profile.crop || text.includes(normalizeText(profile.crop)) || scheme.state==="All India";
  const irrigationFits = profile.need!=="irrigation" || text.includes("irrigation") || text.includes(normalizeText(profile.irrigation)) || text.includes("water");
  const docs = getDisplayDocuments(scheme.documents);
  const missingDocs = docs.filter((d) => !isDocumentReady(d, readyDocs));
  const readyRatio  = docs.length ? (docs.length - missingDocs.length) / docs.length : 1;

  let score = 28;
  if (stateFits)    score += 18;
  if (categoryFits) score += 26;
  if (keywordFits)  score += 16;
  if (cropFits)     score += 6;
  if (irrigationFits) score += 5;
  score += Math.round(readyRatio * 18);

  const reasons = [];
  if (categoryFits || keywordFits) reasons.push(`Matches ${need.label.toLowerCase()}`);
  if (stateFits) reasons.push(scheme.state==="All India" ? "Available nationally" : `Available in ${scheme.state}`);
  if (missingDocs.length===0) reasons.push("Documents ready");
  if (profile.landSize) reasons.push(`${profile.landSize} acre profile`);

  const firstStep = Array.isArray(scheme.application_steps) && scheme.application_steps.length
    ? scheme.application_steps[0] : "Open the official portal and confirm the latest window.";

  return {
    ...scheme,
    score: Math.min(98, Math.max(20, Math.round(score))),
    missingDocs, readyDocsCount: docs.length - missingDocs.length,
    requiredDocs: docs, reasons,
    nextStep: missingDocs.length ? `Collect ${missingDocs[0]}` : firstStep,
    readiness: missingDocs.length ? "Docs pending" : "Ready to apply",
  };
}

/* ─── buildActionPlan / buildChecklistText ───────────── */
function buildActionPlan(scheme) {
  const missing = scheme.missingDocs || [];
  const firstStep = Array.isArray(scheme.application_steps) && scheme.application_steps.length
    ? scheme.application_steps[0] : "Open the official portal and start the application.";
  return [
    missing.length ? `Prepare missing documents: ${missing.join(", ")}.` : "Documents look ready for first submission.",
    `Confirm deadline and eligibility for ${scheme.state}.`,
    firstStep,
    "Save acknowledgement number after submission.",
  ];
}
function buildChecklistText(scheme) {
  return [
    scheme.name, `Fit score: ${scheme.score}%`, `Benefits: ${scheme.benefits}`,
    `Deadline: ${scheme.deadline}`,
    `Missing documents: ${scheme.missingDocs.length ? scheme.missingDocs.join(", ") : "None"}`,
    "Action plan:", ...buildActionPlan(scheme).map((s, i) => `${i+1}. ${s}`),
    `Apply: ${scheme.link}`,
  ].join("\n");
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
function GovtSchemes() {
  const [schemes,        setSchemes]        = useState(fallbackSchemes);
  const [loading,        setLoading]        = useState(false);
  const [stateFilter,    setStateFilter]    = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [sourceNote,     setSourceNote]     = useState("");
  const [farmProfile,    setFarmProfile]    = useState(() => readStoredValue("schemeFarmProfile", defaultFarmProfile));
  const [readyDocs,      setReadyDocs]      = useState(() => readStoredValue("schemeReadyDocs",   defaultReadyDocs));
  const [copiedId,       setCopiedId]       = useState("");
  const [profileOpen,    setProfileOpen]    = useState(true);

  /* persist profile */
  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("schemeFarmProfile", JSON.stringify(farmProfile));
  }, [farmProfile]);
  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("schemeReadyDocs", JSON.stringify(readyDocs));
  }, [readyDocs]);

  /* fetch */
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setSourceNote("");
      try {
        const res = await schemesApi.getAll(
          stateFilter === "All" ? "maharashtra" : stateFilter.toLowerCase(),
          categoryFilter === "All" ? "" : categoryMap[categoryFilter] || categoryFilter,
        );
        const raw = res?.schemes || res?.data || res || [];
        const norm = Array.isArray(raw) ? raw.map(normalizeScheme) : fallbackSchemes;
        if (!ignore) {
          setSchemes(norm.length ? norm : fallbackSchemes);
          if (norm.length && norm[0]?.api_source === "government_schemes_service") setSourceNote("");
        }
      } catch {
        if (!ignore) {
          setSchemes(fallbackSchemes);
          setSourceNote("Offline mode — showing verified scheme data. Tap Apply Now to confirm on the official portal.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [stateFilter, categoryFilter]);

  /* ranked list */
  const rankedSchemes = useMemo(() => {
    return schemes
      .filter((s) => {
        const okState = stateFilter==="All" || s.state==="All India" || s.state===stateFilter;
        const apiCat  = categoryMap[categoryFilter] || categoryFilter;
        const okCat   = categoryFilter==="All" || s.category===apiCat || normalizeText(s.category).includes(normalizeText(apiCat));
        return okState && okCat;
      })
      .map((s) => scoreScheme(s, farmProfile, readyDocs, stateFilter))
      .sort((a, b) => b.score - a.score || a.missingDocs.length - b.missingDocs.length);
  }, [farmProfile, readyDocs, schemes, stateFilter, categoryFilter]);

  const recommendedSchemes  = rankedSchemes.slice(0, 6);
  const readyDocCount        = documentOptions.filter((d) => readyDocs[d.id]).length;
  const readyToApplyCount    = rankedSchemes.filter((s) => s.missingDocs.length === 0).length;
  const missingDocCount      = documentOptions.length - readyDocCount;
  const topMatch             = rankedSchemes[0];

  const updateFarmProfile = (field, value) =>
    setFarmProfile((cur) => ({ ...cur, [field]: value }));
  const toggleReadyDoc = (id) =>
    setReadyDocs((cur) => ({ ...cur, [id]: !cur[id] }));

  const copyChecklist = async (scheme) => {
    try {
      await navigator.clipboard.writeText(buildChecklistText(scheme));
      setCopiedId(scheme.id);
      window.setTimeout(() => setCopiedId(""), 1800);
    } catch { setCopiedId(""); }
  };

  /* ── RENDER ── */
  return (
    <div className="gs-page">

      {/* ── PAGE HEADER ── */}
      <div className="gs-header">
        <div className="gs-header-text">
          <span className="gs-eyebrow">Government Schemes</span>
          <h1 className="gs-title">Scheme Finder</h1>
          <p className="gs-subtitle">Match schemes to your farm profile</p>
        </div>
        {topMatch && (
          <div className="gs-best-score">
            <span>Best fit</span>
            <strong>{topMatch.score}%</strong>
          </div>
        )}
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="gs-summary-row">
        <div className="gs-summary-card green">
          <div className="gs-summary-icon"><TrendingUp size={20} /></div>
          <div>
            <span className="gs-summary-num">{recommendedSchemes.length}</span>
            <span className="gs-summary-lbl">Eligible Schemes</span>
          </div>
        </div>
        <div className="gs-summary-card blue">
          <div className="gs-summary-icon"><CheckCircle2 size={20} /></div>
          <div>
            <span className="gs-summary-num">{readyToApplyCount}</span>
            <span className="gs-summary-lbl">Ready to Apply</span>
          </div>
        </div>
        <div className="gs-summary-card orange">
          <div className="gs-summary-icon"><FileCheck2 size={20} /></div>
          <div>
            <span className="gs-summary-num">{missingDocCount}</span>
            <span className="gs-summary-lbl">Docs Missing</span>
          </div>
        </div>
      </div>

      {/* ── BEST MATCH BANNER ── */}
      {topMatch && (
        <div className="gs-best-match-banner">
          <div className="gs-bm-left">
            <Star size={18} className="gs-bm-star" />
            <div>
              <span className="gs-bm-label">Best Scheme For You</span>
              <p className="gs-bm-name">{topMatch.name}</p>
            </div>
          </div>
          <div className="gs-bm-right">
            <span className="gs-bm-score">{topMatch.score}%</span>
            <span className="gs-bm-match">Match</span>
          </div>
        </div>
      )}
      {topMatch && (
        <div className="gs-bm-reasons">
          {topMatch.reasons.slice(0, 3).map((r, i) => (
            <span key={i} className="gs-bm-reason-chip">
              <Zap size={11} />{r}
            </span>
          ))}
        </div>
      )}

      {/* ── FARM PROFILE PANEL ── */}
      <div className="gs-section-card">
        <button
          className="gs-section-toggle"
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          aria-expanded={profileOpen}
        >
          <div className="gs-section-toggle-left">
            <Sprout size={18} className="gs-section-icon" />
            <div>
              <span className="gs-section-title">My Farm Profile</span>
              <span className="gs-section-sub">{readyDocCount}/{documentOptions.length} documents ready</span>
            </div>
          </div>
          <ChevronDown size={18} className={`gs-chevron ${profileOpen ? "open" : ""}`} />
        </button>

        {profileOpen && (
          <div className="gs-profile-body">
            {/* Stacked full-width form fields */}
            <div className="gs-form-stack">
              <label className="gs-field">
                <span className="gs-field-label">What do you need?</span>
                <div className="gs-select-wrap">
                  <select value={farmProfile.need} onChange={(e) => updateFarmProfile("need", e.target.value)}>
                    {needOptions.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                  </select>
                  <ChevronDown size={16} className="gs-select-chevron" />
                </div>
              </label>

              <label className="gs-field">
                <span className="gs-field-label">Your crop</span>
                <div className="gs-select-wrap">
                  <select value={farmProfile.crop} onChange={(e) => updateFarmProfile("crop", e.target.value)}>
                    {cropOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={16} className="gs-select-chevron" />
                </div>
              </label>

              <label className="gs-field">
                <span className="gs-field-label">Land size (acres)</span>
                <input
                  className="gs-input"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={farmProfile.landSize}
                  onChange={(e) => updateFarmProfile("landSize", e.target.value)}
                  placeholder="e.g. 2.5"
                />
              </label>

              <label className="gs-field">
                <span className="gs-field-label">Irrigation type</span>
                <div className="gs-select-wrap">
                  <select value={farmProfile.irrigation} onChange={(e) => updateFarmProfile("irrigation", e.target.value)}>
                    {irrigationOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={16} className="gs-select-chevron" />
                </div>
              </label>
            </div>

            {/* Document readiness — 2-col grid */}
            <div className="gs-docs-section">
              <div className="gs-docs-header">
                <ClipboardCheck size={16} />
                <span>Mark documents you have ready</span>
              </div>
              <div className="gs-docs-grid">
                {documentOptions.map((doc) => (
                  <label
                    key={doc.id}
                    className={`gs-doc-item ${readyDocs[doc.id] ? "ready" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(readyDocs[doc.id])}
                      onChange={() => toggleReadyDoc(doc.id)}
                    />
                    <span className="gs-doc-icon">
                      {readyDocs[doc.id]
                        ? <CheckCircle2 size={16} />
                        : <span className="gs-doc-circle" />}
                    </span>
                    <span className="gs-doc-label">{doc.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FILTER CHIPS ── */}
      <div className="gs-chips-wrap" aria-label="Filter schemes">
        <div className="gs-chips">
          {chipCategories.map((label) => (
            <button
              key={label}
              type="button"
              className={`gs-chip ${categoryFilter === label ? "active" : ""}`}
              onClick={() => setCategoryFilter(label)}
            >
              {label}
            </button>
          ))}
          <div className="gs-chip-divider" />
          {chipStates.map((label) => (
            <button
              key={label}
              type="button"
              className={`gs-chip state ${stateFilter === label ? "active" : ""}`}
              onClick={() => setStateFilter(label)}
            >
              <MapPin size={11} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── OFFLINE NOTICE ── */}
      {sourceNote && (
        <div className="gs-offline-note">
          <ShieldCheck size={16} />
          <span>{sourceNote}</span>
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div className="gs-loading">
          <Loader2 size={32} className="gs-spinner" />
          <p>Finding best schemes for you…</p>
        </div>
      )}

      {/* ── SCHEME CARDS ── */}
      {!loading && (
        <div className="gs-cards">
          {recommendedSchemes.length === 0 ? (
            <div className="gs-empty">
              <CheckCircle2 size={40} />
              <h3>No matching schemes</h3>
              <p>Try changing your filters or farm profile.</p>
            </div>
          ) : (
            recommendedSchemes.map((scheme, idx) => (
              <article key={scheme.id} className={`gs-card ${idx === 0 ? "top-match" : ""}`}>

                {/* Card header row */}
                <div className="gs-card-head">
                  <div className="gs-card-pills">
                    {idx === 0 && <span className="gs-pill best">★ Best Match</span>}
                    <span className="gs-pill state">
                      <MapPin size={11} />{scheme.state}
                    </span>
                    <span className={`gs-pill status ${scheme.status.toLowerCase()}`}>
                      {scheme.status}
                    </span>
                    {scheme.api_source === "government_schemes_service" && (
                      <span className="gs-pill live">● Live</span>
                    )}
                  </div>
                  <div className="gs-card-score">
                    <span className="gs-score-num">{scheme.score}%</span>
                    <span className="gs-score-lbl">fit</span>
                  </div>
                </div>

                {/* Scheme name + type */}
                <div className="gs-card-name-row">
                  <div>
                    <h2 className="gs-card-name">{scheme.name}</h2>
                    <span className="gs-card-type">{scheme.category}</span>
                  </div>
                </div>

                {/* Benefit highlight */}
                <div className="gs-benefit-box">
                  <Banknote size={15} className="gs-benefit-icon" />
                  <span className="gs-benefit-text">{scheme.benefits}</span>
                </div>

                {/* Required documents */}
                <div className="gs-card-docs-section">
                  <span className="gs-card-docs-label">Required Documents</span>
                  <div className="gs-card-docs">
                    {scheme.requiredDocs.slice(0, 4).map((doc) => {
                      const ready = isDocumentReady(doc, readyDocs);
                      return (
                        <span key={doc} className={`gs-doc-chip ${ready ? "ready" : "missing"}`}>
                          {ready ? <CheckCircle2 size={12} /> : <FileCheck2 size={12} />}
                          {doc}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Eligibility status row */}
                <div className="gs-card-status-row">
                  <div className="gs-status-item">
                    <ShieldCheck size={14} />
                    <span>{scheme.readiness}</span>
                  </div>
                  {scheme.missingDocs.length > 0 && (
                    <div className="gs-status-item missing">
                      <FileCheck2 size={14} />
                      <span>{scheme.missingDocs.length} doc{scheme.missingDocs.length > 1 ? "s" : ""} missing</span>
                    </div>
                  )}
                </div>

                {/* Next action */}
                <div className="gs-next-action">
                  <span className="gs-next-label">Next Step</span>
                  <p className="gs-next-text">{scheme.nextStep}</p>
                </div>

                {/* Action buttons */}
                <div className="gs-card-actions">
                  <button
                    type="button"
                    className="gs-btn-secondary"
                    onClick={() => setSelectedScheme(scheme)}
                  >
                    <ClipboardCheck size={15} />
                    View Details
                  </button>
                  <button
                    type="button"
                    className="gs-btn-primary"
                    onClick={() => window.open(scheme.link, "_blank", "noopener,noreferrer")}
                  >
                    Apply Now
                    <ArrowRight size={15} />
                  </button>
                </div>

              </article>
            ))
          )}
        </div>
      )}

      {/* ── BOTTOM SHEET MODAL ── */}
      {selectedScheme && (
        <div
          className="gs-modal-overlay"
          onClick={() => setSelectedScheme(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedScheme.name}
        >
          <div className="gs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gs-modal-drag" />

            {/* Modal header */}
            <div className="gs-modal-header">
              <div className="gs-modal-title-block">
                <span className="gs-modal-eyebrow">Application Plan</span>
                <h2 className="gs-modal-title">{selectedScheme.name}</h2>
              </div>
              <button
                type="button"
                className="gs-modal-close"
                onClick={() => setSelectedScheme(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Score strip */}
            <div className="gs-modal-scores">
              <div className="gs-modal-score-item">
                <span>Fit Score</span>
                <strong className="gs-score-highlight">{selectedScheme.score}%</strong>
              </div>
              <div className="gs-modal-score-item">
                <span>Readiness</span>
                <strong>{selectedScheme.readiness}</strong>
              </div>
              <div className="gs-modal-score-item">
                <span>{selectedScheme.beneficiaries ? "Beneficiaries" : "Deadline"}</span>
                <strong>{selectedScheme.beneficiaries || selectedScheme.deadline}</strong>
              </div>
            </div>

            {/* Benefits */}
            <div className="gs-modal-section">
              <div className="gs-modal-section-title">
                <Banknote size={15} /><span>Benefits</span>
              </div>
              <p className="gs-modal-text">{selectedScheme.benefits}</p>
            </div>

            {/* Eligibility */}
            <div className="gs-modal-section">
              <div className="gs-modal-section-title">
                <ShieldCheck size={15} /><span>Eligibility</span>
              </div>
              <p className="gs-modal-text">{selectedScheme.eligibility}</p>
            </div>

            {/* Documents */}
            <div className="gs-modal-section">
              <div className="gs-modal-section-title">
                <FileCheck2 size={15} /><span>Required Documents</span>
              </div>
              <div className="gs-modal-docs-list">
                {selectedScheme.requiredDocs.map((doc) => {
                  const ready = isDocumentReady(doc, readyDocs);
                  return (
                    <div key={doc} className={`gs-modal-doc-row ${ready ? "ready" : "missing"}`}>
                      {ready ? <CheckCircle2 size={16} /> : <FileCheck2 size={16} />}
                      <span>{doc}</span>
                      <strong>{ready ? "Ready" : "Missing"}</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action plan */}
            <div className="gs-modal-section">
              <div className="gs-modal-section-title">
                <CalendarDays size={15} /><span>Action Plan</span>
              </div>
              <div className="gs-modal-steps">
                {buildActionPlan(selectedScheme).map((step, i) => (
                  <div key={i} className="gs-modal-step">
                    <span className="gs-step-num">{i + 1}</span>
                    <span className="gs-step-text">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portal link */}
            <div className="gs-modal-section">
              <a
                className="gs-portal-link"
                href={selectedScheme.link}
                target="_blank"
                rel="noreferrer noopener"
              >
                <ExternalLink size={15} />
                <span>Official Portal</span>
                <span className="gs-portal-url">{selectedScheme.link}</span>
              </a>
            </div>

            {/* Footer actions */}
            <div className="gs-modal-footer">
              <button
                type="button"
                className="gs-modal-copy"
                onClick={() => copyChecklist(selectedScheme)}
              >
                {copiedId === selectedScheme.id ? "Copied ✓" : "Copy Checklist"}
              </button>
              <button
                type="button"
                className="gs-modal-apply"
                onClick={() => window.open(selectedScheme.link, "_blank", "noopener,noreferrer")}
              >
                Apply Now
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default GovtSchemes;
