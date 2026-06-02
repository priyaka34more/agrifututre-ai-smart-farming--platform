import React, { useState } from "react";
import { PlusCircle, Trash2, Save, Eye, RefreshCw, FileText } from "lucide-react";
import "./AdminSettings.css"; // Reuse elegant settings structures

export default function AdminNews() {
  const [newsList, setNewsList] = useState([
    {
      id: 1,
      title: "Monsoon Forecast & Crop Sowing Advisory",
      category: "Weather Alert",
      date: "2026-05-18",
      views: 342,
      status: "Published"
    },
    {
      id: 2,
      title: "Organic NPK Fertilizer Subsidies Announced",
      category: "Government Scheme",
      date: "2026-05-15",
      views: 521,
      status: "Published"
    },
    {
      id: 3,
      title: "Early Blight Outbreak Prevention in Maharashtra",
      category: "Pest Advisory",
      date: "2026-05-12",
      views: 189,
      status: "Draft"
    }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Pest Advisory");
  const [newContent, setNewContent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCreateNews = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setPublishing(true);
    setTimeout(() => {
      const newsItem = {
        id: Date.now(),
        title: newTitle,
        category: newCategory,
        date: new Date().toISOString().split("T")[0],
        views: 0,
        status: "Published"
      };

      setNewsList([newsItem, ...newsList]);
      setNewTitle("");
      setNewContent("");
      setPublishing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setNewsList(newsList.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-8 p-1">
      {/* Toast Feedback */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-slate-800 text-xs font-bold animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Advisory published successfully!
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-green-900">Crop Advisory & News Dispatcher</h1>
          <p className="text-gray-600 mt-1">Broadcast real-time crop alerts and government schemes to farmer apps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* COMPOSER FORM */}
        <div className="xl:col-span-1 bg-white rounded-3xl p-6 shadow-lg border border-gray-150">
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-green-600" /> Write Announcement
          </h2>

          <form onSubmit={handleCreateNews} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Announcement Title</label>
              <input 
                type="text" 
                placeholder="e.g. Tomato Early Blight Warning" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dispatch Category</label>
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-600"
              >
                <option value="Pest Advisory">Pest Advisory</option>
                <option value="Weather Alert">Weather Alert</option>
                <option value="Government Scheme">Government Scheme</option>
                <option value="Market Insight">Market Insight</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dispatch Content</label>
              <textarea 
                rows="4"
                placeholder="Provide detailed instructions for farmers..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600"
              />
            </div>

            <button 
              type="submit" 
              disabled={publishing}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {publishing ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{publishing ? "Dispatching Alert..." : "Broadcast Announcement"}</span>
            </button>
          </form>
        </div>

        {/* RECENTLY DISPATCHED ARTICLES */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-lg border border-gray-150">
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-green-600" /> Active Broadcast Feed
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-left">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Broadcast Date</th>
                  <th className="pb-3">Views</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {newsList.map((item) => (
                  <tr key={item.id} className="text-xs group hover:bg-green-50/20 transition-colors">
                    <td className="py-3.5 pr-2">
                      <span className="font-bold text-gray-800 block leading-tight">{item.title}</span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        item.category === 'Weather Alert' ? 'bg-blue-100 text-blue-700' :
                        item.category === 'Government Scheme' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-gray-500 font-bold">{item.date}</td>
                    <td className="py-3.5 text-gray-600 font-bold flex items-center gap-1">
                      <Eye size={12} className="text-gray-450" /> {item.views}
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold ${
                        item.status === 'Published' ? 'text-emerald-600' : 'text-gray-450'
                      }`}>
                        ● {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
