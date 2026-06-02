import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

// 🔐 Your Firebase config (paste your real values here or use environment variables)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAAkqG-W8uv_k1gaJS0nbvARcMPpI7AQ74",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "agrifuture-1e993.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "agrifuture-1e993",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "agrifuture-1e993.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "637295201757",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:637295201757:web:423ec9210d0197cbf6fa34",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-Q5HQCQ92J9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log("[firebase] Firebase initialized with projectId:", firebaseConfig.projectId);
console.log("Firebase Ready");
console.log("WEB CLIENT:", process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID);
console.log("ANDROID CLIENT:", process.env.REACT_APP_GOOGLE_ANDROID_CLIENT_ID);

// ✅ Export auth and helpers (IMPORTANT)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut };