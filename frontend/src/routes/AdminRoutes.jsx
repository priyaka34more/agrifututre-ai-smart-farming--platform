import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminActivities from "../pages/admin/AdminActivities";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminNews from "../pages/admin/AdminNews";

// =====================================================
// ADMIN ROUTES
// =====================================================

const AdminRoutes = () => {
  const role = localStorage.getItem("role");

  // =====================================================
  // ADMIN ACCESS CHECK
  // =====================================================

  if (role !== "admin" && role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  // =====================================================
  // ROUTES
  // =====================================================

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* DASHBOARD */}
        <Route path="/" element={<AdminDashboard />} />

        {/* USERS MANAGEMENT */}
        <Route path="/users" element={<AdminUsers />} />

        {/* DETAILED ACTIVITIES & ANALYTICS */}
        <Route path="/activities" element={<AdminActivities />} />

        {/* ALERTS & INFRASTRUCTURE SETTINGS */}
        <Route path="/alerts" element={<AdminSettings />} />

        {/* ADVISORY & NEWS DISPATCHER */}
        <Route path="/news" element={<AdminNews />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;