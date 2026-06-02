import { Capacitor } from "@capacitor/core";
import { auth, googleProvider, signInWithPopup } from "./firebase";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_WEB_CLIENT_ID = process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.REACT_APP_GOOGLE_ANDROID_CLIENT_ID;

const isCapacitorNative = () => {
  return typeof window !== "undefined" && Capacitor?.getPlatform?.() && Capacitor.getPlatform() !== "web";
};

const isAndroid = () => {
  return isCapacitorNative() && Capacitor.getPlatform() === "android";
};

const isValidGoogleWebClientId = (clientId) => {
  return Boolean(
    clientId &&
      clientId.includes(".apps.googleusercontent.com") &&
      !clientId.includes("YOUR_WEB_CLIENT_ID") &&
      !clientId.includes("your_google_web_client_id")
  );
};

let googleIdentityPromise = null;
const loadGoogleIdentityServices = () => {
  if (googleIdentityPromise) {
    return googleIdentityPromise;
  }

  googleIdentityPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Google Identity Services require a browser environment."));
      return;
    }

    if (window.google && window.google.accounts && window.google.accounts.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject(new Error("Unable to load Google Identity Services.")));
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Google Identity Services."));
    document.head.appendChild(script);
  });

  return googleIdentityPromise;
};

export const preloadGoogleIdentityServices = async () => {
  try {
    await loadGoogleIdentityServices();
    console.log("[GoogleAuth] Google Identity Services preloaded");
  } catch (error) {
    console.warn("[GoogleAuth] Google Identity Services preload failed", error);
  }
};

const signInWithGoogleFirebasePopup = async () => {
  console.log("[GoogleAuth] Using Firebase Auth popup fallback for web sign-in");
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    const idToken = await credential.user.getIdToken();

    if (!idToken) {
      console.error("[GoogleAuth] Firebase did not return an ID token");
      throw new Error("Google Sign-In did not return a valid ID token.");
    }

    return {
      idToken,
      email: credential.user.email,
      full_name: credential.user.displayName,
      google_id: credential.user.providerData?.[0]?.uid
    };
  } catch (error) {
    console.error("[GoogleAuth] Firebase popup sign-in failed", error);
    throw error;
  }
};

const signInWithGoogleWeb = async () => {
  console.log("[GoogleAuth] Starting web Google Sign-In");

  if (!isValidGoogleWebClientId(GOOGLE_WEB_CLIENT_ID)) {
    console.warn("[GoogleAuth] Invalid or missing Google Web client ID. Falling back to Firebase Auth popup sign-in.");
    return signInWithGoogleFirebasePopup();
  }

  console.log("[GoogleAuth] Using web client ID", GOOGLE_WEB_CLIENT_ID);
  try {
    await loadGoogleIdentityServices();
    console.log("[GoogleAuth] Google Identity Services loaded");
  } catch (error) {
    console.warn("[GoogleAuth] Google Identity Services failed to load, falling back to Firebase popup sign-in", error);
    return signInWithGoogleFirebasePopup();
  }

  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.warn("[GoogleAuth] Google Identity Services is not available after script load, falling back to Firebase popup sign-in");
      return signInWithGoogleFirebasePopup().then(resolve).catch(reject);
    }

    const callback = (response) => {
      if (response?.credential) {
        console.log("Google Account Selected");
        console.log("[GoogleAuth] Token received from Google Identity Services");
        resolve({ idToken: response.credential });
      } else {
        console.error("[GoogleAuth] Google credential was not returned", response);
        reject(new Error("Google credential was not returned."));
      }
    };

    window.google.accounts.id.initialize({
      client_id: GOOGLE_WEB_CLIENT_ID,
      callback,
      ux_mode: "popup"
    });

    console.log("[GoogleAuth] Prompting Google sign-in UI");
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkipped() || notification.isDismissedMoment()) {
        console.error("[GoogleAuth] Google sign-in prompt cancelled or not displayed", notification);
        reject(new Error("Google login cancelled or unavailable."));
      }
    });
  });
};

const signInWithGoogleNative = async () => {
  console.log("[GoogleAuth] Starting native Google Sign-In");
  if (!isAndroid()) {
    console.error("[GoogleAuth] Native Google Sign-In attempted on non-Android platform");
    throw new Error("Native Google Sign-In is only supported on Android in this implementation.");
  }

  if (!GOOGLE_ANDROID_CLIENT_ID) {
    console.error("[GoogleAuth] Missing Android Google client ID");
    throw new Error("Google Client ID Missing: Set REACT_APP_GOOGLE_ANDROID_CLIENT_ID.");
  }

  // Load native plugin at runtime to avoid bundlers trying to resolve it for web builds.
  let GoogleAuthPlugin;
  try {
    // Use eval to obtain a runtime `require` to prevent static bundlers from resolving this import.
    // eslint-disable-next-line no-eval
    const requireFunc = eval("require");
    const plugin = requireFunc("@codetrix-studio/capacitor-google-auth");
    GoogleAuthPlugin = plugin?.GoogleAuth || plugin?.default || plugin;
  } catch (err) {
    console.error("[GoogleAuth] Native plugin not available", err);
    throw new Error("Native Google plugin not available");
  }

  const result = await GoogleAuthPlugin.signIn();
  console.log("[GoogleAuth] Native Google sign-in returned result", {
    email: result?.email,
    displayName: result?.displayName,
    id: result?.id
  });

  const idToken = result?.authentication?.idToken;
  if (!idToken) {
    console.error("[GoogleAuth] Native Google Sign-In did not return an ID token", result);
    throw new Error("Google Sign-In did not return a valid ID token.");
  }
  console.log("ID Token Received");
  return {
    idToken,
    email: result.email,
    full_name: result.name || result.displayName,
    google_id: result.id
  };
};

export const signInWithGoogle = async () => {
  console.log("Google Login Started");
  if (isCapacitorNative()) {
    console.log("Google Login: using native Capacitor flow");
    return signInWithGoogleNative();
  }

  console.log("Google Login: using web Identity Services flow");
  return signInWithGoogleWeb();
};

export const getGoogleAuthConfig = () => ({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  androidClientId: GOOGLE_ANDROID_CLIENT_ID
});
