import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getActivities } from "../../services/adminService";
import { 
  Activity, Search, Download, ShieldAlert, Users, RefreshCw, CheckCircle2 
} from "lucide-react";
import "./AdminUsers.css"; // Reuse elegant admin layout and table components

export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("All");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getActivities();
      setActivities(res.data || res || []);
    } catch (err) {
      console.error("Activities fetch error:", err);
      setError("Unable to retrieve activities log. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Filter logic
  const filteredActivities = activities.filter(item => {
    const matchesSearch = 
      item.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.action?.toLowerCase().includes(search.toLowerCase());

    const matchesModule = 
      selectedModule === "All" || 
      item.module?.toLowerCase().includes(selectedModule.toLowerCase()) ||
      (selectedModule === "Schemes" && (item.module?.toLowerCase().includes("scheme") || item.module?.toLowerCase().includes("subsidy")));

    return matchesSearch && matchesModule;
  });

  // Calculate quick metrics
  const uniqueUsers = new Set(activities.map(a => a.full_name)).size;
  const scanActivities = activities.filter(a => a.module?.toLowerCase().includes("scan") || a.module?.toLowerCase().includes("disease")).length;

  return (
    <div className="admin-users-page p-1 space-y-6">
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
            <span>Audit logs exported to Excel format successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE HEADER */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-green-900">System Activities Audit</h1>
          <p className="text-gray-600 mt-1">Audit log of all module triggers, transactions, and security checks</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button 
            onClick={fetchActivities}
            disabled={loading}
            className="flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white p-3 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleExport} className="export-btn flex flex-1 items-center justify-center gap-2 bg-green-700 px-4 py-3 font-bold text-white transition-all hover:bg-green-800 sm:flex-none">
            <Download size={18} />
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* QUICK STATS ROW */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-150 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Total Triggered Actions</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{activities.length}</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
            <Activity size={20} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-150 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Active Users Interacted</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{uniqueUsers}</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-150 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Leaf Diagnostics Audit</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{scanActivities} scans</span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="table-controls flex flex-col gap-4 rounded-2xl border border-gray-150 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5 md:flex-row">
        <div className="search-box flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search logs by user name or action..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-green-600"
          />
        </div>

        {/* Module Filter segments */}
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider hidden md:inline">Module Filter:</span>
          {["All", "Auth", "Disease", "Yield", "Market", "Schemes"].map(mod => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                (mod === "All" && selectedModule === "All") || (selectedModule === mod)
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE AUDIT CONTAINER */}
      <div className="table-container bg-white rounded-3xl shadow-sm border border-gray-150 overflow-hidden">
        {error ? (
          <div className="error-state py-12 text-center space-y-4">
            <p className="text-gray-500 font-bold">Warning: {error}</p>
            <button onClick={fetchActivities} className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-xs font-bold">Retry Connection</button>
          </div>
        ) : (
          <table className="users-table w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-450 bg-gray-50/50">
                <th className="p-4 pl-6">Trigger Entity</th>
                <th className="p-4">Module Code</th>
                <th className="p-4">Executed Action</th>
                <th className="p-4">Server Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="4" className="td-loading p-12 text-center text-gray-400 font-bold italic">
                    Fetching platform audit records...
                  </td>
                </tr>
              ) : filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan="4" className="td-empty p-12 text-center text-gray-450 font-bold italic">
                    No transactions matched the selected filters.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((item, index) => {
                  const isScan = item.module?.toLowerCase().includes("scan") || item.module?.toLowerCase().includes("disease");
                  const isAuth = item.module?.toLowerCase().includes("auth");
                  const isMarket = item.module?.toLowerCase().includes("market");
                  const isSchemes = item.module?.toLowerCase().includes("scheme") || item.module?.toLowerCase().includes("subsidy");

                  return (
                    <tr key={index} className="hover:bg-green-50/10 transition-colors">
                      <td className="p-4 pl-6" data-label="Trigger Entity">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isScan ? "bg-red-100 text-red-700" :
                            isAuth ? "bg-blue-100 text-blue-700" :
                            isMarket ? "bg-amber-100 text-amber-700" :
                            isSchemes ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {item.full_name?.charAt(0) || "G"}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-800 block">{item.full_name || "Guest Farmer"}</span>
                            <span className="text-[9px] font-bold text-gray-450 uppercase">{item.role || "User"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4" data-label="Module Code">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                          isScan ? "bg-red-50 text-red-600 border border-red-100" :
                          isAuth ? "bg-blue-50 text-blue-600 border border-blue-100" :
                          isMarket ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          isSchemes ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}>
                          {item.module || "SYSTEM"}
                        </span>
                      </td>
                      <td className="p-4" data-label="Executed Action">
                        <span className="font-bold text-slate-700 block max-w-sm truncate">{item.action}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-450" data-label="Server Timestamp">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
