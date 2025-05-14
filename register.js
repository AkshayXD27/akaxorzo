//a
  const firebaseConfig = {
    apiKey: "AIzaSyBwHdL5Pl6Zp7QpiaIvj8N34tip88K04Ms",
    authDomain: "akaxorzo-dd5eb.firebaseapp.com",
    projectId: "akaxorzo-dd5eb",
    storageBucket: "akaxorzo-dd5eb.firebasestorage.app",
    messagingSenderId: "633801465984",
    appId: "1:633801465984:web:72e2d1ce6e17b2a6648665",
    measurementId: "G-EVFCT5Q7NF"
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
