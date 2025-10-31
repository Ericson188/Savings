// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // Firebase config
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
  const auth = getAuth(app);

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const authSection = document.getElementById("authSection");
  const savingSection = document.getElementById("savingSection");
  const userDisplay = document.getElementById("userDisplay");

  // ✅ Login with redirect
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please fill in both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Login success:", user.email);
      alert("Login successful!");
      
      // ✅ Redirect after login
      window.location.href = "dashboard.html"; // <-- Change to your desired page
    } catch (error) {
      console.error("Login failed:", error.message);
      alert("Login failed: " + error.message);
    }
  });

  // ✅ Logout
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  });

  // ✅ Auth state listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authSection.classList.add("hidden");
      savingSection.classList.remove("hidden");
      userDisplay.textContent = user.email;
    } else {
      authSection.classList.remove("hidden");
      savingSection.classList.add("hidden");
      userDisplay.textContent = "";
    }
  });
});
