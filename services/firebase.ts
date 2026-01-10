
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  CACHE_SIZE_UNLIMITED, 
  clearIndexedDbPersistence, 
  terminate,
  getFirestore 
} from "firebase/firestore";
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXRxewyGugO9sF1ayk_3DoeazWaLLCkLo",
  authDomain: "cpenterprices-75247175-c4407.firebaseapp.com",
  projectId: "cpenterprices-75247175-c4407",
  storageBucket: "cpenterprices-75247175-c4407.firebasestorage.app",
  messagingSenderId: "114338777180",
  appId: "1:114338777180:web:9fd78d73a34e66aa33fe99"
};

// Singleton pattern to prevent multiple initializations
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with robust fallback for persistence failure
let dbInstance;

try {
  // Try to use existing instance first
  dbInstance = getFirestore(app);
} catch (e) {
  // Not initialized yet, try to initialize with persistence
  try {
    dbInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
      })
    });
  } catch (error) {
    console.warn("Firestore persistence failed (likely private mode), falling back to standard memory cache.", error);
    // Fallback to standard instance (memory cache)
    dbInstance = getFirestore(app);
  }
}

export const db = dbInstance;
export const auth = getAuth(app);

// INTERNAL DOMAIN for username mapping
const INTERNAL_DOMAIN = "cp-internal.app";

const getEmailFromUsername = (username: string) => {
  return `${username.toLowerCase().trim().replace(/\s/g, '')}@${INTERNAL_DOMAIN}`;
};

export const signIn = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error: any) {
    console.error("Firebase Anon Auth Error:", error);
    throw error;
  }
};

export const signInWithUsername = async (username: string, pin: string) => {
  const email = getEmailFromUsername(username);
  return await signInWithEmailAndPassword(auth, email, pin);
};

export const registerWithUsername = async (username: string, pin: string) => {
  const email = getEmailFromUsername(username);
  return await createUserWithEmailAndPassword(auth, email, pin);
};

export const logout = async () => {
  return await firebaseSignOut(auth);
};

// --- SYSTEM RESET UTILITIES ---

export const resetLocalCache = async () => {
  try {
    console.log("🔥 Terminating Firestore Connection...");
    await terminate(db);
    console.log("🔥 Clearing IndexedDB Persistence...");
    await clearIndexedDbPersistence(db);
    console.log("✅ Local persistence reset complete.");
    return true;
  } catch (e) {
    console.error("Reset Cache Failed:", e);
    return false;
  }
};
