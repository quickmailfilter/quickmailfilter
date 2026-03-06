import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration for quick-mailfilter project
const firebaseConfig = {
  apiKey: "AIzaSyAg1MrCaPlWWU7bHmmTFHk16RJN1u2JpT8",
  authDomain: "quick-mailfilter.firebaseapp.com",
  projectId: "quick-mailfilter",
  storageBucket: "quick-mailfilter.firebasestorage.app",
  messagingSenderId: "196296202203",
  appId: "1:196296202203:web:248348cd18c85a7e1e79fe",
  measurementId: "G-ZXXMN7K27W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser)
if (typeof window !== "undefined") {
  getAnalytics(app);
}

export default app;
