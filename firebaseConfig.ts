// src/firebaseConfig.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  // <-- import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyCKfjSdA0yETWIwYj1hx8r8ph6UdcCBKNI",
  authDomain: "futech-cc924.firebaseapp.com",
  projectId: "futech-cc924",
  storageBucket: "futech-cc924.firebasestorage.app",
  messagingSenderId: "232829160703",
  appId: "1:232829160703:web:0028e8ba6e75a05e2410ca"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);  // <-- export Firestore instance
