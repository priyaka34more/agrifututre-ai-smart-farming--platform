import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const [state, setState] = useState({
    loading: true,
    authenticated: false,
    role: "user"
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    setState({
      loading: false,
      authenticated: !!token,
      role: role || "user"
    });
  }, []);

  const { loading, authenticated, role } = state;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h3>Verifying access...</h3>
    </div>
  );

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;