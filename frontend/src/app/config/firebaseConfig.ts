import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBri22mfqL3h5vDDpgvAIMQ7TAlZWt89ds",
  authDomain: "ecommerce-college-project.firebaseapp.com",
  projectId: "ecommerce-college-project",
  storageBucket: "ecommerce-college-project.firebasestorage.app",
  messagingSenderId: "702122011504",
  appId: "1:702122011504:web:29400d1c6d409c44047db5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
