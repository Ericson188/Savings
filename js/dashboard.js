import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDHPjJtGjW2E-cCoJ56r4IkfYcJ1oX6yyc",
  authDomain: "apps-57140.firebaseapp.com",
  projectId: "apps-57140",
  storageBucket: "apps-57140.firebasestorage.app",
  messagingSenderId: "548004749500",
  appId: "1:548004749500:web:968809052a36f9ad45b0b9",
  measurementId: "G-GNQP4SG9ZH",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Elements
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const totalSavingsDisplay = document.getElementById("totalSavings");
const depositCard = document.getElementById("depositCard");
const withdrawCard = document.getElementById("withdrawCard");
const transactionsModal = document.getElementById("transactionsModal");
const openTransactionsModal = document.getElementById("openTransactionsModal");
const closeModal = document.getElementById("closeModal");
const transactionsList = document.getElementById("transactionsList");

// ✅ Auth State
onAuthStateChanged(auth, async (user) => {
  console.log("Auth state changed:", user ? "User logged in" : "No user");
  if (user) {
    userEmail.textContent = user.email;
    console.log("User UID:", user.uid);
    await loadUserSavings(user.uid);
  } else {
    console.log("Redirecting to login...");
    window.location.href = "index.html";
  }
});

// ✅ Load Total Savings
async function loadUserSavings(userId) {
  try {
    console.log("Loading savings for user:", userId);
    const q = query(
      collection(db, "savings"), 
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log("Savings query result:", querySnapshot.size, "documents");

    let total = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Transaction data:", data);
      if (data.type === "deposit" && typeof data.amount === "number") {
        total += data.amount;
      } else if (data.type === "withdraw" && typeof data.amount === "number") {
        total -= data.amount;
      }
    });

    console.log("Calculated total:", total);
    totalSavingsDisplay.textContent = `₱${total.toFixed(2)}`;
  } catch (error) {
    console.error("Error fetching savings:", error);
    console.error("Error details:", error.message, error.code);
    totalSavingsDisplay.textContent = "Error loading data";
  }
}

