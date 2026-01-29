import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDPxUwDnWKPoW1swgfM_QHbuqWjPHuWPyQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eventhub-9b3c4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eventhub-9b3c4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eventhub-9b3c4.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "29895208413",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:29895208413:web:b9a27bb44b3d2b7418da34",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0SSKWMJC84",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
