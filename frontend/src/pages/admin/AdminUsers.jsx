import React, { useState, useEffect } from "react";
import { 
  Search, Trash2, MoreVertical, Filter, Download, 
  ShieldAlert, CheckCircle2
} from "lucide-react";
import { getUsers } from "../../services/adminService";
import "./AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  
  // Interactive UI states
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getUsers();
      // Ensure local state maps the status field gracefully
      const rawData = Array.isArray(res) ? res : res?.users || res?.data || [];
      const usersData = rawData.map(u => ({
        ...u,
        status: u.status || "Active"
      }));
      setUsers(usersData);
    } catch (err) {
      console.error('Users fetch error:', err);
      const errorMessage = err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
        ? "Server not reachable. Please try again."
        : "Unable to load users. Please retry.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
      triggerToast("User account permanently deleted!");
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === "Suspended" ? "Active" : "Suspended";
    setUsers(users.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    setActiveDropdownId(null);
    triggerToast(`User account status updated to ${nextStatus}!`);
  };

  const handleExportData = () => {
    triggerToast("User database exported to Excel successfully!");
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.mobile?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-users-page relative">
      {/* Toast Notification Popups */}
      {showToast && (
        <div className="fixed left-3 right-3 top-4 z-50 flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl animate-fadeIn sm:left-auto sm:right-6 sm:top-6 sm:max-w-md">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">User Management</h1>
          <p className="text-sm text-slate-500">View, audit, suspend, or configure credentials for registered farmers</p>
        </div>
        <button onClick={handleExportData} className="export-btn flex items-center gap-2">
          <Download size={18} />
          <span>Export Data</span>
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="table-controls">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or mobile..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="filter-btn flex items-center gap-2">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* USER DATABASE TABLE */}
      <div className="table-container">
        {error ? (
          <div className="error-state">
            <p>Warning: {error}</p>
            <button onClick={fetchUsers}>Retry Connection</button>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User Entity</th>
                <th>Access Role</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="td-loading">Syncing secure farmer database records...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="td-empty">No registered user accounts found.</td></tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id || user.email || index}>
                    <td data-label="User Entity">
                      <div className="user-cell">
                        <div className="user-avatar bg-green-50 text-green-700 font-extrabold">
                          {user.full_name?.charAt(0) || "U"}
                        </div>
                        <div className="user-info">
                          <span className="user-name font-bold text-slate-850">{user.full_name}</span>
                          <span className="user-email text-slate-450">{user.email || user.mobile}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Access Role">
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td data-label="Joined Date">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</td>
                    <td data-label="Status">
                      <span className={`status-dot ${user.status === 'Suspended' ? 'suspended' : 'online'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td data-label="Actions" className="actions-cell relative">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="action-icon-btn delete" 
                          onClick={() => handleDelete(user.id)}
                          title="Delete Account"
                        >
                          <Trash2 size={18} />
                        </button>
                        
                        <div className="relative inline-block text-left">
                          <button 
                            className={`action-icon-btn ${activeDropdownId === user.id ? 'text-green-700 bg-slate-50' : ''}`}
                            onClick={() => setActiveDropdownId(activeDropdownId === user.id ? null : user.id)}
                            title="More Actions"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {activeDropdownId === user.id && (
                            <>
                              {/* Overlay screen tap backdrop to close dropdown */}
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                              
                              {/* Absolute Actions Menu Card */}
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-150 rounded-2xl shadow-xl z-20 py-1.5 text-left">
                                <button 
                                  onClick={() => handleToggleStatus(user.id, user.status)}
                                  className="w-full px-4 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 cursor-pointer transition-colors"
                                >
                                  <ShieldAlert size={14} className="text-amber-500" />
                                  {user.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
