export const MOCK_FARMING_HISTORY = [
  {
    id: 1,
    module: "disease",
    type: "scan",
    title: "Early Blight Detected",
    subtitle: "Tomato crop scan",
    confidence: 0.89,
    date: Date.now() - 5 * 60 * 60 * 1000,
    icon: "camera",
    color: "orange"
  },
  {
    id: 2,
    module: "weather",
    type: "alert",
    title: "Heavy Rainfall Warning",
    subtitle: "Irrigation advisory generated",
    date: Date.now() - 12 * 60 * 60 * 1000,
    icon: "cloud-rain",
    color: "blue"
  },
  {
    id: 3,
    module: "yield",
    type: "prediction",
    title: "Yield Prediction Updated",
    subtitle: "2.5 tons/acre expected for Cotton",
    date: Date.now() - 24 * 60 * 60 * 1000,
    icon: "trending-up",
    color: "green"
  },
  {
    id: 4,
    module: "market",
    type: "alert",
    title: "Mandi Price Alert",
    subtitle: "Soybean prices up 12% in Jalgaon",
    date: Date.now() - 36 * 60 * 60 * 1000,
    icon: "shopping-bag",
    color: "purple"
  },
  {
    id: 5,
    module: "disease",
    type: "scan",
    title: "Healthy Crop",
    subtitle: "Cotton crop scan - no disease",
    confidence: 0.96,
    date: Date.now() - 48 * 60 * 60 * 1000,
    icon: "camera",
    color: "green"
  },
  {
    id: 6,
    module: "profile",
    type: "update",
    title: "Farm Profile Updated",
    subtitle: "Changed irrigation type to Drip",
    date: Date.now() - 72 * 60 * 60 * 1000,
    icon: "user",
    color: "emerald"
  }
];