// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHPjJtGjW2E-cCoJ56r4IkfYcJ1oX6yyc",
  authDomain: "apps-57140.firebaseapp.com",
  projectId: "apps-57140",
  storageBucket: "apps-57140.firebasestorage.app",
  messagingSenderId: "548004749500",
  appId: "1:548004749500:web:968809052a36f9ad45b0b9",
  measurementId: "G-GNQP4SG9ZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);