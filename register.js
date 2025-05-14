// firebase.js (recommended to extract this setup)
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// ✅ Use environment variables correctly (with Vite)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// ✅ Initialize Firebase app once
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth
const auth = getAuth(app);

// Optional: Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User signed in:", user.email);
  } else {
    console.log("User signed out");
  }
});

export { auth };
