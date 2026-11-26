

 import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyATZL7Refm5E2cbipv4xeDcDBBUIb1jRwE",
    authDomain: "mafia-game-35319.firebaseapp.com",
    databaseURL: "https://mafia-game-35319-default-rtdb.firebaseio.com",
    projectId: "mafia-game-35319",
    storageBucket: "mafia-game-35319.firebasestorage.app",
    messagingSenderId: "690250414872",
    appId: "1:690250414872:web:6427092cba9ad2d817fc6d",
    measurementId: "G-SBNB54JS4J"
};

// ---- Safety checks: fail loudly with a clear message, never silently ----
const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value || String(value).includes("PASTE_YOUR"))
  .map(([key]) => key);

if (missing.length) {
  const message = "firebase-config.js: fill in these values first: " + missing.join(", ");
  console.error(message);
  throw new Error(message);
}

if (!/^https:\/\/.+\.(firebaseio\.com|firebasedatabase\.app)\/?$/.test(firebaseConfig.databaseURL)) {
  const message = "firebase-config.js: databaseURL should look like " +
    "https://mafia-game-35319-default-rtdb.firebaseio.com (copy it from Build -> Realtime Database).";
  console.error(message);
  throw new Error(message);
}

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Connection check: prints the real status in the console.
onValue(ref(db, ".info/connected"), (snapshot) => {
  console.log(snapshot.val() === true
    ? "Firebase: connected to the Realtime Database"
    : "Firebase: not connected yet (this can show briefly on load)");
});