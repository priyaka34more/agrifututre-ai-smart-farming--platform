import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, signInWithPopup, signOut } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔵 Handle Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 🔵 Google Login Utility
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error) {
      console.error("AuthContext Google Login Error:", error);
      throw error;
    }
  };

  // 🔴 Logout Utility
  const logout = async () => {
    try {
      await signOut(auth);
      // Clear localStorage tokens safely
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      localStorage.removeItem("email");
      localStorage.removeItem("mobile");
    } catch (error) {
      console.error("AuthContext Logout Error:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loginWithGoogle,
    logout,
    isAuthenticated: !!currentUser || !!localStorage.getItem("token")
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
