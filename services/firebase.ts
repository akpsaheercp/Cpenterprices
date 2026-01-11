import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js';

const firebaseConfig = {
  apiKey: "AIzaSyCQsR6W3cFWHtiYH45Tw2SaAl5GBu7gw90",
  authDomain: "cpenterprices.firebaseapp.com",
  projectId: "cpenterprices",
  storageBucket: "cpenterprices.firebasestorage.app",
  messagingSenderId: "352419817530",
  appId: "1:352419817530:web:27bc85c0110e415ee3ed03",
  measurementId: "G-85LTFSTZHT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics if in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };