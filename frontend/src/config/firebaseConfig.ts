import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Firebase configuration - Hardcoded for production
const firebaseConfig = {
  apiKey: "AIzaSyBri22mfqL3h5vDDpgvAIMQ7TAlZWt89ds",
  authDomain: "ecommerce-college-project.firebaseapp.com",
  projectId: "ecommerce-college-project",
  storageBucket: "ecommerce-college-project.firebasestorage.app",
  messagingSenderId: "702122011504",
  appId: "1:702122011504:web:29400d1c6d409c44047db5",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Initialize Firebase Storage
export const storage: FirebaseStorage = getStorage(app);

export default { auth, db, storage };
