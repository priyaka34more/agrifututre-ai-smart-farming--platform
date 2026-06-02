import React from "react";

import {
  LayoutDashboard,
  Users,
  Activity,
  ShieldAlert,
  Newspaper,
  LogOut,
  Home,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

// =====================================================
// MENU ITEMS
// =====================================================

const menuItems = [

  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },

  {
    title: "Users",
    icon: Users,
    path: "/admin/users",
  },

  {
    title: "Activities",
    icon: Activity,
    path: "/admin/activities",
  },

  {
    title: "Alerts",
    icon: ShieldAlert,
    path: "/admin/alerts",
  },

  {
    title: "News",
    icon: Newspaper,
    path: "/admin/news",
  },
];

// =====================================================
// COMPONENT
// =====================================================

export default function Sidebar({ isOpen = false, onClose = () => {} }) {

  const location = useLocation();

  const navigate = useNavigate();

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("role");

    localStorage.removeItem("user");

    localStorage.removeItem("userData");

    localStorage.removeItem("userName");

    localStorage.removeItem("mobile");

    localStorage.removeItem("isLoggedIn");

    onClose();

    navigate("/");
  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <aside
      className={`fixed inset-y-0 left-0 z-40 flex min-h-screen w-72 max-w-[88vw] flex-col overflow-y-auto bg-gradient-to-b from-green-950 to-green-800 text-white shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Admin navigation"
    >

      {/* HEADER */}

      <div className="p-4 border-b border-green-700 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">

            <h1 className="truncate text-2xl font-bold tracking-wide sm:text-3xl">
              AgriFuture
            </h1>

            <p className="text-green-200 mt-2 text-sm">
              AI Smart Agriculture
            </p>
          </div>

          <button
            type="button"
            aria-label="Close admin menu"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15 lg:hidden"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 bg-green-700/40 px-4 py-2 rounded-xl text-sm">
          Admin Control Panel
        </div>

      </div>

      {/* MENU */}

      <div className="flex-1 space-y-2 overflow-y-auto p-3 sm:space-y-3 sm:p-4">

        {menuItems.map((item) => {

          const Icon = item.icon;

          const active =
            location.pathname === item.path;

          return (

            <Link
              key={item.title}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-300 group sm:gap-4 sm:px-4 sm:py-4 ${
                active
                  ? "bg-green-500 text-white shadow-lg scale-[1.02]"
                  : "hover:bg-green-700/70 hover:translate-x-1"
              }`}
            >

              <Icon
                size={22}
                className={`${
                  active
                    ? "text-white"
                    : "text-green-200"
                }`}
              />

              <span className="font-medium text-sm sm:text-[16px]">
                {item.title}
              </span>

            </Link>
          );
        })}

      </div>

      {/* FOOTER */}

      <div className="space-y-2 border-t border-green-700 p-3 sm:p-4">

        <Link
          to="/dashboard"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all duration-300 px-4 py-3 rounded-2xl font-semibold text-sm text-center"
        >
          <Home size={18} />
          Back to Farmer App
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 active:scale-[0.98] transition-all duration-300 px-4 py-3 rounded-2xl font-semibold text-sm cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </aside>
  );
}
