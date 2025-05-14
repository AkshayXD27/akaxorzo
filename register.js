import { initializeApp } from "firebase/app";
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

let auth;

document.addEventListener('DOMContentLoaded', function() {
  console.log("Initializing Firebase...");
  
  // Check if Firebase is loaded
  if (typeof firebase !== 'undefined') {
    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    // Get auth instance
    auth = firebase.auth();
    console.log("Firebase initialized successfully");
    
    // Listen for auth state changes (optional)
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User is signed in:", user.email);
        // You could update UI here to show logged-in state
      } else {
        console.log("User is signed out");
      }
    });
  } else {
    console.warn("Firebase SDK not loaded - check your script tags");
  }
});
