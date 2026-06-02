import React, { useEffect, useState } from "react";
import Sidebar from "../admin/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

// =====================================================
// ADMIN LAYOUT
// =====================================================

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen w-full bg-slate-100 overflow-x-hidden">
      
      {/* SIDEBAR */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        
        {/* TOP HEADER */}
        <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200 px-3 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
          <div className="flex items-center justify-between gap-3">
            
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open admin menu"
                aria-expanded={isSidebarOpen}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-800 shadow-sm ring-1 ring-green-100 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={22} />
              </button>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-green-900 sm:text-2xl">
                  AgriFuture Admin
                </h1>

                <p className="mt-1 hidden text-sm text-gray-500 sm:block">
                  Smart Agriculture AI Control Panel
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

              <span className="hidden text-sm font-medium text-green-700 sm:inline">
                System Online
              </span>
            </div>

          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-3 sm:p-5 lg:p-6">
          <Outlet />
        </div>

      </main>
    </div>
  );
}
