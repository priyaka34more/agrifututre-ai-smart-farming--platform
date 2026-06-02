import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import FarmerLayout from "./layouts/FarmerLayout";
import SplashScreen from "./components/SplashScreen";

import Dashboard from "./pages/Dashboard";
import DiseaseDetection from "./pages/DiseaseDetection";
import DiseaseResult from "./pages/DiseaseResult";
import Market from "./pages/Market";
import Weather from "./pages/Weather";
import YieldPrediction from "./pages/YieldPrediction";
import Profile from "./pages/Profile";
import MyUsage from "./pages/MyUsage";
import GovtSchemes from "./pages/GovtSchemes/GovtSchemes";
import EditFarm from "./pages/EditFarm";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ChatNew from "./pages/Chat_New";
import FarmAdvisory from "./pages/FarmAdvisory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import HelpSupport from "./pages/HelpSupport";
import ContactSupport from "./pages/ContactSupport";
import Feedback from "./pages/Feedback";
import About from "./pages/About";
import Notifications from "./pages/Notifications";
import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminActivities from "./pages/admin/AdminActivities";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNews from "./pages/admin/AdminNews";

import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role") || "user";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== "admin" && role !== "super_admin") {
    // Ensure redirect goes to a valid top-level route
    return <Navigate to="/" replace />;
  }


  return children;
};

const BootSplashGate = ({ children }) => {
  const location = useLocation();
  const [ready, setReady] = React.useState(() => location.pathname === "/splash");

  if (!ready) {
    return (
      <SplashScreen
        redirectOnComplete={false}
        onComplete={() => setReady(true)}
      />
    );
  }

  return children;
};

function App() {
  return (
    <Router>
      <BootSplashGate>
        <Routes>
          {/* Splash Screen - Default Route */}
          <Route path="/splash" element={<SplashScreen />} />
          
          {/* Login/Register Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Farmer Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <FarmerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="disease" element={<DiseaseDetection />} />
            <Route path="disease-result" element={<DiseaseResult />} />
            <Route path="market" element={<Market />} />
            <Route path="weather" element={<Weather />} />
            <Route path="farm-advisory" element={<FarmAdvisory />} />
            <Route path="yield" element={<YieldPrediction />} />
            <Route path="schemes" element={<GovtSchemes />} />
            <Route path="ai" element={<ChatNew />} />
            <Route path="profile" element={<Profile />} />
            <Route path="usage" element={<MyUsage />} />
            <Route path="edit-farm" element={<EditFarm />} />
            <Route path="history" element={<History />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help-support" element={<HelpSupport />} />
            <Route path="contact-support" element={<ContactSupport />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="about" element={<About />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="activities" element={<AdminActivities />} />
            <Route path="alerts" element={<AdminSettings />} />
            <Route path="news" element={<AdminNews />} />
          </Route>

          {/* Fallback: go to app root to avoid empty/dead-end pages on deep links */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BootSplashGate>
    </Router>
  );
}

export default App;
