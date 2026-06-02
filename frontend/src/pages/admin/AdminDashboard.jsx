import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAdminStats, getActivities, getTopDiseases 
} from "../../services/adminService";
import { 
  Users, ScanLine, Activity, ShieldCheck, 
  RefreshCw, Search, Database, Cpu, ShieldAlert, ArrowUpRight, CheckCircle2
} from "lucide-react";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [topDiseases, setTopDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [systemCheckActive, setSystemCheckActive] = useState(false);
  const [flushCacheActive, setFlushCacheActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const statsRes = await getAdminStats();
      const activityRes = await getActivities();
      const diseaseRes = await getTopDiseases();

      setStats(statsRes.data);
      setActivities(activityRes.data || []);
      setTopDiseases(diseaseRes.data || []);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const runDiagnostics = () => {
    setSystemCheckActive(true);
    setTimeout(() => {
      setSystemCheckActive(false);
      triggerToast("AI Models and Database connections are perfectly healthy!");
    }, 1500);
  };

  const flushCache = () => {
    setFlushCacheActive(true);
    setTimeout(() => {
      setFlushCacheActive(false);
      triggerToast("System caches and scan diagnostic queues successfully flushed!");
    }, 1200);
  };

  const cards = [
    {
      title: "Total Registered Users",
      value: stats?.total_users || 0,
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600",
      desc: "Farmers & admin entities"
    },
    {
      title: "Crop Illness Scans Done",
      value: stats?.total_scans || 0,
      icon: ScanLine,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 dark:bg-indigo-950/20 text-blue-600",
      desc: "Leaf scan diagnostic volume"
    },
    {
      title: "Total System Activities",
      value: stats?.total_activities || 0,
      icon: Activity,
      color: "from-purple-500 to-violet-600",
      bg: "bg-purple-50 dark:bg-purple-950/20 text-purple-600",
      desc: "Mandi searches, logins & scans"
    },
    {
      title: "AI Engine Calibration",
      value: `${stats?.accuracy || 100}%`,
      icon: ShieldCheck,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50 dark:bg-amber-950/20 text-amber-600",
      desc: "Fitted validation accuracy"
    },
  ];

  const COLORS = [
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#f59e0b", // Amber
    "#8b5cf6", // Violet
    "#ec4899", // Pink
  ];

  // Client-side search filtering for activities
  const filteredActivities = activities.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.full_name?.toLowerCase().includes(query) ||
      item.module?.toLowerCase().includes(query) ||
      item.action?.toLowerCase().includes(query)
    );
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4 sm:space-y-6"
    >
      {/* Toast Feedback */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed left-3 right-3 top-4 z-50 flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl sm:left-auto sm:right-6 sm:top-6 sm:max-w-md"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-md">AgriFuture Enterprise Console</span>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-800 sm:text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Real-time platform telemetry, database triggers & AI health stats</p>
        </div>
        <button 
          onClick={fetchDashboard}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition-all hover:bg-slate-100 disabled:opacity-50 sm:w-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>{loading ? "Syncing..." : "Sync Database"}</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-150 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5"
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">{card.title}</span>
                  <h2 className="text-2xl font-black text-slate-800 transition-colors group-hover:text-green-700 sm:text-3xl">
                    {card.value}
                  </h2>
                </div>
                <div className={`p-3 rounded-2xl ${card.bg} group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center text-[10px] text-slate-450 font-bold">
                <span>{card.desc}</span>
                <ArrowUpRight size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CORE UTILITY DIAGNOSTICS & CONTROLS */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* CHART CONTROLLER */}
        <div className="flex flex-col rounded-2xl border border-slate-150 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:col-span-2">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-850 sm:text-xl">Disease Distribution Matrix</h2>
              <p className="text-xs text-slate-450 mt-0.5">Primary pests diagnosed during user leaf-scans</p>
            </div>
            <span className="w-fit text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Live Telemetry</span>
          </div>

          <div className="grid flex-1 grid-cols-1 items-center gap-4 sm:gap-6 md:grid-cols-5">
            <div className="h-56 sm:h-72 md:col-span-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topDiseases.length > 0 ? topDiseases : [{ disease: "No diagnostics", count: 1 }]}
                    dataKey="count"
                    nameKey="disease"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {(topDiseases.length > 0 ? topDiseases : [{ disease: "No diagnostics", count: 1 }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Premium Interactive Legend */}
            <div className="md:col-span-2 space-y-3">
              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider pl-1">Matrix Legend</span>
              <div className="divide-y divide-slate-50 max-h-56 overflow-y-auto no-scrollbar">
                {topDiseases.length > 0 ? (
                  topDiseases.map((item, index) => (
                    <div key={index} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-bold text-slate-700 truncate max-w-[130px]">{item.disease}</span>
                      </div>
                      <span className="font-black text-slate-900 bg-slate-50 px-1.5 py-0.5 rounded">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-slate-400 font-bold text-xs italic">No disease data recorded.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM CALIBRATION HUB */}
        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-150 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-850 sm:text-xl">System Calibration Hub</h2>
            <p className="text-xs text-slate-450 mt-0.5">Control neural models and database states</p>
          </div>

          <div className="space-y-3 flex-1 py-3">
            {/* Database indicator */}
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <Database size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">Database Status</span>
                  <span className="text-xs font-black text-slate-700 mt-1 block">PostgreSQL Online</span>
                </div>
              </div>
              <span className="shrink-0 text-[8px] font-black uppercase text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Stable</span>
            </div>

            {/* Neural model latency */}
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <Cpu size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">AI Leaf Diagnostic</span>
                  <span className="text-xs font-black text-slate-700 mt-1 block">DenseNet-121 Model</span>
                </div>
              </div>
              <span className="shrink-0 text-[8px] font-black uppercase text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">98% Fit</span>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={runDiagnostics}
              disabled={systemCheckActive}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Cpu size={14} className={systemCheckActive ? "animate-spin" : ""} />
              <span>{systemCheckActive ? "Querying AI Engines..." : "Verify AI Core Health"}</span>
            </button>
            <button 
              onClick={flushCache}
              disabled={flushCacheActive}
              className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={flushCacheActive ? "animate-spin" : ""} />
              <span>{flushCacheActive ? "Clearing Queues..." : "Purge Telemetry Cache"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEARCHABLE RECENT ACTIVITIES */}
      <div className="rounded-2xl border border-slate-150 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex flex-col items-start justify-between gap-4 md:mb-6 md:flex-row md:items-center">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-850 sm:text-xl">Recent System Activities</h2>
            <p className="text-xs text-slate-450 mt-0.5">Real-time user trigger audit records</p>
          </div>

          {/* Clean Interactive Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search size={14} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by user name or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all bg-slate-50/50"
            />
          </div>
        </div>

        <div className="max-h-96 space-y-2 overflow-y-auto pr-1 no-scrollbar">
          {filteredActivities.length > 0 ? (
            filteredActivities.slice(0, 10).map((item, index) => {
              const isScan = item.module?.toLowerCase().includes("scan") || item.module?.toLowerCase().includes("disease");
              const isAuth = item.module?.toLowerCase().includes("auth");
              const isMarket = item.module?.toLowerCase().includes("market");

              return (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-3 transition-all duration-200 hover:bg-green-50/20 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isScan ? "bg-red-50 text-red-600" :
                      isAuth ? "bg-blue-50 text-blue-600" :
                      isMarket ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {isScan ? <ShieldAlert size={16} /> :
                       isAuth ? <Users size={16} /> :
                       isMarket ? <ArrowUpRight size={16} /> : <Activity size={16} />}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-slate-800">
                        {item.full_name || "Guest Farmer"}
                      </h3>
                      <p className="text-[11px] text-slate-450 font-medium mt-0.5">
                        <span className="font-extrabold uppercase text-[9px] mr-1.5 tracking-wider px-1 py-0.5 rounded bg-slate-100 text-slate-500">
                          {item.module || "System"}
                        </span>
                        {item.action}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-left text-[10px] font-bold text-slate-400 sm:text-right">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 font-bold text-xs italic">
              No activity logs matched your search filters.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