// ✅ Load Recent Transactions (Fixed version)
async function loadRecentTransactions(userId) {
  try {
    console.log("Loading transactions for user:", userId);
    
    // Method 1: Try the indexed query first
    let querySnapshot;
    try {
      const q = query(
        collection(db, "savings"),
        where("userId", "==", userId),
        orderBy("date", "desc"),
        limit(5)
      );
      querySnapshot = await getDocs(q);
      console.log("Indexed query successful:", querySnapshot.size, "documents");
    } catch (indexError) {
      console.log("Indexed query failed, using fallback:", indexError.message);
      
      // Method 2: Fallback - get all and sort client-side
      const fallbackQuery = query(
        collection(db, "savings"),
        where("userId", "==", userId)
      );
      querySnapshot = await getDocs(fallbackQuery);
      console.log("Fallback query result:", querySnapshot.size, "documents");
    }

    transactionsList.innerHTML = "";

    if (querySnapshot.empty) {
      console.log("No transactions found for user");
      transactionsList.innerHTML = `
        <div class="text-center py-8">
          <i class="fas fa-receipt text-gray-400 text-3xl mb-3"></i>
          <p class="text-gray-500">No transactions yet</p>
          <p class="text-gray-400 text-xs mt-1">Your transactions will appear here</p>
        </div>
      `;
      return;
    }

    // Convert to array and sort by date (newest first)
    const transactions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        ...data,
        timestamp: data.date || data.timestamp
      });
    });

    // Sort by date (newest first)
    transactions.sort((a, b) => {
      const dateA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.timestamp);
      const dateB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.timestamp);
      return new Date(dateB) - new Date(dateA);
    });

    // Take only the 5 most recent
    const recentTransactions = transactions.slice(0, 5);

    // Display transactions
    recentTransactions.forEach((transaction) => {
      const amount = transaction.amount || 0;
      const type = transaction.type || "unknown";
      let date = "No date";
      
      try {
        if (transaction.timestamp?.seconds) {
          date = new Date(transaction.timestamp.seconds * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } else if (transaction.timestamp) {
          date = new Date(transaction.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } else if (transaction.date) {
          date = new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (dateError) {
        console.error("Error parsing date:", dateError);
      }

      const item = document.createElement("div");
      item.classList.add("flex", "justify-between", "items-center", "py-3", "border-b", "border-gray-100");
      
      item.innerHTML = `
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full ${type === "deposit" ? "bg-green-100" : "bg-red-100"} flex items-center justify-center mr-3">
            <i class="fas ${type === "deposit" ? "fa-arrow-down text-green-600" : "fa-arrow-up text-red-600"} text-sm"></i>
          </div>
          <div>
            <p class="font-medium text-sm capitalize">${type}</p>
            <p class="text-xs text-gray-500">${date}</p>
          </div>
        </div>
        <p class="${type === "deposit" ? "text-green-600" : "text-red-600"} font-semibold">
          ${type === "deposit" ? "+" : "-"}₱${amount.toFixed(2)}
        </p>
      `;
      transactionsList.appendChild(item);
    });

  } catch (error) {
    console.error("Error loading transactions:", error);
    console.error("Error details:", error.message, error.code);
    
    // Show helpful error message with index creation info
    transactionsList.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-exclamation-triangle text-yellow-500 text-3xl mb-3"></i>
        <p class="text-gray-700">Database index required</p>
        <p class="text-gray-500 text-xs mt-2 px-4">
          Please create a Firestore composite index for better performance.
          The link should appear in your Firebase console error logs.
        </p>
        <div class="mt-4 space-y-2">
          <button id="retryTransactions" class="block w-full text-blue-600 text-sm hover:text-blue-800 py-2">
            <i class="fas fa-redo mr-1"></i> Try Again
          </button>
          <button id="loadWithoutIndex" class="block w-full text-green-600 text-sm hover:text-green-800 py-2">
            <i class="fas fa-play mr-1"></i> Load Without Sorting
          </button>
        </div>
      </div>
    `;

    // Add retry functionality
    document.getElementById('retryTransactions')?.addEventListener('click', () => {
      const user = auth.currentUser;
      if (user) {
        loadRecentTransactions(user.uid);
      }
    });

    // Add fallback functionality (load without sorting)
    document.getElementById('loadWithoutIndex')?.addEventListener('click', async () => {
      const user = auth.currentUser;
      if (user) {
        await loadTransactionsWithoutIndex(user.uid);
      }
    });
  }
}

// ✅ Fallback function to load transactions without index
async function loadTransactionsWithoutIndex(userId) {
  try {
    console.log("Loading transactions without index for user:", userId);
    
    const q = query(
      collection(db, "savings"),
      where("userId", "==", userId),
      limit(10) // Just get recent documents without ordering
    );

    const querySnapshot = await getDocs(q);
    console.log("No-index query result:", querySnapshot.size, "documents");

    transactionsList.innerHTML = "";

    if (querySnapshot.empty) {
      transactionsList.innerHTML = `
        <div class="text-center py-8">
          <i class="fas fa-receipt text-gray-400 text-3xl mb-3"></i>
          <p class="text-gray-500">No transactions yet</p>
        </div>
      `;
      return;
    }

    // Display transactions (they won't be sorted by date)
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const amount = data.amount || 0;
      const type = data.type || "unknown";
      let date = "Recent";

      const item = document.createElement("div");
      item.classList.add("flex", "justify-between", "items-center", "py-3", "border-b", "border-gray-100");
      
      item.innerHTML = `
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full ${type === "deposit" ? "bg-green-100" : "bg-red-100"} flex items-center justify-center mr-3">
            <i class="fas ${type === "deposit" ? "fa-arrow-down text-green-600" : "fa-arrow-up text-red-600"} text-sm"></i>
          </div>
          <div>
            <p class="font-medium text-sm capitalize">${type}</p>
            <p class="text-xs text-gray-500">${date}</p>
          </div>
        </div>
        <p class="${type === "deposit" ? "text-green-600" : "text-red-600"} font-semibold">
          ${type === "deposit" ? "+" : "-"}₱${amount.toFixed(2)}
        </p>
      `;
      transactionsList.appendChild(item);
    });

  } catch (error) {
    console.error("Error in fallback loading:", error);
    transactionsList.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
        <p class="text-gray-700">Unable to load transactions</p>
        <p class="text-gray-500 text-xs mt-2">Please check your connection and try again</p>
      </div>
    `;
  }
}

// ✅ Modal Controls
openTransactionsModal.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (user) {
    console.log("Opening transactions modal for user:", user.uid);
    transactionsList.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-spinner fa-spin text-blue-500 text-xl mb-2"></i>
        <p class="text-gray-500">Loading transactions...</p>
      </div>
    `;
    transactionsModal.classList.remove("hidden");
    await loadRecentTransactions(user.uid);
  } else {
    console.log("No user found when opening modal");
  }
});

closeModal.addEventListener("click", () => {
  transactionsModal.classList.add("hidden");
});

// Close modal when clicking outside
transactionsModal.addEventListener("click", (e) => {
  if (e.target === transactionsModal) {
    transactionsModal.classList.add("hidden");
  }
});

// ✅ Deposit Redirect
depositCard.addEventListener("click", () => {
  window.location.href = "deposit.html";
});

// ✅ Withdraw Redirect
withdrawCard.addEventListener("click", () => {
  // Add your withdraw page redirect here
  alert("Withdraw functionality would be implemented here");
});

// ✅ Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Logout error: " + error.message);
  }
});