//a
  const firebaseConfig = {
   apiKey: "AIzaSyCVyyI45GePPjfybjXyTpE58S-AHKrn3Cw",

  authDomain: "akaxorzoxd.firebaseapp.com",

  projectId: "akaxorzoxd",

  storageBucket: "akaxorzoxd.firebasestorage.app",

  messagingSenderId: "1053251026053",

  appId: "1:1053251026053:web:301bf3778b20a23c0d7dec",

  measurementId: "G-SX8XFPJP83"

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
