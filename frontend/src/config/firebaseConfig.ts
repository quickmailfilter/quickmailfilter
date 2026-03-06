import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
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
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Initialize Firebase Storage
export const storage: FirebaseStorage = getStorage(app);

// Initialize Analytics (only in browser)
if (typeof window !== "undefined") {
  getAnalytics(app);
}

export default { auth, db, storage };
