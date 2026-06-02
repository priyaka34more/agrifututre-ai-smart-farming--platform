import re

with open(r'd:\my_personal\agrifuturep\frontend\src\pages\Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = r'''      marketTitle: "Market Prices Updated",
      actMarketDesc: "Wheat prices rose by 12.4% in local mandi."
    }
  };

  const text = contentMap[language] || contentMap.en;
  const formattedUserName = userName.split(' ')[0];

  const priceChartData = [
    { day: "Mon", Price: 2200 },
    { day: "Tue", Price: 2250 },
    { day: "Wed", Price: 2310 },
    { day: "Thu", Price: 2290 },
    { day: "Fri", Price: 2380 },
    { day: "Sat", Price: 2400 }
  ];

  const yieldChartData = [
    { name: "Optimal", Yield: 2600 },
    { name: "Average", Yield: 2100 },
    { name: "Current", Yield: 2450 }
  ];

  const activities = [
    { id: 1, title: "Soil Moisture Normal", time: "10 min ago", desc: "Moisture levels in Plot 3A stabilized at 62%.", icon: <Droplets size={10} />, color: 'blue' },
    { id: 2, title: "Weather Alert", time: "2 hrs ago", desc: "Warm temperature. Monitor soil health.", icon: <Sun size={10} />, color: 'amber' },
    { id: 3, title: "Market Update", time: "5 hrs ago", desc: "Wheat prices rose by 12.4%.", icon: <MarketIcon size={10} />, color: 'emerald' },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 md:pb-6 transition-colors duration-300 font-sans ${themeMode}`}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-4">
        
        {/* ==================================================
            1. SMART HEADER (Welcome & Quick Stats)
           ================================================== */}
        <motion.div '''

content = content.replace(re.search(r'marketTitle:\s*\"[^\"]*<motion\.div ', content).group(0), replacement)

with open(r'd:\my_personal\agrifuturep\frontend\src\pages\Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
